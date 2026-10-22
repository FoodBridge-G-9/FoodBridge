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
  const [signupStep, setSignupStep] = useState(1);
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
  const [showRestaurantSuggestions, setShowRestaurantSuggestions] =
  useState(false);

const restaurantNames = [
  "Green Leaf Bakery",
  ...getUsers()
    .filter((user) => user.role === "provider")
    .map((user) => user.restaurantName || user.name)
    .filter(Boolean),
].filter(
  (restaurant, index, all) =>
    all.findIndex(
      (item) => item.toLowerCase() === restaurant.toLowerCase()
    ) === index
);

const matchingRestaurantNames = name.trim()
  ? restaurantNames.filter(
      (restaurant) =>
        restaurant.toLowerCase().includes(name.trim().toLowerCase()) &&
        restaurant.toLowerCase() !== name.trim().toLowerCase()
    )
  : [];


  
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

  


const handleProviderLogin = (restaurantName, enteredPassword) => {
  const users = getUsers();
  const normalizedName = restaurantName.trim().toLowerCase();

  const matchingUsers = users.filter(
    (user) =>
      user.role === "provider" &&
      (user.restaurantName || user.name || "")
        .trim()
        .toLowerCase() === normalizedName
  );

  if (matchingUsers.length === 0) {
    setError("Restaurant account not found. Please sign up first.");
    return;
  }

  const user = matchingUsers.find(
    (item) => item.password === enteredPassword
  );

  if (!user) {
    setError("Incorrect password. Please try again.");
    return;
  }

  if (user.licenseVerificationStatus !== "demo-verified") {
    setError("Your demo licence verification is incomplete. Please contact support.");
    return;
  }

  onLogin({
    role: "provider",
    id: user.id,
    name: user.name,
  });

  navigate("/provider/dashboard", { replace: true });
};



  const handleLogin = (event) => {
    event.preventDefault();
 setError("");
    setMessage("");

    if (role === "provider") {
      if (!name.trim() || !password) {
        setError("Please enter your restaurant name and password.");
        return;
      }
      handleProviderLogin(name, password);
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const users = getUsers();
    const user = users.find(
      (item) =>
        (item.email || "").toLowerCase() === email.trim().toLowerCase() &&
        item.password === password &&
        item.role === "ngo"
    );

    
if (!user) {
  const accountExists = users.some(
    (item) =>
      item.role === "ngo" &&
      (item.email || "").toLowerCase() === email.trim().toLowerCase()
  );

  alert(
    accountExists
      ? "Incorrect password. Please try again."
      : "Account not found. Please sign up first."
  );
  return;
}


    goToDashboard({ id: user.id, name: user.name });
  };

  const handleSignup = (event) => {
    
    event.preventDefault();
    if (role === "provider" && verificationStatus !== "verified") {
        setError("Please complete demo licence verification before signing up.");
        return;
    }
    setError("");
    setMessage("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
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
    restaurantName: account.name,
    }),
    };

    saveUsers([...users, newUser]);

    setMessage("Account created successfully! Logging you in...");

    goToDashboard(account);
  };
  
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
          setSignupStep(1);
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
      setSignupStep(1);
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
          {mode === "signup" && signupStep === 2 && (
  <div className="signup-verification">
    <h3>Verify your account</h3>

    <p>
      Name / Organization: <strong>{name}</strong>
    </p>

    {role === "ngo" ? (
      <>
        <p>
          Please confirm that you want to continue with this
          organization name.
        </p>

        <button
          type="button"
          className="button button-primary button-full"
          onClick={() => {
            setError("");
            setSignupStep(3);
          }}
        >
          Verify & Continue →
        </button>
      </>
    ) : (
      <>
        <p>Upload your licence file and complete the demo verification to continue.</p>

        <label htmlFor="license-upload" className="verification-label">
          Upload FSSAI licence (PDF, JPG or PNG)
        </label>
        <input
          id="license-upload"
          className="verification-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => {
            setLicenseFile(event.target.files?.[0] || null);
            setUploadError("");
            setVerificationStatus("idle");
          }}
        />

        <label htmlFor="fssai-number" className="verification-label">
          Demo FSSAI Licence Number
        </label>
        <input
          id="fssai-number"
          className="verification-input"
          type="text"
          value={fssaiNumber}
          onChange={(event) => {
            setFssaiNumber(event.target.value);
            setUploadError("");
            setVerificationStatus("idle");
          }}
          placeholder="Enter DEMO123456"
        />
        <p className="form-hint">
          Demo only: use DEMO123456. This does not verify a genuine FSSAI licence.
        </p>

        {licenseFile && <p>Selected file: {licenseFile.name}</p>}
        {uploadError && <p className="form-error" role="alert">{uploadError}</p>}

        {verificationStatus === "verified" ? (
          <>
            <div className="verification-success" role="status">
              <strong>✓ Demo Verification Successful</strong>
              <p>This is a demo result only, not official licence verification.</p>
            </div>
            <button
              type="button"
              className="button button-primary button-full"
              onClick={() => {
                setError("");
                setMessage("");
                setSignupStep(3);
              }}
            >
              Continue to email and password →
            </button>
          </>
        ) : (
          <button
            type="button"
            className="button button-primary button-full verification-button"
            onClick={() => {
              setUploadError("");
              if (!licenseFile) {
                setUploadError("Please select your licence file.");
                return;
              }
              if (!["application/pdf", "image/jpeg", "image/png"].includes(licenseFile.type)) {
                setUploadError("Please upload a PDF, JPG or PNG file.");
                return;
              }
              if (fssaiNumber.trim() !== "DEMO123456") {
                setVerificationStatus("rejected");
                setUploadError("Demo verification failed. Try DEMO123456.");
                return;
              }
              setVerificationStatus("verified");
              setUploadError("");
            }}
          >
            Verify Licence (Demo)
          </button>
        )}
      </>
    )}

    <button
      type="button"
      className="button button-full"
      onClick={() => {
        setError("");
        setSignupStep(1);
      }}
    >
      ← Back
    </button>
  </div>
)}
          <div className="role-options">
            <button
              type="button"
              className={`role-option ${
                role === "provider" ? "selected" : ""
              }`}
              onClick={() => { setRole("provider"); setError(""); setMessage(""); }}
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
              onClick={() => { setRole("ngo"); setError(""); setMessage(""); }}
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

          {mode === "signup" && signupStep === 1 && (
  <>
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

    {error && <p className="form-error">{error}</p>}

    <button
      className="button button-primary button-full"
      type="button"
      onClick={() => {
        setError("");
        setMessage("");

        if (!name.trim()) {
          setError("Please enter your name or organization.");
          return;
        }

        setSignupStep(2);
      }}
    >
      Continue →
    </button>
  </>
)}


{(mode === "login" || (mode === "signup" && signupStep === 3)) && (
  role === "provider" && mode === "login" ? (
    <label className="form-field restaurant-search-field">
      <span>Restaurant Name</span>

      <input
        type="text"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setShowRestaurantSuggestions(true);
        }}
        onFocus={() => setShowRestaurantSuggestions(true)}
        onBlur={() => {
          setTimeout(() => setShowRestaurantSuggestions(false), 150);
        }}
        placeholder="Search your restaurant..."
        autoComplete="off"
        required
      />

      {showRestaurantSuggestions && matchingRestaurantNames.length > 0 && (
        <div className="restaurant-suggestions">
          {matchingRestaurantNames.map((restaurant) => (
            <button
              key={restaurant}
              type="button"
              className="restaurant-suggestion"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setName(restaurant);
                setShowRestaurantSuggestions(false);
              }}
            >
              <span className="suggestion-icon">🍽️</span>
              <span>{restaurant}</span>
            </button>
          ))}
        </div>
      )}
    </label>
  ) : (
    <label className="form-field">
      <span>Email</span>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />
    </label>
  )
)}



          {(mode === "login" || (mode === "signup" && signupStep === 3)) && (
  <label className="form-field">
            
<input
  type="password"
  value={password}
  onChange={(event) => setPassword(event.target.value)}
  placeholder="Enter your password"
  autoComplete={mode === "login" ? "current-password" : "new-password"}
  required/>
          </label>
          )}

          {mode === "signup" &&signupStep === 3 &&(
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

          {mode === "login" && (
  <button
    className="button button-primary button-full"
    type="submit"
  >
    Login as {role === "ngo" ? "NGO" : "Provider"} →
  </button>
)}

{mode === "signup" && signupStep === 3 && (
  <button
    className="button button-primary button-full"
    type="submit"
  >
    Create Account →
  </button>
)}
          
        </form>
      </div>
    </section>
  );
}
