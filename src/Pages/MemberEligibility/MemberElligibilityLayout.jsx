import {
    faListOl,
    faDroplet,
    faIdCardClip,
    faSignature,
    faEarthAsia,
    faCalendarDays,
    faVenusMars,
    faHospital,
    faFileSignature,
    faPersonCane,
    faPhone,
    faEnvelope,
    faHandsPraying,
    faImage,
    faHashtag,
    faIndianRupee,
    faFingerprint,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Card, Image } from "react-bootstrap";
import { getCapitallisedFromCamelCase } from "../../utils/utils";
import NoProfile from "../../assets/noProfile.svg";
import Signature from "../../assets/signature.png";
import "./styles.css";

const iconIndex = {
    bloodGroup: faDroplet,
    corporateID: faIdCardClip,
    corporateName: faSignature,
    countryCode: faEarthAsia,
    dateOfBirth: faCalendarDays,
    empCode: faFingerprint,
    gender: faVenusMars,
    insuranceID: faHospital,
    insuranceName: faFileSignature,
    memberAge: faPersonCane,
    memberContactNo: faPhone,
    memberEmail: faEnvelope,
    memberName: faSignature,
    memberRelation: faHandsPraying,
    membershipNo: faListOl,
    photoPath: faImage,
    policyExpireDate: faCalendarDays,
    policyNo: faHashtag,
    policyStartDate: faCalendarDays,
    policyYear: faCalendarDays,
    productCurrency: faIndianRupee,
    signaturePath: faSignature,
};

const MemberElligibilityLayout = ({ data = {} }) => {
    return (
        <main>
            <Card className="shadow p-4 mb-4 bg-white rounded border-0 header-flex">
                <div className="profileImage">
                    <Image src={NoProfile}></Image>
                </div>
                <div>
                    {data.memberName}
                    <br />
                    Membership No # : {data?.membershipNo}
                </div>
                <div>
                    <Image style={{ display: "none" }} src={Signature}></Image>
                </div>
            </Card>
            <h4>Member Policy Details</h4>
            <Card className="shadow p-3 mb-5 mt-4 bg-white rounded border-0">
                <Card.Body>
                    {" "}
                    <section className="member-layout">
                        <ul>
                            {Object.entries(data)?.map(([key, value]) => {
                                return (
                                    <li style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ minWidth: "20rem" }}>
                                            <FontAwesomeIcon icon={iconIndex[key]} />
                                            &nbsp;&nbsp;
                                            {getCapitallisedFromCamelCase(key)}
                                        </div>
                                        :<p style={{ marginLeft: "10rem" }}>{value?.trim()}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </Card.Body>
            </Card>
        </main>
    );
};

export default MemberElligibilityLayout;
