import { makeStyles } from "@mui/styles";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CheckBoxOutlineBlankOutlinedIcon from "@mui/icons-material/CheckBoxOutlineBlankOutlined";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { BenefitService } from "../../remote-api/api/master-services/benefit-service";
import { ProvidersService } from "../../remote-api/api/provider-services";
import { ServiceTypeService } from "../../remote-api/api/master-services/service-type-service";
import { PreAuthService } from "../../remote-api/api/claim-services/preauth-services";
import { MemberService } from "../../remote-api/api/member-services";
import { BehaviorSubject, lastValueFrom } from "rxjs";
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
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "primereact/button";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ClaimModal from "./claim.modal.component";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import BioModal from "./component/bio-modal";
import {
  CancelOutlined,
  ErrorOutlineOutlined,
  PendingActionsOutlined,
  PendingRounded,
  PunchClock,
} from "@mui/icons-material";
import moment from "moment";
import MultipleStopIcon from "@mui/icons-material/MultipleStop";
import { RetailUserService } from "../../remote-api/api/master-services/retail-users-service";
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
  TypographyStyle2: {
    fontSize: "13px",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans - serif',
    fontWeight: "400",
    alignItems: "end",
    display: "flex",
    textTransform: "capitalize",
  },
  TypographyStyle1: {
    fontSize: "14px",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans - serif',
    alignItems: "end",
    fontWeight: "600",
    display: "flex",
    textTransform: "capitalize",
  },
}));

const benefitService = new BenefitService();
const providerService = new ProvidersService();
const serviceDiagnosis = new ServiceTypeService();
const preAuthService = new PreAuthService();
const memberservice = new MemberService();
const retailuserservice = new RetailUserService();

let ps$ = providerService.getProviders();

export default function ClaimsPreAuthIPDComponent(props) {
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
  const [claimModal, setClaimModal] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState("");
  const [openSnack, setOpenSnack] = React.useState(false);
  const [searchType, setSearchType] = React.useState("national_id");
  const [openClientModal, setOpenClientModal] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState([]);
  const [serviceTypeList, setServiceTypeList] = React.useState();
  const [showViewDetails, setShowViewDetails] = React.useState(false);
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
      dependentRelations: "",
      dependentDOB: "",
      dependentGender: "",
      dependentName: "",
      dependentShaMemberId: "",
      dependentShaNumber: "",
    },
    onSubmit: (values, { setSubmitting }) => {
      handleSubmit();
      setSubmitting(false);
    },
  });
  const allSelected =
    diagnosisList &&
    diagnosisList?.length > 0 &&
    formik.values?.diagnosis?.length === diagnosisList?.length;
  const icon = <CheckBoxOutlineBlankOutlinedIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const [memberBasic, setMemberBasic] = React.useState({
    id: "",
    name: "",
    policyNumber: "",
    age: "",
    relations: "",
    relation: "",
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
    dependentRelations: "",
    dependentDOB: "",
    dependentGender: "",
    dependentName: "",
    dependentShaMemberId: "",
    dependentShaNumber: "",
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
    dependentRelations: "",
    dependentDOB: "",
    dependentGender: "",
    dependentName: "",
    dependentShaMemberId: "",
    dependentShaNumber: "",
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
      codeStandard: "ICD",
      interventionCode: "",
      diagnosis: "",
      decisionId: "",
    },
  ]);

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
      setBenefits(result);
    });
  };

  const getIntervemntions = (data, i) => {
    let bts$ = benefitService.getBenefitInterventions(data.benefitStructureId);
    bts$.subscribe((result) => {
      let temp = [];
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

  useObservable1(ps$, setProviderList);

  const handleClosed = () => {
    setOpenClientModal(false);
  };

  const handleChange = (event) => {
    setSearchType(event.target.value);
  };

  const handleopenClientModal = () => {
    setOpenClientModal(true);
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
        codeStandard: "ICD",
        interventionCode: null,
        diagnosis: null,
      },
    ]);
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
    e.preventDefault();
    const promises = serviceDetailsList.map((obj) => {
      let { code } = obj?.interventionCode;
      return handleValidation(code, obj?.benefitId);
    });
    try {
      const results = await Promise.all(promises);
      let listServiceDetails = serviceDetailsList.map((item, index) => {
        return {
          ...item,
          decisionId: results[index],
        };
      });

      setServiceDetailsList(listServiceDetails);
      setIsLoadingValidate(false);
      setValidated(true);

      setIsLoadingValidate(false);
    } catch (error) {
      setIsLoadingValidate(false);
      setValidated(false);
    }
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
    if (searchType === "national_id") {
      pageRequest.value = id;
      pageRequest.key = "IDENTIFICATION_DOC_NUMBER";
    }
    if (searchType === "passport_number") {
      pageRequest.value = id;
      pageRequest.key = "PASSPORT_NUMBER";
    }
    if (searchType === "birth_certificate_number") {
      pageRequest.value = id;
      pageRequest.key = "BIRTH_CERTIFICATE_NUMBER";
    }

    //     national-id=22214041   display = National ID

    // passport=33445565   display = Passport

    // birth-certificate-number=31415161 display = Birth Certificate Number

    // shaMemberId
    // :
    // "CR5764836962337-9"
    // shaMemberNumber
    // :
    // "SHA5764836962337-9"

    if (searchType !== "national_id") {
      setAlertMsg(`Currently National ID search type is allowed only`);
      setOpenSnack(true);
    } else {
      memberservice.getMember(pageRequest).subscribe((res) => {
        if (res.content?.length > 0) {
          // if (searchType === "name") {
          //   setMemberName({ res });
          //   handleopenClientModal();
          // } else {
          //   formik.setFieldValue("contactNoOne", res.content[0].mobileNo);
          //   setMemberBasic({
          //     ...memberBasic,
          //     ...res?.content[0]
          //   });
          //   setShowViewDetails(true);
          //   setMemberIdentified(true);
          //   getBenefit(res.content[0].memberId, res.content[0].policyNumber);
          // }

          //logic for data avaiblable
          setIsLoading(false);
          formik.setFieldValue("contactNoOne", res.content[0].mobileNo);
          setMemberBasic({
            ...memberBasic,
            ...res?.content[0],
          });
          setShowViewDetails(true);
          setMemberIdentified(true);
          getBenefit(res.content[0].memberId, res.content[0].policyNumber);
        } else {
          // formik.setFieldValue("contactNoOne", res.content[0].mobileNo);
          // setMemberBasic({
          //   ...memberBasic,
          //   ...res?.content[0],
          // });
          // setShowViewDetails(true);
          // setMemberIdentified(true);
          // getBenefit(res.content[0].memberId, res.content[0].policyNumber);
          // setAlertMsg("This member is not registered");
          // setOpenSnack(true);

          //logic for if not available
          let pgreq = {};
          if (searchType === "national_id") {
            pgreq.nationalId = id;
          } else if (searchType === "passport_number") {
            pgreq.passport_number = id;
          } else if (searchType === "birth_certificate_number") {
            pgreq.birth_certificate_number = id;
          } else {
            pgreq = {};
          }

          retailuserservice.fetchAndSaveMemberDetails(pgreq).subscribe({
            next: (res) => {
              setTimeout(() => {
                memberservice.getMember(pageRequest).subscribe((res) => {
                  if (res.content?.length > 0) {
                    formik.setFieldValue(
                      "contactNoOne",
                      res.content[0].mobileNo
                    );
                    setMemberBasic({
                      ...memberBasic,
                      ...res?.content[0],
                    });
                    setShowViewDetails(true);
                    setMemberIdentified(true);
                    getBenefit(
                      res.content[0].memberId,
                      res.content[0].policyNumber
                    );
                  } else {
                    setAlertMsg("This member is not registered!!!");
                    setOpenSnack(true)
                  }
                  setIsLoading(false);
                });
              }, 1000 * 45);
            },
            error: (error) => {
              console.error("Error fetching member details:", error);
            },
          });
        }
        // setIsLoading(false);
      });
    }
  };

  useEffect(() => {
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
  }, []);

  const handleSelect = (data) => {
    formik.setFieldValue("contactNoOne", data.mobileNo);
    setMemberBasic({
      ...memberBasic,
      ...data,
      // name: data.name,
      // age: data.age,
      // gender: data.gender,
      // membershipNo: data.membershipNo,
      // memberId: data.memberId,
      // relations: data.relations,
      // policyNumber: data.policyNumber,
      // enrolentToDate: new Date(data.policyEndDate),
      // enrolmentFromDate: new Date(data.policyStartDate),
      // planName: data.planName,
      // planScheme: data.planScheme,
      // productName: data.productName,
      // active: data.active,
      // dateOfBirth: data.dateOfBirth,
      // mobileNo: data.mobileNo,
      // nationalDocId: data.identificationDocNumber,
      // email: data.email,
    });
    setShowViewDetails(true);
    getBenefit(data?.memberId, data?.policyNumber);
    handleClosed();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const serviceDetailListModify = [...serviceDetailsList];
    serviceDetailListModify[0].interventionCode =
      serviceDetailListModify[0]?.interventionCode?.value;

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
      preAuthType: "IPD",
    };

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
    } else {
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

  const handleDependentDOB = (date) => {
    setSelectedDOA(date);
    const timestamp = new Date(date).getTime();
    formik.setFieldValue("dependentDOB", timestamp);
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
    const list = [...serviceDetailsList];
    list[index].benefitId = e.benefitStructureId ? e.benefitStructureId : "";
    setServiceDetailsList(list);
  };

  const handleChangeIntervention = (e, index) => {
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
    const list = [...serviceDetailsList];
    list[index][name] = value;
    setServiceDetailsList(list);
  };

  const matchResult = (result) => {};

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
          return data == val?.value;
        }
      );

      if (serviceDetailsListIntValid) {
        throw new Error("Intervention Should Be Different !!");
      }
    }

    handleChangeIntervention(val, i);
  };

  const serviceSection = useMemo(
    () => (x, i) => {
      return (
        <>
          <Grid item xs={12} sm={6} md={1}>
            <FormControl style={{ width: "100%" }}>
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
                <MenuItem value="ICD">ICD</MenuItem>
                <MenuItem value="SHA">SHA</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.formControl} fullWidth>
              <Autocomplete
                name="intervention"
                value={
                  serviceDetailsList[i].interventionCode
                    ? serviceDetailsList[i].interventionCode?.label
                    : null
                }
                onChange={(e, val) => {
                  getServices(val, i);
                  handleInterventionValidation(val, i);
                }}
                id="checkboxes-tags-demo"
                options={intervention}
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
              // alignItems: "flex-end",
              // marginBottom: "8px",
            }}
          >
            <FormControl className={classes.formControl} fullWidth>
              <Autocomplete
                name="diagnosis"
                value={
                  serviceDetailsList[i].diagnosis
                    ? serviceDetailsList[i].diagnosis?.label
                    : null
                }
                onChange={(e, val) => {
                  handleChangeDiagnosis(val, i);
                }}
                id="checkboxes-tags-demo"
                options={serviceList}
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
            <Box>
              <TextField
                id="standard-basic"
                type="number"
                name="estimatedCost"
                variant="standard"
                value={x?.estimatedCost}
                onChange={(e) => handleEstimateCostInService(e, i)}
                label="Estimated Cost"
              />
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                Sha Approved Amount : 0
              </span>
            </Box>
          </Grid>
        </>
      );
    },
    [intervention, serviceList, serviceDetailsList]
  );
  const [memberIdentified, setMemberIdentified] = useState(false);
  const [contributionPaid, setContributionPaid] = useState(false);
  const [biometricInitiated, setBiometricInitiated] = useState(false);
  const [biometricResponseId, setbiometricResponseId] = useState("");
  const [bioMetricStatus, setBioMetricStatus] = useState("");
  const [contributionResponseId, setContributionResponseId] = useState("");

  const handleCheckStatus = () => {
    memberservice.biometricStatus(biometricResponseId).subscribe((data) => {

      if (data.status === "SUCCESS" && data?.result === "no_match") {
        setBioMetricStatus("FAILED");
        return;
      }

      setBioMetricStatus(data?.status);
    });
  };

  const handleInitiate = () => {
    if (searchType !== "national_id") {
      setAlertMsg(`Biometric validation works with National ID only`);
      setOpenSnack(true);
      return;
    }
    if (!formik.values.memberShipNo) {
      setAlertMsg(`Please enter a valid National ID`);
      setOpenSnack(true);
      return;
    }
    setBiometricInitiated(true);
    const payload = {
      subject_id_number: formik.values.memberShipNo,
      // subject_id_number: "26263348",
      // subject_id_number: "31746114",  //DO NOT REMOVE
      // relying_party_agent_id_number: "27759855",
      relying_party_agent_id_number: "P6592234",
      notification_callback_url:
        "https://shaapi.eo2cloud.com/member-command-service/v1/public/sha-member/biometric/callback",
      reason: "reason for creating the request",
      total_attempts: 5,
      expiry_in_seconds: 3600,
      service_id: "medical-care",
    };
    memberservice.initiateBiometric(payload).subscribe((data) => {
      setbiometricResponseId(data.id);
    });
  };

  const handleContributionInitiate = () => {
    memberservice
      .initiateContribution(
        memberBasic?.memberId,
        memberBasic?.identificationDocNumber
      )
      .subscribe((data) => {
        setContributionPaid(true);
        setContributionResponseId(data.id);
      });
  };
  useEffect(() => {
    setMemberIdentified(false);
    setContributionPaid(false);
    setBiometricInitiated(false);
    setbiometricResponseId("");
    setBioMetricStatus("");
  }, [searchType]);

  
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

          {/* <form> */}
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
                <MenuItem value="national_id">National ID</MenuItem>
                <MenuItem value="passport_number">Passport Number</MenuItem>
                <MenuItem value="birth_certificate_number">
                  Birth Certificate Number
                </MenuItem>
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
                    setMemberBasic({});
                    setMemberIdentified(false);
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
                      <Button onClick={handleClosed} className="p-button-text">
                        Cancel
                      </Button>
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
                id={memberBasic.memberId}
                membershipNo={memberBasic.membershipNo}
              />
            }
            {/* temporary hidden */}
            {/* {
                <Grid item style={{ display: "flex" }}>
                  <IconButton
                    onClick={() => setBioModalopen(true)}
                    // size="large"
                    aria-label="fingerprint"
                    color="primary"
                  >
                    <Fingerprint sx={{ width: "2rem", height: "2rem" }} />
                  </IconButton>
                </Grid>
              } */}
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: "20px" }}>
            <Grid item xs={12} container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    position: "relative",
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    height: "60px",
                  }}
                >
                  <Typography variant="subtitle1">
                    Member Identification
                  </Typography>
                  {memberIdentified ? (
                    <CheckCircle
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "green",
                      }}
                    />
                  ) : (
                    <ErrorIcon
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "red",
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    position: "relative",
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    height: "60px",
                  }}
                >
                  <Grid container alignItems="center">
                    <Typography
                      variant="subtitle1"
                      style={{ marginRight: "12px" }}
                    >
                      Member Biometric
                    </Typography>
                    {!bioMetricStatus ? (
                      <ErrorIcon
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "red",
                        }}
                      />
                    ) : null}
                    {!bioMetricStatus ? (
                      biometricInitiated && biometricResponseId ? (
                        <Button
                          label="Check status"
                          severity="help"
                          text
                          onClick={handleCheckStatus}
                        />
                      ) : (
                        <Button
                          label="Initiate"
                          severity="help"
                          text
                          onClick={handleInitiate}
                        />
                      )
                    ) : bioMetricStatus === "IN_PROGRESS" || "FAILED" ? (
                      <Button
                        label="Check status"
                        severity="help"
                        text
                        onClick={handleCheckStatus}
                      />
                    ) : null}

                    {bioMetricStatus === "IN_PROGRESS" ? (
                      <PunchClock
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "orange",
                        }}
                      />
                    ) : bioMetricStatus === "SUCCESS" ? (
                      <CheckCircle
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "green",
                        }}
                      />
                    ) : bioMetricStatus === "FAILED" ? (
                      <CancelOutlined
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "red",
                        }}
                      />
                    ) : !bioMetricStatus && biometricInitiated ? (
                      <MultipleStopIcon
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "red",
                        }}
                      />
                    ) : null}
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    position: "relative",
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    height: "60px",
                    display: "flex",
                  }}
                >
                  <Typography variant="subtitle1">
                    Member Contribution
                  </Typography>
                  {contributionPaid ? (
                    <CheckCircle
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "green",
                      }}
                    />
                  ) : (
                    <ErrorIcon
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "red",
                      }}
                    />
                  )}
                  {!contributionPaid &&
                    memberBasic?.memberId &&
                    memberBasic?.identificationDocNumber && (
                      <Button
                        label="Initiate"
                        severity="help"
                        text
                        onClick={handleContributionInitiate}
                      />
                    )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid container spacing={3} style={{ marginBottom: "20px" }}>
            <Grid item xs={12}>
              <Typography
                style={{
                  color: "#4472C4",
                  fontSize: "14px",
                  marginBottom: "10px",
                  marginTop: "10px",
                }}
              >
                BASIC DETAILS
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" flexDirection="column" marginLeft="10%">
                <Box display="flex" alignItems="center">
                  <Typography className={classes.TypographyStyle1}>
                    Name
                  </Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography className={classes.TypographyStyle2}>
                    {memberBasic?.name}
                    {showViewDetails && (
                      <a
                        style={{ color: "#4472C4", cursor: "pointer" }}
                        onClick={viewUserDetails}
                      >
                        &nbsp;(View Details)
                      </a>
                    )}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" marginTop="10px">
                  <Typography className={classes.TypographyStyle1}>
                    Member ID
                  </Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography className={classes.TypographyStyle2}>
                    {memberBasic.shaMemberId}
                  </Typography>
                </Box>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography className={classes.TypographyStyle1}>
                  DOB
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography className={classes.TypographyStyle2}>
                  {memberBasic?.dateOfBirth &&
                    moment(memberBasic?.dateOfBirth).format("DD/MM/YYYY")}{" "}
                  (Age: {memberBasic?.age})
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography className={classes.TypographyStyle1}>
                  Coverage period
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography className={classes.TypographyStyle2}>
                  {memberBasic?.policyStartDate &&
                    moment(memberBasic?.policyStartDate).format(
                      "DD/MM/YYYY"
                    )}{" "}
                  -{" "}
                  {memberBasic?.policyEndDate &&
                    moment(memberBasic?.policyEndDate).format("DD/MM/YYYY")}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" flexDirection="column" marginLeft="10%">
                <Box display="flex" alignItems="center">
                  <Typography className={classes.TypographyStyle1}>
                    National Id
                  </Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography className={classes.TypographyStyle2}>
                    {memberBasic?.identificationDocType === "NationalId" &&
                      memberBasic?.identificationDocNumber}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" marginTop="10px">
                  <Typography className={classes.TypographyStyle1}>
                    Household No
                  </Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography className={classes.TypographyStyle2}>
                    {memberBasic.employeeId}
                  </Typography>
                </Box>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography className={classes.TypographyStyle1}>
                  gender
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography className={classes.TypographyStyle2}>
                  {memberBasic?.gender}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography className={classes.TypographyStyle1}>
                  Contact No
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography className={classes.TypographyStyle2}>
                  {memberBasic?.mobileNo}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" flexDirection="column" marginLeft="10%">
                <Box display="flex" alignItems="center">
                  <Typography className={classes.TypographyStyle1}>
                    SHA No
                  </Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography className={classes.TypographyStyle2}>
                    {memberBasic?.shaMemberNumber}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" marginTop="10px">
                  <Typography className={classes.TypographyStyle1}>
                    Status
                  </Typography>
                  &nbsp;
                  <span>:</span>
                  &nbsp;
                  <Typography className={classes.TypographyStyle2}>
                    {memberBasic?.active === true ? (
                      <Button
                        style={{
                          background: "green",
                          color: "#fff",
                          padding: "0px",
                          margin: "5px",
                          height: "19px",
                          borderRadius: "5px",
                        }}
                      >
                        Active
                      </Button>
                    ) : (
                      <Button
                        style={{
                          background: "red",
                          color: "#fff",
                          padding: "2px",
                          margin: "0px",
                          height: "18px",
                        }}
                      >
                        InActive
                      </Button>
                    )}
                  </Typography>
                </Box>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography className={classes.TypographyStyle1}>
                  Relation
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography className={classes.TypographyStyle2}>
                  {memberBasic?.relations}
                </Typography>
              </Box>
              <Box display={"flex"} marginLeft={"10%"} marginY={"10px"}>
                <Typography className={classes.TypographyStyle1}>
                  Email
                </Typography>
                &nbsp;
                <span>:</span>&nbsp;
                <Typography className={classes.TypographyStyle2}>
                  {memberBasic?.email}
                </Typography>
              </Box>
            </Grid>

            {/* <Grid
              item
              xs={12}
              sm={6}
              md={3}
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
            </Grid> */}

            {/* <Grid item xs={12} sm={6} md={3}>
              <TextField
                id="standard-basic"
                name="ShaNumber"
                disabled
                variant="standard"
                value={memberBasic.ShaNumber}
                label="SHA Number"
                InputProps={{
                  classes: {
                    root: classes.inputRoot,
                    disabled: classes.disabled,
                  },
                }}
              />
            </Grid> */}
            {/* <Grid item xs={12} sm={6} md={3}>
              <TextField
                id="standard-multiline-flexible"
                variant="standard"
                name="shaMemberId"
                value={memberBasic.shaMemberId}
                label="Member ID"
                readonly
                disabled
              />
            </Grid> */}
            {/* <Grid item xs={12} sm={6} md={3}>
              <TextField
                id="standard-multiline-flexible"
                variant="standard"
                name="employeeId"
                value={memberBasic.employeeId}
                label="Household Id"
                readonly
                disabled
              />
            </Grid> */}
          </Grid>

          {/* <Grid container spacing={3} style={{ marginBottom: "20px" }}>
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
            </Grid>
          </Grid> */}
          {/* <Grid container spacing={3} style={{ marginBottom: "20px" }}>
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
            </Grid>
          </Grid> */}

          {/* <Grid item xs={12} sm={6} md={4} style={{ marginTop: "20px" }}>
            <span style={{ color: "#4472C4", fontWeight: "bold" }}>
              DEPENDENT DETAILS
            </span>
          </Grid>
          <Grid item xs={12} sm={12} md={12} style={{ marginBottom: "25px" }}>
            <Divider />
          </Grid>

          <Grid container spacing={3} style={{ marginBottom: "20px" }}>
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <TextField
                id="standard-basic"
                name="dependentName"
                variant="standard"
                value={formik.values.dependentName}
                onChange={formik.handleChange}
                label="Name"
                InputProps={{
                  classes: {
                    root: classes.inputRoot,
                    disabled: classes.disabled,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                id="standard-basic"
                name="dependentShaNumber"
                variant="standard"
                value={formik.values.dependentShaNumber}
                onChange={formik.handleChange}
                label="SHA Number"
                InputProps={{
                  classes: {
                    root: classes.inputRoot,
                    disabled: classes.disabled,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                id="standard-multiline-flexible"
                variant="standard"
                name="dependentShaMemberId"
                value={formik.values.dependentShaMemberId}
                onChange={formik.handleChange}
                label="Member ID"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} style={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={6} md={3}>
              <InputLabel
                id="demo-simple-select-label"
                style={{ marginBottom: "0px" }}
              >
                Gender
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                name="dependentGender"
                variant="standard"
                fullWidth
                value={formik.values.dependentGender}
                onChange={formik.handleChange}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  margin="normal"
                  id="date-picker-inline"
                  label="DOB"
                  autoOk={true}
                  value={dayjs(formik.values.dependentDOB)}
                  onChange={handleDependentDOB}
                  KeyboardButtonProps={{
                    "aria-label": "change ing date",
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                id="standard-basic"
                name="relation"
                value={formik.values.dependentRelations}
                variant="standard"
                onChange={formik.handleChange}
                label="Relation"
                InputProps={{
                  classes: {
                    root: classes.inputRoot,
                    disabled: classes.disabled,
                  },
                }}
              />
            </Grid> */}
          {/* </Grid> */}

          <Grid item xs={12}>
            <Typography
              style={{
                color: "#4472C4",
                fontSize: "14px",
                marginBottom: "10px",
                marginTop: "10px",
              }}
            >
              PRE-AUTH DETAILS
            </Typography>
            <Divider />
          </Grid>

          <Grid
            container
            spacing={3}
            style={{ marginTop: "20px", marginBottom: "20px" }}
          >
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
            </Grid>
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={3}>
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
          </Grid>

          {serviceDetailsList?.map((x, i) => {
            return (
              <Grid container spacing={3} key={i}>
                <Grid item xs={12} sm={12} md={12}>
                  <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl className={classes.formControl} fullWidth>
                        <Autocomplete
                          name="benefitId"
                          defaultValue={
                            x?.benefitStructureId ? x?.benefitStructureId : null
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
                          getOptionLabel={(option) =>
                            option.label ??
                            benefitOptions.find(
                              (benefit) => benefit?.value == option
                            )?.label
                          }
                          getOptionSelected={(option, value) =>
                            option?.value === value
                          }
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

          <Grid item xs={12} className={classes.actionContainer}>
            <Button
              variant="contained"
              color="primary"
              type="button"
              style={{
                minWidth: "70px",
                border: "none",
                textAlign: "center",
                justifyContent: "center",
                display: "none",
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
              // type="submit"
              onClick={(e) => {
                handleSubmit(e);
              }}
              style={{ marginLeft: "10px" }}
              className={classes.buttonPrimary}
            >
              Save and Next
            </Button>
            <Button
              className={`p-button-text ${classes.saveBtn}`}
              style={{ marginLeft: "10px" }}
              variant="contained"
            >
              Close
            </Button>
          </Grid>
          {/* </form> */}
        </Box>
      </Paper>
    </>
  );
}
