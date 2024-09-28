import React, { Suspense, useState } from "react";
import Layout from "./Layout";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./keycloak";
import { jwtDecode } from "jwt-decode";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import "primeicons/primeicons.css";
import AppRoutes from "./Routes";
import { Route, Routes, useLocation } from "react-router-dom";
import Signup from "./pages/signup";
import ThankYou from "./pages/thank-you";

// https://api.eoxegen.com/client-query-service/v1/clients/search-by-mobile/9874561230
//single 

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const eventLogger = (event, error) => { };

  const tokenLogger = (tokens) => {
    const { name, email, preferred_username, resource_access, providerId } =
      jwtDecode(tokens.token);
    const user_details = { name, email, preferred_username };
    const access_details = [];
    for (let key in resource_access) {
      const filteredArray = resource_access[key].roles.filter((n) => {
        return access_details.indexOf(n) === -1;
      });
      access_details.push(...filteredArray);
    }
    const decode = jwtDecode(tokens.token);

    localStorage.setItem("token", tokens.token);
    localStorage.setItem("providerId", decode.providerId);
    localStorage.setItem("provider", decode.name);
    localStorage.setItem("email", decode.email);


    // TODO: Remove me
    access_details.push("CLAIM");
    localStorage.setItem("user_details", JSON.stringify(user_details));
    localStorage.setItem("access_details", JSON.stringify(access_details));
    window.getToken = () => tokens.token;
    setIsLoading(false);
  };

  const LoadingComponent = () => {
    return (
      <Box
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        height={"75vh"}
      >
        <CircularProgress color="secondary" />;
      </Box>
    );
  };

  return (
    <>
      {location.pathname === "/signup" || location.pathname === "/thank-you" ? (
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      ) : (
        <ReactKeycloakProvider
          authClient={keycloak}
          onEvent={eventLogger}
          initOptions={{ onLoad: "login-required" }}
          onTokens={tokenLogger}
        >
          {isLoading ? (
            <LoadingComponent />
          ) : (
            <Layout>
              <AppRoutes />
            </Layout>
          )
          }
        </ReactKeycloakProvider>
      )
      }
    </>
  );
}

export default App;
