import { LoadingButton } from '@mui/lab';
import { Box, Button, FormHelperText, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import OtpInput from 'react-otp-input';
import { PreAuthService } from '../../../remote-api/api/claim-services/preauth-services';

const preauthservice = new PreAuthService()
const OTPComponent = ({ id, membershipNo }) => {
  const [otp, setOtp] = useState('');
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otpVerified, setOtpVerified] = useState({
    status: '',
    msg: ''
  });
  const [verifyLoading, setverifyLoading] = useState(false)
  const [generateLoading, setgenerateLoading] = useState(false)
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const generateOTPHandler = () => {
    const payload = { membershipNo: membershipNo }
    if (!payload || !id) {
      alert('Fetch member details first!')
      return
    }
    setgenerateLoading(true);
    preauthservice.generateOTP(payload, id).subscribe({
      next: res => {
        setOtpGenerated(true);
        setCountdown(30);
        setgenerateLoading(false);
        console.log(res);
      },
      error: err => {
        setgenerateLoading(false);
        console.error(err);
        alert('Something went wrong!')
      }
    });
  };


  const OTPVerifyHandler = () => {
    setverifyLoading(true)

    setTimeout(() => {
      setverifyLoading(false);
      setOtpVerified({
        status: 'success',
        msg: 'Successfully verified'
      });
    }, 1000)
  };

  const regenerateOTPHandler = () => {
    setCountdown(30);
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      flexDirection: 'column',
      rowGap: '18px'
    }}>
      {!otpGenerated ?
        <LoadingButton loading={generateLoading} variant='contained' onClick={generateOTPHandler} disableElevation sx={{ textTransform: 'none' }}>Generate OTP</LoadingButton> :
        <>
          <FormHelperText>An OTP has been sent to your registered email address</FormHelperText>
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={4}
            containerStyle={{ columnGap: '32px' }}
            inputStyle={{ width: '32px', height: '48px' }}
            renderSeparator={<span>-</span>}
            renderInput={(props) => <input {...props} />}
          />
          <FormHelperText>
            Did not receive?{' '}
            <span
              style={{ color: countdown > 0 ? 'gray' : 'blue', cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
              onClick={countdown > 0 ? null : regenerateOTPHandler}
            >
              {countdown > 0 ? `Re-generate in ${countdown}s` : 'Re-generate'}
            </span>
          </FormHelperText>
          <LoadingButton loading={verifyLoading} color='success' onClick={OTPVerifyHandler} disableElevation variant='contained' sx={{ textTransform: 'none' }}>Verify!</LoadingButton>
        </>
      }
    </Box>
  );
}

export default OTPComponent;
