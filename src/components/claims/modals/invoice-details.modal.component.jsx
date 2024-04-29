import React from "react";
import { ServiceTypeService } from "../../../remote-api/api/master-services/service-type-service";
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { AddCircleOutlined, RemoveCircleOutline } from "@mui/icons-material";

export default function InvoiceDetailsModal(props) {
  const {
    isOpen,
    onClose,
    onSubmit,
    changeInvoiceItems,
    selectedInvoiceItemIndex,
    selectedInvoiceItems,
    handleAddInvoiceItemRow,
    handleDeleteInvoiceItemRow,
    benefitOptions,
    benefitsWithCost,
  } = props;
  const [detailList, setDetailList] = React.useState([{}]);
  const [serviceTypeList, setServiceTypeList] = React.useState();
  const [expenseHeadList, setExpenseHeadList] = React.useState();

  const serviceTypeService = new ServiceTypeService();

  const getServiceTypes = () => {
    let serviceTypeService$ = serviceTypeService.getServiceTypes();
    serviceTypeService$.subscribe(response => {
      let temp = [];
      response.content.forEach(el => {
        temp.push(el);
      });
      setServiceTypeList(temp);
    });
  };

  const getExpenseHead = (id) => {
    let expenseHeadService$ = serviceTypeService.getExpenseHead(id);
    expenseHeadService$.subscribe(response => {
      let temp = [];
      response.content.forEach(el => {
        let obj = {
          label: el?.name,
          value:el?.id
        }
        temp.push(obj);
      });
      setExpenseHeadList(temp);
    });
  };

  React.useEffect(() => {
    getServiceTypes();
    // getExpenseHead();
  }, []);

  const handleRemoveRow = index => {
    setDetailList(oldList => {
      return [...oldList.slice(0, index), ...oldList.slice(index + 1)];
    });
  };

  const lastRowIndex = detailList.length - 1;
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" aria-labelledby="form-dialog-title" disableEnforceFocus>
      <DialogTitle id="form-dialog-title">Invoice Items</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
          <Grid item md={4}>
            Invoice no: {props.invoiceNo}
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Benefit</TableCell>
                    <TableCell>Service Type</TableCell>
                    <TableCell>Expense Head</TableCell>
                    <TableCell>Rate(KSH)</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Total(KSH)</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedInvoiceItems.map((detail, index) => {
                    return (
                      <TableRow>
                        <TableCell>
                          {selectedInvoiceItems.length - 1 === index && (
                            <IconButton
                              onClick={() => handleAddInvoiceItemRow(selectedInvoiceItemIndex)}
                              aria-label="Add a row below">
                              <AddCircleOutlined />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          <BenefitCostComponent
                            key={index}
                            x={detail}
                            selectedInvoiceItemIndex={selectedInvoiceItemIndex}
                            changeInvoiceItems={changeInvoiceItems}
                            i={index}
                            benefitOptions={benefitOptions}
                            benefitsWithCost={benefitsWithCost}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            label="Service Type"
                            name="serviceType"
                            variant="standard"
                            value={detail.serviceType}
                            onChange={e => {getExpenseHead(e.target.value);changeInvoiceItems(e, selectedInvoiceItemIndex, index)}}>
                            {serviceTypeList?.map(ele => {
                              return <MenuItem value={ele?.id}>{ele?.displayName}</MenuItem>;
                            })}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            label="Expense Head"
                            name="expenseHead"
                            variant="standard"
                            value={detail.expenseHead}
                            onChange={e => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}>
                            {expenseHeadList?.map(ele => {
                              return <MenuItem value={ele?.value}>{ele?.label}</MenuItem>;
                            })}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            name="rateKsh"
                            type="number"
                            variant="standard"
                            value={detail.rateKsh}
                            onChange={e => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name="unit"
                            type="number"
                            variant="standard"
                            value={detail.unit}
                            onChange={e => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name="totalKsh"
                            disabled
                            variant="standard"
                            value={detail.totalKsh}
                            onChange={e => changeInvoiceItems(e, selectedInvoiceItemIndex, index)}
                          />
                        </TableCell>
                        <TableCell>
                          {selectedInvoiceItems.length !== 1 && (
                            <IconButton
                              onClick={() => handleDeleteInvoiceItemRow(selectedInvoiceItemIndex, index)}
                              aria-label="Remove this row">
                              <RemoveCircleOutline style={{color:"#dc3545"}} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button className='p-button-text' onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const BenefitCostComponent = props => {
  const { x, i, changeInvoiceItems, selectedInvoiceItemIndex, benefitOptions, benefitsWithCost } = props;

  const handleBenefitChange = (e, val, i) => {
    const eData = {
      target: {
        name: 'benefitId',
        value: val,
      },
    };
    changeInvoiceItems(eData, selectedInvoiceItemIndex, i);
  };

  return (
    <Grid container spacing={3} key={i} style={{ marginBottom: '20px' }}>
      <Grid item xs={4}>
        <FormControl style={{ minWidth: 220 }}>
        {console.log(benefitsWithCost)}
          <Autocomplete
            name="benefitId"
            defaultValue={x.benefitId}
            value={x.benefitId}
            onChange={(e, val) => {
              handleBenefitChange(e, val, i);
            }}
            id={`checkboxes-tags-demo${i + Math.random()}`}
            options={benefitsWithCost?.map(option => option.benefitId)}
            getOptionLabel={option => {
              const selectedOption = benefitOptions?.find(benefit => benefit.value === option);
              return selectedOption ? selectedOption.label : '';
            }}
            getOptionSelected={(option, value) => {
              return option == value;
            }}
            // renderOption={option => <React.Fragment>{option.benefitId}</React.Fragment>}
            renderInput={params => <TextField {...params} label="Select Benefit" />}
          />

          {/* <Autocomplete
            name="benefitId"
            defaultValue={x.benefitId}
            value={x.benefitId}
            onChange={(e, val) => handleBenefitChange(e, val, i)}
            id="checkboxes-tags-dem"
            filterOptions={autocompleteFilterChange}
            options={benefitsWithCost}
            getOptionLabel={option => option.label ?? benefitOptions.find(benefit => benefit.value == option)?.label}
            getOptionSelected={(option, value) => option.value === value}
            renderOption={(option, { selected }) => {
              return <React.Fragment>{option?.benefitId}</React.Fragment>;
            }}
            renderInput={params => <TextField {...params} label="Select Benefit" />}
          /> */}
        </FormControl>
      </Grid>
    </Grid>
  );
};

{
  /* <Autocomplete
            name="benefitId"
            defaultValue={x?.benefitId}
            value={x?.benefitId}
            onChange={(e, val) => handleBenefitChangeInProvider(i, idx, val)}
            id="checkboxes-tags-demo"
            filterOptions={autocompleteFilterChange}
            options={selectedBenefit}
            getOptionLabel={option => option.label ?? benefitOptions.find(benefit => benefit?.value == option)?.label}
            getOptionSelected={(option, value) => option?.value === value}
            renderOption={(option, { selected }) => {
              return <React.Fragment>{option?.label}</React.Fragment>;
            }}
            renderInput={params => <TextField {...params} label="Select Benefit" />}
          /> */
}
