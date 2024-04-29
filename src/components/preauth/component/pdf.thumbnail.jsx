import React, { useEffect, useState } from 'react';

const PdfThumbnail = ({ pdfUrl }) => {
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(`/public/Appointment Reciept (2).pdf`);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = (event) => {
            setThumbnail(event.target.result);
        };

        // Read the PDF file as a data URL
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error fetching or reading the PDF:', error);
      }
    };

    fetchPdf();
  }, [pdfUrl]);

  return (
    <div>
      {thumbnail && <img src={thumbnail} alt="PDF Thumbnail" />}
    </div>
  );
};

export default PdfThumbnail;
