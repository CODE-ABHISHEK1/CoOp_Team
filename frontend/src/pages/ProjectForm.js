import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Chip,
  Avatar,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import projectService from "../services/projectService";
import userService from "../services/userService";
import toast from "react-hot-toast";
import UniversalSelect from "../components/UniversalSelect";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../utils/dropdownOptions";
import { useAuth } from "../context/AuthContext";

const ProjectForm = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    endDate: "",
    members: [],
  });
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAll();
        const otherUsers = users.filter((u) => u._id !== user?._id);
        setAllUsers(otherUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  const handleAddMember = () => {
    if (!selectedUserId) return;
    if (form.members.includes(selectedUserId)) {
      toast.error("User already added");
      return;
    }
    setForm((prev) => ({
      ...prev,
      members: [...prev.members, selectedUserId],
    }));
    setSelectedUserId("");
  };

  const handleRemoveMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.filter((id) => id !== userId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanMembers = form.members.filter(
        (id) => id && typeof id === "string" && id !== user?._id,
      );

      await projectService.create({
        name: form.name,
        description: form.description,
        status: form.status,
        priority: form.priority,
        endDate: form.endDate,
        members: cleanMembers,
      });

      
      localStorage.setItem("dashboardRefresh", Date.now().toString());

      toast.success("Project created! 🎉");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "background.paper",
      borderRadius: 2,
      "& fieldset": { borderColor: "divider" },
    },
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiInputBase-input": { color: "text.primary" },
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6, mb: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Paper
            sx={{
              p: 5,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
            >
              Create New Project
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 4 }}>
              Fill in the details below to get started.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Project Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                margin="normal"
                required
                sx={inputSx}
              />
              <TextField
                fullWidth
                label="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                margin="normal"
                multiline
                rows={3}
                sx={inputSx}
              />

              <UniversalSelect
                variant="standard"
                label="Status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(val) => setForm({ ...form, status: val })}
              />
              <UniversalSelect
                variant="standard"
                label="Priority"
                options={PRIORITY_OPTIONS}
                value={form.priority}
                onChange={(val) => setForm({ ...form, priority: val })}
              />

              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    ml: 1,
                    color: "text.secondary",
                    fontWeight: 600,
                    mb: 1,
                    display: "block",
                  }}
                >
                  Team Members (Optional)
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}
                >
                  <Box sx={{ flex: 1 }}>
                    <UniversalSelect
                      variant="standard"
                      options={allUsers.map((u) => ({
                        value: u._id,
                        label: u.name,
                        icon: (
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: "0.7rem",
                              bgcolor: "primary.main",
                            }}
                          >
                            {u.name?.[0]?.toUpperCase()}
                          </Avatar>
                        ),
                      }))}
                      value={selectedUserId}
                      onChange={setSelectedUserId}
                      placeholder="Search users to add..."
                    />
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={handleAddMember}
                    disabled={!selectedUserId}
                    sx={{
                      height: 48,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Add
                  </Button>
                </Box>

                {form.members.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {form.members.map((userId) => {
                      const userObj = allUsers.find((u) => u._id === userId);
                      return userObj ? (
                        <Chip
                          key={userId}
                          avatar={
                            <Avatar
                              sx={{
                                bgcolor: "secondary.main",
                                width: 24,
                                height: 24,
                                fontSize: "0.7rem",
                              }}
                            >
                              {userObj.name?.[0]?.toUpperCase()}
                            </Avatar>
                          }
                          label={userObj.name}
                          onDelete={() => handleRemoveMember(userId)}
                          deleteIcon={
                            <CloseIcon
                              sx={{
                                color: "text.secondary",
                                "&:hover": { color: "error.main" },
                              }}
                            />
                          }
                          sx={{
                            bgcolor: "action.hover",
                            color: "text.primary",
                            "& .MuiChip-deleteIcon": {
                              color: "text.secondary",
                            },
                          }}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              </Box>

              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  color: "text.secondary",
                  fontWeight: 600,
                  mb: 1,
                  display: "block",
                }}
              >
                End Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  ...inputSx,
                  "& .MuiSvgIcon-root": { color: "text.secondary" },
                }}
              />

              <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {loading ? "Creating..." : "Create Project"}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => navigate("/dashboard")}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    borderColor: "divider",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                    },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default ProjectForm;
