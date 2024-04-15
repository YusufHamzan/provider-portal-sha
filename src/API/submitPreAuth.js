import axios from "axios";
import { ServiceInstance, SubmitServiceInstance } from "../axiosConfig";
import { decideENV } from "../decideENV";

const providerId = localStorage.getItem('providerId')
export const claimCommandUrl = `https://api.eoxegen.com/claim-command-service/v1/provider/preauths/${providerId}`;

const Instance = axios.create({
    baseURL: claimCommandUrl,
    headers: {
        "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

const uploadPreauthFilesInstance = axios.create({
    baseURL: claimCommandUrl,
    headers: {
        "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
        "Content-Type": "multipart/form-data", // Updated header for this function
        'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
});

export const getServiceTypeDropdown = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/claimType", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const savePreAuthDetails = async (payLoad) => {
    let result;
    try {
        result = await SubmitServiceInstance.post("/savePreAuthDetails", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const savePreAuth = async (payload) => {
    let result;
    try {
        result = await Instance.post("/", payload);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const uploadPreauthFiles = async (id, payload) => {
    let result;
    try {
        result = await uploadPreauthFilesInstance.put(`/${id}/docs`, payload);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const requestPreauthReview = async (id) => {
    let result;
    try {
        result = await Instance.patch(`/${id}?action=requested`);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
