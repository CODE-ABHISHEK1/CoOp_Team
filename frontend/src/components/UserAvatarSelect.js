import React from "react";
import {
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
  useTheme,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";

const UserAvatarSelect = ({
  users,
  value,
  onChange,
  placeholder = "Assign to...",
}) => {
  const theme = useTheme();
  const selectedUser = users.find((u) => u._id === value);

  return (
    <Select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      displayEmpty
      variant="standard"
      sx={{
        minWidth: 180,
        ".MuiInput-underline:before": { borderBottom: "none" },
        ".MuiSelect-select": {
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 0.5,
        },
      }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            maxHeight: 300,
          },
        },
      }}
      renderValue={(selected) => {
        if (!selected)
          return <Typography color="text.secondary">{placeholder}</Typography>;
        const user = users.find((u) => u._id === selected);
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: "0.7rem",
                bgcolor: "primary.main",
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="text.primary">
              {user?.name}
            </Typography>
          </Box>
        );
      }}
    >
      {users.map((user) => (
        <MenuItem key={user._id} value={user._id}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              width: "100%",
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: "0.8rem",
                bgcolor: "primary.main",
              }}
            >
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography sx={{ flex: 1, color: "text.primary" }}>
              {user.name}
            </Typography>
            {value === user._id && (
              <CheckCircleIcon sx={{ color: "primary.main", fontSize: 18 }} />
            )}
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};

export default UserAvatarSelect;
