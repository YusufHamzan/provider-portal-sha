import axios from "axios";
import { ServiceInstance, SubmitServiceInstance } from "../axiosConfig";
import { decideENV } from "../decideENV";

export const claimQueryUrl = "https://api.eoxegen.com/claim-query-service/v1/preauths";

const Instance = axios.create({
    baseURL: claimQueryUrl,
    headers: {
        "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

export const getPreAuthList = async () => {
    let result;
    try {
        result = await Instance.get("/");
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};