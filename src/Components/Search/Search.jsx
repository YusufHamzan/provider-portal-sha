import React from "react";
import "./styless.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Search = () => {
    return (
        <div>
            <div>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="search_icon" />
                <input type="text" className="input_box" placeholder="Search..." />
            </div>
        </div>
    );
};

export default Search;
