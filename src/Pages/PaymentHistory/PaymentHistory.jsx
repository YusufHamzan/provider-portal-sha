import React, { useEffect, useState } from "react";
import "./styles.css";
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import { getPaymentHistoryData } from "../../API/paymentHistory";
import { getErrorResultFromData, getResultFromData, getCapitallisedFromCamelCase } from "../../utils/utils";
import BootstrapTable from "react-bootstrap-table-next";
import BackGround from "../../assets/backgroungWorking.gif";
import moment from "moment";
import _ from "lodash";
import cogoToast from "cogo-toast";
import Paginator from "../../Components/Paginator/Paginator";

const PaymentHistory = () => {
    const [userDetails] = useState(JSON.parse(localStorage.getItem("memberDetails")));
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [tableData, setTableData] = useState();
    const [tableHeaders, setTableHeaders] = useState([]);
    const [trigger, setTrigger] = useState();
    const [noDataFound, setNoDataFound] = useState(undefined);
    const [paginatorOptions, setPaginatorOptions] = useState({
        page: 0,
        pageSize: 10,
        totalPages: undefined,
    });

    const getAPIData = async () => {
        const payLoad = preparePayLoad();
        let result;
        if (payLoad.dateFrom && payLoad.dateUpto) {
            const data = await getPaymentHistoryData(payLoad);
            if (data.ok) {
                result = getResultFromData(data);

                if (result) {
                    populateTable(result);
                    setPaginatorOptions((po) => ({
                        ...po,
                        totalPages: data?.data?.data?.totalPages,
                    }));

                    setNoDataFound(false);
                } else {
                    setNoDataFound(true);
                }
            } else {
                result = getErrorResultFromData(data);
                cogoToast.error(result.message);
                setNoDataFound(true);
            }
        } else {
            cogoToast.error("Please specify Dates");
        }
    };

    const populateTable = (data) => {
        let capitalisedHeaders = Object.keys(data[0])
            .filter((data) => data !== "insurarName")
            .map((data) => getCapitallisedFromCamelCase(data))
            .map((data) => {
                return {
                    dataField: _.camelCase(data),
                    text: data,
                    sort: false,
                };
            });

        setTableHeaders(capitalisedHeaders);
        setTableData(data);
    };

    const preparePayLoad = () => {
        const { sub } = userDetails;
        let preparedPayload = {
            providerID: sub,
            tokenID: localStorage.getItem("token"),
            userID: sub,
            dateFrom: fromDate ? moment(fromDate?.replaceAll("-", "/")).format("DD/MM/YYYY") : undefined,
            dateUpto: toDate ? moment(toDate?.replaceAll("-", "/")).format("DD/MM/YYYY") : undefined,
            pageNo: 0,
            pageSize: 10,
        };

        return preparedPayload;
    };

    const changePage = (idx) => {
        setPaginatorOptions((po) => ({ ...po, page: idx }));
    };

    useEffect(() => {
        if (trigger) {
            getAPIData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger, paginatorOptions.page]);

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={9}>
                        <h5>PAYMENT HISTORY</h5>
                    </Col>
                    {/* <Col md={3} className="text-muted" style={{ textAlign: "end" }}>
                        <h6>Dashboard/Payment History</h6>
                    </Col> */}
                </Row>
                <Row>
                    <Col md={12}>
                        <Card className="border-0 shadow">
                            <Card.Body>
                                {/* <Card.Title>Payment History</Card.Title> */}
                                <Form>
                                    <Form.Label>
                                        Search By Date <span className="mandate_field">*</span>
                                    </Form.Label>
                                    <Row className="date__row">
                                        <Col md={2}>
                                            <Form.Group className="mb-3" controlId="formBasicFrom">
                                                <Form.Control type="date" placeholder="Enter Date" onChange={(e) => setFromDate(e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        To
                                        <Col md={2}>
                                            <Form.Group className="mb-3" controlId="formBasicTo">
                                                <Form.Control type="date" placeholder="Enter Date" onChange={(e) => setToDate(e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={1}>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="button__Search searchBtn"
                                                onClick={() => setTrigger(Math.random())}
                                            >
                                                Search
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                                {tableHeaders?.length ? (
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                        <BootstrapTable bootstrap4={true} keyField="id" data={tableData} columns={tableHeaders} bordered={false} />
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: "grid",
                                            placeContent: "center",
                                            padding: "10%",
                                        }}
                                    >
                                        {noDataFound === undefined ? (
                                            <h3>Please Search</h3>
                                        ) : noDataFound === true ? (
                                            <h1>No Data Found</h1>
                                        ) : (
                                            <img src={BackGround} alt="" />
                                        )}
                                    </div>
                                )}
                                {paginatorOptions?.totalPages ? <Paginator totalPages={paginatorOptions.totalPages} changePage={changePage} /> : null}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PaymentHistory;
