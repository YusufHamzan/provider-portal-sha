import { ServiceInstance } from "../axiosConfig";

export const getRejectedClaims = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/claimrejectedetails", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
