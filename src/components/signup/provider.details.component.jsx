import {
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import ProviderAddressDetailsComponent from "./provider.address.details.component";
import ProviderOtherDetailsComponent from "./provider.other.details.component";
import ProviderPersonalDetailsComponent from "./provider.personal.details.component";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import React, { useEffect } from "react";
import { Button } from "primereact/button";
import { IdentificationTypeService } from "../../remote-api/api/master-services/identification.type.service";
import { ProvidersService } from "../../remote-api/api/provider-services";
import { AddressService } from "../../remote-api/api/master-services/address.service";
import { makeStyles } from "@mui/styles";

const identificationservice = new IdentificationTypeService();
const providerservice = new ProvidersService();
const addressservice = new AddressService();
let iden$ = identificationservice.getIdentificationTypes();
let pt$ = providerservice.getParentProviders();
let addr$ = addressservice.getAddressConfig();

const useStyles = makeStyles((theme) => ({
  root: {
    // width: '100%',
    flexDirection: "column",
    /* marginLeft: "5%", */
  },
  backButton: {
    // marginRight: theme.spacing(1),
  },
  instructions: {
    // marginTop: theme.spacing(1),
    // marginBottom: theme.spacing(1),
  },
  stepText: {
    "& span": {
      fontSize: "16px",
    },
  },
}));

function getSteps() {
  return ["Basic Details", "Address Details", "Other Details"];
}

function useQuery1() {
  return new URLSearchParams(useLocation().search);
}

export default function ProviderDetails(props) {
  const query1 = useQuery1();
  const navigate = useNavigate();
  const { id } = useParams();

  const [identificationTypes, setIdentificationTypes] = React.useState([]);
  const [parentProviders, setParentProviders] = React.useState([]);
  const [addressConfig, setAddressConfig] = React.useState([]);
  const [providerID, setProviderID] = React.useState("");

  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const steps = getSteps();
  const isStepOptional = (step) => {
    // return step === 1;
  };

  const useObservable = (observable, setter) => {
    useEffect(() => {
      let subscription = observable.subscribe((result) => {
        setter(result.content);
      });
      return () => subscription.unsubscribe();
    }, [observable, setter]);
  };
  const useObservable2 = (observable, setter) => {
    useEffect(() => {
      let subscription = observable.subscribe((result) => {
        let tableArr = [];
        if (result.content && result.content) {
          result.content.forEach((ele) => {
            tableArr.push({
              name: ele.providerBasicDetails.name,
              id: ele.id,
            });
          });
        }
        setter(tableArr);
      });
      return () => subscription.unsubscribe();
    }, [observable, setter]);
  };

  useEffect(() => {
    let subscription = addr$.subscribe((result) => {
      if (result.length > 0) {
        result.forEach((prop, i) => {
          prop.addressConfigurationFieldMappings.forEach((field, j) => {
            // let fname = "field"+i+j;
            // field['fieldName'] = fname;
            field["value"] = "";
            if (field.sourceId !== null && field.sourceId !== "") {
              field["sourceList"] = [];
            }
            if (field.type === "dropdown" && field.sourceId === null) {
              if (
                field.addressConfigurationFieldCustomValueMappings.length !== 0
              ) {
                field["sourceList"] =
                  field.addressConfigurationFieldCustomValueMappings;
              }
              // if(field.addressConfigurationFieldCustomValueMappings.length === 0 || field.addressConfigurationFieldCustomValueMappings === null){
              //   field['sourceList'] = [];
              // }
            }
          });
        });
        setAddressConfig(result);
      }
    });
    return () => subscription.unsubscribe();
  }, [addr$, setAddressConfig]);

  useObservable2(pt$, setParentProviders);
  useObservable(iden$, setIdentificationTypes);

  const handleClose = (event) => {
    navigate(`/dashboard`);
    // window.location.reload();
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = (param) => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    console.log(activeStep);
    setActiveStep(param);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ProviderPersonalDetailsComponent
            identificationTypes={identificationTypes}
            pageMode={query1.get("mode")}
            handleClose={handleClose}
            handleNext={handleNext}
            parentProviders={parentProviders}
            setProviderID={setProviderID}
          />
        );
      case 1:
        return (
          <ProviderAddressDetailsComponent
            handleClose={handleClose}
            providerID={providerID}
            handleNext={handleNext}
            addressConfig={addressConfig}
          />
        );
      case 2:
        return (
          <ProviderOtherDetailsComponent
            handleClose={handleClose}
            providerID={providerID}
          />
        );

      default:
        return "Unknown step";
    }
  };

  return (
    <div>
      {query1.get("mode") === "edit" ? (
        <Grid
          item
          xs={12}
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: "20px",
            height: "2em",
            color: "#000",
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
            Provider Management- Edit Provider
          </span>
        </Grid>
      ) : null}

      <div className={classes.root}>
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
                  onClick={() => handleNext((activeStep + 1) % 3)}
                  className={classes.button}
                >
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
