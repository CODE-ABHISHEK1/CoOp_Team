import React from "react";
import { Box, CircularProgress } from "@mui/material";

const Loading = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      bgcolor: "#0f172a",
    }}
  >
    <CircularProgress sx={{ color: "#667eea" }} />
  </Box>
);

export default Loading;
