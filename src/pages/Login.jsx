import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { demoNGOs } from "../data/donations";
import { makeUserId } from "../utils/storage";
import RestaurantSearch from "../components/RestaurantSearch";
const AUTH_KEY = "foodbridge-users-v1";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [providerReadyForSignup, setProviderReadyForSignup] = useState(false);
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("ngo");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("idle");
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

  const finalName =
    role === "provider" && selectedRestaurant
      ? selectedRestaurant.name
      : trimmedName || defaultName;

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

  if (
    user.role === "provider" &&
    user.licenseVerificationStatus !== "demo-verified"
  ) {
    setError("Please complete demo licence verification before logging in.");
    return;
  }

  goToDashboard({
    id: user.id,
    name: user.name,
  });
};

  const handleSignup = (event) => {
    event.preventDefault();
    if (role === "provider" && verificationStatus !== "verified") {
        setError("Please complete demo licence verification before signing up.");
        return;
    }
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
       ...(role === "provider" && {
    licenseVerificationStatus: "demo-verified",
    fssaiNumber: fssaiNumber.trim(),
    restaurantName: selectedRestaurant?.name || account.name,
    }),
    };

    saveUsers([...users, newUser]);

    setMessage("Account created successfully! Logging you in...");

    goToDashboard(account);
  };
  
const existingVerifiedProvider =
  selectedRestaurant &&
  getUsers().some(
    (user) =>
      user.role === "provider" &&
      (user.restaurantName || user.name).toLowerCase() ===
        selectedRestaurant.name.toLowerCase() &&
      user.licenseVerificationStatus === "demo-verified"
  );

  
if (role === "provider" && !selectedRestaurant) {
  return (
    <RestaurantSearch
      onContinue={(restaurant) => {
        setSelectedRestaurant(restaurant);
        setError("");
        setMessage("");
        setLicenseFile(null);
        setFssaiNumber("");
        setVerificationStatus("idle");
        setProviderReadyForSignup(false);
      }}
      onRegisterNew={(restaurantName) => {
        const trimmedName = restaurantName.trim();

        if (!trimmedName) return;

        setSelectedRestaurant({
          name: trimmedName,
          location: "",
        });
        setError("");
        setMessage("");
        setLicenseFile(null);
        setFssaiNumber("");
        setVerificationStatus("idle");
        setProviderReadyForSignup(false);
      }}
      onBack={() => {
        setRole("ngo");
        setSelectedRestaurant(null);
      }}
    />
  );
}

  // const isProviderVerified = verificationStatus === "verified";
  // const [providerReadyForSignup, setProviderReadyForSignup] = useState(false);
  if (role === "provider" && selectedRestaurant&& !providerReadyForSignup&& !(mode === "login" && existingVerifiedProvider)) {
  return (
    <section className="auth-section verification-section">
      <div className="auth-card verification-card">
        <p className="brand-label">FOODBRIDGE</p>

        <h2>Verify your restaurant</h2>
       <p>
  Selected restaurant:{" "}
  <strong>
    {selectedRestaurant?.name ||
      selectedRestaurant?.restaurantName ||
      selectedRestaurant?.label ||
      "Restaurant name unavailable"}
  </strong>
</p>

{selectedRestaurant?.location && (
  <p>{selectedRestaurant.location}</p>
)}

        <label htmlFor="license-upload"
        className="verification-label">
          Upload FSSAI licence (PDF, JPG or PNG)
        </label>

        <input
          id="license-upload"
          className="verification-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(e) => {
            setLicenseFile(e.target.files?.[0] || null);
            setUploadError("");
          }}
        />
        
        <label htmlFor="fssai-number"
        className="verification-label">

            Demo FSSAI Licence Number
        </label>

        <input
          id="fssai-number"
          className="verification-input"
          type="text"
          value={fssaiNumber}
          onChange={(e) => {
            setFssaiNumber(e.target.value);
            setUploadError("");
            setMessage("");
            setVerificationStatus("idle");
          }}
          placeholder="Enter DEMO123456"
        />

        <p className="form-hint">
          Demo only: use DEMO123456 to test the successful path.
          This is not a real licence number.
        </p>

        {licenseFile && (
          <p>Selected file: {licenseFile.name}</p>
        )}

        {uploadError && (
  <p className="form-error" role="alert">
    {uploadError}
  </p>
)}
        
         {verificationStatus === "verified" && (
  <div className="verification-success" role="status">
    <strong>✓ Demo Verification Successful</strong>
    <p>
      This is a demo result only. It does not confirm a genuine
      FSSAI licence.
    </p>
  </div>
)}



{verificationStatus !== "verified" && (
  <button
    className="button button-primary button-full verification-button"
  type="button"
  onClick={() => {
    setUploadError("");
    setMessage("");

    if (!licenseFile) {
      setUploadError("Please select your licence file.");
      setVerificationStatus("idle");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(licenseFile.type)) {
      setUploadError("Please upload a PDF, JPG or PNG file.");
      setVerificationStatus("rejected");
      return;
    }

    if (!fssaiNumber.trim()) {
      setUploadError("Please enter a demo FSSAI licence number.");
      setVerificationStatus("idle");
      return;
    }

    // DEMO ONLY: this is not official FSSAI verification.
    if (fssaiNumber.trim() === "DEMO123456") {
      setVerificationStatus("verified");
      setUploadError("");
      setMessage("Demo verification successful. This does not confirm a real licence.");
    } else {
      setVerificationStatus("rejected");
      setUploadError("Demo verification failed. Try the sample number shown below.");
    }
  }}
>
  Verify License (Demo)
</button>
)}
        
{verificationStatus === "verified" && (     
<button
  type="button"
  className="button button-primary button-full verification-button"
  onClick={() => {
    setName(selectedRestaurant.name);
    setProviderReadyForSignup(true);
    setMode("signup");
    setError("");
    setMessage("");
  }}
>
  Continue to signup →
</button>
)}
      </div>
    </section>
  );
}
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
                readOnly={role === "provider" && !!selectedRestaurant}    
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