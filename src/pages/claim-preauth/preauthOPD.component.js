import DateFnsUtils from '@date-io/date-fns';
import Box from '@material-ui/core/Box';
import { Button } from 'primereact/button';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import DeleteIcon from '@material-ui/icons/Delete';
import MuiAlert from '@material-ui/lab/Alert';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import 'date-fns';
import { useFormik } from 'formik';
import * as React from 'react';
import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { forkJoin } from 'rxjs/';
import { PreAuthService } from '../../remote-api/api/claims-services';
import { ServiceTypeService } from '../../remote-api/api/master-services';
import { BenefitService } from '../../remote-api/api/master-services/benefit.service';
import { MemberService } from '../../remote-api/api/member-services';
import { ProvidersService } from '../../remote-api/api/provider-services';
import { Autocomplete } from '@material-ui/lab';
import ClaimModal from './modals/claim.modal.component';
import ClaimsDocumentOPDComponent from './document.OPD.component';

const benefitService = new BenefitService();
const providerService = new ProvidersService();
const serviceDiagnosis = new ServiceTypeService();
const preAuthService = new PreAuthService();
const memberservice = new MemberService();

let bts$ = benefitService.getAllBenefit({ page: 0, size: 1000 });
let ps$ = providerService.getProviders();
let ad$ = serviceDiagnosis.getServicesbyId('867854874246590464', {
  page: 0,
  size: 1000,
  summary: true,
  active: true,
  nonGroupedServices: false,
});

let serviceAll$ = forkJoin(
  serviceDiagnosis.getServicesbyId('867854950947827712', {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false,
  }),
  serviceDiagnosis.getServicesbyId('867855014529282048', {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false,
  }),
  serviceDiagnosis.getServicesbyId('867855088575524864', {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false,
  }),
  serviceDiagnosis.getServicesbyId('867855148155613184', {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false,
  }),
);

const serviceTypeOptions = [
  {
    value: '1',
    label: "Contact lenses (disposible)"
  }, {
    value: "2",
    label: "Contact lenses (non-disposible)"
  }, {
    value: "3",
    label: "Room / Bed"
  }, {
    value: "4",
    label: "Spectacle Frame"
  }, {
    value: "5",
    label: "Spectacle Glass"
  },
]

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
    margin: theme.spacing(1),
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
  inputRoot: {
    '&$disabled': {
      color: 'black',
    },
    benifitAutoComplete: {
      width: 500,
      '& .MuiInputBase-formControl': {
        maxHeight: 200,
        overflowX: 'hidden',
        overflowY: 'auto',
      },
    },
  },
  disabled: {},
  actionContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    marginRight: '5px',
  },
}));

export default function ClaimsPreAuthOPDComponent(props) {
  const history = useHistory();
  const { id } = useParams();
  const classes = useStyles();
  const [selectedDOD, setSelectedDOD] = React.useState(new Date());
  const [selectedDOA, setSelectedDOA] = React.useState(new Date());
  const [providerList, setProviderList] = React.useState([]);
  const [serviceList, setServiceList] = React.useState([]);
  const [diagnosisList, setDiagnosisList] = React.useState([]);
  const [benefits, setBenefits] = React.useState([]);
  const [benefitOptions, setBenefitOptions] = React.useState([]);
  const [otherTypeList, setOtherTypeList] = React.useState([]);
  const [claimModal, setClaimModal] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState('');
  const [openSnack, setOpenSnack] = React.useState(false);
  const [maxApprovableAmount, setMaxApprovableAmount] = React.useState(0)

  const formik = useFormik({
    initialValues: {
      name: '',
      type: '',
      preAuthStatus: null,
      partnerId: '',
      combinationPartnerId: '',
      taxPinNumber: '',
      code: '',
      contact: '',
      email: '',
      pOrgData: '',
      parentAgentId: '',
      natureOfAgent: '',
      orgTypeCd: '',
      memberShipNo: '',
      diagnosis: [],
      expectedDOD: '',
      expectedDOA: '',
      estimatedCost: '',
      referalTicketRequired: false,
      contactNoOne: '',
      contactNoTwo: '',
    },
    // validationSchema: validationSchema,
    onSubmit: values => {
      handleSubmit();
    },
  });

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const allSelected = diagnosisList && diagnosisList.length > 0 && formik.values.diagnosis.length === diagnosisList.length;
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const [memberBasic, setMemberBasic] = React.useState({
    name: '',
    policyNumber: '',
    age: '',
    relations: '',
    enrolmentDate: new Date(),
    enrolentToDate: new Date(),
    enrolmentFromDate: new Date(),
    insuranceCompany: '',
    corporateName: '',
    membershipNo: '',
    memberName: '',
    gender: '',
    policyCode: '',
    policyType: '',
    policyPeriod: '',
  });
  const [sanctionButton, setSanctionButton] = React.useState(false)
  const [providerData, setProviderData] = React.useState([])
  const [providerDetailsList, setProviderDetailsList] = React.useState([
    {
      providerId: '',
      estimatedCost: 0,
    },
  ]);
  const [serviceTypeDetailsList, setServiceTypeDetailsList] = React.useState([
    {
      serviceTypeId: '',
      serviceCost: 0,
    },
  ]);
  const [benefitsWithCost, setBenefitsWithCost] = React.useState([
    {
      benefitId: '',
      estimatedCost: 0,
    },
  ]);
  const [serviceDetailsList, setServiceDetailsList] = React.useState([
    {
      serviceId: '',
      estimatedCost: 0,
    },
  ]);
  const useObservable = (observable, setter) => {
    useEffect(() => {
      let subscription = observable.subscribe(result => {
        setter(result.content);
      });
      return () => subscription.unsubscribe();
    }, [observable, setter]);
  };

  const useObservable1 = (observable, setter) => {
    useEffect(() => {
      let subscription = observable.subscribe(result => {
        let arr = [];
        result.content.forEach(ele => {
          if (!ele.blackListed) {
            arr.push(ele);
          }
        });
        setter(arr);
      });
      return () => subscription.unsubscribe();
    }, [observable, setter]);
  };

  const useObservable2 = (observable, setter) => {
    useEffect(() => {
      let subscription = observable.subscribe(result => {
        let arr = [];
        result.forEach(elearr => {
          elearr.content.forEach(el => {
            arr.push(el);
          });
        });
        setter(arr);
      });
      return () => subscription.unsubscribe();
    }, [observable, setter]);
  };

  const useObservable3 = (observable, setter) => {
    useEffect(() => {
      let subscription = observable.subscribe(result => {
        let arr = [];
        result.content.forEach(ele => {
          arr.push({ id: ele.id, diagnosisName: ele.name });
        });
        setter(arr);
      });
      return () => subscription.unsubscribe();
    }, [observable, setter]);
  };

  useEffect(() => {
    let sum = 0;
    benefitsWithCost.forEach((item) => {
      sum = sum + item?.copayAmount + item?.maxApprovedCost;
    })
    setMaxApprovableAmount(sum)
  }, [benefitsWithCost])


  useEffect(() => {
    let temp = []
    let X = benefits?.forEach((ele) => {
      let obj = {
        label: ele.code + ' | ' + ele.name,
        name: ele.code + ' | ' + ele.name,
        value: ele.id
      }
      temp.push(obj)
    })
    setBenefitOptions(temp)
  }, [benefits])

  useObservable(bts$, setBenefits);
  //useObservable(bts$, setOtherTypeList);
  useObservable1(ps$, setProviderList);
  useObservable3(ad$, setDiagnosisList);
  useObservable2(serviceAll$, setServiceList);

  const handleClose = () => {
    localStorage.removeItem('preauthid');
    history.push('/claims/claims-preauth?mode=viewList');
  };

  const handleInputChangeProvider = (e, index) => {
    const { name, value } = e.target;
    const list = [...providerDetailsList];
    list[index][name] = value;
    setProviderDetailsList(list);
  };

  const handleInputChangeServiceType = (e, index) => {
    const { name, value } = e.target;
    const list = [...serviceTypeDetailsList];
    list[index][name] = value;
    setServiceTypeDetailsList(list);
  };

  const handleRemoveProviderdetails = index => {
    const list = [...serviceTypeDetailsList];
    list.splice(index, 1);
    setProviderDetailsList(list);
  };

  const handleRemoveServiceTypeDetails = index => {
    const list = [...providerDetailsList];
    list.splice(index, 1);
    setServiceTypeDetailsList(list);
  };

  const handleAddProviderdetails = () => {
    setProviderDetailsList([...providerDetailsList, { providerId: '', estimatedCost: 0 }]);
  };

  const handleAddServiceTypeDtails = () => {
    setServiceTypeDetailsList([...serviceTypeDetailsList, { providerId: '', estimatedCost: 0 }]);
  };

  const handleInputChangeBenefitWithCost = (e, index) => {
    const list = [...benefitsWithCost];
    list[index][e?.target?.name] = e?.target?.value;
    setBenefitsWithCost(list);
  };

  const handleRemoveClaimCost = index => {
    const list = [...benefitsWithCost];
    list.splice(index, 1);
    setBenefitsWithCost(list);
  };

  const handleAddClaimCost = () => {
    setBenefitsWithCost([...benefitsWithCost, { benefitId: '', otherType: '', estimatedCost: 0 }]);
  };

  const handleInputChangeService = (e, index) => {
    const { name, value } = e.target;
    const list = [...serviceDetailsList];
    list[index][name] = value;
    setServiceDetailsList(list);
  };

  const handleRemoveServicedetails = index => {
    const list = [...serviceDetailsList];
    list.splice(index, 1);
    setServiceDetailsList(list);
  };

  const handleAddServicedetails = () => {
    setServiceDetailsList([...serviceDetailsList, { serviceId: '', estimatedCost: 0 }]);
  };

  const handleDiagnosisChange = (e, val) => {
    let selectedBenifits = val;
    const isSelecAll = selectedBenifits.some(item => item.id === 'selectall');
    if (isSelecAll) {
      if (diagnosisList.length > 0 && diagnosisList.length === formik.values.diagnosis.length) {
        selectedBenifits = [];
      } else {
        selectedBenifits = diagnosisList;
      }
    }
    formik.setFieldValue('diagnosis', selectedBenifits);
  };

  const handleBenefitChange = (index, val) => {
    setBenefitsWithCost((prevData) => [
      ...prevData.slice(0, index),
      { ...prevData[index], benefitId: val?.value },
      ...prevData.slice(index + 1),
    ]);
  };

  React.useEffect(() => {
    if (id) {
      populateStepOne(id);
    }
  }, [id]);

  React.useEffect(() => {
    if (localStorage.getItem('preauthid')) {
      populateStepOne(localStorage.getItem('preauthid'));
    }
  }, [localStorage.getItem('preauthid')]);

  const populateStepOne = preAuthId => {
    preAuthService.getPreAuthById(preAuthId)
      .subscribe(res => {
        setSanctionButton(true)
        formik.setValues({
          memberShipNo: res.memberShipNo,
          expectedDOA: res.expectedDOA,
          expectedDOD: res.expectedDOD,
          diagnosis: res.diagnosis,
          contactNoOne: Number(res.contactNoOne),
          contactNoTwo: Number(res.contactNoTwo),
          referalTicketRequired: res.referalTicketRequired,
          preAuthStatus: res.preAuthStatus
        });

        setSelectedDOD(new Date(res.expectedDOD));
        setSelectedDOA(new Date(res.expectedDOA));
        setProviderDetailsList(res.providers);
        setBenefitsWithCost(res.benefitsWithCost);
        setServiceDetailsList(res.services);
        getMemberDetails(res.memberShipNo, res.policyNumber);
        if (res.diagnosis && res.diagnosis.length !== 0) {
          setDiagnosisdata(res.diagnosis);
        }
      });
  };

  const setDiagnosisdata = (diagnosis) => {
    serviceDiagnosis.getServicesbyId('867854874246590464', {
      page: 0,
      size: 1000,
      summary: true,
      active: true,
      nonGroupedServices: false,
    }).subscribe(ser => {
      let ar = []
      diagnosis.forEach(diag => {
        ser.content.forEach(service => {
          if (diag === service.id) {
            ar.push({ id: service.id, diagnosisName: service.name })
          }
        })
      })
      formik.setFieldValue('diagnosis', ar);
    })
  }

  const getMemberDetails = (id, policyNumber) => {
    let pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      key: 'MEMBERSHIP_NO',
      value: id,
      active: true
    }
    memberservice.getMember(pageRequest).subscribe(res => {
      if (res.content?.length > 0) {
        setMemberBasic({
          ...memberBasic,
          name: res.content[0].name,
          age: res.content[0].age,
          gender: res.content[0].gender,
          membershipNo: res.content[0].membershipNo,
          relations: res.content[0].relations,
          policyNumber: res.content[0].policyNumber,
          enrolentToDate: new Date(res.content[0].policyEndDate),
          enrolmentFromDate: new Date(res.content[0].policyStartDate)
        })
      }
    })
  };

  const populateMember = () => {
    getMemberDetails(formik.values.memberShipNo)
  }

  const handleSubmit = () => {
    benefitsWithCost.forEach(ele => {
      if (ele.benefitId !== 'OTHER') {
        ele.otherType = '';
      }
    });

    providerDetailsList.forEach(pd => {
      pd.estimatedCost = Number(pd.estimatedCost)
    })
    serviceDetailsList.forEach(sd => {
      sd.estimatedCost = Number(sd.estimatedCost)
    })
    benefitsWithCost.forEach(ctc => {
      ctc.estimatedCost = Number(ctc.estimatedCost)
    })

    if (new Date(selectedDOA).getTime() > new Date(selectedDOD).getTime()) {
      setAlertMsg('Admission date must be lower than Discharge date')
      setOpenSnack(true);
      return;
    }

    if (formik.values.contactNoOne.toString().length !== 10) {
      setAlertMsg('Contact One must be of 10 digits')
      setOpenSnack(true);
      return;
    }

    if (formik.values.contactNoTwo && formik.values.contactNoTwo.toString().length !== 10) {
      setAlertMsg('Contact Two must be of 10 digits');
      setOpenSnack(true);
      return;
    }

    let payload = {
      preAuthStatus: formik.values.preAuthStatus,
      memberShipNo: formik.values.memberShipNo,
      expectedDOA: new Date(selectedDOA).getTime(),
      expectedDOD: new Date(selectedDOD).getTime(),
      // diagnosis: formik.values.diagnosis,
      contactNoOne: formik.values.contactNoOne.toString(),
      contactNoTwo: formik.values.contactNoTwo.toString(),
      referalTicketRequired: formik.values.referalTicketRequired,
      benefitsWithCost: benefitsWithCost,
      providers: providerDetailsList,
      services: serviceDetailsList,
      preAuthType: "OPD"
      // treatmentDepartment: "string",
      // receiveDate: 0,
      // serviceDate: 0,
      // daycare: "string",
    };
    let arr = []
    formik.values.diagnosis.forEach(di => {
      arr.push(di.id.toString())
    })
    payload['diagnosis'] = arr;
    let preauthid = localStorage.getItem('preauthid') ? localStorage.getItem('preauthid') : '';

    if (preauthid || id) {
      if (preauthid) {
        preAuthService.editPreAuth(payload, preauthid, 1).subscribe(res => {
          if (formik.values.preAuthStatus === 'PRE_AUTH_REQUESTED' || formik.values.preAuthStatus === 'PRE_AUTH_APPROVED' || formik.values.preAuthStatus === 'ADD_DOC_APPROVED' || formik.values.preAuthStatus === 'ENHANCEMENT_APPROVED') {

            let payload1 = {
              claimStatus: formik.values.preAuthStatus,
              actionForClaim: 'ENHANCE',
            }
            preAuthService.changeStatus(preauthid, 'PREAUTH_CLAIM', payload1).subscribe(res => {
            })
          } else {
          }
        });
      }
      if (id) {
        preAuthService.editPreAuth(payload, id, 1).subscribe(res => {
          if (formik.values.preAuthStatus === 'PRE_AUTH_REQUESTED' || formik.values.preAuthStatus === 'PRE_AUTH_APPROVED' || formik.values.preAuthStatus === 'ADD_DOC_APPROVED' || formik.values.preAuthStatus === 'ENHANCEMENT_APPROVED') {

            let payload1 = {
              claimStatus: formik.values.preAuthStatus,
              actionForClaim: 'ENHANCE',
            }
            preAuthService.changeStatus(id, 'PREAUTH_CLAIM', payload1).subscribe(res => {
            })
          } else {
          }
        });
      }
    }

    if (!preauthid && !id) {

      preAuthService.savePreAuth(payload).subscribe(res => {
        localStorage.setItem('preauthid', res.id);
        setSanctionButton(true)
        preAuthService.editPreAuth({}, res.id, 'calculate').subscribe(r => {
          history.push(`/claims/claims-preauth/${res.id}?mode=edit&auth=OPD`);
        })
      });
    }
  };

  const handleDODDate = date => {
    setSelectedDOD(date);
    const timestamp = new Date(date).getTime();
    formik.setFieldValue('expectedDOD', timestamp);
  };

  const handleDOA = date => {
    setSelectedDOA(date);
    const timestamp = new Date(date).getTime();
    formik.setFieldValue('expectedDOA', timestamp);
  };

  const handleFieldChecked = e => {
    const { name, checked } = e.target;
    formik.setFieldValue(name, checked);
  };

  const viewUserDetails = () => {
    setClaimModal(true);
  };

  const handleCloseClaimModal = () => {
    setClaimModal(false);
  };

  const autocompleteFilterChange = (options, state) => {
    if (state.inputValue) {
      return options?.filter(item => item?.name?.toLowerCase().indexOf(state?.inputValue) > -1);
    }
    return [{ id: 'selectall', name: 'Select all' }, ...options];
  };

  const onMemberShipNumberChange = (e) => {
    formik.setFieldValue('memberShipNo', e.target.value)
  }

  const handleMsgErrorClose = () => {
    setOpenSnack(false);
    setAlertMsg('')
  }

  const handleApproveProviderAmount = (e, provider) => {
    const { id, value } = e.target;

    const newValue = parseFloat(value);
    if (isNaN(newValue)) {
      return; // Do nothing if the input is not a valid number
    }

    if (newValue > provider.estimatedCost) {
      alert("Approved amount cannot exceed estimated amount!");
      return; // Do nothing if the approvedCost exceeds the estimatedCost
    }

    const providerIndex = providerData.findIndex((item) => item.providerId === provider.providerId);

    if (providerIndex !== -1) {
      const updatedProviderData = [...providerData];
      updatedProviderData[providerIndex].approvedCost = newValue;
      setProviderData(updatedProviderData);
    } else {
      const newProvider = {
        providerId: provider.providerId,
        approvedCost: newValue,
      };
      setProviderData([...providerData, newProvider]);
    }
  };

  const sanctionPreAuth = () => {
    let sum = 0;
    let p = providerData?.forEach((item) => {
      sum = sum + item?.approvedCost;
    })
    if (sum < maxApprovableAmount) {
      preAuthService.editPreAuth({ decission: 'APPROVED', comment: "Approve", providersWithApprovedCost: providerData }, id, 'decission').subscribe(r => {
        window.location.reload();

      });
    } else {
      alert("Total approved amount cannot exceed total approvable amount!");
    }
  }

  return (
    <>
      <ClaimModal claimModal={claimModal} handleCloseClaimModal={handleCloseClaimModal} memberBasic={memberBasic} />
      <Paper elevation='none'>
        <Box p={3} my={2}>
          <Snackbar open={openSnack} autoHideDuration={4000} onClose={handleMsgErrorClose}>
            <Alert onClose={handleMsgErrorClose} severity="error">
              {alertMsg}
            </Alert>
          </Snackbar>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3} style={{ marginBottom: '50px' }}>
              <TextField id="standard-basic" value={formik.values.memberShipNo} onChange={onMemberShipNumberChange} name="searchCode" style={{ marginLeft: '10px' }} label="Membership code" />
              <Button variant="contained" onClick={populateMember} color="primary" style={{ marginLeft: '10px', height: '50%' }}>
                Search
              </Button>

            </Grid>
            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={12}>
                <span style={{ color: '#4472C4', fontWeight: 'bold' }}>BASIC DETAILS</span>
              </Grid>

              <Grid item xs={4} style={{ display: 'flex', flexDirection: 'column' }}>
                <TextField
                  id="standard-basic"
                  name="memberName"
                  value={memberBasic.name}
                  disabled
                  label="Name"
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled,
                    },
                  }}
                />
                <a style={{ color: '#4472C4', cursor: 'pointer' }} onClick={viewUserDetails}>
                  View Details
                </a>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="standard-basic"
                  name="policyNumber"
                  disabled
                  value={memberBasic.policyNumber}
                  label="Policy Number"
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled,
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={4}>
                <TextField
                  id="standard-basic"
                  name="age"
                  type="number"
                  value={memberBasic.age}
                  disabled
                  label="Age"
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="standard-basic"
                  name="relation"
                  value={memberBasic.relations}
                  disabled
                  label="Relation"
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Enrolment Date"
                    value={memberBasic.enrolmentDate}
                    disabled
                    InputProps={{
                      classes: {
                        root: classes.inputRoot,
                        disabled: classes.disabled,
                      },
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change ing date',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
            </Grid>
            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={4}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Policy From Date"
                    value={memberBasic.enrolmentFromDate}
                    disabled
                    InputProps={{
                      classes: {
                        root: classes.inputRoot,
                        disabled: classes.disabled,
                      },
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change ing date',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item xs={4}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Policy To Date"
                    value={memberBasic.enrolentToDate}
                    disabled
                    InputProps={{
                      classes: {
                        root: classes.inputRoot,
                        disabled: classes.disabled,
                      },
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change ing date',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
            </Grid>

            <Grid item xs={12} style={{ marginTop: '20px', marginBottom: '15px' }}>
              <Divider />
            </Grid>

            {benefitsWithCost.map((x, i) => {
              return (
                <Grid container spacing={3} key={i} style={{ marginBottom: '20px' }}>
                  <Grid item xs={4}>
                    <FormControl className={classes.formControl}>
                      <Autocomplete
                        name="benefitId"
                        defaultValue={x?.benefitId}
                        value={x?.benefitId}
                        onChange={(e, val) => handleBenefitChange(i, val)}
                        id="checkboxes-tags-demo"
                        filterOptions={autocompleteFilterChange}
                        options={benefitOptions}
                        getOptionLabel={option => option?.label ?? benefitOptions?.find(benefit => benefit?.value == option)?.label}
                        getOptionSelected={(option, value) => option?.value === value}
                        renderOption={(option, { selected }) => {
                          return (
                            <React.Fragment>
                              {option?.label}
                            </React.Fragment>
                          );
                        }}
                        renderInput={params => <TextField {...params} label="Benefit id" />}
                      />
                    </FormControl>
                  </Grid>
                  {x.benefitId === 'OTHER' && (
                    <Grid item xs={4}>
                      <FormControl className={classes.formControl}>
                        <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                          Other
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          name="other"
                          value={x.otherType}
                          onChange={e => handleInputChangeBenefitWithCost(e, i)}>
                          {otherTypeList.map(ele => {
                            return (
                              <MenuItem key={ele.code} value={ele.code}>
                                {ele.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  <Grid item xs={2}>
                    <TextField
                      id="standard-basic"
                      type="number"
                      name="estimatedCost"
                      value={x.estimatedCost}
                      onChange={e => handleInputChangeBenefitWithCost(e, i)}
                      label="Estimated Cost"
                    />
                  </Grid>

                  <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
                    {benefitsWithCost.length !== 1 && (
                      <Button
                        className="mr10 p-button-danger"
                        onClick={() => handleRemoveClaimCost(i)}
                        variant="contained"
                        color="secondary"
                        style={{ marginLeft: '5px' }}>
                        <DeleteIcon />
                      </Button>
                    )}
                    {benefitsWithCost.length - 1 === i && (
                      <Button variant="contained" color="primary" style={{ marginLeft: '5px' }} onClick={handleAddClaimCost}>
                        <AddIcon />
                      </Button>
                    )}
                  </Grid>
                </Grid>
              );
            })}

            <Grid item xs={12} style={{ marginTop: '20px', marginBottom: '15px' }}>
              <Divider />
            </Grid>

            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={4}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Expected DOA"
                    autoOk={true}
                    value={selectedDOA}
                    onChange={handleDOA}
                    KeyboardButtonProps={{
                      'aria-label': 'change ing date',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item xs={4}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={['year', 'month', 'date']}
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    autoOk={true}
                    label="Expected DOD"
                    value={selectedDOD}
                    onChange={handleDODDate}
                    KeyboardButtonProps={{
                      'aria-label': 'change DOD date',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>

              <Grid item xs={4}>
                <Autocomplete
                  className={classes.benifitAutoComplete}
                  multiple
                  value={formik.values.diagnosis}
                  onChange={handleDiagnosisChange}
                  id="checkboxes-tags-demo"
                  filterOptions={autocompleteFilterChange}
                  options={diagnosisList}
                  disableCloseOnSelect
                  getOptionLabel={option => option.diagnosisName}
                  getOptionSelected={(option, value) => option.id === value.id}
                  renderOption={(option, { selected }) => {
                    const selectedOpt = (option.id === 'selectall' && allSelected) || selected;
                    return (
                      <React.Fragment>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8, color: '#626bda' }}
                          checked={selectedOpt}
                        />
                        {option.diagnosisName}
                      </React.Fragment>
                    );
                  }}
                  renderInput={params => <TextField {...params} label="Diagnosis" placeholder="Select Diagnosis" />}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} style={{ marginBottom: '20px' }}>
              <Grid item xs={4}>
                <TextField
                  id="standard-basic"
                  name="contactNoOne"
                  type="number"
                  value={formik.values.contactNoOne}
                  onChange={formik.handleChange}
                  label="Contact No. 1"
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="standard-basic"
                  name="contactNoTwo"
                  type="number"
                  value={formik.values.contactNoTwo}
                  onChange={formik.handleChange}
                  label="Contact No. 2"
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.referalTicketRequired}
                      onChange={e => handleFieldChecked(e)}
                      name="referalTicketRequired"
                      color="primary"
                    />
                  }
                  label="Referral Ticket Required"
                />
              </Grid>
            </Grid>

            <Grid item xs={12} style={{ marginTop: '20px' }}>
              <span style={{ color: '#4472C4', fontWeight: 'bold' }}>Service Type Details</span>
            </Grid>

            <Grid item xs={12} style={{ marginBottom: '15px' }}>
              <Divider />
            </Grid>

            {serviceTypeDetailsList.map((x, i) => {
              return (
                <Grid container spacing={3} key={i}>
                  <Grid item xs={4}>
                    <FormControl className={classes.formControl}>
                      <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                        Service Type
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        name="providerId"
                        value={x?.serviceTypeId}
                        onChange={e => handleInputChangeServiceType(e, i)}
                      >
                        {serviceTypeOptions.map(ele => {
                          return (
                            <MenuItem value={ele.value} key={ele.value}>
                              {ele.label}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      type='number'
                      id="standard-basic"
                      name="serviceAmount"
                      label="Service Amount"
                      value={x?.serviceCost}
                      onChange={e => handleInputChangeServiceType(e, i)}
                    />
                  </Grid>

                  <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
                    {serviceTypeDetailsList.length !== 1 && (
                      <Button
                        className="mr10 p-button-danger"
                        onClick={() => handleRemoveServiceTypeDetails(i)}
                        variant="contained"
                        color="secondary"
                        style={{ marginLeft: '5px' }}>
                        <DeleteIcon />
                      </Button>
                    )}
                    {serviceTypeDetailsList.length - 1 === i && (
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: '5px' }}
                        onClick={handleAddServiceTypeDtails}>
                        <AddIcon />
                      </Button>
                    )}
                  </Grid>
                </Grid>
              );
            })}
            <Grid item xs={12} style={{ marginTop: '20px' }}>
              <span style={{ color: '#4472C4', fontWeight: 'bold' }}>Provider Details</span>
            </Grid>

            <Grid item xs={12} style={{ marginBottom: '15px' }}>
              <Divider />
            </Grid>

            {providerDetailsList.map((x, i) => {
              return (
                <Grid container spacing={3} key={i}>
                  <Grid item xs={4}>
                    <FormControl className={classes.formControl}>
                      <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                        Provider
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        name="providerId"
                        value={x.providerId}
                        onChange={e => handleInputChangeProvider(e, i)}>
                        {providerList.map(ele => {
                          return (
                            <MenuItem key={ele.id} value={ele.id}>
                              {ele.providerBasicDetails.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      id="standard-basic"
                      type="number"
                      name="estimatedCost"
                      value={x.estimatedCost}
                      onChange={e => handleInputChangeProvider(e, i)}
                      label="Estimated Cost"
                    />
                  </Grid>
                  {sanctionButton &&
                    <Grid item xs={3}>
                      <TextField
                        type="number"
                        value={x?.approvedCost}
                        id={`approveProviderAmount-${x.providerId}`}
                        name={`approveProviderAmount-${x.providerId}`}
                        // onChange={e => handleInputChangeProvider(e, i)}
                        onChange={(e) => {
                          const updatedProviders = providerDetailsList.map(item => {
                            if (item.providerId == x.providerId) {
                              item.approvedCost = e.target.value;
                            }
                            return item;
                          })
                          setProviderDetailsList(updatedProviders)
                          handleApproveProviderAmount(e, x)
                        }}
                        label="Approve Amount"
                      />
                    </Grid>
                  }
                  <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
                    {providerDetailsList.length !== 1 && (
                      <Button
                        className="mr10 p-button-danger"
                        onClick={() => handleRemoveProviderdetails(i)}
                        variant="contained"
                        color="secondary"
                        style={{ marginLeft: '5px' }}>
                        <DeleteIcon />
                      </Button>
                    )}
                    {providerDetailsList.length - 1 === i && (
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: '5px' }}
                        onClick={handleAddProviderdetails}>
                        <AddIcon />
                      </Button>
                    )}
                  </Grid>
                </Grid>
              );
            })}

            <Grid item xs={12} style={{ marginTop: '20px' }}>
              <span style={{ color: '#4472C4', fontWeight: 'bold' }}>Service Details</span>
            </Grid>
            <Grid item xs={12} style={{ marginBottom: '15px' }}>
              <Divider />
            </Grid>

            {serviceDetailsList.map((x, i) => {
              return (
                <Grid container spacing={3} key={i}>
                  <Grid item xs={4}>
                    <FormControl className={classes.formControl}>
                      <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                        Service
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        name="serviceId"
                        value={x.serviceId}
                        onChange={e => handleInputChangeService(e, i)}>
                        {serviceList.map(ele => {
                          return (
                            <MenuItem key={ele.id} value={ele.id}>
                              {ele.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      id="standard-basic"
                      type="number"
                      name="estimatedCost"
                      value={x.estimatedCost}
                      onChange={e => handleInputChangeService(e, i)}
                      label="Estimated Cost"
                    />
                  </Grid>

                  <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
                    {serviceDetailsList.length !== 1 && (
                      <Button
                        className="mr10 p-button-danger"
                        onClick={() => handleRemoveServicedetails(i)}
                        variant="contained"
                        color="secondary"
                        style={{ marginLeft: '5px' }}>
                        <DeleteIcon />
                      </Button>
                    )}
                    {serviceDetailsList.length - 1 === i && (
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: '5px' }}
                        onClick={handleAddServicedetails}>
                        <AddIcon />
                      </Button>
                    )}
                  </Grid>
                </Grid>
              );
            })}

            <Grid item xs={12} style={{ marginBottom: '15px', marginTop: '10px' }}>
              <Divider />
            </Grid>

            {sanctionButton &&
              <Grid container spacing={3} style={{ marginBottom: '20px' }}>
                <Grid item xs={6}>
                  <TextField
                    id="standard-basic"
                    name="maxAmountThatCanBeApproved"
                    type="number"
                    readonly={true}
                    value={benefitsWithCost[0].maxApprovedCost}
                    label="MAX AMOUNT THAT CAN BE APPROVED"
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>
            }

            {sanctionButton && (<ClaimsDocumentOPDComponent />)}

            {sanctionButton && formik.values.preAuthStatus != 'APPROVED' ? (
              <Grid item xs={12} className={classes.actionContainer}>
                <Button variant="contained" color="primary" onClick={() => { sanctionPreAuth() }}>
                  Sanction
                </Button>
              </Grid>
            ) : (
              formik.values.preAuthStatus != 'APPROVED' && (
                <Grid item xs={12} className={classes.actionContainer}>
                  <Button variant="contained" color="primary"
                    type="submit"
                  >
                    Evaluate
                  </Button>
                  <Button className={`p-button-text ${classes.saveBtn}`} style={{ marginLeft: '10px' }} variant="contained" color="primary" onClick={handleClose}>
                    Close
                  </Button>
                </Grid>
              )
            )
            }
          </form>
        </Box>
      </Paper >
    </>
  );
}
