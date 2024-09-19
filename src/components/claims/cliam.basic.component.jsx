import { forkJoin } from "rxjs";
import {
  ClaimService,
  PreAuthService,
} from "../../remote-api/api/claim-services";
import { BenefitService } from "../../remote-api/api/master-services/benefit-service";
import { ServiceTypeService } from "../../remote-api/api/master-services/service-type-service";
import { MemberService } from "../../remote-api/api/member-services";
import { ProvidersService } from "../../remote-api/api/provider-services";
import { makeStyles } from "@mui/styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import React, { useEffect } from "react";
import { useFormik } from "formik";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { CurrencyService } from "../../remote-api/api/master-services/currency.service";
import InvoiceDetailsModal from "./modals/invoice-details.modal.component";
import SliderComponent from "./slider.component";

const claimpreauthservice = new PreAuthService();
const benefitService = new BenefitService();
const providerService = new ProvidersService();
const serviceDiagnosis = new ServiceTypeService();
const reimbursementService = new ClaimService();
const currencyservice = new CurrencyService();
const memberservice = new MemberService();

let bts$ = benefitService.getAllBenefit({ page: 0, size: 1000 });
let ps$ = providerService.getProviders();
let cs$ = currencyservice.getCurrencies();
let ad$ = serviceDiagnosis.getServicesbyId("867854874246590464", {
  page: 0,
  size: 1000,
  summary: true,
  active: true,
  nonGroupedServices: false,
});

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
  buttonDanger: {
    backgroundColor: "#dc3545",
    color: "#f1f1f1",
  },
}));

function useQuery1() {
  return new URLSearchParams(useLocation().search);
}

export default function ClaimsBasicComponent(props) {
  const query = useQuery1();
  const providerId = localStorage.getItem("providerId");
  const { id } = useParams();
  const navigate = useNavigate();
  const classes = useStyles();
  const [selectedDOD, setSelectedDOD] = React.useState(new Date());
  const [selectedDOA, setSelectedDOA] = React.useState(new Date());
  const [selectedReceiveDate, setSelectedReceiveDate] = React.useState(
    new Date()
  );
  const [selectedServiceDate, setSelectedServiceDate] = React.useState(
    new Date()
  );
  const [currencyList, setCurrencyList] = React.useState([]);
  const [disableAllFields, setDisableAllFields] = React.useState(false);
  const [benefits, setBenefits] = React.useState([]);
  const [diagnosisList, setDiagnosisList] = React.useState([]);
  const [otherTypeList, setOtherTypeList] = React.useState([]);
  const [hasDoc, setHasDoc] = React.useState(false);
  const [isInvoiceDetailModal, setInvoiceDetailModal] = React.useState(false);
  const [selectedInvoiceItems, setSelectedInvoiceItems] = React.useState([]);
  const [selectedInvoiceItemIndex, setSelectedInvoiceItemIndex] =
    React.useState(0);
  const [alertMsg, alert] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [openSnack, setOpenSnack] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [benefitOptions, setBenefitOptions] = React.useState([]);
  const [slideDocs, setSlideDocs] = React.useState(
    {
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
      url: "https://i.picsum.photos/id/871/536/354.jpg?hmac=qo4tHTSoxyMyagkIxVbpDCr80KoK2eb_-0rpAZojojg",
    }
  );
  const [documentList, setDocumentList] = React.useState([
    {
      documentType: "",
      docFormat: "image/jpeg",
      documentName: "",
      document: props.imgF,
      imgLink: "",
    },
  ]);

  const formik = useFormik({
    initialValues: {
      name: "",
      type: "",
      claimType: "REIMBURSEMENT_CLAIM",
      reimbursementStatus: null,
      calculationStatus: null,
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
      daycare: false,
      diagnosis: [],
      primaryDigonesisId: "",
      expectedDOD: "",
      expectedDOA: "",
      estimatedCost: "",
      referalTicketRequired: "",
      contactNoOne: "",
      contactNoTwo: "",
      treatmentDepartment: "",
      receiveDate: "",
      serviceDate: "",
    },
    onSubmit: (values) => {
      handleSubmit();
    },
  });
  const allSelected =
    diagnosisList &&
    diagnosisList.length > 0 &&
    formik.values.diagnosis &&
    formik.values.diagnosis.length === diagnosisList.length;

  const [memberBasic, setMemberBasic] = React.useState({
    name: "",
    policyNumber: "",
    age: "",
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
  });
  const [searchType, setSearchType] = React.useState("MEMBERSHIP_NO");
  const [openClientModal, setOpenClientModal] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState("");
  const [selectSpecId, setSelectedSpecId] = React.useState("");
  const [invoiceData, setInvoiceData] = React.useState();
  const [providerDetailsList, setProviderDetailsList] = React.useState([
    {
      providerId: "",
      estimatedCost: "",
    },
  ]);
  const [benefitsWithCost, setBenefitsWithCost] = React.useState([
    {
      benefitId: "",
      estimatedCost: 0,
    },
  ]);
  const [invoiceDetailsList, setInvoiceDetailsList] = React.useState([
    {
      provideId: providerId,
      invoiceNo: "",
      invoiceDate: 0,
      invoiceDateVal: new Date(),
      invoiceAmount: 0,
      currency: "",
      exchangeRate: 0,
      invoiceAmountKSH: 0,
      transactionNo: "",
      payee: "",
      invoiceItems: [
        {
          serviceType: "",
          expenseHead: "",
          rateKsh: 0,
          unit: 0,
          totalKsh: 0,
          finalTotal: 0,
        },
      ],
    },
  ]);

  const useObservable = (observable, setter) => {
    useEffect(() => {
      let subscription = observable.subscribe((result) => {
        setter(result.content);
      });
      return () => subscription.unsubscribe();
    }, [observable, setter]);
  };

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

  useObservable(cs$, setCurrencyList);
  // useObservable(bts$, setBenefits);
  // useObservable(bts$, setOtherTypeList); //query/
  useObservable3(ad$, setDiagnosisList);

  const getBenefit = (id, policyNo) => {
    let bts$ = benefitService.getAllBenefitWithChild({
      page: 0,
      size: 1000,
      memberId: id,
      policyNumber: policyNo,
      claimType: 'IPD',
    });
    bts$.subscribe(result => {
      setBenefits(result);
    });
  };

  useEffect(() => {
    let membershipNo = query.get("membershipNo");
    if (membershipNo) {
      formik.setFieldValue("memberShipNo", membershipNo);
      populateMember(membershipNo);
    }
  }, []);

  React.useEffect(() => {
    if (id) {
      populateStepOne(id);
    }
  }, [id]);

  React.useEffect(() => {
    if (localStorage.getItem("claimreimid")) {
      if (query.get("mode") === "edit")
        populateStepOne(localStorage.getItem("claimreimid"));
    }
  }, [localStorage.getItem("claimreimid")]);

  React.useEffect(() => {
    if (props.preauthData !== "" && props.preauthData) {
      populateFromPreAuth(props.preauthData);
      setDisableAllFields(true);
    }
  }, [props.preauthData]);

  const populateFromPreAuth = (res) => {
    formik.setValues({
      memberShipNo: res.memberShipNo,
      expectedDOA: res.expectedDOA,
      expectedDOD: res.expectedDOD,
      receiveDate: res.receiveDate,
      serviceDate: res.serviceDate,
      daycare: res.daycare,
      contactNoOne: res.contactNoOne,
      contactNoTwo: res.contactNoTwo,
    });

    setSelectedDOD(new Date(res.expectedDOD));
    setSelectedDOA(new Date(res.expectedDOA));
    setSelectedReceiveDate(new Date(res.receiveDate));
    setSelectedServiceDate(new Date(res.serviceDate));
    res.benefitsWithCost.forEach((bf) => {
      bf.estimatedCost = bf.maxApprovedCost;
    });
    setBenefitsWithCost(res.benefitsWithCost);
    let inv = [];
    const processedProviderIds = new Set();
    res.benefitsWithCost &&
      res.benefitsWithCost
        .filter(item => {
          if (processedProviderIds.has(item.providerId)) {
            return false; // Skip this item if providerId has already been processed
          }
          processedProviderIds.add(item.providerId); // Mark providerId as processed
          return true;
        })
        .forEach(el => {
          let obj = {
            ...el,
            invoiceNo: '',
            invoiceDate: 0,
            invoiceDateVal: new Date(),
            invoiceAmount: el.estimatedCost,
            currency: '',
            exchangeRate: 0,
            invoiceAmountKES: 0,
            transactionNo: '',
            payee: '',
            invoiceItems: [
              {
                serviceType: '',
                expenseHead: '',
                rateKes: 0,
                unit: 0,
                totalKes: 0,
                finalTotal: 0,
              },
            ],
          };
          inv.push(obj);
        });
    setInvoiceDetailsList(inv);
    // let prArr = [];
    // res?.providers?.forEach((pr) => {
    //   prArr.push({
    //     provideId: pr.providerId,
    //     invoiceNo: "",
    //     invoiceDate: 0,
    //     invoiceDateVal: new Date(),
    //     invoiceAmount: pr.estimatedCost,
    //     currency: "",
    //     exchangeRate: 0,
    //     invoiceAmountKSH: 0,
    //     transactionNo: "",
    //     payee: "",
    //     invoiceItems: [
    //       {
    //         serviceType: "",
    //         expenseHead: "",
    //         rateKsh: 0,
    //         unit: 0,
    //         totalKsh: 0,
    //         finalTotal: 0,
    //       },
    //     ],
    //   });
    // });
    // if (prArr.length > 0) {
    //   setInvoiceDetailsList(prArr);
    // }
    getMemberDetails(res.memberShipNo);
    if (res.documents.length !== 0) {
      setSlideDocs(res.documents);
      setHasDoc(true);
    }
    if (res.diagnosis && res.diagnosis.length !== 0) {
      setDiagnosisdata(res.diagnosis);
    }
  };

  const loadPreAuthDocs = (pid) => {
    if (pid) {
      claimpreauthservice.getPreAuthById(pid, providerId).subscribe((res) => {
        if (res.documents.length !== 0) {
          setSlideDocs(...slideDocs, ...res.documents);
          setHasDoc(true);
        }
      });
    }
  };

  const handleInputChangeBenefitWithCost = (e, index) => {
    const { name, value } = e.target;
    const list = [...benefitsWithCost];
    list[index][name] = value;
    setBenefitsWithCost(list);
  };

  const handleRemoveClaimCost = (index) => {
    const list = [...benefitsWithCost];
    list.splice(index, 1);
    setBenefitsWithCost(list);
  };

  const handleAddClaimCost = () => {
    setBenefitsWithCost([
      ...benefitsWithCost,
      { benefitId: "", otherType: "", estimatedCost: 0 },
    ]);
  };

  const handleClose = () => {
    localStorage.removeItem("claimreimid");
    navigate("/claims");
  };

  const handleAddInvoiceItems = (i,x) => {
    setSelectedInvoiceItems(invoiceDetailsList[i].invoiceItems);
    setSelectedInvoiceItemIndex(i);
    setInvoiceData(x);
    setInvoiceDetailModal(true);
  };

  const changeInvoiceItems = (e, i, j) => {
    const { name, value } = e.target;
    const list = [...invoiceDetailsList];
    list[i].invoiceItems[j][name] = value;
    if (name === "unit" || name === "rateKsh") {
      list[i].invoiceItems[j]["totalKsh"] =
        Number(list[i].invoiceItems[j]["unit"]) *
        Number(list[i].invoiceItems[j]["rateKsh"]);
    }
    setInvoiceDetailsList(list);
  };

  useEffect(() => {
    let temp = [];
    let X = benefits?.forEach((ele) => {
      let obj = {
        label: ele.code + " | " + ele.name,
        name: ele.code + " | " + ele.name,
        value: ele.id,
      };
      temp.push(obj);
    });
    setBenefitOptions(temp);
  }, [benefits]);

  const handleBenefitChange = (e, val) => {
    setBenefitsWithCost((prevData) => [
      { ...prevData[0], benefitId: val?.value },
      ...prevData.slice(1),
    ]);
  };

  const handleAddInvoiceItemRow = (i) => {
    const list = [...invoiceDetailsList];
    list[i].invoiceItems.push({
      serviceType: "",
      expenseHead: "",
      rate: 0,
      unit: 0,
      totalKsh: 0,
      finalTotal: 0,
    });
    setInvoiceDetailsList(list);
  };
  const handleDeleteInvoiceItemRow = (i, j) => {
    const list = [...invoiceDetailsList];
    list[i].invoiceItems.splice(j, 1);
    setInvoiceDetailsList(list);
  };

  const handleInputChangeService = (e, index) => {
    const { name, value } = e.target;
    const list = [...invoiceDetailsList];
    list[index][name] = value;
    if (name === "invoiceAmount" || name === "exchangeRate") {
      list[index]["invoiceAmountKSH"] =
        Number(list[index]["invoiceAmount"]) *
        Number(list[index]["exchangeRate"]);
    }
    setInvoiceDetailsList(list);
  };

  const handleRemoveServicedetails = (index) => {
    const list = [...invoiceDetailsList];
    list.splice(index, 1);
    setInvoiceDetailsList(list);
  };

  const handleAddServicedetails = () => {
    setInvoiceDetailsList([
      ...invoiceDetailsList,
      {
        provideId: "",
        invoiceNo: "",
        invoiceDate: 0,
        invoiceDateVal: new Date(),
        invoiceAmount: 0,
        currency: "",
        exchangeRate: 0,
        invoiceAmountKSH: 0,
        transactionNo: "",
        payee: "",
        invoiceItems: [
          {
            serviceType: "",
            expenseHead: "",
            rateKsh: 0,
            unit: 0,
            totalKsh: 0,
            finalTotal: 0,
          },
        ],
      },
    ]);
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
    formik.setFieldValue("PrimaryDiagnosis", selectedBenifits);
  };
  const populateStepOne = (id) => {
    reimbursementService
      .getReimbursementById(id, providerId)
      .subscribe((res) => {
        formik.setValues({
          memberShipNo: res.memberShipNo,
          expectedDOA: res.expectedDOA,
          expectedDOD: res.expectedDOD,
          receiveDate: res.receiveDate,
          serviceDate: res.serviceDate,
          diagnosis: [],
          primaryDigonesisId: res.primaryDigonesisId,
          daycare: res.daycare,
          contactNoOne: res.contactNoOne,
          contactNoTwo: res.contactNoTwo,
          reimbursementStatus: res.reimbursementStatus,
          calculationStatus: res.calculationStatus,
        });

        res.invoices.forEach((ci) => {
          ci["invoiceDateVal"] = new Date(ci.invoiceDate);
        });
        setSelectedDOD(new Date(res.expectedDOD));
        setSelectedDOA(new Date(res.expectedDOA));
        setSelectedReceiveDate(new Date(res.receiveDate));
        setSelectedServiceDate(new Date(res.serviceDate));
        setBenefitsWithCost(res.benefitsWithCost);
        if (res.invoices && res.invoices.length !== 0) {
          setInvoiceDetailsList(res.invoices);
        }
        getMemberDetails(res.memberShipNo);
        if (source === "PRE_AUTH") {
          setSlideDocs(res.documents);
          setHasDoc(true);
        }
        if (res.diagnosis && res.diagnosis.length !== 0) {
          setDiagnosisdata(res.diagnosis);
        }
        if (
          res.source &&
          res.source === "PRE_AUTH" &&
          res.reimbursementSourceId &&
          res.reimbursementSourceId !== ""
        ) {
          loadPreAuthDocs(res.reimbursementSourceId);
          setDisableAllFields(true);
        }
      });
  };

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

  const getMemberDetails = (id, policyNumber) => {
    let pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
    };
    if (searchType === "NAME") {
      pageRequest.name = id;
    }
    if (searchType === "MEMBERSHIP_NO") {
      pageRequest.value = id;
      pageRequest.key = "MEMBERSHIP_NO";
    }
    if (searchType === "national_id") {
      pageRequest.value = id;
      pageRequest.key = "IDENTIFICATION_DOC_NUMBER";
    }

    memberservice.getMember(pageRequest).subscribe((res) => {
      if (res.content?.length > 0) {
        getBenefit(res.content[0].memberId, res.content[0].policyNumber);
        if (searchType === "NAME") {
          setMemberName({ res });
          handleopenClientModal();
        } else {
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
        }
      } else {
        alert(`No Data found for ${id}`);
        setOpenSnack(true);
      }
      setIsLoading(false);
    });
  };

  const handleSubmit = () => {
    if (new Date(selectedDOA).getTime() > new Date(selectedDOD).getTime()) {
      alert("Admission date must be lower than Discharge date");
      setOpenSnack(true);
      return;
    }

    if (formik.values.contactNoOne.toString().length !== 10) {
      alert("Contact One must be of 10 digits");
      setOpenSnack(true);
      return;
    }
    if (
      formik.values.contactNoTwo !== "" &&
      formik.values.contactNoTwo.toString().length !== 10
    ) {
      alert("Contact Two must be of 10 digits");
      setOpenSnack(true);
      return;
    }

    benefitsWithCost.forEach((ele) => {
      if (ele.benefitId !== "OTHER") {
        ele.otherType = "";
      }
    });

    benefitsWithCost.forEach((ctc) => {
      ctc.estimatedCost = Number(ctc.estimatedCost);
    });
    let payload = {
      policyNumber: memberBasic.policyNumber,
      memberShipNo: memberBasic.membershipNo,
      expectedDOA: new Date(selectedDOA).getTime(),
      expectedDOD: new Date(selectedDOD).getTime(),
      receiveDate: new Date(selectedReceiveDate).getTime(),
      serviceDate: new Date(selectedServiceDate).getTime(),
      contactNoOne: formik.values.contactNoOne.toString(),
      contactNoTwo: formik.values.contactNoTwo.toString(),
      daycare: formik.values.daycare,
      primaryDigonesisId: selectSpecId,
      benefitsWithCost: benefitsWithCost,
      invoices: invoiceDetailsList,
      source: props.source,
    };
    let arr = [];
    formik.values.diagnosis &&
      formik.values.diagnosis.forEach((di) => {
        arr.push(di.id.toString());
      });
    payload["diagnosis"] = arr;

    if (props.preauthData !== "" && props.preauthData) {
      payload["source"] = "PRE_AUTH";
      payload["reimbursementSourceId"] = props.preauthData.id;
    }

    let claimreimid = localStorage.getItem("claimreimid")
      ? localStorage.getItem("claimreimid")
      : "";
    if (query.get("mode") === "edit") {
      if (claimreimid || id) {
        if (claimreimid) {
          reimbursementService
            .editReimbursement(payload, claimreimid, 1)
            .subscribe((res) => {
              props.handleNext();
            });
        }
        if (id) {
          reimbursementService
            .editReimbursement(payload, id, 1)
            .subscribe((res) => {
              props.handleNext();
            });
        }
      }
    }
    if (query.get("mode") === "create") {
      // if (!claimreimid && !id) {
      // if (query.get("preId")) {
      //   let claimreimid = `r-${query.get("preId")}`;
      //   localStorage.setItem("claimreimid", claimreimid);
      // }
      reimbursementService
        .saveReimbursement(payload, providerId)
        .subscribe((res) => {
          localStorage.setItem("claimreimid", res.id);
          props.handleNext();
        });
      // }
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
  const handleReceiveDate = (date) => {
    setSelectedReceiveDate(date);
    const timestamp = new Date(date).getTime();
    formik.setFieldValue("receiveDate", timestamp);
  };

  const handleServiceDate = (date) => {
    setSelectedServiceDate(date);
    const timestamp = new Date(date).getTime();
    formik.setFieldValue("serviceDate", timestamp);
  };

  const handleInvoiceDate = (date, i) => {
    const list = [...invoiceDetailsList];
    const timestamp = new Date(date).getTime();
    list[i]["invoiceDate"] = timestamp;
    list[i]["invoiceDateVal"] = date;

    setInvoiceDetailsList(list);
  };

  const onmemberShipNoChange = (e) => {
    formik.setFieldValue("memberShipNo", e.target.value);
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

  const populateMember = (membershipNo) => {
    getMemberDetails(membershipNo || formik.values.memberShipNo);
  };
  const handleFieldChecked = (e) => {
    const { name, checked } = e.target;
    formik.setFieldValue(name, checked);
  };

  const viewUserDetails = () => {
    setClaimModal(true);
  };

  const autocompleteFilterChange = (options, state) => {
    if (state.inputValue) {
      return options?.filter(
        (item) => item?.name?.toLowerCase().indexOf(state?.inputValue) > -1
      );
    }
    return [{ id: "selectall", name: "Select all" }, ...options];
  };

  const handleInvDetClose = () => {
    setInvoiceDetailModal(false);
    setSelectedInvoiceItems([]);
    setSelectedInvoiceItemIndex(0);
  };

  const handleChange = (event) => {
    setSearchType(event.target.value);
  };

  const onMemberShipNumberChange = (e) => {
    formik.setFieldValue("memberShipNo", e.target.value);
  };

  const handleClosed = () => {
    setOpenClientModal(false);
  };
  const handleopenClientModal = () => {
    setOpenClientModal(true);
  };

  const handleSelect = (data) => {
    setMemberBasic({
      ...memberBasic,
      name: data.name,
      age: data.age,
      gender: data.gender,
      membershipNo: data.membershipNo,
      policyNumber: data.policyNumber,
      relation: data.relations,
    });
    getBenefit(data?.memberId, data?.policyNumber);
    handleClosed();
  };
  const doSelectValue = (e, newValue) => {
    if (newValue && newValue.id) {
      const selectedDiagnosis = diagnosisList.filter(
        (item) => item.id === newValue?.id
      );
      if (selectedDiagnosis.length > 0) {
        setSelectedId(selectedDiagnosis[0]);
        setSelectedSpecId(selectedDiagnosis[0]?.id);
      }
    }
  };
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

  const handleMsgErrorClose = () => {
    setOpenSnack(false);
    alert("");
  };

  return (
    <Paper elevation="none">
      <Box p={3} my={2}>
        <InvoiceDetailsModal
          handleDeleteInvoiceItemRow={handleDeleteInvoiceItemRow}
          handleAddInvoiceItemRow={handleAddInvoiceItemRow}
          selectedInvoiceItems={selectedInvoiceItems}
          selectedInvoiceItemIndex={selectedInvoiceItemIndex}
          changeInvoiceItems={changeInvoiceItems}
          isOpen={isInvoiceDetailModal}
          onClose={handleInvDetClose}
          onSubmit={handleInvDetClose}
          benefitsWithCost={benefitsWithCost}
          benefitOptions={benefitOptions}
          invoiceData={invoiceData}
          invoiceDetailsList={invoiceDetailsList}
        />
        {/* <Snackbar open={openSnack} autoHideDuration={4000} onClose={handleMsgErrorClose}>
          <Alert onClose={handleMsgErrorClose} severity="error">
            {alertMsg}
          </Alert>
        </Snackbar> */}
        {hasDoc ? (
          <Grid container spacing={3}>
            <Grid item xs={5}>
              <SliderComponent items={slideDocs} />
            </Grid>
            <Grid item xs={7}>
              <div
                style={{
                  height: "700px",
                  overflowY: "scroll",
                  overflowX: "hidden",
                }}
              >
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={3} style={{ marginBottom: "50px" }}>
                    <TextField
                      id="standard-basic"
                      variant="standard"
                      value={formik.values.memberShipNo}
                      onChange={onmemberShipNoChange}
                      disabled={disableAllFields ? true : false}
                      name="searchCode"
                      style={{ marginLeft: "10px" }}
                      label="Membership code"
                    />
                    <Button
                      variant="contained"
                      onClick={populateMember}
                      color="primary"
                      disabled={disableAllFields ? true : false}
                      style={{
                        marginLeft: "10px",
                        marginTop: 10,
                        height: "50%",
                      }}
                    >
                      Search
                    </Button>
                  </Grid>
                  <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                    <Grid item xs={12}>
                      <span style={{ color: "#4472C4", fontWeight: "bold" }}>
                        BASIC DETAILS
                      </span>
                    </Grid>

                    <Grid
                      item
                      xs={4}
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
                      <a
                        style={{ color: "#4472C4", cursor: "pointer" }}
                        onClick={viewUserDetails}
                      >
                        View Details
                      </a>
                    </Grid>
                    <Grid item xs={4}>
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
                  </Grid>
                  <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                    <Grid item xs={4}>
                      <TextField
                        id="standard-basic"
                        name="age"
                        type="number"
                        value={memberBasic.age}
                        disabled
                        variant="standard"
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
                        value={memberBasic.relation}
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
                  </Grid>
                  <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                    <Grid item xs={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          margin="normal"
                          id="date-picker-inline"
                          label="Enrolment Date"
                          autoOk={true}
                          disabled
                          value={dayjs(memberBasic.enrolmentDate)}
                          KeyboardButtonProps={{
                            "aria-label": "change ing date",
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          margin="normal"
                          id="date-picker-inline"
                          label="Enrolment From Date"
                          autoOk={true}
                          disabled
                          value={dayjs(memberBasic.enrolmentFromDate)}
                          KeyboardButtonProps={{
                            "aria-label": "change ing date",
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          margin="normal"
                          id="date-picker-inline"
                          label="Enrolment To Date"
                          autoOk={true}
                          disabled
                          value={dayjs(memberBasic.enrolentToDate)}
                          KeyboardButtonProps={{
                            "aria-label": "change ing date",
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                  {/* <Grid
                    item
                    xs={12}
                    style={{ marginTop: "20px", marginBottom: "15px" }}
                  >
                    <Divider />
                  </Grid>
                  {benefitsWithCost?.map((x, i) => {
                    const label = benefitOptions.find(
                      (benefit) => benefit.value == x.benefitId
                    );
                    return (
                      <div style={{ marginBottom: "20px", display: "flex" }}>
                        <Grid item xs={5}>
                          <FormControl
                            className={classes.formControl}
                            fullWidth
                          >
                            <Autocomplete
                              name="benefitId"
                              value={x.benefitId}
                              inputValue={label?.label || ""}
                              onChange={handleBenefitChange}
                              id="checkboxes-tags-demo"
                              filterOptions={autocompleteFilterChange}
                              options={benefitOptions}
                              getOptionLabel={(option) =>
                                option.label ??
                                benefitOptions?.find(
                                  (benefit) => benefit?.value == option
                                )?.label
                              }
                              getOptionSelected={(option, value) =>
                                option?.value === value
                              }
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
                                id="demo-simple-select"
                                name="other"
                                variant="standard"
                                value={x.otherType}
                                disabled={disableAllFields ? true : false}
                                onChange={(e) =>
                                  handleInputChangeBenefitWithCost(e, i)
                                }
                              >
                                {otherTypeList.map((ele) => {
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
                        <Grid item xs={3}>
                          <TextField
                            id="standard-basic"
                            type="number"
                            name="estimatedCost"
                            variant="standard"
                            disabled={disableAllFields ? true : false}
                            value={x.estimatedCost}
                            onChange={(e) =>
                              handleInputChangeBenefitWithCost(e, i)
                            }
                            label="Cost"
                          />
                        </Grid>

                        <Grid
                          item
                          xs={2}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {benefitsWithCost.length !== 1 && (
                            <Button
                              className={`mr10 p-button-danger ${classes.buttonDanger}`}
                              onClick={() => handleRemoveClaimCost(i)}
                              variant="contained"
                              // color="secondary"
                              disabled={disableAllFields ? true : false}
                              style={{
                                marginLeft: "5px",
                                background: "#dc3545",
                                color: "#f1f1f1",
                              }}
                            >
                              <DeleteIcon />
                            </Button>
                          )}
                          {benefitsWithCost.length - 1 === i && (
                            <Button
                              variant="contained"
                              color="primary"
                              disabled={disableAllFields ? true : false}
                              style={{ marginLeft: "5px" }}
                              onClick={handleAddClaimCost}
                            >
                              <AddIcon />
                            </Button>
                          )}
                        </Grid>
                      </div>
                    );
                  })} */}

                  <Grid
                    item
                    xs={12}
                    style={{ marginTop: "20px", marginBottom: "15px" }}
                  >
                    <Divider />
                  </Grid>
                  <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                    <Grid item xs={4}>
                      <FormControl className={classes.formControl}>
                        <InputLabel
                          id="demo-simple-select-label"
                          style={{ marginBottom: "0px" }}
                        >
                          Treatment Department
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          name="treatmentDepartment"
                          variant="standard"
                          value={formik.treatmentDepartment}
                          // disabled={disableAllFields ? true : false}
                          onChange={formik.handleChange}
                        >
                          <MenuItem value="OPD">OPD</MenuItem>
                          <MenuItem value="IPD">IPD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          margin="normal"
                          id="date-picker-inline"
                          label="Receive Date"
                          autoOk={true}
                          disabled={disableAllFields ? true : false}
                          value={dayjs(selectedReceiveDate)}
                          onChange={handleReceiveDate}
                          KeyboardButtonProps={{
                            "aria-label": "change ing date",
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={4}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          margin="normal"
                          id="date-picker-inline"
                          label="Service Date"
                          autoOk={true}
                          disabled={disableAllFields ? true : false}
                          value={dayjs(selectedServiceDate)}
                          onChange={handleServiceDate}
                          KeyboardButtonProps={{
                            "aria-label": "change ing date",
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                    <Grid item xs={3}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          margin="normal"
                          id="date-picker-inline"
                          label="DOA"
                          autoOk={true}
                          disabled={disableAllFields ? true : false}
                          value={dayjs(selectedDOA)}
                          onChange={handleDOA}
                          KeyboardButtonProps={{
                            "aria-label": "change ing date",
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={3}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          margin="normal"
                          id="date-picker-inline"
                          label="DOA"
                          autoOk={true}
                          disabled={disableAllFields ? true : false}
                          value={dayjs(selectedDOD)}
                          onChange={handleDODDate}
                          KeyboardButtonProps={{
                            "aria-label": "change ing date",
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={3}>
                      <Autocomplete
                        className={classes.benifitAutoComplete}
                        multiple
                        value={formik.values.primaryDigonesisId}
                        onChange={handlePrimaryDiagnosisChange}
                        id="checkboxes-tags-demo"
                        filterOptions={autocompleteFilterChange}
                        options={diagnosisList}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option.diagnosisName}
                        disabled={disableAllFields ? true : false}
                        getOptionSelected={(option, value) =>
                          option.id === value.id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Primary Diagnosis"
                            placeholder="Select Diagnosis"
                            variant="standard"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={3}>
                      <Autocomplete
                        className={classes.benifitAutoComplete}
                        multiple
                        value={formik.values.diagnosis}
                        onChange={handleDiagnosisChange}
                        id="checkboxes-tags-demo"
                        filterOptions={autocompleteFilterChange}
                        options={diagnosisList}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option.diagnosisName}
                        disabled={disableAllFields ? true : false}
                        getOptionSelected={(option, value) =>
                          option.id === value.id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Other Diagnoses"
                            placeholder="Select Diagnosis"
                            variant="standard"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                    <Grid item xs={4}>
                      <TextField
                        id="standard-basic"
                        name="contactNoOne"
                        variant="standard"
                        type="number"
                        disabled={disableAllFields ? true : false}
                        value={formik.values.contactNoOne}
                        onChange={formik.handleChange}
                        label="Contact No. 1"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        id="standard-basic"
                        name="contactNoTwo"
                        type="number"
                        variant="standard"
                        disabled={disableAllFields ? true : false}
                        value={formik.values.contactNoTwo}
                        onChange={formik.handleChange}
                        label="Contact No. 2"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.daycare}
                            onChange={(e) => handleFieldChecked(e)}
                            name="daycare"
                            color="primary"
                          />
                        }
                        label="Daycare"
                      />
                    </Grid>
                  </Grid>

                  <Grid item xs={12} style={{ marginBottom: "15px" }}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} style={{ marginTop: "20px" }}>
                    <span style={{ color: "#4472C4", fontWeight: "bold" }}>
                      INVOICE DETAILS
                    </span>
                  </Grid>

                  <Grid item xs={12} style={{ marginBottom: "15px" }}>
                    <Divider />
                  </Grid>

                  {invoiceDetailsList.map((x, i) => {
                    return (
                      <>
                        <Grid container spacing={3} key={i}>
                          <Grid item xs={4}>
                            <TextField
                              id="standard-basic"
                              type="number"
                              variant="standard"
                              name="invoiceAmount"
                              value={x.invoiceAmount}
                              // disabled={disableAllFields ? true : false}
                              onChange={(e) => handleInputChangeService(e, i)}
                              label="Invoice Amount"
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              id="standard-basic"
                              variant="standard"
                              name="invoiceNo"
                              value={x.invoiceNo}
                              // disabled={disableAllFields ? true : false}
                              onChange={(e) => handleInputChangeService(e, i)}
                              label="Invoice number"
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                margin="normal"
                                id="date-picker-inline"
                                label="Invoice Date"
                                autoOk={true}
                                value={dayjs(x.invoiceDateVal)}
                                onChange={(date) => {
                                  handleInvoiceDate(date, i);
                                }}
                                KeyboardButtonProps={{
                                  "aria-label": "change ing date",
                                }}
                              />
                            </LocalizationProvider>
                          </Grid>
                          <Grid item xs={4}>
                            <FormControl className={classes.formControl}>
                              <InputLabel
                                id="demo-simple-select-label"
                                style={{ marginBottom: "0px" }}
                              >
                                Currency
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                variant="standard"
                                name="currency"
                                value={x.currency}
                                onChange={(e) => handleInputChangeService(e, i)}
                              >
                                {currencyList.map((ele) => {
                                  return (
                                    <MenuItem key={ele.id} value={ele.code}>
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
                              name="exchangeRate"
                              variant="standard"
                              value={x.exchangeRate}
                              onChange={(e) => handleInputChangeService(e, i)}
                              label="Exchange Rate"
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              id="standard-basic"
                              name="invoiceAmountKSH"
                              value={x.invoiceAmountKSH}
                              disabled
                              variant="standard"
                              onChange={(e) => handleInputChangeService(e, i)}
                              label="Invoice Amount(KSH)"
                            />
                          </Grid>

                          <Grid item xs={4}>
                            <TextField
                              id="standard-basic"
                              name="transactionNo"
                              value={x.transactionNo}
                              onChange={(e) => handleInputChangeService(e, i)}
                              label="Transaction No"
                              variant="standard"
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <FormControl className={classes.formControl}>
                              <InputLabel
                                id="demo-simple-select-label"
                                style={{ marginBottom: "0px" }}
                              >
                                Payee
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                name="payee"
                                variant="standard"
                                value={x.payee}
                                onChange={(e) => handleInputChangeService(e, i)}
                              >
                                <MenuItem value="Provider">Provider</MenuItem>
                                {/* <MenuItem value="Member">Member</MenuItem> */}
                                <MenuItem value="Intermediaries">
                                  Intermediaries
                                </MenuItem>
                                {/* <MenuItem value="Corporate">Corporate</MenuItem> */}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={5}>
                            <Button
                              variant="contained"
                              color="primary"
                              style={{ marginLeft: "5px", marginTop: "10px" }}
                              onClick={() => handleAddInvoiceItems(i, x)}
                            >
                              Add Invoice items
                            </Button>
                          </Grid>

                          <Grid
                            item
                            xs={2}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {invoiceDetailsList.length !== 1 && (
                              <Button
                                className={`mr10 p-button-danger ${classes.buttonDanger}`}
                                onClick={() => handleRemoveServicedetails(i)}
                                variant="contained"
                                disabled={disableAllFields ? true : false}
                                style={{
                                  marginLeft: "5px",
                                  background: "#dc3545",
                                  color: "#f1f1f1",
                                }}
                              >
                                <DeleteIcon />
                              </Button>
                            )}
                            {invoiceDetailsList.length - 1 === i && (
                              <Button
                                variant="contained"
                                color="primary"
                                style={{ marginLeft: "5px" }}
                                disabled={disableAllFields ? true : false}
                                onClick={handleAddServicedetails}
                              >
                                <AddIcon />
                              </Button>
                            )}
                          </Grid>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          style={{ marginBottom: "15px", marginTop: "10px" }}
                        >
                          <Divider />
                        </Grid>
                      </>
                    );
                  })}

                  {query.get("mode") !== "viewOnly" && (
                    <Grid item xs={12} className={classes.actionContainer}>
                      <Button variant="contained" color="primary" type="submit">
                        Save and Next
                      </Button>
                      <Button
                        className={`p-button-text ${classes.saveBtn}`}
                        style={{ marginLeft: "10px" }}
                        variant="text"
                        // color="primary"
                        onClick={handleClose}
                      >
                        Cancel
                      </Button>
                    </Grid>
                  )}
                </form>
              </div>
            </Grid>
          </Grid>
        ) : (
          <>
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
            <div>
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
                      <MenuItem value="MEMBERSHIP_NO">Membership No.</MenuItem>
                      <MenuItem value="NAME">Member Name</MenuItem>
                      <MenuItem value="national_id">National ID</MenuItem>
                    </Select>
                  </Grid>

                  {searchType === "national_id" && (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      style={{ display: "flex" }}
                    >
                      <TextField
                        id="standard-basic"
                        value={formik.values.memberShipNo}
                        onChange={onMemberShipNumberChange}
                        name="searchCode"
                        label="Membership Code"
                        variant="standard"
                        style={{ flex: "1", marginRight: "5px" }}
                      />

                      <Button
                        className="responsiveButton"
                        variant="contained"
                        onClick={() => {
                          setIsLoading(true);
                          populateMemberFromSearch("number");
                        }}
                        color="primary"
                        type="button"
                        style={{ borderRadius: "10px" }}
                      >
                        {isLoading ? (
                          <CircularProgress
                            sx={{
                              color: "white",
                              width: "20px",
                              height: "20px",
                            }}
                          />
                        ) : (
                          "Search"
                        )}
                      </Button>
                    </Grid>
                  )}

                  {searchType === "MEMBERSHIP_NO" && (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      style={{ display: "flex" }}
                    >
                      <TextField
                        id="standard-basic"
                        value={formik.values.memberShipNo}
                        onChange={onMemberShipNumberChange}
                        name="searchCode"
                        label="Membership Code"
                        variant="standard"
                        style={{ flex: "1", marginRight: "5px" }}
                      />

                      <Button
                        className="responsiveButton"
                        variant="contained"
                        onClick={() => {
                          setIsLoading(true);
                          populateMemberFromSearch("number");
                        }}
                        color="primary"
                        type="button"
                        style={{ borderRadius: "10px" }}
                      >
                        {isLoading ? (
                          <CircularProgress
                            sx={{
                              color: "white",
                              width: "20px",
                              height: "20px",
                            }}
                          />
                        ) : (
                          "Search"
                        )}
                      </Button>
                    </Grid>
                  )}

                  {searchType === "NAME" && (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      style={{ display: "flex" }}
                    >
                      <TextField
                        id="standard-basic"
                        value={formik.values.memberShipNo}
                        variant="standard"
                        onChange={onMemberShipNumberChange}
                        name="searchCode"
                        style={{ marginLeft: "10px", flex: "1" }} // Adjust margin and flex as needed
                        label="Member Name"
                      />

                      <Button
                        variant="contained"
                        onClick={() => {
                          setIsLoading(true);
                          populateMemberFromSearch("name");
                        }}
                        color="primary"
                        type="button"
                        style={{ marginLeft: "3%", borderRadius: "10px" }}
                      >
                        {isLoading ? (
                          <CircularProgress
                            sx={{
                              color: "white",
                              width: "20px",
                              height: "20px",
                            }}
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
                          <DialogTitle id="form-dialog-title">
                            Members
                          </DialogTitle>

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
                                    {memberName.res.content.map((item) => (
                                      <TableRow key={item.membershipNo}>
                                        <TableCell>
                                          {item.membershipNo}
                                        </TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.mobileNo}</TableCell>
                                        <TableCell>
                                          <Button
                                            onClick={() => handleSelect(item)}
                                            style={{
                                              background: "#313c96",
                                              color: "#f1f1f1",
                                            }}
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
                              color="primary"
                              variant="text"
                              className="p-button-text"
                            >
                              Cancel
                            </Button>
                          </DialogActions>
                        </Dialog>
                      )}
                    </Grid>
                  )}
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
                    <a
                      style={{ color: "#4472C4", cursor: "pointer" }}
                      onClick={viewUserDetails}
                    >
                      View Details
                    </a>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      id="standard-basic"
                      name="policyNumber"
                      variant="standard"
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
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      id="standard-multiline-flexible"
                      name="membershipNo"
                      variant="standard"
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
                      name="age"
                      type="number"
                      variant="standard"
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
                      value={memberBasic.relation}
                      variant="standard"
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
                  <Grid item xs={12} sm={6} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        margin="normal"
                        id="date-picker-inline"
                        label="Enrolment Date"
                        autoOk={true}
                        disabled
                        value={dayjs(memberBasic.enrolmentDate)}
                        KeyboardButtonProps={{
                          "aria-label": "change ing date",
                        }}
                      />
                    </LocalizationProvider>
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
                        label="Enrolment From Date"
                        autoOk={true}
                        disabled
                        value={dayjs(memberBasic.enrolmentFromDate)}
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
                        label="Enrolment To Date"
                        autoOk={true}
                        disabled
                        value={dayjs(memberBasic.enrolentToDate)}
                        KeyboardButtonProps={{
                          "aria-label": "change ing date",
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  style={{ marginTop: "20px", marginBottom: "15px" }}
                >
                  <Divider />
                </Grid>
                {benefitsWithCost?.map((x, i) => {
                  return (
                    <Grid
                      container
                      spacing={3}
                      key={i}
                      style={{ marginBottom: "20px" }}
                    >
                      <Grid item xs={4}>
                        <FormControl className={classes.formControl}>
                          <Autocomplete
                            name="benefitId"
                            defaultValue={x.benefitId}
                            value={x.benefitId}
                            onChange={handleBenefitChange}
                            id="checkboxes-tags-demo"
                            filterOptions={autocompleteFilterChange}
                            options={benefitOptions}
                            getOptionLabel={(option) =>
                              option?.label ??
                              benefitOptions?.find(
                                (benefit) => benefit?.value == option
                              )?.label
                            }
                            getOptionSelected={(option, value) =>
                              option?.value === value
                            }
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
                              id="demo-simple-select"
                              variant="standard"
                              name="other"
                              disabled={disableAllFields ? true : false}
                              value={x.otherType}
                              onChange={(e) =>
                                handleInputChangeBenefitWithCost(e, i)
                              }
                            >
                              {otherTypeList.map((ele) => {
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
                          name="estimatedCost"
                          variant="standard"
                          disabled={disableAllFields ? true : false}
                          value={x.estimatedCost}
                          onChange={(e) =>
                            handleInputChangeBenefitWithCost(e, i)
                          }
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
                            className={`mr10 p-button-danger ${classes.buttonDanger}`}
                            onClick={() => handleRemoveClaimCost(i)}
                            variant="contained"
                            disabled={disableAllFields ? true : false}
                            style={{
                              marginLeft: "5px",
                              background: "#dc3545",
                              color: "#f1f1f1",
                            }}
                          >
                            <DeleteIcon />
                          </Button>
                        )}
                        {benefitsWithCost.length - 1 === i && (
                          <Button
                            variant="contained"
                            color="primary"
                            disabled={disableAllFields ? true : false}
                            style={{ marginLeft: "5px" }}
                            onClick={handleAddClaimCost}
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
                  sm={6}
                  md={4}
                  style={{ marginTop: "20px", marginBottom: "15px" }}
                >
                  <Divider />
                </Grid>
                <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <FormControl className={classes.formControl}>
                      <InputLabel
                        id="demo-simple-select-label"
                        style={{ marginBottom: "0px" }}
                      >
                        Treatment Department
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        variant="standard"
                        name="treatmentDepartment"
                        value={formik.treatmentDepartment}
                        onChange={formik.handleChange}
                      >
                        <MenuItem value="OPD">OPD</MenuItem>
                        <MenuItem value="IPD">IPD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        margin="normal"
                        id="date-picker-inline"
                        label="Receive Date"
                        autoOk={true}
                        disabled={disableAllFields ? true : false}
                        value={dayjs(selectedReceiveDate)}
                        onChange={handleReceiveDate}
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
                        label="Service Date"
                        autoOk={true}
                        disabled={disableAllFields ? true : false}
                        value={dayjs(selectedServiceDate)}
                        onChange={handleServiceDate}
                        KeyboardButtonProps={{
                          "aria-label": "change ing date",
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>

                <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        margin="normal"
                        id="date-picker-inline"
                        label="DOA"
                        autoOk={true}
                        disabled={disableAllFields ? true : false}
                        value={dayjs(selectedDOA)}
                        onChange={handleDOA}
                        KeyboardButtonProps={{
                          "aria-label": "change ing date",
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        margin="normal"
                        id="date-picker-inline"
                        label="DOA"
                        autoOk={true}
                        disabled={disableAllFields ? true : false}
                        value={dayjs(selectedDOD)}
                        onChange={handleDODDate}
                        KeyboardButtonProps={{
                          "aria-label": "change ing date",
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                      name="primaryDigonesisId"
                      value={selectedId}
                      onChange={(e, value) => doSelectValue(e, value)}
                      id="checkboxes-tags-demo"
                      filterOptions={autocompleteFilterChange}
                      options={diagnosisList}
                      getOptionLabel={(option) => option.diagnosisName}
                      getOptionSelected={(option, value) => option.id === value}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Primary Diagnosis"
                          variant="standard"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                      className={classes.benifitAutoComplete}
                      multiple
                      value={formik.values.diagnosis}
                      onChange={handleDiagnosisChange}
                      id="checkboxes-tags-demo"
                      filterOptions={autocompleteFilterChange}
                      options={diagnosisList}
                      disableCloseOnSelect
                      disabled={disableAllFields ? true : false}
                      getOptionLabel={(option) => option.diagnosisName}
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Other Diagnoses"
                          placeholder="Select Diagnosis"
                          variant="standard"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3} style={{ marginBottom: "20px" }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      id="standard-basic"
                      name="contactNoOne"
                      type="number"
                      value={formik.values.contactNoOne}
                      disabled={disableAllFields ? true : false}
                      onChange={formik.handleChange}
                      variant="standard"
                      label="Contact No. 1"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      id="standard-basic"
                      name="contactNoTwo"
                      type="number"
                      variant="standard"
                      value={formik.values.contactNoTwo}
                      disabled={disableAllFields ? true : false}
                      onChange={formik.handleChange}
                      label="Contact No. 2"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.daycare}
                          onChange={(e) => handleFieldChecked(e)}
                          name="daycare"
                          color="primary"
                        />
                      }
                      label="Daycare"
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} style={{ marginBottom: "15px" }}>
                  <Divider />
                </Grid>

                <Grid item xs={12} style={{ marginTop: "20px" }}>
                  <span style={{ color: "#4472C4", fontWeight: "bold" }}>
                    INVOICE DETAILS
                  </span>
                </Grid>
                <Grid item xs={12} style={{ marginBottom: "15px" }}>
                  <Divider />
                </Grid>

                {invoiceDetailsList.map((x, i) => {
                  return (
                    <>
                      <Grid container spacing={3} key={i}>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            id="standard-basic"
                            type="number"
                            name="invoiceAmount"
                            variant="standard"
                            value={x.invoiceAmount}
                            disabled={disableAllFields ? true : false}
                            onChange={(e) => handleInputChangeService(e, i)}
                            label="Invoice Amount"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            id="standard-basic"
                            name="invoiceNo"
                            variant="standard"
                            value={x.invoiceNo}
                            onChange={(e) => handleInputChangeService(e, i)}
                            label="Invoice number"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              margin="normal"
                              id="date-picker-inline"
                              label="Invoice Date"
                              autoOk={true}
                              value={dayjs(x.invoiceDateVal)}
                              onChange={(date) => {
                                handleInvoiceDate(date, i);
                              }}
                              KeyboardButtonProps={{
                                "aria-label": "change ing date",
                              }}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl className={classes.formControl}>
                            <InputLabel
                              id="demo-simple-select-label"
                              style={{ marginBottom: "0px" }}
                            >
                              Currency
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              name="currency"
                              variant="standard"
                              value={x.currency}
                              onChange={(e) => handleInputChangeService(e, i)}
                            >
                              {currencyList.map((ele) => {
                                return (
                                  <MenuItem key={ele.id} value={ele.code}>
                                    {ele.name}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            id="standard-basic"
                            type="number"
                            variant="standard"
                            name="exchangeRate"
                            value={x.exchangeRate}
                            onChange={(e) => handleInputChangeService(e, i)}
                            label="Exchange Rate"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            id="standard-basic"
                            name="invoiceAmountKSH"
                            variant="standard"
                            value={x.invoiceAmountKSH}
                            disabled
                            onChange={(e) => handleInputChangeService(e, i)}
                            label="Invoice Amount(KSH)"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            id="standard-basic"
                            name="transactionNo"
                            variant="standard"
                            value={x.transactionNo}
                            onChange={(e) => handleInputChangeService(e, i)}
                            label="Transaction No"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl className={classes.formControl}>
                            <InputLabel
                              id="demo-simple-select-label"
                              style={{ marginBottom: "0px" }}
                            >
                              Payee
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              name="payee"
                              value={x.payee}
                              variant="standard"
                              onChange={(e) => handleInputChangeService(e, i)}
                            >
                              <MenuItem value="Provider">Provider</MenuItem>
                              {/* <MenuItem value="Member">Member</MenuItem> */}
                              <MenuItem value="Intermediaries">
                                Intermediaries
                              </MenuItem>
                              {/* <MenuItem value="Corporate">Corporate</MenuItem> */}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            variant="contained"
                            color="primary"
                            style={{ marginLeft: "5px", marginTop: "10px" }}
                            onClick={() => handleAddInvoiceItems(i,x)}
                          >
                            Add Invoice items
                          </Button>
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={3}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {invoiceDetailsList.length !== 1 && (
                            <Button
                              className={`mr10 p-button-danger ${classes.buttonDanger}`}
                              onClick={() => handleRemoveServicedetails(i)}
                              variant="contained"
                              // color="secondary"
                              disabled={disableAllFields ? true : false}
                              style={{
                                marginLeft: "5px",
                                background: "#dc3545",
                                color: "#f1f1f1",
                              }}
                            >
                              <DeleteIcon />
                            </Button>
                          )}
                          {invoiceDetailsList.length - 1 === i && (
                            <Button
                              variant="contained"
                              color="primary"
                              style={{ marginLeft: "5px" }}
                              disabled={disableAllFields ? true : false}
                              onClick={handleAddServicedetails}
                            >
                              <AddIcon />
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        style={{ marginBottom: "15px", marginTop: "10px" }}
                      >
                        <Divider />
                      </Grid>
                    </>
                  );
                })}

                {query.get("mode") !== "viewOnly" && (
                  <Grid item xs={12} className={classes.actionContainer}>
                    <Button variant="contained" color="primary" type="submit">
                      Save and Next
                    </Button>
                    <Button
                      className={`p-button-text ${classes.saveBtn}`}
                      style={{ marginLeft: "10px" }}
                      variant="text"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                  </Grid>
                )}
              </form>
            </div>
          </>
        )}
      </Box>
    </Paper>
  );
}
