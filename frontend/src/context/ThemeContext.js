import React, { createContext, useState, useContext, useMemo } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ThemeContext = createContext();
export const useThemeMode = () => useContext(ThemeContext);

//  Light Mode Palette
const lightPalette = {
  mode: "light",
  primary: { main: "#667eea" },
  background: {
    default: "#f5f5f5",
    paper: "#fafafa",
  },
  text: { primary: "#0f172a", secondary: "#64748b" },
  divider: "#e2e8f0",
  action: { hover: "#f1f5f9", selected: "#e0e7ff" },
};

//  Dark Mode Palette
const darkPalette = {
  mode: "dark",
  primary: { main: "#667eea" },
  background: {
    default: "#0f172a",
    paper: "#1e293b",
  },
  text: { primary: "#f8fafc", secondary: "#94a3b8" },
  divider: "#334155",
  action: { hover: "#334155", selected: "#1e3a5f" },
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem("theme") || "dark");

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newMode);
      return newMode;
    });
  };

  //  Clean standard MUI v6 Theme Configuration (removed breaking cssVariables flag)
  const theme = useMemo(
    () =>
      createTheme({
        palette: mode === "dark" ? darkPalette : lightPalette,
        typography: { fontFamily: '"Inter", sans-serif' },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === "dark" ? "#0f172a" : "#fafafa",
                color: mode === "dark" ? "#f8fafc" : "#0f172a",
              },
            },
          },
          MuiMenu: {
            defaultProps: {
              slotProps: {
                paper: {
                  elevation: 0,
                  sx: {
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                    backgroundImage: "none",
                  },
                },
              },
            },
          },
          MuiSelect: {
            defaultProps: {
              variant: "standard",
            },
          },
          MuiLink: {
            defaultProps: { underline: "none" },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                backgroundImage: "none",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                textTransform: "none",
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
