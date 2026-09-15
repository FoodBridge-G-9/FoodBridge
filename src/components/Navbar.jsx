import React from "react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import Button from "./Button";

export default function Navbar({ session, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    onLogout();
    closeMenu();
    navigate("/login");
  };

  const dashboardPath =
    session?.role === "provider" ? "/provider/dashboard" : "/ngo/dashboard";

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Logo />
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav
          className={`main-nav ${open ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
          <NavLink
            to="/how-it-works"
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            How It Works
          </NavLink>
          <NavLink
            to="/food"
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Find Food
          </NavLink>
          {session && (
              <button
                className="nav-logout"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
              )}
        </nav>
        
        <div className = "desktop-nav-action">
          {session ? (
            <Button to={dashboardPath} variant="secondary">
              Open Dashboard
            </Button>
           ) : (
            <Button to="/login">Get Started</Button>
           )
          }
          </div>
      </div>
    </header>
  );
}
