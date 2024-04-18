import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import 'primeflex/primeflex.css';


export const Eo2v2SearchBox = ({ label, onChange }) => {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    setValue(e.target.value);
    onChange && onChange(e.target.value);
  };

  return (
    <div className="flex justify-content-center align-items-center w-full">
      <span className="p-input-icon-left flex-1 lg:flex-none w-full">
        <i className="pi pi-search" />
        <InputText
          value={value}
          onChange={handleChange}
          placeholder={label || "Search"}
          suffix={<i className="pi pi-search"></i>}
          className="outline-none"
          style={{
            fontSize: "14px",
            height: '36px',
            width: '100%',
            borderRadius: '16px'
          }}
        />
      </span>
    </div>
  );
};


{/*import { InputAdornment, TextField } from "@material-ui/core";


import SearchIcon from '@material-ui/icons/Search';
import React from "react";


export const Eo2v2SearchBox = (props) => {
  const inputStyle = {
    borderRadius: '24px',
    fontSize: '16px',
    width: 'auto',
  };
  const onChange = (e) => {
    Object.prototype.toString.call(props.onChange) == "[object Function]" &&
      props.onChange(e.target.value);
  }

  return <TextField size="small" onChange={onChange} label={props.label || 'Search'} type="search" variant="outlined" fullWidth
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <SearchIcon />
        </InputAdornment>
      ),
      style: inputStyle,
    }}
  />

}*/}