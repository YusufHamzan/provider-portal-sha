import axios from "axios";
import { ServiceInstance, SubmitServiceInstance } from "../axiosConfig";
import { decideENV } from "../decideENV";

export const MasterdDataUrl = "https://api.eoxegen.com/master-data-service/v1";

const Instance = axios.create({
    baseURL: MasterdDataUrl,
    headers: {
        "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
});

export const getPreAuthDetailsFromMemberNo = async (membershipNo) => {
    const Instance = axios.create({
        baseURL: decideENV() === "DEV" ? import.meta.env.VITE_BaseURL_MEMBER : import.meta.env.VITE_BaseURL_PROD,
        headers: {
            "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
    });
    let result;
    try {
        result = await Instance.get(`?key=MEMBERSHIP_NO&value=${membershipNo}`);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getBenefits = async () => {
    let result;
    try {
        result = await Instance.get(`/benefits?page=0&size=10000`);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getServicetypes = async () => {
    let result;
    try {
        result = await Instance.get(`servicetypes/867854950947827712/services?page=0&size=1000&summary=true&active=true&nonGroupedServices=false`);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getCurrencies = async () => {
    let result;
    try {
        result = await Instance.get(`/currencies?page=0&size=10000`);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getServiceTypesForInvoice = async () => {
    let result;
    try {
        result = await Instance.get(`servicetypes/?page=0&size=1000&summary=true&active=true`);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getDiagnosis = async () => {
    let result;
    try {
        result = await Instance.get(`/servicetypes/867854874246590464/services?page=0&size=1000&summary=true&active=true&nonGroupedServices=false`);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getServicesById = async (id) => {
    let result;
    try {
        result = await Instance.get(`/servicetypes/${id}/services`);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
