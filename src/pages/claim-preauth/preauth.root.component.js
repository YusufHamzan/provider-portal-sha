import Grid from '@material-ui/core/Grid';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import ClaimsDetailsComponent from './preauth.details.component';
import PreAuthListComponent from './preauth.list.main.component';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ClaimsPreAuth() {
  const history = useHistory();
  const query = useQuery();

  return (
    <div>
      {query.get('mode') === 'create' ? (
        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '20px',
            height: '2em',
            color: '#000',
            fontSize: '18px',
            fontWeight: 600,
          }}>
          <span
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            Claim Management- Create Pre-Auth Claim
          </span>
        </Grid>
      ) : null}

      {(() => {
        switch (query.get('mode')) {
          case 'viewList':
            return <PreAuthListComponent />;
          case 'create':
            return <ClaimsDetailsComponent />;
          default:
            history.push('/claims/claims-preauth?mode=viewList');
        }
      })()}
    </div>
  );
}
