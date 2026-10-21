import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FoodCard from "../components/FoodCard";
// import { useLocalStorage } from "../hooks/useLocalStorage";
// import { initialDonations } from "../data/donations";
import { useSelector } from "react-redux";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";
import { useSessionContext } from "../context/SessionContext";
import { getFoodImage } from "../utils/foodImages";
export default function FoodDetails() {
  const{session}=useSessionContext();
  const { id } = useParams();
  const navigate = useNavigate();
 const donations = useSelector((state) => state.donations.items);
const [requests, setRequests] = useLocalStorage(
  STORAGE_KEYS.requests,
  []
);
  const donation = donations.find((item) => String(item.id) === String(id));

  if (!donation) {
    return (
      <section className="section">
        <div className="container empty-state">
          <div>🍽️</div>
          <h1>Donation not found</h1>
          <p>The listing may have been removed or the link is incorrect.</p>
          <Link className="button button-primary" to="/food">
            Back to available food
          </Link>
        </div>
      </section>
    );
  }

  const currentRequest =
    session?.role === "ngo"
      ? requests.find(
          (request) =>
            request.donationId === donation.id && request.ngoId === session.id,
        )
      : null;

  const providerRequestCount = requests.filter(
    (request) => request.donationId === donation.id,
  ).length;

  const moreFromProvider = donations
    .filter(
      (item) =>
        item.providerId === donation.providerId && item.id !== donation.id,
    )
    .slice(0, 3);

  const handleRequest = () => {
    if (!session) {
      navigate("/login", { state: { from: `/food/${donation.id}` } });
      return;
    }

    if (session.role !== "ngo") {
      navigate("/ngo/dashboard");
      return;
    }

    if (
  donation.status !== "Available" ||
  currentRequest?.status === "Requested" ||
  currentRequest?.status === "Accepted"
) {
  return;
}

    setRequests((current) => {
      const existing = current.find(
        (request) =>
          request.donationId === donation.id && request.ngoId === session.id,
      );
      if (existing) {
        return current.map((request) =>
          request.id === existing.id
            ? {
                ...request,
                status: "Requested",
                createdAt: new Date().toISOString(),
              }
            : request,
        );
      }
      return [
        ...current,
        {
          id: `${donation.id}-${session.id}-${Date.now()}`,
          donationId: donation.id,
          donationName: donation.foodName,
          providerId: donation.providerId,
          providerName: donation.provider,
          ngoId: session.id,
          ngoName: session.name,
          createdAt: new Date().toISOString(),
          status: "Requested",
        },
      ];
    });
  };

  return (
    <section className="section">
      <div className="container">
        <Link className="back-link" to="/food">
          ← Back to available food
        </Link>
        <div className="details-layout">
          <div className="food-details-image">
          <img
            src={getFoodImage(donation)}
            alt={`${donation.foodName || donation.category} donation`}
          />
          
        </div>
          <div className="details-content">
            <span className="tag">{donation.foodType}</span>
            <h1>{donation.foodName}</h1>
            <p className="details-provider">
              Provided by <strong>{donation.provider}</strong>
            </p>
            <p className="details-description">{donation.description}</p>
            <div className="details-stats">
              <div>
                <span>Quantity</span>
                <strong>
                  {donation.quantity} {donation.unit}
                </strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{donation.location}</strong>
              </div>
              <div>
                <span>Pickup deadline</span>
                <strong>
                {donation.pickupDeadline
                    ? !Number.isNaN(new Date(donation.pickupDeadline).getTime())
                      ? new Date(donation.pickupDeadline).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : donation.pickupDeadline
                    : "Not specified"}
              </strong>
              </div>
            </div>
            <div className="details-callout">
              <strong>Requests so far</strong>
              <span>
                {providerRequestCount} NGO{" "}
                {providerRequestCount === 1
                  ? "organization has"
                  : "organizations have"}{" "}
                requested this donation.
              </span>
            </div>
             {donation.status === "Expired" ? (
                <div className="info-box">
                  ⏰ This donation has expired. The pickup deadline has passed,
                  so it is no longer available for requests.Please explore other available donations.
                  </div>
             ) :
            session?.role === "provider" &&
              session.id === donation.providerId ? (
                <div className="info-box">
                  This is your listing. Open your dashboard to review NGO
                  requests.
                </div>
              ) : currentRequest?.status === "Accepted" ? (
                <div className="success-box">
                  ✓ Claimed by your NGO! The provider accepted your request.
                  {donation.status === "Picked Up" && (
                    <p>✓ This donation has been picked up.</p>
                  )}
                </div>
              )  
                : currentRequest?.status === "Requested" ? (
                <div className="success-box">
                  ✓ Your request is recorded and waiting for the provider.
                </div>
                ) : donation.status === "Claimed" ||
                donation.status === "Picked Up" ? (
                <div className="info-box">
                  {donation.status === "Picked Up"
                    ? "This donation has already been picked up."
                    : "This donation has already been claimed by another NGO."}
                </div>
              ) : donation.status !== "Available" ? (
                <div className="info-box">
                  This donation is no longer available for requests.
                </div>
              ) : (
            <button
              className="button button-primary button-large"
              type="button"
              onClick={handleRequest}
            >
              Request this donation
            </button>
          )}
          </div>
        </div>

        {moreFromProvider.length > 0 && (
          <div className="section-heading-row dashboard-list-heading">
            <div>
              <p className="eyebrow">MORE FROM THIS PROVIDER</p>
              <h2>Other listings by {donation.provider}</h2>
            </div>
          </div>
        )}
        {moreFromProvider.length > 0 && (
          <div className="food-grid">
            {moreFromProvider.map((item) => (
              <FoodCard donation={item} key={item.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
