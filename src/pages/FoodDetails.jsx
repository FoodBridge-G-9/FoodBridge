import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialDonations } from "../data/donations";
import { STORAGE_KEYS } from "../utils/storage";

export default function FoodDetails({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donations] = useLocalStorage(STORAGE_KEYS.donations, initialDonations);
  const [requests, setRequests] = useLocalStorage(STORAGE_KEYS.requests, []);
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

  const isClaimed = donation.status === "Claimed";

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
      isClaimed ||
      currentRequest?.status === "Requested" ||
      currentRequest?.status === "Accepted"
    )
      return;

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
          <div className="details-visual">
            <span>{donation.accent}</span>
            <p>{donation.category}</p>
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
                <strong>{donation.pickupDeadline}</strong>
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
            {session?.role === "provider" &&
            session.id === donation.providerId ? (
              <div className="info-box">
                This is your listing. Open your dashboard to review NGO
                requests.
              </div>
            ) : currentRequest?.status === "Accepted" ? (
              <div className="success-box">
                ✓ Your request was accepted by the provider.
              </div>
            ) : currentRequest?.status === "Requested" ? (
              <div className="success-box">
                ✓ Your request is recorded and waiting for the provider.
              </div>
            ) : isClaimed ? (
              <div className="info-box">
                This donation has already been claimed by another NGO.
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
