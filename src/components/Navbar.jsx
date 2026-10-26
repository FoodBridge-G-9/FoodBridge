import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Logo from "./Logo";
import Button from "./Button";
import { useSessionContext } from "../context/SessionContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, changeTheme } = useTheme();
  const { session, logout } = useSessionContext();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigate = useNavigate();
  const donations = useSelector((state) => state.donations.items);
  const [requests] = useLocalStorage(STORAGE_KEYS.requests, []);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    setNotificationsOpen(false);
    navigate("/login");
  };

  const dashboardPath =
    session?.role === "provider" ? "/provider/dashboard" : "/ngo/dashboard";

  // Provider's donations
  const myDonations = useMemo(
    () =>
      donations.filter(
        (donation) => String(donation.providerId) === String(session?.id),
      ),
    [donations, session?.id],
  );

  const myDonationIds = useMemo(
    () => new Set(myDonations.map((donation) => String(donation.id))),
    [myDonations],
  );

  // Requests received by this provider
  const incomingRequests = useMemo(
    () =>
      requests
        .filter((request) => myDonationIds.has(String(request.donationId)))
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        ),
    [requests, myDonationIds],
  );

  const activeRequests = useMemo(
    () =>
      incomingRequests.filter((request) => {
        if (request.status !== "Requested") return false;

        const donation = myDonations.find(
          (item) => String(item.id) === String(request.donationId),
        );

        return donation && donation.status === "Available";
      }),
    [incomingRequests, myDonations],
  );

  // Accepted/declined requests belonging to this NGO
  const ngoNotifications = useMemo(
    () =>
      requests
        .filter(
          (request) =>
            String(request.ngoId) === String(session?.id),
        )
        .map((request) => {
          const donation = donations.find(
            (item) =>
              String(item.id) === String(request.donationId),
          );

          const expired =
            donation?.status === "Expired" ||
            (donation?.pickupDeadline &&
              new Date(donation.pickupDeadline).getTime() <= Date.now());

          return {
            ...request,
            notificationType: expired ? "Expired" : request.status,
          };
        })
        .filter((request) =>
          ["Accepted", "Declined", "Expired"].includes(
            request.notificationType,
          ),
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0).getTime() -
            new Date(a.updatedAt || a.createdAt || 0).getTime(),
        ),
    [requests, session?.id, donations],
  );

  const isProvider = session?.role === "provider";
  const isNgo = session?.role === "ngo";

  const notificationCount = isProvider
    ? activeRequests.length
    : isNgo
      ? ngoNotifications.length
      : 0;

  useEffect(() => {
    setNotificationsOpen(false);
  }, [session?.id, session?.role]);

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
<div className="theme-selector">
  

  <select
    id="theme-select"
    className="theme-select"
    aria-label="Choose website theme"
    value={theme}
    onChange={(e) => changeTheme(e.target.value)}
  >
    <option value="nature">🌿 Nature</option>
    <option value="ocean">🌊 Ocean</option>
    <option value="blush">🌸 Blush</option>
    <option value="lavender">💜 Lavender</option>
    <option value="peach">🍑 Peach</option>
    <option value="midnight">🌙 Midnight</option>
  </select>
</div>




         
   

          {(isProvider || isNgo) && (
            <div className="notification-wrapper">
              <button
                type="button"
                className="notification-button"
                aria-label={`${notificationCount} notifications`}
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((current) => !current)}
              >
               <span
                className={`notification-icon ${
                  notificationsOpen ? "active" : ""
                }`}
              >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                </span>

                {notificationCount > 0 && (
                  <span className="notification-count">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">
                  <h3>{isProvider ? "NGO Requests" : "Request Updates"}</h3>

                  {isProvider ? (
                    activeRequests.length === 0 ? (
                      <p>No new requests yet.</p>
                    ) : (
                      activeRequests.map((request) => {
                        const donation = myDonations.find(
                          (item) =>
                            String(item.id) === String(request.donationId),
                        );

                        return (
                          <div className="notification-item" key={request.id}>
                            <strong>New food request</strong>
                            <p>
                              {request.ngoName || "An NGO"} requested{" "}
                              {donation?.foodName ||
                                request.donationName ||
                                "your donation"}
                              .
                            </p>
                          </div>
                        );
                      })
                    )
                  ) : ngoNotifications.length === 0 ? (
                    <p>No request updates yet.</p>
                  ) : (
                    
                  ngoNotifications.map((request) => {
                    const expired = request.notificationType === "Expired";
                    const accepted = request.status === "Accepted" && !expired;

                      return (
                        <div className="notification-item" key={request.id}>
                          <strong>
                            {expired
                              ? "Food item expired ⏰"
                              : accepted
                                ? "Request accepted ✓"
                                : "Request declined"}
                          </strong>

                          <p>
                            {expired
                              ? `We regret to inform you that the food item "${
                                  request.donationName || "you requested"
                                }" has expired and is no longer available for collection. We apologize for the inconvenience. Please explore other available donations.`
                              : `Your request for ${
                                  request.donationName || "food donation"
                                } ${
                                  accepted
                                    ? "has been accepted by the provider."
                                    : "has been declined by the provider."
                                }`}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {session && (
            <button className="nav-logout" type="button" onClick={handleLogout}>
              Log out
            </button>
          )}
        </nav>

        <div className="desktop-nav-action">
          {session ? (
            <Button to={dashboardPath} variant="secondary">
              Open Dashboard
            </Button>
          ) : (
            <Button to="/login">Get Started</Button>
          )}
        </div>
      </div>
    </header>
  );
}
