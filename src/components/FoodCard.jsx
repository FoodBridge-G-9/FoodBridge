
import React from "react";
import { Link } from "react-router-dom";
import { getFoodImage } from "../utils/foodImages";
import {
  formatDeadline,
  isDeadlinePassed,
} from "../utils/donationUtils";
import DeadlineBadge from "./DeadlineBadge";

function getStatusLabel(donation) {
  if (
    donation.status === "Expired" ||
    isDeadlinePassed(donation.pickupDeadline)
  ) {
    return "Expired";
  }

  if (donation.status === "Picked Up") return "Picked up";
  if (donation.status === "Claimed") return "Claimed";

  return donation.status || "Available";
}


export default function FoodCard({
  donation,
  disabled = false,
  statusLabel: customStatusLabel,
}) {
  const statusLabel = customStatusLabel || getStatusLabel(donation);
  const available = statusLabel === "Available" && !disabled;

  const unavailableClass = available
    ? ""
    : "food-card-unavailable";

  return (
    <article
      className={`food-card ${unavailableClass}`}
      aria-disabled={!available}
    >
      <div className="food-card-visual">
        <img
          src={getFoodImage(donation)}
          alt={`${donation.foodName || donation.category} donation`}
          loading="lazy"
        />
      </div>

      <div className="food-card-body">
        <div className="food-card-topline">
          <span className="tag">{donation.category}</span>

          <span
            className={`availability-dot availability-${statusLabel
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {statusLabel}
          </span>
        </div>

        <h3>{donation.foodName}</h3>
        <p className="food-provider">{donation.provider}</p>

        <div className="food-meta">
          <span>
            📦 {donation.quantity} {donation.unit}
          </span>
          <span>📍 {donation.location}</span>
        </div>

        <div className="food-deadline-row">
          <span className="deadline">
            Pickup by {formatDeadline(donation.pickupDeadline)}
          </span>

          {available && (
            <DeadlineBadge
              deadline={donation.pickupDeadline}
              compact
            />
          )}
        </div>

        
<div className="food-card-footer">
  {available ? (
    <Link className="text-link" to={`/food/${donation.id}`}>
      View details →
    </Link>
  ) : (
    <span className="text-link" aria-disabled="true">
      {statusLabel === "Expired"
        ? "Expired"
        : statusLabel === "Claimed"
          ? "Already claimed"
          : statusLabel === "Picked up"
            ? "Already picked up"
            : "Unavailable"}
    </span>
  )}
</div>

      </div>
    </article>
  );
}
