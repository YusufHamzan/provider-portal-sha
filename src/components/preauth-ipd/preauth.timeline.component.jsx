
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { PreAuthService } from '../../remote-api/api/claim-services';
import { EO2V2DocTimeline } from '../eo2v2.doc.timeline';
import { PRE_AUTH_STATUS_MSG_MAP } from '../../utils/helper';


const preAuthService = new PreAuthService();

export default function PreAuthTimelineComponent(props) {
    const providerId = localStorage.getItem("providerId");

    const { id } = useParams();
    const [timeLine,setTimeLine] =React.useState([{}]);

    if(id || props.id){
        preAuthService.getPreAuthById(id, providerId).subscribe(preAuth=>{
            let data = preAuth.timeLine || [];
            let tl=data.map(timeLine=> ({
                timestamp: new Date(timeLine.dateTime),
                title : PRE_AUTH_STATUS_MSG_MAP[timeLine.status],
                description: timeLine.comment || '--'    
            }));
            setTimeLine(tl);
        });
    }


    return (
        <EO2V2DocTimeline timeline={timeLine} />

    );

}