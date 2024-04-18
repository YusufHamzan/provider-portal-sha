import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Claims from '../pages/Claims';
import Preauth from '../pages/Preauth';
import MemberEligibility from '../pages/MemberEligibility';
import PaymentHistory from '../pages/PaymentHistory';
import ProviderStatement from '../pages/ProviderStatement';
// import TotalPayableAmount from '../pages/TotalPayableAmount';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/membereligibility" element={<MemberEligibility />} />
      <Route path="/preauths" element={<Preauth />} />
      <Route path="/claims" element={<Claims />} />
      <Route path="/paymenthistory" element={<PaymentHistory />} />
      <Route path="/providerstatement" element={<ProviderStatement />} />
      {/* <Route path="/totalpayableamount" element={<TotalPayableAmount />} /> */}


      {/* <Route path="/claims/preauths" element={<Claims />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/policy/:policyNumber" element={<MemberList />} />
      <Route path="/policy/:policyNumber/:membershipNo" element={<Claims />} />
      <Route path="/submit-claim" element={<SubmitClaim />} />
      <Route path="/submit-preauth" element={<SubmitPreauth />} /> */}
    </Routes>
  );
}
