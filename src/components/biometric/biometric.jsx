import React, { useState } from 'react';

const BiometricComponent = () => {
  // const [fingerprintData, setFingerprintData] = useState(null);
  const [fingerprintData1, setFingerprintData1] = useState(null);
  const [fingerprintData2, setFingerprintData2] = useState(null);
  const [scanninng1, setScanning1] = useState(false)
  const [scanninng2, setScanning2] = useState(false)
  const [matchData, setMatchData] = useState(false)
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
    if (fingerprintData1?.ErrorCode > 0 || fingerprintData2?.ErrorCode > 0) {
      alert("Please scan two fingers to verify!!");
      return;
    }
    const uri = "https://localhost:8443/SGIMatchScore";
    const params = new URLSearchParams({
      Timeout: "10000",
      template1: encodeURIComponent(fingerprintData1.TemplateBase64),
      template2: encodeURIComponent(fingerprintData2.TemplateBase64),
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

    console.log('click 1')
    callSGIFPGetData(
      (data) => {
        setScanning1(false)
        setFingerprintData1(data)
      },
      (error) => setError(error)
    );
  }
  const scan2Handler = () => {
    setScanning2(true)
    console.log('click 2')
    callSGIFPGetData(
      (data) => {
        setScanning2(false)
        setFingerprintData2(data)
      },
      (error) => setError(error)
    );
  }

  console.log('scan1: ', fingerprintData1)
  console.log('scan2: ', fingerprintData2)
  console.log('matchData: ', matchData)

  const matchHandler = () => {
    matchSGIFPGetData(
      (data) => {
        setScanning1(false)
        setMatchData(data)
      },
      (error) => setError(error)
    );
  }

  return (
    <div>
      <h1>Test run</h1>
      {error && <div>Error: {error}</div>}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }}>

        <div style={{
          margin: '12px',
          border: '1px solid black',
          padding: '8px',
          width: '320px',
          height: '420px',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h3>Fingerprint Data: 1 (Mock Server)</h3>
          {scanninng1 ? 'Place your finger....' :
            fingerprintData1?.ErrorCode === 0 ?
              <img
                src={`data:image/bmp;base64,${fingerprintData1.BMPBase64}`}
                alt="Fingerprint 1"
              /> : `Error  ${fingerprintData1?.ErrorCode ? fingerprintData1?.ErrorCode + ':' : ''} No data`
          }
          <div style={{ margin: '15px' }} >
            <button onClick={scan1Handler}>scan 1</button>
          </div>
        </div>
        <div style={{
          margin: '12px',
          border: '1px solid black',
          padding: '8px',
          width: '320px',
          height: '420px',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h3>{`Fingerprint Data: 1 (Plugged Device: ${fingerprintData2?.Model}) `}</h3>
          {scanninng2 ? 'Place your finger....' :
            fingerprintData2?.ErrorCode === 0 ?
              <img
                src={`data:image/bmp;base64,${fingerprintData2?.BMPBase64}`}
                alt="Fingerprint 2"
              /> : `Error ${fingerprintData2?.ErrorCode ? fingerprintData2?.ErrorCode + ':' : ''} No data`
          }
          <div style={{ margin: '15px' }} >
            <button onClick={scan2Handler}>scan 2</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center' }} >
        <button onClick={matchHandler}>Match</button>
      </div>


    </div>
  );
};

export default BiometricComponent;