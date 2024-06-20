
import 'date-fns';
import { differenceInDays } from 'date-fns';
import * as React from 'react';
import { useEffect } from 'react';
import { MemberService } from '../../remote-api/api/member-services';
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { Button } from 'primereact/button';
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";

export default function ClaimModal(props) {
  const [state, setState] = React.useState({
    insuranceCompany: '',
    corporateName: '',
    membershipNo: '',
    memberName: '',
    gender: '',
    age: '',
    policyCode: '',
    policyType: '',
    policyPeriod: '',
    enrolmentDate: '',
  });
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState('xl');
  const [memberData, setMemberData] = React.useState([]);
  const handleClose = () => {
    props.handleCloseClaimModal();
  };

  const handleModalSubmit = () => {};
  const memberService = new MemberService();
  const policyStartDate = new Date(props.memberBasic.enrolmentFromDate);
  const policyEndDate = new Date(props.memberBasic.enrolentToDate);
  const timeDifference = policyEndDate - policyStartDate;

  const periodInDays = Math.floor(timeDifference / (24 * 60 * 60 * 1000));

  useEffect(() => {
    if (props?.memberBasic?.membershipNo) {
      memberService.getMemberBalance(props?.memberBasic?.membershipNo).subscribe(res => {
        setMemberData(res);
      });
    }
  }, [props?.memberBasic?.membershipNo]);

  return (
    <Dialog
      open={props.claimModal}
      onClose={handleClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      aria-labelledby="form-dialog-title"
      disableEnforceFocus>
      <DialogTitle id="form-dialog-title">Claim Member Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
          <Grid item xs={12} style={{ marginTop: '20px' }}>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>Policy Code</TableCell>
                    <TableCell>Plan Name</TableCell>
                    <TableCell>Scheme Category</TableCell>
                    <TableCell>Policy Period</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{props.memberBasic.policyNumber}</TableCell>
                    <TableCell>{props.memberBasic.planName}</TableCell>
                    <TableCell>{props.memberBasic.planScheme}</TableCell>
                    <TableCell>{periodInDays} days</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          {/* <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              name="insuranceCompany"
              value={props.memberBasic.insuranceCompany}
              label="Insurance Company"
              readonly
            />
          </Grid> */}

          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              name="membershipNo"
              variant='standard'
              value={props.memberBasic.membershipNo}
              label="Membership No"
              readonly
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              name="corporateName"
              variant='standard'
              value={props.memberBasic.clientType + " " +  "POLICY"}
              label={props.memberBasic.clientType ? 'Client Type ' : 'Corporate Policy'}
              readonly
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              readonly
              variant='standard'
              name="memberName"
              value={props.memberBasic.name}
              label="Member Name"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              readonly
              variant='standard'
              name="gender"
              value={props.memberBasic.gender}
              label="Gender"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField variant='standard' id="standard-multiline-flexible" readonly name="age" value={props.memberBasic.age} label="Age" />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              readonly
              variant='standard'
              name="policyCode"
              value={props.memberBasic.policyNumber}
              label="Policy Code"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              readonly
              variant='standard'
              name="policyType"
              value={props.memberBasic.policyType}
              label="Policy type"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              name="enrolmentDate"
              value={props.memberBasic.enrolmentDate}
              label="First Enrollment date"
              readonly
              variant='standard'
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              name="policyPeriod"
              value={periodInDays}
              label="Policy Period"
              readonly
              variant='standard'
            />
          </Grid>
          <Grid item xs={12} style={{ marginTop: '20px' }}>
            <span style={{ color: '#4472C4', fontWeight: 'bold' }}>Policy Conditions(Benefits/Coverage)</span>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>Benefit</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memberData?.map &&
                    memberData.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item?.benefitName}</TableCell>
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
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
