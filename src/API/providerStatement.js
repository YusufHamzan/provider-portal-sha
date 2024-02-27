import { ServiceInstance } from "../axiosConfig";

export const getProviderStatementData = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/claimpaymentstatementDetails", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
