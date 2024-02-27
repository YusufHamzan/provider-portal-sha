import { ServiceInstance } from "../axiosConfig";

export const CmsForClaimDetails = async (payLoad, name) => {
    let result;
    try {
        result = await ServiceInstance.post("/cmsforrc", payLoad);
        return { ok: true, data: result, error: null, name };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const CmsForTotalClaimTypeDetails = async (payLoad, name) => {
    let result;
    try {
        result = await ServiceInstance.post("/cmsforclaimtypetotalcasedetails", payLoad);
        return { ok: true, data: result, error: null, name };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const CmsForTotalSubClaimTypeDetails = async (payLoad, name) => {
    let result;
    try {
        result = await ServiceInstance.post("/cmsforsubclaimtypetotalcasedetails", payLoad);
        return { ok: true, data: result, error: null, name };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const CmsForTotalRCCaseDetails = async (payLoad, name) => {
    let result;
    try {
        result = await ServiceInstance.post("/cmsforrctotalcasedetails", payLoad);
        return { ok: true, data: result, error: null, name };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
