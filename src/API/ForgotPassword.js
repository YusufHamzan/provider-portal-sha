import { ServiceInstance } from "../axiosConfig";

export const getOTPforForgotPassword = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/forwardproviderPassword", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const changePassword = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/changeproviderPassword", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
