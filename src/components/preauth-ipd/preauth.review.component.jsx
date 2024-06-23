import {
  Box,
  Divider,
  Grid,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import DialogTable from "../eo2v2.dialog";
import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  ClaimService,
  PreAuthService,
} from "../../remote-api/api/claim-services";
import { MemberService } from "../../remote-api/api/member-services";
import { BenefitService } from "../../remote-api/api/master-services/benefit-service";
import { ServiceTypeService } from "../../remote-api/api/master-services/service-type-service";
import { forkJoin } from "rxjs";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { TabPanel, TabView } from "primereact/tabview";
import {
  PRE_AUTH_STATUS_MSG_MAP,
  REIM_STATUS_MSG_MAP,
} from "../../utils/helper";
import { jwtDecode } from "jwt-decode";
import DocumentPreview from "./component/preview.thumbnail";
import { CreditClaimService } from "../../remote-api/api/claim-services/credit-claim-services";
import { CheckCircle } from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const keyStyle = {
  fontWeight: "800",
  fontSize: "13px",
  color: "#3C3C3C",
};

const valueStyle = {
  fontWeight: "500",
  fontSize: "13px",
  color: "#A1A1A1",
};

const commentModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const StyledTableCellHeader = withStyles((theme) => ({
  head: {
    backgroundColor: "#F1F1F1",
    color: "#A1A1A1",
    padding: "8px",
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableCellHeaderAI2 = withStyles((theme) => ({
  head: {
    backgroundColor: "#01de74",
    color: "#f1ff1",
    padding: "8px",
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableCellHeaderAI1 = withStyles((theme) => ({
  head: {
    backgroundColor: "#313c96",
    color: "#f1f1f1",
    padding: "8px",
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableCellRow = withStyles((theme) => ({
  head: {
    padding: "8px",
  },
  body: {
    padding: "8px",
    backgroundColor: "#FFF",
    color: "#3C3C3C !important",
    fontSize: 12,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      // backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PreAuthReview(props) {
  const { id } = useParams();
  const providerId = localStorage.getItem("providerId");
  const [preAuthDetails, setPreAuthDetails] = React.useState();
  const [comment, setComment] = React.useState(null);
  const [cnfText, setCnfText] = React.useState(null);
  const [commentModal, setCommentModal] = React.useState(false);
  const [diagnosisList, setDiagnosisList] = React.useState([]);
  const [providerData, setProviderData] = React.useState([]);
  const [serviceData, setServiceData] = React.useState([]);
  const [benefit, setBenefit] = React.useState([]);
  const [reviewDecision, setReviewDecision] = React.useState("");
  const [decionData, setDecionData] = React.useState([]);
  const [maxApprovableAmount, setMaxApprovableAmount] = React.useState(0);
  const [providerDetails, setProviderDetails] = React.useState([]);
  const [serviceDetails, setServiceDetails] = React.useState([]);
  const [memberData, setMemberData] = React.useState();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const query = useQuery();
  const type = query.get("type");

  const preAuthService = new PreAuthService();
  const claimService = new ClaimService();
  const creditClaimService = new CreditClaimService();
  const memberservice = new MemberService();
  const benefitService = new BenefitService();
  const serviceDiagnosis = new ServiceTypeService();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (preAuthDetails?.preAuth.calculationStatus === "COMPLETED")
      setActiveIndex(2);
  }, []);

  let ad$ = serviceDiagnosis.getServicesbyId("867854874246590464", {
    page: 0,
    size: 1000,
    summary: true,
    active: true,
    nonGroupedServices: false,
  });

  const getDiagnosisData = () => {
    ad$.subscribe((result) => {
      let arr = [];
      result.content.forEach((ele) => {
        arr.push({ id: ele.id, diagnosisName: ele.name });
      });
      setDiagnosisList(arr);
    });
  };

  useEffect(() => {
    getDiagnosisData();
  }, []);

  useEffect(() => {
    let sum = 0;
    preAuthDetails?.preAuth?.benefitsWithCost.forEach((item) => {
      sum = sum + item?.copayAmount + item?.maxApprovedCost;
    });
    setMaxApprovableAmount(sum);
  }, [preAuthDetails]);

  useEffect(() => {
    if (id) {
      if (type === "preauth") populatePreAuth();
      else if (type === "claim") populateFromClaims();
      else if (type === "creditClaim") populateCreditClaims();
    }
  }, [id]);

  const populateCreditClaims = () => {
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

    let frk$ = forkJoin({
      bts: benefitService.getAllBenefit({ page: 0, size: 1000 }),
      preAuth: creditClaimService.getReimbursementById(id, providerId),
      services: serviceAll$,
    });
    frk$.subscribe((data) => {
      data.preAuth.benefitsWithCost.forEach((benefit) => {
        let bts$ = benefitService.getBenefitInterventions(benefit.benefitId);
        bts$.subscribe((result) => {
          result.forEach((el) => {
            if (el.interventionId === benefit.interventionCode) {
              benefit.interventionName = el.name;
            }
          });
        });
      });
      data.preAuth.benefitsWithCost.forEach((benefit) => {
        let bts$ = benefitService.getServicesfromInterventions(
          benefit.interventionCode,
          benefit.benefitId
        );
        bts$.subscribe((result) => {
          result.forEach((el) => {
            if (el.code === benefit.diagnosis) {
              benefit["diagnosisName"] = el?.name;
            }
          });
        });
      });
      data.providers.content.forEach((proAll) => {
        data.preAuth.benefitsWithCost.forEach((benefit) => {
          if (proAll.id === benefit.providerId) {
            benefit["providerName"] = proAll.providerBasicDetails?.name;
          }
        });
      });
      // data.bts.content.forEach((benall) => {
      //   data.preAuth.benefitsWithCost.forEach((benefit) => {
      //     if (benefit.benefitId === benall.id) {
      //       benefit["benefitName"] = benall.name;
      //     }
      //   });
      // });
      // let serviceList = [];
      // data.services.forEach((ser) => {
      //   ser.content.forEach((sr) => {
      //     serviceList.push(sr);
      //   });
      // });
      // serviceList.forEach((ser) => {
      //   data.preAuth.services.forEach((service) => {
      //     if (service.serviceId === ser.id) {
      //       service["serviceName"] = ser.name;
      //     }
      //   });
      // });
      let pageRequest = {
        page: 0,
        size: 10,
        summary: true,
        active: true,
        key: "MEMBERSHIP_NO",
        value: data.preAuth.memberShipNo,
        key1: "policyNumber",
        value1: data.preAuth.policyNumber,
      };
      let obj = { preAuth: data.preAuth };
      memberservice.getMember(pageRequest).subscribe((res) => {
        if (res.content?.length > 0) {
          console.log(res);
          setMemberData(res.content[0]);
          const member = res.content[0];
          obj.member = member;
        }
      });
      setPreAuthDetails(obj);
      setProviderDetails(obj.preAuth.providers);
      setBenefit(data.bts.content);
    });
  };

  const populateFromClaims = () => {
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

    let frk$ = forkJoin({
      // providers: providerService.getProviders(),
      bts: benefitService.getAllBenefit({ page: 0, size: 1000 }),
      // preAuth: preAuthService.getPreAuthById(id, providerId),
      preAuth: claimService.getReimbursementById(id, providerId),
      services: serviceAll$,
    });
    frk$.subscribe((data) => {
      data.providers.content.forEach((proAll) => {
        data.preAuth.providers.forEach((pr) => {
          if (proAll.id === pr.providerId) {
            pr["providerName"] = proAll.providerBasicDetails?.name;
          }
        });
      });
      // data.bts.content.forEach((benall) => {
      //   data.preAuth.benefitsWithCost.forEach((benefit) => {
      //     if (benefit.benefitId === benall.id) {
      //       benefit["benefitName"] = benall.name;
      //     }
      //   });
      // });
      // let serviceList = [];
      // data.services.forEach((ser) => {
      //   ser.content.forEach((sr) => {
      //     serviceList.push(sr);
      //   });
      // });
      // serviceList.forEach((ser) => {
      //   data.preAuth.services.forEach((service) => {
      //     if (service.serviceId === ser.id) {
      //       service["serviceName"] = ser.name;
      //     }
      //   });
      // });
      let pageRequest = {
        page: 0,
        size: 10,
        summary: true,
        active: true,
        key: "MEMBERSHIP_NO",
        value: data.preAuth.memberShipNo,
        key1: "policyNumber",
        value1: data.preAuth.policyNumber,
      };
      let obj = { preAuth: data.preAuth };
      memberservice.getMember(pageRequest).subscribe((res) => {
        if (res.content?.length > 0) {
          console.log(res);
          setMemberData(res.content[0]);
          const member = res.content[0];
          obj.member = member;
        }
      });
      setPreAuthDetails(obj);
      setProviderDetails(obj.preAuth.providers);
      setBenefit(data.bts.content);
    });
  };

  const populatePreAuth = () => {
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

    let frk$ = forkJoin({
      providers: benefitService.getProviders(),
      bts: benefitService.getAllBenefit({ page: 0, size: 1000 }),
      preAuth: preAuthService.getPreAuthById(id, providerId),
      services: serviceAll$,
      serviceType: serviceDiagnosis.getServiceTypes(),
    });
    frk$.subscribe((data) => {
      // data.providers.content.forEach((proAll) => {
      //   data.preAuth.providers.forEach((pr) => {
      //     if (proAll.id === pr.providerId) {
      //       pr["providerName"] = proAll.providerBasicDetails?.name;
      //     }
      //   });
      //   data.preAuth.services.forEach((service) => {
      //     if (service.providerId === proAll.id) {
      //       service["provider"] = proAll.providerBasicDetails?.name;
      //     }
      //   });
      // });
      // data.bts.content.forEach((benall) => {
      //   data.preAuth.benefitsWithCost.forEach((benefit) => {
      //     if (benefit.benefitId === benall.id) {
      //       benefit["benefitName"] = benall.name;
      //     }
      //   });
      //   data.preAuth.services.forEach((service) => {
      //     if (service.benifitId === benall.id) {
      //       service["benefitName"] = benall?.name;
      //     }
      //   });
      // });
      // data.serviceType.content.forEach((serAll) => {
      //   data.preAuth.services.forEach((service) => {
      //     if (service.serviceId === serAll.id) {
      //       service["service"] = serAll?.name;
      //     }
      //   });
      // });
      data.bts.content.forEach((benall) => {
        data.preAuth.benefitsWithCost.forEach((benefit) => {
          if (benefit.benefitId === benall.id) {
            benefit["benefitName"] = benall.name;
          }
        });
      });
      let serviceList = [];
      data.services.forEach((ser) => {
        ser.content.forEach((sr) => {
          serviceList.push(sr);
        });
      });
      serviceList.forEach((ser) => {
        data.preAuth.services.forEach((service) => {
          if (service.serviceId === ser.id) {
            service["serviceName"] = ser.name;
          }
        });
      });
      data.preAuth.benefitsWithCost.forEach((benefit) => {
        let bts$ = benefitService.getBenefitInterventions(benefit.benefitId);
        bts$.subscribe((result) => {
          result.forEach((el) => {
            if (el.interventionId === benefit.interventionCode) {
              benefit.interventionName = el.name;
            }
          });
        });
      });
      data.preAuth.benefitsWithCost.forEach((benefit) => {
        let bts$ = benefitService.getServicesfromInterventions(
          benefit.interventionCode,
          benefit.benefitId
        );
        bts$.subscribe((result) => {
          result.forEach((el) => {
            if (el.code === benefit.diagnosis) {
              benefit["diagnosisName"] = el?.name;
            }
          });
        });
      });
      // let serviceList = [];
      // data.services.forEach((ser) => {
      //   ser.content.forEach((sr) => {
      //     serviceList.push(sr);
      //   });
      // });
      // serviceList.forEach((ser) => {
      //   data.preAuth.services.forEach((service) => {
      //     if (service.expenseHead === ser.id) {
      //       service["expense"] = ser.name;
      //     }
      //   });
      // });
      let pageRequest = {
        page: 0,
        size: 10,
        summary: true,
        active: true,
        key: "MEMBERSHIP_NO",
        value: data.preAuth.memberShipNo,
        key1: "policyNumber",
        value1: data.preAuth.policyNumber,
      };
      let obj = { preAuth: data.preAuth };
      memberservice.getMember(pageRequest).subscribe((res) => {
        if (res.content?.length > 0) {
          console.log(res);
          setMemberData(res.content[0]);
          const member = res.content[0];
          obj.member = member;
        }
      });
      setPreAuthDetails(obj);
      setProviderDetails(obj.preAuth.providers);
      setBenefit(data.bts.content);
    });
  };

  const handleApproveProviderAmount = (e, provider, benefitId) => {
    const { id, value } = e.target;
    // Ensure that the value is a valid number
    const newValue = parseFloat(value);
    if (isNaN(newValue)) {
      return; // Do nothing if the input is not a valid number
    }

    if (provider && provider.benefit) {
      const exceedsEstimatedCost = provider.benefit.some((el) => {
        if (el?.benefitId === benefitId) {
          if (newValue > el.estimatedCost) {
            alert(
              "Approved amount cannot exceed estimated amount!",
              newValue,
              provider.estimatedCost
            );
            const providerIndex = providerData.findIndex(
              (item) => item.providerId === provider.providerId
            );
            if (providerIndex !== -1) {
              const updatedProviderData = [...providerData];
              const benefitIndex = updatedProviderData[
                providerIndex
              ]?.benefit?.findIndex((item) => item.benefitId === benefitId);
              updatedProviderData[providerIndex].benefit[
                benefitIndex
              ].approvedCost = newValue;
              setProviderData(updatedProviderData);
            } else {
              // If the provider is not in the array, add it
              const newProvider = {
                providerId: provider.providerId,
                benefit: provider.benefit,
              };
              provider.benefit.some((el) => {
                if (el?.benefitId === benefitId) {
                  el.approvedCost = newValue;
                }
              });
              setProviderData([...providerData, newProvider]);
            }
            return true; // Stop iteration and return true if the condition is met
          } else {
            const providerIndex = providerData.findIndex(
              (item) => item.providerId === provider.providerId
            );
            if (providerIndex !== -1) {
              const updatedProviderData = [...providerData];
              const benefitIndex = updatedProviderData[
                providerIndex
              ]?.benefit?.findIndex((item) => item.benefitId === benefitId);
              updatedProviderData[providerIndex].benefit[
                benefitIndex
              ].approvedCost = newValue;
              setProviderData(updatedProviderData);
            } else {
              // If the provider is not in the array, add it
              const newProvider = {
                providerId: provider.providerId,
                benefit: provider.benefit,
              };
              provider.benefit.some((el) => {
                if (el?.benefitId === benefitId) {
                  el.approvedCost = newValue;
                }
              });
              setProviderData([...providerData, newProvider]);
            }
          }
        }
        return false; // Continue iteration if the condition is not met
      });

      if (exceedsEstimatedCost) {
        return; // Do nothing if the approvedCost exceeds the estimatedCost
      }
    }
  };

  const handleApproveServiceAmount = (e, service) => {
    const { id, value } = e.target;

    // Ensure that the value is a valid number
    const newValue = parseFloat(value);
    if (isNaN(newValue)) {
      return; // Do nothing if the input is not a valid number
    }

    // Ensure that the approvedCost is not greater than the estimatedCost
    if (newValue > service.estimatedCost) {
      alert(
        "Approved amount cannot exceed estimated amount!",
        newValue,
        service.estimatedCost
      );
      return; // Do nothing if the approvedCost exceeds the estimatedCost
    }

    const serviceIndex = serviceData.findIndex(
      (item) => item.serviceId === service.serviceId
    );

    if (serviceIndex !== -1) {
      // If the provider is already in the array, update its approvedCost
      const updatedServiceData = [...serviceData];
      updatedServiceData[serviceIndex].approvedCost = newValue;
      setServiceData(updatedServiceData);
    } else {
      // If the provider is not in the array, add it
      const newService = {
        serviceId: service.serviceId,
        approvedCost: newValue,
      };
      setServiceData([...serviceData, newService]);
    }
  };

  const onDecission = (decission) => {
    if (
      (decission == "APPROVED" && cnfText === "approve") ||
      (decission == "REJECTED" && cnfText === "reject")
    ) {
      var isEveryAmountIsRight = true;

      preAuthDetails?.preAuth.benefitsWithCost.forEach((ele) => {
        let sum = 0;
        providerData.forEach((item) => {
          if (item && item.benefit) {
            item.benefit.forEach((el) => {
              if (el.benefitId === ele.benefitId) {
                sum += el.approvedCost || 0; // Add the approvedCost to sum, defaulting to 0 if it's undefined
                if (sum > ele.maxApprovedCost) {
                  isEveryAmountIsRight = false;
                  alert(
                    `${ele?.benefitName}'s approved amount is less than your provider's benefit total`
                  ); // Display an alert if sum exceeds maxApprovedCost
                }
              }
            });
          }
        });
      });

      if (isEveryAmountIsRight) {
        preAuthService
          .editPreAuth(
            {
              decission: decission,
              comment: comment,
              providersWithApprovedCost: providerData,
              servicesWithApprovedCost: serviceData,
            },
            id,
            "decission"
          )
          .subscribe((r) => {
            setCommentModal(false);
            alert("Approved!");
            window.location.reload();
          });
      } else {
        setCommentModal(false);
      }
    }
  };

  const showReviewerComment = () => {
    if (
      preAuthDetails?.preAuth.preAuthStatus == "APPROVED" ||
      preAuthDetails?.preAuth.preAuthStatus == "REJECTED"
    ) {
      return (
        <div style={{ padding: "5px" }}>
          <strong>Reviewer comment</strong>
          <Divider />
          <Grid container>
            <Grid item xs={12}>
              <p>{preAuthDetails?.preAuth.comment}</p>
            </Grid>
          </Grid>
        </div>
      );
    } else {
      return null;
    }
  };

  const handleDecision = () => {
    let id = preAuthDetails?.preAuth?.benefitsWithCost[0]?.decisionId;
    memberservice.getDecsion(id).subscribe((res) => {
      setDecionData(res);
    });
    setOpen(true);
  };
  const handleChangeOfDecitionText = (event) => {
    setCnfText(event.target.value);
  };

  const handleChangeOfCommentText = (event) => {
    setComment(event.target.value);
  };

  const showCommentBox = () => {
    if (
      preAuthDetails?.preAuth?.preAuthStatus == "EVALUATION_INPROGRESS" ||
      preAuthDetails?.preAuth?.preAuthStatus == "APPROVED_FAILED" ||
      preAuthDetails?.preAuth?.preAuthStatus == "ENHANCEMENT_REQUESTED"
    ) {
      return (
        <Modal
          open={commentModal}
          onClose={() => {
            setCommentModal(false);
          }}
        >
          <Box sx={commentModalStyle}>
            <div>
              <h2>Reviewer input</h2>
              <Divider />
              <Grid container rowSpacing={5}>
                <Grid item xs={12} style={{ marginBottom: "5px" }}>
                  <TextField
                    required
                    fullWidth
                    label="Type approve or reject for respective operation"
                    id="fullWidth"
                    onChange={handleChangeOfDecitionText}
                  />
                </Grid>

                <Grid item xs={12} style={{ marginTop: "5px" }}>
                  <TextField
                    required
                    id="filled-multiline-static"
                    label="Add comment"
                    multiline
                    fullWidth
                    minRows={4}
                    variant="filled"
                    onChange={handleChangeOfCommentText}
                  />
                </Grid>
              </Grid>
            </div>
            <Button
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "15px",
                border: "none",
              }}
              color="primary"
              variant="contained"
              onClick={() => {
                onDecission(reviewDecision);
              }}
            >
              Submit
            </Button>
          </Box>
        </Modal>
      );
    }
  };

  const BasicDetails = () => {
    return (
      <div>
        <div style={{ padding: "5px" }}>
          <strong
            style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
          >
            Member details
          </strong>
          <Divider />

          <Grid container spacing={0.5} style={{ gap: "8px 0" }}>
            <Grid item xs={12} sm={6} style={{ marginTop: "10px" }}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Membership No: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.membershipNo}</span>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6} style={{ marginTop: "10px" }}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Name: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.name}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Age: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.age}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Relations: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.relations}</span>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div style={{ padding: "5px", marginTop: "10px" }}>
          <strong
            style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
          >
            Policy details
          </strong>
          <Divider />

          <Grid container spacing={0.5} style={{ gap: "8px 0" }}>
            <Grid item xs={12} sm={6} style={{ marginTop: "10px" }}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Policy No: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{memberData?.policyNumber}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5} style={{ marginTop: "10px" }}>
                <Grid item xs={4} style={keyStyle}></Grid>
                <Grid item xs={8} style={valueStyle}></Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Policy start date: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>
                    {new Date(memberData?.policyStartDate).toLocaleDateString()}
                  </span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Policy end date: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>
                    {new Date(memberData?.policyEndDate).toLocaleDateString()}
                  </span>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  };

  const OtherDetails = () => {
    return (
      <>
        <div style={{ padding: "5px" }}>
          <strong
            style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
          >
            Other details
          </strong>
          <Divider />

          <Grid container spacing={0.5} rowSpacing={1} style={{ gap: "8px 0" }}>
            <Grid item xs={12} sm={6} style={{ marginTop: "10px" }}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Date of admission: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>
                    {new Date(
                      preAuthDetails?.preAuth?.expectedDOA
                    ).toLocaleDateString()}
                  </span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5} style={{ marginTop: "10px" }}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Date of discharge: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>
                    {new Date(
                      preAuthDetails?.preAuth?.expectedDOD
                    ).toLocaleDateString()}
                  </span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Contact No1: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{preAuthDetails?.preAuth?.contactNoOne}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Contact No2: </span>
                </Grid>
                <Grid item xs={8} style={valueStyle}>
                  <span>{preAuthDetails?.preAuth?.contactNoTwo || "NA"}</span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={0.5}>
                <Grid item xs={4} style={keyStyle}>
                  <span>Diagnosis: </span>
                </Grid>

                <Grid item xs={8} style={valueStyle}>
                  <ul>
                    {diagnosisList?.map((item) => {
                      const matchingDiagnoses =
                        preAuthDetails?.preAuth.diagnosis?.filter(
                          (d) => item.id === d
                        );
                      if (matchingDiagnoses?.length) {
                        return matchingDiagnoses.map((matchingDiagnosis) => (
                          <li key={matchingDiagnosis}>{item.diagnosisName}</li>
                        ));
                      } else {
                        return null;
                      }
                    })}
                  </ul>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </>
    );
  };

  const ClaimDetails = () => {
    return (
      <>
        <div style={{ padding: "5px" }}>
          <Grid item xs={12} style={{ marginTop: "1em" }}>
            <span
              style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
            >
              Benefits:{" "}
            </span>
          </Grid>

          <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCellHeader>Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Estimated cost</StyledTableCellHeader>
                  <StyledTableCellHeader>Approved</StyledTableCellHeader>
                  <StyledTableCellHeader>Copay</StyledTableCellHeader>
                  <StyledTableCellHeader>Comment</StyledTableCellHeader>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {preAuthDetails?.preAuth?.benefitsWithCost[0].benefitId ? (
                  preAuthDetails?.preAuth?.benefitsWithCost?.map((row) => (
                    <StyledTableRow
                      key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <StyledTableCellRow component="th" scope="row">
                        {row.benefitName}
                      </StyledTableCellRow>
                      <StyledTableCellRow>
                        {row.estimatedCost}
                      </StyledTableCellRow>
                      <StyledTableCellRow>
                        {row.maxApprovedCost}
                      </StyledTableCellRow>
                      <StyledTableCellRow>{row.copayAmount}</StyledTableCellRow>
                      <StyledTableCellRow>
                        {row.comment || "NA"}
                      </StyledTableCellRow>
                    </StyledTableRow>
                  ))
                ) : (
                  <p style={{ color: "#3c3c3c", padding: "1%" }}>No data</p>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid item xs={12} style={{ marginTop: "1em" }}>
            <span
              style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
            >
              Service Details:{" "}
            </span>
          </Grid>

          <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCellHeader>Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Estimated cost</StyledTableCellHeader>
                  <StyledTableCellHeader></StyledTableCellHeader>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {preAuthDetails?.preAuth.services?.length ? (
                  preAuthDetails?.preAuth.services?.map((row) => {
                    let value =
                      preAuthDetails?.preAuth.preAuthStatus !=
                        "ENHANCEMENT_REQUESTED" && row?.approvedCost;
                    return (
                      <StyledTableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <StyledTableCellRow
                          component="th"
                          scope="row"
                          style={valueStyle}
                        >
                          {row.serviceName}
                        </StyledTableCellRow>
                        <StyledTableCellRow style={valueStyle}>
                          {row.estimatedCost}
                        </StyledTableCellRow>
                        <StyledTableCellRow style={valueStyle}>
                          <InputText
                            className="p-inputtext-sm"
                            type="number"
                            defaultValue={value}
                            id={`approveServiceAmount-${row.serviceId}`}
                            name={`approveServiceAmount-${row.serviceId}`}
                            disabled={
                              preAuthDetails?.preAuth.preAuthStatus ==
                              "APPROVED"
                            }
                            onBlur={(e) => {
                              const updatedService = serviceDetails.map(
                                (item) => {
                                  if (item.serviceId == row.serviceId) {
                                    item.approvedCost = e.target.value;
                                  }
                                  return item;
                                }
                              );
                              setServiceDetails(updatedService);
                              handleApproveServiceAmount(e, row);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              borderBottom: "1px solid",
                              height: "15px",
                              borderRadius: "0",
                            }}
                          />
                        </StyledTableCellRow>
                      </StyledTableRow>
                    );
                  })
                ) : (
                  <p style={{ color: "#3c3c3c", padding: "1%" }}>No data</p>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid item xs={12} style={{ marginTop: "1em" }}>
            <span
              style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
            >
              Providers:{" "}
            </span>
          </Grid>

          <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCellHeader>Invoice No</StyledTableCellHeader>
                  <StyledTableCellHeader>invoiceAmount</StyledTableCellHeader>
                  <StyledTableCellHeader>Currency</StyledTableCellHeader>
                  <StyledTableCellHeader>Exchange Rate</StyledTableCellHeader>
                  <StyledTableCellHeader>Invoice Items</StyledTableCellHeader>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {preAuthDetails?.preAuth?.invoices?.length ? (
                  preAuthDetails?.preAuth?.invoices?.map((row) => {
                    // let token = window["getToken"] && window["getToken"]();
                    // const { name } = jwtDecode(token);
                    return (
                      <StyledTableRow
                        key={row.invoiceNo}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <StyledTableCellRow component="th" scope="row">
                          {row?.invoiceNo}
                        </StyledTableCellRow>
                        <StyledTableCellRow>
                          {row.invoiceAmount}
                        </StyledTableCellRow>
                        <StyledTableCellRow>{row.currency}</StyledTableCellRow>
                        <StyledTableCellRow>
                          {row.exchangeRate}
                        </StyledTableCellRow>
                        <StyledTableCellRow>
                          <Grid container>
                            <Grid item xs={6} style={keyStyle}>
                              Expense Name
                            </Grid>
                            <Grid item xs={3} style={keyStyle}>
                              Unit
                            </Grid>
                            <Grid item xs={3} style={keyStyle}>
                              Rate Kes
                            </Grid>
                          </Grid>
                          {row?.invoiceItems?.map((ele, idx) => {
                            return (
                              <Grid container>
                                <Grid
                                  item
                                  xs={6}
                                  style={valueStyle}
                                  display={"flex"}
                                  alignItems={"center"}
                                >
                                  <p>{ele?.expenseHeadName}</p>
                                </Grid>
                                <Grid
                                  item
                                  xs={3}
                                  style={valueStyle}
                                  display={"flex"}
                                  alignItems={"center"}
                                >
                                  {ele.unit}
                                </Grid>
                                <Grid
                                  item
                                  xs={3}
                                  style={valueStyle}
                                  display={"flex"}
                                  alignItems={"center"}
                                >
                                  {ele.rateKes}
                                </Grid>
                              </Grid>
                            );
                          })}
                        </StyledTableCellRow>
                      </StyledTableRow>
                    );
                  })
                ) : (
                  <p style={{ color: "#3c3c3c", padding: "1%" }}>No data</p>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid item xs={12} style={{ marginTop: "1em" }}>
            <span
              style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
            >
              AI Model Prediction
            </span>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
                <Table aria-label="simple table">
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCellHeaderAI1>
                        AI Claim Decission
                      </StyledTableCellHeaderAI1>
                      <StyledTableCellHeaderAI1>
                        Confidence(%)
                      </StyledTableCellHeaderAI1>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    <StyledTableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <StyledTableCellRow component="th" scope="row">
                        Approve
                      </StyledTableCellRow>
                      <StyledTableCellRow>90%</StyledTableCellRow>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
                <Table aria-label="simple table">
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCellHeaderAI2>
                        AI Fraud Prediction
                      </StyledTableCellHeaderAI2>
                      <StyledTableCellHeaderAI2>
                        Confidence(%)
                      </StyledTableCellHeaderAI2>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    <StyledTableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <StyledTableCellRow component="th" scope="row">
                        Not Fraudulent
                      </StyledTableCellRow>
                      <StyledTableCellRow>90%</StyledTableCellRow>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Grid item xs={12}></Grid>
        </div>
      </>
    );
  };

  const PreauthClaimDetails = () => {
    return (
      <>
        <div style={{ padding: "5px" }}>
          {/* <Grid item xs={12} style={{ marginTop: "1em" }}>
            <span
              style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
            >
              Benefits:{" "}
            </span>
          </Grid>

          <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCellHeader>Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Estimated cost</StyledTableCellHeader>
                  <StyledTableCellHeader>Approved</StyledTableCellHeader>
                  <StyledTableCellHeader>Copay</StyledTableCellHeader>
                  <StyledTableCellHeader>Comment</StyledTableCellHeader>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {preAuthDetails?.preAuth?.benefitsWithCost[0].benefitId ? (
                  preAuthDetails?.preAuth?.benefitsWithCost?.map((row) => (
                    <StyledTableRow
                      key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <StyledTableCellRow component="th" scope="row">
                        {row.benefitName}
                      </StyledTableCellRow>
                      <StyledTableCellRow>
                        {row.estimatedCost}
                      </StyledTableCellRow>
                      <StyledTableCellRow>
                        {row.maxApprovedCost}
                      </StyledTableCellRow>
                      <StyledTableCellRow>{row.copayAmount}</StyledTableCellRow>
                      <StyledTableCellRow>
                        {row.comment || "NA"}
                      </StyledTableCellRow>
                    </StyledTableRow>
                  ))
                ) : (
                  <p style={{ color: "#3c3c3c", padding: "1%" }}>No data</p>
                )}
              </TableBody>
            </Table>
          </TableContainer> */}

          <Grid item xs={12} style={{ marginTop: "1em" }}>
            {/* <span style={{ color: '#313c96', fontWeight: 'bold', fontSize: '13px' }}>Providers: </span> */}
          </Grid>

          {/* <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCellHeader>Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Estimated cost</StyledTableCellHeader>
                  <StyledTableCellHeader>Benefit Details</StyledTableCellHeader>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {providerDetails?.length ? (
                  providerDetails?.map((row) => {
                    let token = window["getToken"] && window["getToken"]();
                    const { name } = jwtDecode(token);
                    return (
                      <StyledTableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <StyledTableCellRow component="th" scope="row">
                          {name}
                        </StyledTableCellRow>
                        <StyledTableCellRow>
                          {row.estimatedCost}
                        </StyledTableCellRow>
                        <StyledTableCellRow>
                          <Grid container>
                            <Grid item xs={6} style={keyStyle}>
                              Benefit
                            </Grid>
                            <Grid item xs={3} style={keyStyle}>
                              Estimated Cost
                            </Grid>
                            <Grid item xs={3} style={keyStyle}>
                              Approved Amount
                            </Grid>
                          </Grid>
                          {row?.benefit.map((ele, idx) => {
                            let p = benefit.find(
                              (itm) => itm?.id == ele?.benefitId
                            );
                            // const [value, setValue] = React.useState(
                            //   preAuthDetails?.preAuth.preAuthStatus != 'ENHANCEMENT_REQUESTED' && ele?.approvedCost,
                            // );
                            const handleInputChange = (e) => {
                              // const updatedProviders = providerDetails.map(item => {
                              //   return {
                              //     ...item,
                              //     benefit: item.benefit.map(el => {
                              //       if (item.providerId === row.providerId) {
                              //         if (el.benefitId === ele.benefitId)
                              //           if (ele.estimatedCost >= e.target.value) {
                              //             return {
                              //               ...el,
                              //               approvedCost: e.target.value,
                              //             };
                              //           } else {
                              //             return {
                              //               ...el,
                              //               approvedCost: 0,
                              //             };
                              //           }
                              //       }
                              //       return el;
                              //     }),
                              //   };
                              // });
                              // setProviderDetails(updatedProviders);
                              handleApproveProviderAmount(
                                e,
                                row,
                                ele.benefitId
                              );
                            };
                            return (
                              <Grid container>
                                <Grid item xs={6} style={valueStyle}>
                                  <p>{p?.name}</p>
                                </Grid>
                                <Grid item xs={3} style={valueStyle}>
                                  {ele.estimatedCost}
                                </Grid>
                                <Grid item xs={3} style={valueStyle}>
                                  <input
                                    className="p-inputtext-xs"
                                    type="number"
                                    // value={value}
                                    defaultValue={
                                      preAuthDetails?.preAuth.preAuthStatus !=
                                        "ENHANCEMENT_REQUESTED" &&
                                      ele?.approvedCost
                                    }
                                    id={`approveProviderAmount-${ele.benefitId}`}
                                    name={`approveProviderAmount-${ele.benefitId}`}
                                    disabled={
                                      preAuthDetails?.preAuth.preAuthStatus !=
                                      "EVALUATION_INPROGRESS"
                                    }
                                    // onChange={e => handleApproveProviderAmount(e, row, ele.benefitId)}
                                    // onChange={e => setValue(e.target.value)}
                                    onBlur={(e) =>
                                      handleApproveProviderAmount(
                                        e,
                                        row,
                                        ele.benefitId
                                      )
                                    }
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      borderBottom: "1px solid",
                                      height: "15px",
                                      width: "100%",
                                      borderRadius: "0",
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            );
                          })}
                        </StyledTableCellRow>
                      </StyledTableRow>
                    );
                  })
                ) : (
                  <p style={{ color: "#3c3c3c", padding: "1%" }}>No data</p>
                )}
              </TableBody>
            </Table>
          </TableContainer> */}
          <Grid item xs={12} style={{ marginTop: "1em" }}>
            <span
              style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
            >
              Service Details:{" "}
            </span>
          </Grid>

          <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCellHeader>Provider Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Benefit Name</StyledTableCellHeader>
                  <StyledTableCellHeader>Intervention</StyledTableCellHeader>
                  <StyledTableCellHeader>Diagnosis</StyledTableCellHeader>
                  <StyledTableCellHeader>Estimated</StyledTableCellHeader>
                  <StyledTableCellHeader>Comment</StyledTableCellHeader>
                  <StyledTableCellHeader>Decision</StyledTableCellHeader>
                  <StyledTableCellHeader></StyledTableCellHeader>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {preAuthDetails?.preAuth?.benefitsWithCost[0].benefitId ? (
                  preAuthDetails?.preAuth?.benefitsWithCost?.map((row) => {
                    let proId = localStorage.getItem("providerId");
                    let poviderName = localStorage.getItem("provider");
                    let value =
                      preAuthDetails?.preAuth.preAuthStatus !=
                        "ENHANCEMENT_REQUESTED" && row?.approvedCost;
                    if (proId === row.providerId) {
                      return (
                        <StyledTableRow
                          key={row.name}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <StyledTableCellRow
                            component="th"
                            scope="row"
                            style={valueStyle}
                          >
                            {poviderName}
                          </StyledTableCellRow>
                          <StyledTableCellRow
                            component="th"
                            scope="row"
                            style={valueStyle}
                          >
                            {row.benefitName}
                          </StyledTableCellRow>
                          <StyledTableCellRow
                            component="th"
                            scope="row"
                            style={valueStyle}
                          >
                            {row.interventionName}
                          </StyledTableCellRow>
                          <StyledTableCellRow
                            component="th"
                            scope="row"
                            style={valueStyle}
                          >
                            {row.diagnosisName}
                          </StyledTableCellRow>
                          <StyledTableCellRow style={valueStyle}>
                            {row.estimatedCost}
                          </StyledTableCellRow>
                          <StyledTableCellRow style={valueStyle}>
                            {row.comment || "NA"}
                          </StyledTableCellRow>
                          <StyledTableCellRow style={valueStyle}>
                            <CheckCircle
                              sx={{ color: "green", cursor: "pointer" }}
                              onClick={handleDecision}
                            />
                          </StyledTableCellRow>
                          {/* <StyledTableCellRow style={valueStyle}>
                            <InputText
                              className="p-inputtext-sm"
                              type="number"
                              defaultValue={value}
                              id={`approveServiceAmount-${row.serviceId}`}
                              name={`approveServiceAmount-${row.serviceId}`}
                              disabled={
                                preAuthDetails?.preAuth.preAuthStatus ==
                                "APPROVED"
                              }
                              onBlur={(e) => {
                                const updatedService = serviceDetails.map(
                                  (item) => {
                                    if (item.serviceId == row.serviceId) {
                                      item.approvedCost = e.target.value;
                                    }
                                    return item;
                                  }
                                );
                                setServiceDetails(updatedService);
                                handleApproveServiceAmount(e, row);
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                borderBottom: "1px solid",
                                height: "15px",
                                borderRadius: "0",
                              }}
                            />
                          </StyledTableCellRow> */}
                        </StyledTableRow>
                      );
                    }
                  })
                ) : (
                  <p style={{ color: "#3c3c3c", padding: "1%" }}>No data</p>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <DialogTable
            open={open}
            setOpen={setOpen}
            data={decionData?.benefitResponseDTO}
          />

          <Grid item xs={12} style={{ marginTop: "1em" }}>
            <span
              style={{ color: "#313c96", fontWeight: "bold", fontSize: "13px" }}
            >
              AI Model Prediction
            </span>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
                <Table aria-label="simple table">
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCellHeaderAI1>
                        AI Claim Decission
                      </StyledTableCellHeaderAI1>
                      <StyledTableCellHeaderAI1>
                        Confidence(%)
                      </StyledTableCellHeaderAI1>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    <StyledTableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <StyledTableCellRow component="th" scope="row">
                        --
                      </StyledTableCellRow>
                      <StyledTableCellRow>--</StyledTableCellRow>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper} style={{ borderRadius: "8px" }}>
                <Table aria-label="simple table">
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCellHeaderAI2>
                        AI Fraud Prediction
                      </StyledTableCellHeaderAI2>
                      <StyledTableCellHeaderAI2>
                        Confidence(%)
                      </StyledTableCellHeaderAI2>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    <StyledTableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <StyledTableCellRow component="th" scope="row">
                        --
                      </StyledTableCellRow>
                      <StyledTableCellRow>--</StyledTableCellRow>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Grid item xs={12}></Grid>
        </div>
      </>
    );
  };

  const DocumentDetails = () => {
    return (
      <>
        {!preAuthDetails?.preAuth.documents?.length ? (
          <Box display={"flex"} justifyContent={"center"}>
            No Data
          </Box>
        ) : (
          <>
            <Grid item xs={12} style={{ marginTop: "1em" }}>
              <span
                style={{
                  color: "#313c96",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Docs:{" "}
              </span>
            </Grid>
            <Grid item xs={12}>
              <DocumentPreview
                documents={preAuthDetails?.preAuth.documents}
                preAuthId={preAuthDetails?.preAuth.id}
              />
            </Grid>
          </>
        )}
      </>
    );
  };
  return (
    <Box>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Box item xs={6} style={{ marginLeft: "10px" }}>
          <span style={{ color: "#313c96", fontWeight: "bold" }}>
            {type === "preauth" && "Preauth: "}
          </span>
          <span style={{ color: "#313c96", fontWeight: "bold" }}>
            {type === "claim" && "Claim: "}
          </span>
          <span style={{ color: "#313c96", fontWeight: "bold" }}>
            {type === "creditClaim" && "Credit Claim: "}
          </span>
          {id}
        </Box>
        <Box item xs={6} style={{ marginRight: "10px" }}>
          <span style={{ color: "#313c96", fontWeight: "bold" }}>Status</span>:{" "}
          {type === "preauth" &&
            PRE_AUTH_STATUS_MSG_MAP[preAuthDetails?.preAuth.preAuthStatus]}
          {type === "claim" &&
            REIM_STATUS_MSG_MAP[preAuthDetails?.preAuth.reimbursementStatus]}
          {type === "creditClaim" &&
            REIM_STATUS_MSG_MAP[preAuthDetails?.preAuth.reimbursementStatus]}
        </Box>
      </Box>

      <TabView
        scrollable
        style={{
          fontSize: "14px",
          marginTop: "10px",
          borderRadius: "8px 8px 0 0",
        }}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel leftIcon="pi pi-user mr-2" header="Basic details">
          <BasicDetails />
        </TabPanel>
        <TabPanel leftIcon="pi pi-user-minus mr-2" header="Other Details">
          <OtherDetails />
        </TabPanel>
        {type === "preauth" ? (
          <TabPanel leftIcon="pi pi-money-bill mr-2" header="Claim Details">
            <PreauthClaimDetails />
          </TabPanel>
        ) : (
          <TabPanel leftIcon="pi pi-money-bill mr-2" header="Claim Details">
            <ClaimDetails />
          </TabPanel>
        )}
        <TabPanel leftIcon="pi pi-file-pdf mr-2" header="Documents">
          <DocumentDetails />
        </TabPanel>
      </TabView>

      <Grid container>
        {showCommentBox()}

        {showReviewerComment()}
      </Grid>
    </Box>
  );
}
