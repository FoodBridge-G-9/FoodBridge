import React from "react";
import { Link } from "react-router-dom";

export default function FoodCard({ donation }) {
  return (
    <article className="food-card">
      <div className="food-card-visual" aria-hidden="true">
        {donation.accent}
      </div>
      <div className="food-card-body">
        <div className="food-card-topline">
          <span className="tag">{donation.category}</span>
          <span className="availability-dot">Available</span>
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
          <span className="deadline">Pickup by {donation.pickupDeadline}</span>
          <Link className="text-link" to={`/food/${donation.id}`}>
            View details →
          </Link>
        </div>
      </div>
    </article>
  );
}
