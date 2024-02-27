import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Button, Form } from "react-bootstrap";
import ReactSelect from "react-select";

const InvoiceForm = (props) => {
    const {
        invoiceDetailsList,
        handleInputChangeService,
        currencyOptions,
        handleInvoiceDate,
        payeeOption,
        handleRemoveServicedetails,
        handleAddServicedetails,
        handleAddInvoiceItems,
        handleCurrencyChangeService,
        handlePayeeChangeService
    } = props;
    return (
        <>
            {invoiceDetailsList.map((x, i) => {
                return (
                    <>
                        <Form.Label className="mt-4 col-lg-3" style={{ maxHeight: "62px", flexBasis: "25ch" }}>
                            Invoice Number
                            <Form.Control
                                required
                                type="number"
                                id="standard-basic"
                                name="invoiceNo"
                                // value={x.invoiceNo}
                                onChange={(e) => handleInputChangeService(e, i)}
                                label="Invoice number"
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-3" style={{ maxHeight: "62px", flexBasis: "25ch" }}>
                            Currency
                            <ReactSelect
                                options={currencyOptions}
                                name="currency"
                                // value={x.currency}
                                onChange={(e) => handleCurrencyChangeService(e, i)}
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-3" style={{ maxHeight: "62px", flexBasis: "16ch" }}>
                            Invoice Amount
                            <Form.Control
                                required
                                type="number"
                                name="invoiceAmount"
                                // value={x.invoiceAmount}
                                onChange={(e) => handleInputChangeService(e, i)}
                                label="Invoice Amount"
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-3" style={{ maxHeight: "62px", flexBasis: "16ch" }}>
                            Invoice Date
                            <Form.Control
                                required
                                type="date"
                                label="Invoice Date"
                                // value={x.invoiceDateVal}
                                onChange={(date) => {
                                    handleInvoiceDate(date, i);
                                }}
                            />
                        </Form.Label>
                        <Form   .Label className="mt-4 col-lg-3" style={{ maxHeight: "62px", flexBasis: "16ch" }}>
                            Exchange Rate
                            <Form.Control
                                required
                                type="number"
                                name="exchangeRate"
                                // value={x.exchangeRate}
                                onChange={(e) => handleInputChangeService(e, i)}
                                label="Exchange Rate"
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-3" style={{ maxHeight: "62px", flexBasis: "25ch" }}>
                            Invoice Amount(KES)
                            <Form.Control
                                required
                                type="number"
                                name="invoiceAmountKES"
                                value={x.invoiceAmountKES}
                                disabled
                                onChange={(e) => handleInputChangeService(e, i)}
                                label="Invoice Amount(KES)"
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-3" style={{ maxHeight: "62px", flexBasis: "25ch" }}>
                            Transaction Number
                            <Form.Control
                                required
                                type="number"
                                name="transactionNo"
                                // value={x.transactionNo}
                                onChange={(e) => handleInputChangeService(e, i)}
                                label="Transaction No"
                            />
                        </Form.Label>
                        <Form.Label className="mt-4 col-lg-3" style={{ maxHeight: "62px", flexBasis: "16ch" }}>
                            Payee
                            <ReactSelect
                                options={payeeOption}
                                name="payee"
                                // value={x.payee}
                                onChange={(e) => handlePayeeChangeService(e, i)}
                            />
                        </Form.Label>
                        <div className="mt-4 col-lg-3 d-flex justify-content-start" style={{ maxHeight: "62px", flexBasis: "34ch" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                className="w-auto"
                                style={{ marginLeft: "5px", marginTop: "10px", backgroundColor: "#5959FF", color: "white" }}
                                onClick={() => handleAddInvoiceItems(i)}
                            >
                                Add Invoice items
                            </Button>

                            <div style={{ display: "flex", alignItems: "center" }}>
                                {invoiceDetailsList.length !== 1 && (
                                    <Button
                                        onClick={() => handleRemoveServicedetails(i)}
                                        variant="contained"
                                        color="secondary"
                                        className="w-auto mr10"
                                        // disabled={disableAllFields ? true : false}
                                        style={{ marginLeft: "5px", backgroundColor: "lightpink", color: "white" }}
                                    >
                                        <FontAwesomeIcon
                                            icon={faMinus}
                                            style={{
                                                cursor: "pointer",
                                            }}
                                        />
                                    </Button>
                                )}
                                {invoiceDetailsList.length - 1 === i && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        className="w-auto"
                                        style={{ marginLeft: "5px", backgroundColor: "#5959FF", color: "white" }}
                                        // disabled={disableAllFields ? true : false}
                                        onClick={handleAddServicedetails}
                                    >
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            style={{
                                                cursor: "pointer",
                                            }}
                                        />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="w-100 bg-secondary mt-4" style={{ height: "1px", opacity: "0.2" }} />
                    </>
                );
            })}
        </>
    );
};

export default InvoiceForm;