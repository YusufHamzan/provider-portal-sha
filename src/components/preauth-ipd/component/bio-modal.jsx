import React, { useEffect, useState } from "react";
import { Modal, Box, Button, Typography, IconButton, Paper, Grid, Stack, Divider } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import BiometricComponent from "./biometric";
import OtpComponent from "./otp-component";
import PhotoValidationComponent from "./photo-verify-component";
import { MemberService } from "../../../remote-api/api/member-services";
import ArrowRightAlt from '@mui/icons-material/ArrowRightAlt';
import SendToMobile from '@mui/icons-material/SendToMobile';
import HowToReg from '@mui/icons-material/HowToReg';

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  height: "auto",
  // width: { xs: "95%", sm: "75%", md: "50%" },
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 50,
  p: 10,
};

const memberservice = new MemberService();
// const BioModal = ({ open, setOpen, matchResult, id, membershipNo }) => {
//   const [anotherType, setAnotherType] = useState(false);

//   // console.clear()
//   console.log("id", id);

//   const handleClose = () => setOpen(false);

//   return (
//     <div>
//       {/* <Button onClick={handleOpen}>Open Modal</Button> */}
//       <Modal
//         open={open}
//         onClose={handleClose}
//         aria-labelledby="simple-modal-title"
//         aria-describedby="simple-modal-description"
//       >
//         <Box sx={modalStyle}>
//           <IconButton
//             onClick={handleClose}
//             sx={{
//               position: "absolute",
//               top: 0,
//               right: 0,
//             }}
//           >
//             <ClearIcon />
//           </IconButton>
//           {!anotherType ? (
//             <BiometricComponent
//               matchResult={matchResult}
//               id={id}
//               handleClose={handleClose}
//             />
//           ) : (
//             <OtpComponent
//               id={id}
//               membershipNo={membershipNo}
//               handleClose={handleClose}
//             />
//           )}
//           <Typography
//             onClick={() => setAnotherType((pre) => !pre)}
//             sx={{
//               marginLeft: "20px",
//               fontSize: "12px",
//               color: "Highlight",
//               position: "absolute",
//               bottom: 10,
//               left: 20,
//               cursor: "pointer",
//             }}
//           >
//             {!anotherType
//               ? "Another way of verification?"
//               : "Use Biometric Verification."}
//           </Typography>
//         </Box>
//       </Modal>
//     </div>
//   );
// };

// export default BioModal;


const PaperItem = ({ name, verificationType, setVerificationType }) => {
  return (
    <Paper
      elevation={0}
      onClick={() => setVerificationType(name)}
      sx={{
        margin: '10px',
        width: '180px',
        height: '180px',
        cursor: 'pointer',
        border: verificationType === name ? '1px solid blue' : '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {name}
      {name === 'Biometric' && <FingerprintIcon color={verificationType === name ? "primary" : ""} />}
      {name === 'Otp' && <SendToMobile color={verificationType === name ? "primary" : ""} />}
      {name === 'Photo' && <HowToReg color={verificationType === name ? "primary" : ""} />}
    </Paper>
  )
}

const VerificationModal = ({ open, setOpen, matchResult, id, membershipNo }) => {
  const [verificationType, setVerificationType] = useState(null);
  const [next, setNext] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setVerificationType(null);
    setNext(false);
  };

  const renderComponent = () => {
    switch (verificationType) {
      case 'Biometric':
        return <BiometricComponent matchResult={matchResult} id={id} handleClose={handleClose} />;
      case 'Otp':
        return <OtpComponent id={id} membershipNo={membershipNo} handleClose={handleClose} />;
      case 'Photo':
        return <PhotoValidationComponent id={id} handleClose={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
      <Box
        sx={modalStyle}>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 0, right: 0 }}>
          <ClearIcon />
        </IconButton>

        {!next ? (
          <Box>
            <Typography>Choose a validation method </Typography>
            <Divider />
            <Stack direction="row" sx={{ mt: 2 }} divider={<Divider orientation="vertical" flexItem />} spacing={2}>
              <PaperItem name='Biometric' setVerificationType={setVerificationType} verificationType={verificationType} />
              <PaperItem name='Otp' setVerificationType={setVerificationType} verificationType={verificationType} />
              <PaperItem name='Photo' setVerificationType={setVerificationType} verificationType={verificationType} />
            </Stack>
            <Button disabled={!verificationType} endIcon={<ArrowRightAlt />} onClick={() => setNext(true)} sx={{ position: 'absolute', bottom: 10, right: 20 }}>
              Next
            </Button>
          </Box>
        ) : (
          <Box>
            {renderComponent()}
            <Button onClick={() => setNext(false)} sx={{ position: 'absolute', bottom: 10, right: 20 }}>
              Back
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default VerificationModal;