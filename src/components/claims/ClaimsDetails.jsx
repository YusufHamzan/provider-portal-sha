import { makeStyles, useTheme } from "@mui/styles";
import { PreAuthService } from "../../remote-api/api/claim-services";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import React from "react";
import { Box, Button, FormControl, FormControlLabel, FormLabel, Grid, Modal, Paper, Radio, RadioGroup, Snackbar, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import { Eo2v2DataGrid } from "../eo2v2.data.grid";
import { TabPanel, TabView } from "primereact/tabview";
import { Observable } from "rxjs";
import ClaimsBasicComponent from "./cliam.basic.component";
import ClaimsTimelineComponent from "./claim.timline.component";
import ClaimsDocumentComponent from "./claim.doc.component";


const useStyles = makeStyles(theme => ({
  root: {
    // width: '100%',
    flexDirection: 'column',
    // marginLeft: '1%',
  },
  backButton: {
    // marginRight: theme.spacing(1),
  },
  instructions: {
    // marginTop: theme.spacing(1),
    // marginBottom: theme.spacing(1),
  },
  stepText: {
    '& span': {
      fontSize: '16px',
    },
  },
  prospectImportOuterContainer: {
    padding: 20,
  },
  prospectImportRadioGroup: {
    flexWrap: 'nowrap',
    '& label': {
      flexDirection: 'row',
    },
  },
}));

const preauthService = new PreAuthService();

function getSteps() {
  return ['Claim details', 'Document details'];
}

function useQuery1() {
  return new URLSearchParams(useLocation().search);
}

function Alert(props) {
  return <Alert elevation={6} variant="filled" {...props} />;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ClaimsDetails(props) {
  const providerId = localStorage.getItem("providerId")
  const query1 = useQuery1();
  const navigate = useNavigate();
  const {id} = useParams();
  const theme = useTheme();
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [selectedChoice, setSelectedChoice] = React.useState('');
  const [preauthId, setPreAuthId] = React.useState('');
  const [importMode, setImportMode] = React.useState(true);
  const [preauthData, setPreauthData] = React.useState('');
  const [idErrorMsg, setIdErrorMsg] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(false);
  const [enteredMembershipNo, setEnteredMembershipNo] = React.useState();
  const [tableData, setTableData] = React.useState();
  const [openPopup, setOpenPopup] = React.useState(false);
  const [source, setSource] = React.useState();

  const steps = getSteps();
  const isStepOptional = step => {
    // return step === 1;
  };

  // console.log("query.get", query1.get("type"))

  React.useEffect(()=>{
    if(query1.get("type") === "credit"){
      setSource('CI')
      setImportMode(false);
    } else {
      setSource('PRE_AUTH')
      setSelectedChoice("Yes");
    }
  },[])

  React.useEffect(() => {
    let membershipNo = query1.get('membershipNo');
    if (query1.get('isPreAuth')) {
      if (membershipNo) {
        handleSearch(membershipNo);
        setEnteredMembershipNo(membershipNo);
      }
    } else {
      // setImportMode(false);
      // props.setTitle("Create Claim")
    }
  }, []);

  React.useEffect(() => {
    if (query1.get('preId')) {
      importPreAuthData(query1.get('preId'));
    }
  }, [query1.get('preId')]);

  const handleClose = event => {
    localStorage.removeItem('claimreimid');

    navigate(`/claims`);
    // window.location.reload();
  };

  const handleChoice = event => {
    setSelectedChoice(event.target.value);
    if (event.target.value === 'No') {
      setSource('CI')
      setImportMode(false);
      // props.setTitle("Credit Claim")
    } else {
      setSource('PRE_AUTH')
      // props.setTitle("Preauth Claim")
    }
  };
  const handlePreAuthId = event => {
    setPreAuthId(event.target.value);
  };

  const importPreAuthData = pid => {
    if (pid) {
      preauthService.getPreAuthById(pid, providerId).subscribe(res => {
        if (res.preAuthStatus === 'WAITING_FOR_CLAIM') {
          setPreauthData(res);
          setImportMode(false);
        }
        if (res.preAuthStatus !== 'WAITING_FOR_CLAIM') {
          setIdErrorMsg(true);
        }
      });
      // setImportMode(false)
    }
  };

  const importFromPreAuth = () => {
    navigate(`/submit-claim?preId=${preauthId}&mode=create`);
  };

  const isStepSkipped = step => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      //API call 1st step
    }
    if (activeStep === 1) {
      //API call 2nd step
    }

    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(prevSkipped => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <ClaimsBasicComponent
            preauthData={preauthData}
            handleClose={handleClose}
            handleNext={handleNext}
            setTitle={props.setTitle}
            source={source}
          />
        );
      case 1:
        // return <>2222</>;
        return <ClaimsDocumentComponent preauthData={preauthData} handleClose={handleClose} handleNext={handleNext} />;
        // case 2:
        //   return (
        //     <AgentOtherDetailsComponent
        //       handleClose={handleClose}
        //     />
        //   );

      default:
        return 'Unknown step';
    }
  };

  const handleIDErrorClose = (event, reason) => {
    setIdErrorMsg(false);
  };

  const [tabvalue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = membershipNo => {
    preauthService.getPreAuthsByMembership(membershipNo || enteredMembershipNo).subscribe(res => {
      if (res.content.length > 0) {
        setTableData(res.content);
        setShowDataTable(true);
      } else {
        setOpenPopup(true);
        props.setTitle('Claim');
      }
    });
  };

  const handleYes = preAuth => {
    setOpenPopup(false);
    setImportMode(false);
    props.setTitle('Credit Claim');
  };

  const clickHandler = preAuth => {
    Navigate(`/submit-claim?preId=${preAuth.id}&mode=edit`);
  };

  const columnsDefinations = [
    { field: 'id', headerName: 'PreAuth ID' },
    { field: 'memberShipNo', headerName: 'MembershipNuber ' },
    { field: 'policyNumber', headerName: 'Policy Number' },
    { field: 'preAuthType', headerName: 'PreAuth Type' },
  ];

  const configuration = {
    enableSelection: false,
    scrollHeight: '285px',
    pageSize: 10,
    actionButtons: [
      {
        icon: 'pi pi-eye',
        onClick: clickHandler,
      },
    ],
    header: {
      enable: true,
      text: 'POLICY CONDITION (COVERAGE / BENEFITS)',
    },
  };

  const data$ = new Observable(subscriber => {
    subscriber.next(tableData);
  });

  const dataSource$ = () => {
    return data$.pipe(
      map(data => {
        data.content = data;
        return data;
      }),
    );
  };

  return (
    <div>
      {id ? (
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '20px',
            height: '2em',
            color: '#000',
            fontSize: '18px',
          }}>
          <span
            style={{
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: '5px',
            }}>
            Claim Management-Edit
          </span>
        </Grid>
      ) : null}
      {!id && importMode ? (
        <Paper elevation="none" className={classes.prospectImportOuterContainer}>
          <Snackbar open={idErrorMsg} autoHideDuration={6000} onClose={handleIDErrorClose}>
            <Alert onClose={handleIDErrorClose} severity="error">
              Please enter a Approved Pre-Auth ID
            </Alert>
          </Snackbar>
          {/* <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
                id="membershipNumber"
                name="membershipNumber"
                label="Enter Membership Number"
                style={{ width: '100%' }}
                value={enteredMembershipNo}
                onChange={e => setEnteredMembershipNo(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                style={{ background: theme.palette.primary.main, color: '#fff' }}
                onClick={handleSearch}>
                Search
              </Button>
            </Grid>
          </Grid> */}
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            {/* <Grid item xs={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Do you want to import data from PreAuth</FormLabel>
                <RadioGroup
                  aria-label="preauthimport"
                  name="preauthimport"
                  value={selectedChoice}
                  onChange={handleChoice}
                  row
                  className={classes.prospectImportRadioGroup}>
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid> */}
            {selectedChoice === 'Yes' && (
              <Grid item xs={4}>
                <TextField
                  style={{ width: '100%' }}
                  id="standard-basic"
                  variant="standard"
                  name="preauthId"
                  value={preauthId}
                  onChange={handlePreAuthId}
                  label="PreAuth ID"
                />
              </Grid>
            )}
            {selectedChoice === 'Yes' && preauthId !== '' && preauthId !== null && (
              <Grid item xs={2}>
                <Button variant="contained" color="primary" onClick={importFromPreAuth}>
                  Import data
                </Button>
              </Grid>
            )}
          </Grid>
          {showDataTable && (
            <Box marginTop={'25px'}>
              <Eo2v2DataGrid $dataSource={dataSource$} config={configuration} columnsDefination={columnsDefinations} />
            </Box>
          )}
        </Paper>
      ) : (
        // <></>
        <TabView scrollable style={{ fontSize: '14px' }}>
          <TabPanel leftIcon="pi pi-user mr-2" header="Claim Details">
            <div className={classes.root}>
              <Paper elevation="none">
                <Stepper activeStep={activeStep} style={{ backgroundColor: 'transparent' }}>
                  {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (isStepOptional(index)) {
                      labelProps.optional = <Typography variant="caption">Optional</Typography>;
                    }
                    if (isStepSkipped(index)) {
                      stepProps.completed = false;
                    }
                    return (
                      <Step key={label} {...stepProps}>
                        <StepLabel {...labelProps} className={classes.stepText}>
                          {label}
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </Paper>
              <div>
                {activeStep === steps.length ? (
                  <div>
                    <Typography className={classes.instructions}>All steps completed</Typography>
                    <Button onClick={handleClose} variant="contained" color="primary" className={classes.button}>
                      Go to Table
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
                    <div>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        className={`p-button-text ${classes.button}`}
                        style={{ marginRight: '5px' }}>
                        Back
                      </Button>
                      {isStepOptional(activeStep) && (
                        <Button variant="contained" color="primary" onClick={handleSkip} className={classes.button}>
                          Skip
                        </Button>
                      )}

                      <Button variant="contained" color="primary" onClick={handleNext} className={classes.button}>
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabPanel>
          <TabPanel leftIcon="pi pi-user mr-2" header="Claim Audit Trail">
            <ClaimsTimelineComponent />
          </TabPanel>
        </TabView>
      )}

      <Modal
        open={openPopup}
        onClose={e => setOpenPopup(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" align="center">
            No PreAuth found for given id. You can still create Claim Reimbursement.
          </Typography>
          <Typography id="modal-modal-description" style={{ marginTop: '8px' }}>
            For create Claim Reimbursement click Yes.
          </Typography>
          <Box display={'flex'} justifyContent={'end'} marginTop={'15px'}>
            <Button variant="text" onClick={e => setOpenPopup(false)} className="p-button-text">
              No
            </Button>
            <Button
              variant="contained"
              // style={{ background: theme.palette.primary.main, color: '#fff' }}
              onClick={handleYes}>
              Yes
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
