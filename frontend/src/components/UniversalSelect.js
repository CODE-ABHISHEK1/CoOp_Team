import React from "react";
import { Select, MenuItem, Box, Typography, useTheme } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";

const UniversalSelect = ({
  options = [],
  value,
  onChange,
  variant = "standard",
  showIconInValue = true,
  placeholder = "Select...",
  label,
}) => {
  const theme = useTheme();

  const currentOption = options.find((opt) => opt.value === value);

  const getStyles = () => {
    switch (variant) {
      case "compact":
        return {
          root: {
            backgroundColor: "transparent",
            borderRadius: 1,
            minWidth: 80,
          },
          select: { py: 0.5, px: 1, fontSize: "0.75rem", gap: 0.5 },
          menu: { minWidth: 140, mt: 0.5 },
        };
      case "minimal":
        return {
          root: { backgroundColor: "transparent", borderRadius: 1 },
          select: { py: 0.25, px: 0.5, fontSize: "0.7rem", gap: 0.5 },
          menu: { minWidth: 120, mt: 0.5 },
        };
      default:
        return {
          //  FIX: Use theme token instead of hardcoded color
          root: { backgroundColor: "background.paper", borderRadius: 2 },
          select: { py: 1.5, px: 2, fontSize: "0.875rem", gap: 1.5 },
          menu: { minWidth: 180, mt: 1 },
        };
    }
  };

  const styles = getStyles();

  return (
    <Box sx={{ mb: variant === "standard" ? 2 : 0 }}>
      {label && variant === "standard" && (
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
          {label}
        </Typography>
      )}

      <Select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disableUnderline
        displayEmpty
        sx={{
          ...styles.root,
          color: "text.primary",
          fontWeight: 600,
          //  FIX: Explicitly remove outline and set border via theme
          ".MuiOutlinedInput-notchedOutline": {
            border:
              variant === "standard"
                ? `1px solid ${theme.palette.divider}`
                : "none",
          },
          ".MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            ...styles.select,
            "&:hover": {
              backgroundColor:
                variant === "standard"
                  ? "action.hover"
                  : "rgba(255,255,255,0.05)",
            },
          },
          "& .MuiSvgIcon-root": {
            color: "text.secondary",
            fontSize: variant === "standard" ? 20 : 16,
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              ...styles.menu,
              bgcolor: "background.paper",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              "& .MuiMenuItem-root": {
                py: variant === "standard" ? 1.5 : 1,
                px: variant === "standard" ? 2 : 1.5,
                color: "text.primary",
                fontSize: variant === "standard" ? "0.875rem" : "0.8rem",
                "&:hover": { backgroundColor: "action.hover" },
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                  fontWeight: 600,
                },
              },
            },
          },
        }}
        renderValue={(selected) => {
          if (!selected && !currentOption)
            return (
              <span style={{ color: theme.palette.text.secondary }}>
                {placeholder}
              </span>
            );

          const opt =
            currentOption || options.find((o) => o.value === selected);
          if (!opt) return selected;

          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: showIconInValue ? 1 : 0.5,
              }}
            >
              {showIconInValue && opt.icon && (
                <Box
                  sx={{
                    color: opt.color || theme.palette.text.secondary,
                    display: "flex",
                  }}
                >
                  {opt.icon}
                </Box>
              )}
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: variant === "standard" ? "0.875rem" : "0.75rem",
                  whiteSpace: "nowrap",
                  color: "text.primary",
                }}
              >
                {opt.label}
              </Typography>
            </Box>
          );
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
              }}
            >
              {opt.icon && (
                <Box
                  sx={{
                    color: opt.color || theme.palette.text.secondary,
                    display: "flex",
                  }}
                >
                  {opt.icon}
                </Box>
              )}
              <Typography
                sx={{ fontWeight: 500, flex: 1, color: "text.primary" }}
              >
                {opt.label}
              </Typography>
              {value === opt.value && (
                <CheckCircleIcon
                  sx={{ fontSize: 18, color: "primary.main", ml: "auto" }}
                />
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default UniversalSelect;
