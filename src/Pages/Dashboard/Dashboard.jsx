import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import TotalClaims from "../../assets/download.png";
import Bed from "../../assets/Bed.png";
import Await from "../../assets/AwaitingSanction.png";
import BackGround from "../../assets/backgroungWorking.gif";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
    PreAuthCount,
    AwaitingHospitalizationCount,
    PreauthRejectedCount,
    // InHospitalCount,
    // AwatingDischargeHospitalizationCount,
    PreAuthRequestDetails,
    AwaitingHospitalizationDetails,
    PreauthRejectedDetails,
    // InHospitalizationDetails,
    // AwaitingDischargeHospitalizationDetails,
} from "../../API/dashboard";
import { getResultFromData, getErrorResultFromData, getCapitallisedFromCamelCase } from "../../utils/utils";
import * as _ from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import cogoToast from "cogo-toast";
import Paginator from "../../Components/Paginator/Paginator";
import { useImmer } from "use-immer";
import { getSinglePreAuthDetails } from "../../API/preauthSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { PREAUTH_STATUS, SERVICE_TYPE } from "../../utils/constants";
import DisplayPreAuthDetails from "../../Components/DisplayPreAuthDetails/DisplayPreAuthDetails";
import GALogo from "../../assets/logoGA.jpg";

const Dashboard = () => {
    const [userDetails] = useState(JSON.parse(localStorage.getItem("memberDetails")));
    const [awaitingHospitalizationCount, setAwaitingHospitalizationCount] = useState();
    // const [awatingDischargeHospitalizationCount, setAwatingDischargeHospitalizationCount] = useState();
    const [preauthRejectedCount, setPreauthRejectedCount] = useState();
    // const [inHospitalCount, setInHospitalCount] = useState();
    const [preAuthCount, setPreAuthCount] = useState();
    const [apiMasterData, setAPIMasterData] = useState();
    const [tab, setTab] = useState("preAuthRequestDetails");
    const [tableData, setTableData] = useState();
    const [tableHeaders, setTableHeaders] = useState([]);
    const [singlePreAuthDetails, setSinglePreAuthDetails] = useState(null);
    const [active, setActive] = useImmer({
        preAuthRequestDetails: 1,
        awatingHospitalizationDetails: 0,
        preauthRejectedDetails: 0,
        inHospitalizationDetails: 0,
        awatingDischargeHospitalizationDetails: 0,
    });

    const [paginatorOptions, setPaginatorOptions] = useState({
        preAuthRequestDetails: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        awatingHospitalizationDetails: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        inHospitalizationDetails: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        awatingDischargeHospitalizationDetails: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
        preauthRejectedDetails: {
            page: 0,
            pageSize: 10,
            totalRecords: undefined,
        },
    });
    const dataFetched = useRef(false);
    const dialogRef = useRef(null);
    const firstRender = useRef(true);

    // const [loading,setLoading] = useState(true)

    const getActiveName = (activeOptions) => {
        return Object.entries(activeOptions).find(([key, value]) => value === 1)[0];
    };

    /**
     * @function to get count data in dashboard
     */

    // const fetchApi = () => {
    //     // const payload = ;
    //     return new Promise((resolve, reject) => {
    //         if (true) {
    //             resolve(
    //                 DemoApiCheck({
    //                     providerID: "1196787855593631744",
    //                     userID: "1196787855593631744",
    //                     tokenID: localStorage.getItem("token"),
    //                     memberNo: "",
    //                     uploadingNo: "",
    //                     // pageNo: 0,
    //                     // pageSize: 10,
    //                 })
    //             );
    //         }
    //     }).then((result) => {
    //         console.log(result);
    //     });
    // };s

    // useEffect(() => {
    //     fetchApi();
    // }, []);
    const getAPICountData = async () => {
        const payLoadAuthCount = preparePayLoad(false);
        const payLoadAwaitingHospitalizationCount = preparePayLoad(false);
        const payLoadPreauthRejectedCount = preparePayLoad(false);

        const { awaitingHospitalizationCount, /*awatingDischargeHospitalizationCount, inHospitalCount,*/ preauthRejectedCount, preAuthCount } = (
            await Promise.all([
                PreAuthCount(payLoadAuthCount),
                AwaitingHospitalizationCount(payLoadAwaitingHospitalizationCount),
                PreauthRejectedCount(payLoadPreauthRejectedCount),
                // InHospitalCount(payLoadInHospitalCount),
                // AwatingDischargeHospitalizationCount(payLoadAwatingDischargeHospitalizationCount),
            ])
        ).reduce((prev, curr) => {
            let distinctResult;
            if (curr.ok) {
                distinctResult = {
                    [curr.name]: Object.values(getResultFromData(curr))?.[0],
                };
            } else {
                distinctResult = {
                    [curr.name]: "N/A",
                };
                cogoToast.error(`/${curr.name} failed to load`);
            }
            return Object.assign(prev, distinctResult);
        }, {});

        setAwaitingHospitalizationCount(awaitingHospitalizationCount);
        // setAwatingDischargeHospitalizationCount(awatingDischargeHospitalizationCount);
        // setInHospitalCount(inHospitalCount);
        setPreAuthCount(preAuthCount);
        setPreauthRejectedCount(preauthRejectedCount);
    };

    /**
     * @function to get table data in dashboard
     */
    const getAPIData = async () => {
        const payLoadAuthDetails = preparePayLoad(true);
        const payLoadAwaitingHospitalizationDetails = preparePayLoad(true);
        const payLoadPreauthRejectedDetails = preparePayLoad(true);

        // const payLoadInHospitalizationDetails = preparePayLoad(true);

        // const payLoadAwaitingDischargeHospitalizationDetails = preparePayLoad(true);

        const data = (
            await Promise.all([
                PreAuthRequestDetails(payLoadAuthDetails),
                AwaitingHospitalizationDetails(payLoadAwaitingHospitalizationDetails),
                PreauthRejectedDetails(payLoadPreauthRejectedDetails),
                // InHospitalizationDetails(payLoadInHospitalizationDetails),
                // AwaitingDischargeHospitalizationDetails(payLoadAwaitingDischargeHospitalizationDetails),
            ])
        ).reduce((prev, current) => {
            if (current.ok) {
                const intObj = getResultFromData(current);
                setPaginatorOptions((po) => ({
                    ...po,
                    [current.name]: {
                        ...po[current.name],
                        totalRecords: current.data.data.totalRecords,
                    },
                }));
                // setPaginatorOptions(po => ({...po,totalRecords:}))
                return { ...prev, [current.name]: { ...intObj } };
            } else {
                const intObj = getErrorResultFromData(current);
                return {
                    ...prev,
                    [intObj.details.slice(intObj.details.indexOf("/") + 1)]: [],
                };
            }
        }, {});
        if (Object.values(data).every((data) => data.length === 0)) {
            cogoToast.error("Please relogin");
        }

        setAPIMasterData(data);
    };

    /**
     * @function to prepare generalized payLoad
     */
    const preparePayLoad = (isMemberAndUploading) => {
        const { sub } = userDetails;
        let preparedPayload;
        if (isMemberAndUploading) {
            preparedPayload = {
                providerID: sub,
                tokenID: localStorage.getItem("token"),
                userID: sub,
                memberNo: "",
                uploadingNo: "",
                pageNo: paginatorOptions[getActiveName(active)].page,
                pageSize: paginatorOptions[getActiveName(active)].pageSize,
            };
        } else {
            preparedPayload = {
                providerID: sub,
                tokenID: localStorage.getItem("token"),
                userID: sub,
                memberNo: null,
                uploadingNo: null,
            };
        }

        return preparedPayload;
    };

    const getPreAuthDetails = async (details) => {
        const { providerId, tokenID, userCode } = userDetails;

        const payLoad = {
            providerID: providerId,
            claimID: details.claimID,
            tokenID,
            userID: userCode,
        };

        const data = await getSinglePreAuthDetails(payLoad);
        const result = getResultFromData(data);
        if (result) {
            result.status = (
                <p style={{ color: PREAUTH_STATUS[result.status] }}>
                    {" "}
                    <strong> {result.status}</strong>
                </p>
            );
            setSinglePreAuthDetails(result);

            dialogRef.current.showModal();
        } else {
            cogoToast.error("Data not found");
        }
    };

    /**\
     * @function to prepare table headers and data
     */
    const prepareTableData = (tab) => {
        //Prepare rows and columns
        const tabData = apiMasterData?.[tab]?.[0];

        if (tabData) {
            const { preAuthNo, policyNo, proposerName, ...rest } = tabData;
            let capitalised = Object.keys({ preAuthNo, proposerName, ...rest })
                .filter((data) => !(data in { insurarName: true, claimID: true, policyNo: true, providerID: true }))
                .map((data) => getCapitallisedFromCamelCase(data))
                .map((data) => {
                    return {
                        dataField: _.camelCase(data),
                        text: data,
                        sort: false,
                        lineBreak: "anywhere",
                    };
                });

            setTableHeaders(capitalised);
            const mappedData = capitalised.map((data) => data.dataField);
            const transformedArray = Object.entries(apiMasterData?.[tab])
                .map((e) => e[1])
                .map((masterData) => {
                    const obj = {};
                    mappedData.forEach((data) => {
                        if (data !== "providerId") {
                            if (data !== "preAuthNo") {
                                obj[data] = masterData[data];
                            } else {
                                obj[data] = (
                                    <a style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => getPreAuthDetails(masterData)}>
                                        {masterData[data]}
                                    </a>
                                );
                            }
                        }
                    });
                    return obj;
                });

            setTableData(transformedArray);
        } else {
            setTableHeaders([]);
            setTableData([]);
        }
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

    const handlePrint = () => {
        const ButtonControl = document.getElementById("printbtn");
        const ButtonClose = document.getElementById("closebtn");
        const ButtonCross = document.getElementById("crossbtn");
        ButtonClose.style.visibility = "hidden";
        ButtonControl.style.visibility = "hidden";
        ButtonCross.style.visibility = "hidden";
        window.print();
        ButtonControl.style.visibility = "visible";
        ButtonClose.style.visibility = "visible";
        ButtonCross.style.visibility = "visible";
    };

    // const handleClose = () => {
    //     dialogRef.current.close();
    //     let ButtonClose = document.getElementById("closebtn");
    //     ButtonClose.style.visibility = "hidden";
    // };

    const changePage = (idx) => {
        const activePage = getActiveName(active);
        setPaginatorOptions((po) => ({ ...po, [activePage]: { ...po[activePage], page: idx } }));
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
        if (!dataFetched.current) {
            getAPICountData();
            getAPIData();
            dataFetched.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!firstRender.current) {
            getAPICountData();
            getAPIData();
        }
        firstRender.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginatorOptions[getActiveName(active)].page]);

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={12}>
                        <h5>Dashboard</h5>
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Row>
                        <Col md={4}>
                            <Card
                                className={`shadow border-${active.preAuthRequestDetails} card__size`}
                                onClick={() => {
                                    setTab("preAuthRequestDetails");
                                    handleActive("preAuthRequestDetails");
                                }}
                            >
                                <Card.Body>
                                    <p>Preauth request</p>
                                    <h5>{preAuthCount}</h5>
                                    <div className="right_section" data-color="claim">
                                        <img src={TotalClaims} alt="" className="totalclaim__avatar" style={{ height: "1.5rem", width: "1.5rem" }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card
                                className={`shadow border-${active.awatingHospitalizationDetails} card__size`}
                                onClick={() => {
                                    setTab("awatingHospitalizationDetails");
                                    handleActive("awatingHospitalizationDetails");
                                }}
                            >
                                <Card.Body>
                                    <p>Approved Preauth</p>
                                    <h5>{awaitingHospitalizationCount}</h5>
                                    <div className="right_section" data-color="patient">
                                        <img src={Bed} alt="" className="patient__avatar" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card
                                className={`shadow border-${active.preauthRejectedDetails} card__size`}
                                onClick={() => {
                                    setTab("preauthRejectedDetails");
                                    handleActive("preauthRejectedDetails");
                                }}
                            >
                                <Card.Body>
                                    <p>Rejected Preauth</p>
                                    <h5>{preauthRejectedCount}</h5>
                                    <div className="right_section" data-color="sanction">
                                        <img src={Await} alt="" className="sanction__avatar" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Row>
                <Row className="mt-3">
                    <Row>
                        <Col className="col-12 col">
                            <Card className="shadow border-0">
                                <Card.Body>
                                    <Card.Title>
                                        <p>Patient in Hospital</p>
                                    </Card.Title>
                                    {tableHeaders?.length > 0 ? (
                                        <div style={{ width: '100%', overflowX: 'auto' }}>
                                            <BootstrapTable
                                                bootstrap4={true}
                                                keyField="Sr. No"
                                                data={tableData}
                                                columns={tableHeaders}
                                                bordered={false}
                                                wrapperClasses="table-responsive"
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
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Row>
                <dialog
                    ref={dialogRef}
                    style={{ borderRadius: "10px", borderColor: "navy", borderWidth: "1.5px", padding: "2rem", width: "max-content" }}
                >
                    <img src={GALogo} alt="" style={{ height: "4rem", marginLeft: "1.5rem" }} />
                    <div className="d-flex justify-content-end">
                        <button onClick={() => dialogRef.current.close()} className="close_btn" id="crossbtn">
                            <FontAwesomeIcon icon={faClose} className="fa-xl" />
                        </button>
                    </div>
                    <DisplayPreAuthDetails singlePreAuthDetails={singlePreAuthDetails} />

                    <div className="d-flex justify-content-center">
                        <Button style={{ width: "min-content" }} onClick={() => dialogRef.current.close()} id="closebtn">
                            Close
                        </Button>
                        <Button style={{ width: "min-content", marginLeft: "10px" }} onClick={handlePrint} id="printbtn">
                            Print
                        </Button>
                    </div>
                </dialog>
                {/* <dialog ref={dialogRef}>{JSON.stringify(singlePreAuthDetails)}</dialog> */}
            </Container>
        </div>
    );
};

export default Dashboard;
