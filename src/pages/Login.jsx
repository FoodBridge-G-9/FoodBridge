import React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { demoNGOs } from "../data/donations";
import { makeUserId } from "../utils/storage";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("ngo");
  const [name, setName] = useState("");

  const destination = location.state?.from;

  const getAccountDetails = () => {
    const trimmedName = name.trim();
    const defaultName = role === "ngo" ? "Hope Shelter" : "Green Leaf Bakery";
    const finalName = trimmedName || defaultName;
    const normalized = finalName.toLowerCase();
    const knownNGO = demoNGOs.find(
      (ngo) => ngo.name.toLowerCase() === normalized,
    );
    const id = knownNGO?.id?.toString() || makeUserId(finalName);
    return { id, name: finalName };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const account = getAccountDetails();
    onLogin({ role, id: account.id, name: account.name });
    navigate(
      destination ||
        (role === "provider" ? "/provider/dashboard" : "/ngo/dashboard"),
      { replace: true },
    );
  };

  return (
    <section className="auth-section">
      <div className="container auth-layout">
        <div className="auth-intro">
          <p className="eyebrow">WELCOME TO FOODBRIDGE</p>
          <h1>Choose how you want to help.</h1>
          <p>
            {/* Evaluation-I uses browser storage to remember your demo account and
            keep provider and NGO actions separate. */}
          </p>
          <div className="auth-note">
            {/* <span>🔒</span> */}
            <span>
              {/* Your demo account stays in this browser. Log out to switch roles. */}
            </span>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <p className="eyebrow">DEMO LOGIN</p>
            <h2>Continue as</h2>
          </div>
          <div className="role-options">
            <button
              type="button"
              className={`role-option ${role === "provider" ? "selected" : ""}`}
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
              className={`role-option ${role === "ngo" ? "selected" : ""}`}
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
          <label className="form-field">
            <span>Your name / organization</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={
                role === "ngo" ? "e.g. Hope Shelter" : "e.g. Green Leaf Bakery"
              }
            />
          </label>
          <p className="form-helper">
            Try <strong>Hope Shelter</strong> for the NGO demo or{" "}
            <strong>Green Leaf Bakery</strong> for the provider demo so the
            sample records appear under that account.
          </p>
          <button className="button button-primary button-full" type="submit">
            Continue as {role === "ngo" ? "NGO" : "Provider"} →
          </button>
          <p className="form-note">
            No real authentication is used in this Evaluation-I frontend.
          </p>
        </form>
      </div>
    </section>
  );
}
