import { Button } from "primereact/button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import "date-fns";
import * as React from "react";

export default function ClaimModal(props) {
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
  const [maxWidth, setMaxWidth] = React.useState("sm");
  const handleClose = () => {
    props.handleCloseClaimModal();
  };

  const handleModalSubmit = () => {};

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
        <Grid container spacing={3} style={{ marginBottom: "20px" }}>
          <Grid item xs={12} style={{ marginTop: "20px" }}>
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
                <TableBody />
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              name="insuranceCompany"
              value={props.memberBasic.insuranceCompany}
              label="Insurance Company"
              readonly
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              name="corporateName"
              value={props.memberBasic.corporateName}
              label="Corporate Name"
              readonly
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              name="membershipNo"
              value={props.memberBasic.membershipNo}
              label="Membership No"
              readonly
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              readonly
              name="memberName"
              value={props.memberBasic.name}
              label="Member Name"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              readonly
              name="gender"
              value={props.memberBasic.gender}
              label="Gender"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              readonly
              name="age"
              value={props.memberBasic.age}
              label="Age"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              readonly
              name="policyCode"
              value={props.memberBasic.policyCode}
              label="Policy Code"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              readonly
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
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="standard-multiline-flexible"
              name="policyPeriod"
              value={props.memberBasic.policyPeriod}
              label="Policy Period"
              readonly
            />
          </Grid>
          <Grid item xs={12} style={{ marginTop: "20px" }}>
            <span style={{ color: "#4472C4", fontWeight: "bold" }}>
              Policy Conditions(Benefits/Coverage)
            </span>
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
                    <TableCell>Waiting Period</TableCell>
                    <TableCell>Max Limit(KSH)</TableCell>
                    <TableCell>Consumed(KSH)</TableCell>
                    <TableCell>Balance(KSH)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody />
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
