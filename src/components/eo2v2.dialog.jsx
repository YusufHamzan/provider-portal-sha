import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];
export default function DialogTable({ open, setOpen, data }) {
  //   const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  console.log(data);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "600" }}>
                    providerPaymentMechanism
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    tariffs
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    PHCFund
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    SHIFFund
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    ECCFund
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    age
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    gender
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    individualHousehold
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    interventionPerWeek
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    interventionPerMonth
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    interventionPerYear
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "600" }}>
                    healthFacilityCategory
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((row, i) => (
                  <TableRow
                    key={i}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row?.providerPaymentMechanism}
                    </TableCell>
                    <TableCell align="right">{row?.tariffs}</TableCell>
                    <TableCell align="right">{row?.phcfund}</TableCell>
                    <TableCell align="right">{row?.shiffund}</TableCell>
                    <TableCell align="right">{row?.eccfund}</TableCell>
                    <TableCell align="right">{row?.age}</TableCell>
                    <TableCell align="right">{row?.gender}</TableCell>
                    <TableCell align="right">
                      {row?.individualHousehold}
                    </TableCell>
                    <TableCell align="right">
                      {row?.interventionPerWeek}
                    </TableCell>
                    <TableCell align="right">
                      {row?.interventionPerMonth}
                    </TableCell>
                    <TableCell align="right">
                      {row?.interventionPerYear}
                    </TableCell>
                    <TableCell align="right">
                      {row?.healthFacilityCategory}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
