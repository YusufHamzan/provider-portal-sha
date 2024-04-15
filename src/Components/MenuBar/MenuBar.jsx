import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./MenuBar.css";
import Dashboard from "../../assets/dashboard.png";
import Member from "../../assets/memberEligibility.png";
// import Cashless from "../../assets/Cashless.png";
import AddDoc from "../../assets/AddDoc.png";
import Cms from "../../assets/cms.png";
import Claim from "../../assets/Claim.png";
import History from "../../assets/History.png";
import Provider from "../../assets/Provider.png";
import Preauth from "../../assets/preauth.svg";
import SubmitPreauth from "../../assets/submitPreauth.png";
import RejectedClaim from "../../assets/rejectedclaim.png";
// import Empanelment from "../../assets/Empanelment.png";
// import Enhancement from "../../assets/Enhancement.png";
import Logo from "../../assets/logo-light.c22430c2.svg";
import { removeSpaces } from "../../utils/utils";
import { recognizeSection } from "./helper";
import { openContext } from "../../Pages/Layout/MenuBarContext";
import DashboardIcon from '@mui/icons-material/Dashboard';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import HistoryIcon from '@mui/icons-material/History';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PaidIcon from '@mui/icons-material/Paid';

const MenuBar = () => {
    const [active, setActive] = useState(recognizeSection[window.location.pathname.slice(1)]);
    const { isOpen } = useContext(openContext);

    const getListItems = () => {
        const arr = [
            { item: "Dashboard", img: DashboardIcon },
            { item: "Member Eligibility", img: SupervisedUserCircleIcon },
            // { item: "Submit Cashless", img: Cashless },
            // { item: "Preauth Add Doc", img: AddDoc },
            { item: "Preauth", img: ReceiptIcon },
            { item: "Claim", img: PriceChangeIcon },
            // { item: "Submit Claim", img: Claim },
            // { item: "Submit Preauth", img: SubmitPreauth },
            { item: "Payment History", img: HistoryIcon },
            { item: "Provider Statement", img: ContentPasteIcon },
            // { item: "Empanelment Detail", img: Empanelment },tabnp
            // { item: "Preauth Search", img: Preauth },
            // { item: "Payment Reconciliation", img: PaymentReconciliation },
            // { item: "Rejected Claims", img: RejectedClaim },
            { item: "Total Payable Amount", img: PaidIcon },
            // {
            //   item: "Enhancement Request and Rejection Reopen",
            //   img: Enhancement,
            // },
        ].map((data, i) => {
            return (
                <li key={`_${i}`} className={`${i === active ? "active_item" : "inactive_item"} list`} onClick={() => setActive(i)}>
                    <Link to={`/${removeSpaces(data.item)}`}>
                        {/* <img src={data.img} alt="" className="link_img" style={{ height: "1rem", width: "1rem" }} /> */}
                        <data.img className={`${i === active ? "active_icon" : "inactive_icon"}`} />
                        <span className={`${i === active ? "active_item" : "inactive_item"}`} data-isopen={`${isOpen}`}>
                            {data.item}
                        </span>
                    </Link>
                </li>
            );
        });

        return arr;
    };

    return (
        <div className="menu">
            <div className="sub_menu" style={{ backgroundColor: "#303C95" }} data-willcollapse={`${!isOpen}`}>
                <div>
                    <Link to="/membereligibility">
                        <span className="logo_section">
                            <img src={Logo} alt="" style={{ height: "50px", width: "50px" }} />
                            <span className="name" style={{ color: "white", margin: "20px" }} data-NoShow={`${!isOpen}`}>eOxegen</span>
                        </span>
                    </Link>
                </div>
                <div>
                    <ul className="menu_list" style={{ listStyle: "none" }}>
                        {getListItems()}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MenuBar;
