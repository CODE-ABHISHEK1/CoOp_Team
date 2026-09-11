import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  useTheme,
} from "@mui/material"; //  Added Card, CardContent, Chip
import { Link } from "react-router-dom";
import { Add } from "@mui/icons-material";
import { motion } from "framer-motion";
import projectService from "../services/projectService";

const ProjectsList = () => {
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService
      .getAll()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

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
        <Typography color="text.secondary">Loading Projects...</Typography>
      </Box>
    );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            All Projects
          </Typography>
          <Button
            component={Link}
            to="/projects/new"
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 2,
              color: "#fff",
            }}
          >
            New Project
          </Button>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ py: 8 }}>
              No projects found.
            </Typography>
          </Grid>
        ) : (
          projects.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              {/*  PROPER CARD COMPONENT WITH POLYMORPHIC LINK */}
              <Card
                component={Link}
                to={`/projects/${p._id}`}
                sx={{
                  textDecoration: "none !important", // Force remove link underline
                  display: "block", // Ensure full grid cell width
                  height: "100%", // Equal height cards in grid
                  bgcolor: "background.paper",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    borderColor: "primary.main",
                  },
                  transition: "all 0.3s ease",
                  "& .MuiCardContent-root": { p: 3, "&:last-child": { pb: 3 } },
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
                  >
                    {p.name}
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
                      minHeight: "40px", // Prevent layout shift for short descriptions
                    }}
                  >
                    {p.description ||
                      "No description provided for this project."}
                  </Typography>

                  {/*  USE CHIP COMPONENT FOR BADGES */}
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={p.status}
                      size="small"
                      sx={{
                        bgcolor: "action.hover",
                        color: "text.secondary",
                        fontWeight: 600,
                        borderRadius: 1,
                        height: 24,
                      }}
                    />
                    <Chip
                      label={p.priority}
                      size="small"
                      sx={{
                        bgcolor: "action.hover",
                        color: "text.secondary",
                        fontWeight: 600,
                        borderRadius: 1,
                        height: 24,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default ProjectsList;
