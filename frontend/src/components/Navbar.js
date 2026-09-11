import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Notifications,
  Brightness4,
  Brightness7,
  Logout,
  Dashboard,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import notificationService from "../services/notificationService";
import toast from "react-hot-toast";

const NOTIFICATION_POLL_INTERVAL = 30000; 

const Navbar = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const pollIntervalRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  //  Fetch notifications on mount & when user logs in
  useEffect(() => {
    if (user) {
      setLoadingNotifs(true);
      notificationService
        .getAll()
        .then((data) => setNotifications(data))
        .catch((err) => console.error("Failed to load notifications:", err))
        .finally(() => setLoadingNotifs(false));
    } else {
      setNotifications([]);
      setLoadingNotifs(false);
    }
  }, [user]);

  //  Poll for new notifications every 30 seconds while logged in
  useEffect(() => {
    if (user) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const data = await notificationService.getAll();
          const unreadInNew = data.filter((n) => !n.read).length;
          const unreadInCurrent = notifications.filter((n) => !n.read).length;

          // Only update state if there are actually new notifications
          if (
            unreadInNew > unreadInCurrent ||
            data.length !== notifications.length
          ) {
            setNotifications(data);
          }
        } catch (err) {
          console.error("Polling failed:", err);
        }
      }, NOTIFICATION_POLL_INTERVAL);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [user, notifications]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setAnchorEl(null);
  };

  // Mark notification as read when clicked
  const handleNotificationClick = async (notif) => {
    try {
      await notificationService.markAsRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)),
      );

      if (notif.projectId?._id) {
        navigate(`/projects/${notif.projectId._id}`);
      }
      setNotifAnchorEl(null);
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  // Clear all notifications from backend
  const clearNotifications = async () => {
    try {
      await Promise.all(
        notifications.map((n) => notificationService.delete(n._id)),
      );
      setNotifications([]);
      setNotifAnchorEl(null);
      toast.success("Notifications cleared");
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isDashboardActive = location.pathname === "/dashboard";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: theme.palette.background.paper,
        backgroundImage: "none",
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to={user ? "/dashboard" : "/"}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.3rem",
              }}
            >
              C
            </Box>
            <Typography
              variant="h6"
              className="gradient-text"
              sx={{ fontWeight: 800 }}
            >
              CoOp
            </Typography>
          </Link>
        </motion.div>

        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              component={Link}
              to="/dashboard"
              startIcon={<Dashboard />}
              size="small"
              sx={{
                color: isDashboardActive ? "primary.main" : "text.secondary",
                bgcolor: isDashboardActive ? "action.selected" : "transparent",
                px: 2,
                py: 0.8,
                borderRadius: 2,
                fontWeight: 600,
                display: { xs: "none", sm: "flex" },
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              Dashboard
            </Button>

            <Tooltip title="Notifications">
              <IconButton
                sx={{ color: "text.secondary" }}
                onClick={(e) => setNotifAnchorEl(e.currentTarget)}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* NOTIFICATION MENU */}
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={() => setNotifAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: {
                    minWidth: 320,
                    bgcolor: "background.paper",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  },
                },
              }}
            >
              {loadingNotifs ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="body2">Loading...</Typography>
                </Box>
              ) : notifications.length === 0 ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="body2">
                    No notifications found
                  </Typography>
                </Box>
              ) : (
                notifications.map((n) => (
                  <MenuItem
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    sx={{
                      whiteSpace: "normal",
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      color: "text.primary",
                      bgcolor: n.read ? "transparent" : "action.hover",
                      "&:last-child": { borderBottom: "none" },
                      "&:hover": { bgcolor: "action.selected" },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: n.read ? 400 : 600 }}
                      >
                        {n.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {new Date(n.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    {!n.read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          ml: 1,
                          alignSelf: "center",
                        }}
                      />
                    )}
                  </MenuItem>
                ))
              )}

              {notifications.length > 0 && (
                <Box
                  sx={{
                    p: 1.5,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    textAlign: "center",
                  }}
                >
                  <Button
                    size="small"
                    onClick={clearNotifications}
                    sx={{
                      color: "primary.main",
                      fontSize: "0.75rem",
                    }}
                  >
                    Clear All
                  </Button>
                </Box>
              )}
            </Menu>

            <Tooltip
              title={`Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`}
            >
              <IconButton
                onClick={toggleTheme}
                sx={{ color: "text.secondary" }}
              >
                {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  width: 40,
                  height: 40,
                }}
              >
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>

            {/* PROFILE MENU */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: {
                    minWidth: 180,
                    bgcolor: "background.paper",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  setAnchorEl(null);
                }}
                sx={{ color: "text.primary" }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate("/settings");
                  setAnchorEl(null);
                }}
                sx={{ color: "text.primary" }}
              >
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: "text.primary" }}>
                <Logout sx={{ mr: 1 }} fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
