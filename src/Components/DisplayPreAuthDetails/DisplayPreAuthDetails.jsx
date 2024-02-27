import React, { useState } from "react";
import * as _ from "lodash";
import { getCapitallisedFromCamelCase } from "../../utils/utils";
import { SERVICE_TYPE } from "../../utils/constants";

const DisplayPreAuthDetails = ({ singlePreAuthDetails }) => {
    const [userDetails] = useState(JSON.parse(sessionStorage.getItem("user")));

    return (
        <div className="mt-2">
            <strong style={{ marginLeft: "2rem", marginBottom: "2rem" }}>Provider Name</strong>{" "}
            <span style={{ marginLeft: "7.4rem" }}>
                {" "}
                : <span style={{ marginLeft: "2.4rem" }}>{userDetails?.providerName}</span>
            </span>
            <ul style={{ listStyle: "none", marginTop: "15px" }}>
                {singlePreAuthDetails &&
                    Object.entries(_.omit(singlePreAuthDetails, ["insuranceName", "claimAmount", "policyNo"]))?.map(([key, value]) => (
                        <li key={value.referenceNo} style={{ width: "max-content", display: "flex", marginTop: "-6px" }}>
                            <div style={{ minWidth: "15rem" }}>
                                <strong>{getCapitallisedFromCamelCase(key)}</strong>
                                {/* <strong>Provider</strong> */}
                            </div>
                            <div style={{ justifyContent: "stretch" }}> : </div>
                            <div>
                                <p style={{ marginLeft: "3rem" }}>{key === "serviceType" ? SERVICE_TYPE[value] : value}</p>
                            </div>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default DisplayPreAuthDetails;
