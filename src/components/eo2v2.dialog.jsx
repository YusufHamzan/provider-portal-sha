import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
// import { Button, Dialog, DialogActions, DialogContent, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, makeStyles, useMediaQuery, useTheme } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  tableContainer: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
    msOverflowStyle: "none", // for Internet Explorer and Edge
    scrollbarWidth: "none", // for Firefox
  },
  dialogContent: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
    msOverflowStyle: "none", // for Internet Explorer and Edge
    scrollbarWidth: "none", // for Firefox
  },
}));

export default function DialogTable({ open, setOpen, data, finalApproval }) {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const handleClose = () => {
    setOpen(false);
  };
  console.log(finalApproval[0]?.finalApproval);
  const displayKeys = [
    "healthFacilityCategory",
    "gender",
    "age",
    "interventionPerWeek",
    "interventionPerMonth",
    "interventionPerYear",
    "providerPaymentMechanism",
    "tariffs",
    "phcfund",
    "shiffund",
    "eccfund",
    "interventionCode",
    "subbenefitId",
  ];

  const tableCellStyle = {
    padding: "1px 8px", // Adjust padding to reduce height
    fontWeight: "500",
    fontSize: "13px",
    color: "#A1A1A1",
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogContent className={classes.dialogContent}>
          <TableContainer
            component={Paper}
            className={`${classes.tableContainer} table-container`}
          >
            <Table sx={{ minWidth: 350 }} aria-label="simple table">
              <TableHead style={{ color: "#A1A1A1", marginBottom: "15px" }}>
                <div>
                  <h2 style={{ margin: "0px 10px" }}>Decision Details</h2>
                  <h4
                    style={{
                      backgroundColor:
                        finalApproval[0]?.finalApproval == "APPROVED"
                          ? "#01de74"
                          : "red",
                      width: "100px",
                      textAlign: "center",
                      borderRadius: "0px 3px 3px 0px",
                      padding: "2px 5px",
                      color: "white",
                    }}
                  >
                    {finalApproval[0]?.finalApproval}
                  </h4>
                </div>
                <h4 style={{ margin: "7px" }}>
                  DecisionID:- {data?.length > 0 ? data[0]?.decisionId : "NA"}{" "}
                </h4>
              </TableHead>
              {/* <Divider/> */}
              <TableBody>
                {displayKeys.length &&
                  displayKeys?.map((key, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        {capitalizeFirstLetter(key)}
                      </TableCell>
                      {data?.length &&
                        data?.map((row, rowIndex) => (
                          <TableCell
                            key={rowIndex}
                            align="center"
                            style={
                              row[key] === "PASS"
                                ? { color: "green" }
                                : row[key] === "FAIL"
                                ? { color: "red" }
                                : null
                            }
                          >
                            {row[key] || row[key] == 0 ? row[key] : "NA"}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ boxShadow: "0px 5px 10px 1px gray" }}
            onClick={handleClose}
            autoFocus
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
