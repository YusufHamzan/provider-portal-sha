// const Dashboard = () => {
//   return <h1>Dashborad : Coming Soon</h1>;
// };
// export default Dashboard;

import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import AppWidgetSummary from "../components/dashboard/app-widget-summary";
import AppWebsiteVisits from "../components/dashboard/app-website-visits";
import AppCurrentVisits from "../components/dashboard/app-current-visits";
import { ClaimService } from "../remote-api/api/claim-services";
import { useKeycloak } from "@react-keycloak/web";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Box, Button, ButtonGroup } from "@mui/material";
import ReactApexChart from "react-apexcharts";

// ----------------------------------------------------------------------
const claimservice = new ClaimService();

export default function Dashboard() {
  // const { keycloak } = useKeycloak();
  // let token = window["getToken"] && window["getToken"]();
  // const { name } = jwtDecode(token);
  // const data = [
  //   {
  //     ipdPreauthCount: 3,
  //     ipdPreauthAmount: 48421.0,
  //     opdPreauthCount: 64,
  //     opdPreauthAmount: 26,
  //     ipdClaimCount: 11,
  //     ipdClaimAmount: 22,
  //     opdClaimCount: 54,
  //     opdClaimAmount: 24,
  //   },
  //   {
  //     ipdPreauthCount: 56,
  //     ipdPreauthAmount: 35450.0,
  //     opdPreauthCount: 22,
  //     opdPreauthAmount: 36,
  //     ipdClaimCount: 12,
  //     ipdClaimAmount: 14,
  //     opdClaimCount: 62,
  //     opdClaimAmount: 13,
  //   },
  //   {
  //     ipdPreauthCount: 145,
  //     ipdPreauthAmount: 91550.0,
  //     opdPreauthCount: 2,
  //     opdPreauthAmount: 82.0,
  //     ipdClaimCount: 88,
  //     ipdClaimAmount: 64,
  //     opdClaimCount: 11,
  //     opdClaimAmount: 10,
  //   },
  //   {
  //     ipdPreauthCount: 145,
  //     ipdPreauthAmount: 91550.0,
  //     opdPreauthCount: 2,
  //     opdPreauthAmount: 89.0,
  //     ipdClaimCount: 28,
  //     ipdClaimAmount: 63,
  //     opdClaimCount: 14,
  //     opdClaimAmount: 47,
  //   },
  // ];
  const [dashCount, setDashCount] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  function convertToArray(data) {
    return Object.keys(data).map((key) => {
      const periodData = data[key];
      return {
        period: key.replace("Data", "").toLowerCase(),
        ...periodData,
      };
    });
  }

  const buttons = [
    <Button key="four" onClick={() => setActiveIndex(0)}>
      Day
    </Button>,
    <Button key="three" onClick={() => setActiveIndex(1)}>
      Weak
    </Button>,
    <Button key="two" onClick={() => setActiveIndex(2)}>
      Month
    </Button>,
    <Button key="one" onClick={() => setActiveIndex(3)}>
      Year
    </Button>,
  ];
  useEffect(() => {
    let subscription = claimservice
      .getAllDashboardCount(localStorage.getItem("providerId"))
      .subscribe((result) => {
        const resultResponse = convertToArray(result);
        setDashCount(resultResponse);
      });
    return () => subscription.unsubscribe();
  }, []);

  // console.log(dashCount[activeIndex]);
  // const series = [
  //   {
  //     name: "Sales",
  //     data: [30, 40, 45, 50, 49, 60, 70, 91, 125],
  //   },
  // ];

  // const options = {
  //   chart: {
  //     type: "bar",
  //     height: 550,
  //   },
  //   plotOptions: {
  //     bar: {
  //       horizontal: true,
  //       columnWidth: "55%",
  //       endingShape: "rounded",
  //     },
  //   },
  //   dataLabels: {
  //     enabled: false,
  //   },
  //   stroke: {
  //     show: true,
  //     width: 2,
  //     colors: ["transparent"],
  //   },
  //   xaxis: {
  //     categories: [
  //       "Jan",
  //       "Feb",
  //       "Mar",
  //       "Apr",
  //       "May",
  //       "Jun",
  //       "Jul",
  //       "Aug",
  //       "Sep",
  //     ],
  //   },
  //   yaxis: {
  //     title: {
  //       text: "Sales (thousands)",
  //     },
  //   },
  //   fill: {
  //     opacity: 1,
  //   },
  //   tooltip: {
  //     y: {
  //       formatter: function (val) {
  //         return "$" + val + " thousands";
  //       },
  //     },
  //   },
  // };

  return (
    <Container maxWidth="xl">
      <Typography variant="h6" fontWeight={"bold"} sx={{ mb: 2 }}>
        Hi, Welcome back 👋
      </Typography>
      <Box
        sx={{
          // display: "flex",
          marginBottom: "10px",
          // flexDirection: "column",
          // alignItems: "center",
          // "& > *": {
          //   m: 1,
          // },
        }}
      >
        <ButtonGroup size="small" aria-label="Small button group" activeIndex>
          {buttons}
        </ButtonGroup>
        {/* <ButtonGroup color="secondary" aria-label="Medium-sized button group">
          {buttons}
        </ButtonGroup>
        <ButtonGroup size="large" aria-label="Large button group">
          {buttons}
        </ButtonGroup> */}
      </Box>
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Last Claim"
            label={["IPD Auth Count", "IPD Auth Amount"]}
            total={dashCount[activeIndex]?.ipdPreauthCount || "NA"}
            total2={dashCount[activeIndex]?.ipdPreauthAmount || "NA"}
            color="success"
            icon={<img alt="icon" src="/icons/glass/health.svg" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="IPD Claims"
            label={["OPD Auth Count", "OPD Auth Amount"]}
            total={dashCount[activeIndex]?.opdPreauthCount || "NA"}
            total2={dashCount[activeIndex]?.opdPreauthAmount || "NA"}
            color="info"
            icon={<img alt="icon" src="/icons/glass/health.svg" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="OPD Claims"
            label={["IPD Claim Count", "IPD Claim Amount"]}
            total={dashCount[activeIndex]?.ipdClaimCount || "NA"}
            total2={dashCount[activeIndex]?.ipdClaimAmount || "NA"}
            color="warning"
            icon={<img alt="icon" src="/icons/glass/health.svg" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Balance"
            label={["OPD Claim Count", "OPD Claim Amount"]}
            total={dashCount[activeIndex]?.opdClaimCount || "NA"}
            total2={dashCount[activeIndex]?.opdClaimAmount || "NA"}
            color="error"
            icon={<img alt="icon" src="/icons/glass/health.svg" />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Claims History"
            subheader="(+43%) than last year"
            chart={{
              labels: [
                "01/01/2023",
                "02/01/2023",
                "03/01/2023",
                "04/01/2023",
                "05/01/2023",
                "06/01/2023",
                "07/01/2023",
                "08/01/2023",
                "09/01/2023",
                "10/01/2023",
                "11/01/2023",
              ],
              series: [
                {
                  name: "IPD",
                  type: "column",
                  fill: "solid",
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: "OPD",
                  type: "area",
                  fill: "gradient",
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: "Rejected",
                  type: "line",
                  fill: "solid",
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ],
            }}
          />
          <AppWebsiteVisits
            sx={{ marginTop: "10px" }}
            title="Intervention TOP-5"
            subheader="(+43%) than last year"
            chart={{
              labels: [
                "01/01/2023",
                "02/01/2023",
                "03/01/2023",
                "04/01/2023",
                "05/01/2023",
              ],
              series: [
                {
                  name: "INT",
                  type: "column",
                  fill: "solid",
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: "OPD",
                  type: "area",
                  fill: "gradient",
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: "Rejected",
                  type: "line",
                  fill: "solid",
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ],
            }}
          />
          <AppWebsiteVisits
            sx={{ marginTop: "10px" }}
            title="DIAGNOSIS"
            subheader="(+43%) than last year"
            chart={{
              labels: ["01/01/2023", "02/01/2023", "03/01/2023", "04/01/2023"],
              series: [
                {
                  name: "IPD",
                  type: "column",
                  fill: "solid",
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: "OPD",
                  type: "area",
                  fill: "gradient",
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: "Rejected",
                  type: "line",
                  fill: "solid",
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
                { label: "IPD", value: 4344 },
                { label: "OPD", value: 5435 },
                { label: "Rejected", value: 1443 },
                { label: "Maternity", value: 4443 },
              ],
            }}
          />

          <AppCurrentVisits
            sx={{ marginTop: "10px" }}
            title="Age"
            chart={{
              series: [
                { label: "0-5 years", value: 1669 },
                { label: "6-20 years", value: 4521 },
                { label: "21-40 years", value: 3202 },
                { label: "41-60 years", value: 2169 },
                { label: "Above 60", value: 4999 },
              ],
            }}
          />
          <AppCurrentVisits
            sx={{ marginTop: "10px" }}
            title="Status Wise"
            chart={{
              series: [
                { label: "APPROVED", value: 1669 },
                { label: "UNDER PROCESS", value: 4521 },
                { label: "OTHER", value: 0 },
                { label: "REJECTED", value: 3202 },
              ],
            }}
            subValue={[
              "Approved Count Amount: 45",
              "Under Process Count Amount: 55",
              "Rejected Count Amount: 64",
              "Rejected Count Amount: 33",
            ]}
          />
          {/* <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          /> */}
        </Grid>
      </Grid>
    </Container>
  );
}
