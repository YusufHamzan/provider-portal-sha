import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import cogoToast from "cogo-toast";
import { useImmer } from "use-immer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faCamera } from "@fortawesome/free-solid-svg-icons";
import { getResultFromData } from "../../utils/utils";
import { getClaimDropDownvalues, saveClaim } from "../../API/submitClaim";
import moment from "moment";

import _ from "../../deepdash";
import ReactSelect from "react-select";
import { getBenefits, getCurrencies, getDiagnosis, getPreAuthDetailsFromMemberNo, getServicetypes } from "../../API/masterData";
import InvoiceDetailsModal from "./invoiceDetailsModal";
import InvoiceForm from "./invoiceForm";

const masterProxy = {
    1: {
        memberno: "",
        provider: JSON.parse(localStorage.getItem("memberDetails"))?.sub || '',
        servicetype: "",
        claimtype: "",
        checkindate: undefined /*Date.now()*/,
        checkoutdate: undefined /*Date.now()*/,
        serviceamount: "",
        icd: [],
        policycode: "",
        membername: "",
        policyperiod: "",
        firstenrollmentdate: "",
        productcurrency: "",
        countrycode: "",
        familycode: "",
    },
    2: {
        0: {
            invoicenumber: "",
            invoicedate: "",
            invoiceamount: "",
            items: [],
        },
    },
    3: undefined,

    4: {
        uploadedFiles: [],
    },
};

const SubmitClaim = () => {
    const [formData, setFormData] = useImmer({});
    const [benefits, setBenefits] = React.useState([]);
    const [serviceTypes, setServiceTypes] = React.useState([]);
    const [diagnosis, setDiagnosis] = React.useState([]);
    const [currencyList, setCurrencyList] = React.useState([]);
    const [invoiceDetailsList, setInvoiceDetailsList] = React.useState([
        {
            provideId: "",
            invoiceNo: "",
            invoiceDate: 0,
            invoiceDateVal: new Date(),
            invoiceAmount: 0,
            currency: "",
            exchangeRate: 0,
            invoiceAmountKES: 0,
            transactionNo: "",
            payee: "",
            invoiceItems: [
                {
                    serviceType: "",
                    expenseHead: "",
                    rateKes: 0,
                    unit: 0,
                    totalKes: 0,
                    finalTotal: 0,
                },
            ],
        },
    ]);
    const [data, setData] = React.useState({
        expectedDOA: "",
        expectedDOD: "",
        contactNoOne: "",
        contactNoTwo: "",
        dayCare: "",
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
    const [step, setStep] = useState(1);
    const [masterData, setMasterData] = useState(masterProxy);
    const [memberNo, setMemberNo] = useState(1);
    const [timeStamp, setTimeStamp] = useImmer({
        checkindate: { hours: "", mins: "" },
        checkoutdate: { hours: "", mins: "" },
    });

    const getDetailsFromMemberNo = async () => {
        const result = await getPreAuthDetailsFromMemberNo(memberNo);
        // result?.data?.data?.content[0]
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

    const getCurrencyList = async () => {
        const result = await getCurrencies();
        setCurrencyList(result?.data?.data?.content);
    };

    const getServiceTypes = async () => {
        const result = await getServicetypes();
        setServiceTypes(result?.data?.data?.content);
    };

    useEffect(() => {
        getBenefit();
        getCurrencyList();
        getServiceTypes();
    }, []);

    useEffect(() => {
        getDetailsFromMemberNo();
    }, [memberNo]);

    const updateForm = (field, value) => {
        switch (step) {
            case 1: {
                if (field !== "icd") {
                    setMasterData((md) => ({
                        ...md,
                        [step]: { ...md[step], [field]: value },
                    }));
                } else {
                    setMasterData((md) => ({
                        ...md,
                        [step]: {
                            ...md[step],
                            [field]: [
                                ...md[step][field],
                                ...value.map((data) => ({
                                    diseaseICDCode: data.value,
                                    diseaseName: data.label,
                                })),
                            ],
                        },
                    }));
                }
                break;
            }
            case 2: {
                setMasterData((md) => ({ ...md, [step]: field }));
                break;
            }
            default: {
                console.log("Invalid step");
            }
        }
    };

    const saveData = async (payload) => {
        let result = await saveClaim(payload);
        if (result?.ok) {
            localStorage.setItem("claimreimid", result?.data?.data?.id);
            setStep(2);
        }
    };

    const proceedToNextStep = (e) => {
        const { id } = e.target;
        let diagnosisIds = diagnosis?.map((ele) => ele?.value) || [];

        let payload = {
            policyNumber: formData?.policyNumber,
            memberShipNo: memberNo,
            expectedDOA: new Date(data?.expectedDOA).getTime(),
            expectedDOD: new Date(data?.expectedDOD).getTime(),
            receiveDate: new Date(data?.receiveDate).getTime(),
            serviceDate: new Date(data?.serviceDate).getTime(),
            diagnosis: diagnosisIds,
            contactNoOne: data?.mobileNo,
            contactNoTwo: data?.contactNoTwo,
            daycare: data?.dayCare,
            benefitsWithCost: benefitsWithCost,
            invoices: invoiceDetailsList,
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

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={10}>
                        <h5>Claim Registration</h5>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Card className="border-0">
                            <Card.Body>
                                {/* <Card.Title>Request for Cashless</Card.Title> */}
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
                                        update={updateForm}
                                        existingData={formData}
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
                                        currencies={currencyList}
                                        setInvoiceDetailsList={setInvoiceDetailsList}
                                        invoiceDetailsList={invoiceDetailsList}
                                    />
                                </div>
                                <div style={{ display: step === 2 ? "block" : "none" }}>
                                    <Step2
                                        update={updateForm}
                                        existingData={masterData[2]}
                                        appendField={setMasterData}
                                        setTimeStamp={setTimeStamp}
                                        claimAmount={masterData[1].serviceamount}
                                    />
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
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

const Step1 = ({
    existingData,
    updateValues = () => {},
    setTimeStamp = () => {},
    setMemberNo,
    benefits,
    serviceTypes,
    benefitsWithCost,
    setBenefitsWithCost,
    data,
    setData,
    setDiagnosis,
    currencies,
    invoiceDetailsList,
    setInvoiceDetailsList,
}) => {
    const [userDetails] = useState(JSON.parse(sessionStorage.getItem("user")));
    const [serviceTypeValues, setServiceTypeValues] = useState([]);
    const [benefitOptions, setBenefitOptions] = React.useState([]);
    const [currencyOptions, setCurrencyOptions] = React.useState([]);
    const [serviceTypesOptions, setServiceTypesOptions] = React.useState([]);
    const [selectedBenefit, setSelectedBenefit] = React.useState([]);
    const [isInvoiceDetailModal, setInvoiceDetailModal] = React.useState(false);
    const [selectedInvoiceItems, setSelectedInvoiceItems] = React.useState([]);
    const [selectedInvoiceItemIndex, setSelectedInvoiceItemIndex] = React.useState(0);
    const [diagnosisList, setDiagnosisList] = React.useState([]);

    const payeeOption = [
        { value: "Provider", label: "Provider" },
        { value: "Member", label: "Member" },
        { value: "Intermediaries", label: "Intermediaries" },
        { value: "Corporate", label: "Corporate" },
    ];

    const treatmentDepartmentOption = [
        { value: "IPD", label: "IPD" },
        { value: "OPD", label: "OPD" },
    ];

    const firstRender = useRef(true);

    const [memberNumber, setMemberNumber] = useState("");

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
    };

    const getDiagnosisoption = async () => {
        const result = await getDiagnosis();
        let temp = [];
        result?.data?.data?.content?.forEach((ele) => {
            let obj = {
                label: ele.code + " | " + ele.name,
                name: ele.code + " | " + ele.name,
                value: ele.id,
                id: ele.id,
            };
            temp.push(obj);
        });
        setDiagnosisList(temp);
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
        let X = currencies?.forEach((ele) => {
            let obj = {
                label: ele.name,
                name: ele.name,
                value: ele.id,
            };
            temp.push(obj);
        });
        setCurrencyOptions(temp);
    }, [currencies]);

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

    const handleRemoveServicedetails = (index) => {
        const list = [...invoiceDetailsList];
        list.splice(index, 1);
        setInvoiceDetailsList(list);
    };

    const handleAddServicedetails = () => {
        setInvoiceDetailsList([
            ...invoiceDetailsList,
            {
                provideId: "",
                invoiceNo: "",
                invoiceDate: 0,
                invoiceDateVal: new Date(),
                invoiceAmount: 0,
                currency: "",
                exchangeRate: 0,
                invoiceAmountKES: 0,
                transactionNo: "",
                payee: "",
                invoiceItems: [
                    {
                        serviceType: "",
                        expenseHead: "",
                        rateKes: 0,
                        unit: 0,
                        totalKes: 0,
                        finalTotal: 0,
                    },
                ],
            },
        ]);
    };

    const handleAddInvoiceItems = (i) => {
        setSelectedInvoiceItems(invoiceDetailsList[i].invoiceItems);
        setSelectedInvoiceItemIndex(i);
        setInvoiceDetailModal(true);
    };

    const handleAddInvoiceItemRow = (i) => {
        const list = [...invoiceDetailsList];
        list[i].invoiceItems.push({
            serviceType: "",
            expenseHead: "",
            rate: 0,
            unit: 0,
            totalKes: 0,
            finalTotal: 0,
        });
        setInvoiceDetailsList(list);
    };

    const handleDeleteInvoiceItemRow = (i, j) => {
        const list = [...invoiceDetailsList];
        list[i].invoiceItems.splice(j, 1);
        setInvoiceDetailsList(list);
    };

    const changeInvoiceItems = (e, i, j) => {
        const { name, value } = e.target;
        const list = [...invoiceDetailsList];
        list[i].invoiceItems[j][name] = value;
        if (name === "unit" || name === "rateKes") {
            list[i].invoiceItems[j]["totalKes"] = Number(list[i].invoiceItems[j]["unit"]) * Number(list[i].invoiceItems[j]["rateKes"]);
        }
        setInvoiceDetailsList(list);
    };
    const handleInvDetClose = () => {
        setInvoiceDetailModal(false);
        setSelectedInvoiceItems([]);
        setSelectedInvoiceItemIndex(0);
    };

    const handleInputChangeService = (e, index) => {
        const { name, value } = e.target;
        const list = [...invoiceDetailsList];
        list[index][name] = value;
        if (name === "invoiceAmount" || name === "exchangeRate") {
            list[index]["invoiceAmountKES"] = Number(list[index]["invoiceAmount"]) * Number(list[index]["exchangeRate"]);
        }
        setInvoiceDetailsList(list);
    };

    const handleCurrencyChangeService = (e, index) => {
        const { value } = e;
        const list = [...invoiceDetailsList];
        list[index].currency = value;
        setInvoiceDetailsList(list);
    };

    const handlePayeeChangeService = (e, index) => {
        const { value } = e;
        const list = [...invoiceDetailsList];
        list[index].payee = value;
        setInvoiceDetailsList(list);
    };

    const handleInvoiceDate = (date, i) => {
        const list = [...invoiceDetailsList];
        const timestamp = new Date(date.target.value).getTime();
        list[i]["invoiceDate"] = timestamp;

        setInvoiceDetailsList(list);
    };

    return (
        <main>
            <Row>
                <Card className="mt-3 border-0">
                    <Form className="form">
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Member No. <span className="mandate_field">*</span>
                            <Form.Control
                                // onKeyDown={check}
                                required
                                type="text"
                                placeholder="Enter Member No."
                                defaultValue={existingData?.memberNumber ?? memberNumber}
                                maxLength={25}
                                onChange={(e) => {
                                    setMemberNumber(e.target.value);
                                    // setMemberNo(e.target.value)
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
                        </Form.Label>
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
                        <Form.Label className="mt-4 col-lg-5">
                            Treatment Department
                            <ReactSelect options={treatmentDepartmentOption} onChange={(e) => setDiagnosis(e)} />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5"></Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Recieve Date
                            <Form.Control
                                required
                                value={existingData?.recieveDate ?? data?.recieveDate}
                                type="date"
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        receiveDate: e.target.value,
                                    }));
                                }}
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            Service Date
                            <Form.Control
                                required
                                value={data?.serviceDate}
                                type="date"
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        serviceDate: e.target.value,
                                    }));
                                }}
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5" style={{ maxHeight: "62px" }}>
                            DOA
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
                            DOD
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
                        <Form.Label className="mt-4 col-lg-5">
                            Diagnosis
                            <ReactSelect options={diagnosisList} isMulti onChange={(e) => setDiagnosis(e)} />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-5 d-flex align-items-center justify-content-start" style={{ maxHeight: "62px" }}>
                            <input
                                class="form-check-input"
                                type="checkbox"
                                value={data?.dayCare}
                                id="flexCheckDefault"
                                className="me-2"
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        dayCare: e.target.checked,
                                    }));
                                }}
                            />
                            Daycare
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
                        <div className="w-100 bg-secondary mt-4" style={{ height: "1px", opacity: "0.3" }} />
                        <h5 className="mt-5">Invoice Details</h5>
                        <div className="w-100 bg-secondary" style={{ height: "1px", opacity: "0.7" }} />

                        <InvoiceForm
                            invoiceDetailsList={invoiceDetailsList}
                            handleInputChangeService={handleInputChangeService}
                            currencyOptions={currencyOptions}
                            handleInvoiceDate={handleInvoiceDate}
                            payeeOption={payeeOption}
                            handleRemoveServicedetails={handleRemoveServicedetails}
                            handleAddServicedetails={handleAddServicedetails}
                            handleAddInvoiceItems={handleAddInvoiceItems}
                            handleCurrencyChangeService={handleCurrencyChangeService}
                            handlePayeeChangeService={handlePayeeChangeService}
                        />
                    </Form>
                </Card>
            </Row>
            <InvoiceDetailsModal
                isOpen={isInvoiceDetailModal}
                handleDeleteInvoiceItemRow={handleDeleteInvoiceItemRow}
                handleAddInvoiceItemRow={handleAddInvoiceItemRow}
                selectedInvoiceItems={selectedInvoiceItems}
                selectedInvoiceItemIndex={selectedInvoiceItemIndex}
                changeInvoiceItems={changeInvoiceItems}
                onClose={handleInvDetClose}
                onSubmit={handleInvDetClose}
            />
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
    let reimID = localStorage.getItem("claimreimid");

    const handleAddDoc = (e, index) => {
        const file = e.target["files"][0];

        const reader = new FileReader();

        reader.onload = function () {
            const list = [...documentList];
            list[index]["documentOriginalName"] = file.name;

            setDocumentList(list);

            const formData = new FormData();
            formData.append("docType", list[index]["documentType"]);
            formData.append("filePart", file);

            let result = uploadReimburseFiles(reimID, formData);
            result.then((res) => {
                if (res?.ok) {
                    cogoToast.success("Document uploaded successfully!.");
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
                                        // variant="contained"
                                        // color="primary"
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
        </Row>
    );
};

export default SubmitClaim;
