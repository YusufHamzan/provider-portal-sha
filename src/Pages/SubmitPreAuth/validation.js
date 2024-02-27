import Joi from "joi";

const messages = {
    membershipNo: "Membeshipr No. is required",
    // servicetype: "Service Type is required",
    // claimtype: "Claim Type is required",
    // checkin: "Check In Date is required",
    // checkout: "Check Out Date is required",
    // estimatedcost: "Estimated Cost is required",
    mobileNo: "Contact is required",
    // icd: "ICD is required",
};

export const fieldValidatePreAuth = Joi.object({
    membershipNo: Joi.string().max(25).required().messages({ "any.required": messages.membershipNo }),
    // servicetype: Joi.string().required().messages({ "any.required": messages.servicetype }),
    // claimtype: Joi.string().required().messages({ "any.required": messages.claimtype }),
    // checkin: Joi.date().required().messages({ "any.required": messages.checkin }),
    // checkout: Joi.date().min(Joi.ref("checkin")).required().messages({ "any.required": messages.checkout }),
    // estimatedcost: Joi.number().required().messages({ "any.required": messages.estimatedcost }),
    mobileNo: Joi.string().min(10).max(10).required().messages({ "any.required": messages.mobileNo }),
    // icd: Joi.object({ label: Joi.string().required(), value: Joi.string().required() }).required(),
});
