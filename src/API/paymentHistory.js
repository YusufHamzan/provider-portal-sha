import { ServiceInstance } from "../axiosConfig";

export const getPaymentHistoryData = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/claimpaymenthistoryDetails", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
