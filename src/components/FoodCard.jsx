
import React from "react";
import { Link } from "react-router-dom";
import { getFoodImage } from "../utils/foodImages";

export default function FoodCard({ donation }) {
  const unavailable = ["Claimed", "Picked Up", "Expired"].includes(
    donation.status
  );

  const statusLabel =
    donation.status === "Claimed"
      ? "Already Claimed"
      : donation.status === "Picked Up"
      ? "Picked Up"
      : donation.status === "Expired"
      ? "Expired"
      : donation.status || "Available";

  return (
    <article className={`food-card ${unavailable ? "food-card-disabled" : ""}`}>
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
          <span className="availability-dot">
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

        <div className="food-card-footer">
          <span className="deadline">
            Pickup by {donation.pickupDeadline}
          </span>
          <Link className="text-link" to={`/food/${donation.id}`}>
            View details →
          </Link>
        </div>
      </div>
    </article>
  );
}
