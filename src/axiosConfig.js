import axios from "axios";
import { decideENV } from "./decideENV";

//192.168.100.11:7222 => local
export const ServiceInstance = axios.create({
    baseURL: decideENV() === "DEV" ? import.meta.env.VITE_BaseURL_DEV : import.meta.env.VITE_BaseURL_PROD,
    headers: {
        "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
        "Content-Type": "multipart/form-data",
        'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
});

export const SubmitServiceInstance = axios.create({
    baseURL: decideENV() === "DEV" ? import.meta.env.VITE_BaseURL_DEV : import.meta.env.VITE_BaseURL_PROD,
    headers: {
        "eO2-Secret-Code": import.meta.env.VITE_EO2_SECRET_CODE,
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
});
