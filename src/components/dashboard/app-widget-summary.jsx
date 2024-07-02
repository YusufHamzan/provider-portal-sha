import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { fShortenNumber } from "../../utils/dates";

// ----------------------------------------------------------------------

export default function AppWidgetSummary({
  title,
  total,
  icon,
  total2,
  label,
  color = "primary",
  sx,
  ...other
}) {
  return (
    <Card
      component={Stack}
      spacing={3}
      direction="row"
      sx={{
        px: 3,
        py: 5,
        borderRadius: 2,
        ...sx,
      }}
      {...other}
    >
      {icon && <Box sx={{ width: 40, height: 40 }}>{icon}</Box>}

      <Stack spacing={0.5} sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="h5" fontWeight={"bold"}>
            {fShortenNumber(total)}
            <br />
            <span
              style={{ fontWeight: "500", color: "gray", fontSize: "12px" }}
            >
              {label[0]}
            </span>
          </Typography>
          <br />
          <Typography variant="h5" fontWeight={"bold"}>
            {fShortenNumber(total2)}
            <br />
            <span
              style={{ fontWeight: "500", color: "gray", fontSize: "12px" }}
            >
              {label[1]}
            </span>
          </Typography>
        </Box>
        {/* <Typography variant="subtitle2" sx={{ color: "text.disabled" }}>
          {title}
        </Typography> */}
      </Stack>
    </Card>
  );
}

AppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  sx: PropTypes.object,
  title: PropTypes.string,
  total: PropTypes.number,
};
