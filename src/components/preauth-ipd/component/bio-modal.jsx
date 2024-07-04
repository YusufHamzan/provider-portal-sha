import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, IconButton } from "@mui/material";
import BiometricComponent from "./biometric";
import ClearIcon from "@mui/icons-material/Clear";
import { Height } from "@mui/icons-material";
import OtpComponent from "./otp-component";
import { MemberService } from "../../../remote-api/api/member-services";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  height: "80%",
  width: { xs: "95%", sm: "75%", md: "50%" },
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 50,
  p: 4,
};

const memberservice = new MemberService();
const BioModal = ({ open, setOpen, matchResult, id, membershipNo }) => {
  const [anotherType, setAnotherType] = useState(false);

  // console.clear()
  console.log("id", id);

  const handleClose = () => setOpen(false);

  return (
    <div>
      {/* <Button onClick={handleOpen}>Open Modal</Button> */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Box sx={modalStyle}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
          >
            <ClearIcon />
          </IconButton>
          {!anotherType ? (
            <BiometricComponent
              matchResult={matchResult}
              id={id}
              handleClose={handleClose}
            />
          ) : (
            <OtpComponent
              id={id}
              membershipNo={membershipNo}
              handleClose={handleClose}
            />
          )}
          <Typography
            onClick={() => setAnotherType((pre) => !pre)}
            sx={{
              marginLeft: "20px",
              fontSize: "12px",
              color: "Highlight",
              position: "absolute",
              bottom: 30,
              left: 20,
              cursor: "pointer",
            }}
          >
            {!anotherType
              ? "Another way of verification?"
              : "Use Biometric Verification."}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};

export default BioModal;
