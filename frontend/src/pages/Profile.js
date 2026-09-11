import React from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const theme = useTheme(); //  Access current theme
  const { user } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper
          sx={{
            p: 5,
            borderRadius: 3,
            bgcolor: "background.paper", //  Was '#1e293b'
            border: `1px solid ${theme.palette.divider}`, //  Was '#334155'
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              mx: "auto",
              mb: 3,
              fontSize: "2.5rem",
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>

          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
          >
            {user?.name}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {user?.email}
          </Typography>

          <Chip
            label={user?.role || "User"}
            sx={{
              bgcolor: "action.hover", //  Was '#334155'
              color: "text.primary", //  Was '#f8fafc'
              fontWeight: 600,
              borderRadius: 1,
            }}
          />

          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Member since{" "}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Profile;
