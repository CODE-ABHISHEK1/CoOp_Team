import React from "react";
import { Box, Typography } from "@mui/material";

const StatCard = ({ title, value, icon, color }) => (
  <Box
    sx={{
      p: 3,
      bgcolor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: 2,
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        bgcolor: `${color}20`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#f8fafc" }}>
        {value}
      </Typography>
      <Typography variant="body2" color="#94a3b8">
        {title}
      </Typography>
    </Box>
  </Box>
);

export default StatCard;
