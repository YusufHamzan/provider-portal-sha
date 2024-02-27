import React, { useState, useRef } from "react";
import "./styles.css";
import ForgotImage from "../../assets/ForgotImage.png";
import Avatar from "../../assets/Avatar.svg";
import { getOTPforForgotPassword, changePassword } from "../../API/ForgotPassword";
import { getResultFromData, getErrorResultFromData } from "../../utils/utils";
import cogoToast from "cogo-toast";
import Spinner from "../../Components/Spinner/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { CHECK_MSG } from "../../utils/constants";

const ForgotPassword = () => {
    const [userID, setUserID] = useState("");
    const [loading, setLoading] = useState(false);
    const [OTP, setOTP] = useState("");
    const [password, setPassword] = useState("");
    const [match, setMatch] = useState(false);
    const modalRef = useRef(null);
    const OTPref = useRef(null);
    const cnfrmpassRef = useRef(null);

    /**
     * Function for reset password initiation
     */
    const handleReset = async () => {
        if (userID.length > 0) {
            setLoading(true);
            const payLoad = { searchvalue: userID };
            const data = await getOTPforForgotPassword(payLoad);
            if (data.ok) {
                const result = getResultFromData(data);
                cogoToast.success(<p style={{ textAlign: "center" }}>{CHECK_MSG}</p>).then(() => modalRef.current.showModal());
                setLoading(false);
            }
        } else {
            cogoToast.error("Please input User ID");
        }
    };

    /**
     *
     * @param {*} value => Checks if the password matches with the typed password
     */
    const checkPass = (value) => {
        if (password.length > 8 && value.length === password.length && value === password) {
            setMatch(true);
        } else {
            setMatch(false);
        }
    };

    /**
     *
     * @param {*} e => event to submit the form values and handle the OTP
     */
    const handleOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            searchvalue: userID,
            password: password,
            confirmpassword: password,
            OTP: OTP,
        };

        const data = await changePassword(payload);
        if (data.ok) {
            const result = getResultFromData(data);
            cogoToast.success(<p style={{ textAlign: "center" }}>{CHECK_MSG}</p>);
            setLoading(false);
            modalRef.current.close();
            setPassword("");
            cnfrmpassRef.current.value = "";
        } else {
            const result = getErrorResultFromData(data);
            cogoToast.error(result.message);
            setLoading(false);
        }
    };

    return (
        <main>
            <div className="content">
                <div className="overflow-hidden card">
                    <section className="bar">
                        <img src={ForgotImage} alt="" />
                    </section>
                    <section className="card_body form__content">
                        <div className="avatar">
                            <img src={Avatar} alt="" />
                        </div>
                        <label htmlFor="userid" />
                        User ID
                        <input type="text" id="userid" className="input" style={{ width: "64ch" }} onChange={(e) => setUserID(e.target.value)} />
                        <button className="btn btn-primary reset__button" onClick={handleReset}>
                            {loading ? <Spinner /> : "Reset"}
                        </button>
                    </section>
                </div>
                <dialog ref={modalRef} className="dialog__modal">
                    <section>
                        <form action="" className="confirm_form">
                            <label htmlFor="useriddialog" />
                            User ID
                            <input id="useriddialog" name="userid" type="text" value={userID} readOnly className="input" />
                            <label htmlFor="password" />
                            Enter Password
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                className="input"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label htmlFor="cnfrmpass" />
                            Confirm Password
                            <div>
                                <input
                                    id="cnfrmpass"
                                    ref={cnfrmpassRef}
                                    name="cnfrmpass"
                                    type="password"
                                    className="input"
                                    onChange={(e) => checkPass(e.target.value)}
                                />
                                {match && (
                                    <span className="correct_button">
                                        <FontAwesomeIcon icon={faCircleCheck} />
                                    </span>
                                )}
                            </div>
                            <label htmlFor="otp" />
                            Enter OTP
                            <input id="otp" name="otp" type="number" value={OTP} className="input" onChange={(e) => setOTP(e.target.valueAsNumber)} />
                            <button onClick={handleOTP} ref={OTPref} disabled={!match} data-otp="OTP" className="btn btn-primary">
                                {loading ? <Spinner /> : "Submit"}
                            </button>
                        </form>
                    </section>
                </dialog>
            </div>
        </main>
    );
};

export default ForgotPassword;
