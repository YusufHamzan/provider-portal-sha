import React, { useState, useRef, useEffect, useCallback } from "react";
import "./styles.css";
import { Card, Col, Container, Form, Row, Spinner, Button } from "react-bootstrap";
import Eligibility from "../../assets/eligibilityHeroImg.png";
import { ValidateMemberGenOTP, ValidateMemberWithOTP, GetMemberBenefits, SearchBynameOrNumber } from "../../API/memberEligibility";
import { getCapitallisedFromCamelCase, getErrorResultFromData, getResultFromData } from "../../utils/utils";
// import _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import cogoToast from "cogo-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import MemberElligibilityLayout from "./MemberElligibilityLayout";
import { CHECK_MSG } from "../../utils/constants";
import Paginator from "../../Components/Paginator/Paginator";
import AsyncSelect from "react-select/async";
import CustomVirtualList from "../SubmitClaim/VirtualList";
import { decideENV } from "../../decideENV";
import axios from "axios";
import _ from "../../deepdash";
const MemberEligibility = () => {
    const [userDetails] = useState(JSON.parse(sessionStorage.getItem("user")));

    const [membershipNo, setMembershipNo] = useState(JSON.parse(sessionStorage.getItem("memberDetails"))?.membershipNo || "");
    const [tableData, setTableData] = useState(() => {
        const data = JSON.parse(sessionStorage.getItem("memberBenefitsTableData")) || [];

        if (data?.length > 0) {
            data.forEach((item) => (item.Eligibility = <ColorCode color={item.Eligibility.props.color} />));
        }

        return data;
    });
    const [memberData, setMemberData] = useState(JSON.parse(sessionStorage.getItem("memberDetails")) || []);
    const [tableHeaders, setTableHeaders] = useState(JSON.parse(sessionStorage.getItem("memberBenefitsTableHeaders")) || []);
    const modalRef = useRef(null);
    const [OTP, setOTP] = useState("");
    const [isLoading, setIsLoading] = useState({
        spinner: false,
        icon: membershipNo.length > 0 ? true : false,
    });

    const [nameValue, setNameValue] = useState("");
    const [mobileNumberValue, setMobileNumberValue] = useState("");
    const [memberID, setMemberID] = useState("");
    // const [memberName, setMemberName] = useState("");

    const [tableOptionsData, setTableOptionsData] = useState([]);
    const [tableOptionsHeaders, setTableOptionsHeaders] = useState([]);
    const [paginatorOptions, setPaginatorOptions] = useState({
        page: 0,
        pageSize: 5,
        totalPages: undefined,
    });

    const [trigger, setTrigger] = useState(undefined);

    const [proposerName, setProposerName] = useState([]);

    const controllerRef = useRef();

    const changePage = (idx) => {
        setPaginatorOptions((po) => ({ ...po, page: idx }));
        setTrigger(Math.random());
    };

    const handleMemberValidity = async () => {
        setTableData([]);
        setMemberData([]);
        setTableHeaders([]);
        sessionStorage.removeItem("memberDetails");
        const { providerId, tokenID, userCode } = userDetails;

        const payLoad = {
            memberNo: membershipNo.toUpperCase(),
            tokenID: tokenID,
            userID: userCode,
            providerID: providerId,
        };
        setIsLoading((val) => ({ ...val, spinner: true }));
        setIsLoading((val) => ({ ...val, icon: false }));

        const data = await ValidateMemberGenOTP(payLoad);

        if (data.ok) {
            const result = getResultFromData(data);
            if (result) {
                cogoToast.success(CHECK_MSG).then(() => modalRef.current.showModal());
            } else {
                cogoToast.error(data.data.data.message);
                setIsLoading((val) => ({ ...val, spinner: false }));
            }
        } else {
            setIsLoading((val) => ({ ...val, spinner: false }));

            cogoToast.error("Please relogin");
        }
    };

    const handleOTP = async () => {
        if (String(OTP).length !== 6) {
            cogoToast.error("OTP must be 6 digits");
            return;
        }

        const { tokenID, userCode, providerId } = userDetails;
        const payLoad = {
            OTP: OTP.toString(),
            memberNo: membershipNo.toUpperCase(),
            userID: userCode,
            tokenID: tokenID,
            providerID: providerId,
        };

        const [validateMemberData, memberBenefits] = await Promise.all([ValidateMemberWithOTP(payLoad), GetMemberBenefits(_.omit(payLoad, ["OTP"]))]);

        if (validateMemberData.ok) {
            setOTP("");
            setIsLoading((val) => ({ ...val, spinner: false }));
            setIsLoading((val) => ({ ...val, icon: true }));

            modalRef.current.close();
            let cleanMemberData = _.omit(getResultFromData(validateMemberData), [
                "corporateID",
                "insuranceID",
                "signaturePath",
                "photoPath",
                "actualMemberShipNo",
                "countryCode",
                "empCode",
                "memberRelationCode",
                "tpaID",
            ]);
            cleanMemberData = { membershipNo: cleanMemberData.memberShipNo, ...cleanMemberData };
            delete cleanMemberData.memberShipNo;
            setMemberData(cleanMemberData);
            sessionStorage.setItem("memberDetails", JSON.stringify(cleanMemberData));
        } else {
            setOTP("");
            setIsLoading((val) => ({ ...val, spinner: false }));
            setIsLoading((val) => ({ ...val, icon: false }));

            cogoToast.error(getErrorResultFromData(validateMemberData).message);
            modalRef.current.close();
        }

        if (memberBenefits.ok) {
            const resultFromData = getResultFromData(memberBenefits);
            if (Array.isArray(resultFromData)) {
                resultFromData.forEach((item) => {
                    item.Eligibility = <ColorCode color={item.benefitBalanceStatusColorCode} />;
                    item.coShare = item.coShare + "%";
                });

                const memberBenefitsTableHeaders = Object.keys(
                    _.omit(resultFromData[0], [
                        "insurer",
                        "product",
                        "catagory",
                        "clauseCodeDependent",
                        "benefitBalanceStatusColorCode",
                        "consume",
                        "balance",
                        "coShare",
                    ])
                ).map((item) => ({
                    dataField: item,
                    text: getCapitallisedFromCamelCase(item),
                    sort: item === "Eligibility" ? false : true,
                }));
                setTableHeaders(memberBenefitsTableHeaders);
                const memberBenefitsTableData = resultFromData.map((item) =>
                    _.omit(item, [
                        "insurer",
                        "product",
                        "catagory",
                        "clauseCodeDependent",
                        "benefitBalanceStatusColorCode",
                        "consume",
                        "balance",
                        "coShare",
                    ])
                );
                setTableData(memberBenefitsTableData);

                sessionStorage.setItem("memberBenefitsTableHeaders", JSON.stringify(memberBenefitsTableHeaders));
                sessionStorage.setItem("memberBenefitsTableData", JSON.stringify(memberBenefitsTableData));
            }
        } else {
            cogoToast.info("Member benefits not found against current membership number");
        }
    };

    const decodeJWT = (token) => {
        const parts = token.split(".");

        if (parts.length !== 3) {
            console.error("Invalid JWT format");
            return null;
        }

        const base64Url = parts[1];

        try {
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            localStorage.setItem("memberDetails", jsonPayload);
        } catch (error) {
            console.error("Error decoding JWT:", error);
            return null;
        }
    };

    useEffect(() => {
        decodeJWT(localStorage.getItem("token"));
    }, []);

    async function fetchUsers() {
        const { providerId, tokenID, userCode } = userDetails;

        if (Array.isArray(proposerName) && nameValue === "" && mobileNumberValue === "") {
            cogoToast.info("Provide search parameters to search");

            return;
        }

        if (proposerName.label && proposerName.value && nameValue === "" && mobileNumberValue === "") {
            cogoToast.error("Select atleast name, mobile number or indentification number with Proposer");
            return;
        } else {
            const payLoad = {
                tokenID: tokenID,
                userID: userCode,
                providerID: providerId,
                searchName: nameValue || null,
                searchMobile: mobileNumberValue || null,
                pageNo: paginatorOptions.page,
                pageSize: paginatorOptions.pageSize,
                searchIDNo: memberID || null,
                proposerID: proposerName.value || null,
            };

            const data = await SearchBynameOrNumber(payLoad);
            if (data.ok) {
                const resultFromData = getResultFromData(data);
                if (resultFromData) {
                    const optionsHeader = Object.keys(_.omit(resultFromData[0], ["proposerID", "product"])).map((item) => ({
                        dataField: item,
                        text: getCapitallisedFromCamelCase(item),
                        sort: true,
                    }));

                    setPaginatorOptions((po) => ({
                        ...po,
                        totalPages: data?.data?.data?.totalPages,
                    }));

                    optionsHeader.push({
                        dataField: "select",
                        text: "Select",
                        sort: false,
                        formatter: (cellContent, row) => {
                            return (
                                <Button style={{ width: "min-content" }} size="sm" onClick={() => setMembershipNo(row.memberNo)}>
                                    Select
                                </Button>
                            );
                        },
                    });

                    optionsHeader.push({
                        dataField: "id",
                        text: "ID",
                        hidden: true,
                    });

                    resultFromData.forEach((data) => {
                        data["id"] = Math.random().toString(32).slice(2) + Math.random().toString(32).slice(2);
                    });

                    setTableOptionsHeaders(optionsHeader);

                    setTableOptionsData(resultFromData);
                } else {
                    cogoToast.error(data.data.data.message);
                    setTableOptionsHeaders([]);
                    setTableOptionsData([]);
                }
            } else {
                cogoToast.error("Something went wrong");
            }
        }
    }

    useEffect(() => {
        if (trigger) {
            fetchUsers();
        }
    }, [paginatorOptions.page, trigger]);

    const customStyles = {
        menuList: (provided, state) => ({
            ...provided,
            marginBottom: 10,
        }),
    };

    function handleChange(change, action) {
        if (action.action === "clear" && change === null) {
            setProposerName([]);
        } else if (change !== null) {
            setProposerName(change);
        }
    }

    const debouncedSearch = useCallback(
        _.debounce((value, callBack) => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
            controllerRef.current = new AbortController();
            try {
                if (value.length > 0) {
                    const { providerId, tokenID, userCode } = userDetails;

                    const payLoad = {
                        tokenID: tokenID,
                        userID: userCode,
                        providerID: providerId,
                        proposerName: value,
                    };
                    axios({
                        url: `${decideENV() === "DEV" ? import.meta.env.VITE_BaseURL_DEV : import.meta.env.VITE_BaseURL_PROD}/fetchproposer`,
                        method: "post",
                        data: payLoad,
                        signal: controllerRef.current.signal,
                        headers: {
                            "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
                            "Content-Type": "multipart/form-data",
                        },
                    }).then((data) => {
                        if (data.data.result) {
                            callBack(
                                data.data.result.map((item) => ({
                                    value: item.proposerId,
                                    label: item.proposerDisplayName.toUpperCase(),
                                }))
                            );
                        } else {
                            cogoToast.error(data.data.message);
                        }
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }, 1000),
        []
        // eslint-disable-next-line react-hooks/exhaustive-deps
    );

    return (
        <div>
            <Container fluid>
                {/* <YourComponent /> */}
                <Row>
                    <Col md={10}>
                        <h5>Member Eligibility</h5>
                    </Col>
                    {/* <Col md={2} className="text-muted">
            <h6>Dashboard / Member Eligibility</h6>
          </Col> */}
                </Row>
                <Row className="mt-2">
                    <h6>Search By</h6>
                    <Col md={1} style={{ width: "15rem" }}>
                        <Form.Control type="text" placeholder=" Name" value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
                    </Col>
                    <Col md={1} style={{ width: "12rem" }}>
                        <Form.Control
                            type="text"
                            placeholder=" Mobile Number"
                            value={mobileNumberValue}
                            onChange={(e) => setMobileNumberValue(e.target.value)}
                        />
                    </Col>
                    <Col md={5}>
                        <AsyncSelect
                            menuPlacement="bottom"
                            cacheOptions
                            styles={customStyles}
                            isClearable={true}
                            isMulti={false}
                            onChange={handleChange}
                            value={proposerName}
                            loadOptions={debouncedSearch}
                            placeholder="Search Proposer"
                            components={{ MenuList: CustomVirtualList }}
                        />
                    </Col>
                    <Col md={1} style={{ width: "12rem" }}>
                        <Form.Control type="text" placeholder="ID Number" value={memberID} onChange={(e) => setMemberID(e.target.value)} />
                    </Col>
                    <Col md={2} className="me-4">
                        <Button
                            variant="warning"
                            style={{ width: "max-content" }}
                            size="sm"
                            onClick={() => {
                                fetchUsers();
                                // setTrigger(Math.random());
                            }}
                        >
                            Search
                        </Button>
                    </Col>
                </Row>
                {tableOptionsHeaders?.length > 0 ? (
                    <Row className="mt-3">
                        <Col>
                            <Card className="border-0 shadow">
                                <Card.Body>
                                <div style={{ width: '100%', overflowX: 'auto' }}>
                                    <BootstrapTable
                                        bootstrap4={true}
                                        keyField="id"
                                        data={tableOptionsData}
                                        columns={tableOptionsHeaders}
                                        bordered={false}
                                        />
                                        </div>
                                    {paginatorOptions?.totalPages ? (
                                        <Paginator totalPages={paginatorOptions.totalPages} changePage={changePage} />
                                    ) : null}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                ) : null}
                <Row className="mt-3">
                    <h6>Member Eligibilty & Verification</h6>
                </Row>
                <Row className="mt-2">
                    <Col md={3}>
                        <Form onSubmit={(e) => e.preventDefault()}>
                            <Form.Group>
                                <Form.Label className="col-lg-12">
                                    Membership No. <span className="mandate_field">*</span>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Membership no"
                                        value={membershipNo.toUpperCase()}
                                        onChange={(e) => setMembershipNo(e.target.value)}
                                    />
                                    {isLoading?.icon && (
                                        <FontAwesomeIcon
                                            icon={faCircleCheck}
                                            style={{
                                                color: "#5cb85c",
                                                position: "relative",
                                                left: "calc(100% - 1.8rem)",
                                                top: "-2rem",
                                            }}
                                        />
                                    )}{" "}
                                    {isLoading?.spinner && (
                                        <div
                                            style={{
                                                color: "#556ee6",
                                                position: "relative",
                                                left: "calc(100% - 1.8rem)",
                                                top: "-2rem",
                                                width: "50px",
                                                height: "50px",
                                            }}
                                        >
                                            <Spinner animation="border" />
                                        </div>
                                    )}
                                </Form.Label>
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col md={2}>
                        <Button variant="warning" className="btn-primary search_button searchBtn" size="sm" onClick={handleMemberValidity}>
                            Search
                        </Button>
                    </Col>
                </Row>
                <dialog ref={modalRef} className="dialog__modal">
                    <section>
                        <label htmlFor="otp" />
                        Enter OTP
                        <input id="otp" name="otp" type="number" value={OTP} className="input" onChange={(e) => setOTP(e.target.valueAsNumber)} />
                        <Button onClick={handleOTP} data-otp="OTP" className="btn btn-primary">
                            Submit
                        </Button>
                    </section>
                </dialog>
                {!_.isEmpty(memberData) ? (
                    <MemberElligibilityLayout data={memberData} />
                ) : (
                    <div className="justify-content-center pt-5 row heroImg">
                        <img src={Eligibility} alt="" style={{ width: "294px", height: "330px" }} />
                    </div>
                )}
                {tableHeaders?.length > 0 ? (
                    <div>
                        <Row className="mb-3">
                            <Col>
                                <h4>Member Benefit Details</h4>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Card className="border-0 shadow">
                                    <Card.Body>
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                        <BootstrapTable bootstrap4={true} keyField="id" data={tableData} columns={tableHeaders} bordered={false} />
                                    </div>                                        
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                ) : null}
            </Container>
        </div>
    );
};

export default MemberEligibility;

const ColorCode = ({ color }) => {
    const colors = {
        ORANGE: "#FFA500",
        RED: "#FF0000",
        GREEN: "#008B3C",
    };

    return <div className="color--code" style={{ backgroundColor: colors[color] }}></div>;
};
