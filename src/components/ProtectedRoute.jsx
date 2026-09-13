import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ session, allowedRole }) {
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRole && session.role !== allowedRole) {
    return (
      <Navigate
        to={
          session.role === "provider" ? "/provider/dashboard" : "/ngo/dashboard"
        }
        replace
      />
    );
  }

  return <Outlet />;
}
