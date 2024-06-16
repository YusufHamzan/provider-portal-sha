import { Formik } from "formik";
import * as React from "react";
import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import * as yup from "yup";
import { Button } from "primereact/button";
import { AddressService } from "../../remote-api/api/master-services/address.service";
import { ProvidersService } from "../../remote-api/api/provider-services";
import {
  Alert,
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Tooltip,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

const schemaObject = {
  mobileNo: yup
    .string()
    ["min"](10, "Must be exactly 10 digit")
    ["max"](10, "Must be exactly 10 digit")
    .nullable(),
  // .matches(new RegExp('[0-9]{10}'),'Contact number is not valid'),
  alternateMobileNo: yup
    .string()
    ["min"](10, "Must be exactly 10 digit")
    ["max"](10, "Must be exactly 10 digit")
    .nullable(),
  emailId: yup.string().email("Enter a valid email").nullable(),
  alternateEmailId: yup.string().email("Enter a valid email").nullable(),
  // alternateMobileNo: yup
  //   .string("Enter your Contact Number")
  //   .test('len', 'Must be exactly 10 digit', val => val.length === 10),
  // .matches(new RegExp('[0-9]{10}'),'Contact number is not valid'),
  // alternateEmailId: yup
  //   .string('Enter your email')
  //   .email('Enter a valid email'),
};
let validationSchema = yup.object(schemaObject);

const initialValues = {
  name: "",
  emailId: "",
  alternateEmailId: "",
  mobileNo: "",
  alternateMobileNo: "",
  openingTimeHH: "",
  openingTimeMM: "",
  closeingTimeHH: "",
  closeingTimeMM: "",
  breakStartTimeHH: "",
  breakStartTimeMM: "",
  breakEndTimeHH: "",
  breakEndTimeMM: "",
  providerWeeklyHolidays: [],
};

const useStyles = makeStyles((theme) => ({
  input1: {
    width: "50%",
  },
  clientTypeRadioGroup: {
    flexWrap: "nowrap",
    "& label": {
      flexDirection: "row",
    },
  },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
  formControl1: {
    // margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
const addressservice = new AddressService();
const providerservice = new ProvidersService();
function useQuery1() {
  return new URLSearchParams(useLocation().search);
}

export default function ProviderAddressDetailsComponent(props) {
  const classes = useStyles();
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const hours = [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
  ];
  const mins = [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "50",
    "51",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "59",
  ];
  const query2 = useQuery1();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formObj, setFormObj] = React.useState({});
  const [providerAddressForm, setProviderAddressForm] = React.useState({
    ...initialValues,
  });

  const [addressConfig, setAddressConfig] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (props.addressConfig.length !== 0) {
      setAddressConfig(props.addressConfig);

      let frmObj = {};
      // let frmLst = {};
      props.addressConfig.forEach((prop, i) => {
        prop.addressConfigurationFieldMappings.map((field, j) => {
          frmObj[field.fieldName] = field.defaultValue;
          if (
            field.dependsOn == "" &&
            field.type == "dropdown" &&
            field.modifyApiURL
          ) {
            addressservice
              .getSourceList(field.modifyApiURL)
              .subscribe((res) => {
                // field.sourceList =res.content;
                const list = [...props.addressConfig];
                list[i].addressConfigurationFieldMappings[j].sourceList =
                  res.content;
                setAddressConfig(list);
                // frmLst[field.fieldName] = res.content;
              });
          }
        });
      });
      setFormObj(frmObj);
      /* formik.setValues({
      ...formik.values,
      addressData: frmObj
    }) */

      setProviderAddressForm({
        ...providerAddressForm,
        addressData: frmObj,
      });

      // setFieldOptionList(frmLst);
      populateData();

      // const validationsArr = [
      //   {type: "required", params: ["Enter name"]},
      //   {type: "min", params: [3, "Enter name"]},
      //   {type: "max", params: [3, "Enter name"]},
      // ]

      let newSchema = {
        ...schemaObject,
      };
      let addressDataSchemaObject = {};
      const regex = /^[\w&., \-]*$/;
      props.addressConfig.forEach((prop, i) => {
        prop.addressConfigurationFieldMappings.map((field, j) => {
          let validationsArr = [];
          if (field.required === "true") {
            validationsArr.push({
              type: "required",
              params: ["This field is required"],
            });
          }
          if (
            field.lengthValidation === "true" &&
            field.size !== "" &&
            field.size !== null &&
            field.dataType !== "numeric"
          ) {
            let msg = "length must be" + " " + field.size + " " + "digits";

            validationsArr.push({
              type: "min",
              params: [Number(field.size), msg],
            });
            validationsArr.push({
              type: "max",
              params: [Number(field.size), msg],
            });
          }
          if (
            field.lengthValidation === "true" &&
            field.size !== "" &&
            field.size !== null &&
            field.dataType === "numeric"
          ) {
            let msg = "length must be" + " " + field.size + " " + "digits";

            validationsArr.push({
              type: "test",
              params: [
                "len",
                msg,
                (val) => val && val.toString().length === Number(field.size),
              ],
            });
          }

          if (
            field.spacialCharacterValidation === "true" &&
            field.dataType !== "numeric"
          ) {
            let msg = "No special character allowed";
            validationsArr.push({ type: "matches", params: [regex, msg] });
          }

          if (validationsArr.length > 0) {
            let v;
            if (field.dataType === "numeric") {
              v = yup.number();
            } else {
              v = yup.string();
            }

            validationsArr.forEach((item) => {
              v = v[item.type](...item.params);
            });

            addressDataSchemaObject = {
              ...addressDataSchemaObject,
              [field.fieldName]: v,
            };
          }
        });
      });

      const addressDataSchema = yup.object(addressDataSchemaObject);
      newSchema = { ...newSchema, addressData: addressDataSchema };
      validationSchema = yup.object(newSchema);

      /* props.addressConfig.forEach((prop, i) => {
      prop.addressConfigurationFieldMappings.map((field, j) => {
        
        
        v = {}
        validationsArr.forEach(item => {
          v= yup[item.type](...item.params)
        });

        newSchema = {
          ...newSchema,
          [field.fieldName]: v
        }
      });
    }); */
    }
  }, [props.addressConfig]);

  const [personName, setPersonName] = React.useState([]);

  //handle Multiselect
  // const handleChangeMultiple = (event) => {
  //
  //   let options = event.target.value ? event.target.value : [];
  //   const value = [];
  //   for (let i = 0, l = options.length; i < l; i += 1) {
  //     if (options[i].selected) {
  //       value.push(options[i].value);
  //     }
  //   }
  //   formik.setFieldValue('providerWeeklyHolidays', value)
  // };

  //handle second step submit
  const handleFinalSubmit = (values) => {
    let addrArr = [];

    if (values.addressData) {
      for (let [key, value] of Object.entries(values.addressData)) {
        let objAddr = {
          addressDetails: {
            [key]: value,
          },
          addressType: "CURRENT_ADDRESS",
        };
        addrArr.push(objAddr);
      }
    }
    let payloadTwo = {
      providerAddresses: {
        addresses: addrArr,
        providerContactPersonDetails: {
          name: values.name,
          emailId: values.emailId,
          alternateEmailId: values.alternateEmailId,
          mobileNo: values.mobileNo,
          alternateMobileNo: values.alternateMobileNo,
          openingTime: values.openingTimeHH + ":" + values.openingTimeMM,
          closeingTime: values.closeingTimeHH + ":" + values.closeingTimeMM,
          breakStartTime:
            values.breakStartTimeHH + ":" + values.breakStartTimeMM,
          breakEndTime: values.breakEndTimeHH + ":" + values.breakEndTimeMM,
        },
        providerWeeklyHolidays: values.providerWeeklyHolidays,
      },
    };
    // if (query2.get("mode") === "create") {
    providerservice
      .editProvider(payloadTwo, props.providerID, "2")
      .subscribe((res) => {
        props.handleNext();
      });
    // }
    // if (query2.get("mode") === "edit") {
    //   providerservice.editProvider(payloadTwo, id, "2").subscribe((res) => {

    //     props.handleNext();
    //   });
    // }
  };

  const getMinutes = (str) => {
    return str ? str.split(":")[1] : "";
  };

  const getHours = (str) => {
    return str ? str.split(":")[0] : "";
  };

  // React.useEffect(() => {
  //   if (id) {
  //     populateData(id);
  //   }
  // }, [id]);

  const populateData = () => {
    if (id) {
      let frmOb = {};
      providerservice.getProviderDetails(id).subscribe((val) => {
        if (
          val.providerAddresses.length !== 0 &&
          val.providerAddresses &&
          props.addressConfig &&
          props.addressConfig.length !== 0
        ) {
          val.providerAddresses.addresses.forEach((addr) => {
            frmOb = { ...frmOb, ...addr.addressDetails };
          });

          setFormObj(frmOb);

          val.providerAddresses.addresses.forEach((item) => {
            props.addressConfig.forEach((prop, i) => {
              prop.addressConfigurationFieldMappings.forEach((field, j) => {
                if (Object.keys(item.addressDetails)[0] === field.fieldName) {
                  field["value"] = item.addressDetails[field.fieldName];
                }
              });
            });
          });

          props.addressConfig.forEach((prop, i) => {
            prop.addressConfigurationFieldMappings.map((field, j) => {
              if (field.type == "dropdown" && prop.dependOnfields !== null) {
                let arr = [];
                let dArr = callAPiFunc(field, prop, arr);

                const word = "{code}";
                let apiURL = field.modifyApiURL;
                dArr.forEach((cd) => {
                  apiURL =
                    apiURL.slice(0, apiURL.lastIndexOf(word)) +
                    apiURL.slice(apiURL.lastIndexOf(word)).replace(word, cd);
                });

                addressservice.getSourceList(apiURL).subscribe((res) => {
                  const list = [...props.addressConfig];
                  list[i].addressConfigurationFieldMappings[j].sourceList =
                    res.content;
                  setAddressConfig(list);
                });
              }
            });
          });
        }

        setProviderAddressForm({
          ...providerAddressForm,
          name: val.providerAddresses.providerContactPersonDetails.name,
          emailId: val.providerAddresses.providerContactPersonDetails.emailId,
          alternateEmailId:
            val.providerAddresses.providerContactPersonDetails.alternateEmailId,
          mobileNo: val.providerAddresses.providerContactPersonDetails.mobileNo,
          alternateMobileNo:
            val.providerAddresses.providerContactPersonDetails
              .alternateMobileNo,
          openingTimeHH: getHours(
            val.providerAddresses.providerContactPersonDetails.openingTime
          ),
          openingTimeMM: getMinutes(
            val.providerAddresses.providerContactPersonDetails.openingTime
          ),
          closeingTimeHH: getHours(
            val.providerAddresses.providerContactPersonDetails.closeingTime
          ),
          closeingTimeMM: getMinutes(
            val.providerAddresses.providerContactPersonDetails.closeingTime
          ),
          breakStartTimeHH: getHours(
            val.providerAddresses.providerContactPersonDetails.breakStartTime
          ),
          breakStartTimeMM: getMinutes(
            val.providerAddresses.providerContactPersonDetails.breakStartTime
          ),
          breakEndTimeHH: getHours(
            val.providerAddresses.providerContactPersonDetails.breakEndTime
          ),
          breakEndTimeMM: getMinutes(
            val.providerAddresses.providerContactPersonDetails.breakEndTime
          ),
          providerWeeklyHolidays: val.providerAddresses.providerWeeklyHolidays
            ? val.providerAddresses.providerWeeklyHolidays
            : [],
        });
      });
    }
  };

  const callAPiFunc = (field, prop, resultarr) => {
    if (props.addressConfig.length !== 0) {
      props.addressConfig.forEach((pr, i) => {
        pr.addressConfigurationFieldMappings.forEach((fi, j) => {
          if (fi.fieldName === prop.dependOnfields[0]) {
            // let p = prop.dependOnfields[0];
            // let fb = formObj[p];
            //
            resultarr.push(fi.value);
            if (pr.dependOnfields !== null) {
              callAPiFunc(fi, pr, resultarr);
            }
          }
        });
      });
    }

    return resultarr;
  };

  const handleSnackClose = (event, reason) => {
    setOpen(false);
  };

  return (
    <Paper elevation="none">
      <Snackbar open={open} autoHideDuration={6000} onClose={handleSnackClose}>
        <Alert
          onClose={handleSnackClose}
          severity="error"
          elevation={6}
          variant="filled"
        >
          Break time range is not valid
        </Alert>
      </Snackbar>

      <Box p={3} my={2}>
        <Formik
          enableReinitialize={true}
          initialValues={{
            ...providerAddressForm,
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (
              values.openingTimeHH ||
              values.closeingTimeHH ||
              values.breakStartTimeHH ||
              values.breakEndTimeHH
            ) {
              const openingTime =
                values.openingTimeHH * 60 + values.openingTimeMM;
              const closingTime =
                values.closeingTimeHH * 60 + values.closeingTimeMM;
              const breakStartTime =
                values.breakStartTimeHH * 60 + values.breakStartTimeMM;
              const breakEndTime =
                values.breakEndTimeHH * 60 + values.breakEndTimeMM;

              if (
                Number(breakStartTime) > Number(openingTime) &&
                Number(breakStartTime) < Number(closingTime) &&
                Number(breakEndTime) > Number(openingTime) &&
                Number(breakEndTime) < Number(closingTime) &&
                Number(breakStartTime) < Number(breakEndTime)
              ) {
                handleFinalSubmit(values);
              } else {
                setOpen(true);
              }
            } else {
              handleFinalSubmit(values);
            }
          }}
        >
          {({
            errors,
            touched,
            handleSubmit,
            values,
            handleChange,
            setValues,
            setFieldValue,
          }) => {
            const handleDynamicAddressChange = (e, field, p) => {
              const { name, value } = e.target;

              if (props.addressConfig && props.addressConfig.length !== 0) {
                if (name && value) {
                  setFormObj({
                    ...formObj,
                    [name]: value,
                  });

                  setValues({
                    ...values,
                    addressData: {
                      ...values.addressData,
                      [name]: value,
                    },
                  });
                }

                props.addressConfig.forEach((p, i) => {
                  p.addressConfigurationFieldMappings.map((f, j) => {
                    if (f.fieldName === name) {
                      f["value"] = value;
                    }
                  });
                });

                props.addressConfig.forEach((p, i) => {
                  p.addressConfigurationFieldMappings.map((f, j) => {
                    if (field.type == "dropdown" && p.dependOnfields !== null) {
                      if (p.dependOnfields[0] === field.fieldName) {
                        const word = "{code}";
                        let arr = [];
                        let dArr = callAPiFunc(f, p, arr);

                        let apiURL = f.modifyApiURL;
                        dArr.forEach((cd) => {
                          apiURL =
                            apiURL.slice(0, apiURL.lastIndexOf(word)) +
                            apiURL
                              .slice(apiURL.lastIndexOf(word))
                              .replace(word, cd);
                        });
                        addressservice
                          .getSourceList(apiURL)
                          .subscribe((res) => {
                            const list = [...addressConfig];
                            list[i].addressConfigurationFieldMappings[
                              j
                            ].sourceList = res.content;
                            setAddressConfig(list);
                          });
                      }
                    }
                  });
                });
              }
            };
            const handleChangeHolidays = (event) => {
              setFieldValue("providerWeeklyHolidays", event.target.value);
            };
            const errorTxtFnc = (parentField, field) => {
              return (
                touched.hasOwnProperty(parentField) &&
                touched[parentField][field] &&
                Boolean(
                  errors.hasOwnProperty(parentField) &&
                    errors[parentField][field]
                )
              );
            };
            const helperTextFnc = (parentField, field) => {
              return (
                touched.hasOwnProperty(parentField) &&
                touched[parentField][field] &&
                errors.hasOwnProperty(parentField) &&
                errors[parentField][field]
              );
            };
            return (
              <form onSubmit={handleSubmit} noValidate>
                {props.addressConfig && props.addressConfig.length !== 0 && (
                  <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                    {addressConfig.map((prop, i) => {
                      return prop.addressConfigurationFieldMappings.length !==
                        1 ? (
                        <Grid item xs={6}>
                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <InputLabel
                              id="demo-simple-select-label"
                              style={{ marginBottom: "0px" }}
                            >
                              {prop.levelName}
                            </InputLabel>
                            {prop.iButtonRequired === "true" && (
                              <Tooltip
                                title={prop.iButtonMessage}
                                placement="top"
                              >
                                <InfoOutlinedIcon
                                  style={{ fontSize: "medium" }}
                                />
                              </Tooltip>
                            )}
                          </div>
                          {prop.addressConfigurationFieldMappings.map(
                            (field, j) => {
                              return (
                                <div>
                                  {field.type === "dropdown" &&
                                    !field.readOnly && (
                                      <FormControl
                                        className={classes.formControl}
                                      >
                                        <Select
                                          labelId="demo-simple-select-label"
                                          name={field.fieldName}
                                          variant="standard"
                                          id="demo-simple-select"
                                          required={
                                            field.required === "true"
                                              ? true
                                              : false
                                          }
                                          error={errorTxtFnc(
                                            "addressData",
                                            field.fieldName
                                          )}
                                          value={
                                            formObj[field.fieldName]
                                              ? formObj[field.fieldName]
                                              : ""
                                          }
                                          onChange={(e) => {
                                            handleDynamicAddressChange(
                                              e,
                                              field,
                                              prop
                                            );
                                          }}
                                          style={{ marginRight: "8px" }}
                                        >
                                          {field.sourceList.map((ele) => {
                                            return (
                                              <MenuItem value={ele.code}>
                                                {ele.name}
                                              </MenuItem>
                                            );
                                          })}
                                        </Select>
                                        {touched.hasOwnProperty(
                                          "addressData"
                                        ) &&
                                          touched?.addressData[
                                            field.fieldName
                                          ] &&
                                          errors.hasOwnProperty(
                                            "addressData"
                                          ) &&
                                          errors.addressData[
                                            field.fieldName
                                          ] && (
                                            <FormHelperText
                                              style={{ color: "red" }}
                                            >
                                              {touched.hasOwnProperty(
                                                "addressData"
                                              ) &&
                                                touched?.addressData[
                                                  field.fieldName
                                                ] &&
                                                errors.hasOwnProperty(
                                                  "addressData"
                                                ) &&
                                                errors.addressData[
                                                  field.fieldName
                                                ]}
                                            </FormHelperText>
                                          )}
                                      </FormControl>
                                    )}
                                  {field.type === "textbox" &&
                                    !field.readOnly && (
                                      <TextField
                                        variant="standard"
                                        id="standard-basic"
                                        name={field.fieldName}
                                        type={
                                          field.dataType === "numeric"
                                            ? "number"
                                            : "text"
                                        }
                                        required={
                                          field.required === "true"
                                            ? true
                                            : false
                                        }
                                        error={errorTxtFnc(
                                          "addressData",
                                          field.fieldName
                                        )}
                                        helperText={helperTextFnc(
                                          "addressData",
                                          field.fieldName
                                        )}
                                        value={
                                          formObj[field.fieldName]
                                            ? formObj[field.fieldName]
                                            : ""
                                        }
                                        onChange={(e) => {
                                          handleDynamicAddressChange(e, field);
                                        }}
                                        style={{ marginTop: "8px" }}
                                      />
                                    )}

                                  {field.type === "textarea" &&
                                    !field.readOnly && (
                                      <TextField
                                        required={
                                          field.required === "true"
                                            ? true
                                            : false
                                        }
                                        id="standard-multiline-flexible"
                                        multiline
                                        variant="standard"
                                        name={field.fieldName}
                                        rowsMax={
                                          field.lengthValidation
                                            ? Number(prop.size)
                                            : 5
                                        }
                                        value={
                                          formObj[field.fieldName]
                                            ? formObj[field.fieldName]
                                            : ""
                                        }
                                        onChange={(e) => {
                                          handleDynamicAddressChange(e, field);
                                        }}
                                        error={errorTxtFnc(
                                          "addressData",
                                          field.fieldName
                                        )}
                                        helperText={helperTextFnc(
                                          "addressData",
                                          field.fieldName
                                        )}
                                      />
                                    )}
                                  {field.readOnly && (
                                    <TextField
                                      id="standard-basic"
                                      name={field.fieldName}
                                      value={field.defaultValue}
                                      defaultValue={field.defaultValue}
                                      readonly
                                      variant="standard"
                                      style={{
                                        marginTop: "10px",
                                        marginRight: "8px",
                                        width: "15%",
                                      }}
                                      size="small"
                                    />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </Grid>
                      ) : (
                        <Grid item xs={4}>
                          {prop.addressConfigurationFieldMappings.map(
                            (field, j) => {
                              console.log("props", addressConfig);
                              return (
                                <div>
                                  {field.type === "dropdown" &&
                                    !field.readOnly && (
                                      <FormControl
                                        className={classes.formControl}
                                        style={{ width: "60%" }}
                                      >
                                        <InputLabel
                                          id="demo-simple-select-label"
                                          style={{ marginBottom: "0px" }}
                                        >
                                          {prop.levelName}
                                        </InputLabel>
                                        <Select
                                          labelId="demo-simple-select-label"
                                          name={field.fieldName}
                                          required={
                                            field.required === "true"
                                              ? true
                                              : false
                                          }
                                          id="demo-simple-select"
                                          variant="standard"
                                          value={
                                            formObj[field.fieldName]
                                              ? formObj[field.fieldName]
                                              : ""
                                          }
                                          error={errorTxtFnc(
                                            "addressData",
                                            field.fieldName
                                          )}
                                          onChange={(e) => {
                                            handleDynamicAddressChange(
                                              e,
                                              field,
                                              prop
                                            );
                                          }}
                                        >
                                          {field.customValuePresent ===
                                            "CUSTOM" &&
                                            field.sourceList?.map((ele) => {
                                              return (
                                                <MenuItem value={ele.id}>
                                                  {ele.value}
                                                </MenuItem>
                                              );
                                            })}
                                          {field.customValuePresent ===
                                            "DYNAMIC" &&
                                            field.sourceList?.map((ele) => {
                                              return (
                                                <MenuItem value={ele.code}>
                                                  {ele.name}
                                                </MenuItem>
                                              );
                                            })}
                                        </Select>
                                        {touched.hasOwnProperty(
                                          "addressData"
                                        ) &&
                                          touched?.addressData[
                                            field.fieldName
                                          ] &&
                                          errors.hasOwnProperty(
                                            "addressData"
                                          ) &&
                                          errors.addressData[
                                            field.fieldName
                                          ] && (
                                            <FormHelperText
                                              style={{ color: "red" }}
                                            >
                                              {touched.hasOwnProperty(
                                                "addressData"
                                              ) &&
                                                touched?.addressData[
                                                  field.fieldName
                                                ] &&
                                                errors.hasOwnProperty(
                                                  "addressData"
                                                ) &&
                                                errors.addressData[
                                                  field.fieldName
                                                ]}
                                            </FormHelperText>
                                          )}
                                      </FormControl>
                                    )}

                                  {field.type === "textbox" &&
                                    !field.readOnly && (
                                      <TextField
                                        required={
                                          field.required === "true"
                                            ? true
                                            : false
                                        }
                                        id="standard-basic"
                                        name={field.fieldName}
                                        variant="standard"
                                        type={
                                          field.dataType === "numeric"
                                            ? "number"
                                            : "text"
                                        }
                                        value={
                                          formObj[field.fieldName]
                                            ? formObj[field.fieldName]
                                            : ""
                                        }
                                        onChange={(e) => {
                                          handleDynamicAddressChange(e, field);
                                        }}
                                        error={errorTxtFnc(
                                          "addressData",
                                          field.fieldName
                                        )}
                                        helperText={helperTextFnc(
                                          "addressData",
                                          field.fieldName
                                        )}
                                        label={prop.levelName}
                                      />
                                    )}

                                  {field.type === "textarea" &&
                                    !field.readOnly &&
                                    values.addressData && (
                                      <TextField
                                        id="standard-multiline-flexible"
                                        required={
                                          field.required === "true"
                                            ? true
                                            : false
                                        }
                                        multiline
                                        variant="standard"
                                        name={field.fieldName}
                                        rowsMax={
                                          field.lengthValidation
                                            ? Number(prop.size)
                                            : 5
                                        }
                                        value={
                                          values.addressData[field.fieldName]
                                            ? values.addressData[
                                                field.fieldName
                                              ]
                                            : ""
                                        }
                                        onChange={(e) => {
                                          handleDynamicAddressChange(e, field);
                                        }}
                                        error={errorTxtFnc(
                                          "addressData",
                                          field.fieldName
                                        )}
                                        helperText={helperTextFnc(
                                          "addressData",
                                          field.fieldName
                                        )}
                                        label={prop.levelName}
                                      />
                                    )}
                                  {field.readOnly && (
                                    <TextField
                                      id="standard-basic"
                                      name={field.fieldName}
                                      value={field.defaultValue}
                                      variant="standard"
                                      label={prop.levelName}
                                      defaultValue={field.defaultValue}
                                      disabled={true}
                                    />
                                  )}
                                  {prop.iButtonRequired === "true" && (
                                    <Tooltip
                                      title={prop.iButtonMessage}
                                      placement="top"
                                    >
                                      <InfoOutlinedIcon
                                        style={{
                                          fontSize: "medium",
                                          marginTop: "23px",
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </Grid>
                      );
                    })}
                    <Divider />
                  </Grid>
                )}
                <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                  <Grid item xs={4}>
                    <TextField
                      id="standard-basic"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      variant="standard"
                      label="Name"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      id="standard-basic"
                      name="emailId"
                      variant="standard"
                      value={values.emailId}
                      onChange={handleChange}
                      error={touched.emailId && Boolean(errors.emailId)}
                      helperText={touched.emailId && errors.emailId}
                      label="Email"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      variant="standard"
                      id="standard-basic"
                      name="alternateEmailId"
                      value={values.alternateEmailId}
                      onChange={handleChange}
                      error={
                        touched.alternateEmailId &&
                        Boolean(errors.alternateEmailId)
                      }
                      helperText={
                        touched.alternateEmailId && errors.alternateEmailId
                      }
                      label="Alt. Email"
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3} style={{ marginBottom: "30px" }}>
                  <Grid item xs={4}>
                    <TextField
                      id="standard-basic"
                      name="mobileNo"
                      type="text"
                      variant="standard"
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      value={values.mobileNo}
                      onChange={handleChange}
                      error={touched.mobileNo && Boolean(errors.mobileNo)}
                      helperText={touched.mobileNo && errors.mobileNo}
                      label="Mobile No."
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      id="standard-basic"
                      name="alternateMobileNo"
                      variant="standard"
                      type="text"
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      value={values.alternateMobileNo}
                      onChange={handleChange}
                      error={
                        touched.alternateMobileNo &&
                        Boolean(errors.alternateMobileNo)
                      }
                      helperText={
                        touched.alternateMobileNo && errors.alternateMobileNo
                      }
                      label="Alternate Mobile No."
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3} style={{ marginBottom: "30px" }}>
                  <Grid item xs={4}>
                    <div>
                      <span style={{ marginLeft: "10px", color: "#7c858a" }}>
                        Opening Time:{" "}
                      </span>
                    </div>
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "30%" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginBottom: "0px" }}
                      >
                        hours
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        name="openingTimeHH"
                        id="demo-simple-select"
                        value={values.openingTimeHH}
                        onChange={handleChange}
                        variant="standard"
                      >
                        {hours.map((ele) => {
                          return <MenuItem value={ele}>{ele}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "30%" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginBottom: "0px" }}
                      >
                        minutes
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        name="openingTimeMM"
                        id="demo-simple-select"
                        variant="standard"
                        value={values.openingTimeMM}
                        onChange={handleChange}
                      >
                        {mins.map((ele) => {
                          return <MenuItem value={ele}>{ele}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={4}>
                    <div>
                      <span style={{ marginLeft: "10px", color: "#7c858a" }}>
                        Closing Time:{" "}
                      </span>
                    </div>
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "30%" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginBottom: "0px" }}
                      >
                        hours
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        name="closeingTimeHH"
                        variant="standard"
                        id="demo-simple-select"
                        value={values.closeingTimeHH}
                        onChange={handleChange}
                      >
                        {hours.map((ele) => {
                          return <MenuItem value={ele}>{ele}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "30%" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginBottom: "0px" }}
                      >
                        minutes
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        name="closeingTimeMM"
                        id="demo-simple-select"
                        value={values.closeingTimeMM}
                        onChange={handleChange}
                        variant="standard"
                      >
                        {mins.map((ele) => {
                          return <MenuItem value={ele}>{ele}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <div>
                      <span style={{ marginLeft: "10px", color: "#7c858a" }}>
                        Break Start Time:{" "}
                      </span>
                    </div>
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "30%" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginBottom: "0px" }}
                      >
                        hours
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        name="breakStartTimeHH"
                        id="demo-simple-select"
                        value={values.breakStartTimeHH}
                        variant="standard"
                        onChange={handleChange}
                      >
                        {hours.map((ele) => {
                          return <MenuItem value={ele}>{ele}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "30%" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginBottom: "0px" }}
                      >
                        minutes
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        name="breakStartTimeMM"
                        id="demo-simple-select"
                        value={values.breakStartTimeMM}
                        onChange={handleChange}
                        variant="standard"
                      >
                        {mins.map((ele) => {
                          return <MenuItem value={ele}>{ele}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={3} style={{ marginBottom: "30px" }}>
                  <Grid item xs={4}>
                    <div>
                      <span style={{ marginLeft: "10px", color: "#7c858a" }}>
                        Break End Time:{" "}
                      </span>
                    </div>
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "30%" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginBottom: "0px" }}
                      >
                        hours
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        name="breakEndTimeHH"
                        id="demo-simple-select"
                        variant="standard"
                        value={values.breakEndTimeHH}
                        onChange={handleChange}
                      >
                        {hours.map((ele) => {
                          return <MenuItem value={ele}>{ele}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "30%" }}
                    >
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginBottom: "0px" }}
                      >
                        minutes
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        name="breakEndTimeMM"
                        id="demo-simple-select"
                        value={values.breakEndTimeMM}
                        onChange={handleChange}
                        variant="standard"
                      >
                        {mins.map((ele) => {
                          return <MenuItem value={ele}>{ele}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl
                      className={classes.formControl1}
                      style={{ width: "60%" }}
                    >
                      <InputLabel id="demo-mutiple-checkbox-label">
                        Weekly Holiday
                      </InputLabel>
                      <Select
                        labelId="demo-mutiple-checkbox-label"
                        id="demo-mutiple-checkbox"
                        multiple
                        name="providerWeeklyHolidays"
                        value={values.providerWeeklyHolidays}
                        variant="standard"
                        onChange={handleChangeHolidays}
                        input={<Input />}
                        renderValue={(selected) => selected.join(", ")}
                        MenuProps={MenuProps}
                      >
                        {weekDays.map((name) => (
                          <MenuItem key={name} value={name}>
                            <Checkbox
                              checked={
                                values.providerWeeklyHolidays.indexOf(name) > -1
                              }
                            />
                            <ListItemText primary={name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid
                    item
                    xs={12}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ marginRight: "5px" }}
                      type="submit"
                    >
                      Save and Next
                    </Button>
                    <Button
                      variant="contained"
                      className="p-button-text"
                      onClick={props.handleClose}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </form>
            );
          }}
        </Formik>
      </Box>
    </Paper>
  );
}
