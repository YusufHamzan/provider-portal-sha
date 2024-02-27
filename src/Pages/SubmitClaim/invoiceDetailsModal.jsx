import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Form, Table } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ReactSelect from "react-select";
import { getServiceTypesForInvoice, getServicesById } from "../../API/masterData";

function InvoiceDetailsModal(props) {
    const {
        isOpen,
        onClose,
        onSubmit,
        changeInvoiceItems,
        selectedInvoiceItemIndex,
        selectedInvoiceItems,
        handleAddInvoiceItemRow,
        handleDeleteInvoiceItemRow,
    } = props;
    const [serviceTypeList, setServiceTypeList] = React.useState();
    const [expenseHeadList, setExpenseHeadList] = React.useState();

    const getServiceTypes = async () => {
        let response = await getServiceTypesForInvoice();
        let temp = [];
        response?.data?.data.content.forEach((el) => {
            let obj = {
                label: el?.name,
                value: el?.id,
            };
            temp.push(obj);
        });
        setServiceTypeList(temp);
    };

    const getExpenseHead = async (id) => {
        console.log(id);
        let response = await getServicesById(id);
        let temp = [];
        response?.data?.data.content.forEach((el) => {
            let obj = {
                label: el?.name,
                value: el?.id,
            };
            temp.push(obj);
        });
        setExpenseHeadList(temp);
    };

    React.useEffect(() => {
        getServiceTypes();
    }, []);

    return (
        <Modal show={isOpen} style={{ width: "100%" }} size="xl">
            <div style={{ minHeight: "500px" }}>
                <Modal.Header>
                    <Modal.Title>Invoice Items</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ overflowX: "auto" }}>
                    <div container spacing={3} style={{ marginBottom: "20px" }}>
                        <div item md={4}>
                            Invoice no:
                            {props?.invoiceNo}
                        </div>
                        <div item xs={12} style={{ minWidth: "600px" }}>
                            <Table size="small">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Service Type</th>
                                        <th>Expense Head</th>
                                        <th>Rate(KES)</th>
                                        <th>Unit</th>
                                        <th>Total(KES)</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoiceItems.map((detail, index) => {
                                        return (
                                            <tr>
                                                <td>
                                                    {selectedInvoiceItems.length - 1 === index && (
                                                        <Button
                                                            onClick={() => handleAddInvoiceItemRow(selectedInvoiceItemIndex)}
                                                            aria-label="Add a row below"
                                                            className="w-auto"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faPlus}
                                                                style={{
                                                                    cursor: "pointer",
                                                                }}
                                                            />
                                                        </Button>
                                                    )}
                                                </td>
                                                <td>
                                                    <Form.Select
                                                        variant="primary"
                                                        id="benefit"
                                                        label="Service Type"
                                                        name="serviceType"
                                                        value={detail.serviceType}
                                                        onChange={(e) => {
                                                            getExpenseHead(e.target.value);
                                                            changeInvoiceItems(e, selectedInvoiceItemIndex, index);
                                                        }}
                                                    >
                                                        <option>Select Service</option>
                                                        {serviceTypeList.map((st) => {
                                                            return <option value={st.value}>{st.label}</option>;
                                                        })}
                                                    </Form.Select>
                                                </td>
                                                <td>
                                                    <Form.Select
                                                        variant="primary"
                                                        id="benefit"
                                                        label="Expense Head"
                                                        name="expenseHead"
                                                        value={detail.expenseHead}
                                                        onChange={(e) => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                                                    >
                                                        <option>Select Exapense</option>
                                                        {expenseHeadList?.map((st) => {
                                                            return <option value={st.value}>{st.label}</option>;
                                                        })}
                                                    </Form.Select>
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        required
                                                        name="rateKes"
                                                        type="number"
                                                        value={detail.rateKes}
                                                        onChange={(e) => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        required
                                                        name="unit"
                                                        type="number"
                                                        value={detail.unit}
                                                        onChange={(e) => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        name="totalKes"
                                                        disabled
                                                        value={detail.totalKes}
                                                        onChange={(e) => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                                                    />
                                                </td>
                                                <td>
                                                    {selectedInvoiceItems.length !== 1 && (
                                                        <Button
                                                            onClick={() => handleDeleteInvoiceItemRow(selectedInvoiceItemIndex, index)}
                                                            aria-label="Remove this row"
                                                            className="w-auto"
                                                            style={{ background: "lightgray", color: "white", border: "none" }}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faMinus}
                                                                style={{
                                                                    cursor: "pointer",
                                                                }}
                                                            />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="w-auto" onClick={onClose} variant="secondary">
                        Close
                    </Button>
                    <Button className="w-auto" onClick={onSubmit} variant="primary">
                        Save Changes
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default InvoiceDetailsModal;
