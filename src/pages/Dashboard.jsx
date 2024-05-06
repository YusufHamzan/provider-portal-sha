// const Dashboard = () => {
//   return <h1>Dashborad : Coming Soon</h1>;
// };
// export default Dashboard;



import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import AppWidgetSummary from '../components/dashboard/app-widget-summary';
import AppWebsiteVisits from '../components/dashboard/app-website-visits';
import AppCurrentVisits from '../components/dashboard/app-current-visits';


// ----------------------------------------------------------------------

export default function Dashboard() {

  return (
    <Container maxWidth="xl">
      <Typography variant="h6" fontWeight={"bold"} sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Last Claim"
            total={50000}
            color="success"
            icon={<img alt="icon" src="/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="IPD Claims"
            total={250000}
            color="info"
            icon={<img alt="icon" src="/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="OPD Claims"
            total={75000}
            color="warning"
            icon={<img alt="icon" src="/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Balance"
            total={175000}
            color="error"
            icon={<img alt="icon" src="/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Claims History"
            subheader="(+43%) than last year"
            chart={{
              labels: [
                '01/01/2023',
                '02/01/2023',
                '03/01/2023',
                '04/01/2023',
                '05/01/2023',
                '06/01/2023',
                '07/01/2023',
                '08/01/2023',
                '09/01/2023',
                '10/01/2023',
                '11/01/2023',
              ],
              series: [
                {
                  name: 'IPD',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: 'OPD',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: 'Rejected',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ],
            }}
          />
        </Grid>


        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Diagnosis"
            chart={{
              series: [
                { label: 'IPD', value: 4344 },
                { label: 'OPD', value: 5435 },
                { label: 'Rejected', value: 1443 },
                { label: 'Maternity', value: 4443 },
              ],
            }}
          />
        </Grid>

      </Grid>
    </Container>
  );
}
