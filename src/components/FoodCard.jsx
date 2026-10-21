// import React from "react";
// import { Link } from "react-router-dom";
// import { getFoodImage } from "../utils/foodImages";

// export default function FoodCard({ donation }) {
//   return (
//     <article className="food-card">
//       <div className="food-card-visual" >
//          <img
//             src={getFoodImage(donation)}
//             alt={`${donation.foodName || donation.category} donation`}
//             loading="lazy"
//           />
//           <span className="food-image-label">
//             {donation.category || "Food Donation"}
//           </span>
//       </div>
//       <div className="food-card-body">
//         <div className="food-card-topline">
//           <span className="tag">{donation.category}</span>
//          <span className="availability-dot">
//   {donation.status === "Picked Up"
//     ? "Claimed"
//     : donation.status || "Available"}
// </span>
//         </div>
//         <h3>{donation.foodName}</h3>
//         <p className="food-provider">{donation.provider}</p>
//         <div className="food-meta">
//           <span>
//             📦 {donation.quantity} {donation.unit}
//           </span>
//           <span>📍 {donation.location}</span>
//         </div>
//         <div className="food-card-footer">
//           <span className="deadline">Pickup by {donation.pickupDeadline}</span>
//           <Link className="text-link" to={`/food/${donation.id}`}>
//             View details →
//           </Link>
//         </div>
//       </div>
//     </article>
//   );
// }

import React from "react";
import { Link } from "react-router-dom";
import { getFoodImage } from "../utils/foodImages";
import { formatDeadline, isDeadlinePassed } from "../utils/donationUtils";
import DeadlineBadge from "./DeadlineBadge";

function getStatusLabel(donation) {
  if (donation.status === "Picked Up") return "Picked up";
  if (donation.status === "Claimed") return "Claimed";
  if (
    donation.status === "Available" &&
    isDeadlinePassed(donation.pickupDeadline)
  )
    return "Expired";
  return donation.status || "Available";
}

export default function FoodCard({ donation }) {
  const statusLabel = getStatusLabel(donation);
  const available = statusLabel === "Available";

  return (
    <article
      className={`food-card ${available ? "" : "food-card-unavailable"}`}
    >
      <div className="food-card-visual">
        <img
          src={getFoodImage(donation)}
          alt={`${donation.foodName || donation.category} donation`}
          loading="lazy"
        />
        <span className="food-image-label">
          {donation.category || "Food Donation"}
        </span>
      </div>
      <div className="food-card-body">
        <div className="food-card-topline">
          <span className="tag">{donation.category}</span>
          <span
            className={`availability-dot availability-${statusLabel.toLowerCase().replace(/\s+/g, "-")}`}
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
