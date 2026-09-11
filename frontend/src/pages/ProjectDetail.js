import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Backdrop,
  IconButton,
  Tooltip,
  useTheme,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowBack,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import projectService from "../services/projectService";
import taskService from "../services/taskService";
import userService from "../services/userService";
import { TaskCard, UniversalSelect } from "../components";
import toast from "react-hot-toast";
import { getStatusColor } from "../utils/helpers";
import {
  TASK_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from "../utils/dropdownOptions";
import { useAuth } from "../context/AuthContext";
import UserAvatarSelect from "../components/UserAvatarSelect";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "#9CA3AF" },
  { id: "in-progress", title: "In Progress", color: "#3B82F6" },
  { id: "review", title: "Review", color: "#F59E0B" },
  { id: "done", title: "Done", color: "#10B981" },
];

const ProjectDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
  });
  const [formError, setFormError] = useState("");
  const [taskAssignees, setTaskAssignees] = useState([]);
  const [potentialMembers, setPotentialMembers] = useState([]);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  //  NEW STATE FOR DELETE CONFIRMATION
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const fetchData = async () => {
    try {
      const proj = await projectService.getById(id);
      setProject(proj);
      const tsk = await taskService.getByProject(id);
      setTasks(tsk);
    } catch (err) {
      console.error("Failed to fetch project:", err);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (project?.members) {
      setTaskAssignees(project.members.map((m) => m.user).filter(Boolean));
    }
  }, [project]);

  useEffect(() => {
    const loadPotentialMembers = async () => {
      if (!openAddMember || !project) return;
      try {
        const allUsers = await userService.getAll();
        const currentMemberIds = new Set(
          project.members?.map((m) => m.user?._id).filter(Boolean) || [],
        );
        setPotentialMembers(
          allUsers.filter((u) => !currentMemberIds.has(u._id)),
        );
      } catch (err) {
        console.error("Failed to load users:", err);
        toast.error("Could not load user list");
      }
    };
    loadPotentialMembers();
  }, [openAddMember, project]);

  //  HANDLE PROJECT DELETION
  const handleDeleteProject = async () => {
    try {
      await projectService.delete(id);
      toast.success("Project deleted successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete project");
      setOpenDeleteConfirm(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setIsSyncing(true);
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
    );
    try {
      await taskService.update(taskId, { status: newStatus });
      const updatedTasks = tasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t,
      );
      const allDone = updatedTasks.every((t) => t.status === "done");
      const anyActive = updatedTasks.some((t) =>
        ["in-progress", "review"].includes(t.status),
      );
      let newProjectStatus = project.status;
      if (updatedTasks.length === 0) newProjectStatus = "planning";
      else if (allDone) newProjectStatus = "completed";
      else if (anyActive) newProjectStatus = "in-progress";
      else newProjectStatus = "planning";

      if (newProjectStatus !== project.status) {
        setProject((prev) => ({ ...prev, status: newProjectStatus }));
      }
    } catch (err) {
      toast.error("Failed to update task");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) {
      setFormError("Title required");
      return;
    }
    try {
      const taskPayload = { ...newTask, project: id };
      if (!newTask.assignedTo) delete taskPayload.assignedTo;
      const created = await taskService.create(taskPayload);
      setTasks((prev) => [...prev, created]);
      toast.success("Task created!");
      setIsCreating(false);
      setNewTask({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        assignedTo: "",
      });
      setFormError("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await taskService.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      toast.error("Please select a user");
      return;
    }
    try {
      await projectService.addMember(id, {
        userId: selectedMemberId,
        role: "member",
      });
      const updatedProject = await projectService.getById(id);
      setProject(updatedProject);
      toast.success("Member added successfully");
      setOpenAddMember(false);
      setSelectedMemberId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  if (loading || !project) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "background.paper",
      borderRadius: 2,
      "& fieldset": { borderColor: "divider" },
    },
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiInputBase-input": { color: "text.primary" },
  };

  //  CHECK IF CURRENT USER IS THE OWNER
  const isOwner = project.owner?._id === user?._id;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, position: "relative" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboard")}
          sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
        >
          Back
        </Button>
        <Tooltip title="Refresh Data">
          <IconButton
            onClick={fetchData}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/*  DELETE BUTTON - ONLY VISIBLE TO OWNER */}
        {isOwner && (
          <Tooltip title="Delete Project">
            <IconButton
              onClick={() => setOpenDeleteConfirm(true)}
              size="small"
              sx={{
                color: "error.main",
                ml: "auto",
                "&:hover": { bgcolor: "error.lighter" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
            >
              {project.name}
            </Typography>
            <Typography sx={{ mb: 3, color: "text.secondary" }}>
              {project.description || "No description provided."}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.secondary", mb: 1, fontWeight: 600 }}
              >
                Team Members ({project.members?.length || 0})
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {project.members?.map((m) => (
                  <Tooltip
                    key={m.user?._id}
                    title={`${m.user?.name} (${m.role})`}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor:
                          m.user?._id === project.owner?._id
                            ? "primary.main"
                            : "secondary.main",
                        cursor: "pointer",
                        border: `2px solid ${theme.palette.background.paper}`,
                      }}
                    >
                      {m.user?.name?.[0]?.toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
                {isOwner && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddMember(true)}
                    sx={{
                      ml: 1,
                      color: "text.secondary",
                      textTransform: "none",
                    }}
                  >
                    Add Member
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Chip
                label={project.status}
                sx={{
                  bgcolor: getStatusColor(project.status),
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 1,
                }}
              />
              <Chip
                label={`${tasks.length} Tasks`}
                variant="outlined"
                sx={{
                  borderColor: "divider",
                  color: "text.secondary",
                  fontWeight: 600,
                  borderRadius: 1,
                }}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreating(!isCreating)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              whiteSpace: "nowrap",
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              color: "#fff",
            }}
          >
            {isCreating ? "Cancel Form" : "Add Task"}
          </Button>
        </Box>
      </Paper>

      {/* ... [Task Creation Form & Kanban Board remain exactly the same] ... */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <Paper
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 3, color: "text.primary" }}
              >
                Create New Task
              </Typography>
              {formError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {formError}
                </Alert>
              )}
              <form onSubmit={handleCreateTask}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Task Title"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      required
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      multiline
                      rows={3}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                      Assign To
                    </Typography>
                    <UserAvatarSelect
                      users={taskAssignees}
                      value={newTask.assignedTo}
                      onChange={(val) =>
                        setNewTask({ ...newTask, assignedTo: val })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <UniversalSelect
                      variant="standard"
                      label="Status"
                      options={TASK_STATUS_OPTIONS}
                      value={newTask.status}
                      onChange={(val) =>
                        setNewTask({ ...newTask, status: val })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <UniversalSelect
                      variant="standard"
                      label="Priority"
                      options={PRIORITY_OPTIONS}
                      value={newTask.priority}
                      onChange={(val) =>
                        setNewTask({ ...newTask, priority: val })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
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
                      Due Date
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        ...inputSx,
                        "& .MuiSvgIcon-root": { color: "text.secondary" },
                      }}
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setIsCreating(false)}
                    sx={{
                      borderRadius: 2,
                      px: 4,
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
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: 2,
                      px: 4,
                    }}
                  >
                    Create Task
                  </Button>
                </Box>
              </form>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Grid container spacing={3}>
        {COLUMNS.map((col) => (
          <Grid item xs={12} md={3} key={col.id}>
            <Paper
              sx={{
                p: 2,
                minHeight: "500px",
                height: "100%",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  pb: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: col.color,
                    mr: 1.5,
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {col.title}
                </Typography>
                <Chip
                  label={tasks.filter((t) => t.status === col.id).length}
                  size="small"
                  sx={{
                    ml: "auto",
                    height: 22,
                    fontSize: "0.75rem",
                    bgcolor: "action.hover",
                    color: "text.secondary",
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {tasks
                  .filter((t) => t.status === col.id)
                  .map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                {tasks.filter((t) => t.status === col.id).length === 0 && (
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      color: "text.secondary",
                      fontSize: "0.875rem",
                      minHeight: 120,
                    }}
                  >
                    No tasks in {col.title}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {isSyncing && (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: 10,
            background: "rgba(15, 23, 42, 0.8)",
            position: "fixed",
          }}
          open={isSyncing}
        >
          <CircularProgress sx={{ color: "primary.main", mr: 2 }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Updating...
          </Typography>
        </Backdrop>
      )}

      {/* Add Member Dialog */}
      <Dialog
        open={openAddMember}
        onClose={() => setOpenAddMember(false)}
        PaperProps={{ sx: { bgcolor: "background.paper", borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            color: "text.primary",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Add Team Member
          <IconButton size="small" onClick={() => setOpenAddMember(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a user to add to this project
          </Typography>
          {potentialMembers.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 2 }}
            >
              All users are already members of this project.
            </Typography>
          ) : (
            <UniversalSelect
              variant="standard"
              options={potentialMembers.map((u) => ({
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
              value={selectedMemberId}
              onChange={setSelectedMemberId}
              placeholder="Search users..."
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenAddMember(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={potentialMembers.length === 0}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>

      {/*  DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        PaperProps={{ sx: { bgcolor: "background.paper", borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            color: "error.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DeleteIcon /> Delete Project?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Are you sure you want to delete <strong>{project.name}</strong>?
          </Typography>
          <Typography
            variant="body2"
            color="error.main"
            sx={{ fontWeight: 600 }}
          >
            ⚠️ This action cannot be undone. All tasks and data will be
            permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenDeleteConfirm(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProject}
            variant="contained"
            color="error"
            sx={{ fontWeight: 600 }}
          >
            Yes, Delete Project
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail;
