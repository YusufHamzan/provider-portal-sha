import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Claims from '../pages/Claims';
import Policy from '../pages/Policy';
import Providers from '../pages/Providers';
import SubmitClaim from '../pages/SubmitCliam';
import SubmitPreauth from '../pages/SubmitPreauth';
import MemberList from '../pages/MemberList';
import Preauth from '../pages/Preauth';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/membereligibility" element={<Dashboard />} />
      <Route path="/preauths" element={<Preauth />} />
      <Route path="/claims" element={<Claims />} />
      <Route path="/paymenthistory" element={<Providers />} />
      <Route path="/providerstatement" element={<Providers />} />
      <Route path="/totalpayableamount" element={<Providers />} />


      {/* <Route path="/claims/preauths" element={<Claims />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/policy/:policyNumber" element={<MemberList />} />
      <Route path="/policy/:policyNumber/:membershipNo" element={<Claims />} />
      <Route path="/submit-claim" element={<SubmitClaim />} />
      <Route path="/submit-preauth" element={<SubmitPreauth />} /> */}
    </Routes>
  );
}
