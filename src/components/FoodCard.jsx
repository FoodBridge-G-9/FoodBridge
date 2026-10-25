import React from "react";
import { Link } from "react-router-dom";
import { getFoodImage } from "../utils/foodImages";
import { formatDeadline, isDeadlinePassed } from "../utils/donationUtils";
import DeadlineBadge from "./DeadlineBadge";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";
import { getProviderRatingSummary } from "../utils/providerRatings";

function getStatusLabel(donation) {
  if (donation.status === "Picked Up") return "Picked up";
  if (donation.status === "Claimed") return "Claimed";

  if (
    donation.status === "Available" &&
    isDeadlinePassed(donation.pickupDeadline)
  ) {
    return "Expired";
  }

  return donation.status || "Available";
}

export default function FoodCard({
  donation,
  disabled = false,
  statusLabel: customStatusLabel,
}) {
  const [reviews] = useLocalStorage(STORAGE_KEYS.reviews, []);
  const rating = getProviderRatingSummary(reviews, donation.providerId);

  const statusLabel = customStatusLabel || getStatusLabel(donation);
  const available = statusLabel === "Available" && !disabled;

  const unavailableClass = available ? "" : "food-card-unavailable";

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

        <p
          className="food-provider-rating"
          aria-label="Provider average rating and review count"
        >
          {rating.count > 0 ? (
            <>
              ★ {rating.average.toFixed(1)}{" "}
              <span>
                ({rating.count} {rating.count === 1 ? "review" : "reviews"})
              </span>
            </>
          ) : (
            <span>Not rated yet</span>
          )}
        </p>

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
            <DeadlineBadge deadline={donation.pickupDeadline} compact />
          )}
        </div>

        <div className="food-card-footer">
          <Link className="text-link" to={`/food/${donation.id}`}>
            View details →
          </Link>
        </div>
      </div>
    </article>
  );
}
