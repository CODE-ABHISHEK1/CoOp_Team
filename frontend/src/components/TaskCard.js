import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { getPriorityColor, formatDate } from "../utils/helpers";
import UniversalSelect from "./UniversalSelect";
import { TASK_STATUS_OPTIONS } from "../utils/dropdownOptions";

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const theme = useTheme();

  //  Extract assigned user info (handles both populated object and raw ObjectId)
  const assignee = task.assignedTo?._id ? task.assignedTo : null;

  return (
    <Card
      className="card-hover"
      sx={{
        mb: 2,
        bgcolor: "background.paper",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, lineHeight: 1.4, color: "text.primary" }}
          >
            {task.title}
          </Typography>
          <Box>
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit(task)}
                  sx={{ color: "text.secondary" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete(task._id)}
                  sx={{ color: "text.secondary" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontSize: "0.85rem" }}
          >
            {task.description.length > 60
              ? task.description.substring(0, 60) + "..."
              : task.description}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <UniversalSelect
            variant="compact"
            showIconInValue={true}
            options={TASK_STATUS_OPTIONS}
            value={task.status}
            onChange={(val) => onStatusChange(task._id, val)}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/*  ASSIGNEE DISPLAY */}
            {assignee && (
              <Tooltip title={`Assigned to ${assignee.name}`}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    px: 1,
                    py: 0.25,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 18,
                      height: 18,
                      fontSize: "0.6rem",
                      bgcolor: "primary.main",
                    }}
                  >
                    {assignee.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                    }}
                  >
                    {assignee.name}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: getPriorityColor(task.priority),
                color: "#fff",
                height: 20,
                fontSize: "0.7rem",
              }}
            />
            {task.dueDate && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {formatDate(task.dueDate)}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
