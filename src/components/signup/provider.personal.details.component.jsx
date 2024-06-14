import 'date-fns';
import { useFormik } from 'formik';
import * as React from 'react';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { ProvidersService } from '../../remote-api/api/provider-services';
import { ProviderTypeService } from '../../remote-api/api/provider-services/provider.type.service';
import { OrganizationTypeService } from '../../remote-api/api/provider-services/organization.type.service';
import { SpecializationService } from '../../remote-api/api/provider-services/specialization.service';
import { Alert, Autocomplete, Box, Button, Chip, FormControl, FormHelperText, Grid, Input, InputLabel, MenuItem, Paper, Select, Snackbar, TextField } from '@mui/material';
// import { Button } from 'primereact/button';
import { makeStyles } from '@mui/styles';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from '@mui/icons-material/Publish';

const providerservice = new ProvidersService();
const providertypeservice = new ProviderTypeService();
const orgtypeservice = new OrganizationTypeService();
const specsservice = new SpecializationService();

let pt$ = providertypeservice.getProviderTypes();
let ot$ = orgtypeservice.getOrganizationTypes();
let ss$ = specsservice.getSpecialization();

const panRegExp = /^[a-zA-Z0-9]+$/;
const validationSchema = yup.object({
  name: yup.string('Enter your Name').required('Name is required'),
  type: yup.string('Choose Provider type').required('Provider Type is required'),
  orgTypeCd: yup.string('Choose Parent type').required('Parent Type is required'),
  contact: yup
    .string('Enter your Contact Number')
    .required('Contact Number is required')
  ['min'](10, 'Must be exactly 10 digit')
  ['max'](10, 'Must be exactly 10 digit'),
  email: yup.string('Enter your email').email('Enter a valid email').required('Email is required'),
  abbreviation: yup.string('Enter abbreviation').required('Abbreviation is required'),
  taxPinNumber: yup.string().required('TAX ID is required').matches(panRegExp, "Tax ID/PAN is not valid"),
});

const useStyles = makeStyles(theme => ({
  input1: {
    width: '50%',
  },
  clientTypeRadioGroup: {
    flexWrap: 'nowrap',
    '& label': {
      flexDirection: 'row',
    },
  },
  formControl: {
    minWidth: 182,
  },
  formControl1: {
    // margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
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

function useQuery1() {
  return new URLSearchParams(useLocation().search);
}

// function Alert(props) {
//   return <MuiAlert elevation={6} variant="filled" {...props} />;
// }

export default function ProviderPersonalDetailsComponent(props) {
  const query2 = useQuery1();
  const { id } = useParams();
  const classes = useStyles();
  const formik = useFormik({
    initialValues: {
      name: '',
      type: '',
      partnerId: '',
      combinationPartnerId: '',
      taxPinNumber: '',
      code: '',
      contact: '',
      email: '',
      pOrgData: '',
      parentProviderId: '',
      orgTypeCd: '',
      abbreviation: '',
      specializations: [],
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      setSubmit(true);
      if (!isAltContactError) {
        handleSubmit();
      }
    },
  });
  const [contactList, setContactList] = React.useState([{ altEmail: '', altContact: '' }]);
  const [specsList, setSpecsList] = React.useState([]);
  const [idErrorMsg, setIdErrorMsg] = React.useState(false);

  const [identificationList, setIdentificationList] = React.useState([
    {
      identificationType: '',
      identificationNo: '',
      docFormat: 'image/jpeg',
      document: '',
    },
  ]);
  const [identificationTypes, setIdentificationTypes] = React.useState([]);
  const [providerTypes, setProviderTypes] = React.useState([]);
  const [orgTypes, setOrgTypes] = React.useState([]);
  const [parentProviders, setParentProviders] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [isAltContactError, setAltContactError] = React.useState(false);
  const [isSubmit, setSubmit] = React.useState(false);

  const useObservable = (observable, setter) => {
    useEffect(() => {
      let subscription = observable.subscribe(result => {
        setter(result.content);
      });
      return () => subscription.unsubscribe();
    }, [observable, setter]);
  };

  useEffect(() => {
    setParentProviders(props.parentProviders);
    if (id) {
      populateData(id);
    }
  }, [props.parentProviders]);

  useObservable(pt$, setProviderTypes);
  useObservable(ot$, setOrgTypes);
  useObservable(ss$, setSpecsList);

  useEffect(() => {
    setIdentificationTypes(props.identificationTypes);
  }, [props.identificationTypes]);

  const handleSubmit = () => {
    if(!formik.values.type){
      setOpen(true);
      return;
    }
    if(!formik.values.orgTypeCd){
      setOpen(true);
      return;
    }
    if(!formik.values.name){
      setOpen(true);
      return;
    }
    if(!formik.values.email){
      setOpen(true);
      return;
    }
    if(!formik.values.contact){
      setOpen(true);
      return;
    }
    if(!formik.values.taxPinNumber){
      setOpen(true);
      return;
    }
    if(!formik.values.abbreviation){
      setOpen(true);
      return;
    }
    if (
      formik.values.orgTypeCd === 'OT117246' &&
      (formik.values.parentProviderId === '' || formik.values.parentProviderId === null)
    ) {
      setOpen(true);
      return;
    }
    if (identificationList.length === 1) {
      if (identificationList[0].identificationType !== '' && identificationList[0].identificationNo === '') {
        setIdErrorMsg(true);
        return;
      }
      if (identificationList[0].identificationType === '' && identificationList[0].identificationNo !== '') {
        setIdErrorMsg(true);
        return;
      }
    }
    if (identificationList.length > 1) {
      identificationList.forEach(val => {
        if (val.identificationType === '' || val.identificationNo === '') {
          setIdErrorMsg(true);
          return;
        }
      });
    }
    let contacts = [];
    let emailsLists = [];
    contacts.push({ contactNo: formik.values.contact, contactType: 'PRIMARY' });
    emailsLists.push({ emailId: formik.values.email, contactType: 'PRIMARY' });
    contactList.forEach(cnt => {
      contacts.push({ contactNo: cnt.altContact, contactType: 'ALTERNATE' });
      emailsLists.push({ emailId: cnt.altEmail, contactType: 'ALTERNATE' });
    });
    let payloadOne = {
      providerBasicDetails: {
        name: formik.values.name,
        type: formik.values.type,
        partnerId: formik.values.partnerId,
        combinationPartnerId: formik.values.combinationPartnerId,
        taxPinNumber: formik.values.taxPinNumber,
        contactNos: contacts,
        emails: emailsLists,
        orgTypeCd: formik.values.orgTypeCd,
        abbreviation: formik.values.abbreviation,
      },
    };

    if (
      identificationList.length === 1 &&
      identificationList[0].identificationType !== '' &&
      identificationList[0].identificationNo !== ''
    ) {
      payloadOne['providerBasicDetails']['identifications'] = identificationList;
    }
    
    if (identificationList.length > 1) {
      payloadOne['providerBasicDetails']['identifications'] = identificationList;
    }
    
    if (formik.values.specializations.length !== 0) {
      payloadOne['providerBasicDetails']['specializations'] = formik.values.specializations;
    }
    
    if (formik.values.orgTypeCd === 'OT117246') {
      payloadOne['providerBasicDetails']['parentProviderId'] = formik.values.parentProviderId;
    }
    console.log("here", formik.values.orgTypeCd )

    // if (query2.get('mode') === 'create') {
      providerservice.saveProvider(payloadOne).subscribe(res => {
        props.setProviderID(res.id);
        props.handleNext();
      });
    // }
    // if (query2.get('mode') === 'edit') {
    //   payloadOne['providerBasicDetails']['code'] = formik.values.code;
    //   providerservice.editProvider(payloadOne, id, '1').subscribe(res => {
    //     props.handleNext();
    //   });
    // }
  };

  const handleSelectedSpecs = event => {
    formik.setFieldValue('specializations', event.target.value);
  };

  // function getStyles(name, personName, theme) {
  //   return {
  //     fontWeight:
  //       personName.indexOf(name) === -1
  //         ? theme.typography.fontWeightRegular
  //         : theme.typography.fontWeightMedium,
  //   };
  // }

  //Contact list functions
  const handleInputChangeContact = (e, index) => {
    const { name, value } = e.target;
    const list = [...contactList];
    list[index][name] = value;
    setContactList(list);

    setAltContactError(altContactValidation(value, name));
  };

  const handleAddClickContact = () => {
    setContactList([...contactList, { altEmail: '', altContact: '' }]);
  };
  const handleRemoveClickContact = index => {
    const list = [...contactList];
    list.splice(index, 1);
    setContactList(list);
  };

  //Indentification Type
  const handleInputChangeIndentification = (e, index) => {
    const { name, value } = e.target;
    const list = [...identificationList];
    list[index][name] = value;
    setIdentificationList(list);
  };

  const handleRemoveClickIndentification = index => {
    const list = [...identificationList];
    list.splice(index, 1);
    setIdentificationList(list);
  };

  const handleAddClickIndentification = () => {
    setIdentificationList([...identificationList, { identificationType: '', identificationNo: '' }]);
  };

  //close and move back to list page
  const handleClose = e => {
    props.handleClose(e);
  };

  React.useEffect(() => {
    if (id) {
      populateData(id);
    }
  }, [id]);

  const populateData = id => {
    if (id) {
      providerservice.getProviderDetails(id).subscribe(val => {
        let pcontact = '';
        let pemail = '';
        let altList = [];
        let idlist = [];
        let pOrg = {
          name: '',
          id: '',
        };

        val.providerBasicDetails.contactNos.forEach((ele, i) => {
          if (ele.contactType === 'PRIMARY') {
            pcontact = ele.contactNo;
          }
          if (ele.contactType === 'ALTERNATE') {
            altList.push({
              altEmail: val.providerBasicDetails.emails[i].emailId,
              altContact: ele.contactNo,
            });
          }
        });

        val.providerBasicDetails.emails.forEach(ele => {
          if (ele.contactType === 'PRIMARY') {
            pemail = ele.emailId;
          }
        });
        if (altList.length !== 0) {
          setContactList(altList);
        }

        val.providerBasicDetails.identifications.forEach(ele => {
          idlist.push({
            identificationType: ele.identificationType,
            identificationNo: ele.identificationNo,
            docFormat: ele.docFormat,
            document: ele.document,
          });
        });

        if (idlist.length !== 0) {
          setIdentificationList(idlist);
        }
        props.parentProviders.forEach(ele => {
          if (ele.id === val.providerBasicDetails.parentProviderId) {
            pOrg = ele;
          }
        });

        formik.setValues({
          name: val.providerBasicDetails.name,
          type: val.providerBasicDetails.type,
          partnerId: val.providerBasicDetails.partnerId,
          combinationPartnerId: val.providerBasicDetails.combinationPartnerId,
          taxPinNumber: val.providerBasicDetails.taxPinNumber,
          code: val.providerBasicDetails.code,
          contact: pcontact,
          email: pemail,
          pOrgData: pOrg,
          parentProviderId: val.providerBasicDetails.parentProviderId,
          orgTypeCd: val.providerBasicDetails.orgTypeCd,
          abbreviation: val.providerBasicDetails.abbreviation,
          specializations: val.providerBasicDetails.specializations ? val.providerBasicDetails.specializations : [],
        });
      });
    }
  };

  const handlePChange = (e, value) => {
    formik.setFieldValue('pOrgData', value);
    formik.setFieldValue('parentProviderId', value.id);
  };

  const handleSnackClose = (event, reason) => {
    setOpen(false);
  };
  const handleIDErrorClose = (event, reason) => {
    setIdErrorMsg(false);
  };

  const handleImgChange1 = (e, i) => { };

  const altContactValidation = (value, field = "") => {
    if (field === "altContact") {
      return value && value.length !== 10;
    } else if (field === "altEmail") {
      return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
    }
  };
  const getAltContactErrorStatus = (value, field = "") => {
    return isSubmit && altContactValidation(value, field);
  };
  const getAltContactHelperTxt = (value, field = "") => {
    if (field === "altContact") {
      return isSubmit && altContactValidation(value, field) ? "Must be exactly 10 digit" : "";
    } else if (field === "altEmail") {
      return isSubmit && altContactValidation(value, field) ? "Enter a valid email" : "";
    }
    return "";
  };

  return (
    <Paper elevation='none'>
      <Box p={3} my={2}>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleSnackClose}  anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert onClose={handleSnackClose} severity="error" variant='filled'>
            Please fill up all required fields marked with *
          </Alert>
        </Snackbar>
        <Snackbar open={idErrorMsg} autoHideDuration={6000} onClose={handleIDErrorClose}>
          <Alert onClose={handleIDErrorClose} severity="error">
            Please provide both Identification Type and Identification Number.
          </Alert>
        </Snackbar>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <FormControl className={classes.formControl} required
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type} style={{width:"60%"}}>
                <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                  Provider Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  name="type"
                  id="demo-simple-select"
                  fullWidth
                  value={formik.values.type}
                  variant='standard'
                  onChange={formik.handleChange}
                >
                  {providerTypes.map(ele => {
                    return <MenuItem value={ele.code}>{ele.name}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              {formik.touched.type && Boolean(formik.errors.type) &&
                <FormHelperText>{formik.touched.type && formik.errors.type}</FormHelperText>
              }
            </Grid>
            <Grid item xs={4}>
              {query2.get('mode') === 'edit' ? (
                <FormControl className={classes.formControl} required
                  error={formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd)}
                  helperText={formik.touched.orgTypeCd && formik.errors.orgTypeCd} style={{width:"60%"}}>
                  <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                    Parent Provider
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    name="orgTypeCd"
                    id="demo-simple-select"
                    variant='standard'
                    readOnly={true}
                    value={formik.values.orgTypeCd}
                    onChange={formik.handleChange}
                  >
                    {orgTypes.map(ele => {
                      return <MenuItem value={ele.code}>{ele.name}</MenuItem>;
                    })}
                  </Select>
                  {formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd) &&
                    <FormHelperText>{formik.touched.orgTypeCd && formik.errors.orgTypeCd}</FormHelperText>
                  }
                </FormControl>
              ) : (
                <FormControl className={classes.formControl} required
                  error={formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd)}
                  helperText={formik.touched.orgTypeCd && formik.errors.orgTypeCd} style={{width:"60%"}}>
                  <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                    Parent Provider
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    name="orgTypeCd"
                    id="demo-simple-select"
                    variant='standard'
                    value={formik.values.orgTypeCd}
                    onChange={formik.handleChange}
                  >
                    {orgTypes.map(ele => {
                      return <MenuItem value={ele.code}>{ele.name}</MenuItem>;
                    })}
                  </Select>
                  {formik.touched.orgTypeCd && Boolean(formik.errors.orgTypeCd) &&
                    <FormHelperText>{formik.touched.orgTypeCd && formik.errors.orgTypeCd}</FormHelperText>
                  }
                </FormControl>
              )}
            </Grid>
            {formik.values.orgTypeCd === 'OT117246' ? (
              <Grid item xs={4}>
                <Autocomplete
                  id="combo-box-demo"
                  options={parentProviders}
                  getOptionLabel={option => option.name}
                  value={formik.values.pOrgData}
                  style={{ width: '50%' }}
                  renderInput={params => <TextField {...params} label="" />}
                  name="parentProviderId"
                  onChange={handlePChange}
                />
              </Grid>
            ) : null}
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
                size="small"
                variant='standard'
                id="standard-basic"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                label="Name*"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                size="small"
                id="standard-basic"
                name="abbreviation"
                variant='standard'
                value={formik.values.abbreviation}
                onChange={formik.handleChange}
                error={formik.touched.abbreviation && Boolean(formik.errors.abbreviation)}
                helperText={formik.touched.abbreviation && formik.errors.abbreviation}
                label="Abbreviation*"
              />
            </Grid>
            <Grid item xs={4}>
              {query2.get('mode') === 'edit' ? (
                <TextField
                  id="standard-basic"
                  variant='standard'
                  name="code"
                  value={formik.values.code}
                  label="Provider Code"
                // readonly={true}
                />
              ) : null}
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
                id="standard-basic"
                name="partnerId"
                variant='standard'
                value={formik.values.partnerId}
                onChange={formik.handleChange}
                label="Partner ID"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="standard-basic"
                style={{minWidth:220}}
                name="combinationPartnerId"
                value={formik.values.combinationPartnerId}
                onChange={formik.handleChange}
                variant='standard'
                label="Combination Partner ID"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="standard-basic"
                name="taxPinNumber"
                value={formik.values.taxPinNumber}
                onChange={formik.handleChange}
                variant='standard'
                error={formik.touched.taxPinNumber && Boolean(formik.errors.taxPinNumber)}
                helperText={formik.touched.taxPinNumber && formik.errors.taxPinNumber}
                label="Tax ID/PAN*"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={4}>
              <TextField
              variant='standard'
                id="standard-basic"
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                name="contact"
                value={formik.values.contact}
                onChange={formik.handleChange}
                error={formik.touched.contact && Boolean(formik.errors.contact)}
                helperText={formik.touched.contact && formik.errors.contact}
                label="Contact No*"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="standard-basic"
                name="email"
                value={formik.values.email}
                variant='standard'
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                label="Email id*"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl className={classes.formControl1}>
                <InputLabel id="demo-mutiple-chip-label">Specializations</InputLabel>
                <Select
                  labelId="demo-mutiple-chip-label"
                  style={{minWidth:182}}
                  variant='standard'
                  id="demo-mutiple-chip"
                  multiple
                  value={formik.values.specializations}
                  onChange={handleSelectedSpecs}
                  input={<Input id="select-multiple-chip" />}
                  renderValue={selected => (
                    <div className={classes.chips}>
                      {selected.map(value => (
                        <Chip key={value.code} label={value.name} className={classes.chip} />
                      ))}
                    </div>
                  )}
                  MenuProps={MenuProps}>
                  {specsList.map(val => (
                    <MenuItem key={val.id} value={val}>
                      {val.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {contactList.map((x, i) => {
            return (
              <Grid container spacing={3} style={{ marginBottom: '20px' }}>
                <Grid item xs={4}>
                  <TextField
                    id="standard-basic"
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    variant='standard'
                    name="altContact"
                    value={x.altContact}
                    onChange={e => handleInputChangeContact(e, i)}
                    label="Alt. Contact No"
                    error={getAltContactErrorStatus(x.altContact, "altContact")}
                    helperText={getAltContactHelperTxt(x.altContact, "altContact")}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="standard-basic"
                    name="altEmail"
                    variant='standard'
                    value={x.altEmail}
                    onChange={e => handleInputChangeContact(e, i)}
                    label="Alt. Email id"
                    error={getAltContactErrorStatus(x.altEmail, "altEmail")}
                    helperText={getAltContactHelperTxt(x.altEmail, "altEmail")}
                  />
                </Grid>
                <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
                  {contactList.length !== 1 && (
                    <Button
                      className="mr10 p-button-danger"
                      onClick={() => handleRemoveClickContact(i)}
                      variant="contained"
                      color="secondary"
                      style={{ marginRight: '5px' }}>
                      <DeleteIcon />
                    </Button>
                  )}
                  {contactList.length - 1 === i && (
                    <Button variant="contained" color="primary" onClick={handleAddClickContact}>
                      <AddIcon />
                    </Button>
                  )}
                </Grid>
              </Grid>
            );
          })}

          {identificationList.map((x, i) => {
            return (
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <FormControl className={classes.formControl}>
                    <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                      Identification Type
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="identificationType"
                      variant='standard'
                      value={x.identificationType}
                      onChange={e => handleInputChangeIndentification(e, i)}>
                      {identificationTypes.map(ele => {
                        return <MenuItem value={ele.code}>{ele.name}</MenuItem>;
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    id="standard-basic"
                    name="identificationNo"
                    variant='standard'
                    value={x.identificationNo}
                    onChange={e => handleInputChangeIndentification(e, i)}
                    label="Identification No"
                  />
                </Grid>
                <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    accept="image/*"
                    className={classes.input}
                    id={'contained-button-file' + i.toString()}
                    single
                    name="document"
                    type="file"
                    onChange={e => handleImgChange1(e, i)}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor={'contained-button-file' + i.toString()} style={{ width: '50%', marginBottom: 0 }}>
                    <Button variant="contained" type='button' color="primary" component="span">
                      <PublishIcon />
                    </Button>
                  </label>

                  {/* </label> */}
                </Grid>

                <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
                  {identificationList.length !== 1 && (
                    <Button
                      className="mr10 p-button-danger"
                      onClick={() => handleRemoveClickIndentification(i)}
                      variant="contained"
                      color="secondary"
                      style={{ marginLeft: '5px' }}>
                      <DeleteIcon />
                    </Button>
                  )}
                  {identificationList.length - 1 === i && (
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ marginLeft: '5px' }}
                      onClick={handleAddClickIndentification}>
                      <AddIcon />
                    </Button>
                  )}
                </Grid>
              </Grid>
            );
          })}

          <Grid container spacing={3}>
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="primary" style={{ marginRight: '5px' }} type="submit" onClick={handleSubmit}>
                Save and Next
              </Button>
              <Button variant="text" className='p-button-text' onClick={handleClose}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Paper>
  );
}
