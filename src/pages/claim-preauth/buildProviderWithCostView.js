import { Grid, TextField } from '@material-ui/core';
import * as React from 'react';

  const BuildProviderWithCostView = (props) => {
    const {provider, handleApproveProviderAmount} = props;
    const [approvedCost, setApprovedCost] = React.useState();

      React.useEffect(()=>{
      setApprovedCost(provider?.approvedCost)
    },[])
  
    // let approvedCost = provider?.approvedCost
    
    return (
      <Grid container style={{ margin: "10px 0" }}>
        <Grid item xs={4}>
          {provider?.providerName}
        </Grid>
        <Grid item xs={4}>
          {provider?.estimatedCost}
        </Grid>
        <Grid item xs={4}>
          {approvedCost}
          <TextField
            type='number'
            defaultValue={approvedCost}
            // defaultValue={provider?.approvedCost}
            Value={approvedCost}
            id={`approveProviderAmount-${provider?.providerId}`}
            name={`approveProviderAmount-${provider?.providerId}`}
            onChange={(e) => handleApproveProviderAmount(e, provider)}
          />
        </Grid>
      </Grid>
    );
  };


  export default BuildProviderWithCostView;