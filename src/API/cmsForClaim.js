import axios from "axios";
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

export const claimQueryUrl = "https://api.eoxegen.com/claim-query-service/v1/reimbursements";

const Instance = axios.create({
    baseURL: claimQueryUrl,
    headers: {
        "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

export const getClaimList = async () => {
    let result;
    try {
        result = await Instance.get("/");
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
