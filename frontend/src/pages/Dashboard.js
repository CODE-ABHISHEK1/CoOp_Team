import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  Chip,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import {
  Add,
  FolderOpen,
  CheckCircle,
  ListAlt,
  TrendingUp,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import projectService from "../services/projectService";
import ProjectCard from "../components/ProjectCard";
import toast from "react-hot-toast";

const POLL_INTERVAL = 5000;

const Dashboard = () => {
  const theme = useTheme();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const pollRef = useRef(null);
  const { user } = useAuth();

  //  Core data fetching logic
  const fetchData = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);

      let totalTasks = 0;
      let completedTasks = 0;
      let activeProjects = 0;

      data.forEach((p) => {
        const taskCount = p.tasks?.length || 0;
        totalTasks += taskCount;
        completedTasks +=
          p.tasks?.filter((t) => t.status === "done").length || 0;

        if (taskCount > 0 && !p.tasks.every((t) => t.status === "done")) {
          activeProjects++;
        }
      });

      setStats({
        totalProjects: data.length,
        activeProjects,
        totalTasks,
        completedTasks,
      });
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when refreshKey changes
  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  //  Auto-refresh when navigating back to dashboard
  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setRefreshKey((prev) => prev + 1);
    }
  }, [location.pathname]);

  //  Auto-refresh if triggered by ProjectForm creation (same session)
  useEffect(() => {
    const flag = localStorage.getItem("dashboardRefresh");
    if (flag) {
      localStorage.removeItem("dashboardRefresh");
      setRefreshKey((prev) => prev + 1);
    }
  }, []);

  //  CROSS-USER SYNC: Poll for new projects every 30s
  useEffect(() => {
    if (user) {
      pollRef.current = setInterval(() => {
        setRefreshKey((prev) => prev + 1);
      }, POLL_INTERVAL);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  //  HANDLE PROJECT DELETION FROM DASHBOARD
  const handleDeleteProject = async (projectId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await projectService.delete(projectId);
      toast.success("Project deleted successfully");
      // Remove from local state immediately for instant UI update
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete project");
    }
  };

  if (loading)
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
        <Typography color="text.secondary">Loading Dashboard...</Typography>
      </Box>
    );

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  const getStatusColor = (status) => {
    const map = {
      planning: "#9CA3AF",
      "in-progress": "#3B82F6",
      completed: "#10B981",
      "on-hold": "#F59E0B",
    };
    return map[status] || "#9CA3AF";
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              Welcome back, {user?.name}! 👋
            </Typography>
            <Typography color="text.secondary">
              Here's what's happening with your projects.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              startIcon={<RefreshIcon />}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                border: `1px solid ${theme.palette.divider}`,
                color: "text.secondary",
                "&:hover": {
                  bgcolor: "action.hover",
                  borderColor: "primary.main",
                  color: "primary.main",
                },
              }}
            >
              Refresh
            </Button>
            <Button
              component={Link}
              to="/projects/new"
              variant="contained"
              startIcon={<Add />}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              New Project
            </Button>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: "Total Projects",
            value: stats.totalProjects,
            icon: <FolderOpen />,
            color: "#3B82F6",
          },
          {
            title: "Active Projects",
            value: stats.activeProjects,
            icon: <TrendingUp />,
            color: "#8B5CF6",
          },
          {
            title: "Total Tasks",
            value: stats.totalTasks,
            icon: <ListAlt />,
            color: "#10B981",
          },
          {
            title: "Completion Rate",
            value: `${completionRate}%`,
            icon: <CheckCircle />,
            color: "#F59E0B",
          },
        ].map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <Card
              sx={{
                p: 2,
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                height: "100%",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: `${s.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: s.color,
                }}
              >
                {s.icon}
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {s.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.title}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          Recent Projects
        </Typography>
        <Button
          component={Link}
          to="/projects"
          size="small"
          sx={{ color: "primary.main", textTransform: "none" }}
        >
          View All
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Card
              sx={{
                p: 6,
                textAlign: "center",
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No projects found. Start by creating one!
              </Typography>
              <Button
                component={Link}
                to="/projects/new"
                variant="outlined"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  borderRadius: 2,
                }}
              >
                Create Project
              </Button>
            </Card>
          </Grid>
        ) : (
          projects.slice(0, 6).map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              <ProjectCard
                project={p}
                user={user}
                onDelete={handleDeleteProject}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
