import React from "react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import FoodCard from "../components/FoodCard";
import { useSelector } from "react-redux";
import { STORAGE_KEYS } from "../utils/storage";
import { useSessionContext } from "../context/SessionContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
const STATUS_LABELS = {
   Requested: "Requested",
  Accepted: "Claimed",
  Claimed: "Claimed",
  Declined: "Declined",
  Closed: "Closed",
};

const STATUS_FILTERS = ["All", "Requested", "Accepted", "Declined"];

export default function NGODashboard() {
  const{session}=useSessionContext();
  const donations = useSelector(
  (state) => state.donations.items
);
  const [requests] = useLocalStorage(STORAGE_KEYS.requests, []);
  const [statusFilter, setStatusFilter] = useState("All");

  const myRequests = useMemo(
    () => requests.filter((request) => request.ngoId === session?.id),
    [requests, session?.id],
  );
  const visibleRequests = useMemo(
    () =>
      statusFilter === "All"
        ? myRequests
        : myRequests.filter((request) => request.status === statusFilter),
    [myRequests, statusFilter],
  );
  const requestedIds = useMemo(
    () => new Set(myRequests.map((request) => request.donationId)),
    [myRequests],
  );
  const availableDonations = donations.filter(
  (donation) => donation.status === "Available"
);

  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">NGO / SHELTER DASHBOARD</p>
            <h1>Welcome, {session?.name || "Community Partner"}.</h1>
            <p>
              Discover available food and track only the requests made by your
              organization.
            </p>
          </div>
          <div className="dashboard-stat">
            <span>My requests</span>
            <strong>{myRequests.length}</strong>
          </div>
        </div>

        <div className="ngo-callout">
          <span>💚</span>
          <div>
            <strong>Tip: act quickly</strong>
            <p>
              FoodBridge listings may have short pickup windows. Check the
              deadline before requesting.
            </p>
          </div>
          <Link className="button button-secondary" to="/food">
            Browse food
          </Link>
        </div>

        <div className="dashboard-panel request-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MY ACTIVITY</p>
              <h2>My requests</h2>
            </div>
          </div>

          {myRequests.length > 0 && (
            <div className="status-filter-bar">
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`status-filter-btn ${statusFilter === option ? "active" : ""}`}
                  onClick={() => setStatusFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {myRequests.length === 0 ? (
            <p className="muted-text">
              You haven't requested any donations yet. Browse available food to
              get started.
            </p>
          ) : visibleRequests.length === 0 ? (
            <p className="muted-text">No requests match this filter yet.</p>
          ) : (
            <div className="request-list">
              {visibleRequests.map((request) => (
                <div className="request-item" key={request.id}>
                  <div>
                    <strong>{request.donationName}</strong>
                    <small>From {request.providerName}</small>
                  </div>
                  <span
                    className={`status-pill status-${request.status.toLowerCase()}`}
                  >
                    {request.status === "Accepted" ? "Claimed" : (
                       STATUS_LABELS[request.status] || request.status
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-heading-row dashboard-list-heading">
          <div>
            <p className="eyebrow">DISCOVER</p>
            <h2>Available donations</h2>
          </div>
          <Link className="text-link" to="/food">
            See all →
          </Link>
        </div>
        {availableDonations.length === 0 ? (
  <div className="empty-inline">
    <span>🍽️</span>
    <div>
      <strong>No available donations right now.</strong>
      <p>
        All current listings may be claimed, picked up, or awaiting
        new donations. Check back soon.
      </p>
    </div>
  </div>
) : (
  <div className="food-grid">
            {availableDonations.slice(0, 3).map((donation) => (
              <div className="dashboard-food-wrapper" key={donation.id}>
                <FoodCard donation={donation} />
                {requestedIds.has(donation.id) && (
                  <span className="requested-badge">✓ Requested by you</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
