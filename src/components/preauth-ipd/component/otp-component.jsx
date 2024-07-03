import { LoadingButton } from '@mui/lab';
import { Alert, Box, Button, FormHelperText, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import OtpInput from 'react-otp-input';
import { Check, CircleNotificationsOutlined } from '@mui/icons-material';
import { MemberService } from '../../../remote-api/api/member-services';

const memberservice = new MemberService()
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
    if (!payload.membershipNo || !id) {
      alert('Fetch member details first!')
      return
    }
    setgenerateLoading(true);
    memberservice.generateOTP(payload, id).subscribe({
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

    const payload = { otp: otp }
    if (!payload.otp) {
      alert('Generate OTP first!')
      return
    }
    if (!id) {
      alert('Fetch member details!')
      return
    }

    memberservice.verifyOTP(payload, id).subscribe({
      next: res => {
        setverifyLoading(false);
        setOtpVerified({
          status: !!res.otpValidationStatus ? 'success' : 'failed',
          msg: res.message
        });
        console.log(res);
      },
      error: err => {
        setverifyLoading(false);
        setOtpVerified({
          status: 'failed',
          msg: 'Something went wrong.'
        });
        console.error(err);
        alert('Something went wrong!')
      }
    });

  };

  const regenerateOTPHandler = () => {
    setCountdown(30);
    generateOTPHandler()
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      flexDirection: 'column',
      rowGap: '18px',
      position: 'relative'
    }}>
      {!otpGenerated ?
        <LoadingButton loading={generateLoading} variant='contained' onClick={generateOTPHandler} disableElevation sx={{ textTransform: 'none' }}>Generate OTP</LoadingButton> :
        <>
          <FormHelperText>An OTP has been sent to your registered email address</FormHelperText>
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            containerStyle={{ columnGap: '16px' }}
            inputStyle={{ width: '28px', height: '36px' }}
            renderSeparator={<span>-</span>}
            renderInput={(props) => <input {...props} />}
          />
          <FormHelperText>
            Did not receive?{' '}
            <span
              style={{ color: countdown > 0 ? 'gray' : 'blue', cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
              onClick={() => countdown > 0 ? null : regenerateOTPHandler()}
            >
              {countdown > 0 ? `Re-generate in ${countdown}s` : 'Re-generate'}
            </span>
          </FormHelperText>
          <LoadingButton loading={verifyLoading} color='success' onClick={OTPVerifyHandler} disableElevation variant='contained' sx={{ textTransform: 'none' }}>Verify!</LoadingButton>
        </>
      }

      <Box sx={{ display: 'flex', justifyContent: 'center', }}>
        {!!otpVerified.status ? otpVerified.status === 'success' ?
          <Alert icon={<Check fontSize="inherit" />} severity="success">
            {otpVerified.msg}
          </Alert> :
          <Alert icon={<CircleNotificationsOutlined fontSize="inherit" />} severity="error">
            {otpVerified.msg}
          </Alert> : <></>
        }
      </Box>
    </Box>
  );
}

export default OTPComponent;
