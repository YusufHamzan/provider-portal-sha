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
import Signup from '../pages/signup';
import ThankYou from '../pages/thank-you';
import SubmitCreditClaim from '../pages/SubmitCreditClaim';
// import TotalPayableAmount from '../pages/TotalPayableAmount';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/membereligibility" element={<MemberEligibility />} />
      <Route path="/preauths" element={<Preauth />} />
      <Route path="/preauths/submit-preauth" element={<SubmitPreauth />} />
      <Route path="/preauths/submit-preauth/:id" element={<SubmitPreauth />} />
      <Route path="/claims" element={<Claims />} />
      <Route path="/credit-claims" element={<CreditClaims />} />
      <Route path="/paymenthistory" element={<PaymentHistory />} />
      <Route path="/providerstatement" element={<ProviderStatement />} />
      <Route path="/submit-claim" element={<SubmitClaim />} />
      <Route path="/submit-claim/:id" element={<SubmitClaim />} />
      <Route path="/submit-credit-claims" element={<SubmitCreditClaim />} />
      <Route path="/submit-credit-claims/:id" element={<SubmitCreditClaim />} />
      <Route path="/view/:id" element={<PreauthView />} />


      {/* <Route path="/claims/preauths" element={<Claims />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/policy/:policyNumber" element={<MemberList />} />
      <Route path="/policy/:policyNumber/:membershipNo" element={<Claims />} />*/}
    </Routes>
  );
}
