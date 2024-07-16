import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Chart, { useChart } from "./../../components/chart";

// ----------------------------------------------------------------------

export default function AppWebsiteVisits({
  title,
  subheader,
  chart,
  ...other
}) {
  const { labels, colors, series, options } = chart;

  console.log(labels);

  const chartOptions = useChart({
    colors,
    plotOptions: {
      bar: {
        columnWidth: "16%",
      },
    },
    fill: {
      type: series.map((i) => i.fill),
    },
    labels,
    xaxis: {
      categories: labels[0], // Ensure labels are set as categories in xaxis
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => {
          if (typeof value !== "undefined") {
            return `${value.toFixed(0)}`;
          }
          return value;
        },
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }}>
        {labels[0].length < 1 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "41vh",
            }}
          >
            No Data Found
          </Box>
        ) : (
          <Chart
            dir="ltr"
            type="bar" // Make sure this matches the type of chart you're intending to use
            series={series}
            options={chartOptions}
            width="100%"
            height={364}
          />
        )}
      </Box>
    </Card>
  );
}

AppWebsiteVisits.propTypes = {
  chart: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    series: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        fill: PropTypes.string,
      })
    ).isRequired,
    options: PropTypes.object,
  }).isRequired,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
