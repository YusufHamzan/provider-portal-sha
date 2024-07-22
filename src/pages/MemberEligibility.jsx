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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
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

  const handleSelect = (data) => {
    setMemberData(data);
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

    memberService.getMember(pageRequest).subscribe((res) => {
      if (res.content?.length > 0) {
        if (searchType === "name") {
          setMemberName({ res });
          handleopenClientModal();
        } else {
          setMemberData(res.content[0]);
          getImage(res?.content[0]?.id);
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
        }
      } else {
        setAlertMsg(`No Data found for ${id}`);
        setSeverity("error");
        setOpenSnack(true);
      }
      setIsLoading(false);
    });
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
              <MenuItem value="membership_no">Membership No.</MenuItem>
              <MenuItem value="name">Member Name</MenuItem>
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
        </Grid>
      </Paper>
      {memberData && (
        <Paper elevation={3} style={{ padding: 15, marginTop: "15px" }}>
          <Grid container>
            <Grid item xs={12} sm={12} md={12} container>
              {/* <Box display={"flex"} marginLeft={"4%"} marginY={"10px"}>
                <Avatar sizes="400"></Avatar>
              </Box> */}
              <Grid
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
              </Grid>
              <Grid
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
              </Grid>
              <Grid
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
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6} md={4} style={{ marginTop: "19px" }}>
              <Box
                display="flex"
                flexDirection="column"
                marginLeft="10%"
                marginY="10px"
              >
                <Box display="flex" alignItems="center">
                  <Typography style={TypographyStyle1}>Member Name</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberData?.name}
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
                <Typography style={TypographyStyle1}>DOB</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {moment(memberData?.dateOfBirth).format("DD/MM/YYYY")}
                </Typography>
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
                <Typography style={TypographyStyle1}>Policy Type</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.clientType}
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
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>
                  First Enrollment Date
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {(memberData?.dateOfJoining &&
                    moment(memberData?.dateOfJoining).format("DD/MM/YYYY")) ||
                    "No Data"}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4} style={{ marginTop: "19px" }}>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>Membership No.</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.membershipNo}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>National Id</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {/* {memberData?.email} */}
                  {memberData?.identificationDocNumber}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>Age</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.age}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>Policy No.</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.policyNumber}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>policy period</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {moment(memberData?.policyStartDate).format("DD/MM/YYYY")} -{" "}
                  {moment(memberData?.policyEndDate).format("DD/MM/YYYY")}
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
                              {` ${parentBenefitName != undefined
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
                          {/* <LinearProgress /> */}
                          <CircularProgress
                            sx={
                              {
                                // color: "white",
                                // width: "20px",
                                // height: "20px",
                              }
                            }
                          />
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
