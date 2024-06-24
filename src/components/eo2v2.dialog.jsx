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

export default function DialogTable({ open, setOpen, data }) {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const handleClose = () => {
    setOpen(false);
  };

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
              <TableHead>
                <h2 style={{ margin: "0px 10px" }}>Decision Details</h2>
              </TableHead>
              <TableBody>
                {displayKeys?.map((key, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row" sx={tableCellStyle}>
                      {capitalizeFirstLetter(key)}
                    </TableCell>
                    {data?.map((row, rowIndex) => (
                      <TableCell
                        key={rowIndex}
                        align="center"
                        sx={
                          row[key] === "PASS"
                            ? { color: "green" }
                            : row[key] === "FAIL"
                            ? { color: "red" }
                            : null
                        }
                      >
                        {row[key]}
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
