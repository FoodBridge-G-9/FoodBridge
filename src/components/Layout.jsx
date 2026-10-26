
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useSessionContext } from "../context/SessionContext";

export default function Layout() {
  const { session, logout } = useSessionContext();

  return (
    <>
      <Navbar session={session} onLogout={logout} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}