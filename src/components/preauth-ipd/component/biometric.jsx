import { Fingerprint, Compare, Check } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Box, FormHelperText, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { errorCodes } from './errorCodes';
import { MemberService } from '../../../remote-api/api/member-services';

const idQuality = 100;
const memberservice = new MemberService()
const BiometricComponent = ({ matchResult, id, handleClose }) => {
  // const [fingerprintData, setFingerprintData] = useState(null);
  const [fingerprintData1, setFingerprintData1] = useState({
    ErrorCode: null,
    BMPBase64: '',
    TemplateBase64: ''
  });
  const [fingerprintData2, setFingerprintData2] = useState(null);
  const [scanninng1, setScanning1] = useState(false)
  const [scanninng2, setScanning2] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchData, setMatchData] = useState({})
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      return
    }
    memberservice.getBiometric(id).subscribe({
      next: res => {
        setFingerprintData1({
          ErrorCode: 0,
          BMPBase64: res.bmpBase64,
          TemplateBase64: res.templateBase64
        })
      },
      error: err => {
        setFingerprintData1({
          ErrorCode: 500,
          BMPBase64: '',
          TemplateBase64: ''
        })
        console.log('err ', err)
        alert('Could not get biometric details!')
      }

    })
  }, [])

  if (!id) {
    alert('Fetch user details first!')
    handleClose()
    return
  }

  const callSGIFPGetData = (successCall, failCall) => {
    const uri = "https://localhost:8443/SGIFPCapture";
    const params = new URLSearchParams({
      Timeout: "10000",
      Quality: "50",
      // licstr: encodeURIComponent('your_secugen_license_here'),
      templateFormat: "ISO",
      imageWSQRate: "0.75"
    });

    fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then(data => successCall(data))
      .catch(error => failCall(error.message));
  };

  const matchSGIFPGetData = (successCall, failCall) => {
    const uri = "https://localhost:8443/SGIMatchScore";
    const params = new URLSearchParams({
      Timeout: "10000",
      template1: encodeURIComponent(fingerprintData1?.TemplateBase64),
      template2: encodeURIComponent(fingerprintData2?.TemplateBase64),
      // licstr: encodeURIComponent('your_secugen_license_here'),
      templateFormat: "ISO",

    });

    fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Network response was not ok');
        }
      })
      .then(data => successCall(data))
      .catch(error => failCall(error.message));
  };


  const scan1Handler = () => {
    setScanning1(true)
    setMatchData({})

    console.log('click 1')
    callSGIFPGetData(
      (data) => {
        setScanning1(false)
        setFingerprintData1(data)
      },
      (error) => {
        setScanning1(false)
        setError(error)
      }
    );
  }
  const scan2Handler = () => {
    setScanning2(true)
    setMatchData({})
    console.log('click 2')
    callSGIFPGetData(
      (data) => {
        setScanning2(false)
        setFingerprintData2(data)
      },
      (error) => {
        setScanning2(false)
        setError(error)
      }
    );
  }

  console.log('scan1: ', fingerprintData1)
  console.log('scan2: ', fingerprintData2)
  console.log('matchData: ', matchData)


  const matchHandler = () => {
    if (!fingerprintData1?.TemplateBase64 || !fingerprintData2?.TemplateBase64) {
      alert("Please scan two fingers to verify!!");
      return;
    }
    setMatchLoading(true)

    matchSGIFPGetData(
      (data) => {
        setMatchLoading(false)
        if (data.ErrorCode == 0) {
          if (data.MatchingScore >= idQuality) {
            matchResult('Matched')
            alert("MATCHED ! (" + data.MatchingScore + ")");
          }
          else {
            matchResult('Not Matched !')
            alert("NOT MATCHED ! (" + data.MatchingScore + ")");

          }
        }
        else {
          alert("Error Scanning Fingerprint ErrorCode = " + data.ErrorCode);
        }
        setMatchData(data)
      },
      (error) => {
        setMatchLoading(false)
        setError(error)
      }
    );
  }

  return (
    <Box>
      {error && <Typography color="error">Error: {error}</Typography>}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          p: 2
        }}
      >
        <Box
          sx={{
            boxShadow: '0 0 0 0.5px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            borderRadius: '10px',
            p: 2,
            width: { xs: '100%', sm: '280px' },
            height: '380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {matchData?.MatchingScore > idQuality && <Box style={{ position: 'absolute', top: -15, right: -15, }}>
            <CheckCircleIcon color='success' style={{ fontSize: '44px' }} />
          </Box>
          }
          <Typography sx={{ fontSize: '14px' }}>Fingerprint : 1 (Server)</Typography>
          {scanninng1 ? <Box
            component="img"
            src='/icons/Fingerprint Gif.gif'
            alt="Fingerprint 1 gif"
            sx={{ maxWidth: '50%', maxHeight: '50%', borderRadius: '50%' }}
          /> :
            fingerprintData1?.ErrorCode === 0 ?
              <Box
                component="img"
                src={`data:image/bmp;base64,${fingerprintData1?.BMPBase64}`}
                // src={`https://artatmacarthur.weebly.com/uploads/1/3/2/3/13232743/6266845_orig.jpg`}
                alt="Fingerprint 1"
                sx={{ width: '180px', maxHeight: '240px', borderRadius: '10px', border: '1px solid grey' }}
              /> :
              <>
                <Typography sx={{ fontSize: '14px' }}>
                  {`${fingerprintData1?.ErrorCode ? 'Error ' + fingerprintData1?.ErrorCode + '*:' : ''} No data`}
                </Typography>

                {fingerprintData1?.ErrorCode &&
                  <FormHelperText>
                    {'*' + errorCodes[fingerprintData1?.ErrorCode]}
                  </FormHelperText>
                }
              </>
          }
          <LoadingButton
            onClick={scan1Handler}
            endIcon={<Fingerprint />}
            loading={scanninng1}
            loadingPosition="end"
            variant="outlined"
            size='small'
            sx={{ mt: 2, fontSize: '12px' }}
          >
            <span>Scan</span>
          </LoadingButton>
        </Box>
        <Box
          sx={{
            boxShadow: '0 0 0 0.5px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            borderRadius: '10px',
            p: 2,
            width: { xs: '100%', sm: '280px' },
            height: '380px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {matchData?.MatchingScore > idQuality && <Box style={{ position: 'absolute', top: -15, right: -15, }}>
            <CheckCircleIcon color='success' style={{ fontSize: '44px' }} />
          </Box>}
          <Typography sx={{ fontSize: '14px' }}>{`Fingerprint : 2 (Device: ${fingerprintData2?.Model ? fingerprintData2?.Model : '-'} ) `}</Typography>
          {scanninng2 ? <Box
            component="img"
            src='/icons/Fingerprint Gif.gif'
            alt="Fingerprint 2"
            title='aiuniau'
            sx={{ maxWidth: '50%', maxHeight: '50%', borderRadius: '50%' }}
          /> :
            fingerprintData2?.ErrorCode === 0 ?
              <Box
                component="img"
                src={`data:image/bmp;base64,${fingerprintData2?.BMPBase64}`}
                alt="Fingerprint 2"
                sx={{ width: '180px', height: '240px', borderRadius: '10px', border: '1px solid grey' }}
              /> :
              <>
                <Typography sx={{ fontSize: '14px' }}>
                  {`${fingerprintData2?.ErrorCode ? 'Error ' + fingerprintData2?.ErrorCode + '*:' : ''} No data`}
                </Typography>

                {fingerprintData2?.ErrorCode &&
                  <FormHelperText>
                    {'*' + errorCodes[fingerprintData2?.ErrorCode]}
                  </FormHelperText>
                }
              </>
          }
          <LoadingButton
            onClick={scan2Handler}
            endIcon={<Fingerprint />}
            loading={scanninng2}
            loadingPosition="end"
            variant="outlined"
            size='small'
            sx={{ mt: 2, fontSize: '12px' }}
          >
            <span>Scan</span>
          </LoadingButton>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', }}>
        <LoadingButton
          onClick={matchHandler}
          endIcon={<Compare />}
          loading={matchLoading}
          loadingPosition="end"
          variant="contained"
          color='secondary'
          size='small'
          sx={{ fontSize: '12px' }}
        >
          <span>Match Biometric</span>
        </LoadingButton>
      </Box>
    </Box >
  );
};

export default BiometricComponent;