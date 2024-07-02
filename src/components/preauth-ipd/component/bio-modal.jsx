import React, { useState } from 'react';
import { Modal, Box, Button, Typography, IconButton } from '@mui/material';
import BiometricComponent from './biometric';
import ClearIcon from '@mui/icons-material/Clear';
const BioModal = ({ open, setOpen, matchResult }) => {
  // const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
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
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'auto',
            height: '90%',
            bgcolor: 'background.paper',
            borderRadius: '10px',
            boxShadow: 50,
            p: 4,
          }}
        >
          <IconButton onClick={handleClose} sx={{ mt: 2, float: 'right' }}><ClearIcon /></IconButton>
          <BiometricComponent matchResult={matchResult} />
          <Typography sx={{ fontSize: '10px' }}>Another way of verification</Typography>
        </Box>
      </Modal>
    </div>
  );
};

export default BioModal;
