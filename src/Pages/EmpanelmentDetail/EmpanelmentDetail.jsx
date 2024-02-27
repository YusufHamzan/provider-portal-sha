import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import "./styles.css";
import { getErrorResultFromData, getResultFromData, getCapitallisedFromCamelCase } from "../../utils/utils";
import { getProviderStatementData } from "../../API/providerStatement";
import BootstrapTable from "react-bootstrap-table-next";
import Spinner from "../../Components/Spinner/Spinner";
import moment from "moment";
import _ from "lodash";
import cogoToast from "cogo-toast";

const EmpanelmentDetail = () => {
    const [userDetails] = useState(JSON.parse(sessionStorage.getItem("user")));
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
            const data = await getProviderStatementData(payLoad);
            if (data.ok) {
                result = getResultFromData(data);
                populateTable(result);
                setNoDataFound(false);
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
        const { providerId, tokenID, userCode } = userDetails;
        let preparedPayload = {
            providerID: providerId,
            tokenID: tokenID,
            userID: userCode,
            dateFrom: fromDate ? moment(fromDate?.replaceAll("-", "/")).format("DD/MM/YYYY") : undefined,
            dateUpto: toDate ? moment(toDate?.replaceAll("-", "/")).format("DD/MM/YYYY") : undefined,
            pageNo: 0,
            pageSize: 10,
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
                        <h5>PROVIDER STATEMENT</h5>
                    </Col>
                    {/* <Col md={3} className="text-muted" style={{ textAlign: "end" }}>
                        <h6>Dashboard/Provider Statement</h6>
                    </Col> */}
                </Row>
                <Row>
                    <Col md={12}>
                        <Card className="border-0 shadow">
                            <Card.Body>
                                <Card.Title>Provider Statement</Card.Title>
                                <Form>
                                    <Form.Label>From Date</Form.Label>
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
                                            <Button variant="warning" size="sm" className="button__Search" onClick={() => setTrigger(Math.random())}>
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

export default EmpanelmentDetail;
