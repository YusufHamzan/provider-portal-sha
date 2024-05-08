import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Claims from '../pages/Claims';
import Preauth from '../pages/Preauth';
import MemberEligibility from '../pages/MemberEligibility';
import PaymentHistory from '../pages/PaymentHistory';
import ProviderStatement from '../pages/ProviderStatement';
import SubmitPreauth from '../pages/SubmitPreauth';
import PreauthView from "../pages/PreauthView"
import SubmitClaim from '../pages/SubmitClaim';
import CreditClaims from '../pages/CreditClaims';
// import TotalPayableAmount from '../pages/TotalPayableAmount';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/membereligibility" element={<MemberEligibility />} />
      <Route path="/preauths" element={<Preauth />} />
      <Route path="/claims" element={<Claims />} />
      <Route path="/credit-claims" element={<CreditClaims />} />
      <Route path="/paymenthistory" element={<PaymentHistory />} />
      <Route path="/providerstatement" element={<ProviderStatement />} />
      {/* <Route path="/totalpayableamount" element={<TotalPayableAmount />} /> */}
      <Route path="/submit-claim" element={<SubmitClaim />} />
      <Route path="/submit-claim/:id" element={<SubmitClaim />} />
      <Route path="/submit-preauth" element={<SubmitPreauth />} /> 
      <Route path="/submit-preauth/:id" element={<SubmitPreauth />} /> 
      <Route path="/view-preauth/:id" element={<PreauthView />} /> 


      {/* <Route path="/claims/preauths" element={<Claims />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/policy/:policyNumber" element={<MemberList />} />
      <Route path="/policy/:policyNumber/:membershipNo" element={<Claims />} />*/}
    </Routes>
  );
}
