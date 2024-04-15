import axios from "axios";
import { ServiceInstance, SubmitServiceInstance } from "../axiosConfig";
import { decideENV } from "../decideENV";

export const claimQueryUrl = "https://api.eoxegen.com/claim-query-service/v1/provider/preauths";
let providerId = localStorage.getItem("providerId")
const Instance = axios.create({
    baseURL: `https://api.eoxegen.com/claim-query-service/v1/provider/preauths/${providerId}?page=0&size=10&summary=true&active=true&&sort=rowCreatedDate+dsc`,
    // baseURL: claimQueryUrl,
    headers: {
        "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

export const getPreAuthList = async (data) => {
    console.log(data)
    let result;
    try {
        result = await Instance.get();
        // result = await Instance.get(`/${providerId}`, { params: data });
        return { ok: true, data: result?.data, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};