import { ServiceInstance } from "../axiosConfig";

//Count
export const PreAuthCount = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/preauthrequestcount", payLoad);
        return { ok: true, data: result, error: null, name: "preAuthCount" };
    } catch (error) {
        return { ok: false, data: null, error: error, name: "preAuthCount" };
    }
};

export const AwaitingHospitalizationCount = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/awatinghospitalizationcount", payLoad);
        return {
            ok: true,
            data: result,
            error: null,
            name: "awaitingHospitalizationCount",
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error: error,
            name: "awaitingHospitalizationCount",
        };
    }
};

export const InHospitalCount = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/inhospitalizationcount", payLoad);
        return { ok: true, data: result, error: null, name: "inHospitalCount" };
    } catch (error) {
        return { ok: false, data: null, error: error, name: "inHospitalCount" };
    }
};

export const AwatingDischargeHospitalizationCount = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/awatingdischargehospitalizationcount", payLoad);
        return {
            ok: true,
            data: result,
            error: null,
            name: "awatingDischargeHospitalizationCount",
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error: error,
            name: "awatingDischargeHospitalizationCount",
        };
    }
};

export const PreauthRejectedCount = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/preAuthrejectedcount", payLoad);
        return {
            ok: true,
            data: result,
            error: null,
            name: "preauthRejectedCount",
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error: error,
            name: "preauthRejectedCount",
        };
    }
};

//Count Data

export const PreAuthRequestDetails = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/preauthrequestdetails", payLoad);
        return {
            ok: true,
            data: result,
            error: null,
            name: "preAuthRequestDetails",
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error: error,
            name: "preAuthRequestDetails",
        };
    }
};

export const AwaitingHospitalizationDetails = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/awatinghospitalizationdetails", payLoad);
        return {
            ok: true,
            data: result,
            error: null,
            name: "awatingHospitalizationDetails",
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error: error,
            name: "awatingHospitalizationDetails",
        };
    }
};

export const InHospitalizationDetails = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/inhospitalizationdetails", payLoad);
        return {
            ok: true,
            data: result,
            error: null,
            name: "inHospitalizationDetails",
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error: error,
            name: "inHospitalizationDetails",
        };
    }
};

export const AwaitingDischargeHospitalizationDetails = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/awatingdischargehospitalizationdetails", payLoad);
        return {
            ok: true,
            data: result,
            error: null,
            name: "awatingDischargeHospitalizationDetails",
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error: error,
            name: "awatingDischargeHospitalizationDetails",
        };
    }
};

export const PreauthRejectedDetails = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/preauthrejecteddetails", payLoad);
        return {
            ok: true,
            data: result,
            error: null,
            name: "preauthRejectedDetails",
        };
    } catch (error) {
        return {
            ok: false,
            data: null,
            error: error,
            name: "preauthRejectedDetails",
        };
    }
};
