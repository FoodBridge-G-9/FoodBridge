import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useSession } from "./hooks/useSession";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import FoodList from "./pages/FoodList";
import FoodDetails from "./pages/FoodDetails";
import Login from "./pages/Login";
import ProviderDashboard from "./pages/ProviderDashboard";
import NGODashboard from "./pages/NGODashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  const { session, login, logout } = useSession();

  return (
    <Routes>
      <Route element={<Layout session={session} onLogout={logout} />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="food" element={<FoodList />} />
        <Route path="food/:id" element={<FoodDetails session={session} />} />
        <Route path="login" element={<Login onLogin={login} />} />

        <Route
          element={<ProtectedRoute session={session} allowedRole="provider" />}
        >
          <Route
            path="provider/dashboard"
            element={<ProviderDashboard session={session} />}
          />
        </Route>

        <Route element={<ProtectedRoute session={session} allowedRole="ngo" />}>
          <Route
            path="ngo/dashboard"
            element={<NGODashboard session={session} />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
