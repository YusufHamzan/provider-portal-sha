import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { styled, useTheme } from "@mui/material/styles";
import Chart, { useChart } from "./../../components/chart";
import { fNumber } from "../../utils/dates";

const CHART_HEIGHT = 400;
const LEGEND_HEIGHT = 72;

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  "& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject": {
    height: "100% !important",
  },
  "& .apexcharts-legend": {
    height: LEGEND_HEIGHT,
    borderTop: `dashed 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

export default function AppCurrentVisits({
  title,
  subheader,
  chart,
  subValue,
  ...other
}) {
  const theme = useTheme();
  const { colors, series, options } = chart;
  const chartSeries = series.map((i) => i.value);

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors,
    labels: series.map((i) => i.label),
    stroke: {
      colors: [theme.palette.background.paper],
    },
    legend: {
      floating: true,
      position: "bottom",
      horizontalAlign: "center",
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value) => fNumber(value),
        title: {
          formatter: (seriesName) => seriesName,
        },
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        // // const title = w.globals.labels[dataPointIndex];
        // // const value = series[seriesIndex][dataPointIndex];
        // console.log(title, value);
        // let tooltipContent = "";

        // // if (series && series.length > seriesIndex) {
        // tooltipContent += `<div class="apexcharts-tooltip-subvalue"><b>${chart.series[seriesIndex].label}</b>: ${chart.series[seriesIndex].value}</div>`;
        // // }
        // let tooltipContent = `<div class="apexcharts-tooltip-title">Count: ${chart.series[seriesIndex].value}</div>`;
        let tooltipContent = `<div class="apexcharts-tooltip-title">${chart.series[seriesIndex].label}: ${chart.series[seriesIndex].value}</div>`;

        // if (subValue && subValue.length > seriesIndex) {
        //   tooltipContent += `<div class="apexcharts-tooltip-subvalue" style="text-align: center;">STATUS</div>`;
        // }

        return tooltipContent;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 5 }} />
      <StyledChart
        key={JSON.stringify(chartSeries)} // Using a key to force re-render when data changes
        dir="ltr"
        type="pie"
        series={chartSeries}
        options={chartOptions}
        width="100%"
        height={280}
      />
    </Card>
  );
}

AppCurrentVisits.propTypes = {
  chart: PropTypes.shape({
    colors: PropTypes.array,
    series: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.number,
      })
    ),
    options: PropTypes.object,
  }).isRequired,
  subheader: PropTypes.string,
  title: PropTypes.string.isRequired,
  subValue: PropTypes.arrayOf(PropTypes.string),
};
