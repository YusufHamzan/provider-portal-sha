import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useKeycloak } from "@react-keycloak/web";


export const ProtectedRoute = ({ children }) => {
    const { keycloak } = useKeycloak();
    const { user } = useAuth();


    if (!keycloak.authenticated) {
        // user is not authenticated
        return <Navigate to="/" />;
    }
    return children;
};
