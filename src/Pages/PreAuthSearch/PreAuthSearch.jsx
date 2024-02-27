import React, { useState, useEffect, useRef, useCallback } from "react";
import "./styles.css";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { PreAuthSearchDetails, getSinglePreAuthDetails } from "../../API/preauthSearch";
import { getResultFromData, getCapitallisedFromCamelCase, getErrorResultFromData } from "../../utils/utils";
import BootstrapTable from "react-bootstrap-table-next";
import BackGround from "../../assets/backgroungWorking.gif";
import _, { capitalize } from "lodash";
import cogoToast from "cogo-toast";
import AsyncSelect from "react-select/async";
import CustomVirtualList from "../SubmitClaim/VirtualList";
import axios from "axios";
import { decideENV } from "../../decideENV";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { PREAUTH_STATUS, SERVICE_TYPE } from "../../utils/constants";
import DisplayPreAuthDetails from "../../Components/DisplayPreAuthDetails/DisplayPreAuthDetails";
import GALogo from "../../assets/logoGA.jpg";

const PreAuthSearch = () => {
    const [userDetails] = useState(JSON.parse(localStorage.getItem("memberDetails")));
    const [tableData, setTableData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [masterData, setMasterData] = useState();
    const [paginatorOptions, setPaginatorOptions] = useState({
        page: 0,
        pageSize: 10,
        totalPages: undefined,
    });
    const [proposerName, setProposerName] = useState([]);

    const [noDataFound, setNoDataFound] = useState(false);
    const [preauthNumber, setPreAuthNo] = useState(null);
    const [singlePreAuthDetails, setSinglePreAuthDetails] = useState(null);

    const dialogRef = useRef(null);
    const controllerRef = useRef();

    const getAPIData = async () => {
        const payLoad = preparePayLoad();
        let result;
        // if (payLoad.dateFrom && payLoad.dateUpto) {
        const data = await PreAuthSearchDetails(payLoad);
        if (data.ok) {
            result = getResultFromData(data);
            if (!result) {
                setNoDataFound(true);
                setTableData([]);
                setTableHeaders([]);
            } else {
                populateTable(result);
                setNoDataFound(false);
            }
        } else {
            result = getErrorResultFromData(data);
            setNoDataFound(true);
        }
        // } else {
        //   cogoToast.error("Please specify Dates");
        // }
    };

    const preparePayLoad = () => {
        const { sub } = userDetails;

        let preparedPayload = {
            providerID: sub,
            tokenID: localStorage.getItem("token"),
            userID: sub,
            pageNo: paginatorOptions.page,
            pageSize: paginatorOptions.pageSize,
            preAuthNo: preauthNumber || null,
            proposerID: proposerName?.value || null,
        };

        return preparedPayload;
    };

    const getPreAuthDetails = async (details) => {
        const { sub } = userDetails;

        const payLoad = {
            providerID: sub,
            claimID: details.claimID || null,
            tokenID: localStorage.getItem("token"),
            userID: sub,
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

    const populateTable = (data) => {
        let capitalisedHeaders = Object.keys(data[0])
            .filter((data) => !(data in { insurarName: true, claimID: true, policyNo: true }))
            .map((data) => getCapitallisedFromCamelCase(data))
            .map((data) => {
                return {
                    dataField: data === "Claim Id" ? "claimID" : _.camelCase(data),
                    text: data,
                    sort: false,
                };
            });
        setTableHeaders(capitalisedHeaders);
        setTableData(
            data.map((row) => {
                return {
                    ...row,
                    preAuthNo: (
                        <a style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => getPreAuthDetails(row)}>
                            {row.preAuthNo}
                        </a>
                    ),
                    status: <p style={{ color: PREAUTH_STATUS[capitalize(row.status)], fontWeight: "600" }}>{row.status}</p>,
                };
            })
        );
    };
    const filterTableData = () => {
        setNoDataFound(false);
        setTableData([]);
        setTableHeaders([]);
        getAPIData().then((data) => {
            if (getResultFromData(data)) {
                setMasterData(data);
            } else {
                setNoDataFound(true);
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
    // const changePage = (idx) => {
    //   setPaginatorOptions((po) => ({ ...po, page: idx }));
    // };

    useEffect(() => {
        getAPIData().then((data) => {
            if (data) {
                setMasterData(data);
            } else {
                setNoDataFound(true);
            }
        });
        //  eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginatorOptions.page]);

    useEffect(() => {
        if (masterData) {
            populateTable(masterData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [masterData]);

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

    const serviceType = {
        IP: "In-Patient",
        OP: "Out-Patient",
    };
    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={9} className="text-dark">
                        <h5> PREAUTH SEARCH</h5>
                    </Col>
                    {/* <Col md={3} className="text-muted" style={{ textAlign: "end" }}>
                        <h6>Dashboard/Search PreAuth</h6>
                    </Col> */}
                </Row>

                <Row>
                    <Col md={12}>
                        <Card className="border-0 shadow">
                            <Card.Body>
                                <Row>
                                    <h6>Search By</h6>
                                    <Col md={3}>
                                        <Form.Group className="mb-3" controlId="formBasicTo">
                                            <Form.Control
                                                type="text"
                                                // style={{ fontSize: "0.8rem" }}
                                                placeholder=" Preauth Number"
                                                onChange={({ target: { value: PreAuthNumber } }) => setPreAuthNo(PreAuthNumber)}
                                            />
                                        </Form.Group>
                                    </Col>

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
                                            placeholder="Search Proposer "
                                            components={{ MenuList: CustomVirtualList }}
                                        />
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
                                {tableHeaders?.length ? (
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                        <BootstrapTable bootstrap4={true} keyField="id" data={tableData} columns={tableHeaders} bordered={false} />
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: "grid",
                                            placeContent: "center",
                                            padding: "15%",
                                        }}
                                    >
                                        {noDataFound === undefined ? (
                                            <h3>Please Search</h3>
                                        ) : noDataFound === true ? (
                                            <h1>No Data Found</h1>
                                        ) : (
                                            <img src={BackGround} width={60} height={40} alt="" />
                                        )}
                                    </div>
                                )}
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
                                    {/* <ul style={{ listStyle: "none", width: "30rem", marginTop: "initial" }}>
                                        {singlePreAuthDetails &&
                                            Object.entries(_.omit(singlePreAuthDetails, ["insuranceName", "claimAmount", "policyNo"]))?.map(
                                                ([key, value]) => (
                                                    <li key={value}>
                                                        <strong>{getCapitallisedFromCamelCase(key)}</strong> :{" "}
                                                        {key === "serviceType" ? serviceType[value] : value}
                                                    </li>
                                                )
                                            )}
                                    </ul> */}
                                </dialog>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PreAuthSearch;
