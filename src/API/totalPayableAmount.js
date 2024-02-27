import { ServiceInstance } from "../axiosConfig";

export const getTotalPayableAmount = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/claimtotalamountpayable", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getTotalPayableAmountDetails = async (payLoad, name) => {
    let result;
    try {
        result = await ServiceInstance.post("/claimtotalamountpayabledetails", payLoad);
        return { ok: true, data: result, error: null, name };
    } catch (error) {
        return { ok: false, data: null, error: error, name };
    }
};
