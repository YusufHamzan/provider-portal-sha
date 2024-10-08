import { Grid, IconButton, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import PdfReview from './pdf.preview';
import { config } from '../../../remote-api/configuration';

const DocumentPreview = ({ documents, preAuthId }) => {
    const baseDocumentURL = `${config.rootUrl}/claim-query-service/v1/preauths/${preAuthId}/docs/`;

    return (
        <Grid container spacing={3}>
            {documents.map((document) => (
                <Grid item key={document.id}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '6px', border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                        {RenderPreview(document, baseDocumentURL)}
                        <a href={`${baseDocumentURL}${document.documentName}`} download>
                            <IconButton
                                style={{
                                    position: 'absolute',
                                    top: 1,
                                    right: 1,
                                    padding: '4px',
                                    color: '#fff',
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    transition: 'background-color 0.3s',
                                }}
                                // Add onMouseEnter and onMouseLeave to handle hover effect
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
                            >
                                <DownloadIcon />
                            </IconButton>

                        </a>
                    </div>
                    <div style={{ textAlign: 'left', marginTop: '8px' }}>
                        <Typography variant="subtitle2" style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={document.documentName}>
                            {document.documentOriginalName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {document.documentType}
                        </Typography>
                    </div>
                </Grid>
            ))}
        </Grid>
    );
};

const RenderPreview = (document, baseDocumentURL) => {
    const { docFormat, documentName } = document;
    const completeURL = `${baseDocumentURL}${documentName}`;
    const [img, setImg] = useState();

  useEffect(() => {
    const fetchImg = async () => {
      try {
        const res = await fetch(completeURL, {
          headers: {
            Authorization: `Bearer ${window.getToken()}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        let file = await res.blob();
        setImg(URL.createObjectURL(file));
      } catch (error) {
        alert('Failed to fetch the image');
        // Handle the error (e.g., display a fallback image or show an error message)
      }
    };
    fetchImg();
  }, []);


    if (docFormat.split("/")[0] === 'image') {
        return (
            <img
                // src={encodeURI(completeURL)} // Complete URL for images
                src={img} // Complete URL for images
                alt="Document Thumbnail"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    borderRadius: '8px',
                    objectFit: 'cover'
                }}
            />
        );
    } else if (docFormat === 'application/pdf') {
        return (
            <PdfReview url={completeURL} />
        );
    }
    else {
        return (
            null
        );
    }
};


export default DocumentPreview;
