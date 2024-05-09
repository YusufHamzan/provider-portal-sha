import { makeStyles } from "@mui/styles";
import { ClaimService } from "../../remote-api/api/claim-services";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import React from "react";
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

const reimService = new ClaimService();

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
  buttonDanger: {
    backgroundColor: "#dc3545",
    color: "#f1f1f1",
  },
}));

function useQuery1() {
  return new URLSearchParams(useLocation().search);
}

export default function ClaimsDocumentComponent(props) {
  const providerId = localStorage.getItem("providerId");
  const docTempalte = {
    documentType: "Prescription",
    docFormat: "",
    documentName: "",
    documentOriginalName: "",
  };

  const classes = useStyles();
  const navigate = useNavigate();
  const { preId, id } = useParams();
  const query = useQuery1();
  const { memId } = localStorage.getItem("claimreimid")
    ? localStorage.getItem("claimreimid")
    : "";

  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [reimDetails, setreimDetails] = React.useState({});

  const [documentList, setDocumentList] = React.useState([{ ...docTempalte }]);

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

  const onRequestForReview = () => {
    let reimID = localStorage.getItem("claimreimid");
    if (id) {
      reimID = id;
    }
    reimService.editReimbursement({}, reimID, "requested").subscribe((res) => {
      if (query1.get("type") === "credit") {
        navigate("/credit-claims");
      } else {
        navigate("/claims");
      }
      // window.location.reload();
    });
  };

  const handleAddDoc = (e, index) => {
    let reimID = localStorage.getItem("claimreimid");
    if (!reimID) {
      let claimreimid = `r-${query.get("preId")}`;
      reimID = claimreimid;
      localStorage.setItem("claimreimid", claimreimid);
    }
    if (id) {
      reimID = id;
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
console.log("file", file, list)
      reimService.addDoc(reimID, formData, providerId).subscribe((response) => {
        reimService
          .getReimbursementById(reimID, providerId)
          .subscribe((res) => {
            setreimDetails(res);
          });
        list[index]["documentName"] = response.id;
        list[index]["docFormat"] = response.docFormat;
        setDocumentList(list);
        setUploadSuccess(true);
        // populateStepTwo(id);
      });
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

  React.useEffect(() => {
    if (localStorage.getItem("claimreimid")) {
      populateStepTwo(localStorage.getItem("claimreimid"));
    }
  }, [localStorage.getItem("claimreimid")]);

  const populateStepTwo = (id) => {
    reimService.getReimbursementById(id, providerId).subscribe((res) => {
      setreimDetails(res);
      if (res.documents && res.documents.length !== 0) {
        setDocumentList(res.documents);
      }
    });
  };

  return (
    <Paper elevation="none">
      <Box p={3} my={2}>
        {documentList.map((x, i) => {
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
              <Grid item xs={4}>
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
              <Grid item xs={4}>
                <TextField
                  variant="standard"
                  id="standard-basic"
                  name="documentName"
                  value={x.documentOriginalName}
                  disabled
                  label="Document name"
                />
              </Grid>

              {query.get("mode") !== "viewOnly" && (
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
              )}

              <Grid
                item
                xs={2}
                style={{ display: "flex", alignItems: "center" }}
              >
                {query.get("mode") !== "viewOnly" &&
                  documentList.length !== 1 && (
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
                {query.get("mode") !== "viewOnly" &&
                  documentList.length - 1 === i && (
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ marginLeft: "5px" }}
                      onClick={handleAddDocumentList}
                    >
                      <AddIcon />
                    </Button>
                  )}
              </Grid>
            </Grid>
          );
        })}
      </Box>

      <hr />
      <Box p={3} my={2}>
        {query.get("mode") !== "viewOnly" && (
          <Grid item xs={12} style={{ display: "flex", alignItems: "end" }}>
            <Button
              className="mr10"
              variant="contained"
              color="primary"
              onClick={onRequestForReview}
              // disabled
              // disabled={ reimDetails.subStatus === 'DOCUMENT_UPLOADED' || reimDetails.subStatus === null}
              disabled={
                reimDetails.reimbursementStatus !== "DRAFT" &&
                (reimDetails.subStatus === "DOCUMENT_UPLOADED" ||
                  reimDetails.subStatus === null)
              }
            >
              Request
            </Button>
          </Grid>
        )}
      </Box>
    </Paper>
  );
}
