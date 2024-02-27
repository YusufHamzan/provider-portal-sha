import React, { createContext, useEffect, useState } from "react";

export const openContext = createContext({});
const MenuBarContext = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (window.innerWidth < 1262) {
            setIsOpen(false)
        }
    }, [window.innerWidth])
    const toggleMenuBar = () => {
        setIsOpen(!isOpen);
    };
    return <openContext.Provider value={{ isOpen, toggleMenuBar }}>{children}</openContext.Provider>;
};

export default MenuBarContext;
