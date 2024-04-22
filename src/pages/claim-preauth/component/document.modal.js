import React from 'react';
import { Modal, IconButton, makeStyles } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import PdfReview from './pdf.preview';

const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    position: 'relative', // Set position relative for close button positioning
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    outline: 'none',
    borderRadius: '8px',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
}));

const DocumentModal = ({ document, onClose, baseDocumentURL }) => {
  const classes = useStyles();

  return (
    <Modal
      open={Boolean(document)}
      onClose={onClose}
      className={classes.modal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description">
      <div className={classes.modalContent}>
        <IconButton className={classes.closeButton} edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
        {document && RenderPreview(document, baseDocumentURL)}
      </div>
    </Modal>
  );
};

const RenderPreview = (document, baseDocumentURL) => {
  const { docFormat, documentName } = document;
  const completeURL = `${baseDocumentURL}${documentName}`;

  if (docFormat.split('/')[0] === 'image') {
    return (
      <img
        src={encodeURI(completeURL)} // Complete URL for images
        alt="Document Preview"
        style={{
          width: '100%',
          height: '80vh',
          objectFit: 'contain',
        }}
      />
    );
  } else if (docFormat === 'application/pdf') {
    return (
      <div
        style={{
          width: '80vw',
          height: '80vh',
          objectFit: 'contain',
        }}>
        <PdfReview url={completeURL} onClick={e => e.stopPropagation()} />;
      </div>
    );
  } else {
    return null;
  }
};

export default DocumentModal;
