import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStorage } from "./useSessionStorage";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useSessionStorage("user", null);
    const navigate = useNavigate();

    // call this function when you want to authenticate the user
    const login = async (data) => {
        setUser(data);
        sessionStorage.setItem("user", JSON.stringify(data));
        navigate("/membereligibility");
    };

    // call this function to sign out logged in user
    const logout = () => {
        setUser(null);
        sessionStorage.removeItem("memberDetails");
        sessionStorage.removeItem("memberBenefitsTableData");
        sessionStorage.removeItem("memberBenefitsTableHeaders");
        navigate("/", { replace: true });
    };

    const userDetail = useMemo(
        () => ({
            user,
        }),
        [user]
    );
    const value = { ...userDetail, login, logout };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
