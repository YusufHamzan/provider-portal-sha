import React from 'react';
import { Grid, IconButton, Typography } from "@mui/material";
import { withStyles } from "@mui/styles";
import Carousel from "react-material-ui-carousel";
import { useLocation, useParams } from "react-router-dom";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import PdfReview from './component/pdf.preview';

const useStyles = theme => ({
  navButtonsWrapperProps: {
    top: '50%',
    height: '12%',
  },
});
const RenderPreview = (document, baseDocumentURL) => {
  const { docFormat, documentName } = document;
  const completeURL = `${baseDocumentURL}${documentName}`;

  if (docFormat.split('/')[0] === 'image') {
    // if (docFormat === 'image/png') {
    return (
      <img
        src={encodeURI(completeURL)} // Complete URL for images
        alt="Document Thumbnail"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          // aspectRatio: '1',
          borderRadius: '8px',
          objectFit: 'cover',
        }}
      />
    );
  } else if (docFormat === 'application/pdf') {
    return <PdfReview url={completeURL} />;
  } else {
    return null;
  }
};

function useQuery1() {
  return new URLSearchParams(useLocation().search);
}
const SliderComponent = ({ items, classes }) => {
  const query = useQuery1();
  const { id } = useParams();
  let preId = query.get('preId');
  if (!preId) {
    preId = id?.split('-')[1];
  }
  const baseDocumentURL = `https://api.eoxegen.com/claim-query-service/v1/preauths/${preId}/docs/`;
  return (
    <div>
      <Carousel
        autoPlay={false}
        indicators={false}
        navButtonsAlwaysVisible={items?.length > 1 && true}
        navButtonsWrapperProps={{
          className: classes.navButtonsWrapperProps,
        }}>
        {items?.map((item, i) => {
          return (
            // <DocumentPreview documents={item} preAuthId={i} />
            <Grid item key={item.id}>
              <div style={{ position: 'relative', borderRadius: '6px', border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                {RenderPreview(item, baseDocumentURL)}
                <a href={`${baseDocumentURL}${item.documentName}`} download>
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
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)')}>
                    <CloudDownloadIcon />
                  </IconButton>
                </a>
              </div>
              <div style={{ textAlign: 'left', marginTop: '8px' }}>
                <Typography
                  variant="subtitle2"
                  style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={document.documentName}>
                  {item.documentOriginalName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {item.documentType}
                </Typography>
              </div>
            </Grid>
          );
        })}
      </Carousel>
    </div>
  );
};

export default withStyles(useStyles)(SliderComponent);
