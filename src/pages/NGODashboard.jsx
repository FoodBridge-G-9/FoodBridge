// import React from "react";
// import { Link } from "react-router-dom";
// import { useMemo, useState } from "react";
// import FoodCard from "../components/FoodCard";
// import { useSelector } from "react-redux";
// import { STORAGE_KEYS } from "../utils/storage";
// import { useSessionContext } from "../context/SessionContext";
// import { useLocalStorage } from "../hooks/useLocalStorage";
// const STATUS_LABELS = {
//    Requested: "Requested",
//   Accepted: "Claimed",
//   Claimed: "Claimed",
//   Declined: "Declined",
//   Closed: "Closed",
// };

// const STATUS_FILTERS = ["All", "Requested", "Accepted", "Declined"];

// export default function NGODashboard() {
//   const{session}=useSessionContext();
//   const donations = useSelector(
//   (state) => state.donations.items
// );
//   const [requests] = useLocalStorage(STORAGE_KEYS.requests, []);
//   const [statusFilter, setStatusFilter] = useState("All");

//   const myRequests = useMemo(
//     () => requests.filter((request) => request.ngoId === session?.id),
//     [requests, session?.id],
//   );
//   const visibleRequests = useMemo(
//     () =>
//       statusFilter === "All"
//         ? myRequests
//         : myRequests.filter((request) => request.status === statusFilter),
//     [myRequests, statusFilter],
//   );
//   const requestedIds = useMemo(
//     () => new Set(myRequests.map((request) => request.donationId)),
//     [myRequests],
//   );
//   const availableDonations = donations.filter(
//   (donation) => donation.status === "Available"
// );

//   return (
//     <section className="dashboard-section">
//       <div className="container">
//         <div className="dashboard-header">
//           <div>
//             <p className="eyebrow">NGO / SHELTER DASHBOARD</p>
//             <h1>Welcome, {session?.name || "Community Partner"}.</h1>
//             <p>
//               Discover available food and track only the requests made by your
//               organization.
//             </p>
//           </div>
//           <div className="dashboard-stat">
//             <span>My requests</span>
//             <strong>{myRequests.length}</strong>
//           </div>
//         </div>

//         <div className="ngo-callout">
//           <span>💚</span>
//           <div>
//             <strong>Tip: act quickly</strong>
//             <p>
//               FoodBridge listings may have short pickup windows. Check the
//               deadline before requesting.
//             </p>
//           </div>
//           <Link className="button button-secondary" to="/food">
//             Browse food
//           </Link>
//         </div>

//         <div className="dashboard-panel request-panel">
//           <div className="panel-heading">
//             <div>
//               <p className="eyebrow">MY ACTIVITY</p>
//               <h2>My requests</h2>
//             </div>
//           </div>

//           {myRequests.length > 0 && (
//             <div className="status-filter-bar">
//               {STATUS_FILTERS.map((option) => (
//                 <button
//                   key={option}
//                   type="button"
//                   className={`status-filter-btn ${statusFilter === option ? "active" : ""}`}
//                   onClick={() => setStatusFilter(option)}
//                 >
//                   {option}
//                 </button>
//               ))}
//             </div>
//           )}

//           {myRequests.length === 0 ? (
//             <p className="muted-text">
//               You haven't requested any donations yet. Browse available food to
//               get started.
//             </p>
//           ) : visibleRequests.length === 0 ? (
//             <p className="muted-text">No requests match this filter yet.</p>
//           ) : (
//             <div className="request-list">
//               {visibleRequests.map((request) => (
//                 <div className="request-item" key={request.id}>
//                   <div>
//                     <strong>{request.donationName}</strong>
//                     <small>From {request.providerName}</small>
//                   </div>
//                   <span
//                     className={`status-pill status-${request.status.toLowerCase()}`}
//                   >
//                     {request.status === "Accepted" ? "Claimed" : (
//                        STATUS_LABELS[request.status] || request.status
//                     )}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="section-heading-row dashboard-list-heading">
//           <div>
//             <p className="eyebrow">DISCOVER</p>
//             <h2>Available donations</h2>
//           </div>
//           <Link className="text-link" to="/food">
//             See all →
//           </Link>
//         </div>
//         {availableDonations.length === 0 ? (
//   <div className="empty-inline">
//     <span>🍽️</span>
//     <div>
//       <strong>No available donations right now.</strong>
//       <p>
//         All current listings may be claimed, picked up, or awaiting
//         new donations. Check back soon.
//       </p>
//     </div>
//   </div>
// ) : (
//   <div className="food-grid">
//             {availableDonations.slice(0, 3).map((donation) => (
//               <div className="dashboard-food-wrapper" key={donation.id}>
//                 <FoodCard donation={donation} />
//                 {requestedIds.has(donation.id) && (
//                   <span className="requested-badge">✓ Requested by you</span>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

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

                      {request.donation?.location && (
                        <small>📍 {request.donation.location}</small>
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
