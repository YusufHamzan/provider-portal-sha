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
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Select,
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

const memberService = new MemberService();
const benefitService = new BenefitService();
// const preauthService = new PreAuthService();

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const useStyles = makeStyles((theme) => ({
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

export default function MemberEligibility() {
  const navigate = useNavigate();
  const query = useQuery();
  const theme = useTheme();
  const [enteredMembershipNo, setEnteredMembershipNo] = React.useState();
  const [showBalanceDetails, setShowBalanceDetails] = React.useState(false);
  const [expanded, setExpanded] = React.useState(true);
  const [tableData, setTableData] = React.useState();
  const [claimTableData, setClaimTableData] = React.useState();
  const [memberData, setMemberData] = React.useState();
  const [benefitData, setBenefitData] = React.useState();
  const [showServices, setShowServices] = React.useState(false);
  const [diagnosisList, setDiagnosisList] = React.useState([]);
  const [providerList, setProviderList] = React.useState([]);
  const classes = useStyles();
  const [searchType, setSearchType] = React.useState("membership_no");
  const [membershipNumber, setMembershipNumber] = React.useState();
  const [openClientModal, setOpenClientModal] = React.useState(false);
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
    // formik.setFieldValue("contactNoOne", data.mobileNo);
    // setMemberBasic({
    //   ...memberBasic,
    //   name: data.name,
    //   age: data.age,
    //   gender: data.gender,
    //   membershipNo: data.membershipNo,
    //   relations: data.relations,
    //   policyNumber: data.policyNumber,
    //   enrolentToDate: new Date(data.policyEndDate),
    //   enrolmentFromDate: new Date(data.policyStartDate),
    //   planName: data.planName,
    //   planScheme: data.planScheme,
    //   productName: data.productName,
    // });
    handleClosed();
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

    memberService.getMember(pageRequest).subscribe((res) => {
      if (res.content?.length > 0) {
        if (searchType === "name") {
          setMemberName({ res });
          handleopenClientModal();
          // setMemberData(res.content[0]);
        } else {
          setMemberData(res.content[0]);
          // formik.setFieldValue("contactNoOne", res.content[0].mobileNo);
          // setMemberBasic({
          //   ...memberBasic,
          //   name: res.content[0].name,
          //   clientType: res.content[0].clientType,
          //   age: res.content[0].age,
          //   gender: res.content[0].gender,
          //   membershipNo: res.content[0].membershipNo,
          //   relations: res.content[0].relations,
          //   policyNumber: res.content[0].policyNumber,
          //   enrolentToDate: new Date(res.content[0].policyEndDate),
          //   enrolmentFromDate: new Date(res.content[0].policyStartDate),
          //   planName: res.content[0].planName,
          //   planScheme: res.content[0].planScheme,
          //   productName: res.content[0].productName,
          // });
        }
      } else {
        setAlertMsg(`No Data found for ${id}`);
        setOpenSnack(true);
      }
    });
  };

  console.log("memberData", memberData);

  return (
    <>
      <Paper elevation="3" style={{ padding: 15 }}>
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
                onClick={() => populateMemberFromSearch("number")}
                type="button"
                style={{ borderRadius: "10px", background: "#313c96" }}
              >
                Search
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
                onClick={() => populateMemberFromSearch("name")}
                className={classes.buttonPrimary}
                color="primary"
                type="button"
                style={{ marginLeft: "3%", borderRadius: "10px", background: "#313c96" }}
              >
                Search
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
        {memberData && (
          <Grid container>
            <Grid xs={12} sm={6} md={4}>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>corporate name</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.corporate}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>membership no</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.membershipNo}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>Mobile No</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.mobileNo}
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
                <Typography style={TypographyStyle1}>policy code</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.policyNumber}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>
                  first enrollment date
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.dateOfJoining &&
                    moment(memberData?.dateOfJoining).format("DD/MM/YYYY")}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>
                  name of the member
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.name}
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
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>DOB</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {moment(memberData?.dateOfBirth).format("DD/MM/YYYY")}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>age</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.age}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography style={TypographyStyle1}>type of policy</Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography style={TypographyStyle2}>
                  {memberData?.typeOfPolicy}
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
            </Grid>
          </Grid>
        )}
      </Paper>

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
