import { ServiceInstance } from "../axiosConfig";

//Count
export const PreAuthSearchDetails = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/claimcashlessdetails", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const getSinglePreAuthDetails = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/preauthDetils", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
