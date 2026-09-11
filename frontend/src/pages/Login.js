import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const theme = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic input styling based on theme
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "background.paper",
      borderRadius: 2,
      paddingRight: "4px",
      "& fieldset": { borderColor: "divider" },
    },
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiInputBase-input": { color: "text.primary" },
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            sx={{
              p: 5,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "2rem",
                  mx: "auto",
                  mb: 2,
                }}
              >
                C
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                Welcome Back
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Sign in to continue to CoOp
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                margin="normal"
                required
                sx={inputSx}
              />

              {/* <TextField
                fullWidth
                label="Password"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                margin="normal"
                required
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" sx={{ mr: 0.5 }}>
                      <IconButton
                        onClick={() => setShowPw(!showPw)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                        sx={{
                          color: showPw ? "primary.main" : "text.secondary",
                          bgcolor: "action.hover",
                          borderRadius: 1,
                          p: 1,
                          "&:hover": {
                            bgcolor: "action.selected",
                            color: "primary.main",
                          },
                        }}
                      >
                        {showPw ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              /> */}

              <Box sx={{ position: "relative", mt: 2 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      paddingRight: "60px", // Reserves space so text doesn't hide under the button
                      "& fieldset": { borderColor: "divider" },
                    },
                    "& .MuiInputLabel-root": { color: "text.secondary" },
                    "& .MuiInputBase-input": { color: "text.primary" },
                  }}
                />
                <Button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  sx={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    minWidth: "auto",
                    px: 1.5,
                    py: 0.5,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: showPw ? "primary.main" : "text.secondary",
                    zIndex: 5,
                    bgcolor: "action.hover",
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  {showPw ? "Hide" : "Show"}
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <Typography align="center" sx={{ mt: 3, color: "text.secondary" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Login;
