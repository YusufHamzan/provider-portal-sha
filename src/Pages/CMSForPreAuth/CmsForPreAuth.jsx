import React, { useState, useEffect, useRef, useCallback } from "react";
import "./styles.css";
import { Container, Row, Col, Form, Card, Button, Spinner } from "react-bootstrap";
import { CmsPreAuthDetails, CmsTotalCaseDetails, CmsStatusWiseDetails } from "../../API/cmsForCashless";
import { getResultFromData, getCapitallisedFromCamelCase } from "../../utils/utils";
import BootstrapTable from "react-bootstrap-table-next";
import BackGround from "../../assets/backgroungWorking.gif";
import moment from "moment";
import _ from "lodash";
import Paginator from "../../Components/Paginator/Paginator";
import TotalClaims from "../../assets/download.png";
import Approved from "../../assets/approved.png";
import Rejected from "../../assets/rejected.png";
import Cancelled from "../../assets/cancelled.png";
import Document from "../../assets/document.png";
import cogoToast from "cogo-toast";
import { useImmer } from "use-immer";
import { faRegistered } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AsyncSelect from "react-select/async";
import CustomVirtualList from "../SubmitClaim/VirtualList";
import axios from "axios";
import { decideENV } from "../../decideENV";
import { getPreAuthList } from "../../API/cmsForPreauth";

const CmsForPreAuth = () => {
    const [userDetails] = useState(JSON.parse(localStorage.getItem("memberDetails")));

    const [tab, setTab] = useState("total");

    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [tableData, setTableData] = useState();
    const [tableHeaders, setTableHeaders] = useState([
        { dataField: "memberShipNo", text: "Membership No.", sort: false },
        { dataField: "name", text: "Name", sort: false },
        { dataField: "preAuthType", text: "Type", sort: false },
        { dataField: "policyNumber", text: "Policy No.", sort: false },
        { dataField: "admissionDate", text: "Admission Date", sort: false },
        { dataField: "dischargeDate", text: "Discharge Date", sort: false },
        { dataField: "preAuthStatus", text: "Status", sort: false },
    ]);
    // const [trigger, setTrigger] = useState();
    const [apiMasterData, setAPIMasterData] = useState();
    const [active, setActive] = useImmer({
        total: 1,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        document: 0,
        registered: 0,
        enhancement: 0,
    });

    const [countData, setCountData] = useState({
        total: null,
        approved: null,
        rejected: null,
        cancelled: null,
        document: null,
        registered: null,
        enhancement: null,
    });
    const [paginatorOptions, setPaginatorOptions] = useImmer({
        total: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        approved: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        rejected: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        cancelled: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        document: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        registered: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        enhancement: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
    });
    const dataFetched = useRef(false);
    const [proposerName, setProposerName] = useState([]);

    const controllerRef = useRef();

    const [MemberName, setMemberName] = useState(null);
    const [preAuthNo, setPreAuthNo] = useState(null);

    /**
     * @function to get count data in dashboard
     */
    const getAPICountData = async () => {
        const payLoad = preparePayLoad("count");
        const dataCMS = await CmsPreAuthDetails(payLoad);
        if (dataCMS.ok) {
            const {
                totalPreAuth,
                totalPreAuthApproved,
                totalPreAuthRejected,
                totalPreAuthCancel,
                totalDocumentRequired,
                totalPreAuthRegister,
                totalPreAuthEnhancement,
            } = getResultFromData(dataCMS);
            setCountData({
                total: totalPreAuth,
                approved: totalPreAuthApproved,
                rejected: totalPreAuthRejected,
                cancelled: totalPreAuthCancel,
                document: totalDocumentRequired,
                registered: totalPreAuthRegister,
                enhancement: totalPreAuthEnhancement,
            });

            setPaginatorOptions((data) => {
                data.total.totalRecords = totalPreAuth;
                data.approved.totalRecords = totalPreAuthApproved;
                data.rejected.totalRecords = totalPreAuthRejected;
                data.cancelled.totalRecords = totalPreAuthCancel;
                data.document.totalRecords = totalDocumentRequired;
                data.registered.totalRecords = totalPreAuthRegister;
                data.enhancement.totalRecords = totalPreAuthEnhancement;
            });
        }
    };

    /**
     * @function to get table data in dashboard
     */
    const getAPIData = async (context) => {
        const payLoadTotal = preparePayLoad("total");
        const payLoadApproved = preparePayLoad("status", "S");
        const payLoadRejected = preparePayLoad("status", "R");
        const payLoadCancelled = preparePayLoad("status", "X");
        const payLoadAddDoc = preparePayLoad("status", "D");
        const payLoadRegistered = preparePayLoad("status", "N");
        const payLoadEnhancement = preparePayLoad("status", "E");

        switch (context) {
            case "total": {
                const result = await CmsTotalCaseDetails(payLoadTotal, "total");
                if (result.ok) {
                    setAPIMasterData((data) => ({
                        ...data,
                        total: getResultFromData(result),
                    }));
                    if (result.data.data.totalRecords) {
                        setCountData((data) => ({
                            ...data,
                            total: result.data.data.totalRecords,
                        }));
                        setPaginatorOptions((data) => {
                            data[tab].totalRecords = result.data.data.totalRecords;
                        });
                    }
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            case "approved": {
                const result = await CmsStatusWiseDetails(payLoadApproved, "approved");
                if (result.ok) {
                    setAPIMasterData((data) => ({
                        ...data,
                        approved: getResultFromData(result),
                    }));
                    if (result.data.data.totalRecords) {
                        setCountData((data) => ({
                            ...data,
                            approved: result.data.data.totalRecords,
                        }));
                        setPaginatorOptions((data) => {
                            data[tab].totalRecords = result.data.data.totalRecords;
                        });
                    }
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            case "rejected": {
                const result = await CmsStatusWiseDetails(payLoadRejected, "rejected");
                if (result.ok) {
                    setAPIMasterData((data) => ({
                        ...data,
                        rejected: getResultFromData(result),
                    }));
                    if (result.data.data.totalRecords) {
                        setCountData((data) => ({
                            ...data,
                            rejected: result.data.data.totalRecords,
                        }));
                        setPaginatorOptions((data) => {
                            data[tab].totalRecords = result.data.data.totalRecords;
                        });
                    }
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            case "cancelled": {
                const result = await CmsStatusWiseDetails(payLoadCancelled, "cancelled");
                if (result.ok) {
                    setAPIMasterData((data) => ({
                        ...data,
                        cancelled: getResultFromData(result),
                    }));
                    if (result.data.data.totalRecords) {
                        setCountData((data) => ({
                            ...data,
                            cancelled: result.data.data.totalRecords,
                        }));
                        setPaginatorOptions((data) => {
                            data[tab].totalRecords = result.data.data.totalRecords;
                        });
                    }
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            case "document": {
                const result = await CmsStatusWiseDetails(payLoadAddDoc, "document");
                if (result.ok) {
                    setAPIMasterData((data) => ({
                        ...data,
                        document: getResultFromData(result),
                    }));
                    if (result.data.data.totalRecords) {
                        setCountData((data) => ({
                            ...data,
                            document: result.data.data.totalRecords,
                        }));
                        setPaginatorOptions((data) => {
                            data[tab].totalRecords = result.data.data.totalRecords;
                        });
                    }
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            default: {
                const data = await Promise.all([
                    CmsTotalCaseDetails(payLoadTotal, "total"),
                    CmsStatusWiseDetails(payLoadApproved, "approved"),
                    CmsStatusWiseDetails(payLoadRejected, "rejected"),
                    CmsStatusWiseDetails(payLoadCancelled, "cancelled"),
                    CmsStatusWiseDetails(payLoadAddDoc, "document"),
                    CmsStatusWiseDetails(payLoadRegistered, "registered"),
                    CmsStatusWiseDetails(payLoadEnhancement, "enhancement"),
                ]);
                const resultFromData = data.map((item) => {
                    if (item.ok) {
                        return { [item.name]: getResultFromData(item) };
                    } else {
                        return item;
                    }
                });

                setAPIMasterData(resultFromData.reduce((acc, item) => ({ ...acc, ...item }), {}));
            }
        }
    };

    /**
     * @function to prepare generalized payLoad
     */
    const preparePayLoad = (context, claimStatus) => {
        const { sub } = userDetails;
        switch (context) {
            case "count": {
                return {
                    providerID: sub,
                    tokenID: localStorage.getItem("token"),
                    userID: sub,
                    dateFrom: fromDate ? moment(fromDate).format("DD/MM/YYYY") : null,
                    dateUpto: toDate ? moment(toDate).format("DD/MM/YYYY") : null,
                    memberName: MemberName || null,
                    proposerId: proposerName?.value || null,
                    preAuthNo: preAuthNo || null,
                };
            }
            case "total": {
                return {
                    providerID: sub,
                    tokenID: localStorage.getItem("token"),
                    userID: sub,
                    dateFrom: fromDate ? moment(fromDate).format("DD/MM/YYYY") : null,
                    dateUpto: toDate ? moment(toDate).format("DD/MM/YYYY") : null,
                    pageSize: paginatorOptions[tab].pageSize,
                    pageNo: paginatorOptions[tab].page,
                    memberName: MemberName || null,
                    proposerId: proposerName?.value || null,
                    preAuthNo: preAuthNo || null,
                };
            }
            case "status": {
                return {
                    providerID: sub,
                    tokenID: localStorage.getItem("token"),
                    userID: sub,
                    dateFrom: fromDate ? moment(fromDate).format("DD/MM/YYYY") : null,
                    dateUpto: toDate ? moment(toDate).format("DD/MM/YYYY") : null,
                    pageSize: paginatorOptions[tab].pageSize,
                    pageNo: paginatorOptions[tab].page,
                    claimStatus: claimStatus,
                    memberName: MemberName || null,
                    proposerId: proposerName?.value || null,
                    preAuthNo: preAuthNo || null,
                };
            }
            default: {
                return null;
            }
        }
    };

    /**\
     * @function to prepare table headers and data
     */
    const prepareTableData = async (tab) => {
        const result = await getPreAuthList();
        const { content } = result?.data?.data || {};

        const counts = content.reduce(
            (acc, el) => {
                if (el?.preAuthStatus === "APPROVED") {
                    acc.approved += 1;
                }
                if (el?.preAuthStatus === "REJECTED") {
                    acc.rejected += 1;
                }
                if (el?.preAuthStatus === "CANCELLED") {
                    acc.cancelled += 1;
                }
                if (el?.documents?.length) {
                    acc.document += 1;
                }
                return acc;
            },
            { approved: 0, rejected: 0, document: 0, cancelled: 0 }
        );

        const temp = content.filter((ele) => ele.providers?.some((provider) => provider?.providerId === "1214471214180458496"));
        setTableData(temp);

        setCountData({
            ...countData,
            total: temp.length,
            approved: counts.approved,
            rejected: counts.rejected,
            cancelled: counts.cancelled,
            document: counts.document,
            registered: 0,
            enhancement: 0,
        });
    };

    // const prepareTableData = (tab) => {
    //     const tabData = apiMasterData?.[tab];
    //     if (tabData) {
    //         tabData.forEach((item) => {
    //             delete item.providerID;
    //             delete item.insurer;
    //         });
    //         setTableHeaders(
    //             Object.keys(tabData[0])
    //                 ?.filter((data) => !(data in { insurarName: true, claimID: true, policyNo: true }))
    //                 .map((data) => {
    //                     return {
    //                         dataField: _.camelCase(data),
    //                         text: getCapitallisedFromCamelCase(data),
    //                         sort: false,
    //                     };
    //                 })
    //         );
    //         setTableData(tabData);
    //     } else {
    //         setTableData([]);
    //         setTableHeaders([]);
    //     }
    // };

    const filterTableData = () => {
        if (fromDate === undefined && toDate === undefined && proposerName.length === 0 && MemberName === null && proposerName === null) {
            cogoToast.info("Please provide search criteria");
            return;
        } else {
            setCountData({
                total: null,
                approved: null,
                rejected: null,
                cancelled: null,
                document: null,
                registered: null,
                enhancement: null,
            });
            setTableHeaders([]);
            getAPIData();
            getAPICountData();
        }
    };

    const changePage = (idx) => {
        setPaginatorOptions((data) => {
            data[tab].page = idx;
        });
    };

    const handleActive = (tab) => {
        setActive((activeOptions) => {
            for (let i in activeOptions) {
                if (i === tab) {
                    activeOptions[tab] = 1;
                } else {
                    activeOptions[i] = 0;
                }
            }
        });
    };

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

    const handleChange = (change) => {
        setProposerName(change);
    };

    const customStyles = {
        menuList: (provided, state) => ({
            ...provided,
            marginBottom: 10,
        }),
        control: (baseStyles, state) => ({
            ...baseStyles,
            fontSize: "0.8rem",
            height: "34px",
            minHeight: "35px",
        }),
    };

    /**
     * Side Effects
     */
    useEffect(() => {
        // if (!_.isEmpty(apiMasterData)) {
        prepareTableData(tab);
        // }
        // setFromDate(undefined);
        // setToDate(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // }, [tab, apiMasterData]);

    useEffect(() => {
        if (!dataFetched.current) {
            getAPICountData();
            getAPIData();
            dataFetched.current = true;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getAPIData(tab);
    }, [paginatorOptions[tab].page]);

    /**New Section ammendment ended */
    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={10}>
                        {/* <h5>CMS FOR PREAUTH</h5> */}
                        <h5>Central Monitoring System for Preauth</h5>
                    </Col>
                    {/* <Col md={2} className="text-muted">
            <h6>Dashboard / CMS For Preauth</h6>
          </Col> */}
                </Row>
                {/* New Section */}
                <Row className="mt-3" style={{ marginRight: "-1.5rem" }}>
                    <Row style={{ paddingRight: "0" }}>
                        <Col>
                            <Card
                                className={`shadow border-${active.total} card__size`}
                                onClick={() => {
                                    setTab("total");
                                    handleActive("total");
                                }}
                            >
                                <Card.Body>
                                    <p>Total</p>
                                    {/* <h5>{tableData?.length ? tableData.length : 0}</h5> */}
                                    <h5>{countData.total?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="claim">
                                        <img src={TotalClaims} alt="" className="totalclaim__avatar" style={{ height: "1.5rem", width: "1.5rem" }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                className={`shadow border-${active.registered} card__size`}
                                onClick={() => {
                                    setTab("registered");
                                    handleActive("registered");
                                }}
                            >
                                <Card.Body>
                                    <p>Registered</p>
                                    {/* <h5>{countData.registered?.toString() ? countData?.registered : 0}</h5> */}
                                    <h5>{countData.registered?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="documentation">
                                        <FontAwesomeIcon
                                            icon={faRegistered}
                                            className="patient__avatar"
                                            style={{ height: "2.3rem", width: "2.3rem" }}
                                        />
                                        {/* <FontAwesomeIcon icon={faFilePdf} style={{ height: "2rem", width: "2rem" }} /> */}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                className={`shadow border-${active.approved} card__size`}
                                onClick={() => {
                                    setTab("approved");
                                    handleActive("approved");
                                }}
                            >
                                <Card.Body>
                                    <p>Approved</p>
                                    <h5>{countData.approved?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="patient">
                                        <img src={Approved} alt="" className="patient__avatar" style={{ height: "2.5rem", width: "2.5rem" }} />
                                        {/* <FontAwesomeIcon icon={icon} className="patient__avatar" style={{ height: "2.5rem", width: "  2.5rem" }} /> */}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                className={`shadow border-${active.rejected} card__size`}
                                onClick={() => {
                                    setTab("rejected");
                                    handleActive("rejected");
                                }}
                            >
                                <Card.Body>
                                    <p>Rejected</p>
                                    <h5>{countData.rejected?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="sanction">
                                        <img src={Rejected} alt="" className="sanction__avatar" style={{ height: "2rem", width: "2rem" }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                className={`shadow border-${active.cancelled} card__size`}
                                onClick={() => {
                                    setTab("cancelled");
                                    handleActive("cancelled");
                                }}
                            >
                                <Card.Body>
                                    <p>Cancelled</p>
                                    <h5>{countData.cancelled?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="cancelled">
                                        <img src={Cancelled} alt="" className="documentation__avatar" style={{ height: "2rem", width: "2rem" }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                className={`shadow border-${active.document} card__size`}
                                onClick={() => {
                                    setTab("document");
                                    handleActive("document");
                                }}
                            >
                                <Card.Body>
                                    <p>Documents</p>
                                    <h5>{countData.document?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="documentation">
                                        <img src={Document} alt="" className="documentation__avatar" style={{ height: "2rem", width: "2rem" }} />
                                        {/* <FontAwesomeIcon icon={faFilePdf} style={{ height: "2rem", width: "2rem" }} /> */}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col>
                            <Card
                                className={`shadow border-${active.enhancement} card__size`}
                                onClick={() => {
                                    setTab("enhancement");
                                    handleActive("enhancement");
                                }}
                            >
                                <Card.Body>
                                    <p>Enhancement</p>
                                    <h5>{countData.enhancement?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="documentation">
                                        <img src={Document} alt="" className="documentation__avatar" style={{ height: "2rem", width: "2rem" }} />
                                        {/* <FontAwesomeIcon icon={faFilePdf} style={{ height: "2rem", width: "2rem" }} /> */}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Row>
                {/* New Section ends */}
                <Row className="mt-3">
                    <Col md={12}>
                        <Card className="border-0 shadow">
                            <Card.Body>
                                {/* <Card.Title>Central Monitoring System for Preauth</Card.Title> */}
                                <Form>
                                    <Form.Label>Search By</Form.Label>
                                    <Row className="date__row">
                                        <Col md={1} style={{ width: "10rem" }}>
                                            <Form.Group className="mb-3" controlId="formBasicFrom">
                                                <Form.Control
                                                    style={{ fontSize: "0.8rem" }}
                                                    type="date"
                                                    placeholder="Enter Date"
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        To
                                        <Col md={1} style={{ width: "10rem" }}>
                                            <Form.Group className="mb-3" controlId="formBasicTo">
                                                <Form.Control
                                                    style={{ fontSize: "0.8rem" }}
                                                    type="date"
                                                    placeholder="Enter Date"
                                                    onChange={(e) => setToDate(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        |
                                        <Col md={5}>
                                            <AsyncSelect
                                                menuPlacement="bottom"
                                                key={`__asyncSelect${Math.random() * 10}`}
                                                cacheOptions
                                                styles={customStyles}
                                                isMulti={false}
                                                isClearable={true}
                                                noOptionsMessage={() => "No results to display"}
                                                onChange={handleChange}
                                                value={proposerName}
                                                loadOptions={debouncedSearch}
                                                placeholder="Search Proposer"
                                                components={{ MenuList: CustomVirtualList }}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </Col>
                                        <Col md={1} style={{ width: "10rem" }}>
                                            <Form.Group className="mb-3" controlId="formBasicTo">
                                                <Form.Control
                                                    type="text"
                                                    style={{ fontSize: "0.8rem" }}
                                                    placeholder=" Preauth Number"
                                                    onChange={({ target: { value: PreAuthNumber } }) => setPreAuthNo(PreAuthNumber)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={1} style={{ width: "10rem" }}>
                                            <Form.Group className="mb-3" controlId="formBasicTo">
                                                <Form.Control
                                                    type="text"
                                                    style={{ fontSize: "0.8rem" }}
                                                    placeholder=" Member Name"
                                                    onChange={({ target: { value: MemberName } }) => setMemberName(MemberName)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={1}>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="button__Search searchBtn"
                                                onClick={filterTableData /*setTrigger(Math.random())*/}
                                            >
                                                Search
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                                {/* {tableHeaders?.length ? <BootstrapTable bootstrap4={true} keyField="id" data={tableData} columns={tableHeaders} bordered={false} /> : <div style={{ display: "grid", placeContent: "center", padding: "10%" }}>{noDataFound === undefined ? <h3>Please Search</h3> : noDataFound === true ? <h1>No Data Found</h1> : <img src={BackGround} alt="" />}</div>}
                {paginatorOptions?.totalPages ? <Paginator totalPages={paginatorOptions.totalPages} changePage={changePage} /> : null} */}

                                {/* New section of table and paginator */}
                                {tableData?.length > 0 ? (
                                    <div style={{ width: "100%", overflowX: "auto" }}>
                                        <BootstrapTable
                                            bootstrap4={true}
                                            keyField="ID"
                                            // keyField="Sr. No"
                                            data={tableData}
                                            columns={tableHeaders}
                                            bordered={false}
                                        />
                                    </div>
                                ) : tableData?.length === 0 ? (
                                    <h1 style={{ padding: "10%", textAlign: "center" }}>No Data Found</h1>
                                ) : (
                                    <div
                                        style={{
                                            display: "grid",
                                            placeContent: "center",
                                            padding: "10%",
                                            transform: "scale(0.5)",
                                        }}
                                    >
                                        <img src={BackGround} alt="" />
                                    </div>
                                )}
                                {paginatorOptions[tab] ? (
                                    <Paginator totalPages={Math.ceil(paginatorOptions[tab]?.totalRecords / 10) || 1} changePage={changePage} />
                                ) : null}
                                {/* New section ends  */}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CmsForPreAuth;
