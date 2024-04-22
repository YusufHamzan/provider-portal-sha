const PreAuthReviewModel= {
    member : {membershipNo:"",name:"",relations:"",age:0,policyNumber:"",policyStartDate:0,policyEndDate:0},
    preAuth: {id: "",
    preAuthStatus: "",
    policyNumber: "",
    memberShipNo: "",
    expectedDOA: 0,
    expectedDOD: 0,
    contactNoOne: "",
    contactNoTwo: "",
    referalTicketRequired:"",
    benefitsWithCost: [{ 
      benefitId: "",
      estimatedCost: 0,
      maxApprovedCost: 0,
      copayAmount: 0,
      comment: "",
      ruleId: "",
      coverType: "",
      benefitName:""
   }],
    providers:[{
      providerId:"",
      estimatedCost:0,
      providerName:""
    }],
    services:[{
      serviceId:"",
      estimatedCost:0,
      serviceName:""
    }],
    documents:[{
      documentType:"",
      documentName:"",
      documentOriginalName:"",
      docFormat:""
    }],
    decission:"",
    comment:""}
  };

  


export default function preAuthReviewModel(){ 
  return PreAuthReviewModel;
};

export const PRE_AUTH_STATUS_MSG_MAP={
  "PENDING_EVALUATION":"Pending Evaluation",
  "EVALUATION_INPROGRESS":"Evaluation in progress",
  "REQUESTED":"Requested for evaluation",
  "APPROVED":"Approved",
  "REJECTED":"Rejected",
  "ADD_DOC_REQUESTED":"Document requested",
  "APPROVED_FAILED":"Approved failed",
  "DRAFT":"Draft",
  "WAITING_FOR_CLAIM":"Waiting for Claim",
  "CANCELLED":"Cancelled",
  "REVERTED": "Reverted"

}