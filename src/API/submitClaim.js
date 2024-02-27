import axios from "axios";
import { ServiceInstance, SubmitServiceInstance } from "../axiosConfig";

export const claimCommandUrl = "https://api.eoxegen.com/claim-command-service/v1/reimburse";

const Instance = axios.create({
    baseURL: claimCommandUrl,
    headers: {
        "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

export const uploadFiles = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/uploadClaimDocuemts", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
//before
export const getClaimDropDownvalues = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/clauses", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getCurrencyDropDownvalues = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/currencies", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getExpenseTypeDropDownvalues = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/serviceclause", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

//Later
export const getClaimTypeDropDownvalues = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/claimType", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const saveClaimDetails = async (payLoad) => {
    let result;
    try {
        result = await SubmitServiceInstance.post("/saveClaimDetails", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const saveClaim = async (payload) => {
    let result;
    try {
        result = await Instance.post("/", payload);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const uploadReimburseFiles = async (id, payload) => {
    let result;
    try {
        result = await Instance.put(`/${id}/docs`, payload);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const requestReimburseReview = async (id) => {
    let result;
    try {
        result = await Instance.patch(`/${id}?action=requested`);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
