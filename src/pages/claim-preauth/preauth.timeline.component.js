
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { PreAuthService } from '../../remote-api/api/claims-services';
import { EO2V2DocTimeline } from '../../shared-components/components/eo2v2.doc.timeline';
import { PRE_AUTH_STATUS_MSG_MAP } from './preauth.shared';


const preAuthService = new PreAuthService();

export default function PreAuthTimelineComponent(props) {

    const { id } = useParams();
    const [timeLine,setTimeLine] =React.useState([{}]);

    if(id || props.id){
        preAuthService.getPreAuthById(id || props.id).subscribe(preAuth=>{
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