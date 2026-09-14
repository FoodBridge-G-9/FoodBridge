import React from "react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import FoodCard from "../components/FoodCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialDonations } from "../data/donations";
import { STORAGE_KEYS } from "../utils/storage";

const STATUS_LABELS = {
  Requested: "Requested",
  Accepted: "Accepted",
  Declined: "Declined",
};

const STATUS_FILTERS = ["All", "Requested", "Accepted", "Declined"];

export default function NGODashboard({ session }) {
  const [donations] = useLocalStorage(STORAGE_KEYS.donations, initialDonations);
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
  const availableDonations = donations;

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
                    {STATUS_LABELS[request.status] || request.status}
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
              <p>Check back soon, or browse the full food list for updates.</p>
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
