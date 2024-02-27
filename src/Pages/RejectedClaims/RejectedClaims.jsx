import React, { useState, useEffect } from "react";
import "./styles.css";
import { Col, Row, Container, Card, Form, Button } from "react-bootstrap";
import { getErrorResultFromData, getResultFromData, getCapitallisedFromCamelCase } from "../../utils/utils";
import { getRejectedClaims } from "../../API/rejectedClaims";
import BootstrapTable from "react-bootstrap-table-next";
import Spinner from "../../Components/Spinner/Spinner";
import moment from "moment";
import _ from "lodash";
import cogoToast from "cogo-toast";

const RejectedClaims = () => {
    const [userDetails] = useState(JSON.parse(localStorage.getItem("memberDetails")));
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [tableData, setTableData] = useState();
    const [tableHeaders, setTableHeaders] = useState([]);
    const [trigger, setTrigger] = useState();
    const [noDataFound, setNoDataFound] = useState(undefined);

    const getAPIData = async () => {
        const payLoad = preparePayLoad();
        let result;
        if (payLoad.dateFrom && payLoad.dateUpto) {
            const data = await getRejectedClaims(payLoad);
            if (data.ok) {
                result = getResultFromData(data);
                if (result) {
                    populateTable(result);
                    setNoDataFound(false);
                } else {
                    setNoDataFound(true);
                }
            } else {
                result = getErrorResultFromData(data);
                setNoDataFound(true);
            }
        } else {
            cogoToast.error("Please specify Dates");
        }
    };

    const populateTable = (data) => {
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

    const preparePayLoad = () => {
        const { sub } = userDetails;
        let preparedPayload = {
            providerID: sub,
            tokenID: localStorage.getItem("token"),
            userID: sub,
            dateFrom: fromDate ? moment(fromDate?.replaceAll("-", "/")).format("DD/MM/YYYY") : undefined,
            dateUpto: toDate ? moment(toDate?.replaceAll("-", "/")).format("DD/MM/YYYY") : undefined,
            pageNo: 0,
            pageSize: 11,
        };

        return preparedPayload;
    };

    useEffect(() => {
        if (trigger) {
            getAPIData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={9}>
                        <h5>REJECTED CLAIMS</h5>
                    </Col>
                    {/* <Col md={3} className="text-muted" style={{ textAlign: "end" }}>
            <h6>Dashboard / Rejected Claims</h6>
          </Col> */}
                </Row>
                <Row>
                    <Col md={12}>
                        <Card className="border-0 shadow">
                            <Card.Body>
                                {/* <Card.Title>Rejected Claims</Card.Title> */}
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

export default RejectedClaims;
