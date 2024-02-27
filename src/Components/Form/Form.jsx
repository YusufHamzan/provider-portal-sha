import React, { useState, useRef } from "react";
import "./styles.css";
import { Login, verifyWithOTP } from "../../API/login";
import cogoToast from "cogo-toast";
import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";
import AES from "crypto-js/aes";
import CryptoJSCore from "crypto-js/core";
import Pkcs7 from "crypto-js/pad-pkcs7";
import Spinner from "../Spinner/Spinner";
import lock from "../../assets/lock.svg";
import { Link } from "react-router-dom";
import { getResultFromData } from "../../utils/utils";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect } from "react";
import { CHECK_MSG } from "../../utils/constants";
import GALogo from "../../assets/logoGA.jpg";

const LoginForm = () => {
    const [loading, setLoading] = useState(false);
    const [userID, setUserID] = useState();
    const [OTP, setOTP] = useState("");
    const modalRef = useRef(null);
    const OTPref = useRef(null);
    // const navigate = useNavigate();
    const { login } = useAuth();

    /**
     *
     * @param {*} e => onClick event with the form data
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password } = e.target.form.elements;
        if (email.value.length > 0 && password.value.length > 0) {
            setUserID(email.value);
            const payLoad = {
                searchvalue: email.value,
                password: encryptPassword(password.value),
                sendType: "M",
            };
            e.target.disabled = true;
            setLoading(true);
            const data = await Login(payLoad);

            if (data.ok) {
                const result = getResultFromData(data);
                if (result) {
                    cogoToast.success(<p style={{ textAlign: "center" }}>{CHECK_MSG}</p>).then(() => modalRef.current.showModal());
                } else {
                    cogoToast.error(<p style={{ textAlign: "center" }}>Wrong Credentials</p>);
                }
                e.target.disabled = false;
                setLoading(false);
            } else {
                cogoToast.error("Login Error");
                e.target.disabled = false;
                setLoading(false);
            }
        } else {
            cogoToast.error("Please Provide Credentials");
        }
    };

    /**
     *
     * @param {*} password => User input password
     * @returns Hashed password
     */
    const encryptPassword = (password) => {
        const publickey = Base64.parse(import.meta.env.VITE_hd_publicKey);
        const algoKey = Base64.parse(import.meta.env.VITE_hd_algoKey);
        const utfStringified = Utf8.parse(password).toString();
        const aesEncrypted = AES.encrypt(utfStringified, publickey, {
            mode: CryptoJSCore.mode.CBC,
            padding: Pkcs7,
            iv: algoKey,
        });
        return aesEncrypted.ciphertext.toString(Base64);
    };

    /**
     *
     * @function : Verifies OTP and logs the user in
     */
    const handleOTP = async () => {
        if (String(OTP).length !== 6) {
            cogoToast.error("OTP must be 6 digits");
            return;
        }

        const payLoad = {
            searchvalue: userID,
            OTP: OTP,
        };

        OTPref.current.disabled = true;
        const data = await verifyWithOTP(payLoad);

        if (data.ok) {
            const result = getResultFromData(data);
            login(result); //Storing in Login Context
            // cogoToast.success("Successfully Logged In");
            setOTP("");
            modalRef.current.close();
            OTPref.current.disabled = false;
        } else {
            cogoToast.error("Incorrect OTP");
            OTPref.current.disabled = false;
        }
    };

    useEffect(() => {
        if (OTP.toString().length === 6) {
            handleOTP();
        }
    }, [OTP]);

    return (
        <main className="__main">
            <div className="form__content">
                <img src={GALogo} alt="" width={400} style={{ marginBottom: "3rem" }} />

                <h2>Welcome to GA Insurance Provider Portal</h2>
                <h4>Please sign-in to your account</h4>
                <form className="form__content" autoComplete="on" style={{ alignItems: "flex-start" }}>
                    <label htmlFor="email" />
                    USER ID
                    <input id="email" name="email" type="email" className="input" />
                    <label htmlFor="password" />
                    PASSWORD
                    <input id="password" name="password" type="password" className="input" />
                    <br />
                    {/* <div>
            <input type="checkbox" name="remember" id="remember" />
            <span>
              <label htmlFor="remember">&nbsp;Remember me</label>
            </span>
          </div> */}
                    <button
                        id="submit"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        style={{ minHeight: "2.2rem", zIndex: "1" }}
                        onKeyDown={(e) => (e.key === "Enter" ? handleSubmit : void 0)}
                    >
                        {loading ? <Spinner /> : "Login"}
                    </button>
                    <section className="forgot__passsword">
                        <Link to="/forgot" className="text__muted">
                            <img src={lock} alt="" />
                            Forgot Password?
                        </Link>
                    </section>
                    <p>
                        <span>By clicking here, you agree to our</span>
                        <Link to="/" className="text__muted" id="customer_link">
                            <span> Customer Agreement</span>
                        </Link>
                    </p>
                </form>
                <dialog ref={modalRef} className="dialog__modal">
                    <section>
                        <label htmlFor="otp" />
                        Enter OTP
                        <input id="otp" name="otp" type="number" value={OTP} className="input" onChange={(e) => setOTP(e.target.valueAsNumber)} />
                        <button onClick={handleOTP} ref={OTPref} data-otp="OTP" className="btn btn-primary">
                            Submit
                        </button>
                    </section>
                </dialog>
            </div>
        </main>
    );
};

export default LoginForm;
