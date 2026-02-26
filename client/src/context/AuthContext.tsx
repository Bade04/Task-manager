// client/src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .getCurrentUser()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: { email: string; password: string }) => {
    try {
      setError(null);
      console.log("🔐 Login attempt for:", data.email);
      const response = await api.loginUser(data);
      console.log("✅ Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("❌ Login error:", err);
      const message = err.response?.data?.error || "Login failed";
      setError(message);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      setError(null);
      console.log("🔐 Register attempt for:", data.email);
      const response = await api.registerUser(data);
      console.log("✅ Registration successful:", response.data);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("❌ Register error:", err);
      const message = err.response?.data?.error || "Registration failed";
      setError(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
