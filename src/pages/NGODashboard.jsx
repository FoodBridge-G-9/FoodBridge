import DonationLocation from "../components/DonationLocation";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import FoodCard from "../components/FoodCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSessionContext } from "../context/SessionContext";
import { STORAGE_KEYS } from "../utils/storage";
import {
  getRequestDisplayStatus,
  isDonationAvailable,
} from "../utils/donationUtils";

const STATUS_FILTERS = [
  "All",
  "Requested",
  "Accepted",
  "Completed",
  "Declined",
  "Cancelled",
  "Expired",
];

export default function NGODashboard() {
  const { session } = useSessionContext();

  const donations = useSelector((state) => state.donations.items);

  const [requests, setRequests] = useLocalStorage(STORAGE_KEYS.requests, []);
  const [reviews, setReviews] = useLocalStorage(STORAGE_KEYS.reviews, []);
  const [safetyReports, setSafetyReports] = useLocalStorage(
    STORAGE_KEYS.safetyReports,
    [],
  );
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [safetyDrafts, setSafetyDrafts] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [now, setNow] = useState(() => Date.now());

  // Refresh deadline-based availability periodically.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Find donations associated with each request.
  // Build the donation lookup.
  const donationById = useMemo(
    () => new Map(donations.map((donation) => [String(donation.id), donation])),
    [donations],
  );

  // Show only requests belonging to the signed-in NGO.
  const myRequests = useMemo(
    () =>
      requests
        .filter((request) => String(request.ngoId) === String(session?.id))
        .map((request) => {
          const donation = donationById.get(String(request.donationId));

          return {
            ...request,
            donation,
            displayStatus: getRequestDisplayStatus(request, donation),
          };
        }),
    [requests, session?.id, donationById],
  );

  // Apply the selected status filter.
  const visibleRequests = useMemo(
    () =>
      statusFilter === "All"
        ? myRequests
        : myRequests.filter(
            (request) => request.displayStatus === statusFilter,
          ),
    [myRequests, statusFilter],
  );

  // Available donations appear in pickup-deadline order.
  const availableDonations = useMemo(
    () =>
      donations
        .filter((donation) => isDonationAvailable(donation, now))
        .sort(
          (a, b) =>
            new Date(a.pickupDeadline).getTime() -
            new Date(b.pickupDeadline).getTime(),
        ),
    [donations, now],
  );

  // Dashboard metrics.
  const pendingCount = myRequests.filter(
    (request) => request.displayStatus === "Requested",
  ).length;

  const acceptedCount = myRequests.filter(
    (request) => request.displayStatus === "Accepted",
  ).length;

  const completedRequests = myRequests.filter(
    (request) => request.displayStatus === "Completed",
  );

  // Count each completed donation only once.
  const completedDonationIds = new Set(
    completedRequests.map((request) => String(request.donationId)),
  );

  const completedPickupCount = completedDonationIds.size;

  const completedDonations = new Map();

  completedRequests.forEach((request) => {
    const donation =
      request.donation || donationById.get(String(request.donationId));

    if (donation && donation.unit?.toLowerCase() === "portions") {
      completedDonations.set(String(request.donationId), donation);
    }
  });

  const portionsRescued = [...completedDonations.values()].reduce(
    (total, donation) => total + Number(donation.quantity || 0),
    0,
  );

  const expiredRequests = myRequests.filter(
    (request) => request.displayStatus === "Expired",
  );
  const hasReviewedDonation = (donationId) =>
    reviews.some((review) => String(review.donationId) === String(donationId));
  const hasReportedDonation = (donationId) =>
    safetyReports.some(
      (report) =>
        String(report.donationId) === String(donationId) &&
        String(report.ngoId) === String(session?.id),
    );

  const submitReview = (request) => {
    const donation = request.donation;
    const rating = Number(ratingDrafts[request.id]?.rating || 0);
    const comment = (ratingDrafts[request.id]?.comment || "").trim();
    if (!donation || donation.status !== "Picked Up") {
      setFeedbackMessage(
        "You can rate a provider only after the pickup is marked Picked Up.",
      );
      return;
    }
    if (hasReviewedDonation(donation.id)) {
      setFeedbackMessage(
        "This donation already has a review. Only one review is allowed per donation.",
      );
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setFeedbackMessage("Please select a star rating from 1 to 5.");
      return;
    }
    setReviews((current) => {
      if (
        current.some(
          (review) => String(review.donationId) === String(donation.id),
        )
      )
        return current;
      return [
        ...current,
        {
          id: `${donation.id}-${session.id}`,
          donationId: donation.id,
          providerId: donation.providerId,
          providerName: donation.provider,
          ngoId: session.id,
          ngoName: session.name,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        },
      ];
    });
    setFeedbackMessage("Thank you — your provider review has been submitted.");
  };

  const submitSafetyReport = (request) => {
    const donation = request.donation;
    const concern = (safetyDrafts[request.id]?.concern || "").trim();
    const details = (safetyDrafts[request.id]?.details || "").trim();
    if (!donation || donation.status !== "Picked Up") {
      setFeedbackMessage(
        "Food safety reports can be submitted after the pickup is marked Picked Up.",
      );
      return;
    }
    if (!concern) {
      setFeedbackMessage(
        "Choose a freshness or hygiene concern before submitting.",
      );
      return;
    }
    if (hasReportedDonation(donation.id)) {
      setFeedbackMessage(
        "Your organization has already submitted a safety report for this donation.",
      );
      return;
    }
    setSafetyReports((current) => [
      ...current,
      {
        id: `${donation.id}-${session.id}-${Date.now()}`,
        donationId: donation.id,
        donationName: donation.foodName,
        providerId: donation.providerId,
        providerName: donation.provider,
        ngoId: session.id,
        ngoName: session.name,
        concern,
        details,
        createdAt: new Date().toISOString(),
      },
    ]);
    setFeedbackMessage(
      "Safety concern submitted separately from the star rating.",
    );
  };

  // Cancel only this NGO's own pending request.
  const cancelRequest = (requestId) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        String(request.id) === String(requestId) &&
        String(request.ngoId) === String(session?.id) &&
        request.status === "Requested"
          ? {
              ...request,
              status: "Cancelled",
            }
          : request,
      ),
    );
  };

  return (
    <section className="dashboard-section">
      <div className="container">
        {/* Dashboard heading */}
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">NGO / SHELTER DASHBOARD</p>

            <h1>Welcome, {session?.name || "Community Partner"}.</h1>

            <p>
              Find food that needs collection soon and track every request made
              by your organization.
            </p>
          </div>

          <div className="dashboard-stat">
            <span>My requests</span>
            <strong>{myRequests.length}</strong>
          </div>
        </div>

        {/* NGO metrics */}
        <div className="ngo-metrics">
          <article className="ngo-metric-card">
            <span>Awaiting response</span>
            <strong>{pendingCount}</strong>
            <small>Requests sent to providers</small>
          </article>

          <article className="ngo-metric-card">
            <span>Accepted</span>
            <strong>{acceptedCount}</strong>
            <small>Ready to coordinate pickup</small>
          </article>

          <article className="ngo-metric-card">
            <span>Completed pickups</span>
            <strong>{completedPickupCount}</strong>
            <small>Unique completed donations</small>
          </article>

          <article className="ngo-metric-card">
            <span>Portions rescued</span>
            <strong>{portionsRescued.toLocaleString("en-IN")}</strong>
            <small>Based on completed listings</small>
          </article>
        </div>

        {/* Pickup reminder */}
        <div className="ngo-callout">
          <span aria-hidden="true">💚</span>

          <div>
            <strong>Prioritize the pickup window</strong>
            <p>
              Listings are sorted by deadline. A request is confirmed only after
              the provider accepts it.
            </p>
          </div>

          <Link className="button button-secondary" to="/food">
            Browse food
          </Link>
        </div>

        {expiredRequests.length > 0 && (
          <div className="error-box ngo-expiry-alert" role="alert">
            <strong>
              ⏰ {expiredRequests.length} requested donation
              {expiredRequests.length === 1 ? " has" : "s have"} expired.
            </strong>
            <p>
              {expiredRequests
                .map(
                  (request) =>
                    request.donationName ||
                    request.donation?.foodName ||
                    "A donation",
                )
                .join(", ")}{" "}
              — these pickup windows have passed. Please do not travel for
              expired listings; browse current availability instead.
            </p>
          </div>
        )}
        {feedbackMessage && (
          <div className="success-box ngo-feedback-message" role="status">
            {feedbackMessage}
            <button
              type="button"
              className="small-action"
              onClick={() => setFeedbackMessage("")}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Request tracker */}
        <div className="dashboard-panel request-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MY ACTIVITY</p>
              <h2>Request tracker</h2>
            </div>
          </div>

          <div
            className="status-filter-bar"
            aria-label="Filter requests by status"
          >
            {STATUS_FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                className={`status-filter-btn ${
                  statusFilter === option ? "active" : ""
                }`}
                aria-pressed={statusFilter === option}
                onClick={() => setStatusFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {myRequests.length === 0 ? (
            <div className="empty-inline">
              <span>📬</span>

              <div>
                <strong>Your request tracker is ready.</strong>

                <p>
                  Browse available food and request a listing. Its status will
                  appear here.
                </p>

                <Link className="text-link" to="/food">
                  Find available food →
                </Link>
              </div>
            </div>
          ) : visibleRequests.length === 0 ? (
            <p className="muted-text">No requests match the selected status.</p>
          ) : (
            <div className="request-list">
              {visibleRequests.map((request) => {
                const requestId = request.id ?? request._id;

                const donationId = request.donation?._id ?? request.donationId;

                const statusClass = request.displayStatus
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                const createdAt = request.createdAt
                  ? new Date(request.createdAt)
                  : null;

                const formattedDate =
                  createdAt && Number.isFinite(createdAt.getTime())
                    ? createdAt.toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "date unavailable";

                return (
                  <article
                    className="request-item request-item-detailed"
                    key={requestId}
                  >
                    <div className="request-item-copy">
                      <strong>
                        {request.donationName ||
                          request.donation?.foodName ||
                          "Food donation"}
                      </strong>

                      <small>
                        From{" "}
                        {request.providerName ||
                          request.donation?.provider ||
                          "Food provider"}{" "}
                        · Requested {formattedDate}
                      </small>

                      {request.donation && (
                        <DonationLocation donation={request.donation} />
                      )}
                    </div>

                    <div className="request-item-status-actions">
                      <span className={`status-pill status-${statusClass}`}>
                        {request.displayStatus}
                      </span>

                      {request.donation && (
                        <Link className="text-link" to={`/food/${donationId}`}>
                          View listing →
                        </Link>
                      )}

                      {request.displayStatus === "Requested" && (
                        <button
                          className="small-action decline"
                          type="button"
                          onClick={() => cancelRequest(requestId)}
                        >
                          Cancel request
                        </button>
                      )}
                    </div>

                    {request.displayStatus === "Expired" && (
                      <div className="request-expiry-notice" role="alert">
                        ⏰ This donation's pickup deadline has passed. This
                        request is expired; please choose another listing.
                      </div>
                    )}

                    {request.donation?.status === "Picked Up" && (
                      <div className="ngo-review-panel">
                        {hasReviewedDonation(request.donation.id) ? (
                          <p className="muted-text">
                            ✓ A review has already been submitted for this
                            donation.
                          </p>
                        ) : (
                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              submitReview(request);
                            }}
                          >
                            <strong>Rate your pickup experience</strong>
                            <p className="muted-text">
                              Only available after pickup is confirmed. One
                              review per donation.
                            </p>
                            <label className="form-field">
                              <span>Provider rating *</span>
                              <select
                                required
                                value={ratingDrafts[requestId]?.rating || ""}
                                onChange={(event) =>
                                  setRatingDrafts((current) => ({
                                    ...current,
                                    [requestId]: {
                                      ...current[requestId],
                                      rating: event.target.value,
                                    },
                                  }))
                                }
                              >
                                <option value="">Choose stars</option>
                                <option value="5">★★★★★ — Excellent</option>
                                <option value="4">★★★★ — Good</option>
                                <option value="3">★★★ — Okay</option>
                                <option value="2">★★ — Poor</option>
                                <option value="1">★ — Very poor</option>
                              </select>
                            </label>
                            <label className="form-field">
                              <span>Review (optional)</span>
                              <textarea
                                rows="2"
                                maxLength="500"
                                value={ratingDrafts[requestId]?.comment || ""}
                                onChange={(event) =>
                                  setRatingDrafts((current) => ({
                                    ...current,
                                    [requestId]: {
                                      ...current[requestId],
                                      comment: event.target.value,
                                    },
                                  }))
                                }
                                placeholder="Share a short note about the pickup..."
                              />
                            </label>
                            <button
                              className="button button-primary"
                              type="submit"
                            >
                              Submit review
                            </button>
                          </form>
                        )}

                        <div className="ngo-safety-report">
                          <strong>Food safety concern?</strong>
                          <p className="muted-text">
                            Report freshness or hygiene issues separately. A
                            star rating is not a safety report.
                          </p>
                          {hasReportedDonation(request.donation.id) ? (
                            <p className="muted-text">
                              ✓ Your organization has submitted a safety report
                              for this donation.
                            </p>
                          ) : (
                            <form
                              onSubmit={(event) => {
                                event.preventDefault();
                                submitSafetyReport(request);
                              }}
                            >
                              <label className="form-field">
                                <span>Concern type *</span>
                                <select
                                  required
                                  value={safetyDrafts[requestId]?.concern || ""}
                                  onChange={(event) =>
                                    setSafetyDrafts((current) => ({
                                      ...current,
                                      [requestId]: {
                                        ...current[requestId],
                                        concern: event.target.value,
                                      },
                                    }))
                                  }
                                >
                                  <option value="">Choose concern</option>
                                  <option value="Freshness">
                                    Food freshness / spoilage concern
                                  </option>
                                  <option value="Hygiene">
                                    Hygiene / contamination concern
                                  </option>
                                  <option value="Storage">
                                    Unsafe storage / temperature concern
                                  </option>
                                  <option value="Other serious concern">
                                    Other serious food-safety concern
                                  </option>
                                </select>
                              </label>
                              <label className="form-field">
                                <span>Details (optional)</span>
                                <textarea
                                  rows="2"
                                  maxLength="1000"
                                  value={safetyDrafts[requestId]?.details || ""}
                                  onChange={(event) =>
                                    setSafetyDrafts((current) => ({
                                      ...current,
                                      [requestId]: {
                                        ...current[requestId],
                                        details: event.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Describe what you observed..."
                                />
                              </label>
                              <button
                                className="button button-secondary"
                                type="submit"
                              >
                                Submit safety report
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Available donations */}
        <div className="section-heading-row dashboard-list-heading">
          <div>
            <p className="eyebrow">DISCOVER</p>
            <h2>Available donations</h2>
            <p className="muted-text">Sorted by soonest pickup deadline.</p>
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
                Check back soon. Listings disappear from discovery after their
                pickup deadline.
              </p>
            </div>
          </div>
        ) : (
          <div className="food-grid">
            {availableDonations.slice(0, 3).map((donation) => (
              <FoodCard donation={donation} key={donation.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
