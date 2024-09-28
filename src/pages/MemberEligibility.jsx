// import { Box } from "@mui/material";

// const MemberEligibility = () => {
//   return (
//     <>
//       <Box>
//         MemberEligibility
//       </Box>
//     </>
//   );
// };
// export default MemberEligibility;

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  IconButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  Divider,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import moment from "moment/moment";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MemberService } from "../remote-api/api/member-services";
import { BenefitService } from "../remote-api/api/master-services/benefit-service";
import { ServiceTypeService } from "../remote-api/api/master-services/service-type-service";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ProvidersService } from "../remote-api/api/provider-services/provider.services";
import { Eo2v2DataGrid } from "../components/eo2v2.data.grid";
import { Observable, map } from "rxjs";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { CheckCircle, Fingerprint } from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
// import BioModal from "../../components/preauth-ipd/component/bio-modal";
import BioModal from "../components/preauth-ipd/component/bio-modal";
import { useState } from "react";
import { Button as PButton } from "primereact/button";
import { RetailUserService } from "../remote-api/api/master-services/retail-users-service";
const memberService = new MemberService();
const benefitService = new BenefitService();
const providerService = new ProvidersService();

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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

const TypographyStyle2 = {
  fontSize: "12px",
  fontFamily: '"Roboto", "Helvetica", "Arial", sans - serif',
  fontWeight: "400",
  alignItems: "end",
  display: "flex",
  textTransform: "capitalize",
};

const TypographyStyle1 = {
  fontSize: "13px",
  fontFamily: '"Roboto", "Helvetica", "Arial", sans - serif',
  alignItems: "end",
  fontWeight: "600",
  display: "flex",
  textTransform: "capitalize",
};

// const providerService = new ProvidersService();
const serviceDiagnosis = new ServiceTypeService();
const retailuserservice = new RetailUserService();

// let ps$ = providerService.getProviders();
let ad$ = serviceDiagnosis.getServicesbyId("867854874246590464", {
  page: 0,
  size: 1000,
  summary: true,
  active: true,
  nonGroupedServices: false,
});

const columnsDefinations = [
  { field: "benefit", headerName: "Benefit" },
  { field: "waitingPeriod", headerName: "Waiting Period" },
  { field: "maxLimit", headerName: "Max Limit(KSH)" },
  {
    field: "consumed",
    headerName: "Consumed(KSH)",
    body: (rowData) => (
      <span
        style={{
          cursor: "pointer",
          textDecoration: "underline",
          color: "blue",
        }}
        // onClick={() => {
        //   setShowServices(false);
        //   getClaimsByBenefit(rowData?.benefitId);
        // }}
      >
        {rowData.consumed}
      </span>
    ),
  },
  { field: "balance", headerName: "Balance(KSH)" },
];

export default function MemberEligibility() {
  const navigate = useNavigate();
  const query = useQuery();
  const theme = useTheme();
  const [enteredMembershipNo, setEnteredMembershipNo] = React.useState();
  const [isLoading, setIsLoading] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState();
  const [openSnack, setOpenSnack] = React.useState(false);
  const [claimTableData, setClaimTableData] = React.useState();
  const [memberData, setMemberData] = React.useState();
  const [dependentData, setDependentData] = React.useState();
  const [benefitData, setBenefitData] = React.useState();
  const [showServices, setShowServices] = React.useState(false);
  const [diagnosisList, setDiagnosisList] = React.useState([]);
  const [providerList, setProviderList] = React.useState([]);
  const classes = useStyles();
  const [searchType, setSearchType] = React.useState("national_id");
  const [membershipNumber, setMembershipNumber] = React.useState();
  const [severity, setSeverity] = React.useState();
  const [openClientModal, setOpenClientModal] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [biomodalopen, setBioModalopen] = React.useState(false);
  const [memberName, setMemberName] = React.useState({
    name: "",
    policyNumber: "",
    age: "",
    relations: "",
    enrolmentDate: new Date(),
    enrolentToDate: new Date(),
    enrolmentFromDate: new Date(),
    insuranceCompany: "",
    corporateName: "",
    membershipNo: "",
    memberName: "",
    gender: "",
    policyCode: "",
    policyType: "",
    policyPeriod: "",
    planName: "",
    planScheme: "",
    productName: "",
  });
  const [file, setFile] = React.useState("");
  const [filePart, setFilePart] = React.useState("");
  const hiddenFileInput = React.useRef(null);
  const [showBalanceDetails, setShowBalanceDetails] = React.useState(false);
  const [tableData, setTableData] = React.useState();
  const [fileURL, setFileURL] = React.useState("");

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };
  const handleSecondChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileURL(URL.createObjectURL(selectedFile));
  };

  const handleChange = (event) => {
    setSearchType(event.target.value);
  };

  const onMemberShipNumberChange = (e) => {
    setMembershipNumber(e.target.value);
  };

  const populateMemberFromSearch = (type) => {
    if (membershipNumber) {
      if (type === "name") {
        getMemberDetails(membershipNumber);
      } else {
        getMemberDetails(membershipNumber);
      }
    }
  };

  const handleopenClientModal = () => {
    setOpenClientModal(true);
  };

  const handleClosed = () => {
    setOpenClientModal(false);
  };

  const matchResult = (result) => {};

  const handleSelect = (data) => {
    setMemberData(data);
    getImage(data?.id);
    memberService
      .getMemberBalance(data?.membershipNo)
      .subscribe((resesponse) => {
        const temp = resesponse.map((item) => {
          const benefit = benefitData?.find((ele) => ele.id === item.benefit);
          item.benefitId = benefit?.id;
          item.benefit = benefit?.name;
          item.consumed = item.maxLimit - item.balance;
          return item;
        });
        setTableData(temp);
        setShowBalanceDetails(true);
      });
    handleClosed();
  };

  const getImage = (id) => {
    memberService.getMemberImage(id).subscribe((res) => {
      // setImageData(res);
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

  const getMemberDetails = (id) => {
    let pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
    };

    if (searchType === "name") {
      pageRequest.name = id;
    }
    if (searchType === "membership_no") {
      pageRequest.value = id;
      pageRequest.key = "MEMBERSHIP_NO";
    }
    if (searchType === "national_id") {
      pageRequest.value = id;
      pageRequest.key = "IDENTIFICATION_DOC_NUMBER";
    }
    if (searchType === "passport_number") {
      pageRequest.value = id;
      pageRequest.key = "PASSPORT_NUMBER";
    }
    if (searchType === "birth_certificate_number") {
      pageRequest.value = id;
      pageRequest.key = "BIRTH_CERTIFICATE_NUMBER";
    }

    if (searchType !== "national_id") {
      setAlertMsg(`Currently National ID search type is allowed only`);
      setOpenSnack(true);
    } else {
      memberService.getMember(pageRequest).subscribe((res) => {
        if (res.content?.length > 0) {
          // if (searchType === "name") {
          //   setMemberName({ res });
          //   handleopenClientModal();
          // } else {
          setMemberData(res.content[0]);
          setIsLoading(false);
          // getImage(res?.content[0]?.id);
          memberService
            .getMemberBalance(res?.content[0]?.membershipNo)
            .subscribe((resesponse) => {
              const temp = resesponse.map((item) => {
                const benefit = benefitData?.find(
                  (ele) => ele.id === item.benefit
                );
                item.benefitId = benefit?.id;
                item.benefit = benefit?.name;
                item.consumed = item.maxLimit - item.balance;
                return item;
              });
              setTableData(temp);
              setShowBalanceDetails(true);
            });
          // }
        } else {
          let pgreq = {};
          if (searchType === "national_id") {
            pgreq.nationalId = id;
          } else if (searchType === "passport_number") {
            pgreq.passport_number = id;
          } else if (searchType === "birth_certificate_number") {
            pgreq.birth_certificate_number = id;
          } else {
            pgreq = {};
          }

          retailuserservice.fetchAndSaveMemberDetails(pgreq).subscribe({
            next: (res) => {
              setTimeout(() => {
                memberService.getMember(pageRequest).subscribe((res) => {
                  if (res.content?.length > 0) {
                    setMemberData(res.content[0]);
                    setShowViewDetails(true);
                    setMemberIdentified(true);
                  } else {
                    setAlertMsg("No Data Found!!!");
                    setOpenSnack(true);
                  }
                  setIsLoading(false);
                });
              }, 1000 * 45);
            },
            error: (error) => {
              console.error("Error fetching member details:", error);
            },
          });
        }
      });
    }
  };

  const onVerifyClick = () => {
    const formData = new FormData();
    formData.append("file", file);

    providerService.verifyImage(memberData?.id, formData).subscribe((res) => {
      if (res?.faceMatched) {
        setSeverity("success");
        setAlertMsg(`Face matched`);
      } else {
        setSeverity("error");
        setAlertMsg(`Face does not match`);
      }
      setOpenSnack(true);
    });
  };

  const configuration = {
    enableSelection: false,
    scrollHeight: "285px",
    pageSize: 10,
  };

  const data$ = new Observable((subscriber) => {
    subscriber.next(tableData);
  });

  const dataSource$ = () => {
    return data$.pipe(
      map((data) => {
        // data.content = data;
        // console.log("dataaaaa", data);
        return data;
      })
    );
  };

  const benefitLookup = tableData?.reduce((acc, el) => {
    acc[el.benefitStructureId] = el.benefitName;
    return acc;
  }, {});

  const [memberIdentified, setMemberIdentified] = useState(false);
  const [contributionPaid, setContributionPaid] = useState(false);
  const [biometricInitiated, setBiometricInitiated] = useState(false);
  const [biometricResponseId, setbiometricResponseId] = useState("");
  const [bioMetricStatus, setBioMetricStatus] = useState("");
  const [contributionResponseId, setContributionResponseId] = useState("");

  const handleCheckStatus = () => {
    memberService.biometricStatus(biometricResponseId).subscribe((data) => {

      if (data.status === "SUCCESS" && data?.result === "no_match") {
        setBioMetricStatus("FAILED");
        return;
      }

      setBioMetricStatus(data?.status);
    });
  };

  const handleInitiate = () => {
    setBiometricInitiated(true);
    const payload = {
      subject_id_number: formik.values.memberShipNo,
      // subject_id_number: "26263348",
      // subject_id_number: "31746114",  //DO NOT REMOVE
      // relying_party_agent_id_number: "27759855",
      relying_party_agent_id_number: "P6592234",
      notification_callback_url:
        "https://shaapi.eo2cloud.com/member-command-service/v1/public/sha-member/biometric/callback",
      reason: "reason for creating the request",
      total_attempts: 5,
      expiry_in_seconds: 3600,
      service_id: "medical-care",
    };
    memberService.initiateBiometric(payload).subscribe((data) => {
      setbiometricResponseId(data.id);
    });
  };

  const handleContributionInitiate = () => {
    memberservice
      .initiateContribution(
        memberData?.memberId,
        memberData?.identificationDocNumber
      )
      .subscribe((data) => {
        setContributionPaid(true);
        setContributionResponseId(data.id);
      });
  };

  return (
    <>
      <Snackbar
        open={openSnack}
        autoHideDuration={3000}
        onClose={() => {
          setOpenSnack(false);
          setAlertMsg("");
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert variant="filled" severity={severity} icon="">
          {alertMsg}
        </Alert>
      </Snackbar>
      <Paper elevation={3} style={{ padding: 15 }}>
        <Grid container spacing={3} style={{ marginBottom: "20px" }}>
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <Select
              label="Select"
              variant="standard"
              value={searchType}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="national_id">National ID</MenuItem>
              <MenuItem value="passport_number">Passport Number</MenuItem>
              <MenuItem value="birth_certificate_number">
                Birth Certificate Number
              </MenuItem>
            </Select>
          </Grid>

          {searchType === "membership_no" && (
            <Grid item xs={12} sm={6} md={4} style={{ display: "flex" }}>
              <TextField
                id="standard-basic"
                variant="standard"
                // value={formik.values.memberShipNo}
                onChange={onMemberShipNumberChange}
                name="searchCode"
                label="Membership Code"
                style={{ flex: "1", marginRight: "5px" }}
              />

              <Button
                className={`responsiveButton ${classes.buttonPrimary}`}
                variant="contained"
                onClick={() => {
                  setMemberBasic({});
                  setIsLoading(true);
                  populateMemberFromSearch("number");
                }}
                type="button"
                style={{
                  borderRadius: "10px",
                  background: "#313c96",
                  fontSize: "12px",
                }}
              >
                {isLoading ? (
                  <CircularProgress
                    sx={{ color: "white", width: "20px", height: "20px" }}
                  />
                ) : (
                  "Search"
                )}
              </Button>
            </Grid>
          )}

          {searchType === "name" && (
            <Grid item xs={12} sm={6} md={4} style={{ display: "flex" }}>
              <TextField
                id="standard-basic"
                // value={formik.values.memberShipNo}
                onChange={onMemberShipNumberChange}
                variant="standard"
                name="searchCode"
                style={{ marginLeft: "10px", flex: "1" }}
                label="Member Name"
              />

              <Button
                variant="contained"
                onClick={() => {
                  setIsLoading(true);
                  populateMemberFromSearch("name");
                }}
                className={classes.buttonPrimary}
                color="primary"
                type="button"
                style={{
                  marginLeft: "3%",
                  borderRadius: "10px",
                  fontSize: "12px",
                  background: "#313c96",
                }}
              >
                {isLoading ? (
                  <CircularProgress
                    sx={{ color: "white", width: "20px", height: "20px" }}
                  />
                ) : (
                  "Search"
                )}
              </Button>

              {openClientModal && (
                <Dialog
                  open={openClientModal}
                  onClose={handleClosed}
                  aria-labelledby="form-dialog-title"
                  disableEnforceFocus
                >
                  <DialogTitle id="form-dialog-title">Members</DialogTitle>

                  <DialogContent>
                    {memberName?.res?.content &&
                    memberName?.res?.content?.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Membership No</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Mobile No</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {memberName?.res?.content?.map((item) => (
                              <TableRow key={item.membershipNo}>
                                <TableCell>{item.membershipNo}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.mobileNo}</TableCell>
                                <TableCell>
                                  <Button
                                    onClick={() => handleSelect(item)}
                                    className={classes.buttonPrimary}
                                  >
                                    Select
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <p>No Data Found</p>
                    )}
                  </DialogContent>

                  <DialogActions>
                    <Button onClick={handleClosed} className="p-button-text">
                      Cancel
                    </Button>
                    {/* <Button onClick={} color="primary">
                        Submit
                      </Button> */}
                  </DialogActions>
                </Dialog>
              )}
            </Grid>
          )}
          {searchType === "national_id" && (
            <Grid item xs={12} sm={6} md={4} style={{ display: "flex" }}>
              <TextField
                id="standard-basic"
                // value={formik.values.memberShipNo}
                onChange={onMemberShipNumberChange}
                variant="standard"
                name="searchCode"
                style={{ marginLeft: "10px", flex: "1" }}
                label="National ID"
              />

              <Button
                variant="contained"
                onClick={() => {
                  setMemberData({});
                  setIsLoading(true);
                  populateMemberFromSearch("name");
                }}
                className={classes.buttonPrimary}
                color="primary"
                type="button"
                style={{
                  marginLeft: "3%",
                  borderRadius: "10px",
                  fontSize: "12px",
                  background: "#313c96",
                }}
              >
                {isLoading ? (
                  <CircularProgress
                    sx={{ color: "white", width: "20px", height: "20px" }}
                  />
                ) : (
                  "Search"
                )}
              </Button>

              {/* Dialog component goes here */}
              {openClientModal && (
                <Dialog
                  open={openClientModal}
                  onClose={handleClosed}
                  aria-labelledby="form-dialog-title"
                  disableEnforceFocus
                >
                  <DialogTitle id="form-dialog-title">Members</DialogTitle>

                  <DialogContent>
                    {memberName?.res?.content &&
                    memberName?.res?.content?.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Membership No</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Mobile No</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {memberName?.res?.content?.map((item) => (
                              <TableRow key={item.membershipNo}>
                                <TableCell>{item.membershipNo}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.mobileNo}</TableCell>
                                <TableCell>
                                  <Button
                                    onClick={() => handleSelect(item)}
                                    className={classes.buttonPrimary}
                                  >
                                    Select
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <p>No Data Found</p>
                    )}
                  </DialogContent>

                  <DialogActions>
                    <Button onClick={handleClosed} className="p-button-text">
                      Cancel
                    </Button>
                    {/* <Button onClick={} color="primary">
                        Submit
                      </Button> */}
                  </DialogActions>
                </Dialog>
              )}
            </Grid>
          )}

          {/* <Grid item style={{ display: "flex" }}>
            <IconButton
              onClick={() => setBioModalopen(true)}
              // size="large"
              aria-label="fingerprint"
              color="primary"
            >
              <Fingerprint sx={{ width: "2rem", height: "2rem" }} />
            </IconButton>
          </Grid> */}
        </Grid>
      </Paper>

      {/* {
        <BioModal
          matchResult={matchResult}
          open={biomodalopen}
          setOpen={setBioModalopen}
          id={memberData?.memberId}
          membershipNo={memberData?.membershipNo}
        />
      } */}

      {memberData && (
        <Paper elevation={3} style={{ padding: 15, marginTop: "15px" }}>
          <Grid container spacing={3} style={{ marginBottom: "20px" }}>
            <Grid item xs={12} container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    position: "relative",
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    height: "60px",
                  }}
                >
                  <Typography variant="subtitle1">
                    Member Identification
                  </Typography>
                  {memberIdentified ? (
                    <CheckCircle
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "green",
                      }}
                    />
                  ) : (
                    <ErrorIcon
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "red",
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    position: "relative",
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    height: "60px",
                  }}
                >
                  <Grid container alignItems="center">
                    <Typography
                      variant="subtitle1"
                      style={{ marginRight: "12px" }}
                    >
                      Member Biometric
                    </Typography>
                    {!bioMetricStatus ? (
                      <ErrorIcon
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "red",
                        }}
                      />
                    ) : null}
                    {!bioMetricStatus ? (
                      biometricInitiated && biometricResponseId ? (
                        <PButton
                          label="Check status"
                          severity="help"
                          text
                          onClick={handleCheckStatus}
                        />
                      ) : (
                        <PButton
                          label="Initiate"
                          severity="help"
                          text
                          onClick={handleInitiate}
                        />
                      )
                    ) : bioMetricStatus === "IN_PROGRESS" || "FAILED" ? (
                      <PButton
                        label="Check status"
                        severity="help"
                        text
                        onClick={handleCheckStatus}
                      />
                    ) : null}

                    {bioMetricStatus === "IN_PROGRESS" ? (
                      <PunchClock
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "orange",
                        }}
                      />
                    ) : bioMetricStatus === "SUCCESS" ? (
                      <CheckCircle
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "green",
                        }}
                      />
                    ) : bioMetricStatus === "FAILED" ? (
                      <CancelOutlined
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "red",
                        }}
                      />
                    ) : null}
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    position: "relative",
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    height: "60px",
                    display: "flex",
                  }}
                >
                  <Typography variant="subtitle1">
                    Member Contribution
                  </Typography>
                  {contributionPaid ? (
                    <CheckCircle
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "green",
                      }}
                    />
                  ) : (
                    <ErrorIcon
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "red",
                      }}
                    />
                  )}
                  {!contributionPaid &&
                    memberData?.memberId &&
                    memberData?.identificationDocNumber && (
                      <PButton
                        label="Initiate"
                        severity="help"
                        text
                        onClick={handleContributionInitiate}
                      />
                    )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs={12} sm={12} md={12} container>
              <Grid item xs={12}>
                <Typography
                  style={{
                    color: "#4472C4",
                    fontSize: "14px",
                    marginBottom: "10px",
                    marginTop: "10px",
                  }}
                >
                  MEMBER DETAILS
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              {/* <Box display={"flex"} marginLeft={"4%"} marginY={"10px"}>
                <Avatar sizes="400"></Avatar>
              </Box> */}
              {/* image hide as directed */}
              {/* <Grid
                item
                xs={4}
                sm={3}
                container
                justifyContent="center"
                alignItems="center"
              >
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
              </Grid> */}
              {/* <Grid
                item
                xs={4}
                sm={3}
                container
                justifyContent="center"
                alignItems="center"
                // style={{ position: "relative", width: "fit-content" }}
              >
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
              </Grid> */}
              {/* <Grid
                item
                xs={4}
                sm={3}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  style={{ background: "#313c96", fontSize: "12px" }}
                  onClick={onVerifyClick}
                >
                  Verify Image
                </Button>
              </Grid> */}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" flexDirection="column" marginLeft="10%">
                <Box display="flex" alignItems="center">
                  <Typography style={TypographyStyle1}>Name</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberData?.name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" marginTop="10px">
                  <Typography style={TypographyStyle1}>Member ID</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberData.shaMemberId}
                  </Typography>
                </Box>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>DOB</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {moment(memberData?.dateOfBirth).format("DD/MM/YYYY")} (Age:
                  {memberData?.age})
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>
                  Coverage period
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {moment(memberData?.policyStartDate).format("DD/MM/YYYY")} -{" "}
                  {moment(memberData?.policyEndDate).format("DD/MM/YYYY")}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" flexDirection="column" marginLeft="10%">
                <Box display="flex" alignItems="center">
                  <Typography style={TypographyStyle1}>National Id</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberData?.identificationDocType === "NationalId" &&
                      memberData?.identificationDocNumber}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" marginTop="10px">
                  <Typography style={TypographyStyle1}>Household No</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberData.employeeId}
                  </Typography>
                </Box>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>gender</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.gender}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>Contact No</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.mobileNo}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" flexDirection="column" marginLeft="10%">
                <Box display="flex" alignItems="center">
                  <Typography style={TypographyStyle1}>SHA No</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberData?.shaMemberNumber}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" marginTop="10px">
                  <Typography style={TypographyStyle1}>Status</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberData?.active === true ? (
                      <Button
                        style={{
                          background: "green",
                          color: "#fff",
                          padding: "0px",
                          margin: "5px",
                          height: "19px",
                          borderRadius: "5px",
                        }}
                      >
                        Active
                      </Button>
                    ) : (
                      <Button
                        style={{
                          background: "red",
                          color: "#fff",
                          padding: "2px",
                          margin: "0px",
                          height: "18px",
                        }}
                      >
                        InActive
                      </Button>
                    )}
                  </Typography>
                </Box>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>Relation</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.relations}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>Email</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.email}
                </Typography>
              </Box>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography
                  style={{
                    color: "#4472C4",
                    fontSize: "14px",
                    marginTop: "10px",
                  }}
                >
                  DEPENDENT DETAILS
                </Typography>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} style={{ padding: 15 }}>
                  <TableContainer component={Paper}>
                    <Table size="small" aria-label="a dense table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>SHA Number</TableCell>
                          <TableCell>Member ID</TableCell>
                          <TableCell>Gender</TableCell>
                          <TableCell>DOB</TableCell>
                          <TableCell>Relation</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {memberData?.dependentData ? (
                          memberData?.dependentData.map((item) => {
                            return (
                              <TableRow key={item.id}>
                                <TableCell>{item?.dependentName}</TableCell>
                                <TableCell>
                                  {item?.dependentShaNumber}
                                </TableCell>
                                <TableCell>
                                  {item?.dependentShaMemberId}
                                </TableCell>
                                <TableCell>{item?.dependentGender}</TableCell>
                                <TableCell>
                                  {moment(el.dependentDOB).format("DD/MM/YYYY")}
                                </TableCell>
                                <TableCell>
                                  {item?.dependentRelations}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No Data Found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              {/* <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box display={"flex"} marginLeft={"10%"}>
                    <Typography style={TypographyStyle1}>Name</Typography>
                    &nbsp;
                    <span>:</span>&nbsp;
                    <Typography style={TypographyStyle2}>
                      {memberData?.dependentName || ""}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box display={"flex"} marginLeft={"10%"}>
                    <Typography style={TypographyStyle1}>SHA Number</Typography>
                    &nbsp;
                    <span>:</span>&nbsp;
                    <Typography style={TypographyStyle2}>
                      {memberData?.dependentShaNumber || ""}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box display={"flex"} marginLeft={"10%"}>
                    <Typography style={TypographyStyle1}>Member ID</Typography>
                    &nbsp;
                    <span>:</span>&nbsp;
                    <Typography style={TypographyStyle2}>
                      {memberData?.dependentShaMemberId || ""}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} style={{ marginTop: "19px" }}>
                  <Box display={"flex"} marginLeft={"10%"}>
                    <Typography style={TypographyStyle1}>Gender</Typography>
                    &nbsp;
                    <span>:</span>&nbsp;
                    <Typography style={TypographyStyle2}>
                      {memberData?.dependentGender || ""}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box display={"flex"} marginLeft={"10%"}>
                    <Typography style={TypographyStyle1}>
                      Date of Birth
                    </Typography>
                    &nbsp;
                    <span>:</span>&nbsp;
                    <Typography style={TypographyStyle2}>
                      {memberData?.dependentDOB
                        ? moment(memberData.dependentDOB).format("DD/MM/YYYY")
                        : ""}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box display={"flex"} marginLeft={"10%"}>
                    <Typography style={TypographyStyle1}>Relation</Typography>
                    &nbsp;
                    <span>:</span>&nbsp;
                    <Typography style={TypographyStyle2}>
                      {memberData?.dependentRelations || ""}
                    </Typography>
                  </Box>
                </Grid>
              </Grid> */}
            </Grid>
          </Grid>

          <Paper elevation={0} style={{ padding: 15, marginTop: "10px" }}>
            {/* <Eo2v2DataGrid
              $dataSource={dataSource$}
              config={configuration}
              columnsDefination={columnsDefinations}
            /> */}
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Benefit</TableCell>
                      <TableCell>Status</TableCell>
                      {/* <TableCell>Waiting Period</TableCell>
                    <TableCell>Max Limit(KSH)</TableCell>
                    <TableCell>Consumed(KSH)</TableCell>
                    <TableCell>Balance(KSH)</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showBalanceDetails ? (
                      tableData?.map &&
                      tableData.map((item) => {
                        const parentBenefitName =
                          benefitLookup[item.parentBenefitStructureId];
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              {` ${
                                parentBenefitName != undefined
                                  ? `${parentBenefitName} >`
                                  : ""
                              } ${item?.benefitName}`}
                              {/* {(item?.benefitName === "IN-PATIENT" &&
                              "IN-PATIENT") ||
                              (item?.benefitStructureId ===
                                "1245370764554674176" &&
                                "IN-PATIENT >  MATERNAL HEALTH") ||
                              (item?.benefitName === "OUT-PATIENT" &&
                                "OUT-PATIENT") ||
                              (item?.benefitStructureId ===
                                "1245640606146895872" &&
                                " OUT-PATIENT >  MATERNAL HEALTH  ")} */}
                            </TableCell>
                            <TableCell>
                              {item?.balance > 0 ? (
                                <CheckOutlinedIcon style={{ color: "green" }} />
                              ) : (
                                <ClearOutlinedIcon style={{ color: "red" }} />
                              )}
                            </TableCell>
                            {/* <TableCell>{item?.waitingPeriod}</TableCell>
                        <TableCell>{item?.maxLimit}</TableCell>
                        <TableCell>{item?.consumed}</TableCell>
                        <TableCell>{item?.balance}</TableCell> */}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No Data Found
                          {/* <CircularProgress
                            sx={
                              {
                                // color: "white",
                                // width: "20px",
                                // height: "20px",
                              }
                            }
                          /> */}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Paper>
        </Paper>
      )}

      {/* {showServices && (
        <Paper elevation="none" style={{ padding: "15px 30px", marginTop: '10px' }}>
          <Eo2v2DataGrid
            $dataSource={claimDataSource$}
            config={claimConfiguration}
            columnsDefination={claimColumnsDefinations}
          />
        </Paper>
      )} */}
    </>
  );
}
