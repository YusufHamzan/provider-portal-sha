import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
// import providernew from "../../assets/provider_final.svg";
import LoginGraphic from "../../assets/loginGraphic.svg";
import "./styles.css";
import LoginForm from "../Form/Form";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";

const Login = () => {
    const { user } = useAuth();
    const [width, setWidth] = useState(760);

    useEffect(() => {
        function updateSize() {
            if (window.innerWidth < 760) {
                setWidth(window.innerWidth);
            }
        }
        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    if (user) {
        return <Navigate to="/membereligibility" />;
    }

    return (
        <main className="main__login">
            <section className="section__1">
                <div className="logo">
                    <a href="/">
                        <img src={logo} alt="" />
                    </a>
                </div>
                <div className="login__graphic">
                    <img src={LoginGraphic} alt="" />
                    {/* <LoginGraphic width={width} /> */}
                </div>
            </section>
            <section className="section__2">
                <LoginForm />
            </section>
        </main>
    );
};

export default Login;
