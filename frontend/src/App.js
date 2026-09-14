import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; 
import {NotificationProvider} from "./context/NotificationContext"
import { Navbar, ProtectedRoute } from "./components";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectForm from "./pages/ProjectForm";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectsList from "./pages/ProjectLists";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <ThemeProvider>
        {" "}
        {/* Wraps everything including MUI */}
        <BrowserRouter>
          <div style={{ minHeight: "100vh" }}>
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/new"
                element={
                  <ProtectedRoute>
                    <ProjectForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#1e293b",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                  borderRadius: 8,
                },
              }}
            />
          </div>
        </BrowserRouter>
        </ThemeProvider>
        </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
