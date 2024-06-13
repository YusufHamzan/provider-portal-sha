import React from "react";
import ProviderDetails from "../components/signup/provider.details.component";
import { Box, Paper } from "@mui/material";

const style={
  background:"#313c96",
  color:"#f1f1f1",
  display:"flex",
  justifyContent:"center",
  height:"50px",
  fontSize:"36px"
}
const Signup = () => {
  return (
    <Box>
      <Box style={style}>Sign-up</Box>
      <Paper style={{ padding: "3%" }}>
        <ProviderDetails />
      </Paper>
    </Box>
  );
};

export default Signup;
