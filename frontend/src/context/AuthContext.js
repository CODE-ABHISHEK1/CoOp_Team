import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await api.get("/auth/me").then((r) => r.data);
          setUser(userData);
        } catch {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const data = await api
      .post("/auth/login", { email, password })
      .then((r) => r.data);
    localStorage.setItem("token", data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    toast.success("Welcome back! 🎉");
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api
      .post("/auth/register", { name, email, password })
      .then((r) => r.data);
    localStorage.setItem("token", data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    toast.success("Account created! 🚀");
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
