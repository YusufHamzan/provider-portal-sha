import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./style.css";
import { GetPreAuthDetails } from "../../API/cashlessAddDoc";
import { getResultFromData, getCapitallisedFromCamelCase } from "../../utils/utils";
import BootstrapTable from "react-bootstrap-table-next";
import BackGround from "../../assets/backgroungWorking.gif";
import _ from "lodash";
import Paginator from "../../Components/Paginator/Paginator";

const PreAuthAddDoc = () => {
    const [userDetails] = useState(JSON.parse(localStorage.getItem("memberDetails")));
    const [masterData, setMasterData] = useState();
    const [tableData, setTableData] = useState();
    const [tableHeaders, setTableHeaders] = useState([]);
    const [noDataFound, setNoDataFound] = useState(false);
    const [paginatorOptions, setPaginatorOptions] = useState({
        page: 0,
        pageSize: 10,
        totalPages: undefined,
    });

    const getAPIData = async () => {
        const payLoad = preparePayLoad();

        const data = await GetPreAuthDetails(payLoad);
        const result = getResultFromData(data);
        if (!result) {
            setNoDataFound(true);
        }
        setPaginatorOptions((po) => ({
            ...po,
            totalPages: data?.data?.data?.totalPages,
        }));
        return result;
    };

    const preparePayLoad = () => {
        const { sub } = userDetails;
        let preparedPayload = {
            providerID: sub,
            tokenID: localStorage.getItem("token"),
            userID: sub,
            pageNo: paginatorOptions.page,
            pageSize: paginatorOptions.pageSize,
            preAuthNo: null,
            proposerID: null,
        };

        return preparedPayload;
    };

    const populateTable = (data) => {
        let capitalisedHeaders = Object.keys(data[0])
            .filter((data) => !(data in { insurarName: true, claimID: true, policyNo: true }))
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

    const changePage = (idx) => {
        setPaginatorOptions((po) => ({ ...po, page: idx }));
    };

    useEffect(() => {
        getAPIData().then((data) => {
            setMasterData(data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginatorOptions.page]);

    useEffect(() => {
        if (masterData) {
            populateTable(masterData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [masterData]);

    return (
        <div>
            <Container fluid>
                <Row>
                    <Col md={10}>
                        <h5>PREAUTH ADD DOC</h5>
                    </Col>
                    {/* <Col md={2} className="text-muted">
            <h6>Dashboard / Preauth Add Doc</h6>
          </Col> */}
                </Row>
                <Row className="mt-3">
                    <Col md={12}>
                        <Card>
                            <Card.Body>
                                <Card.Title>Preauth Add Doc Details</Card.Title>
                                {tableHeaders?.length ? (
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                        <BootstrapTable bootstrap4={true} keyField="id" data={tableData} columns={tableHeaders} bordered={false} sort={false} />
                                    </div>
                                ) : !noDataFound ? (
                                    <div
                                        style={{
                                            display: "grid",
                                            placeContent: "center",
                                            transform: "scale(0.5)",
                                        }}
                                    >
                                        <img src={BackGround} alt="" />
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: "grid",
                                            placeContent: "center",
                                            padding: "15%",
                                        }}
                                    >
                                        <h1>No data found</h1>
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

export default PreAuthAddDoc;
