import React, { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";
import { Card, Col, Container, Form, Row, Button } from "react-bootstrap";
import { useImmer } from "use-immer";
import { ValidateMember } from "../../API/memberEligibility";
import { requestPreauthReview, savePreAuth, savePreAuthDetails, uploadPreauthFiles } from "../../API/submitPreAuth";
import cogoToast from "cogo-toast";
import { ERROR_CODES, formatDate__ddMMyyyy, getResultFromData } from "../../utils/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faPlus, faMinus, faCamera } from "@fortawesome/free-solid-svg-icons";
import { getClaimDropDownvalues } from "../../API/submitClaim";
import { fieldValidatePreAuth } from "./validation";
import moment from "moment";
import _ from "../../deepdash";
import ReactSelect from "react-select";
import { getBenefits, getDiagnosis, getPreAuthDetailsFromMemberNo, getServicetypes } from "../../API/masterData";

const SubmitPreAuth = () => {
    const [formData, setFormData] = useImmer({});
    const [step, setStep] = useState(1);
    const [memberNo, setMemberNo] = useState();
    const [benefits, setBenefits] = React.useState([]);
    const [serviceTypes, setServiceTypes] = React.useState([]);
    const [diagnosis, setDiagnosis] = React.useState([]);
    const [primaryDiagnosis, setPrimaryDiagnosis] = React.useState([]);
    const [data, setData] = React.useState({
        expectedDOA: "",
        expectedDOD: "",
        contactNoOne: "",
        contactNoTwo: "",
        referalTicketRequired: "",
    });
    const [benefitsWithCost, setBenefitsWithCost] = React.useState([
        {
            benefitId: "",
            estimatedCost: 0,
        },
    ]);
    const [serviceDetailsList, setServiceDetailsList] = React.useState([
        {
            serviceId: "",
            estimatedCost: 0,
        },
    ]);
    const [userDetails] = useState(JSON.parse(sessionStorage.getItem("user")));
    const [timeStamp, setTimeStamp] = useImmer({
        checkin: { hours: "", mins: "" },
        checkout: { hours: "", mins: "" },
    });

    const [successfulDetails, setSuccessfulDetails] = useState(null);

    const getDetailsFromMemberNo = async () => {
        const result = await getPreAuthDetailsFromMemberNo(memberNo);
        let policyEndDate = new Date(result?.data?.data.content[0].policyEndDate);
        let formattedPolicyEndDate = `${policyEndDate.getFullYear()}-${String(policyEndDate.getMonth() + 1).padStart(2, "0")}-${String(
            policyEndDate.getDate()
        ).padStart(2, "0")}`;

        setFormData({
            ...formData,
            name: result?.data?.data.content[0].name,
            age: result?.data?.data.content[0].age,
            gender: result?.data?.data.content[0].gender,
            membershipNo: result?.data?.data.content[0].membershipNo,
            relations: result?.data?.data.content[0].relations,
            policyNumber: result?.data?.data.content[0].policyNumber,
            enrolentToDate: formattedPolicyEndDate,
            enrolmentFromDate: new Date(result?.data?.data.content[0].policyStartDate),
            planName: result?.data?.data.content[0].planName,
            planScheme: result?.data?.data.content[0].planScheme,
            productName: result?.data?.data.content[0].productName,
            mobileNo: result?.data?.data?.content[0].mobileNo,
        });
        setData({
            ...data,
            mobileNo: result?.data?.data?.content[0].mobileNo,
        });
    };

    const getBenefit = async () => {
        const result = await getBenefits();
        setBenefits(result?.data?.data?.content);
    };

    const getServiceTypes = async () => {
        const result = await getServicetypes();
        setServiceTypes(result?.data?.data?.content);
    };

    useEffect(() => {
        getBenefit();
        getServiceTypes();
    }, []);

    useEffect(() => {
        if (memberNo) getDetailsFromMemberNo();
    }, [memberNo]);

    const saveData = async (payload) => {
        let result = await savePreAuth(payload);
        if (result?.ok) {
            localStorage.setItem("preauthid", result?.data?.data?.id);
            setStep(2);
        }
    };

    const proceedToNextStep = (e) => {
        const { id } = e.target;
        let diagnosisIds = diagnosis?.map((ele) => ele?.value) || [];

        let payload = {
            // preAuthStatus: formik.values.preAuthStatus,
            memberShipNo: memberNo,
            expectedDOA: new Date(data?.expectedDOA).getTime(),
            expectedDOD: new Date(data?.expectedDOD).getTime(),
            diagnosis: diagnosisIds,
            primaryDigonesisId: primaryDiagnosis,
            contactNoOne: data?.mobileNo,
            contactNoTwo: data?.contactNoTwo,
            referalTicketRequired: data?.referalTicketRequired,
            benefitsWithCost: benefitsWithCost,
            services: serviceDetailsList,
            providers: [],
            preAuthType: "IPD",
        };

        switch (step) {
            case 1: {
                if (!memberNo) {
                    cogoToast.error("Member number is Required");
                    return;
                }
                if (!data?.contactNoOne) {
                    cogoToast.error("Contact number is Required");
                    return;
                }
                saveData(payload);

                break;
            }
            default: {
                return void 0;
            }
        }
    };

    const updateValues = (field, value) => {
        setFormData((data) => {
            data[field] = value;
        });
    };

    const SubmitData = async (finalData) => {
        const _finalData = _.cloneDeep(finalData);
        const { tokenID, providerName, providerId, userCode } = userDetails;
        const { error } = fieldValidatePreAuth.validate(
            _.omit(_finalData, ["membername", "mobile", "policytodate", "policyfromdate", "relation", "age", "uploadedfiles", "policynumber"])
        );
        if (error) {
            cogoToast.error(error.message);
            return;
        } else {
            const payLoad = {
                preAuth: {
                    membernumber: _finalData.memberno,
                    contactno: _finalData.contact,
                    servicetype: _finalData.servicetype,
                    claimtype: _finalData.claimtype,
                    estimatedamount: _finalData.estimatedcost,
                    checkin: `${formatDate__ddMMyyyy(_finalData.checkin.replaceAll("-", "/"))} ${
                        timeStamp.checkin.hours + ":" + timeStamp.checkin.mins + ":00"
                    }`,
                    checkout: `${formatDate__ddMMyyyy(_finalData.checkout.replaceAll("-", "/"))} ${
                        timeStamp.checkout.hours + ":" + timeStamp.checkout.mins + ":00"
                    }`,
                    tokenID: tokenID,
                    providername: providerName,
                    providerID: providerId,
                    providerCode: userCode,
                    diseaseID: _finalData.icd.value,
                },
            };

            const result = await savePreAuthDetails(payLoad);

            if (result.ok) {
                cogoToast.success("Pre auth submitted successfully");
                if (_finalData.uploadedfiles.files.length > 0) {
                    if (_finalData.uploadedfiles.files.every((file) => file.size > 0)) {
                        const payLoad = {
                            providerID: providerId,
                            tokenID,
                            userID: userCode,
                            claimID: getResultFromData(result).searchValue,
                            file: _finalData.uploadedfiles.files[0],
                        };

                        const _result = await uploadPreauthFiles(payLoad);

                        if (_result.ok) {
                            cogoToast.success("Files Uploaded Successfully");
                        }
                    } else {
                        cogoToast.error("Please upload files with content in it");
                    }
                }

                const transactionID = getResultFromData(result)?.transactionID.split(":")[1];

                if (transactionID) {
                    const detailsToBeShown = {
                        "Preauth Number": transactionID,
                        "Member Name": _finalData.membername,
                        "Member Number": payLoad.preAuth.membernumber,
                        "Contact No": payLoad.preAuth.contactno,
                        "Provider Name": payLoad.preAuth.providername,
                    };
                    setSuccessfulDetails(detailsToBeShown);

                    //save this in state setState(det)
                }

                //Remove all the stepper form and display this transactyion ID
            } else {
                const status = result.error.response.status;
                cogoToast.error(ERROR_CODES[status.toString()] || "Something went wrong");
            }
        }
    };

    useEffect(() => {
        if (successfulDetails) {
            const displayKey = _.omit(successfulDetails, [
                "providerID",
                "providerCode",
                "tokenID",
                "checkin",
                "checkout",
                "servicetype",
                "claimtype",
            ]);
        }
    }, [successfulDetails]);

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={10}>
                        <h5>Preauth Registration</h5>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        {successfulDetails === null ? (
                            <Card className="border-0">
                                <Card.Body id="submitpreauthcardbody">
                                    <Card.Title>Request for Preauth</Card.Title>
                                    <Card className="mt-3 col-lg-12 step__flex">
                                        <Button id="1" className={`${step === 1 ? "step_actve" : "steps"}`} onClick={proceedToNextStep}>
                                            1
                                        </Button>
                                        <Button id="2" className={`${step === 2 ? "step_actve" : "steps"}`}>
                                            2
                                        </Button>
                                    </Card>
                                    <div style={{ display: step === 1 ? "block" : "none" }}>
                                        <Step1
                                            existingData={formData}
                                            updateValues={updateValues}
                                            setTimeStamp={setTimeStamp}
                                            timeStamp={timeStamp}
                                            setMemberNo={setMemberNo}
                                            benefits={benefits}
                                            serviceTypes={serviceTypes}
                                            benefitsWithCost={benefitsWithCost}
                                            setBenefitsWithCost={setBenefitsWithCost}
                                            serviceDetailsList={serviceDetailsList}
                                            setServiceDetailsList={setServiceDetailsList}
                                            setData={setData}
                                            data={data}
                                            diagnosis={diagnosis}
                                            setDiagnosis={setDiagnosis}
                                            setPrimaryDiagnosis={setPrimaryDiagnosis}
                                        />
                                    </div>

                                    <div style={{ display: step === 2 ? "block" : "none" }}>
                                        <Step2 existingData={formData} updateValues={updateValues} />
                                    </div>
                                    {step === 1 && (
                                        <Button
                                            id={`alt_${step + 1}`}
                                            style={{ marginTop: `${step === 2 ? "4rem" : "initial"}` }}
                                            className="mt-3 next_btn"
                                            onClick={proceedToNextStep}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card>
                                <Card.Body>
                                    {
                                        <div>
                                            <p>
                                                {Object.keys(successfulDetails).map((key, i) => {
                                                    return (
                                                        <p key={i}>
                                                            <span>
                                                                {" "}
                                                                <strong>{key}</strong> :{" "}
                                                            </span>
                                                            <span>{successfulDetails[key]}</span>

                                                            {key === "Preauth Number" ? (
                                                                <span
                                                                    className="icon-conatiner"
                                                                    style={{ marginLeft: "1rem" }}
                                                                    onClick={() =>
                                                                        navigator.clipboard
                                                                            .writeText(successfulDetails[key])
                                                                            .then(() => cogoToast.success("Pre-auth Number copied successfully"))
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faCopy}
                                                                        style={{
                                                                            cursor: "pointer",
                                                                        }}
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </p>
                                                    );
                                                })}
                                            </p>
                                        </div>
                                    }
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default SubmitPreAuth;

const Step1 = ({
    existingData,
    updateValues = () => {},
    setTimeStamp = () => {},
    setMemberNo,
    benefits,
    serviceTypes,
    benefitsWithCost,
    setBenefitsWithCost,
    serviceDetailsList,
    setServiceDetailsList,
    data,
    setData,
    setDiagnosis,
    setPrimaryDiagnosis,
}) => {
    const [userDetails] = useState(JSON.parse(sessionStorage.getItem("user")));
    const [serviceTypeValues, setServiceTypeValues] = useState([]);
    const [benefitOptions, setBenefitOptions] = React.useState([]);
    const [serviceTypesOptions, setServiceTypesOptions] = React.useState([]);
    const [selectedBenefit, setSelectedBenefit] = React.useState([]);
    const [diagnosisList, setDiagnosisList] = React.useState([]);
    const firstRender = useRef(true);
    const [isLoading, setIsLoading] = useState({
        spinner: false,
        icon: existingData?.membername?.length > 0 ? true : false,
    });

    const [memberNumber, setMemberNumber] = useState("");

    // eslint-disable-next-line
    const check = useCallback(
        _.debounce(async (e) => {
            if (e.target.value.length > 0 && e.target.value.length <= 25) {
                const { providerId, tokenID, userCode } = userDetails;

                const payLoad = {
                    memberNo: e.target.value,
                    tokenID: tokenID,
                    userID: userCode,
                    providerID: providerId,
                };
                setIsLoading((val) => ({ ...val, spinner: true, icon: false }));
                const data = await ValidateMember(payLoad);
                if (data.ok) {
                    const result = getResultFromData(data);

                    if (result) {
                        setOTP("");
                        setIsLoading((val) => ({ ...val, icon: true }));
                        setIsLoading((val) => ({ ...val, spinner: false }));

                        const { memberName, policyNo, policyStartDate, policyExpireDate, memberAge, memberRelation } = result;
                        updateValues("memberno", e.target.value);
                        updateValues("membername", memberName);
                        updateValues("policynumber", policyNo);
                        updateValues("policyfromdate", policyStartDate);
                        updateValues("policytodate", policyExpireDate);
                        updateValues("age", memberAge);
                        updateValues("relation", memberRelation);
                    } else {
                        setOTP("");
                        setIsLoading((val) => ({ ...val, spinner: false }));
                        cogoToast.error("Invalid Member Number");
                    }
                } else {
                    setIsLoading(null);
                    cogoToast.error("Something went wrong");
                }
            } else {
                if (e.target.value.length !== 0) cogoToast.info("Membership Number should not be more than 25 characters");
            }

            /** */
        }, 2000),
        []
        // eslint-disable-next-line react-hooks/exhaustive-deps
    );

    const populateServiceType = async (claimTypeValue) => {
        const { tokenID, userCode, providerId } = userDetails;
        const payLoad = {
            userID: userCode,
            tokenID: tokenID,
            providerID: providerId,
            claimType: claimTypeValue,
        };

        const data = await getServiceTypeDropdown(payLoad);
        if (data.ok) {
            setServiceTypeValues(getResultFromData(data));
        } else {
            cogoToast.error("Something went wrong");
        }
        //Bring the results when the api will be done
    };

    useEffect(() => {
        let temp = [];
        let X = benefits?.forEach((ele) => {
            let obj = {
                label: ele.code + " | " + ele.name,
                name: ele.code + " | " + ele.name,
                value: ele.id,
            };
            temp.push(obj);
        });
        setBenefitOptions(temp);
    }, [benefits]);

    useEffect(() => {
        let temp = [];
        let X = serviceTypes?.forEach((ele) => {
            let obj = {
                label: ele.name,
                name: ele.name,
                value: ele.id,
            };
            temp.push(obj);
        });
        setServiceTypesOptions(temp);
    }, [serviceTypes]);

    useEffect(() => {
        if (existingData.servicetype) {
            updateValues("checkin", moment(new Date()).format("YYYY-MM-DD"));
            updateValues("checkout", moment(new Date()).format("YYYY-MM-DD"));

            if (existingData.servicetype === "IP") {
                setTimeStamp((ts) => {
                    ts.checkin.hours = "00";
                    ts.checkin.mins = "00";
                    ts.checkout.hours = "23";
                    ts.checkout.mins = "59";
                });
            } else if (existingData.servicetype === "OP") {
                setTimeStamp((ts) => {
                    ts.checkin.hours = "09";
                    ts.checkin.mins = "00";
                    ts.checkout.hours = "09";
                    ts.checkout.mins = "10";
                });
            }
        }
    }, [existingData?.servicetype]);

    const getDiagnosisoption = async () => {
        const result = await getDiagnosis();
        let temp = [];
        result?.data?.data?.content?.forEach((ele) => {
            let obj = {
                label: ele.name,
                name: ele.name,
                value: ele.id,
                id: ele.id,
            };
            temp.push(obj);
        });
        setDiagnosisList(temp);
    };

    useEffect(() => {
        getDiagnosisoption();
        async function getDropDownValues() {
            const { providerId, tokenID, userCode } = userDetails;

            const payLoad = {
                tokenID: tokenID,
                userID: userCode,
                providerID: providerId,
            };
            const resultClaimDropDown = await getClaimDropDownvalues(payLoad);

            if (resultClaimDropDown.ok) {
                setClaimType(getResultFromData(resultClaimDropDown));
            } else {
                cogoToast.error("Something went wrong");
            }
        }
        if (firstRender.current) {
            getDropDownValues();
            firstRender.current = false;
        }
    }, []);

    useEffect(() => {
        if (existingData.servicetype) {
            populateServiceType(existingData.servicetype);
        }
    }, [existingData?.servicetype]);

    const handleBenefitChange = (index, e, val) => {
        const isOptionPresent = selectedBenefit.some((item) => item === e.target.value);
        if (e.target.value === null) {
            let temp = [...selectedBenefit];
            temp.splice(index, 1);
            setSelectedBenefit(temp);
        } else {
            if (!isOptionPresent) {
                setSelectedBenefit([...selectedBenefit, e.target.value]);
            }
        }
        const isValAlreadyPresent = benefitsWithCost.some((item) => item.benefitId === e.target.value);

        if (!isValAlreadyPresent) {
            setBenefitsWithCost((prevData) => [
                ...prevData.slice(0, index),
                { ...prevData[index], benefitId: e.target.value },
                ...prevData.slice(index + 1),
            ]);
        } else {
            alert(`You have already added this benefit!!!`);
        }
    };

    const handleInputChangeBenefitWithCost = (e, index) => {
        const { name, value } = e.target;
        const list = [...benefitsWithCost];
        list[index][name] = value;
        setBenefitsWithCost(list);
    };

    const handleRemoveClaimCost = (index) => {
        const list = [...benefitsWithCost];
        list.splice(index, 1);
        setBenefitsWithCost(list);
        const listSelected = [...selectedBenefit];
        listSelected.splice(index, 1);
        setSelectedBenefit(listSelected);
    };

    const handleAddClaimCost = () => {
        setBenefitsWithCost([...benefitsWithCost, { benefitId: "", otherType: "", estimatedCost: 0 }]);
    };

    const handleInputChangeService = (e, index) => {
        const { name, value } = e.target;
        const list = [...serviceDetailsList];
        list[index][name] = value;
        setServiceDetailsList(list);
    };

    const handleRemoveServicedetails = (index) => {
        const list = [...serviceDetailsList];
        list.splice(index, 1);
        setServiceDetailsList(list);
    };

    const handleAddServicedetails = () => {
        setServiceDetailsList([...serviceDetailsList, { serviceId: "", estimatedCost: 0 }]);
    };

    return (
        <main>
            <Row>
                <Card className="mt-3 border-0">
                    <Form className="form">
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Member No. <span className="mandate_field">*</span>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter Member No."
                                defaultValue={existingData?.memberNumber ?? memberNumber}
                                maxLength={25}
                                onChange={(e) => {
                                    setMemberNumber(e.target.value);
                                }}
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            <Button
                                className="mt-4"
                                variant="primary"
                                onClick={() => {
                                    setMemberNo(memberNumber);
                                }}
                                style={{ marginLeft: "10px", height: "60%", width: "30%" }}
                            >
                                Search
                            </Button>
                        </Form.Label>{" "}
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Name
                            <Form.Control disabled value={existingData?.name ?? ""} required type="text" placeholder="Name" />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Policy No.
                            <Form.Control disabled value={existingData?.policyNumber ?? ""} required type="text" placeholder="Policy Number" />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Age
                            <Form.Control disabled required value={existingData?.age ?? ""} type="text" placeholder="Age" />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Relation
                            <Form.Control disabled required value={existingData?.relations ?? ""} type="text" placeholder="Relation" />
                        </Form.Label>
                        <Form.Label disabled className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Enrollment Date
                            <Form.Control disabled required value={existingData?.dateOfJoining ?? ""} type="date" placeholder="Enrollment Date" />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Policy From Date
                            <Form.Control
                                required
                                disabled
                                value={existingData?.policyStartDate ? "2024-03-20" : ""}
                                type="date"
                                placeholder="Policy From Date"
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Policy To Date
                            <Form.Control required disabled value={existingData?.policyEndDate ?? ""} type="date" placeholder="Policy To Date" />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5"></Form.Label>
                        <div className="w-100 bg-secondary mt-4" style={{ height: "1px", opacity: "0.3" }} />
                        <Form.Label className="mt-4 col-lg-5" style={{ flexBasis: "100ch" }}>
                            Benefit <span className="mandate_field">*</span>
                            {benefitsWithCost.map((x, i) => {
                                return (
                                    <div className="d-flex flex-column flex-sm-row justify-content-start">
                                        <Form.Select
                                            variant="primary"
                                            style={{ width: "45%", marginTop: i > 0 && "5px" }}
                                            onChange={(e, val) => handleBenefitChange(i, e, val)}
                                            defaultValue={x.benefitId}
                                            value={x.benefitId}
                                            id="benefit"
                                        >
                                            <option>select benefit</option>
                                            {benefitOptions.map((st) => {
                                                return <option value={st.value}>{st.label}</option>;
                                            })}
                                        </Form.Select>
                                        <div className="d-flex justify-content-start align-items-center w-50" style={{ marginLeft: "3%" }}>
                                            <Form.Label className="" style={{ maxHeight: "62px" }}>
                                                Estimated Cost
                                                <Form.Control
                                                    id="standard-basic"
                                                    type="number"
                                                    name="estimatedCost"
                                                    value={x.estimatedCost}
                                                    onChange={(e) => handleInputChangeBenefitWithCost(e, i)}
                                                    label="Estimated Cost"
                                                    placeholder="Estimated Cost"
                                                />
                                            </Form.Label>
                                            {benefitsWithCost.length !== 1 && (
                                                <Button
                                                    className="mt-4 d-flex align-items-center justify-content-center"
                                                    onClick={() => handleRemoveClaimCost(i)}
                                                    variant="secondary"
                                                    // color="secondary"
                                                    style={{ marginLeft: "5px", width: "10%", height: "30%" }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faMinus}
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                </Button>
                                            )}
                                            {benefitsWithCost.length - 1 === i && (
                                                <Button
                                                    variant="primary"
                                                    style={{ marginLeft: "5px", width: "10%", height: "30%" }}
                                                    className="mt-4"
                                                    onClick={handleAddClaimCost}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faPlus}
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </Form.Label>
                        <div className="w-100 bg-secondary mt-4" style={{ height: "1px", opacity: "0.3" }} />
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Expected DOA
                            <Form.Control
                                required
                                value={existingData?.expectedDOA ?? data?.expectedDOA}
                                type="date"
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        expectedDOA: e.target.value,
                                    }));
                                }}
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Expected DOD
                            <Form.Control
                                required
                                value={data?.expectedDOD}
                                type="date"
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        expectedDOD: e.target.value,
                                    }));
                                }}
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Contact No. 1
                            <Form.Control
                                type="tel"
                                value={data?.contactNoOne}
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        contactNoOne: e.target.value,
                                    }));
                                }}
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Contact No. 2
                            <Form.Control
                                type="tel"
                                value={data?.contactNoTwo}
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        contactNoTwo: e.target.value,
                                    }));
                                }}
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5">
                            Primary Diagnosis
                            <ReactSelect options={diagnosisList} onChange={(e) => setPrimaryDiagnosis(e.id)} />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5">
                            Other Diagnoses
                            <ReactSelect options={diagnosisList} isMulti onChange={(e) => setDiagnosis(e)} />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5 d-flex align-items-center justify-content-start" style={{ maxHeight: "62px" }}>
                            <input
                                class="form-check-input"
                                type="checkbox"
                                value={data?.referalTicketRequired}
                                id="flexCheckDefault"
                                className="me-2"
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        referalTicketRequired: e.target.checked,
                                    }));
                                }}
                            />
                            Referral Ticket Required
                        </Form.Label>
                        <div className="w-100 bg-secondary mt-4" style={{ height: "1px", opacity: "0.3" }} />
                        <Form.Label className="mt-4 col-lg-5" style={{ flexBasis: "100ch" }}>
                            Service Type <span className="mandate_field">*</span>
                            {serviceDetailsList.map((x, i) => {
                                return (
                                    <div className="d-flex flex-column flex-sm-row justify-content-start">
                                        <Form.Select
                                            variant="primary"
                                            style={{ width: "45%", marginTop: "10px" }}
                                            value={x.serviceId}
                                            id="servicetype__step1"
                                            title="Select Service Type"
                                            name="serviceId"
                                            onChange={(e) => handleInputChangeService(e, i)}
                                        >
                                            <option>select service</option>
                                            {serviceTypesOptions.map((st) => {
                                                return <option value={st.value}>{st.label}</option>;
                                            })}
                                        </Form.Select>
                                        <div className="d-flex justify-content-start align-items-center w-50" style={{ marginLeft: "3%" }}>
                                            <Form.Label className="">
                                                Estimated Cost
                                                <Form.Control
                                                    id="standard-basic"
                                                    type="number"
                                                    name="estimatedCost"
                                                    value={x.estimatedCost}
                                                    onChange={(e) => handleInputChangeService(e, i)}
                                                    label="Estimated Cost"
                                                    placeholder="Estimated Cost"
                                                />
                                            </Form.Label>
                                            {serviceDetailsList.length !== 1 && (
                                                <Button
                                                    className="mt-4 d-flex align-items-center justify-content-center"
                                                    onClick={() => handleRemoveServicedetails(i)}
                                                    variant="secondary"
                                                    style={{ marginLeft: "5px", width: "10%", height: "30%" }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faMinus}
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                </Button>
                                            )}
                                            {serviceDetailsList.length - 1 === i && (
                                                <Button
                                                    variant="primary"
                                                    style={{ marginLeft: "5px", width: "10%", height: "30%" }}
                                                    className="mt-4"
                                                    onClick={handleAddServicedetails}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faPlus}
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </Form.Label>
                    </Form>
                </Card>
            </Row>
        </main>
    );
};

const Step2 = ({ updateValues = () => {} }) => {
    const docTempalte = {
        documentType: "Prescription",
        docFormat: "",
        documentName: "",
        documentOriginalName: "",
    };
    let documentTypeOptions = [
        { value: "Prescription", label: "Prescription" },
        { value: "Bill", label: "Bill" },
    ];
    const [fileKey, setFileKey] = useState([]);
    const [signal, setSignal] = useState(Math.random());
    const [documentList, setDocumentList] = React.useState([{ ...docTempalte }]);
    const [requestBtnEnable, setRequestBtnEnable] = React.useState(false);
    let preID = localStorage.getItem("preauthid");

    const handleAddDoc = (e, index) => {
        const file = e.target["files"][0];

        const reader = new FileReader();

        reader.onload = function () {
            const list = [...documentList];
            list[index]["documentOriginalName"] = file.name;

            setDocumentList(list);
            console.log("list", list);
            const formData = new FormData();
            formData.append("docType", list[index]["documentType"]);
            formData.append("filePart", file);

            let result = uploadPreauthFiles(preID, formData);
            result.then((res) => {
                if (res?.ok) {
                    cogoToast.success("Document uploaded, Now you can request for evaluation.");
                    setRequestBtnEnable(true);
                }
            });
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        setFileKey([...document.querySelectorAll("[id^=checkbox]")].filter((item) => item.checked).map((item) => item.value));
    }, [signal]);

    useEffect(() => {
        if (fileKey.length === 0) {
            updateValues("uploadedfiles", { fileNames: [], files: [] });
        }
    }, [fileKey]);

    const handleInputChangeDocumentType = (e, index) => {
        const { name, value } = e.target;
        const list = [...documentList];
        list[index][name] = value;
        setDocumentList(list);
    };

    const handleRemoveDocumentList = (index) => {
        const list = [...documentList];
        list.splice(index, 1);
        setDocumentList(list);
    };

    const handleAddDocumentList = () => {
        setDocumentList([
            ...documentList,
            {
                ...docTempalte,
            },
        ]);
    };

    const requestReview = async () => {
        let result = await requestPreauthReview(preID);
        if (result?.ok) cogoToast.success("Preauth requested for evaluation");
    };

    return (
        <Row>
            <Card className="mt-3 border-0">
                {documentList.map((x, i) => {
                    return (
                        <Form className="d-flex flex-column flex-sm-row justify-content-start row">
                            <Form.Label className="mt-4 col-lg-4">
                                <Form.Select
                                    variant="primary"
                                    style={{ width: "45%" }}
                                    value={x.documentType}
                                    disabled={!!x.documentName}
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    name="documentType"
                                    onChange={(e) => handleInputChangeDocumentType(e, i)}
                                >
                                    <option>select service</option>
                                    {documentTypeOptions.map((st) => {
                                        return <option value={st.value}>{st.label}</option>;
                                    })}
                                </Form.Select>
                            </Form.Label>
                            <Form.Label className="mt-4 col-lg-4">
                                <Form.Control
                                    style={{ width: "45%" }}
                                    type="text"
                                    id="standard-basic"
                                    name="documentName"
                                    value={x.documentOriginalName}
                                    disabled
                                    label="Document name"
                                />
                            </Form.Label>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexDirection: "column",
                                }}
                                className="mt-4 col-lg-2"
                            >
                                <input
                                    id={"contained-button-file" + i.toString()}
                                    single
                                    name="document"
                                    type="file"
                                    disabled={!!x.documentName}
                                    onChange={(e) => handleAddDoc(e, i)}
                                    style={{ display: "none" }}
                                />
                                <label htmlFor={"contained-button-file" + i.toString()} style={{ marginBottom: 0 }}>
                                    <Button
                                        component="span"
                                        color="white"
                                        className="w-auto"
                                        disabled
                                        style={{ backgroundColor: !x.documentName ? "blue" : "lightblue", color: "white" }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faCamera}
                                            style={{
                                                cursor: "pointer",
                                            }}
                                        />
                                    </Button>
                                </label>
                            </div>

                            <div style={{ display: "flex", alignItems: "center" }} className="mt-2 col-lg-2">
                                {documentList.length !== 1 && (
                                    <Button
                                        onClick={() => handleRemoveDocumentList(i)}
                                        className="w-auto mr10"
                                        style={{ marginLeft: "5px", backgroundColor: "lightpink", color: "white" }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faMinus}
                                            style={{
                                                cursor: "pointer",
                                            }}
                                        />
                                    </Button>
                                )}
                                {documentList.length - 1 === i && (
                                    <Button
                                        style={{ marginLeft: "5px", backgroundColor: "#5959FF", color: "white" }}
                                        className="w-auto"
                                        onClick={handleAddDocumentList}
                                    >
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            style={{
                                                cursor: "pointer",
                                            }}
                                        />
                                    </Button>
                                )}
                            </div>
                        </Form>
                    );
                })}
            </Card>
            <div className="d-flex justify-content-end">
                <Button className="mt-3 w-auto" onClick={requestReview} disabled={!requestBtnEnable}>
                    Request Review
                </Button>
            </div>
        </Row>
    );
};
