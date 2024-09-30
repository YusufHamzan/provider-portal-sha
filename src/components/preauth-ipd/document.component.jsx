import { makeStyles } from "@mui/styles";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PreAuthService } from "../../remote-api/api/claim-services";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
// import { Button } from "primereact/button";
import DeleteIcon from "@mui/icons-material/Delete";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import AddIcon from "@mui/icons-material/Add";
import PdfReview from "./component/pdf.preview";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { config } from "../../remote-api/configuration";

const preAuthService = new PreAuthService();

// const validationSchema = yup.object({
//     name: yup.string("Enter your Name").required("Name is required"),
//     type: yup.string("Choose Agent type").required("Agent Type is required"),
//     contact: yup
//         .string("Enter your Contact Number")
//         .required("Contact number is required")
//         .test('len', 'Must be exactly 10 digit', val => val.length === 10),
//     email: yup
//         .string('Enter your email')
//         .email('Enter a valid email'),
//     natureOfAgent: yup
//         .string("Enter Nature of Agent")
//         .required("Agent Nature is required"),
// });

const useStyles = makeStyles((theme) => ({
  input1: {
    width: "50%",
  },
  clientTypeRadioGroup: {
    flexWrap: "nowrap",
    "& label": {
      flexDirection: "row",
    },
  },
  formControl: {
    minWidth: 182,
  },
  formControl1: {
    // margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  inputRoot: {
    "&$disabled": {
      color: "black",
    },
  },
  disabled: {},
  actionContainer: {
    display: "flex",
    justifyContent: "flex-end",
  },
  saveBtn: {
    marginRight: "5px",
  },
  buttonPrimary: {
    backgroundColor: "#313c96",
    color: "#f1f1f1",
  },
  buttonSecondary: {
    backgroundColor: "#01de74",
    color: "#f1f1f1",
  },
  buttonDanger: {
    backgroundColor: "#dc3545",
    color: "#f1f1f1",
  },
}));

export default function ClaimsDocumentComponent(props) {
  const docTempalte = {
    documentType: "Prescription",
    docFormat: "",
    documentName: "",
    documentOriginalName: "",
  };

  // const query2 = useQuery1();
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  let providerId = localStorage.getItem("providerId");
  const preauthid = id ? id : localStorage.getItem("preauthid");
  const baseDocumentURL = `${config.rootUrl}/claim-query-service/v1/preauths/${preauthid}/docs/`;

  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [preAuthDetails, setPreAuthDetails] = React.useState({});

  const [documentList, setDocumentList] = React.useState([{ ...docTempalte }]);

  const handleClose = () => {
    localStorage.removeItem("preauthid");
    navigate("/preauths");
    // window.location.reload();
  };

  // const useObservable = (observable, setter) => {
  //     useEffect(() => {
  //         let subscription = observable.subscribe((result) => {
  //             setter(result.content);
  //         });
  //         return () => subscription.unsubscribe();
  //     }, [observable, setter]);
  // };

  const handleInputChangeDocumentType = (e, index) => {
    const { name, value } = e.target;
    const list = [...documentList];
    list[index][name] = value;
    setDocumentList(list);
  };

  const handleRemoveDocumentList = (index) => {
    const list = [...documentList];
    list.splice(index, 1);
    setDocumentList(list);
  };

  const handleAddDocumentList = () => {
    setDocumentList([
      ...documentList,
      {
        ...docTempalte,
      },
    ]);
  };
  let preID = localStorage.getItem("preauthid");
  if (id) {
    preID = id;
  }

  const onRequestForReview = () => {
    let preID = localStorage.getItem("preauthid");
    if (id) {
      preID = id;
    }
    const action =
      preAuthDetails.preAuthStatus === "APPROVED" ? "enhancement" : "requested";

    if (preAuthDetails.preAuthStatus == "ADD_DOC_REQUESTED") {
      preAuthService.addDocAfterReviw(preID).subscribe((response) => {
        navigate("/preauths");
      });
    } else {
      preAuthService
        .editPreAuth({}, preID, action, providerId)
        .subscribe((res) => {
          navigate("/preauths");
          // window.location.reload();
        });
    }
  };

  const handleAddDoc = (e, index) => {
    let preID = localStorage.getItem("preauthid");
    if (id) {
      preID = id;
    }
    const file = e.target["files"][0];

    const reader = new FileReader();

    reader.onload = function () {
      const list = [...documentList];
      list[index]["documentOriginalName"] = file.name;

      setDocumentList(list);

      const formData = new FormData();
      formData.append("docType", list[index]["documentType"]);
      formData.append("filePart", file);
      if (preID) {
        preAuthService
          .addDoc(preID, formData, providerId)
          .subscribe((response) => {
            preAuthService
              .getPreAuthById(preID, providerId)
              .subscribe((response) => {
                setPreAuthDetails(response);
              });
            list[index]["documentName"] = response.id;
            list[index]["docFormat"] = response.docFormat;
            setDocumentList(list);
            setUploadSuccess(true);
            // populateStepTwo(id);
          });
      }
    };
    reader.readAsDataURL(file);
  };

  // function Alert(props) {
  //   return <Alert elevation={6} variant="filled" {...props} />;
  // }

  const handleFileUploadMsgClose = (event, reason) => {
    setUploadSuccess(false);
  };

  React.useEffect(() => {
    if (id) {
      populateStepTwo(id);
    }
  }, [id]);

  // React.useEffect(() => {
  //   if (localStorage.getItem('preauthid')) {
  //     populateStepTwo(localStorage.getItem('preauthid'));
  //   }
  // }, [localStorage.getItem('preauthid')]);

  const populateStepTwo = (id) => {
    preAuthService.getPreAuthById(id).subscribe((res) => {
      setPreAuthDetails(res);
      if (res.documents && res.documents.length !== 0) {
        setDocumentList(res.documents);
      }
    });
  };
  
  return (
    <Paper elevation="none">
      {preAuthDetails.preAuthStatus === "ADD_DOC_REQUESTED" && (
        <Box
          sx={{
            background: "rgba(255,49,49,0.3)",
            borderRadius: "8px",
            border: "1px solid rgba(255,49,49,1)",
            padding: "6px",
            display: "flex",
            gap: "4px",
            marginTop: "12px",
          }}
        >
          <InfoOutlinedIcon color="red" />
          {preAuthDetails?.addDocRemark}
        </Box>
      )}
      <Box p={3} my={2}>
        {documentList.map((x, i) => {
          const { docFormat, documentName } = x;
          const completeURL = `${baseDocumentURL}${documentName.replace(
            / /g,
            "%20"
          )}`;
          return (
            <Grid
              container
              spacing={3}
              key={i}
              style={{ marginBottom: "15px" }}
            >
              {/* <Snackbar
                open={uploadSuccess}
                autoHideDuration={3000}
                onClose={handleFileUploadMsgClose}
              >
                <Alert onClose={handleFileUploadMsgClose} severity="success">
                  File uploaded successfully
                </Alert>
              </Snackbar> */}
              <Grid item xs={3}>
                <FormControl className={classes.formControl}>
                  <InputLabel
                    id="demo-simple-select-label"
                    style={{ marginBottom: "0px" }}
                  >
                    Document type
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name="documentType"
                    variant="standard"
                    value={x.documentType}
                    disabled={!!x.documentName}
                    onChange={(e) => handleInputChangeDocumentType(e, i)}
                  >
                    <MenuItem value="Prescription">Prescription</MenuItem>
                    <MenuItem value="Bill">Bill</MenuItem>
                    {/* {identificationTypes.map(ele => {
                                            return <MenuItem value={ele.code}>{ele.name}</MenuItem>
                                        })} */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  id="standard-basic"
                  name="documentName"
                  variant="standard"
                  value={x.documentOriginalName}
                  disabled
                  label="Document name"
                />
              </Grid>

              <Grid item xs={2}>
                {docFormat.split("/")[0] === "image" ? (
                  <img
                    src={completeURL} // Complete URL for images
                    alt="Document Thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                ) : docFormat === "application/pdf" ? (
                  <PdfReview url={completeURL} />
                ) : null}
              </Grid>

              {/* {query2.get('mode') !== 'viewOnly' && ( */}
              <Grid
                item
                xs={2}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <input
                  className={classes.input}
                  id={"contained-button-file" + i.toString()}
                  single
                  name="document"
                  type="file"
                  disabled={!!x.documentName}
                  onChange={(e) => handleAddDoc(e, i)}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor={"contained-button-file" + i.toString()}
                  style={{ width: "50%", marginBottom: 0 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    type="button"
                    className={classes.buttonPrimary}
                    component="span"
                    style={
                      !!x.documentName ? { backgroundColor: "#C9DEFF" } : {}
                    }
                  >
                    <AddAPhotoIcon />
                  </Button>
                </label>

                {/* </label> */}
              </Grid>
              {/* )} */}

              {/* {query2.get('mode') !== 'viewOnly' && ( */}
              <Grid
                item
                xs={2}
                style={{ display: "flex", alignItems: "center" }}
              >
                {documentList.length !== 1 && (
                  <Button
                    className={`mr10 p-button-danger ${classes.buttonDanger}`}
                    onClick={() => handleRemoveDocumentList(i)}
                    variant="contained"
                    color="secondary"
                    style={{ marginLeft: "5px" }}
                  >
                    <DeleteIcon />
                  </Button>
                )}
                {documentList.length - 1 === i && (
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.buttonPrimary}
                    style={{ marginLeft: "5px" }}
                    onClick={handleAddDocumentList}
                  >
                    <AddIcon />
                  </Button>
                )}
              </Grid>
              {/* )} */}
            </Grid>
          );
        })}
      </Box>

      <hr />
      {/* {query2.get('mode') !== 'viewOnly' && ( */}
      <Box p={3} my={2}>
        <Grid item xs={12} style={{ display: "flex", alignItems: "end" }}>
          {localStorage.getItem("directApprovedPreauth") != "Yes" && (
            <Button
              className={`mr10 ${classes.buttonPrimary}`}
              variant="contained"
              color="primary"
              onClick={onRequestForReview}
              disabled={
                !preAuthDetails.preAuthStatus ||
                (preAuthDetails.preAuthStatus === "DRAFT" &&
                  preAuthDetails?.subStatus != "DOCUMENT_UPLOADED")
              }
            >
              {preAuthDetails.preAuthStatus === "APPROVED"
                ? "Request Enhancement"
                : "Request"}
            </Button>
          )}
        </Grid>
      </Box>
      {/* )} */}
    </Paper>
  );
}
