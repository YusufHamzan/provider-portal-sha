import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./hooks/useAuth";
import "bootstrap/dist/css/bootstrap.min.css";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { keycloak } from "./keycloak";

const root = ReactDOM.createRoot(document.getElementById("root"));
const tokenLogger = (tokens) => {
    localStorage.setItem("token", tokens.token);
};
const eventLogger = (event, error) => {
    console.log("onKeycloakEvent", event, error);
};
root.render(
    <ReactKeycloakProvider authClient={keycloak} onTokens={tokenLogger} onEvent={eventLogger} initOptions={{ onLoad: "login-required" }}>
        <React.StrictMode>
            <BrowserRouter>
                {/* <AuthProvider> */}
                <App />
                {/* </AuthProvider> */}
            </BrowserRouter>
        </React.StrictMode>
        //{" "}
    </ReactKeycloakProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
