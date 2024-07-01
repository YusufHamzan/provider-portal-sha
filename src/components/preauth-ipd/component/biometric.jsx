import { Fingerprint, Compare } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, IconButton, Typography } from '@mui/material';
import React, { useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const idQuality = 100;
const BiometricComponent = ({ matchResult }) => {
  // const [fingerprintData, setFingerprintData] = useState(null);
  const [fingerprintData1, setFingerprintData1] = useState(null);
  const [fingerprintData2, setFingerprintData2] = useState(null);
  const [scanninng1, setScanning1] = useState(false)
  const [scanninng2, setScanning2] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchData, setMatchData] = useState({})
  const [error, setError] = useState(null);

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
            width: { xs: '100%', sm: '320px' },
            height: '420px',
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
          <Typography>Fingerprint : 1 (Server)</Typography>
          {scanninng1 ? <Box
            component="img"
            src='/icons/Fingerprint Gif.gif'
            alt="Fingerprint 1"
            title='aiuniau'
            sx={{ maxWidth: '50%', maxHeight: '50%', borderRadius: '50%' }}
          /> :
            fingerprintData1?.ErrorCode === 0 ?
              <Box
                component="img"
                src={`data:image/bmp;base64,${fingerprintData1.BMPBase64}`}
                alt="Fingerprint 1"
                sx={{ width: '280px', height: '320px', borderRadius: '10px' }}
              /> : `${fingerprintData1?.ErrorCode ? 'Error ' + fingerprintData1?.ErrorCode + ':' : ''} No data`
          }
          <LoadingButton
            onClick={scan1Handler}
            endIcon={<Fingerprint />}
            loading={scanninng1}
            loadingPosition="end"
            variant="outlined"
            sx={{ mt: 2 }}
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
            width: { xs: '100%', sm: '320px' },
            height: '420px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {matchData?.MatchingScore > idQuality && <Box style={{ position: 'absolute', top: -15, right: -15, }}>
            <CheckCircleIcon color='success' style={{ fontSize: '44px' }} />
          </Box>}
          <Typography>{`Fingerprint : 2 (Device: ${fingerprintData2?.Model ? fingerprintData2?.Model : '-'} ) `}</Typography>
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
                sx={{ width: '280px', height: '320px', borderRadius: '10px' }}
              /> : `${fingerprintData2?.ErrorCode ? 'Error ' + fingerprintData2?.ErrorCode + ':' : ''} No data`
          }
          <LoadingButton
            onClick={scan2Handler}
            endIcon={<Fingerprint />}
            loading={scanninng2}
            loadingPosition="end"
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <span>Scan</span>
          </LoadingButton>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <LoadingButton
          onClick={matchHandler}
          endIcon={<Compare />}
          loading={matchLoading}
          loadingPosition="end"
          variant="contained"
          color='secondary'
        >
          <span>Match Biometric</span>
        </LoadingButton>
      </Box>
    </Box >
  );
};

export default BiometricComponent;