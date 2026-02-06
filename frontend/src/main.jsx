import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import POSLayout from "./pages/POSLayout";
import "./index.css";
import { Toaster } from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

// Check if user is admin (role_id === 1 or role name === 'Admin')
const isAdminUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    // Check if role_id is 1 (typically Admin) or role name is Admin
    return user.role_id == 1 || user.role?.name === "Admin" || user.role?.name === "admin" || user.role === 'Admin';
  } catch {
    return false;
  }
};

// Route wrapper that determines which layout to use
const AppRoute = () => {
  const isAdmin = isAdminUser();
  
  return (
    <ProtectedRoute>
      {isAdmin ? <Layout /> : <POSLayout />}
    </ProtectedRoute>
  );
};

// Root route - shows POS terminal for non-admin, redirects admin to dashboard
const RootRoute = () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  const isAdmin = isAdminUser();
  
  if (isAdmin) {
    return <Navigate to="/dashboard" />;
  } else {
    // Show POS terminal directly at root
    return (
      <ProtectedRoute>
        <POSLayout />
      </ProtectedRoute>
    );
  }
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
   <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
            fontWeight: "600",
          },
        }}
      />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRoute />} />

      {/* All protected pages - routes based on role */}
      <Route path="/*" element={<AppRoute />} />
    </Routes>
  </BrowserRouter>
);
