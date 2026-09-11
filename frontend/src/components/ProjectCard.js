import React from "react";
import { Box, Typography, IconButton, Tooltip, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { Delete as DeleteIcon } from "@mui/icons-material";

const ProjectCard = ({ project, user, onDelete }) => {
  const theme = useTheme();
  const isOwner = project.owner?._id === user?._id;

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(project._id);
  };

  return (
    <Box
      component={Link}
      to={`/projects/${project._id}`}
      sx={{
        
        textDecoration: "none !important",
        display: "block",
        position: "relative",
        p: 3,
        bgcolor: "background.paper",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden", // Prevents content from spilling out

        // Reset ALL MUI Link defaults that cause glitches
        m: 0,
        "&::before": { display: "none" },
        "&::after": { display: "none" },

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          borderColor: "primary.main",
        },
        transition: "all 0.2s ease",
      }}
    >
      {/* DELETE BUTTON - OWNER ONLY */}
      {isOwner && onDelete && (
        <Tooltip title="Delete Project">
          <IconButton
            size="small"
            onClick={handleDeleteClick}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              color: "text.secondary",
              bgcolor: "background.default",
              width: 28,
              height: 28,
              "&:hover": {
                color: "error.main",
                bgcolor: "error.lighter",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* CONTENT CONTAINER WITH PROPER SPACING */}
      <Box sx={{ pr: isOwner ? 4 : 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 1,
            wordBreak: "break-word",
            lineHeight: 1.3,
          }}
        >
          {project.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {project.description || "No description"}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: "action.hover",
              color: "text.secondary",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {project.status}
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: "action.hover",
              color: "text.secondary",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {project.priority}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectCard;
