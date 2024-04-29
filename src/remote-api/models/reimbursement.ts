import { BenefitWithCost } from "./benefit.with.cost"

export interface Reimbursement { 
    id: "",
    preAuthStatus: "",
    policyNumber: "",
    memberShipNo: "",
    expectedDOA: 0,
    expectedDOD: 0,
    contactNoOne: "",
    contactNoTwo: "",
    referalTicketRequired:"",
    benefitsWithCost: BenefitWithCost[],
    providers:[{
      providerId:"",
      estimatedCost:0
    }],
    services:[{
      serviceId:"",
      estimatedCost:0
    }],
    documents:[{
      documentType:"",
      documentName:"",
      documentOriginalName:"",
      docFormat:""
    }],
    decission:"",
    comment:""
    timeLine:[{
      status:"",
      dateTime:0,
      comment:""
    }]
 }