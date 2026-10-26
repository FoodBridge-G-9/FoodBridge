import React, { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import FoodCard from "../components/FoodCard";
import DeadlineBadge from "../components/DeadlineBadge";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSessionContext } from "../context/SessionContext";
import { STORAGE_KEYS } from "../utils/storage";
import { getFoodImage } from "../utils/foodImages";
import { formatDeadline, isDeadlinePassed } from "../utils/donationUtils";
import { updateDonation } from "../features/donations/donationsSlice";

export default function FoodDetails() {
  const { session } = useSessionContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const donations = useSelector((state) => state.donations.items);
  const [requests, setRequests] = useLocalStorage(STORAGE_KEYS.requests, []);

  const donation = donations.find((item) => String(item.id) === String(id));

  useEffect(() => {
    if (
      donation?.status === "Available" &&
      isDeadlinePassed(donation.pickupDeadline)
    ) {
      dispatch(
        updateDonation({
          id: donation.id,
          status: "Expired",
        }),
      );
    }
  }, [donation, dispatch]);

  const currentRequest = useMemo(() => {
    if (session?.role !== "ngo" || !donation) return null;

    return (
      requests.find(
        (request) =>
          String(request.donationId) === String(donation.id) &&
          String(request.ngoId) === String(session.id),
      ) || null
    );
  }, [requests, session, donation]);

  const providerRequestCount = useMemo(
    () =>
      requests.filter(
        (request) => String(request.donationId) === String(donation?.id),
      ).length,
    [requests, donation?.id],
  );

  const moreFromProvider = useMemo(() => {
    if (!donation) return [];

    return donations
      .filter(
        (item) =>
          String(item.providerId) === String(donation.providerId) &&
          String(item.id) !== String(donation.id),
      )
      .slice(0, 3);
  }, [donations, donation]);

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

  const expired =
    donation.status === "Expired" || isDeadlinePassed(donation.pickupDeadline);
  const isUnavailable =
  expired ||
  ["Claimed", "Picked Up"].includes(donation.status) ||
  currentRequest?.status === "Accepted";
  const displayStatus = expired
  ? "Expired"
  : donation.status === "Picked Up"
    ? "Picked Up"
    : donation.status === "Claimed" ||
        currentRequest?.status === "Accepted"
      ? "Claimed"
      : "Available";


  const isOwnListing =
    session?.role === "provider" &&
    String(session.id) === String(donation.providerId);

  const canRequest =
    session?.role === "ngo" &&
    donation.status === "Available" &&
    !expired &&
    !["Requested", "Accepted"].includes(currentRequest?.status);

  const handleRequest = () => {
    if (!session) {
      navigate("/login", {
        state: { from: `/food/${donation.id}` },
      });
      return;
    }

    if (session.role !== "ngo") {
      navigate("/ngo/dashboard");
      return;
    }

    if (!canRequest) return;

    setRequests((current) => {
      const existing = current.find(
        (request) =>
          String(request.donationId) === String(donation.id) &&
          String(request.ngoId) === String(session.id),
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

        <div
          className={`details-layout ${
            isUnavailable ? "food-details-disabled" : ""
          }`}
        >
          <div className="food-details-image">
          <img
            src={getFoodImage(donation)}
            alt={`${donation.foodName || donation.category} donation`}
          />
        </div>

          <div className="details-content">
            <div className="details-title-row">
  <span className="tag">
    {donation.foodType || donation.category}
  </span>

  {displayStatus === "Available" && (
    <DeadlineBadge deadline={donation.pickupDeadline} />
  )}
</div>

{displayStatus !== "Available" && (
  <div
    className={`food-details-status status-${displayStatus
      .toLowerCase()
      .replace(/\s+/g, "-")}`}
  >
    <span className="food-details-status-dot" />
    <div>
      <strong>{displayStatus}</strong>
      <p>
        {displayStatus === "Claimed"
          ? "This food has been reserved by an NGO."
          : displayStatus === "Picked Up"
            ? "This food has been collected successfully."
            : "The pickup deadline has passed."}
      </p>
    </div>
  </div>
)}

            <h1>{donation.foodName}</h1>

            <p className="details-provider">
              Provided by <strong>{donation.provider}</strong>
            </p>

            <p className="details-description">
              {donation.description ||
                "The provider has not added a description."}
            </p>

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
                <strong>{formatDeadline(donation.pickupDeadline)}</strong>
              </div>
            </div>

            <div className="details-callout">
              <strong>Request activity</strong>
              <span>
                {providerRequestCount} request
                {providerRequestCount === 1 ? "" : "s"} have been made for this
                listing. A request is not confirmed until the provider accepts
                it.
              </span>
            </div>

            {expired ? (
              <div className="info-box" role="status">
                ⏰ This pickup window has expired. Please explore other
                available donations.
              </div>
            ) : donation.status === "Picked Up" ? (
            <div className="success-box" role="status">
              ✓ This donation has been picked up.
            </div>
          ) : donation.status === "Claimed" ? (
            <div className="success-box" role="status">
              ✓ This donation has been claimed by an NGO.
            </div>
          ) : isOwnListing ? (
            <div className="info-box">
              This is your listing. Open your provider dashboard to review NGO
              requests.
            </div>
          ) : currentRequest?.status === "Accepted" ? (
            <div className="success-box" role="status">
              ✓ Your NGO's request was accepted. Coordinate with the provider
              and collect the food before the deadline.
            </div>
            ) : currentRequest?.status === "Requested" ? (
              <div className="success-box" role="status">
                ✓ Your request has been sent and is waiting for the provider's
                response.
              </div>
            ) : currentRequest?.status === "Declined" ? (
              <div className="info-box" role="status">
                The provider declined your previous request. If the listing is
                still available, you can submit a new request.
              </div>
            ) : donation.status === "Claimed" ||
              donation.status === "Picked Up" ? (
              <div className="info-box">
                This donation has already been claimed or picked up.
              </div>
            ) : session?.role === "provider" ? (
              <div className="info-box">
                Sign in with an NGO account to request this donation.
              </div>
            ) : (
              <button
                className="button button-primary button-large"
                type="button"
                onClick={handleRequest}
                disabled={session?.role === "ngo" && !canRequest}
              >
                {session
                  ? "Request this donation"
                  : "Log in to request this donation"}
              </button>
            )}
          </div>
        </div>

        {moreFromProvider.length > 0 && (
          <>
            <div className="section-heading-row dashboard-list-heading">
              <div>
                <p className="eyebrow">MORE FROM THIS PROVIDER</p>
                <h2>Other listings by {donation.provider}</h2>
              </div>
            </div>

            <div className="food-grid">
              {moreFromProvider.map((item) => (
                <FoodCard donation={item} key={item.id} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
