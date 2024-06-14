import React from "react";
import ClaimsIPDPreAuthDetails from "../components/preauth-ipd/ClaimsPreAuthDetails";
import ClaimsOPDPreAuthDetails from "../components/preauth-opd/ClaimsPreAuthDetails";
import { useLocation } from "react-router-dom";

function useQuery1() {
  return new URLSearchParams(useLocation().search);
}

const SubmitPreauth = () => {
  const query1 = useQuery1();
  return query1.get("type") === "ipd" ? (
    <ClaimsIPDPreAuthDetails />
  ) : query1.get("type") === "opd" ? (
    <ClaimsOPDPreAuthDetails />
  ) : null;
};

export default SubmitPreauth;
