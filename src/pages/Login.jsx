
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { demoNGOs } from "../data/donations";
import { makeUserId } from "../utils/storage";

const AUTH_KEY = "foodbridge-users-v1";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("provider");
  const [signupStep, setSignupStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [licenseFile, setLicenseFile] = useState(null);
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [ngoRegistrationNumber, setNgoRegistrationNumber] = useState("");
  const [ngoCertificateFile, setNgoCertificateFile] = useState(null);
  const [ngoLocation, setNgoLocation] = useState("");
  const [ngoVerificationStatus, setNgoVerificationStatus] = useState("idle");
  const [ngoUploadError, setNgoUploadError] = useState("");

  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [message, setMessage] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
const [resetEmail, setResetEmail] = useState("");
const [resetPassword, setResetPassword] = useState("");
const [resetConfirmPassword, setResetConfirmPassword] = useState("");

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

  const clearMessages = () => {
    setError("");
    setUploadError("");
    setMessage("");
  };

  const getAccountDetails = (accountName) => {
    const finalName = accountName.trim();

    const knownNGO = demoNGOs.find(
      (ngo) =>
        ngo.name.toLowerCase() === finalName.toLowerCase()
    );

    const id =
      role === "provider"
        ? (crypto.randomUUID
            ? crypto.randomUUID()
            : `provider-${Date.now()}`)
        : knownNGO?.id?.toString() || makeUserId(finalName);

    return {
      id,
      name: finalName,
    };
  };

  const goToDashboard = (user) => {
    onLogin({
      role: user.role || role,
      id: user.id,
      name: user.name,
    });

    const dashboard =
      (user.role || role) === "provider"
        ? "/provider/dashboard"
        : "/ngo/dashboard";

    navigate(destination || dashboard, { replace: true });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    clearMessages();

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const users = getUsers();

    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(
      (item) =>
        (item.email || "").trim().toLowerCase() ===
          normalizedEmail &&
        item.password === password &&
        item.role === role
    );

    if (!user) {
      const accountExists = users.some(
        (item) =>
          (item.email || "").trim().toLowerCase() ===
            normalizedEmail &&
          item.role === role
      );

      setError(
        accountExists
          ? "Incorrect password. Please try again."
          : `${role === "provider" ? "Provider" : "NGO"} account not found. Please sign up first.`
      );
      return;
    }

    if (
      role === "provider" &&
      user.licenseVerificationStatus !== "demo-verified"
    ) {
      setError(
        "Your demo licence verification is incomplete."
      );
      return;
    }

    goToDashboard(user);
  };

  
const handlePasswordReset = (event) => {
  event.preventDefault();
  clearMessages();

  if (
    !resetEmail.trim() ||
    !resetPassword ||
    !resetConfirmPassword
  ) {
    setError("Please fill in all fields.");
    return;
  }

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

  if (!passwordPattern.test(resetPassword)) {
    setError(
      "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character. Spaces are not allowed."
    );
    return;
  }

  if (resetPassword !== resetConfirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  const users = getUsers();
  const normalizedEmail = resetEmail.trim().toLowerCase();

  const userIndex = users.findIndex(
    (item) =>
      (item.email || "").trim().toLowerCase() === normalizedEmail &&
      item.role === role
  );

  if (userIndex === -1) {
    setError(
      `${role === "provider" ? "Provider" : "NGO"} account not found with this email.`
    );
    return;
  }

  const updatedUsers = [...users];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    password: resetPassword,
  };

  saveUsers(updatedUsers);

  setForgotMode(false);
  setEmail(resetEmail.trim());
  setPassword("");
  setResetEmail("");
  setResetPassword("");
  setResetConfirmPassword("");
  setMessage("Password reset successfully! You can now log in.");
};

  const handleSignup = (event) => {
    event.preventDefault();
    clearMessages();

    // Account creation is allowed only at the final step.
    if (signupStep !== 3) {
      return;
    }

    if (
      role === "provider" &&
      verificationStatus !== "verified"
    ) {
      setError(
        "Please complete demo licence verification first."
      );
      return;
    }
    if (role === "ngo" && ngoVerificationStatus !== "verified") {
  setError("Please complete NGO verification before signing up.");
  return;
}

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

if (!passwordPattern.test(password)) {
  setError(
    "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character. Spaces are not allowed."
  );
  return;
}


    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = users.find(
      (item) =>
        (item.email || "").trim().toLowerCase() ===
        normalizedEmail
    );

    if (existingUser) {
      setError("An account with this email already exists.");
      return;
    }

    // Prevent duplicate accounts for the same restaurant/NGO.
    const sameOrganization = users.some(
      (item) =>
        item.role === role &&
        (item.restaurantName || item.name || "")
          .trim()
          .toLowerCase() === name.trim().toLowerCase()
    );

    if (sameOrganization) {
      setError(
        role === "provider"
          ? "This restaurant already has an account. Please log in."
          : "This organization already has an account. Please log in."
      );
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
      ...(role === "ngo" && {
  ngoRegistrationNumber: ngoRegistrationNumber.trim(),
  ngoLocation: ngoLocation.trim(),
  ngoVerificationStatus: "demo-verified",
  ngoCertificateFileName: ngoCertificateFile.name,
  }),
    };

    saveUsers([...users, newUser]);

    setMessage("Account created successfully!");

    goToDashboard(newUser);
  };

  const startLogin = () => {
  setMode("login");
  setSignupStep(1);
  setForgotMode(false);
  setResetEmail("");
  setResetPassword("");
  setResetConfirmPassword("");
  setPassword("");
  clearMessages();
};

  const startSignup = () => {
    setMode("signup");
    setSignupStep(1);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLicenseFile(null);
    setFssaiNumber("");
    setVerificationStatus("idle");
    clearMessages();
  };

  const verifyProviderLicense = () => {
    setUploadError("");

    if (!name.trim()) {
      setUploadError("Please enter your restaurant name.");
      return;
    }

    if (!licenseFile) {
      setUploadError("Please select your licence file.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(licenseFile.type)) {
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
    setError("");
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
              Food providers can donate surplus food while NGOs
              and shelters can discover and request available
              donations.
            </span>
          </div>
        </div>

        <form
          className="auth-card"
          onSubmit={
          mode === "signup"
            ? handleSignup
            : forgotMode
              ? handlePasswordReset
              : handleLogin
        }
        >
          <div className="auth-toggle">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={startLogin}
            >
              Login
            </button>

            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={startSignup}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-card-header">
            <p className="eyebrow">
              {mode === "login" ? "WELCOME BACK" : "JOIN FOODBRIDGE"}
            </p>

            
          <h2>
          {mode === "login"
            ? forgotMode
              ? "Reset Your Password"
              : "Login to FoodBridge"
            : signupStep === 1
              ? "Create your account"
              : signupStep === 2
                ? "Verify your account"
                : "Set up your account"}
        </h2>
            {mode === "signup" && (
              <p className="signup-welcome-text">
                {role === "provider"
                  ? "Let's get your food rescue journey started."
                  : "Together, we can turn surplus food into shared meals."}
              </p>
            )}
          </div>

          {/* Role selection appears only on Login and signup step 1.
              It will not appear below the verification Back button. */}
          {(mode === "login" ||
            (mode === "signup" && signupStep === 1)) && (
            <div className="role-options">
              <button
                type="button"
                className={`role-option ${
                  role === "provider" ? "selected" : ""
                }`}
                onClick={() => {
                  setRole("provider");
                  clearMessages();
                }}
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
                onClick={() => {
                  setRole("ngo");
                  clearMessages();
                }}
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
          )}

          {/* SIGNUP STEP 1: Organization details */}
          {mode === "signup" && signupStep === 1 && (
            <>
              <label className="form-field">
                <span>
                  {role === "provider"
                    ? "Restaurant Name"
                    : "NGO / Shelter Name"}
                </span>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={
                    role === "provider"
                      ? "e.g. Green Leaf Bakery"
                      : "e.g. Hope Shelter"
                  }
                  required
                />
              </label>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="button button-primary button-full"
                type="button"
                onClick={() => {
                  clearMessages();

                  if (!name.trim()) {
                    setError(
                      role === "provider"
                        ? "Please enter your restaurant name."
                        : "Please enter your organization name."
                    );
                    return;
                  }

                  setSignupStep(2);
                }}
              >
                Continue →
              </button>
            </>
          )}

          {/* SIGNUP STEP 2: Verification */}
          {mode === "signup" && signupStep === 2 && (
            <div className="signup-verification">
              <h3>
                {role === "provider"
                  ? "Verify your restaurant"
                  : "Confirm your organization"}
              </h3>

              <p>
                Name / Organization: <strong>{name}</strong>
              </p>
                  
{role === "ngo" ? (
  <>
    <p>
      Enter your NGO registration details and upload your
      registration certificate to complete demo verification.
    </p>

    <label htmlFor="ngo-registration" className="verification-label">
      NGO Registration Number
    </label>
    <input
      id="ngo-registration"
      className="verification-input"
      type="text"
      value={ngoRegistrationNumber}
      onChange={(event) => {
        setNgoRegistrationNumber(event.target.value);
        setNgoVerificationStatus("idle");
        setNgoUploadError("");
      }}
      placeholder="Enter registration number"
    />

    <label htmlFor="ngo-location" className="verification-label">
      Organization Location
    </label>
    <input
      id="ngo-location"
      className="verification-input"
      type="text"
      value={ngoLocation}
      onChange={(event) => {
        setNgoLocation(event.target.value);
        setNgoVerificationStatus("idle");
        setNgoUploadError("");
      }}
      placeholder="City, State"
    />

    <label htmlFor="ngo-certificate" className="verification-label">
      Upload NGO Registration Certificate (PDF, JPG or PNG)
    </label>
    <input
      id="ngo-certificate"
      className="verification-input"
      type="file"
      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
      onChange={(event) => {
        setNgoCertificateFile(event.target.files?.[0] || null);
        setNgoVerificationStatus("idle");
        setNgoUploadError("");
      }}
    />

    {ngoCertificateFile && (
      <p>Selected file: {ngoCertificateFile.name}</p>
    )}

    <p className="form-hint">
      Demo verification checks that the required information and
      a supported file are provided. It does not verify official
      registration with an authority.
    </p>

    {ngoUploadError && (
      <p className="form-error" role="alert">
        {ngoUploadError}
      </p>
    )}

    {ngoVerificationStatus === "verified" ? (
      <>
        <div className="verification-success" role="status">
          <strong>✓ NGO Demo Verification Successful</strong>
          <p>You can now continue to create your account.</p>
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
          setNgoUploadError("");

          if (
            !ngoRegistrationNumber.trim() ||
            !ngoLocation.trim() ||
            !ngoCertificateFile
          ) {
            setNgoUploadError(
              "Please enter the registration number and location, and upload the certificate."
            );
            return;
          }

          const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
          ];

          if (!allowedTypes.includes(ngoCertificateFile.type)) {
            setNgoUploadError("Please upload a PDF, JPG or PNG file.");
            return;
          }

          setNgoVerificationStatus("verified");
        }}
      >
        Verify NGO (Demo)
      </button>
    )}
  </>
        ) :           (
                <>
                  <p>
                    Upload your FSSAI licence and complete demo
                    verification to continue.
                  </p>

                  <label
                    htmlFor="license-upload"
                    className="verification-label"
                  >
                    Upload FSSAI licence (PDF, JPG or PNG)
                  </label>

                  <input
                    id="license-upload"
                    className="verification-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => {
                      setLicenseFile(
                        event.target.files?.[0] || null
                      );
                      setUploadError("");
                      setVerificationStatus("idle");
                    }}
                  />

                  <label
                    htmlFor="fssai-number"
                    className="verification-label"
                  >
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
                    Demo only: use DEMO123456. This does not
                    verify a genuine FSSAI licence.
                  </p>

                  {licenseFile && (
                    <p>Selected file: {licenseFile.name}</p>
                  )}

                  {uploadError && (
                    <p className="form-error" role="alert">
                      {uploadError}
                    </p>
                  )}

                  {verificationStatus === "verified" ? (
                    <>
                      <div
                        className="verification-success"
                        role="status"
                      >
                        <strong>
                          ✓ Demo Verification Successful
                        </strong>
                        <p>
                          This is a demo result only, not official
                          licence verification.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="button button-primary button-full verification-continue-button"
                        onClick={() => {
                          clearMessages();
                          setSignupStep(3);
                        }}
                      >
                        Continue to Account Creation →
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="button button-primary button-full verification-button"
                      onClick={verifyProviderLicense}
                    >
                      Verify Licence (Demo)
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                className="button button-full verification-back-button"
                onClick={() => {
                  clearMessages();
                  setSignupStep(1);
                }}
              >
                ← Back
              </button>
            </div>
          )}

          {/* LOGIN: Email and password */}
          
{mode === "login" && !forgotMode && (
  <>
    <label className="form-field">
      <span>Email</span>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        autoComplete="username"
        required
      />
    </label>

    <label className="form-field">
      <span>Password</span>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />
    </label>

    {error && (
      <p className="form-error" role="alert">
        {error}
      </p>
    )}

    {message && (
      <p className="form-success" role="status">
        {message}
      </p>
    )}

    <button
      className="button button-primary button-full"
      type="submit"
    >
      Login as {role === "provider" ? "Provider" : "NGO"} →
    </button>

    
<button
  type="button"
  className="forgot-password-link"
  onClick={() => {
    clearMessages();
    setForgotMode(false);
    setMessage(
      "Password recovery is not configured yet. Please contact the FoodBridge administrator for assistance."
    );
  }}
>
  Forgot Password?
</button>

  </>
)}
          
{mode === "login" && forgotMode && (
  
  <div className="forgot-password-form">
    <p>
      Reset your password for your{" "}
      {role === "provider" ? "provider" : "NGO"} account.
    </p>

    <label className="form-field">
      <span>Registered Email</span>
      <input
        type="email"
        value={resetEmail}
        onChange={(event) => setResetEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />
    </label>

    <label className="form-field">
      <span>New Password</span>
      <input
        type="password"
        value={resetPassword}
        onChange={(event) => setResetPassword(event.target.value)}
        placeholder="Enter new password"
        autoComplete="new-password"
        required
      />
    </label>

    <label className="form-field">
      <span>Confirm New Password</span>
      <input
        type="password"
        value={resetConfirmPassword}
        onChange={(event) =>
          setResetConfirmPassword(event.target.value)
        }
        placeholder="Re-enter new password"
        autoComplete="new-password"
        required
      />
    </label>

    {error && (
      <p className="form-error" role="alert">
        {error}
      </p>
    )}

    {message && (
      <p className="form-success" role="status">
        {message}
      </p>
    )}

    <button
      className="button button-primary button-full"
      type="submit"
    >
      Reset Password →
    </button>

    <button
      type="button"
      className="button button-full"
      onClick={() => {
        setForgotMode(false);
        clearMessages();
      }}
    >
      ← Back to Login
    </button>
  </div>
)}


          {/* SIGNUP STEP 3: Create account */}
          {mode === "signup" && signupStep === 3 && (
            <>
              <p>
                {role === "provider"
                  ? "Create login details for your restaurant."
                  : "Create login details for your organization."}
              </p>

              <label className="form-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="form-field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s])\S{8,}"
                  title="Use at least 8 characters, including uppercase, lowercase, a number and a special character. No spaces."
                  required
                />
              </label>

              <label className="form-field">
                <span>Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                />
              </label>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="form-success" role="status">
                  {message}
                </p>
              )}

              <button
                className="button button-primary button-full"
                type="submit"
              >
                Create Account →
              </button>

              <button
                type="button"
               className="button button-full signup-back-button"
                onClick={() => {
                  clearMessages();
                  setSignupStep(2);
                }}
              >
                ← Back
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
