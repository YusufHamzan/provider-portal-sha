import { ServiceInstance } from "../axiosConfig";

export const getEmpanelmentDetailsData = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/claimpaymentstatementDetails", payLoad); //change this
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
