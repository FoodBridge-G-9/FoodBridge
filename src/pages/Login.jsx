import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { demoNGOs } from "../data/donations";
import { makeUserId } from "../utils/storage";

const AUTH_KEY = "foodbridge-users-v1";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("ngo");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const destination = location.state?.from;

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
  };

  const getAccountDetails = (accountName) => {
    const trimmedName = accountName.trim();

    const defaultName =
      role === "ngo" ? "Hope Shelter" : "Green Leaf Bakery";

    const finalName = trimmedName || defaultName;
    const normalized = finalName.toLowerCase();

    const knownNGO = demoNGOs.find(
      (ngo) => ngo.name.toLowerCase() === normalized,
    );

    const id = knownNGO?.id?.toString() || makeUserId(finalName);

    return {
      id,
      name: finalName,
    };
  };

  const goToDashboard = (account) => {
    onLogin({
      role,
      id: account.id,
      name: account.name,
    });

    navigate(
      destination ||
        (role === "provider"
          ? "/provider/dashboard"
          : "/ngo/dashboard"),
      { replace: true },
    );
  };

  const handleLogin = (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const users = getUsers();

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password &&
        item.role === role,
    );

    if (!user) {
      setError(
        "Account not found. Please check your details or sign up first.",
      );
      return;
    }

    goToDashboard({
      id: user.id,
      name: user.name,
    });
  };

  const handleSignup = (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const users = getUsers();

    const existingUser = users.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (existingUser) {
      setError("An account with this email already exists.");
      return;
    }

    const account = getAccountDetails(name);

    const newUser = {
      id: account.id,
      name: account.name,
      email: email.trim(),
      password,
      role,
    };

    saveUsers([...users, newUser]);

    setMessage("Account created successfully! Logging you in...");

    goToDashboard(account);
  };

  // const switchMode = () => {
  //   setMode(mode === "login" ? "signup" : "login");
  //   setError("");
  //   setMessage("");
  // };

  return (
    <section className="auth-section">
      <div className="container auth-layout">
        <div className="auth-intro">
          <p className="eyebrow">WELCOME TO FOODBRIDGE</p>

          <h1>
            {mode === "login"
              ? "Welcome back."
              : "Join the FoodBridge community."}
          </h1>

          <p>
            {mode === "login"
              ? "Login to continue connecting surplus food with people who need it."
              : "Create an account and help turn surplus food into shared meals."}
          </p>

          <div className="auth-note">
            <span>🤝</span>
            <span>
              Food providers can donate surplus food while NGOs and
              shelters can discover and request available donations.
            </span>
          </div>
        </div>

        <form
          className="auth-card"
          onSubmit={mode === "login" ? handleLogin : handleSignup}
        >
          <div className="auth-toggle">
          <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => {
          setMode("login");
          setError("");
          setMessage("");
    }}
  >
    Login
  </button>

  <button
    type="button"
    className={mode === "signup" ? "active" : ""}
    onClick={() => {
      setMode("signup");
      setError("");
      setMessage("");
    }}
  >
    Sign Up
  </button>
</div>

<div className="auth-card-header">
  <p className="eyebrow">
    {mode === "login" ? "WELCOME BACK" : "JOIN FOODBRIDGE"}
  </p>

  <h2>
    {mode === "login" ? "Login to FoodBridge" : "Create your account"}
  </h2>
</div>

          <div className="role-options">
            <button
              type="button"
              className={`role-option ${
                role === "provider" ? "selected" : ""
              }`}
              onClick={() => setRole("provider")}
            >
              <span className="role-icon">🍽️</span>

              <span>
                <strong>Food Provider</strong>
                <small>Restaurant, bakery or organizer</small>
              </span>

              <span className="role-radio" aria-hidden="true">
                {role === "provider" ? "●" : "○"}
              </span>
            </button>

            <button
              type="button"
              className={`role-option ${
                role === "ngo" ? "selected" : ""
              }`}
              onClick={() => setRole("ngo")}
            >
              <span className="role-icon">🤲</span>

              <span>
                <strong>NGO / Shelter</strong>
                <small>Find and request surplus food</small>
              </span>

              <span className="role-radio" aria-hidden="true">
                {role === "ngo" ? "●" : "○"}
              </span>
            </button>
          </div>

          {mode === "signup" && (
            <label className="form-field">
              <span>Name / Organization</span>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={
                  role === "ngo"
                    ? "e.g. Hope Shelter"
                    : "e.g. Green Leaf Bakery"
                }
              />
            </label>
          )}

          <label className="form-field">
            <span>Email</span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="form-field">
            <span>Password</span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>

          {mode === "signup" && (
            <label className="form-field">
              <span>Confirm Password</span>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
              />
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          {message && <p className="form-success">{message}</p>}

          <button
            className="button button-primary button-full"
            type="submit"
          >
            {mode === "login"
              ? `Login as ${role === "ngo" ? "NGO" : "Provider"} →`
              : "Create Account →"}
          </button>

          
        </form>
      </div>
    </section>
  );
}