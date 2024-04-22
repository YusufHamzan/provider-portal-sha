// pdf.preview.js
import React, { useState, useEffect } from 'react';
import Axios from 'axios';

const PdfReview = ({ url, onClick }) => {
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
    Axios.get(url, { responseType: 'arraybuffer' })
      .then(response => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        setPdfBlob(blob);
      })
      .catch(error => {
        console.error('Error fetching PDF:', error);
      });
  }, [url]);

  if (pdfBlob) {
    const handleIframeClick = () => {
      if (onClick) {
        onClick();
      }
    };

    return (
      <>
        <iframe
          src={URL.createObjectURL(pdfBlob)}
          title="Document PDF"
          style={{ width: '100%', height: '100%', overflow: 'hidden', border: 'none', cursor: 'pointer' }}
          type="application/pdf"></iframe>
        {!onClick && (
          <p onClick={handleIframeClick} style={{ color: 'blue', fontSize: '12px', margin: '4px' }}>
            Open
          </p>
        )}
      </>
    );
  } else {
    return <div>Loading PDF...</div>;
  }
};

export default PdfReview;
