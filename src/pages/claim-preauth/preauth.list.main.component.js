import React, { useEffect } from 'react';
import PreAuthIPDListComponent from './preauthIPD.list.component';
import PreAuthOPDListComponent from './preauthOPD.list.component';
import { TabView, TabPanel } from 'primereact/tabview';
import { SplitButton } from 'primereact/splitbutton';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Box, Grid } from '@material-ui/core';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import DraftsOutlinedIcon from '@material-ui/icons/DraftsOutlined';
import ThumbDownAltOutlinedIcon from '@material-ui/icons/ThumbDownAltOutlined';
import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined';
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';
import { width } from '@material-ui/system';
import { PreAuthService } from '../../remote-api/api/claims-services';
import RateReviewIcon from '@material-ui/icons/RateReview';

export default function TemplateDemo() {
  const [count, setCount] = React.useState({
    approved: 0,
    cancelled: 0,
    draft: 0,
    rejected: 0,
    requested: 0,
    total: 0,
  });
  const [activeIndex, setActiveIndex] = React.useState(0);
  const preAuthService = new PreAuthService();
  let pas$ = preAuthService.getDashboardCount();
  useEffect(() => {
    pas$.subscribe(result => {
      setCount(result?.data);
    });
  }, []);

  const TileView = () => {
    return (
      <Box display={'flex'} flexWrap={'wrap'} marginBottom={'10px'}>
        {/* <Grid container spacing={2}> */}
          {/* <Grid item xs={6} sm={4} md={2}> */}
            <Box
              sx={{
                paddingRight: '1%',
                marginBottom: { xs: '5px', md: 0 },
                height: {
                  xs: '50px',
                  sm: '75px',
                  md: '100px',
                },
                width:{xs:"50%", sm:"33%", md:"20%"}
              }}>
              <Box
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, rgba(49, 60, 150, 0.9) 0%, rgba(49, 60, 150, 0.8) 100%)',
                  boxShadow: '0px 1px 1px 2px rgba(128,128,128,0.15)',
                  width: '100%',
                  height: '100%',
                  color: '#ffffff',
                  fontSize: { xs: '14px', sm: '16px' },
                  display: 'flex',
                  alignItems: 'center',
                }}>
                <AccountBalanceWalletOutlinedIcon
                  style={{
                    fill: '#fff',
                    width: '32px',
                    display: 'flex',
                    fontSize: '30px',
                    padding: '0px',
                    marginInline: '13px',
                  }}
                />
                {`Total (${count.total})`}
              </Box>
            </Box>
          {/* </Grid> */}
          {/* <Grid item xs={6} sm={4} md={2}> */}
            <Box
              sx={{
                paddingRight: '1%',
                marginBottom: { xs: '5px', md: 0 },
                height: {
                  xs: '50px',
                  sm: '75px',
                  md: '100px',
                },
                width:{xs:"50%", sm:"33%", md:"20%"}
              }}>
              <Box
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, rgba(1, 222, 116, 0.9) 0%, rgba(1, 222, 116,0.8) 100%)',
                  boxShadow: '0px 1px 1px 2px rgba(128,128,128,0.15)',
                  width: '100%',
                  height: '100%',
                  color: '#ffffff',
                  fontSize: { xs: '14px', sm: '16px' },
                  display: 'flex',
                  alignItems: 'center',
                }}>
                <ThumbUpAltOutlinedIcon
                  style={{ fill: '#fff', width: '32px', display: 'flex', fontSize: '30px', marginInline: '13px' }}
                />
                {`Approved (${count.approved})`}
              </Box>
            </Box>
          {/* </Grid> */}
          {/* <Grid item xs={6} sm={4} md={2}> */}
            <Box
              sx={{
                paddingRight: '1%',
                marginBottom: { xs: '5px', md: 0 },
                height: {
                  xs: '50px',
                  sm: '75px',
                  md: '100px',
                },
                width:{xs:"50%", sm:"33%", md:"20%"}
              }}>
              <Box
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, rgba(255,50,67,0.9) 0%, rgba(255,50,67,0.8) 100%)',
                  boxShadow: '0px 1px 1px 2px rgba(128,128,128,0.15)',
                  fontSize: '16px',
                  color: '#ffffff',
                  display: 'flex',
                  fontSize: { xs: '14px', sm: '16px' },
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                }}>
                <ThumbDownAltOutlinedIcon
                  style={{ fill: '#fff', width: '32px', display: 'flex', fontSize: '30px', marginInline: '13px' }}
                />
                {`Rejected (${count.rejected})`}
              </Box>
            </Box>
          {/* </Grid> */}
          {/* <Grid item xs={6} sm={4} md={2}> */}
            <Box
              sx={{
                paddingRight: '1%',
                marginBottom: { xs: '5px', md: 0 },
                height: {
                  xs: '50px',
                  sm: '75px',
                  md: '100px',
                },
                width:{xs:"50%", sm:"33%", md:"20%"}
              }}>
              <Box
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, rgba(4, 59, 92, 0.9) 0%, rgba(4, 59, 92, 0.8) 100%)',
                  boxShadow: '0px 1px 1px 2px rgba(128,128,128,0.15)',
                  fontSize: '16px',
                  color: '#ffffff',
                  display: 'flex',
                  fontSize: { xs: '14px', sm: '16px' },
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                }}>
                <RateReviewIcon
                  style={{ fill: '#fff', width: '32px', display: 'flex', fontSize: '30px', marginInline: '13px' }}
                />
                {`Requested (${count.requested})`}
              </Box>
            </Box>
          {/* </Grid> */}
          {/* <Grid item xs={6} sm={4} md={2}>
            <Box
              sx={{
                paddingRight: '1%',
                marginBottom: { xs: '5px', md: 0 },
                height: {
                  xs: '50px',
                  sm: '75px',
                  md: '100px',
                },
              }}>
              <Box
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, rgba(128,128,128,0.9) 0%, rgba(128,128,128, 0.8) 100%)',
                  boxShadow: '0px 1px 1px 2px rgba(128,128,128,0.15)',
                  color: '#ffffff',
                  display: 'flex',
                  fontSize: { xs: '14px', sm: '16px' },
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                }}>
                <DraftsOutlinedIcon
                  style={{ fill: '#fff', width: '32px', display: 'flex', fontSize: '30px', marginInline: '13px' }}
                />
                {`Draft (${count.draft})`}
              </Box>
            </Box>
          </Grid> */}
          {/* <Grid item xs={6} sm={4} md={2}> */}
            <Box
              sx={{
                marginBottom: { xs: '5px', md: 0 },
                paddingRight: { xs: '1%', md: '0%' },
                height: {
                  xs: '50px',
                  sm: '75px',
                  md: '100px',
                },
                width:{xs:"50%", sm:"33%", md:"20%"}
              }}>
              <Box
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, rgba(149,48,55,0.9) 0%, rgba(149,48,55, 0.8) 100%)',
                  boxShadow: '0px 1px 1px 2px rgba(128,128,128,0.15)',
                  color: '#ffffff',
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  fontSize: { xs: '14px', sm: '16px' },
                  alignItems: 'center',
                }}>
                <CancelOutlinedIcon
                  style={{ fill: '#fff', width: '32px', display: 'flex', fontSize: '30px', marginInline: '13px' }}
                />
                {`Cancelled (${count.cancelled})`}
              </Box>
            </Box>
          {/* </Grid> */}
        {/* </Grid> */}
      </Box>
    );
  };

  return (
    <div className="card">
      <TabView scrollable style={{ fontSize: '14px' }} activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
        <TabPanel leftIcon="pi pi-user mr-2" header="IPD Pre-Auth">
          <TileView />
          <PreAuthIPDListComponent />
        </TabPanel>
        <TabPanel leftIcon="pi pi-user-minus mr-2" header="OPD Pre-Auth">
          <TileView />
          <PreAuthOPDListComponent />
        </TabPanel>
      </TabView>
    </div>
  );
}
