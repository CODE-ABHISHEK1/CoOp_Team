import React from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useThemeMode } from "../context/ThemeContext";

const Settings = () => {
  const theme = useTheme(); 
  const { mode, toggleTheme } = useThemeMode();

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
            bgcolor: "background.paper", //  Dynamic
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 4, color: "text.primary" }}
          >
            Settings
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={mode === "dark"}
                onChange={toggleTheme}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "primary.main",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "primary.main",
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: "text.primary" }}>Dark Mode</Typography>
            }
          />

          <Divider sx={{ my: 3, borderColor: "divider" }} />
          <Typography variant="body2" color="text.secondary">
            More settings coming soon...
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Settings;
