import React from "react";
import "./styles.css";
import MenuBar from "../../Components/MenuBar/MenuBar";
import Header from "../../Components/Header/Header";
import MenuBarContext from "../../Pages/Layout/MenuBarContext";
import MainContent from "./MainContent";

const Layout = ({ children }) => {
    return (
        <div>
            <MenuBarContext>
                <MenuBar />
                <Header />
                <MainContent children={children} />
            </MenuBarContext>
        </div>
    );
};

export default Layout;
