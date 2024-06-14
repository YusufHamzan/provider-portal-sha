import React from "react";
import { Box, Paper, Typography } from "@mui/material";

const style={
  background:"#313c96",
  color:"#f1f1f1",
  display:"flex",
  justifyContent:"center",
  height:"50px",
  fontSize:"36px"
}
const ThankYou = () => {
  return (
    <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} alignItems={"center"}>
      <img src={"/icons/thank-you.png"} alt="" style={{width:"150px", height:"150px"}}/>
      <Box marginTop={"15px"}>
      <Typography variant="h4" textAlign={"center"}>Your Response is submited Successfully!</Typography>
      <Typography variant="h5" textAlign={"center"}>You will get login details on mail, once you get approved.</Typography>
      </Box>
    </Box>
  );
};

export default ThankYou;
