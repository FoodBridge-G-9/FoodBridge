
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useSession } from "./hooks/useSession";
import { SessionContext } from "./context/SessionContext";
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

  const sessionValue = { session, login, logout };

  return (
    <SessionContext.Provider value={sessionValue}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="food" element={<FoodList />} />
          <Route
            path="food/:id"
            element={<FoodDetails />}
          />
          <Route path="login" element={<Login onLogin={login} />} />

         <Route element={<ProtectedRoute allowedRole="provider" />}>
            <Route
              path="provider/dashboard"
              element={<ProviderDashboard />}
            />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRole="ngo" />
            }
          >
            <Route
              path="ngo/dashboard"
              element={<NGODashboard />}
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </SessionContext.Provider>
  );
}