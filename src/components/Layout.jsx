import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ session, onLogout }) {
  return (
    <>
      <Navbar session={session} onLogout={onLogout} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
