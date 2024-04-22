import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import { Button } from 'primereact/button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import 'date-fns';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import ClaimsDocumentComponent from './document.component';
import PreAuthTimelineComponent from './preauth.timeline.component';
import ClaimsPreAuthIPDComponent from './preauthIPD.component';
import ClaimsPreAuthOPDComponent from './preauthOPD.component';
import { TabView, TabPanel } from 'primereact/tabview';

const useStyles = makeStyles(theme => ({
  root: {
    // width: '100%',
    flexDirection: 'column',
    // marginLeft: '1%',
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  nextButton: {
    backgroundColor: '#313c96',
    color: '#f1f1f1',
  },
  stepText: {
    '& span': {
      fontSize: '16px',
    },
    '& .MuiStepIcon-root.MuiStepIcon-active': {
      color: '#313c95',
    },
    '& .MuiStepIcon-root.MuiStepIcon-completed': {
      color: '#313c95',
    },
  },
}));

function getSteps() {
  return ['Pre-Auth Claims', 'Document details'];
}

function useQuery1() {
  return new URLSearchParams(useLocation().search);
}

export default function ClaimsPreAuthDetails(props) {
  // const query1 = useQuery1();
  // const history = useHistory();
  // const [activeIndex, setActiveIndex] = React.useState(0);

  // const classes = useStyles();
  // const [activeStep, setActiveStep] = React.useState(0);
  // const [skipped, setSkipped] = React.useState(new Set());
  // const steps = getSteps();

  // React.useEffect(() => {
  //   if(query1.get('addDoc')) setActiveStep(1)
  // }, []);

  // const isStepOptional = step => {
  //   // return step === 1;
  // };

  // const handleClose = event => {
  //   localStorage.removeItem('preauthid');
  //   history.push(`/claims/claims-preauth?mode=viewList`);
  //   // window.location.reload();
  // };

  // const isStepSkipped = step => {
  //   return skipped.has(step);
  // };

  // const handleNext = () => {
  //   if (activeStep === 0) {
  //     //API call 1st step
  //   } else if (activeStep === 1) {
  //     history.push(`/claims/claims-preauth?mode=viewList`);
  //     // window.location.reload();
  //   }

  //   let newSkipped = skipped;
  //   if (isStepSkipped(activeStep)) {
  //     newSkipped = new Set(newSkipped.values());
  //     newSkipped.delete(activeStep);
  //   }

  //   setActiveStep(prevActiveStep => prevActiveStep + 1);
  //   setSkipped(newSkipped);
  // };

  // const handleBack = () => {
  //   setActiveStep(prevActiveStep => prevActiveStep - 1);
  // };

  // const handleSkip = () => {
  //   if (!isStepOptional(activeStep)) {
  //     // You probably want to guard against something like this,
  //     // it should never occur unless someone's actively trying to break something.
  //     throw new Error("You can't skip a step that isn't optional.");
  //   }

  //   setActiveStep(prevActiveStep => prevActiveStep + 1);
  //   setSkipped(prevSkipped => {
  //     const newSkipped = new Set(prevSkipped.values());
  //     newSkipped.add(activeStep);
  //     return newSkipped;
  //   });
  // };

  // const getStepContent = step => {
  //   switch (step) {
  //     case 0:
  //       return query1.get('auth') === 'OPD' ? (
  //         <ClaimsPreAuthOPDComponent handleClose={handleClose} handleNext={handleNext} />
  //       ) : (
  //         <ClaimsPreAuthIPDComponent handleClose={handleClose} handleNext={handleNext} />
  //       );
  //     case 1:
  //       return <ClaimsDocumentComponent handleClose={handleClose} handleNext={handleNext} />;
  //     //   case 2:
  //     //     return (
  //     //       <AgentOtherDetailsComponent
  //     //         handleClose={handleClose}
  //     //       />
  //     //     );

  //     default:
  //       return 'Unknown step';
  //   }
  // };

  return (
    <div>dfghjk
      {/* {query1.get('mode') === 'edit' ? (
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '20px',
            height: '2em',
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
            Claim Management- Edit Pre-Auth Claim
          </span>
        </Grid>
      ) : null}

      <TabView scrollable style={{ fontSize: '14px' }} activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
        <TabPanel leftIcon="pi pi-user mr-2" header="Pre-Auth Details">
          <div className={classes.root}>
            {query1.get('auth') === 'IPD' && (
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
            )}
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

                    <Button variant="contained" color="primary" onClick={handleNext} className={classes.nextButton}>
                      {activeStep === steps.length - 1 ? 'Exit' : 'Next'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabPanel>
        <TabPanel leftIcon="pi pi-user-minus mr-2" header="Pre-Auth Audit Trail">
          <PreAuthTimelineComponent />
        </TabPanel>
      </TabView> */}
    </div>
  );
}
