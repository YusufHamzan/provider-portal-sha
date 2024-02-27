import { ServiceInstance } from "../axiosConfig";

export const Login = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/validateproviderlogin", Object.assign({ requiredOTP: "Y" }, payLoad));
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const verifyWithOTP = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/validateproviderloginotp", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
