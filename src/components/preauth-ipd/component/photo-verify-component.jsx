import { Box, Button, Grid } from "@mui/material"
import { makeStyles } from "@mui/styles";
import React, { useEffect, useRef, useState } from "react";
import { MemberService } from "../../../remote-api/api/member-services";
import { ProvidersService } from "../../../remote-api/api/provider-services/provider.services";

const useStyles = makeStyles((theme) => ({
  pictureContainer: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    // marginLeft:"10%"
  },
  AccordionSummary: {
    // backgroundColor: theme.palette.background.default,
  },
}));

const memberService = new MemberService();
const providerService = new ProvidersService();

const PhotoValidationComponent = ({ id }) => {
  const [file, setFile] = useState("");
  const [filePart, setFilePart] = useState("");
  const hiddenFileInput = useRef(null);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);
  const [tableData, setTableData] = useState();
  const [fileURL, setFileURL] = useState("");
  const classes = useStyles();
  const [selectedDocument, setSelectedDocument] = React.useState(null);

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  const handleSecondChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileURL(URL.createObjectURL(selectedFile));
  };

  const getImage = (id) => {
    memberService.getMemberImage(id).subscribe((res) => {
      let subscription;
      if (res) {
        subscription = memberService
          .getMemberImageType(id, res?.documentName)
          .subscribe({
            next: (resp) => {
              const blob = new Blob([resp]);
              const url = URL.createObjectURL(blob);
              setSelectedDocument(url);
            },
            error: (error) => {
              console.error("Error fetching image data:", error);
            },
          });
      }
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    });
  };

  const onVerifyClick = () => {
    const formData = new FormData();
    formData.append("file", file);

    providerService.verifyImage(id, formData).subscribe((res) => {
      if (res?.faceMatched) {
        // setSeverity("success");
        // setAlertMsg(`Face matched`);
        alert("Face verified successfuly")
      } else {
        // setSeverity("error");
        // setAlertMsg(`Face does not match`);
        alert("Face does not match")
      }
      // setOpenSnack(true);
    });
  };

  useEffect(() => {

    if (id) {
      getImage(id)
    }
  }, [])

  return (
    <Grid container spacing={2} alignItems='center'>
      <Grid item >
        <Box className={classes.pictureContainer}>
          {selectedDocument ? (
            <img
              src={selectedDocument}
              className={classes.pictureContainer}
            />
          ) : (
            <img
              src={"/icons/no-profile-picture.webp"}
              className={classes.pictureContainer}
            />
          )}
        </Box>
      </Grid>
      <Grid item >
        <img
          style={{
            cursor: "pointer",
            border: "1px solid black",
          }}
          onClick={handleClick}
          src={fileURL ? fileURL : "/icons/uploadImage.png"}
          className={classes.pictureContainer}
        />
        <input
          type="file"
          ref={hiddenFileInput}
          onChange={handleSecondChange}
          accept="image/*"
          style={{ display: "none" }}
        />
      </Grid>
      <Grid item >
        <Button
          variant="contained"
          style={{ background: "#313c96", fontSize: "12px" }}
          onClick={onVerifyClick}
        >
          Verify Image
        </Button>
      </Grid>
    </Grid>
  )
}

export default PhotoValidationComponent