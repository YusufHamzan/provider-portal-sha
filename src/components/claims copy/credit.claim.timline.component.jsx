import * as React from "react";
import { EO2V2DocTimeline } from "../eo2v2.doc.timeline";
import {
  ClaimService,
} from "../../remote-api/api/claim-services";
import { useParams } from "react-router-dom";
import { REIM_STATUS_MSG_MAP } from "../../utils/helper";

const reimbursementService = new ClaimService();

export default function CreditClaimsTimelineComponent(props) {
  
  const providerId = localStorage.getItem("providerId");

  const { id } = useParams();
  const [timeLine, setTimeLine] = React.useState([]);
  if (!timeLine.length) {
    if (id || props.id) {
      reimbursementService
        .getReimbursementById(id, providerId)
        .subscribe((preAuth) => {
          let data = preAuth.timeLine || [];
          let tl = data.map((timeLine) => ({
            timestamp: new Date(timeLine.dateTime),
            title: REIM_STATUS_MSG_MAP[timeLine.status],
            description: timeLine.comment || "--",
          }));
          setTimeLine([...tl]);
        });
    }
  }
  return <EO2V2DocTimeline timeline={timeLine} />;
}
