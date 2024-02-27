import React, { useRef, useState } from "react";
import "./styles.css";
import { Container, Row, Col, Card, Button, Table, Form } from "react-bootstrap";
import { utils, writeFileXLSX, read, write } from "xlsx";

const PaymentReconciliation = () => {
    const [batchNumber, setBatchNumber] = useState(null);
    const fileRef = useRef();
    const downLoadExcel = () => {
        const wb = utils.table_to_book(document.getElementById("test"));
        /* Export to file (start a download) */
        writeFileXLSX(wb, "table.xlsx");
    };

    const getUploadedFile = async () => {
        for (let i in fileRef.current.files) {
            if (Number(i) >= 0) {
                const data = await fileRef.current.files[i];
                const reader = new FileReader();
                reader.readAsArrayBuffer(data);

                reader.onload = () => {
                    setBatchNumber(Math.random().toString(36).slice(2));
                    const uintArray = new Uint8Array(reader.result);
                    const wb = read(uintArray, { type: "array" });

                    const html = write(wb, {
                        sheet: "Sheet1",
                        type: "binary",
                        bookType: "html",
                    });
                    const parser = new DOMParser();
                    const tableSnippet = parser.parseFromString(html, "text/html");
                    document.getElementById("modifiedtable").appendChild(tableSnippet.getElementsByTagName("table")[0]);
                };
            }
        }
    };

    return (
        <div>
            <Container fluid>
                <Row className="reconciliation_header">
                    <Col md={9}>
                        <h5>PAYMENT RECONCILIATION</h5>
                    </Col>
                    {/* <Col md={3} className="text-muted" style={{ textAlign: "end" }}>
            <h6>Dashboard / Payment Reconciliation</h6>
          </Col> */}
                </Row>
                <Row className="allbutton">
                    <Col md={12}>
                        <Card className="border-0 shadow">
                            <Card.Body>
                                <Row>
                                    <Col md={2}>
                                        <Form.Label>Click to Download Template</Form.Label>
                                        <Button variant="primary" className="download_button" onClick={downLoadExcel}>
                                            Download File
                                        </Button>
                                        {/* <h6>Batch Number:{batchNumber?.toUpperCase()}</h6> */}
                                    </Col>
                                    <Col md={2}>
                                        <Table id="test" style={{ display: "none" }}>
                                            <thead>
                                                <tr>
                                                    <th>Invoice No.</th>
                                                    <th>Invoice Date</th>
                                                    <th>Patient Name</th>
                                                    <th>Invoice Amount</th>
                                                </tr>
                                                <tbody>
                                                    <tr>
                                                        <td colSpan="3" style={{ color: "yellow" }}>
                                                            Sample Heading
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Invoice No.</td>
                                                        <td>Invoice Date</td>
                                                        <td>Patient Name</td>
                                                        <td>Invoice Amount</td>
                                                    </tr>
                                                </tbody>
                                            </thead>
                                        </Table>
                                    </Col>
                                    <Col md={3}>
                                        <Form>
                                            <Form.Label>Choose File</Form.Label>
                                            <Form.Control type="file" id="upload" multiple ref={fileRef} />
                                            {/* <input type="file" id="upload" multiple ref={fileRef} /> */}
                                        </Form>
                                    </Col>
                                    <Col>
                                        <Form.Label> Modified File</Form.Label>
                                        <Button onClick={getUploadedFile} className="upload_button">
                                            Upload
                                        </Button>
                                    </Col>
                                    <div id="modifiedtable"></div>
                                    <h6 className="mt-3">Batch Number:{batchNumber?.toUpperCase()}</h6>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PaymentReconciliation;
