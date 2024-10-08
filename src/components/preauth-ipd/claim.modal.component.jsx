import "date-fns";
import { differenceInDays } from "date-fns";
import * as React from "react";
import { useEffect } from "react";
import { MemberService } from "../../remote-api/api/member-services";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Button } from "primereact/button";
import moment from "moment/moment";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { RetailUserService } from "../../remote-api/api/master-services/retail-users-service";

const retailuserservice = new RetailUserService();

export default function ClaimModal(props) {
  const { memberBasic } = props;
  const [state, setState] = React.useState({
    insuranceCompany: "",
    corporateName: "",
    membershipNo: "",
    memberName: "",
    gender: "",
    age: "",
    policyCode: "",
    policyType: "",
    policyPeriod: "",
    enrolmentDate: "",
  });

  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState("xl");
  const [memberData, setMemberData] = React.useState([]);
  const [dependentData, setDependentData] = React.useState();
  const handleClose = () => {
    props.handleCloseClaimModal();
  };

  const handleModalSubmit = () => {};
  const memberService = new MemberService();
  const policyStartDate = new Date(props.memberBasic.enrolmentFromDate);
  const policyEndDate = new Date(props.memberBasic.enrolentToDate);
  const timeDifference = policyEndDate - policyStartDate;

  const periodInDays = Math.floor(timeDifference / (24 * 60 * 60 * 1000));

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

  useEffect(() => {
    if (props?.memberBasic?.membershipNo) {
      memberService
        .getMemberBalance(props?.memberBasic?.membershipNo)
        .subscribe((res) => {
          setMemberData(res);
        });
    }
  }, [props?.memberBasic?.membershipNo]);

  const benefitLookup = memberData?.reduce((acc, el) => {
    acc[el.benefitStructureId] = el.benefitName;
    return acc;
  }, {});

  React.useEffect(() => {
    if (memberBasic?.identificationDocNumber) {
      retailuserservice
        .getDependentDetails(memberBasic?.identificationDocNumber)
        .subscribe((res) => {
          setDependentData(res);
        });
    }
  }, [memberBasic?.identificationDocNumber]);

  return (
    <Dialog
      open={props.claimModal}
      onClose={handleClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      aria-labelledby="form-dialog-title"
      disableEnforceFocus
    >
      <DialogTitle id="form-dialog-title">Claim Member Details</DialogTitle>
      <DialogContent>
        <Paper elevation="3" style={{ padding: 15, marginTop: "15px" }}>
          <Grid container>
            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" flexDirection="column" marginLeft="10%">
                <Box display="flex" alignItems="center">
                  <Typography style={TypographyStyle1}>Name</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberBasic?.name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" marginTop="10px">
                  <Typography style={TypographyStyle1}>Member ID</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberBasic.shaMemberId}
                  </Typography>
                </Box>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>DOB</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {moment(memberBasic?.dateOfBirth).format("DD/MM/YYYY")}(Age:
                  {memberBasic?.age})
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>
                  Coverage period
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {moment(memberBasic?.policyStartDate).format("DD/MM/YYYY")} -{" "}
                  {moment(memberBasic?.policyEndDate).format("DD/MM/YYYY")}
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
                    {memberBasic?.identificationDocType === "NationalId" &&
                      memberBasic?.identificationDocNumber}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" marginTop="10px">
                  <Typography style={TypographyStyle1}>Household No</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberBasic.employeeId}
                  </Typography>
                </Box>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>gender</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberBasic?.gender}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>Contact No</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberBasic?.mobileNo}
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
                    {memberBasic?.shaMemberNumber}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" marginTop="10px">
                  <Typography style={TypographyStyle1}>Status</Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography style={TypographyStyle2}>
                    {memberBasic?.active === true ? (
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
                  {memberBasic?.relations}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>Email</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberBasic?.email}
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
                          <TableCell>National ID</TableCell>
                          <TableCell>SHA Number</TableCell>
                          <TableCell>Member ID</TableCell>
                          <TableCell>Household No</TableCell>
                          <TableCell>Gender</TableCell>
                          <TableCell>DOB</TableCell>
                          <TableCell>Relation</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dependentData ? (
                          dependentData.map((item) => {
                            function capitalizeFirstLetter(str) {
                              if (str.length === 0) return str; // Handle empty strings
                              return (
                                str.charAt(0).toUpperCase() +
                                str.slice(1).toLowerCase()
                              );
                            }
                            return (
                              <TableRow key={item.id}>
                                <TableCell>
                                  {capitalizeFirstLetter(item?.name)}
                                </TableCell>
                                <TableCell>
                                  {item?.identificationDocType ===
                                    "NationalId" &&
                                    item?.identificationDocNumber}
                                </TableCell>
                                <TableCell>{item?.shaMemberNumber}</TableCell>
                                <TableCell>{item?.shaMemberId}</TableCell>
                                <TableCell>{item?.employeeId}</TableCell>
                                <TableCell
                                  style={{ textTransform: "capitalize" }}
                                >
                                  {item?.gender}
                                </TableCell>
                                <TableCell>
                                  {item.dateOfBirth
                                    ? moment(item.dateOfBirth).format(
                                        "DD/MM/YYYY"
                                      )
                                    : "-"}
                                </TableCell>
                                <TableCell>{item?.relations}</TableCell>
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
            </Grid>
          </Grid>
          <Paper elevation="none" style={{ padding: 15, marginTop: "10px" }}>
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
                    {memberData?.map &&
                      memberData.map((item) => {
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
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Paper>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
