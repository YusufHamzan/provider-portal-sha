import { ServiceInstance } from "../axiosConfig";

export const CmsPreAuthDetails = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/cmsforpreauth", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const CmsTotalCaseDetails = async (payLoad, name) => {
    let result;
    try {
        result = await ServiceInstance.post("/cmsforpreauthtotalcasedetails", payLoad);
        return { ok: true, data: result, error: null, name };
    } catch (error) {
        return { ok: false, data: null, error: error, name };
    }
};

export const CmsStatusWiseDetails = async (payLoad, name) => {
    let result;
    try {
        result = await ServiceInstance.post("/cmsforpreauthstatuswisedetails", payLoad);
        return { ok: true, data: result, error: null, name };
    } catch (error) {
        return { ok: false, data: null, error: error, name };
    }
};
