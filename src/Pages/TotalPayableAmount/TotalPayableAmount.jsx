import React, { useState, useEffect } from "react";
import "./styles.css";
import BootstrapTable from "react-bootstrap-table-next";
import { getResultFromData, getCapitallisedFromCamelCase, formatStringAmountToNumeric } from "../../utils/utils";
import moment from "moment";
import _ from "lodash";
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import cogoToast from "cogo-toast";
import { getTotalPayableAmount, getTotalPayableAmountDetails } from "../../API/totalPayableAmount";
import Spinner from "../../Components/Spinner/Spinner";

const TotalPayableAmount = () => {
    const [userDetails] = useState(JSON.parse(localStorage.getItem("memberDetails")));

    const [fromDate, setFromDate] = useState();

    const [toDate, setToDate] = useState();
    const [tableData, setTableData] = useState();
    const [tableHeaders, setTableHeaders] = useState([]);
    const [totalAmount, setTotalAmount] = useState();
    const [noDataFound, setNoDataFound] = useState(undefined);

    const getAPIAmountData = async (context) => {
        const payload = preparePayLoad("amount");
        const amountData = await getTotalPayableAmount(payload);
        if (amountData.ok) {
            setTotalAmount(getResultFromData(amountData).totalPayableAmount);
        }
    };

    const getTotalPayableAmountDetail = async (context) => {
        const payLoad = preparePayLoad("details");
        let result;
        if (payLoad.dateFrom && payLoad.dateUpto) {
            const data = await getTotalPayableAmountDetails(payLoad);
            if (data.ok) {
                result = getResultFromData(data);
                if (result) {
                    setTotalAmount(() => {
                        return result.reduce((acc, data) => formatStringAmountToNumeric(data.payableAmount) + acc, 0);
                    });
                    populateTable(result);
                    setNoDataFound(false);
                } else {
                    setNoDataFound(true);
                }
            }
        } else {
            cogoToast.error("Please specify Dates");
        }
    };

    const preparePayLoad = (context) => {
        const { sub } = userDetails;
        switch (context) {
            case "amount": {
                return {
                    providerID: sub,
                    tokenID: localStorage.getItem("token"),
                    userID: sub,
                    dateFrom: null,
                    dateUpto: null,
                };
            }
            case "details": {
                return {
                    providerID: sub,
                    tokenID: localStorage.getItem("token"),
                    userID: sub,
                    dateFrom: fromDate ? moment(fromDate?.replaceAll("-", "/")).format("DD/MM/YYYY") : undefined,
                    dateUpto: toDate ? moment(toDate?.replaceAll("-", "/")).format("DD/MM/YYYY") : undefined,
                    pageSize: 10,
                    pageNo: 0,
                };
            }

            default: {
                return null;
            }
        }
    };

    const populateTable = (data) => {
        data?.forEach((data) => delete data.providerID);
        let capitalisedHeaders = Object.keys(data[0])
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

    const filterTableData = () => {
        getTotalPayableAmountDetail();
    };

    useEffect(() => {
        getAPIAmountData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={9}>
                        <h5>Total Payable Amount Details</h5>
                    </Col>
                    {/* <Col md={3} className="text-muted" style={{ textAlign: "end" }}>
            <h6>Dashboard / Total Payable Amount</h6>
          </Col> */}
                </Row>
                <Row className="mt-3" style={{ marginRight: "-1.5rem" }}>
                    <Col>
                        <Card className="shadow border-0 card__size">
                            <Card.Body>
                                <p>Total Payable Amount</p>
                                <h5>{totalAmount}</h5>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col md={12}>
                        <Card className="border-0 shadow">
                            <Card.Body>
                                {/* <Card.Title>Total Payable Amount Details</Card.Title> */}
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
                                            <Button variant="warning" size="sm" className="button__Search searchBtn" onClick={filterTableData}>
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
                                            <Spinner />
                                        )}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default TotalPayableAmount;
