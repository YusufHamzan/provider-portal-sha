import {
  Button,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { TabPanel, TabView } from "primereact/tabview";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ClaimsPreAuthIPDComponent from "./preauthIPD.component";
import ClaimsDocumentComponent from "./document.component";
import PreAuthTimelineComponent from "./preauth.timeline.component";

const useStyles = makeStyles((theme) => ({
  root: {
    // width: '100%',
    flexDirection: "column",
    // marginLeft: '1%',
  },
  backButton: {
    //   marginRight: theme.spacing(1),
  },
  instructions: {
    //   marginTop: theme.spacing(1),
    //   marginBottom: theme.spacing(1),
  },
  nextButton: {
    backgroundColor: "#313c96",
    color: "#f1f1f1",
  },
  stepText: {
    "& span": {
      fontSize: "16px",
    },
    "& .MuiStepIcon-root.MuiStepIcon-active": {
      color: "#313c95",
    },
    "& .MuiStepIcon-root.MuiStepIcon-completed": {
      color: "#313c95",
    },
  },
}));

function getSteps() {
  return ["Pre-Auth Claims", "Document details"];
}

function useQuery1() {
  return new URLSearchParams(useLocation().search);
}

const ClaimsIPDPreAuthDetails = () => {
  const query1 = useQuery1();
  const { id } = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const steps = getSteps();

  React.useEffect(() => {
    if (query1.get("addDoc")) setActiveStep(1);
  }, []);

  const isStepOptional = (step) => {
    // return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // setActiveStep(1);
    } else if (activeStep === 1) {
      navigate(`/preauths`);
      // window.location.reload();
    }

    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleClose = (event) => {
    localStorage.removeItem("preauthid");
    navigate(`/preauths`);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ClaimsPreAuthIPDComponent
            handleClose={handleClose}
            handleNext={handleNext}
          />
        );
      //    query1.get('auth') === 'OPD' ? (
      //     <ClaimsPreAuthOPDComponent handleClose={handleClose} handleNext={handleNext} />
      //   ) : (
      //   );
      case 1:
        return (
          <ClaimsDocumentComponent
            handleClose={handleClose}
            handleNext={handleNext}
          />
        );
      //   case 2:
      //     return (
      //       <AgentOtherDetailsComponent
      //         handleClose={handleClose}
      //       />
      //     );

      default:
        return "Unknown step";
    }
  };

  return (
    <>
      {id ? (
        <Grid
          item
          xs={12}
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: "20px",
            height: "2em",
            fontSize: "18px",
          }}
        >
          <span
            style={{
              fontWeight: "600",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "5px",
            }}
          >
            Claim Management- Edit Pre-Auth Claim
          </span>
        </Grid>
      ) : null}
      <TabView
        scrollable
        style={{ fontSize: "14px" }}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel leftIcon="pi pi-user mr-2" header="Pre-Auth Details">
          <div className={classes.root}>
            {/* {query1.get('auth') === 'IPD' && ( */}
            <Paper elevation="none">
              <Stepper
                activeStep={activeStep}
                style={{ backgroundColor: "transparent" }}
              >
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};
                  if (isStepOptional(index)) {
                    labelProps.optional = (
                      <Typography variant="caption">Optional</Typography>
                    );
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
            {/* )} */}
            <div>
              {activeStep === steps.length ? (
                <div>
                  <Typography className={classes.instructions}>
                    All steps completed
                  </Typography>
                  <Button
                    onClick={handleClose}
                    variant="contained"
                    color="primary"
                    className={classes.button}
                  >
                    Go to Table
                  </Button>
                </div>
              ) : (
                <div>
                  <Typography className={classes.instructions}>
                    {getStepContent(activeStep)}
                  </Typography>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      className={`p-button-text ${classes.button}`}
                      style={{ marginRight: "5px" }}
                    >
                      Back
                    </Button>
                    {isStepOptional(activeStep) && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSkip}
                        className={classes.button}
                      >
                        Skip
                      </Button>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      className={classes.nextButton}
                    >
                      {activeStep === steps.length - 1 ? "Exit" : "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabPanel>
        <TabPanel
          leftIcon="pi pi-user-minus mr-2"
          header="Pre-Auth Audit Trail"
        >
          <PreAuthTimelineComponent />
        </TabPanel>
      </TabView>
    </>
  );
};

export default ClaimsIPDPreAuthDetails;
