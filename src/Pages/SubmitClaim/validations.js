import Joi from "joi";

const messages = {
    memberno: "Member No. is required",
    provider: "Provider is required",
    servicetype: "Service Type is required",
    claimtype: "Claim Type is required",
    checkindate: "Check in is required",
    checkoutdate: "Check out should be later than check in date",
    serviceamount: "Service Amount is required",
    icd: "ICD is required",
    policycode: "Policy Code is required",
    membername: "Member Name is required",
    policyperiod: "Policy Period is required",
    firstenrollmentdate: "First Enrollment Date is required",
    productcurrency: "Product Currency is required",
    countrycode: "Country Code is required",
    familycode: "Family Code is required",
    currency: "Currency is required",
    invoicenumber: "Invoice Number is required",
    invoicedate: "Invoice Date is required",
    invoiceamount: "Invoice Amount is required",
    items: "Items is required",
    expensetype: "Expense Type is required",
    expensecode: "Expense Code is required",
    totalquantity: "Total quantity is required",
    totalamount: "Total Amount is required",
    uploadedFiles: "File is required",
};

export const fieldValidateFirstStep = Joi.object({
    memberno: Joi.string().max(25).required().messages({ "any.required": messages.memberno, "string.empty": messages.memberno }),
    policycode: Joi.string().allow("") /* .required().messages({ "string.empty": messages.policycode }), */,
    membername: Joi.string().allow("") /* .required().messages({ "string.empty": messages.membername }), */,
    policyperiod: Joi.string().allow("") /* .required().messages({ "string.empty": messages.policyperiod }), */,
    firstenrollmentdate: Joi.string().allow("") /* .required().messages({ "string.empty": messages.firstenrollmentdate }), */,
    servicetype: Joi.string().required().messages({ "any.required": messages.servicetype, "string.empty": messages.servicetype }),
    claimtype: Joi.string().required().messages({ "string.empty": messages.claimtype }),
    provider: Joi.string().min(25).max(25).required().messages({ "any.required": messages.provider, "string.empty": messages.provider }),
    checkindate: Joi.date().required().messages({ "any.required": messages.checkindate }),
    checkoutdate: Joi.date()
        .min(Joi.ref("checkindate"))
        .required()
        .messages({ "any.required": messages.checkoutdate, "date.min": messages.checkoutdate }),
    serviceamount: Joi.number().precision(2).required().messages({
        "number.base": messages.serviceamount,
    }),
    productcurrency: Joi.string().allow("") /* required().messages({ "string.empty": messages.productcurrency }) */,
    currency: Joi.string().required().messages({ "string.empty": messages.currency }),
    icd: Joi.array().min(1).required().messages({ "array.min": messages.icd }),
    countrycode: Joi.string().allow("") /* .required().messages({ "string.empty": messages.countrycode }) */,
    familycode: Joi.string().allow("") /* .required().messages({ "string.empty": messages.familycode }) */,
});

export const fieldValidateSecondStep = Joi.object().pattern(/^/, [
    Joi.object({
        invoicenumber: Joi.string().required().messages({ "string.empty": messages.invoicenumber }),
        invoicedate: Joi.string().required().messages({ "any.required": messages.invoicedate }),
        invoiceamount: Joi.number().required().messages({ "any.required": messages.invoiceamount }),
        items: Joi.array().messages({ "any.required": messages.items }),
    }),
]);

export const fieldValidateThirdStep = Joi.object().pattern(/^/, [
    Joi.object({
        expensetype: Joi.string().required().messages({ "any.required": messages.expensetype }),
        expensecode: Joi.string().required().messages({ "any.required": messages.expensecode }),
        totalquantity: Joi.number().required().messages({ "any.required": messages.totalquantity }),
        totalamount: Joi.number().precision(2).required().messages({ "any.required": messages.totalamount }),
    }),
]);

// export const fieldValidateThirdStep = Joi.object({
//   expensetype: Joi.string().required(),
//   expensecode: Joi.string().required(),
//   totalquantity: Joi.string().required(),
//   totalamount: Joi.number().precision(2).required(),
// });

export const fieldValidateFourthStep = Joi.object({
    uploadedFiles: Joi.array().messages({ "any.required": messages.uploadedFiles }),
});
