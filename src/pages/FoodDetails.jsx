// import React from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import FoodCard from "../components/FoodCard";
// // import { useLocalStorage } from "../hooks/useLocalStorage";
// // import { initialDonations } from "../data/donations";
// import { useSelector } from "react-redux";
// import { useLocalStorage } from "../hooks/useLocalStorage";
// import { STORAGE_KEYS } from "../utils/storage";
// import { useSessionContext } from "../context/SessionContext";
// import { getFoodImage } from "../utils/foodImages";
// export default function FoodDetails() {
//   const{session}=useSessionContext();
//   const { id } = useParams();
//   const navigate = useNavigate();
//  const donations = useSelector((state) => state.donations.items);
// const [requests, setRequests] = useLocalStorage(
//   STORAGE_KEYS.requests,
//   []
// );
//   const donation = donations.find((item) => String(item.id) === String(id));

//   if (!donation) {
//     return (
//       <section className="section">
//         <div className="container empty-state">
//           <div>🍽️</div>
//           <h1>Donation not found</h1>
//           <p>The listing may have been removed or the link is incorrect.</p>
//           <Link className="button button-primary" to="/food">
//             Back to available food
//           </Link>
//         </div>
//       </section>
//     );
//   }

//   const currentRequest =
//     session?.role === "ngo"
//       ? requests.find(
//           (request) =>
//             request.donationId === donation.id && request.ngoId === session.id,
//         )
//       : null;

//   const providerRequestCount = requests.filter(
//     (request) => request.donationId === donation.id,
//   ).length;

//   const moreFromProvider = donations
//     .filter(
//       (item) =>
//         item.providerId === donation.providerId && item.id !== donation.id,
//     )
//     .slice(0, 3);

//   const handleRequest = () => {
//     if (!session) {
//       navigate("/login", { state: { from: `/food/${donation.id}` } });
//       return;
//     }

//     if (session.role !== "ngo") {
//       navigate("/ngo/dashboard");
//       return;
//     }

//     if (
//   donation.status !== "Available" ||
//   currentRequest?.status === "Requested" ||
//   currentRequest?.status === "Accepted"
// ) {
//   return;
// }

//     setRequests((current) => {
//       const existing = current.find(
//         (request) =>
//           request.donationId === donation.id && request.ngoId === session.id,
//       );
//       if (existing) {
//         return current.map((request) =>
//           request.id === existing.id
//             ? {
//                 ...request,
//                 status: "Requested",
//                 createdAt: new Date().toISOString(),
//               }
//             : request,
//         );
//       }
//       return [
//         ...current,
//         {
//           id: `${donation.id}-${session.id}-${Date.now()}`,
//           donationId: donation.id,
//           donationName: donation.foodName,
//           providerId: donation.providerId,
//           providerName: donation.provider,
//           ngoId: session.id,
//           ngoName: session.name,
//           createdAt: new Date().toISOString(),
//           status: "Requested",
//         },
//       ];
//     });
//   };

//   return (
//     <section className="section">
//       <div className="container">
//         <Link className="back-link" to="/food">
//           ← Back to available food
//         </Link>
//         <div className="details-layout">
//           <div className="food-details-image">
//           <img
//             src={getFoodImage(donation)}
//             alt={`${donation.foodName || donation.category} donation`}
//           />
//           <span className="food-image-label">
//             {donation.category || "Food Donation"}
//           </span>
//         </div>
//           <div className="details-content">
//             <span className="tag">{donation.foodType}</span>
//             <h1>{donation.foodName}</h1>
//             <p className="details-provider">
//               Provided by <strong>{donation.provider}</strong>
//             </p>
//             <p className="details-description">{donation.description}</p>
//             <div className="details-stats">
//               <div>
//                 <span>Quantity</span>
//                 <strong>
//                   {donation.quantity} {donation.unit}
//                 </strong>
//               </div>
//               <div>
//                 <span>Location</span>
//                 <strong>{donation.location}</strong>
//               </div>
//               <div>
//                 <span>Pickup deadline</span>
//                 <strong>
//                 {donation.pickupDeadline
//                   ? new Date(donation.pickupDeadline).toLocaleString("en-IN", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "numeric",
//                       minute: "2-digit",
//                       hour12: true,
//                     })
//                   : "Not specified"}
//               </strong>
//               </div>
//             </div>
//             <div className="details-callout">
//               <strong>Requests so far</strong>
//               <span>
//                 {providerRequestCount} NGO{" "}
//                 {providerRequestCount === 1
//                   ? "organization has"
//                   : "organizations have"}{" "}
//                 requested this donation.
//               </span>
//             </div>
//              {donation.status === "Expired" ? (
//                 <div className="info-box">
//                   ⏰ This donation has expired. The pickup deadline has passed,
//                   so it is no longer available for requests.Please explore other available donations.
//                   </div>
//              ) :
//             session?.role === "provider" &&
//               session.id === donation.providerId ? (
//                 <div className="info-box">
//                   This is your listing. Open your dashboard to review NGO
//                   requests.
//                 </div>
//               ) : currentRequest?.status === "Accepted" ? (
//                 <div className="success-box">
//                   ✓ Claimed by your NGO! The provider accepted your request.
//                   {donation.status === "Picked Up" && (
//                     <p>✓ This donation has been picked up.</p>
//                   )}
//                 </div>
//               )
//                 : currentRequest?.status === "Requested" ? (
//                 <div className="success-box">
//                   ✓ Your request is recorded and waiting for the provider.
//                 </div>
//                 ) : donation.status === "Claimed" ||
//                 donation.status === "Picked Up" ? (
//                 <div className="info-box">
//                   {donation.status === "Picked Up"
//                     ? "This donation has already been picked up."
//                     : "This donation has already been claimed by another NGO."}
//                 </div>
//               ) : donation.status !== "Available" ? (
//                 <div className="info-box">
//                   This donation is no longer available for requests.
//                 </div>
//               ) : (
//             <button
//               className="button button-primary button-large"
//               type="button"
//               onClick={handleRequest}
//             >
//               Request this donation
//             </button>
//           )}
//           </div>
//         </div>

//         {moreFromProvider.length > 0 && (
//           <div className="section-heading-row dashboard-list-heading">
//             <div>
//               <p className="eyebrow">MORE FROM THIS PROVIDER</p>
//               <h2>Other listings by {donation.provider}</h2>
//             </div>
//           </div>
//         )}
//         {moreFromProvider.length > 0 && (
//           <div className="food-grid">
//             {moreFromProvider.map((item) => (
//               <FoodCard donation={item} key={item.id} />
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

import React from "react";
import { useEffect, useMemo } from "react";
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
      dispatch(updateDonation({ id: donation.id, status: "Expired" }));
    }
  }, [donation, dispatch]);

  const currentRequest = useMemo(() => {
    if (session?.role !== "ngo" || !donation) return null;
    return (
      requests.find(
        (request) =>
          String(request.donationId) === String(donation.id) &&
          request.ngoId === session.id,
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
          item.providerId === donation.providerId &&
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
  const isOwnListing =
    session?.role === "provider" && session.id === donation.providerId;
  const canRequest =
    session?.role === "ngo" &&
    donation.status === "Available" &&
    !expired &&
    !["Requested", "Accepted"].includes(currentRequest?.status);

  const handleRequest = () => {
    if (!session) {
      navigate("/login", { state: { from: `/food/${donation.id}` } });
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
          request.ngoId === session.id,
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
            <span className="food-image-label">
              {donation.category || "Food Donation"}
            </span>
          </div>
          <div className="details-content">
            <div className="details-title-row">
              <span className="tag">{donation.foodType}</span>
              <DeadlineBadge deadline={donation.pickupDeadline} />
            </div>
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
            ) : isOwnListing ? (
              <div className="info-box">
                This is your listing. Open your provider dashboard to review NGO
                requests.
              </div>
            ) : currentRequest?.status === "Accepted" ? (
              <div className="success-box" role="status">
                ✓ Your NGO's request was accepted.
                {donation.status === "Picked Up"
                  ? " Pickup is complete — thank you for rescuing this food!"
                  : " Coordinate with the provider and collect the food before the deadline."}
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
