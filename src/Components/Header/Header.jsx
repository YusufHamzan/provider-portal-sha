import React, { useState, useRef, useContext } from "react";
import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faChevronDown, faGear } from "@fortawesome/free-solid-svg-icons";
import Avatar from "../../assets/avatar.png.jpg";
import GALogo from "../../assets/logoGA.jpg";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "react-bootstrap";
import { useOnClickOutside } from "../../hooks/useClickOutside";
import { openContext } from "../../Pages/Layout/MenuBarContext";
import { useKeycloak } from "@react-keycloak/web";

// import Dashboard from "../../assets/dashboard.png";

const Header = () => {
    const [showLogout, setShowLogout] = useState(false);
    const [userDetails] = useState(JSON.parse(sessionStorage.getItem("user")));
    const logOutRef = useRef();
    const { logout } = useAuth();
    const { toggleMenuBar, isOpen } = useContext(openContext);
    const { keycloak } = useKeycloak();

    useOnClickOutside(logOutRef, () => setShowLogout(false));

    const handleLogout = () => {
        sessionStorage.removeItem("memberDetails");
        sessionStorage.removeItem("memberBenefitsTableData");
        sessionStorage.removeItem("memberBenefitsTableHeaders");

        keycloak.logout();
    };

    return (
        <header className="layout_header" data-headertoggle={`${isOpen}`}>
            <div className="navbar_header">
                <div className="d-flex">
                    <button className="expand" onClick={toggleMenuBar}>
                        <FontAwesomeIcon icon={faBars} className="fa-lg" />
                    </button>
                    <img src={GALogo} alt="" width={150} />
                    {/* <Search /> Turn this on when global search functionality comes */}
                </div>
                <div className="d-flex">
                    <div>
                        <button className="btn_header">
                            <img src={Avatar} alt="Avatar" className="header_img" />
                            {/* <span className="heading">Hi, {userDetails?.providerName}</span> */}
                            <span className="heading">Hi, {keycloak.tokenParsed.name}</span>
                            <FontAwesomeIcon icon={faChevronDown} className=" fa-solid" onClick={() => setShowLogout(!showLogout)} />
                            {showLogout && (
                                <Button ref={logOutRef} className="logout__button" onClick={() => handleLogout()}>
                                    Logout
                                </Button>
                            )}
                        </button>
                        <button className="settings">
                            <FontAwesomeIcon icon={faGear} className=" fa-gear fa-lg" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
