import { Grid } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import 'date-fns';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { PRE_AUTH_STATUS_MSG_MAP } from '../preauth.shared';
import PreAuthTimelineComponent from '../preauth.timeline.component';

export default function PreAuthTimeLineModal(props) {

    const { preAuth } = props;
    const history = useHistory();
    const [fullWidth, setFullWidth] = React.useState(true);
    const handleClose = () => {
        props.onClose();
    };


    return (
        <Dialog
            open={props.open}
            onClose={handleClose}
            fullWidth={fullWidth}

            aria-labelledby="form-dialog-title"
            disableEnforceFocus>
            <DialogTitle id="form-dialog-title">
                <Grid container>
                    <Grid item xs={8}>Preauth : {preAuth.id}</Grid>
                    <Grid item xs={4}><span style={{ float: 'right' }}>{PRE_AUTH_STATUS_MSG_MAP[preAuth.preAuthStatus]}</span></Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                <PreAuthTimelineComponent id={preAuth.id}/>
            </DialogContent>
            {/* <DialogActions>
            </DialogActions> */}
        </Dialog>
    );
}
