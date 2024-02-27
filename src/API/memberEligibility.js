import { ServiceInstance } from "../axiosConfig";

//Count
export const ValidateMemberGenOTP = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/validatingMember", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const ValidateMember = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/validatemember", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const ValidateMemberWithOTP = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/validatememberotp", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const GetMemberBenefits = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/memberbenifits", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};

export const SearchBynameOrNumber = async (payLoad) => {
    let result;
    try {
        result = await ServiceInstance.post("/memberlist", payLoad);
        return { ok: true, data: result, error: null };
    } catch (error) {
        return { ok: false, data: null, error: error };
    }
};
