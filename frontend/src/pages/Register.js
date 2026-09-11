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
  Stepper,
  Step,
  StepLabel,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const next = () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    setStep(1);
  };
  const back = () => {
    setStep(0);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

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
      <Box sx={{ mt: 8, mb: 4 }}>
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
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1.8rem",
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
                Create Account
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Join CoOp and start collaborating
              </Typography>
            </Box>

            <Stepper activeStep={step} sx={{ mb: 4 }}>
              <Step>
                <StepLabel
                  sx={{ "& .MuiStepLabel-label": { color: "text.secondary" } }}
                >
                  Personal Info
                </StepLabel>
              </Step>
              <Step>
                <StepLabel
                  sx={{ "& .MuiStepLabel-label": { color: "text.secondary" } }}
                >
                  Account Details
                </StepLabel>
              </Step>
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {step === 0 ? (
                <TextField
                  fullWidth
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  margin="normal"
                  required
                  sx={inputSx}
                />
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    margin="normal"
                    required
                    sx={inputSx}
                  />
                  {/* Password Field */}
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
                          paddingRight: "60px",
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

                  {/* Confirm Password Field */}
                  <Box sx={{ position: "relative", mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPw ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          paddingRight: "60px",
                          "& fieldset": { borderColor: "divider" },
                        },
                        "& .MuiInputLabel-root": { color: "text.secondary" },
                        "& .MuiInputBase-input": { color: "text.primary" },
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
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
                        color: showConfirmPw
                          ? "primary.main"
                          : "text.secondary",
                        zIndex: 5,
                        bgcolor: "action.hover",
                        "&:hover": { bgcolor: "action.selected" },
                      }}
                    >
                      {showConfirmPw ? "Hide" : "Show"}
                    </Button>
                  </Box>
                </>
              )}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Button
                  disabled={step === 0}
                  onClick={back}
                  sx={{ color: "text.secondary" }}
                >
                  Back
                </Button>
                {step === 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: 2,
                    }}
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={next}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: 2,
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </form>

            <Typography align="center" sx={{ mt: 3, color: "text.secondary" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Register;
