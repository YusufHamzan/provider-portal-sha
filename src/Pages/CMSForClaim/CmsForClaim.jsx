import React, { useState, useEffect, useRef, useCallback } from "react";
import "./styles.css";
import TotalClaims from "../../assets/download.png";
import { Container, Row, Col, Form, Button, Card, Spinner } from "react-bootstrap";
import { getResultFromData, getErrorResultFromData, getCapitallisedFromCamelCase } from "../../utils/utils";
import BootstrapTable from "react-bootstrap-table-next";
import moment from "moment";
import _ from "lodash";
import cogoToast from "cogo-toast";
import { CmsForClaimDetails, CmsForTotalClaimTypeDetails, CmsForTotalSubClaimTypeDetails, CmsForTotalRCCaseDetails } from "../../API/cmsForClaim";
// import Paginator from "../../Components/Paginator/Paginator";
import BackGround from "../../assets/backgroungWorking.gif";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faTooth, faEye, faStethoscope } from "@fortawesome/free-solid-svg-icons";
import { useImmer } from "use-immer";
import Paginator from "../../Components/Paginator/Paginator";
import AsyncSelect from "react-select/async";
import CustomVirtualList from "../SubmitClaim/VirtualList";
import { decideENV } from "../../decideENV";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

const CmsForClaim = () => {
    const [userDetails] = useState(JSON.parse(localStorage.getItem("memberDetails")));

    const [apiMasterData, setAPIMasterData] = useState();
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [tableData, setTableData] = useState();
    const [tableHeaders, setTableHeaders] = useState([]);
    const [tab, setTab] = useState("total");
    const [active, setActive] = useImmer({
        total: 1,
        IP: 0,
        OP: 0,
        TO: 0,
        EY: 0,
    });

    const [countData, setCountData] = useState({
        total: null,
        IP: null,
        OP: null,
        Dental: null,
        Optical: null,
    });

    const [paginatorOptions, setPaginatorOptions] = useImmer({
        total: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        IP: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        OP: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        TO: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        EY: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
    });
    const dataFetched = useRef(false);
    const [proposerName, setProposerName] = useState([]);
    const [MemberName, setMemberName] = useState(null);
    const controllerRef = useRef();

    const { logout } = useAuth();

    const getAPICountData = async (tabCount) => {
        const payLoad = preparePayLoad("count");
        const dataCMS = await CmsForClaimDetails(payLoad);
        if (dataCMS?.data?.data?.message !== "Invalid  token.") {
            if (dataCMS.ok) {
                const { totalRCCase, totalIPClaim, totalOPClaim, totalDental, totalOptical } = getResultFromData(dataCMS);
                setCountData({
                    total: totalRCCase,
                    IP: totalIPClaim,
                    OP: totalOPClaim,
                    Dental: totalDental,
                    Optical: totalOptical,
                });
                setPaginatorOptions((data) => {
                    data.total.totalRecords = totalRCCase;
                    data.IP.totalRecords = totalIPClaim;
                    data.OP.totalRecords = totalOPClaim;
                    data.TO.totalRecords = totalDental;
                    data.EY.totalRecords = totalOptical;
                });
            }
        } else {
            setCountData({
                total: 0,
                IP: 0,
                OP: 0,
                Dental: 0,
                Optical: 0,
            });
            setPaginatorOptions((data) => {
                data.total.totalRecords = undefined;
                data.IP.totalRecords = undefined;
                data.OP.totalRecords = undefined;
                data.TO.totalRecords = undefined;
                data.EY.totalRecords = undefined;
            });

            cogoToast.error(`${dataCMS?.data?.data?.message}. Logging out!`).then(logout);
        }
    };

    const getAPIData = async (tabContext) => {
        const payLoadTotal = preparePayLoad("total");
        const payLoadIP = preparePayLoad("claimType", "IP");
        const payLoadOP = preparePayLoad("claimType", "OP");
        const payLoadDental = preparePayLoad("subClaimType", "TO");
        const payLoadOptical = preparePayLoad("subClaimType", "EY");

        switch (tabContext) {
            case "total": {
                const data = await CmsForTotalRCCaseDetails(payLoadTotal, "total");
                if (data.ok) {
                    setAPIMasterData((val) => ({
                        ...val,
                        total: getResultFromData(data),
                    }));

                    setCountData((countData) => ({
                        ...countData,
                        total: data.data.data.totalRecords,
                    }));
                    setPaginatorOptions((paginatorData) => {
                        paginatorData[tab].totalRecords = data.data.data.totalRecords;
                    });
                    prepareTableData(tabContext);
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            case "IP": {
                const data = await CmsForTotalClaimTypeDetails(payLoadIP, "IP");
                if (data.ok) {
                    setCountData((countData) => ({
                        ...countData,
                        IP: data.data.data.totalRecords,
                    }));
                    setAPIMasterData((item) => ({
                        ...item,
                        IP: getResultFromData(data),
                    }));
                    prepareTableData(tabContext);
                    setPaginatorOptions((paginatorData) => {
                        paginatorData[tab].totalRecords = data.data.data.totalRecords;
                    });
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            case "OP": {
                const data = await CmsForTotalClaimTypeDetails(payLoadOP, "OP");
                if (data.ok) {
                    setCountData((countData) => ({
                        ...countData,
                        OP: data.data.data.totalRecords,
                    }));
                    setAPIMasterData((item) => ({
                        ...item,
                        OP: getResultFromData(data),
                    }));
                    prepareTableData(tabContext);
                    setPaginatorOptions((paginatorData) => {
                        paginatorData[tab].totalRecords = data.data.data.totalRecords;
                    });
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            case "TO": {
                const data = await CmsForTotalSubClaimTypeDetails(payLoadDental, "TO");
                if (data.ok) {
                    setCountData((countData) => ({
                        ...countData,
                        Dental: data.data.data.totalRecords,
                    }));
                    setAPIMasterData((item) => ({
                        ...item,
                        TO: getResultFromData(data),
                    }));
                    prepareTableData(tabContext);
                    setPaginatorOptions((paginatorData) => {
                        paginatorData[tab].totalRecords = data.data.data.totalRecords;
                    });
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            case "EY": {
                const data = await CmsForTotalSubClaimTypeDetails(payLoadDental, "EY");
                if (data.ok) {
                    setCountData((countData) => ({
                        ...countData,
                        Optical: data.data.data.totalRecords,
                    }));
                    setAPIMasterData((item) => ({
                        ...item,
                        EY: getResultFromData(data),
                    }));
                    prepareTableData(tabContext);
                    setPaginatorOptions((paginatorData) => {
                        paginatorData[tab].totalRecords = data.data.data.totalRecords;
                    });
                } else {
                    cogoToast.error("Something went wrong");
                }
                break;
            }
            case "all": {
                const data = await Promise.all([
                    CmsForTotalRCCaseDetails(payLoadTotal, "total"),
                    CmsForTotalClaimTypeDetails(payLoadIP, "IP"),
                    CmsForTotalClaimTypeDetails(payLoadOP, "OP"),
                    CmsForTotalSubClaimTypeDetails(payLoadDental, "TO"),
                    CmsForTotalSubClaimTypeDetails(payLoadOptical, "EY"),
                ]);
                const resultFromData = data.map((item) => {
                    if (item.ok) {
                        return { [item.name]: getResultFromData(item) };
                    } else {
                        return item;
                    }
                });

                setAPIMasterData(resultFromData.reduce((acc, item) => ({ ...acc, ...item }), {}));

                break;
            }
            default: {
                void 0;
            }
        }
    };

    const preparePayLoad = (context, contextType) => {
        const { sub } = userDetails;

        switch (context) {
            case "count": {
                return {
                    providerID: sub || '',
                    tokenID: localStorage.getItem("token"),
                    userID: sub || '',
                    dateFrom: fromDate === undefined || fromDate === "" ? null : moment(fromDate).format("DD/MM/YYYY"),
                    dateUpto: toDate === undefined || toDate === "" ? null : moment(toDate).format("DD/MM/YYYY"),
                    memberName: MemberName || null,
                    proposerId: proposerName?.value || null,
                };
            }
            case "total": {
                return {
                    providerID: sub || '',
                    tokenID: localStorage.getItem("token"),
                    userID: sub || '',
                    dateFrom: fromDate === undefined || fromDate === "" ? null : moment(fromDate).format("DD/MM/YYYY"),
                    dateUpto: toDate === undefined || toDate === "" ? null : moment(toDate).format("DD/MM/YYYY"),
                    pageSize: paginatorOptions[tab].pageSize,
                    pageNo: paginatorOptions[tab].page,
                    memberName: MemberName || null,
                    proposerId: proposerName?.value || null,
                };
            }
            case "claimType": {
                return {
                    providerID: sub || '',
                    tokenID: localStorage.getItem("token"),
                    userID: sub || '',
                    dateFrom: fromDate === undefined || fromDate === "" ? null : moment(fromDate).format("DD/MM/YYYY"),
                    dateUpto: toDate === undefined || toDate === "" ? null : moment(toDate).format("DD/MM/YYYY"),
                    pageSize: paginatorOptions[tab].pageSize,
                    pageNo: paginatorOptions[tab].page,
                    claimType: contextType,
                    memberName: MemberName || null,
                    proposerId: proposerName?.value || null,
                };
            }
            case "subClaimType": {
                return {
                    providerID: sub,
                    tokenID: localStorage.getItem("token"),
                    userID: sub,
                    dateFrom: fromDate === undefined || fromDate === "" ? null : moment(fromDate).format("DD/MM/YYYY"),
                    dateUpto: toDate === undefined || toDate === "" ? null : moment(toDate).format("DD/MM/YYYY"),
                    pageSize: paginatorOptions[tab].pageSize,
                    pageNo: paginatorOptions[tab].page,
                    subClaimType: contextType,
                    memberName: MemberName || null,
                    proposerId: proposerName?.value || null,
                };
            }

            default: {
                alert("hey default");
            }
        }
    };

    const prepareTableData = (tab) => {
        //Prepare rows and columns
        const tabData = apiMasterData?.[tab];
        /**preparation of table */
        if (tabData) {
            tabData.forEach((item) => {
                delete item.providerID;
                delete item.insurer;
            });
            setTableHeaders(
                Object.keys(tabData[0])
                    ?.filter((data) => !(data in { insurarName: true, claimID: true, policyNo: true }))
                    .map((data) => {
                        return {
                            dataField: _.camelCase(data),
                            text: getCapitallisedFromCamelCase(data),
                            sort: false,
                        };
                    })
            );
            setTableData(tabData);
        } else {
            setTableData([]);
            setTableHeaders([]);
        }
    };

    const filterTableData = async (tab) => {
        switch (tab) {
            case "total": {
                getAPIData("total");
                break;
            }
            case "IP": {
                getAPIData("IP");
                break;
            }
            case "OP": {
                getAPIData("OP");
                break;
            }
            case "TO": {
                getAPICountData("TO");
                break;
            }
            case "EY": {
                getAPIData("EY");
                break;
            }
            case "search": {
                if (fromDate === undefined && toDate === undefined && proposerName.length === 0 && MemberName === null) {
                    cogoToast.info("Please provide search criteria");
                    return;
                } else {
                    setCountData({
                        total: null,
                        IP: null,
                        OP: null,
                        Dental: null,
                        Optical: null,
                    });
                    setTableHeaders([]);

                    getAPIData("all");
                    getAPICountData();
                }
                break;
            }
            default: {
                void 0;
            }
        }
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

    function handleChange(change, action) {
        if (action.action === "clear" && change === null) {
            setProposerName([]);
        } else if (change !== null) {
            setProposerName(change);
        }
    }

    const customStyles = {
        menuList: (provided, state) => ({
            ...provided,
            marginBottom: 10,
        }),
    };

    /**
     * Side Effects
     */
    useEffect(() => {
        if (!_.isEmpty(apiMasterData)) {
            prepareTableData(tab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, apiMasterData]);

    useEffect(() => {
        if (dataFetched.current) {
            getAPIData(tab);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginatorOptions[tab].page]);

    useEffect(() => {
        if (!dataFetched.current) {
            getAPICountData();
            getAPIData("all");
            dataFetched.current = true;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={10}>
                        <h5>Central Monitoring System for Claim</h5>
                    </Col>
                    {/* <Col md={2} className="text-muted">
            <h6>Dashboard / CMS For Claim</h6>
          </Col> */}
                </Row>
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
                                    <h5>{countData.total?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="claim">
                                        <img src={TotalClaims} alt="" className="totalclaim__avatar" style={{ height: "1.5rem", width: "1.5rem" }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                className={`shadow border-${active.IP} card__size`}
                                onClick={() => {
                                    setTab("IP");
                                    handleActive("IP");
                                }}
                            >
                                <Card.Body>
                                    <p>IP</p>
                                    <h5>{countData.IP?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="patient">
                                        <FontAwesomeIcon icon={faBed} className="patient__avatar" style={{ height: "2.3rem", width: "2.3rem" }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                className={`shadow border-${active.OP} card__size`}
                                onClick={() => {
                                    setTab("OP");
                                    handleActive("OP");
                                }}
                            >
                                <Card.Body>
                                    <p>OP</p>
                                    <h5>{countData.OP?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="sanction">
                                        <FontAwesomeIcon
                                            icon={faStethoscope}
                                            className="patient__avatar"
                                            style={{ height: "2.3rem", width: "2.3rem" }}
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                className={`shadow border-${active.TO} card__size`}
                                onClick={() => {
                                    setTab("TO");
                                    handleActive("TO");
                                }}
                            >
                                <Card.Body>
                                    <p>Dental</p>
                                    <h5>{countData.Dental?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="documentation">
                                        <FontAwesomeIcon icon={faTooth} className="patient__avatar" style={{ height: "2.3rem", width: "2.3rem" }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                className={`shadow border-${active.EY} card__size`}
                                onClick={() => {
                                    setTab("EY");
                                    handleActive("EY");
                                }}
                            >
                                <Card.Body>
                                    <p>Optical</p>
                                    <h5>{countData.Optical?.toString() || <Spinner animation="border" />}</h5>
                                    <div className="right_section" data-color="OpticalClaim">
                                        <FontAwesomeIcon icon={faEye} className="patient__avatar" style={{ height: "2.3rem", width: "2.3rem" }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Row>
                <Row className="mt-3">
                    <Col md={12}>
                        <Card className="border-0 shadow">
                            <Card.Body>
                                {/* <Card.Title>Central Monitoring System for Claim</Card.Title> */}
                                <Form>
                                    <Form.Label>Search By</Form.Label>
                                    <Row className="date__row">
                                        <Col md={1} style={{ width: "12rem" }}>
                                            <Form.Group className="mb-3" controlId="formBasicFrom">
                                                <Form.Control
                                                    type="date"
                                                    value={fromDate}
                                                    placeholder="Enter Date"
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        To
                                        <Col md={1} style={{ width: "12rem" }}>
                                            <Form.Group className="mb-3" controlId="formBasicTo">
                                                <Form.Control
                                                    type="date"
                                                    value={toDate}
                                                    placeholder="Enter Date"
                                                    onChange={(e) => setToDate(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        |
                                        <Col md={5}>
                                            <AsyncSelect
                                                menuPlacement="bottom"
                                                cacheOptions
                                                styles={customStyles}
                                                isMulti={false}
                                                isClearable={true}
                                                onChange={handleChange}
                                                value={proposerName}
                                                loadOptions={debouncedSearch}
                                                placeholder="Search Proposer"
                                                components={{ MenuList: CustomVirtualList }}
                                            />
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group className="mb-3" controlId="formBasicTo">
                                                <Form.Control
                                                    type="text"
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
                                                onClick={() => filterTableData("search")}
                                            >
                                                Search
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                                {tableHeaders?.length > 0 ? (
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                    <BootstrapTable bootstrap4={true} keyField="Sr. No" data={tableData} columns={tableHeaders} bordered={false} />
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
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CmsForClaim;
