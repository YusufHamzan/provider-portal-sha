import React, { useContext } from "react";
import { openContext } from "./MenuBarContext";
import "./styles.css";

const MainContent = ({ children }) => {
    const { isOpen } = useContext(openContext);

    return (
        <div className="main_content" data-changemain={`${isOpen}`}>
            <div className="page_content">{children}</div>
        </div>
    );
};

export default MainContent;
