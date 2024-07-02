// import DateFnsUtils from '@date-io/date-fns';
import { makeStyles } from "@mui/styles";
import { useFormik } from "formik";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CheckBoxOutlineBlankOutlinedIcon from "@mui/icons-material/CheckBoxOutlineBlankOutlined";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { BenefitService } from "../../remote-api/api/master-services/benefit-service";
import { ProvidersService } from "../../remote-api/api/provider-services";
import { ServiceTypeService } from "../../remote-api/api/master-services/service-type-service";
import { PreAuthService } from "../../remote-api/api/claim-services/preauth-services";
import { MemberService } from "../../remote-api/api/member-services";
import { BehaviorSubject, forkJoin, from, lastValueFrom } from "rxjs";
import { map } from "rxjs/operators";
import {
  Alert,
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "primereact/button";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ClaimModal from "./claim.modal.component";
import { ArrowDropDownIcon } from "@mui/x-date-pickers/icons";
import { CheckCircle, Fingerprint } from "@mui/icons-material";
import BioModal from "./component/bio-modal";
import { validate } from "numeral";

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
    minWidth: 182,
  },
  formControl1: {
    // margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  inputRoot: {
    "&$disabled": {
      color: "black",
    },
    benifitAutoComplete: {
      width: 500,
      "& .MuiInputBase-formControl": {
        maxHeight: 200,
        overflowX: "hidden",
        overflowY: "auto",
      },
    },
  },
  disabled: {},
  actionContainer: {
    display: "flex",
    justifyContent: "flex-end",
  },
  saveBtn: {
    marginRight: "5px",
  },
  buttonPrimary: {
    backgroundColor: "#313c96",
    color: "#f1f1f1",
  },
  buttonSecondary: {
    backgroundColor: "#01de74",
    color: "#f1f1f1",
  },
  buttonDanger: {
    backgroundColor: "#dc3545",
    color: "#f1f1f1",
  },
}));

const benefitService = new BenefitService();
const providerService = new ProvidersService();
const serviceDiagnosis = new ServiceTypeService();
const preAuthService = new PreAuthService();
const memberservice = new MemberService();

let ps$ = providerService.getProviders();
let ad$ = serviceDiagnosis.getServicesbyId("867854874246590464", {
  page: 0,
  size: 1000,
  summary: true,
  active: true,
  nonGroupedServices: false,
});

let serviceAll$ = forkJoin(
  serviceDiagnosis.getServicesbyId("867854950947827712", {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false,
  }),
  serviceDiagnosis.getServicesbyId("867855014529282048", {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false,
  }),
  serviceDiagnosis.getServicesbyId("867855088575524864", {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false,
  }),
  serviceDiagnosis.getServicesbyId("867855148155613184", {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false,
  })
);

export default function ClaimsPreAuthIPDComponent(props) {
  //   const query2 = useQuery1();
  const navigate = useNavigate();
  const { id } = useParams();
  const classes = useStyles();

  const providerId = localStorage.getItem("providerId");
  const [selectedDOD, setSelectedDOD] = React.useState(new Date());
  const [selectedDOA, setSelectedDOA] = React.useState(new Date());

  const [providerList, setProviderList] = React.useState([]);
  const [serviceList, setServiceList] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [diagnosisList, setDiagnosisList] = React.useState([]);
  const [intervention, setIntervention] = React.useState([]);
  const [benefits, setBenefits] = React.useState([]);
  const [benefitId, setBenefitId] = React.useState();
  const [benefitOptions, setBenefitOptions] = React.useState([]);
  const [selectedBenefit, setSelectedBenefit] = React.useState([]);
  const [otherTypeList, setOtherTypeList] = React.useState([]);
  const [claimModal, setClaimModal] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState("");
  const [openSnack, setOpenSnack] = React.useState(false);
  const [searchType, setSearchType] = React.useState("membership_no");
  const [openClientModal, setOpenClientModal] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState([]);
  const [selectSpecId, setSelectedSpecId] = React.useState("");
  const [serviceTypeList, setServiceTypeList] = React.useState();
  const [expenseHeadList, setExpenseHeadList] = React.useState();
  const [showViewDetails, setShowViewDetails] = React.useState(false);
  const [serviceSectionHandle, setServiceSectionHandle] = React.useState(false);
  const [isLoadingValidate, setIsLoadingValidate] = React.useState(false);
  const [Validated, setValidated] = React.useState(false);
  const [biomodalopen, setBioModalopen] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      name: "",
      type: "",
      preAuthStatus: null,
      partnerId: "",
      combinationPartnerId: "",
      taxPinNumber: "",
      code: "",
      contact: "",
      email: "",
      pOrgData: "",
      parentAgentId: "",
      natureOfAgent: "",
      orgTypeCd: "",
      memberShipNo: "",
      diagnosis: [],
      primaryDigonesisId: "",
      expectedDOD: "",
      expectedDOA: "",
      estimatedCost: "",
      referalTicketRequired: false,
      contactNoOne: "",
      contactNoTwo: "",
    },
    // validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSubmit();
    },
  });
  const allSelected =
    diagnosisList &&
    diagnosisList?.length > 0 &&
    formik.values?.diagnosis?.length === diagnosisList?.length;
  const icon = <CheckBoxOutlineBlankOutlinedIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const [memberBasic, setMemberBasic] = React.useState({
    name: "",
    policyNumber: "",
    age: "",
    relations: "",
    enrolmentDate: new Date(),
    enrolentToDate: new Date(),
    enrolmentFromDate: new Date(),
    insuranceCompany: "",
    corporateName: "",
    membershipNo: "",
    memberName: "",
    gender: "",
    policyCode: "",
    policyType: "",
    policyPeriod: "",
    planName: "",
    planScheme: "",
    productName: "",
    clientType: "",
    active: "",
    dateOfBirth: "",
    mobileNo: "",
    nationalDocId: "",
    email: "",
  });
  const [memberName, setMemberName] = React.useState({
    name: "",
    policyNumber: "",
    age: "",
    relations: "",
    enrolmentDate: new Date(),
    enrolentToDate: new Date(),
    enrolmentFromDate: new Date(),
    insuranceCompany: "",
    corporateName: "",
    membershipNo: "",
    memberName: "",
    gender: "",
    policyCode: "",
    policyType: "",
    policyPeriod: "",
    planName: "",
    planScheme: "",
    productName: "",
    clientType: "",
    active: "",
    dateOfBirth: "",
    mobileNo: "",
    nationalDocId: "",
    email: "",
  });
  const [providerDetailsList, setProviderDetailsList] = React.useState([
    {
      providerId: localStorage.getItem("providerId"),
      benefit: [
        {
          estimatedCost: 0,
          benefitId: "",
        },
      ],
    },
  ]);
  const [benefitsWithCost, setBenefitsWithCost] = React.useState([
    {
      benefitId: "",
      estimatedCost: 0,
    },
  ]);
  const [serviceDetailsList, setServiceDetailsList] = React.useState([
    {
      providerId: localStorage.getItem("providerId"),
      estimatedCost: 0,
      benefitId: "",
      codeStandard: "SHA",
      interventionCode: "",
      diagnosis: "",
      decisionId: "",
    },
  ]);
  // const useObservable = (observable, setter) => {
  //   useEffect(() => {
  //     let subscription = observable.subscribe((result) => {
  //       setter(result);
  //     });
  //     return () => subscription.unsubscribe();
  //   }, [observable, setter]);
  // };

  const useObservable1 = (observable, setter) => {
    useEffect(() => {
      let subscription = observable.subscribe((result) => {
        let arr = [];
        result.content.forEach((ele) => {
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
      let subscription = observable.subscribe((result) => {
        let arr = [];
        result.forEach((elearr) => {
          elearr.content.forEach((el) => {
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
      let subscription = observable.subscribe((result) => {
        let arr = [];
        result.content.forEach((ele) => {
          arr.push({ id: ele.id, diagnosisName: ele.name });
        });
        setter(arr);
      });
      return () => subscription.unsubscribe();
    }, [observable, setter]);
  };
  const handleBenefitSteps = (index) => {
    const list = [...serviceDetailsList];
    list[index].diagnosis = null;
    list[index].estimatedCost = 0;
    list[index].interventionCode = null;
    setServiceDetailsList(list);
  };

  const getServiceTypes = () => {
    let serviceTypeService$ = serviceDiagnosis.getServiceTypes();
    serviceTypeService$.subscribe((response) => {
      let temp = [];
      response.content.forEach((el) => {
        temp.push(el);
      });
      setServiceTypeList(temp);
    });
  };

  const getBenefit = (id, policyNo) => {
    let bts$ = benefitService.getAllBenefitWithChild({
      page: 0,
      size: 1000,
      memberId: id,
      policyNumber: policyNo,
      claimType: "IPD",
    });
    bts$.subscribe((result) => {
      console.log(result);
      setBenefits(result);
    });
  };

  const getIntervemntions = (data, i) => {
    let bts$ = benefitService.getBenefitInterventions(data.benefitStructureId);
    bts$.subscribe((result) => {
      let temp = [];
      // temp.push(result)
      result.forEach((el) => {
        let obj = {
          label: el.code + "|" + el.name,
          value: el?.interventionId,
          code: el?.code,
        };
        temp.push(obj);
      });
      setIntervention(temp);
      handleBenefitSteps(i);
    });
  };

  React.useEffect(() => {
    getServiceTypes();
  }, []);

  const getServices = (data, i) => {
    if (data == null) {
      setServiceList([]);
    } else {
      let bts$ = benefitService.getServicesfromInterventions(
        data.value,
        benefitId
      );
      bts$.subscribe((response) => {
        let temp = [];
        response.forEach((el) => {
          let obj = {
            label: el?.code + " | " + el?.name,
            value: el?.code,
          };
          temp.push(obj);
        });
        setServiceList(temp);
        handleDiagnosisSteps(i);
      });
    }
  };

  useEffect(() => {
    const benefitLookup = benefits?.reduce((acc, el) => {
      acc[el.benefitStructureId] = el.name;
      return acc;
    }, {});
    let temp = [];
    let X = benefits?.forEach((ele) => {
      const parentBenefitName = benefitLookup[ele.parentBenefitStructureId];
      let obj = {
        label: `${
          parentBenefitName != undefined ? `${parentBenefitName} >` : ""
        } ${ele.name}`,
        name: ele.name,
        value: ele.id,
        benefitStructureId: ele.benefitStructureId,
      };
      temp.push(obj);
    });
    setBenefitOptions(temp);
  }, [benefits]);

  // useObservable(bts$, setBenefits);
  //useObservable(bts$, setOtherTypeList);
  useObservable1(ps$, setProviderList);
  // useObservable3(ad$, setDiagnosisList);
  // useObservable2(serviceAll$, setServiceList);

  const handleClose = () => {
    localStorage.removeItem("preauthid");
    navigate("/preauths");
  };
  const handleClosed = () => {
    setOpenClientModal(false);
  };

  const handlerNameFunction = (valueId) => {
    let pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
      key: "MEMBER_ID",
      value: valueId,
    };
    memberservice.getMember(pageRequest).subscribe((res) => {
      if (res.content?.length > 0) {
        setMemberName({ res });
        formik.setFieldValue("contactNoOne", res.content[0].mobileNo);
        setMemberBasic({
          ...memberBasic,
          name: res.content[0].name,
          age: res.content[0].age,
          gender: res.content[0].gender,
          membershipNo: res.content[0].membershipNo,
          relations: res.content[0].relations,
          policyNumber: res.content[0].policyNumber,
          enrolentToDate: new Date(res.content[0].policyEndDate),
          enrolmentFromDate: new Date(res.content[0].policyStartDate),
          planName: res.content[0].planName,
          planScheme: res.content[0].planScheme,
          productName: res.content[0].productName,
        });
        setShowViewDetails(true);
      }
    });
    setOpenClientModal(false);
  };
  console.log(memberBasic);
  // set the type of state
  const handleChange = (event) => {
    setSearchType(event.target.value);
  };

  const handleopenClientModal = () => {
    setOpenClientModal(true);
  };
  const handleCloseClientModal = () => {
    setOpenClientModal(false);
  };

  const handleInputChangeProvider = (e, index) => {
    const { name, value } = e.target;
    const isValAlreadyPresent = providerDetailsList.some(
      (item) => item.providerId === value
    );

    if (!isValAlreadyPresent) {
      const list = [...providerDetailsList];
      list[index][name] = value;
      setProviderDetailsList(list);
    } else {
      setAlertMsg(`Provider already selected!!!`);
      setOpenSnack(true);
    }
  };

  const handleEstimateChangeProvider = (e, idx) => {
    let i = 0;
    const { value } = e.target;
    if (
      i >= 0 &&
      i < providerDetailsList.length &&
      idx >= 0 &&
      idx < providerDetailsList[i].benefit.length
    ) {
      const updatedA = [...providerDetailsList];
      updatedA[i].benefit[idx].estimatedCost = value;
      setProviderDetailsList(updatedA);
    } else {
      alert("Index out of bounds");
    }
  };

  const handleRemoveProviderdetails = (index) => {
    const list = [...providerDetailsList];
    list.splice(index, 1);
    setProviderDetailsList(list);
  };

  const handleRemoveProviderWithBenefit = (idx) => {
    let i = 0;
    if (
      i >= 0 &&
      i < providerDetailsList.length &&
      idx >= 0 &&
      idx < providerDetailsList[i].benefit.length
    ) {
      const updatedA = [...providerDetailsList];
      updatedA[i].benefit.splice(idx, 1);
      setProviderDetailsList(updatedA);
    } else {
      alert("Index out of bounds");
    }
  };

  const handleAddProviderdetails = () => {
    setProviderDetailsList([
      ...providerDetailsList,
      {
        providerId: "",
        benefit: [
          {
            estimatedCost: 0,
            benefitId: "",
          },
        ],
      },
    ]);
  };

  const handleAddProviderWithBenefit = (index) => {
    // if (index >= 0 && index < providerDetailsList.length) {
    const newBenefitObject = { estimatedCost: 0, benefitId: "" };
    const updatedA = [...providerDetailsList];
    updatedA[0].benefit.push(newBenefitObject);
    setProviderDetailsList(updatedA);
    // } else {
    //   alert("Index out of bounds");
    // }
  };

  const handleInputChangeBenefitWithCost = (e, index) => {
    const { name, value } = e.target;
    const list = [...benefitsWithCost];
    list[index][name] = value;
    setBenefitsWithCost(list);
    handleEstimateChangeProvider(e, index);
  };

  const handleRemoveClaimCost = (index) => {
    const list = [...benefitsWithCost];
    list.splice(index, 1);
    setBenefitsWithCost(list);
    const listSelected = [...selectedBenefit];
    listSelected.splice(index, 1);
    setSelectedBenefit(listSelected);
    handleRemoveProviderWithBenefit(index);
  };

  const handleAddClaimCost = () => {
    setBenefitsWithCost([
      ...benefitsWithCost,
      { benefitId: "", otherType: "", estimatedCost: 0 },
    ]);
    handleAddProviderWithBenefit();
  };

  const handleInputChangeService = (e, index) => {
    const { name, value } = e.target;
    const list = [...serviceDetailsList];
    list[index][name] = value;
    setServiceDetailsList(list);
  };

  const handleRemoveServicedetails = (index) => {
    const list = [...serviceDetailsList];
    list.splice(index, 1);
    setServiceDetailsList(list);
  };

  const handleAddServicedetails = () => {
    setServiceDetailsList([
      ...serviceDetailsList,
      {
        providerId: localStorage.getItem("providerId"),
        estimatedCost: 0,
        benefitId: "",
        codeStandard: "SHA",
        interventionCode: null,
        diagnosis: null,
      },
    ]);
  };

  const handlePrimaryDiagnosisChange = (e, val) => {
    let selectedBenifits = val;
    const isSelecAll = selectedBenifits.some((item) => item.id === "selectall");
    if (isSelecAll) {
      if (
        diagnosisList.length > 0 &&
        diagnosisList.length === formik.values.diagnosis.length
      ) {
        selectedBenifits = [];
      } else {
        selectedBenifits = diagnosisList;
      }
    }
    formik.setFieldValue("dprimaryDiagnosis", selectedBenifits);
  };

  const handleValidation = (code, benefitID) => {
    const payload = {
      id: localStorage.getItem("providerId"),
      relations: memberBasic?.relations,
      memberId: memberBasic?.memberId,
      name: memberBasic?.name,
      dateOfBirth: memberBasic?.dateOfBirth,
      effectiveDate: null,
      age: memberBasic?.age,
      gender: memberBasic?.gender,
      email: memberBasic?.email,
      mobileNo: memberBasic?.mobileNo,
      memberAddressLine1: null,
      memberAddressLine2: null,
      designation: null,
      unit: null,
      department: null,
      postalCode: null,
      identificationDocType: "NationalId",
      identificationDocNumber: memberBasic?.nationalDocId,
      planScheme: memberBasic?.planScheme,
      membershipNo: memberBasic?.membershipNo,
      nomineeName: null,
      nomineeRelation: null,
      nomineeDob: null,
      dateOfJoining: null,
      eftDetails: null,
      bankName: null,
      bankBranchCode: null,
      accountName: null,
      accountNo: null,
      ifscCode: null,
      employeeName: null,
      processRequestId: null,
      policyNumber: memberBasic?.policyNumber,
      policyStartDate: memberBasic?.enrolmentFromDate,
      policyEndDate: memberBasic?.enrolentToDate,
      planName: memberBasic?.planName,
      productName: memberBasic?.productName,
      nationalDocType: null,
      nationalDocId: null,
      clientType: memberBasic?.clientType,
      vip: false,
      political: false,
      active: true,
      subbenefitStractureId: benefitID,
      interventionCode: code,
      level: localStorage.getItem("levelID"),
      individualHousehold: "Individual",
    };

    return lastValueFrom(
      memberservice.getValidate(payload).pipe(map((res) => res[0]?.decisionId))
    );
  };

  const handleMultipleValid = async () => {
    setIsLoadingValidate(true);
    const promises = serviceDetailsList.map((obj) => {
      if (obj?.interventionCode) {
        let { code } = obj.interventionCode;
        return handleValidation(code, obj?.benefitId);
      }
    });

    if (serviceDetailsList[0]?.interventionCode) {
      try {
        const results = await Promise.all(promises);
        // Handle the results
        console.log(results);
        let listServiceDetails = serviceDetailsList.map((item, index) => {
          return {
            ...item,
            decisionId: results[index],
          };
        });

        setServiceDetailsList(listServiceDetails);
        setIsLoadingValidate(false);
        setValidated(true);

        console.log(listServiceDetails);
        setIsLoadingValidate(false);
      } catch (error) {
        console.error(error);
        setIsLoadingValidate(false);
        setValidated(false);
      }
    } else {
      setTimeout(() => {
        setIsLoadingValidate(false);
      }, 2000);
    }
  };

  const handleDiagnosisChange = (e, val) => {
    let selectedBenifits = val;
    const isSelecAll = selectedBenifits.some((item) => item.id === "selectall");
    if (isSelecAll) {
      if (
        diagnosisList.length > 0 &&
        diagnosisList.length === formik.values.diagnosis.length
      ) {
        selectedBenifits = [];
      } else {
        selectedBenifits = diagnosisList;
      }
    }
    formik.setFieldValue("diagnosis", selectedBenifits);
  };

  const handleBenefitChange = (index, val) => {
    const isOptionPresent = selectedBenefit.some(
      (item) => item?.value === val?.value
    );

    if (val === null) {
      let temp = [...selectedBenefit];
      temp.splice(index, 1);
      setSelectedBenefit(temp);
    } else {
      if (!isOptionPresent) {
        setSelectedBenefit([...selectedBenefit, val]);
      }
    }

    const isValAlreadyPresent = benefitsWithCost.some(
      (item) => item.benefitId === val?.value
    );

    if (!isValAlreadyPresent) {
      setBenefitsWithCost((prevData) => [
        ...prevData.slice(0, index),
        { ...prevData[index], benefitId: val?.value },
        ...prevData.slice(index + 1),
      ]);
    } else {
      setAlertMsg(`You have already added this benefit!!!`);
      setOpenSnack(true);
    }

    handleBenefitChangeInProvider(index, val);
  };

  const handleBenefitChangeInProvider = (idx, val) => {
    let i = 0;
    if (
      i >= 0 &&
      i < providerDetailsList.length &&
      idx >= 0 &&
      idx < providerDetailsList[i].benefit.length
    ) {
      const isValAlreadyPresent = providerDetailsList[i].benefit.some(
        (benefitItem) => benefitItem.benefitId === val?.value
      );

      if (!isValAlreadyPresent) {
        const updatedProviderDetailsList = [...providerDetailsList];
        updatedProviderDetailsList[i].benefit[idx].benefitId = val?.value;
        setProviderDetailsList(updatedProviderDetailsList);
      } else {
        setAlertMsg(
          `You are selecting benefit which is already selected before`
        );
        setOpenSnack(true);
      }
    } else {
      alert("Index out of bounds");
    }
  };

  React.useEffect(() => {
    if (id) {
      populateStepOne(id);
    }
  }, [id]);

  // React.useEffect(() => {
  //   if (localStorage.getItem("preauthid")) {
  //     populateStepOne(localStorage.getItem("preauthid"));
  //   }
  // }, [localStorage.getItem("preauthid")]);

  const populateStepOne = (preAuthId) => {
    preAuthService.getPreAuthById(preAuthId, providerId).subscribe((res) => {
      formik.setValues({
        memberShipNo: res.memberShipNo,
        expectedDOA: res.expectedDOA,
        expectedDOD: res.expectedDOD,
        diagnosis: res.diagnosis,
        primaryDigonesisId: res.primaryDigonesisId,
        contactNoOne: Number(res.contactNoOne),
        contactNoTwo: Number(res.contactNoTwo),
        referalTicketRequired: res.referalTicketRequired,
        preAuthStatus: res.preAuthStatus,
      });

      setSelectedDOD(new Date(res.expectedDOD));
      setSelectedDOA(new Date(res.expectedDOA));
      setProviderDetailsList(res.providers);
      setBenefitsWithCost(res.benefitsWithCost);
      setServiceDetailsList(res.benefitsWithCost);
      getMemberDetails(res.memberShipNo, res.policyNumber);
      if (res.diagnosis && res.diagnosis.length !== 0) {
        setDiagnosisdata(res.diagnosis);
      }
    });
  };

  useEffect(() => {
    if (id) {
      // if (query2.get("mode") === "edit") {
      if (benefitOptions?.length) {
        let temp = [];
        benefitOptions.forEach((el) => {
          if (benefitsWithCost?.find((item) => el?.value === item?.benefitId)) {
            temp.push(el);
          }
        });
        setSelectedBenefit(temp);
      }
    }
  }, [benefitOptions, benefitsWithCost]);

  const setDiagnosisdata = (diagnosis) => {
    serviceDiagnosis
      .getServicesbyId("867854874246590464", {
        page: 0,
        size: 1000,
        summary: true,
        active: true,
        nonGroupedServices: false,
      })
      .subscribe((ser) => {
        let ar = [];
        diagnosis.forEach((diag) => {
          ser.content.forEach((service) => {
            if (diag === service.id) {
              ar.push({ id: service.id, diagnosisName: service.name });
            }
          });
        });
        formik.setFieldValue("diagnosis", ar);
      });
  };

  const getMemberDetails = (id) => {
    let pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
    };
    console.log("search", searchType);
    if (searchType === "name") {
      pageRequest.name = id;
    }
    if (searchType === "membership_no") {
      pageRequest.value = id;
      pageRequest.key = "MEMBERSHIP_NO";
    }
    if (searchType === "national_id") {
      pageRequest.value = id;
      pageRequest.key = "IDENTIFICATION_DOC_NUMBER";
    }

    providerService
      .getProviderDetailsAll(localStorage.getItem("providerId"))
      .subscribe((res) => {
        const response = res?.providerCategoryHistorys;

        const level = response
          ?.map((item) => {
            if (item?.endDate == null) {
              return item?.categoryName;
            }
            return null;
          })
          ?.filter((value) => value);
        localStorage.setItem("levelID", level[0]);
      });

    memberservice.getMember(pageRequest).subscribe((res) => {
      if (res.content?.length > 0) {
        if (searchType === "name") {
          console.log(res);
          setMemberName({ res });
          handleopenClientModal();
        } else {
          formik.setFieldValue("contactNoOne", res.content[0].mobileNo);
          setMemberBasic({
            ...memberBasic,
            name: res.content[0].name,
            clientType: res.content[0].clientType,
            age: res.content[0].age,
            gender: res.content[0].gender,
            membershipNo: res.content[0].membershipNo,
            memberId: res.content[0].memberId,
            relations: res.content[0].relations,
            contactNoOne: res.content[0].mobileNo,
            policyNumber: res.content[0].policyNumber,
            enrolentToDate: new Date(res.content[0].policyEndDate),
            enrolmentFromDate: new Date(res.content[0].policyStartDate),
            planName: res.content[0].planName,
            planScheme: res.content[0].planScheme,
            productName: res.content[0].productName,
            active: res.content[0].active,
            dateOfBirth: res.content[0].dateOfBirth,
            mobileNo: res.content[0].mobileNo,
            nationalDocId: res.content[0].identificationDocNumber,
            // policyNumber: res.content[0].policyNumber,
            email: res.content[0].email,
          });
          setShowViewDetails(true);
          getBenefit(res.content[0].memberId, res.content[0].policyNumber);
        }
      } else {
        setAlertMsg(`No Data found for ${id}`);
        setOpenSnack(true);
      }
      setIsLoading(false);
    });
    // if(searchType === "MEMBERSHIP_NO"){
    //    memberservice.getMember(pageRequest11).subscribe(res => {
    //   if (res.content?.length > 0) {
    //     // formik.setFieldValue('contactNoOne', res.content.mobileNo);
    //     setMemberName({ res });
    //   }
    // });
    // }
    //   if(searchType === "NAME"){
    //     memberservice.getMember(pageRequest1).subscribe(res => {
    //    if (res.content?.length > 0) {
    //      // formik.setFieldValue('contactNoOne', res.content.mobileNo);
    //      setMemberName({ res });
    //    }
    //  });
    //  }
  };

  const handleSelect = (data) => {
    formik.setFieldValue("contactNoOne", data.mobileNo);
    setMemberBasic({
      ...memberBasic,
      name: data.name,
      age: data.age,
      gender: data.gender,
      membershipNo: data.membershipNo,
      memberId: data.memberId,
      relations: data.relations,
      policyNumber: data.policyNumber,
      enrolentToDate: new Date(data.policyEndDate),
      enrolmentFromDate: new Date(data.policyStartDate),
      planName: data.planName,
      planScheme: data.planScheme,
      productName: data.productName,
      active: data.active,
      dateOfBirth: data.dateOfBirth,
      mobileNo: data.mobileNo,
      nationalDocId: data.identificationDocNumber,
      // policyNumber: data.policyNumber,
      email: data.email,
    });
    setShowViewDetails(true);
    getBenefit(data?.memberId, data?.policyNumber);
    handleClosed();
  };

  const populateMember = (type) => {
    if (formik.values.memberShipNo) {
      if (type === "name") {
        getMemberDetails(formik.values.memberShipNo);
      } else {
        getMemberDetails(formik.values.memberShipNo);
      }
    }
  };

  const handleSubmit = () => {
    if (serviceDetailsList[0].benefitId) {
    } else {
      setAlertMsg("Please add Benefit!!!");
      setOpenSnack(true);
      return;
    }

    // if (providerDetailsList[0].benefit[0].benefitId) {
    // } else {
    //   setAlertMsg("Please add provider!!!");
    //   setOpenSnack(true);
    //   return;
    // }

    // providerDetailsList.forEach((pd) => {
    //   pd.benefit.forEach((el) => {
    //     el.estimatedCost = Number(el.estimatedCost);
    //   });
    // });
    serviceDetailsList.forEach((sd) => {
      sd.estimatedCost = Number(sd.estimatedCost);
    });
    // benefitsWithCost.forEach((ctc) => {
    //   ctc.estimatedCost = Number(ctc.estimatedCost);
    // });

    // const isEveryBInA = providerDetailsList.every((bItem) => {
    //   return bItem.benefit.every((bSubItem) => {
    //     return benefitsWithCost.some(
    //       (aItem) => aItem.benefitId === bSubItem.benefitId
    //     );
    //   });
    // });

    // if (!isEveryBInA) {
    //   setAlertMsg("Your Benefit list and Provider's benefit does not match!!!");
    //   setOpenSnack(true);
    //   return;
    // } else {
    //   benefitsWithCost.forEach((ele) => {
    //     let benefitName;
    //     benefitOptions.forEach((el) => {
    //       if (el.value === ele.benefitId) {
    //         benefitName = el.name;
    //       }
    //     });

    //     let tempSum = 0;
    //     providerDetailsList?.forEach((el) => {
    //       el?.benefit?.map((item) => {
    //         if (item.benefitId === ele.benefitId) {
    //           tempSum += item.estimatedCost;
    //         }
    //       });
    //       if (tempSum > ele.estimatedCost) {
    //         setAlertMsg(
    //           `${benefitName}'s estimated less than provider's distribution!!!`
    //         );
    //         setOpenSnack(true);
    //         return;
    //       }
    //     });
    //   });
    // }

    // benefitsWithCost.forEach((ele) => {
    //   if (ele.benefitId !== "OTHER") {
    //     ele.otherType = "";
    //   }
    // });

    if (new Date(selectedDOA).getTime() > new Date(selectedDOD).getTime()) {
      setAlertMsg("Admission date must be lower than Discharge date");
      setOpenSnack(true);
      return;
    }

    if (
      formik.values.contactNoOne.toString().length > 10 &&
      formik.values.contactNoOne.toString().length < 15
    ) {
      setAlertMsg("Provide right conact details");
      // setAlertMsg("Contact One must be of 10 digits");
      setOpenSnack(true);
      return;
    }
    if (
      formik.values.contactNoTwo &&
      formik.values.contactNoTwo.toString().length > 10 &&
      formik.values.contactNoTwo.toString().length < 15
    ) {
      setAlertMsg("Provide right conact details");
      setOpenSnack(true);
      return;
    }

    const serviceDetailListModify = [...serviceDetailsList];
    const { value } = serviceDetailListModify[0]?.interventionCode;
    serviceDetailListModify[0].interventionCode = value;

    const diagnosisValue = serviceDetailListModify[0]?.diagnosis?.value;
    serviceDetailListModify[0].diagnosis = diagnosisValue;

    let serviceDetailListModify2 = serviceDetailsList.map((item) => {
      if (
        typeof item?.diagnosis === "object" &&
        typeof item?.interventionCode === "object"
      ) {
        return {
          ...item,
          diagnosis: item?.diagnosis?.value,
          interventionCode: item?.interventionCode?.value,
        };
      }
      return item;
    });

    console.log(serviceDetailListModify2);
    let payload = {
      preAuthStatus: formik.values.preAuthStatus,
      memberShipNo: memberBasic.membershipNo,
      expectedDOA: new Date(selectedDOA).getTime(),
      expectedDOD: new Date(selectedDOD).getTime(),
      primaryDigonesisId: serviceDetailsList[0]?.diagnosis,
      contactNoOne: formik.values.contactNoOne.toString(),
      contactNoTwo: formik.values.contactNoTwo.toString(),
      referalTicketRequired: formik.values.referalTicketRequired,
      benefitsWithCost: serviceDetailListModify2,
      // providers: providerDetailsList,
      // services: serviceDetailsList,
      preAuthType: "IPD",
    };
    let arr = [];
    // formik.values.diagnosis.forEach((di) => {
    //   arr.push(di.id.toString());
    // });
    // payload["diagnosis"] = arr;
    let preauthid = localStorage.getItem("preauthid")
      ? localStorage.getItem("preauthid")
      : "";

    if (id) {
      // if (preauthid) {
      //   preAuthService.editPreAuth(payload, preauthid, 1).subscribe((res) => {
      //     if (
      //       formik.values.preAuthStatus === "PRE_AUTH_REQUESTED" ||
      //       formik.values.preAuthStatus === "PRE_AUTH_APPROVED" ||
      //       formik.values.preAuthStatus === "ADD_DOC_APPROVED" ||
      //       formik.values.preAuthStatus === "ENHANCEMENT_APPROVED"
      //     ) {
      //       let payload1 = {
      //         claimStatus: formik.values.preAuthStatus,
      //         actionForClaim: "ENHANCE",
      //       };
      //       preAuthService
      //         .changeStatus(preauthid, "PREAUTH_CLAIM", payload1)
      //         .subscribe((res) => {
      //           props.handleNext();
      //         });
      //     } else {
      //       props.handleNext();
      //     }
      //   });
      // }
      if (id) {
        preAuthService.editPreAuth(payload, id, 1).subscribe((res) => {
          if (
            formik.values.preAuthStatus === "PRE_AUTH_REQUESTED" ||
            formik.values.preAuthStatus === "PRE_AUTH_APPROVED" ||
            formik.values.preAuthStatus === "ADD_DOC_APPROVED" ||
            formik.values.preAuthStatus === "ENHANCEMENT_APPROVED"
          ) {
            let payload1 = {
              claimStatus: formik.values.preAuthStatus,
              actionForClaim: "ENHANCE",
            };
            preAuthService
              .changeStatus(id, "PREAUTH_CLAIM", payload1)
              .subscribe((res) => {
                props.handleNext();
              });
          } else {
            props.handleNext();
          }
        });
      }
    }

    if (!id) {
      preAuthService.savePreAuth(payload, providerId).subscribe((res) => {
        localStorage.setItem("preauthid", res.id);
        props.handleNext();
      });
    }
  };

  const handleDODDate = (date) => {
    setSelectedDOD(date);
    const timestamp = new Date(date).getTime();
    formik.setFieldValue("expectedDOD", timestamp);
  };

  const handleDOA = (date) => {
    setSelectedDOA(date);
    const timestamp = new Date(date).getTime();
    formik.setFieldValue("expectedDOA", timestamp);
  };

  const handleFieldChecked = (e) => {
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
      return options?.filter(
        (item) => item?.name?.toLowerCase().indexOf(state?.inputValue) > -1
      );
    }
    return [{ id: "selectall", name: "Select all" }, ...options];
  };

  const onMemberShipNumberChange = (e) => {
    formik.setFieldValue("memberShipNo", e.target.value);
  };

  const handleMsgErrorClose = () => {
    setOpenSnack(false);
    setAlertMsg("");
  };

  const populateMemberFromSearch = (type) => {
    if (formik.values.memberShipNo) {
      if (type === "name") {
        getMemberDetails(formik.values.memberShipNo);
      } else {
        getMemberDetails(formik.values.memberShipNo);
      }
    }
  };
  const s = new BehaviorSubject({});

  const observable = s.asObservable();

  // const doSelectValue = (e, newValue) => {
  //   if (newValue && newValue.id) {
  //     const selectedDiagnosis = diagnosisList.filter(
  //       (item) => item.id === newValue?.id
  //     );
  //     if (selectedDiagnosis.length > 0) {
  //       setSelectedId(selectedDiagnosis[0]);
  //       setSelectedSpecId(selectedDiagnosis[0]?.id);
  //     }
  //   }
  // };
  useEffect(() => {
    if (formik.values && formik.values.primaryDigonesisId) {
      const selectedDiagnosis = diagnosisList.filter(
        (item) => item.id === formik.values.primaryDigonesisId
      );
      if (selectedDiagnosis.length > 0) {
        setSelectedId(selectedDiagnosis[0]);
      }
    }
  }, [formik.values, diagnosisList]);

  const handleBenefitChangeInService = (e, index) => {
    // const isValAlreadyPresent = serviceDetailsList.some(
    //   (item) => item.benefitId === e.value
    // );
    // if (!isValAlreadyPresent) {
    //   const list = [...serviceDetailsList];
    //   // list[index].benefitId = e.value;
    //   // setServiceDetailsList(list);
    //   if (index >= 0 && index < list.length) {
    //     list[index] = { ...list[index], benefitId: e.value }; // Ensure the object is updated immutably
    //     setServiceDetailsList(list);
    //   } else {
    //     console.error("Index out of bounds:", index);
    //   }
    // } else {
    //   setAlertMsg(`Provider already selected!!!`);
    //   setOpenSnack(true);
    // }

    const list = [...serviceDetailsList];
    list[index].benefitId = e.benefitStructureId ? e.benefitStructureId : "";
    setServiceDetailsList(list);
  };

  console.log(serviceDetailsList);

  const handleChangeIntervention = (e, index) => {
    console.log(e);
    const list = [...serviceDetailsList];
    list[index].interventionCode = e.code ? e : "";
    setServiceDetailsList(list);
  };
  const handleChangeDiagnosis = (e, index) => {
    const list = [...serviceDetailsList];
    list[index].diagnosis = e;
    setServiceDetailsList(list);
  };

  const handleDiagnosisSteps = (index) => {
    const list = [...serviceDetailsList];
    list[index].diagnosis = null;
    list[index].estimatedCost = 0;
    setServiceDetailsList(list);
  };

  const handleEstimateCostInService = (e, index) => {
    const { name, value } = e.target;
    const isValAlreadyPresent = serviceDetailsList.some(
      (item) => item.providerId === value
    );

    if (!isValAlreadyPresent) {
      const list = [...serviceDetailsList];
      list[index][name] = value;
      setServiceDetailsList(list);
    } else {
      setAlertMsg(`Provider already selected!!!`);
      setOpenSnack(true);
    }
  };

  const handleExpenseChangeInService = (e, index) => {
    const { name, value } = e.target;
    const isValAlreadyPresent = serviceDetailsList.some(
      (item) => item.providerId === value
    );

    if (!isValAlreadyPresent) {
      const list = [...serviceDetailsList];
      list[index][name] = value;
      setServiceDetailsList(list);
    } else {
      setAlertMsg(`Provider already selected!!!`);
      setOpenSnack(true);
    }
  };
  console.log(serviceDetailsList);
  const matchResult = (result) => {
    // setMacthResult(result) //string
    console.log("parent match result ", result);
  };

  const handleInterventionValidation = (val, i) => {
    const serviceDetailsListValid = serviceDetailsList
      .map((data, index) => {
        if (
          data?.benefitId == benefitId &&
          index < serviceDetailsList?.length - 1
        ) {
          return data?.interventionCode?.value;
        }
        return null;
      })
      ?.filter((value) => value);

    if (serviceDetailsListValid?.length > 0) {
      const serviceDetailsListIntValid = serviceDetailsListValid.some(
        (data) => {
          console.log(data, val);
          return data == val?.value;
        }
      );

      console.log(serviceDetailsListIntValid);
      if (serviceDetailsListIntValid) {
        throw new Error("Intervention Should Be Different !!");
      }
    }

    console.log(serviceDetailsListValid);
    handleChangeIntervention(val, i);
  };

  const serviceSection = useMemo(
    () => (x, i) => {
      console.log(x);
      return (
        <>
          <Grid item xs={12} sm={6} md={1}>
            <FormControl
              // className={classes.formControl}
              style={{ width: "100%" }}
            >
              <InputLabel
                id="demo-simple-select-label"
                style={{ marginBottom: "0px" }}
              >
                Standard
              </InputLabel>
              <Select
                label="Code Standard"
                name="codeStandard"
                value={x.codeStandard}
                variant="standard"
                fullWidth
              >
                <MenuItem value="SHA">SHA</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.formControl} fullWidth>
              <Autocomplete
                name="intervention"
                // defaultValue={
                //   serviceDetailsList[i].interventionCode?.code
                //     ? serviceDetailsList[i].interventionCode?.label
                //     : null
                // }
                value={
                  serviceDetailsList[i].interventionCode
                    ? serviceDetailsList[i].interventionCode?.label
                    : null
                }
                onChange={(e, val) => {
                  // setServiceSectionHandle(val);

                  getServices(val, i);
                  console.log(serviceDetailsList);
                  handleInterventionValidation(val, i);

                  // setServiceList([]);
                }}
                id="checkboxes-tags-demo"
                // filterOptions={autocompleteFilterChange}
                options={intervention}
                // options={selectedBenefit}
                // getOptionLabel={(option) =>
                //   option.label ??
                //   intervention.find((benefit) => benefit?.value == option)
                //     ?.label
                // }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Intervention"
                    variant="standard"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: null, // This removes the clear icon
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginBottom: "8px",
            }}
          >
            <FormControl className={classes.formControl} fullWidth>
              <Autocomplete
                name="diagnosis"
                // defaultValue={
                //   serviceDetailsList[i]?.diagnosis
                //     ? serviceList?.find(
                //         (item) =>
                //           item?.value == serviceDetailsList[i]?.diagnosis
                //       )
                //     : null
                // }
                // value={x.diagnosis ? x.diagnosis : null}
                value={
                  serviceDetailsList[i].diagnosis
                    ? serviceDetailsList[i].diagnosis?.label
                    : null
                }
                onChange={(e, val) => {
                  // getServices(val);
                  handleChangeDiagnosis(val, i);
                }}
                id="checkboxes-tags-demo"
                // filterOptions={autocompleteFilterChange}
                options={serviceList}
                // options={selectedBenefit}
                // getOptionLabel={(option) =>
                //   option.label ??
                //   serviceList.find((benefit) => benefit?.value == option)?.label
                // }
                // getOptionSelected={(option, value) =>
                //   option?.interventionId === value
                // }
                // renderOption={(option, { selected }) => (
                //   <React.Fragment>{option?.label}</React.Fragment>
                // )}

                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={i === 0 ? "Primary Diagnosis" : "Diagnosis"}
                    variant="standard"
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              id="standard-basic"
              type="number"
              name="estimatedCost"
              variant="standard"
              value={x?.estimatedCost}
              onChange={(e) => handleEstimateCostInService(e, i)}
              label="Estimated Cost"
            />
          </Grid>
        </>
      );
    },
    [intervention, serviceList, serviceDetailsList]
  );

  return (
    <>
      <ClaimModal
        claimModal={claimModal}
        benefit={benefits}
        handleCloseClaimModal={handleCloseClaimModal}
        memberBasic={memberBasic}
      />
      <Paper elevation="none">
        <Box p={3} my={2}>
          <Snackbar
            open={openSnack}
            autoHideDuration={4000}
            onClose={handleMsgErrorClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={handleMsgErrorClose}
              variant="filled"
              severity="error"
            >
              {alertMsg}
            </Alert>
          </Snackbar>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3} style={{ marginBottom: "20px" }}>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                style={{ display: "flex", alignItems: "flex-end" }}
              >
                <Select
                  label="Select"
                  variant="standard"
                  value={searchType}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="membership_no">Membership No.</MenuItem>
                  <MenuItem value="national_id">National ID</MenuItem>
                  <MenuItem value="name">Member Name</MenuItem>
                </Select>
              </Grid>

              {searchType === "national_id" && (
                <Grid item xs={12} sm={6} md={4} style={{ display: "flex" }}>
                  <TextField
                    id="standard-basic"
                    variant="standard"
                    value={formik.values.memberShipNo}
                    onChange={onMemberShipNumberChange}
                    name="searchCode"
                    label="National ID"
                    style={{ flex: "1", marginRight: "5px" }}
                  />

                  <Button
                    className={`responsiveButton ${classes.buttonPrimary}`}
                    variant="contained"
                    onClick={() => {
                      setIsLoading(true);
                      populateMemberFromSearch("number");
                    }}
                    color="#313c96"
                    type="button"
                    style={{ borderRadius: "10px" }}
                  >
                    {isLoading ? (
                      <CircularProgress
                        sx={{ color: "white", width: "20px", height: "20px" }}
                      />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </Grid>
              )}

              {searchType === "membership_no" && (
                <Grid item xs={12} sm={6} md={4} style={{ display: "flex" }}>
                  <TextField
                    id="standard-basic"
                    variant="standard"
                    value={formik.values.memberShipNo}
                    onChange={onMemberShipNumberChange}
                    name="searchCode"
                    label="Membership Code"
                    style={{ flex: "1", marginRight: "5px" }}
                  />

                  <Button
                    className={`responsiveButton ${classes.buttonPrimary}`}
                    variant="contained"
                    onClick={() => {
                      setIsLoading(true);
                      populateMemberFromSearch("number");
                    }}
                    color="#313c96"
                    type="button"
                    style={{ borderRadius: "10px" }}
                  >
                    {isLoading ? (
                      <CircularProgress
                        sx={{ color: "white", width: "20px", height: "20px" }}
                      />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </Grid>
              )}

              {searchType === "name" && (
                <Grid item xs={12} sm={6} md={4} style={{ display: "flex" }}>
                  <TextField
                    id="standard-basic"
                    value={formik.values.memberShipNo}
                    onChange={onMemberShipNumberChange}
                    variant="standard"
                    name="searchCode"
                    style={{ marginLeft: "10px", flex: "1" }}
                    label="Member Name"
                  />

                  <Button
                    variant="contained"
                    onClick={() => {
                      setIsLoading(true);
                      populateMemberFromSearch("name");
                    }}
                    className={classes.buttonPrimary}
                    color="primary"
                    type="button"
                    style={{ marginLeft: "3%", borderRadius: "10px" }}
                  >
                    {isLoading ? (
                      <CircularProgress
                        sx={{ color: "white", width: "20px", height: "20px" }}
                      />
                    ) : (
                      "Search"
                    )}
                  </Button>
                  {/* Dialog component goes here */}
                  {openClientModal && (
                    <Dialog
                      open={openClientModal}
                      onClose={handleClosed}
                      aria-labelledby="form-dialog-title"
                      disableEnforceFocus
                    >
                      <DialogTitle id="form-dialog-title">Members</DialogTitle>

                      <DialogContent>
                        {memberName?.res?.content &&
                        memberName?.res?.content?.length > 0 ? (
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Membership No</TableCell>
                                  <TableCell>Name</TableCell>
                                  <TableCell>Mobile No</TableCell>
                                  <TableCell>Action</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {memberName?.res?.content?.map((item) => (
                                  <TableRow key={item.membershipNo}>
                                    <TableCell>{item.membershipNo}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.mobileNo}</TableCell>
                                    <TableCell>
                                      <Button
                                        onClick={() => handleSelect(item)}
                                        className={classes.buttonPrimary}
                                      >
                                        Select
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <p>No Data Found</p>
                        )}
                      </DialogContent>

                      <DialogActions>
                        <Button
                          onClick={handleClosed}
                          className="p-button-text"
                        >
                          Cancel
                        </Button>
                        {/* <Button onClick={} color="primary">
                        Submit
                      </Button> */}
                      </DialogActions>
                    </Dialog>
                  )}
                </Grid>
              )}
              {
                <BioModal
                  matchResult={matchResult}
                  open={biomodalopen}
                  setOpen={setBioModalopen}
                />
              }
              {
                <Grid item style={{ display: "flex" }}>
                  <IconButton
                    onClick={() => setBioModalopen(true)}
                    size="large"
                    aria-label="fingerprint"
                    color="primary"
                  >
                    <Fingerprint />
                  </IconButton>
                </Grid>
              }
            </Grid>

            <Grid container spacing={3} style={{ marginBottom: "20px" }}>
              <Grid item xs={12}>
                <span style={{ color: "#4472C4", fontWeight: "bold" }}>
                  BASIC DETAILS
                </span>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <TextField
                  id="standard-basic"
                  name="memberName"
                  variant="standard"
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
                {showViewDetails && (
                  <a
                    style={{ color: "#4472C4", cursor: "pointer" }}
                    onClick={viewUserDetails}
                  >
                    View Details
                  </a>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="standard-basic"
                  name="policyNumber"
                  disabled
                  variant="standard"
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="standard-multiline-flexible"
                  variant="standard"
                  name="membershipNo"
                  value={memberBasic.membershipNo}
                  label="Membership No"
                  readonly
                  disabled
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} style={{ marginBottom: "20px" }}>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <TextField
                  id="standard-basic"
                  variant="standard"
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="standard-basic"
                  name="relation"
                  value={memberBasic.relations}
                  disabled
                  variant="standard"
                  label="Relation"
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="standard-basic"
                  name="gender"
                  value={memberBasic.gender}
                  disabled
                  variant="standard"
                  label="Gender"
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    margin="normal"
                    id="date-picker-inline"
                    label="Enrolment Date"
                    autoOk={true}
                    disabled
                    value={dayjs(memberBasic.enrolmentDate)}
                    onChange={handleDOA}
                    KeyboardButtonProps={{
                      "aria-label": "change ing date",
                    }}
                  />
                </LocalizationProvider>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={["year", "month", "date"]}
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
                      "aria-label": "change ing date",
                    }}
                  />
                </MuiPickersUtilsProvider> */}
              </Grid>
            </Grid>
            <Grid container spacing={3} style={{ marginBottom: "20px" }}>
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    margin="normal"
                    id="date-picker-inline"
                    label="Policy From Date"
                    autoOk={true}
                    disabled
                    value={dayjs(memberBasic.enrolmentFromDate)}
                    onChange={handleDOA}
                    KeyboardButtonProps={{
                      "aria-label": "change ing date",
                    }}
                  />
                </LocalizationProvider>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={["year", "month", "date"]}
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
                      "aria-label": "change ing date",
                    }}
                  />
                </MuiPickersUtilsProvider> */}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    margin="normal"
                    id="date-picker-inline"
                    label="Policy To Date"
                    autoOk={true}
                    disabled
                    value={dayjs(memberBasic.enrolentToDate)}
                    onChange={handleDOA}
                    KeyboardButtonProps={{
                      "aria-label": "change ing date",
                    }}
                  />
                </LocalizationProvider>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={["year", "month", "date"]}
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
                      "aria-label": "change ing date",
                    }}
                  />
                </MuiPickersUtilsProvider> */}
              </Grid>
            </Grid>

            {/* <Grid
              item
              xs={12}
              sm={6}
              md={4}
              style={{ marginTop: "20px", marginBottom: "15px" }}
            >
              <Divider />
            </Grid> */}

            {/* {benefitsWithCost?.map((x, i) => {
              return (
                <Grid
                  container
                  spacing={3}
                  key={i}
                  style={{ marginBottom: "20px" }}
                >
                  <Grid item xs={4}>
                    <FormControl className={classes.formControl} fullWidth>
                      <Autocomplete
                        name="benefitId"
                        // defaultValue={x.benefitId ? x.benefitId : ""}
                        value={x.benefitId ? x.benefitId : null}
                        onChange={(e, val) => handleBenefitChange(i, val)}
                        id="checkboxes-tags-demo"
                        filterOptions={autocompleteFilterChange}
                        options={benefitOptions}
                        getOptionLabel={(option) =>
                          option.label ??
                          benefitOptions.find(
                            (benefit) => benefit.value == option
                          )?.label
                        }
                        getOptionSelected={(option, value) =>
                          option.value === value
                        }
                        // renderOption={(option, { selected }) => {
                        //   return (
                        //     <React.Fragment>{option.label}</React.Fragment>
                        //   );
                        // }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Benefit id"
                            variant="standard"
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  {x.benefitId === "OTHER" && (
                    <Grid item xs={4}>
                      <FormControl className={classes.formControl}>
                        <InputLabel
                          id="demo-simple-select-label"
                          style={{ marginBottom: "0px" }}
                        >
                          Other
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          variant="standard"
                          id="demo-simple-select"
                          name="other"
                          value={x.otherType}
                          onChange={(e) =>
                            handleInputChangeBenefitWithCost(e, i)
                          }
                        >
                          {otherTypeList?.map((ele) => {
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
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      id="standard-basic"
                      type="number"
                      variant="standard"
                      name="estimatedCost"
                      value={x.estimatedCost}
                      onChange={(e) => handleInputChangeBenefitWithCost(e, i)}
                      label="Estimated Cost"
                    />
                  </Grid>

                  <Grid
                    item
                    xs={2}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {benefitsWithCost.length !== 1 && (
                      <Button
                        className={`mr10 ${classes.buttonDanger}`}
                        onClick={() => handleRemoveClaimCost(i)}
                        variant="contained"
                        color="error"
                        style={{ marginLeft: "5px" }}
                      >
                        <DeleteIcon />
                      </Button>
                    )}
                    {benefitsWithCost.length - 1 === i && (
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.buttonPrimary}
                        style={{ marginLeft: "5px" }}
                        onClick={handleAddClaimCost}
                      >
                        <AddIcon />
                      </Button>
                    )}
                  </Grid>
                </Grid>
              );
            })} */}

            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              style={{ marginTop: "20px", marginBottom: "15px" }}
            >
              <Divider />
            </Grid>

            <Grid container spacing={3} style={{ marginBottom: "20px" }}>
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    margin="normal"
                    id="date-picker-inline"
                    label="Expected/Actual DOA"
                    autoOk={true}
                    value={dayjs(selectedDOA)}
                    onChange={handleDOA}
                    KeyboardButtonProps={{
                      "aria-label": "change ing date",
                    }}
                  />
                </LocalizationProvider>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={["year", "month", "date"]}
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Expected DOA"
                    autoOk={true}
                    value={selectedDOA}
                    onChange={handleDOA}
                    KeyboardButtonProps={{
                      "aria-label": "change ing date",
                    }}
                  />
                </MuiPickersUtilsProvider> */}
              </Grid>
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    margin="normal"
                    id="date-picker-inline"
                    label="Expected/Actual DOD"
                    autoOk={true}
                    value={dayjs(selectedDOD)}
                    onChange={handleDODDate}
                    KeyboardButtonProps={{
                      "aria-label": "change ing date",
                    }}
                  />
                </LocalizationProvider>
                {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    views={["year", "month", "date"]}
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    autoOk={true}
                    label="Expected DOD"
                    value={selectedDOD}
                    onChange={handleDODDate}
                    KeyboardButtonProps={{
                      "aria-label": "change DOD date",
                    }}
                  />
                </MuiPickersUtilsProvider> */}
              </Grid>

              {/* <Grid
                item
                xs={12}
                sm={3}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  marginBottom: "8px",
                }}
              >
                <Autocomplete
                  id="checkboxes-tags-demo"
                  options={diagnosisList}
                  style={{ width: "100%" }}
                  getOptionLabel={(option) => option.diagnosisName}
                  //   renderOption={(option) => (
                  //     <React.Fragment>{option.diagnosisName}</React.Fragment>
                  //   )}
                  value={selectedId ? selectedId : null}
                  className={classes.benifitAutoComplete}
                  onChange={(e, value) => doSelectValue(e, value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Primary Diagnosis"
                      variant="standard"
                    />
                  )}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={3}
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  marginBottom: "8px",
                }}
              >
                <Autocomplete
                  className={classes.benifitAutoComplete}
                  multiple
                  value={formik.values.diagnosis}
                  onChange={handleDiagnosisChange}
                  id="checkboxes-tags-demo"
                  filterOptions={autocompleteFilterChange}
                  options={diagnosisList}
                  disableCloseOnSelect
                  style={{ width: "100%" }}
                  getOptionLabel={(option) => option.diagnosisName}
                  getOptionSelected={(option, value) => option.id === value.id}
                  //   renderOption={(option, { selected }) => {
                  //     const selectedOpt =
                  //       (option.id === "selectall" && allSelected) || selected;
                  //     return (
                  //       <React.Fragment>
                  //         <Checkbox
                  //           icon={icon}
                  //           checkedIcon={checkedIcon}
                  //           style={{ marginRight: 8, color: "#626bda" }}
                  //           checked={selectedOpt}
                  //         />
                  //         {option.diagnosisName}
                  //       </React.Fragment>
                  //     );
                  //   }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Other Diagnoses"
                      variant="standard"
                      placeholder="Select Diagnosis"
                    />
                  )}
                />
              </Grid> */}
            </Grid>

            <Grid container spacing={3} style={{ marginBottom: "20px" }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  id="standard-basic"
                  name="contactNoOne"
                  type="number"
                  value={formik.values.contactNoOne}
                  variant="standard"
                  onChange={formik.handleChange}
                  label="Contact No. 1"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  variant="standard"
                  id="standard-basic"
                  name="contactNoTwo"
                  type="number"
                  value={memberBasic.contactNoTwo}
                  onChange={formik.handleChange}
                  label="Contact No. 2"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.referalTicketRequired}
                      onChange={(e) => handleFieldChecked(e)}
                      name="referalTicketRequired"
                      color="primary"
                    />
                  }
                  label="Referral Ticket Required"
                />
              </Grid>
            </Grid>

            <Grid itemxs={12} sm={6} md={4} style={{ marginTop: "20px" }}>
              <span style={{ color: "#4472C4", fontWeight: "bold" }}>
                SERVICE DETAILS
              </span>
            </Grid>
            <Grid item xs={12} sm={12} md={12} style={{ marginBottom: "15px" }}>
              <Divider />
            </Grid>

            {serviceDetailsList?.map((x, i) => {
              return (
                <Grid container spacing={3} key={i}>
                  <Grid item xs={12} sm={12} md={12}>
                    <Grid
                      container
                      spacing={3}
                      style={{ marginBottom: "20px" }}
                    >
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl className={classes.formControl} fullWidth>
                          <Autocomplete
                            name="benefitId"
                            defaultValue={
                              x?.benefitStructureId
                                ? x?.benefitStructureId
                                : null
                            }
                            value={
                              x?.benefitStructureId
                                ? x?.benefitStructureId
                                : undefined
                            }
                            onChange={(e, val) => {
                              setIntervention([]);
                              getIntervemntions(val, i);
                              handleBenefitChangeInService(val, i);
                              setBenefitId(val.benefitStructureId);
                              handleChangeIntervention("", i);
                            }}
                            id="checkboxes-tags-demo"
                            filterOptions={autocompleteFilterChange}
                            options={benefitOptions}
                            // options={selectedBenefit}
                            getOptionLabel={(option) =>
                              option.label ??
                              benefitOptions.find(
                                (benefit) => benefit?.value == option
                              )?.label
                            }
                            getOptionSelected={(option, value) =>
                              option?.value === value
                            }
                            // renderOption={(option, { selected }) => (
                            //   <React.Fragment>{option?.label}</React.Fragment>
                            // )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Benefit"
                                variant="standard"
                              />
                            )}
                          />
                        </FormControl>
                      </Grid>
                      {serviceSection(x, i)}
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {serviceDetailsList.length !== 1 && (
                      <Button
                        className={`mr10 ${classes.buttonDanger}`}
                        onClick={() => handleRemoveServicedetails(i)}
                        variant="contained"
                        color="error"
                        style={{ marginLeft: "5px" }}
                      >
                        <DeleteIcon />
                      </Button>
                    )}
                    {serviceDetailsList.length - 1 === i && (
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.buttonPrimary}
                        style={{ marginLeft: "5px" }}
                        onClick={handleAddServicedetails}
                        disabled={Validated ? true : false}
                      >
                        <AddIcon />
                      </Button>
                    )}
                  </Grid>
                </Grid>
              );
            })}

            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              style={{ marginBottom: "15px", marginTop: "10px" }}
            >
              <Divider />
            </Grid>

            {/* {query2.get("mode") !== "viewOnly" && ( */}
            <Grid item xs={12} className={classes.actionContainer}>
              <Button
                variant="contained"
                color="primary"
                type="button"
                style={{
                  minWidth: "70px",
                  border: "none",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                }}
                disabled={Validated ? true : false}
                className={classes.buttonSecondary}
                onClick={handleMultipleValid}
              >
                {isLoadingValidate ? (
                  <CircularProgress size={"15px"} sx={{ color: "white" }} />
                ) : Validated ? (
                  <>
                    Success
                    <CheckCircle sx={{ color: "blue", cursor: "pointer" }} />
                  </>
                ) : (
                  "Validate"
                )}
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginLeft: "10px" }}
                className={classes.buttonPrimary}
                disabled={Validated ? false : true}
              >
                Save and Next
              </Button>
              <Button
                className={`p-button-text ${classes.saveBtn}`}
                style={{ marginLeft: "10px" }}
                variant="contained"
                // color="secondar"
                onClick={handleClose}
              >
                Close
              </Button>
            </Grid>
            {/* )} */}
          </form>
        </Box>
      </Paper>
    </>
  );
}
