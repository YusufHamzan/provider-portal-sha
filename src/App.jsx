import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./Components/ProtectedRoute/ProtectedRoute";
import Spinner from "./Components/Spinner/Spinner";
import { decideENV } from "./decideENV";
import { useKeycloak } from "@react-keycloak/web";

//lazy imports
const Login = lazy(() => import("./Components/Login/Login"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword/ForgotPassword"));
const Layout = lazy(() => import("./Pages/Layout/Layout"));
const Dashboard = lazy(() => import("./Pages/Dashboard/Dashboard"));
const MemberEligibility = lazy(() => import("./Pages/MemberEligibility/MemberEligibility"));
const PreAuthAddDoc = lazy(() => import("./Pages/CashlessAddDoc/PreAuthAddDoc"));
const CmsForPreAuth = lazy(() => import("./Pages/CMSForPreAuth/CmsForPreAuth"));
const PaymentHistory = lazy(() => import("./Pages/PaymentHistory/PaymentHistory"));
const ProviderStatement = lazy(() => import("./Pages/ProviderStatement/ProviderStatement"));
const EmpanelmentDetail = lazy(() => import("./Pages/EmpanelmentDetail/EmpanelmentDetail"));
const PreAuthSearch = lazy(() => import("./Pages/PreAuthSearch/PreAuthSearch"));
const SubmitClaim = lazy(() => import("./Pages/SubmitClaim/SubmitClaim"));
const PaymentReconciliation = lazy(() => import("./Pages/PaymentReconciliation/PaymentReconciliation"));
const RejectedClaims = lazy(() => import("./Pages/RejectedClaims/RejectedClaims"));
const CmsForClaim = lazy(() => import("./Pages/CMSForClaim/CmsForClaim"));
const SubmitPreAuth = lazy(() => import("./Pages/SubmitPreAuth/SubmitPreAuth"));
const TotalPayableAmount = lazy(() => import("./Pages/TotalPayableAmount/TotalPayableAmount"));

function App() {
    const { initialized, keycloak } = useKeycloak();
    const isBrowser = typeof window !== "undefined";

    if (isBrowser && decideENV() === "PROD") {
        document.onkeydown = function (e) {
            if (e.key === "F12") {
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.key === "I") {
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.key === "C") {
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.key === "J") {
                return false;
            }
            if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
                return false;
            }
        };
    }

    useEffect(() => {
        if (keycloak.authenticated) <Navigate to="/dashboard" />;
    }, []);
    if (!initialized) {
        return <Spinner />;
    }

    return (
        <div className="App">
            <Routes>
                {/* <Route
                    path="/"
                    element={
                        <Suspense fallback={Spinner}>
                            <Login />
                        </Suspense>
                    }
                />
                <Route
                    path="/forgot"
                    element={
                        <Suspense fallback={Spinner}>
                            <ForgotPassword />
                        </Suspense>
                    }
                /> */}
                <Route
                    // path="/dashboard"
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <Dashboard />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/membereligibility"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <MemberEligibility />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/preauthadddoc"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <PreAuthAddDoc />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cmsforpreauth"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <CmsForPreAuth />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cmsforclaim"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <CmsForClaim />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/paymenthistory"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <PaymentHistory />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/providerstatement"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <ProviderStatement />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/empanelmentdetail"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <EmpanelmentDetail />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/preauthsearch"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <PreAuthSearch />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/submitclaim"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <SubmitClaim />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/paymentreconciliation"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <PaymentReconciliation />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/rejectedclaims"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <RejectedClaims />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                submitpreauth
                <Route
                    path="/submitpreauth"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <SubmitPreAuth />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/totalpayableamount"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <TotalPayableAmount />
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                {/**Default Route */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Suspense fallback={Spinner}>
                                    <h1>Not Found</h1>
                                </Suspense>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
