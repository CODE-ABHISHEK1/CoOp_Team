import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => (
  <Container maxWidth="sm" sx={{ mt: 15, textAlign: "center" }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Typography
        variant="h1"
        className="gradient-text"
        sx={{ fontWeight: 800, fontSize: "6rem" }}
      >
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, color: "#94a3b8" }}>
        Page Not Found
      </Typography>
      <Button
        component={Link}
        to="/dashboard"
        variant="contained"
        size="large"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 2,
          px: 4,
          py: 1.5,
        }}
      >
        Go to Dashboard
      </Button>
    </motion.div>
  </Container>
);

export default NotFound;
