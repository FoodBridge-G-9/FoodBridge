
import React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
// import PickupLocationPicker from "../components/PickupLocationPicker";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storage";
import {
  getRequestDisplayStatus,
  isDeadlinePassed,
  toLocalDateTimeInput,
} from "../utils/donationUtils";
import { useSessionContext } from "../context/SessionContext";
import { useDispatch, useSelector } from "react-redux";
import {
  addDonation,
  updateDonation,
  removeDonation,
} from "../features/donations/donationsSlice";
const emptyForm = {
  foodName: "",
  category: "Cooked Meals",
  quantity: "",
  unit: "portions",
  foodType: "Vegetarian",
  location: "",
  pickupDeadline: "",
  description: "",
};

export default function ProviderDashboard() {
  const { session } = useSessionContext();
  const dispatch = useDispatch();
  const donations = useSelector((state) => state.donations.items);
  useEffect(() => {
    const checkExpiredDonations = () => {
      const now = Date.now();

      donations.forEach((donation) => {
        const deadline = new Date(donation.pickupDeadline).getTime();

        if (
          donation.status === "Available" &&
          Number.isFinite(deadline) &&
          deadline <= now
        ) {
          dispatch(
            updateDonation({
              id: donation.id,
              status: "Expired",
            }),
          );
        }
      });
    };

    checkExpiredDonations();

    const intervalId = setInterval(checkExpiredDonations, 30_000);

    return () => clearInterval(intervalId);
  }, [donations, dispatch]);
  const [requests, setRequests] = useLocalStorage(STORAGE_KEYS.requests, []);
  const [form, setForm] = useState(emptyForm);
  const [providerLocation, setProviderLocation] = useState(null);
const [locationMessage, setLocationMessage] = useState("");
const [locationLoading, setLocationLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [requestFilter, setRequestFilter] = useState("All");
  const imageInputRef = useRef(null);
  const formRef = useRef(null);

  const myDonations = useMemo(
    () => donations.filter((donation) => donation.providerId === session?.id),
    [donations, session?.id],
  );
  const myDonationIds = useMemo(
    () => new Set(myDonations.map((donation) => donation.id)),
    [myDonations],
  );
  const incomingRequests = useMemo(
    () =>
      requests
        .filter((request) => myDonationIds.has(request.donationId))
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        ),
    [requests, myDonationIds],
  );
  const donationById = useMemo(
    () =>
      new Map(myDonations.map((donation) => [String(donation.id), donation])),
    [myDonations],
  );
  const visibleIncomingRequests = useMemo(
    () =>
      incomingRequests
        .map((request) => ({
          ...request,
          donation: donationById.get(String(request.donationId)),
          displayStatus: getRequestDisplayStatus(
            request,
            donationById.get(String(request.donationId)),
          ),
        }))
        .filter(
          (request) =>
            requestFilter === "All" || request.displayStatus === requestFilter,
        ),
    [incomingRequests, donationById, requestFilter],
  );

  const newRequestCount = incomingRequests.filter((request) => {
    if (request.status !== "Requested") return false;

    const donation = myDonations.find((item) => item.id === request.donationId);

    return donation && donation.status === "Available";
  }).length;

  const activeCount = useMemo(
    () =>
      myDonations.filter((donation) => donation.status === "Available").length,
    [myDonations],
  );
  const claimedCount = useMemo(
    () =>
      myDonations.filter((donation) => donation.status === "Claimed").length,
    [myDonations],
  );

  const pickedUpCount = useMemo(
    () =>
      myDonations.filter((donation) => donation.status === "Picked Up").length,
    [myDonations],
  );

  const expiredCount = useMemo(
    () =>
      myDonations.filter((donation) => donation.status === "Expired").length,
    [myDonations],
  );
  const handleChange = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    
const handleShareLocation = () => {
  if (!navigator.geolocation) {
    setLocationMessage(
      "Location is not supported by this browser. Please enter your pickup location manually."
    );
    return;
  }

  setLocationLoading(true);
  setLocationMessage("");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        capturedAt: new Date().toISOString(),
      };

      setProviderLocation(coordinates);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates.latitude}&lon=${coordinates.longitude}`
        );

        if (!response.ok) {
          throw new Error("Could not find the address.");
        }

        const data = await response.json();

        const address =
          data.display_name ||
          `${coordinates.latitude}, ${coordinates.longitude}`;

        setForm((current) => ({
          ...current,
          location: address,
        }));

        setLocationMessage(
          "Location detected. You can edit the pickup address below."
        );
      } catch {
        setLocationMessage(
          "Coordinates captured, but the address could not be found. Please enter the pickup address manually."
        );
      } finally {
        setLocationLoading(false);
      }
    },
    (error) => {
      let message =
        "Could not get your location. Please enter the pickup location manually.";

      if (error.code === error.PERMISSION_DENIED) {
        message =
          "Location permission denied. Allow location access in browser settings or enter the address manually.";
      } else if (error.code === error.TIMEOUT) {
        message = "Location request timed out. Please try again.";
      }

      setLocationMessage(message);
      setLocationLoading(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    }
  );
};

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const uploadImage = async (file) => {
    const data = new FormData();

    data.append("file", file);
    data.append("upload_preset", "foodbridge_uploads");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/l2awiw6v/image/upload",
      {
        method: "POST",
        body: data,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Image upload failed.");
    }

    return result.secure_url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setFormError("Quantity must be a whole number greater than 0.");
      return;
    }

    if (!form.pickupDeadline || isDeadlinePassed(form.pickupDeadline)) {
      setFormError("Choose a pickup deadline in the future.");
      return;
    }

    if (!imageFile && editingId === null) {
      setFormError("Please upload a photo of the food donation.");
      return;
    }

    setFormError("");
    setMessage("");
    setUploading(true);

    try {
      const existingDonation = donations.find((d) => d.id === editingId);

      const imageUrl = imageFile
        ? await uploadImage(imageFile)
        : existingDonation?.imageUrl || "";

      const newDonation = {
        ...form,
        id: editingId ?? Date.now(),
        provider: session.name,
        providerId: session.id,
        coordinates:
        providerLocation ??
        existingDonation?.coordinates ??
        null,
        quantity,
        status: editingId
          ? existingDonation?.status || "Available"
          : "Available",
        imageUrl,
        accent: "🍲",
      };
      if (editingId !== null) {
        dispatch(updateDonation(newDonation));
        setMessage("Donation updated successfully!");
        setEditingId(null);
      } else {
        dispatch(addDonation(newDonation));
        setMessage(
          "Donation published successfully. It is now visible to NGOs.",
        );
      }

      setForm(emptyForm);
      setProviderLocation(null);
      setLocationMessage("");
      setImageFile(null);
      setImagePreview("");
      setExistingImageUrl("");

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (error) {
      setFormError(
        error.message || "Could not upload the photo. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const updateRequest = (requestId, status) => {
    const target = requests.find((request) => request.id === requestId);
    if (!target) return;

    const targetDonation = myDonations.find(
      (donation) => String(donation.id) === String(target.donationId),
    );
    if (
      status === "Accepted" &&
      (!targetDonation ||
        targetDonation.status !== "Available" ||
        isDeadlinePassed(targetDonation.pickupDeadline))
    ) {
      setMessage(
        "This donation is no longer available. The request cannot be accepted.",
      );
      if (targetDonation?.status === "Available") {
        dispatch(updateDonation({ id: targetDonation.id, status: "Expired" }));
      }
      return;
    }

    setRequests((current) =>
      current.map((request) => {
        if (request.id === requestId) return { ...request, status };
        if (
          status === "Accepted" &&
          String(request.donationId) === String(target.donationId) &&
          request.status === "Requested"
        ) {
          return { ...request, status: "Not selected" };
        }
        return request;
      }),
    );

    if (status === "Accepted") {
      dispatch(
        updateDonation({
          id: target.donationId,
          status: "Claimed",
        }),
      );
    }
  };
  const markAsPickedUp = (donationId) => {
    dispatch(
      updateDonation({
        id: donationId,
        status: "Picked Up",
      }),
    );

    setMessage("Donation marked as picked up successfully.");
  };

  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">PROVIDER DASHBOARD</p>
            <h1>Welcome, {session?.name || "Food Provider"}.</h1>
            <p>
              Your dashboard shows only your listings and the NGO requests
              received for them.
            </p>
          </div>

      
          <div className="dashboard-stat">
            <span>Active listings</span>
            <strong>{activeCount}</strong>
          </div>

          <div className="dashboard-stat">
            <span>Claimed listings</span>
            <strong>{claimedCount}</strong>
          </div>

          <div className="dashboard-stat">
            <span>Picked up</span>
            <strong>{pickedUpCount}</strong>
          </div>

          <div className="dashboard-stat">
            <span>Expired listings</span>
            <strong>{expiredCount}</strong>
          </div>
        </div>
        <div className="dashboard-grid">
          <form
            className="dashboard-panel"
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <div className="panel-heading">
              <div>
                <p className="eyebrow">NEW LISTING</p>
                <h2>Post surplus food</h2>
              </div>
            </div>
            {message && <div className="success-box">✓ {message}</div>}
            {formError && <div className="error-box">⚠ {formError}</div>}
            <div className="form-grid">
              <label className="form-field full">
                <span>Food name *</span>
                <input
                  required
                  name="foodName"
                  value={form.foodName}
                  onChange={handleChange}
                  placeholder="e.g. Veg sandwiches"
                />
              </label>
              <label className="form-field full">
                <span>Food photo *</span>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <small className="field-hint">
                  {editingId !== null
                    ? "Your current photo is shown below. Choose a new file only if you want to replace it."
                    : "Upload a clear photo of the food being donated. Maximum 5 MB."}
                </small>
                {(imagePreview || existingImageUrl) && (
                  <img
                    src={imagePreview || existingImageUrl}
                    alt="Food donation preview"
                    style={{
                      display: "block",
                      width: "100%",
                      maxWidth: "360px",
                      maxHeight: "260px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      marginTop: "12px",
                    }}
                  />
                )}
              </label>
              <label className="form-field">
                <span>Category *</span>
                <select
                  required
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>Cooked Meals</option>
                  <option>Bakery</option>
                  <option>Snacks</option>
                  <option>Produce</option>
                  <option>Event Food</option>
                </select>
              </label>
              <label className="form-field">
                <span>Food type *</span>
                <select
                  required
                  name="foodType"
                  value={form.foodType}
                  onChange={handleChange}
                >
                  <option>Vegetarian</option>
                  <option>Non-Vegetarian</option>
                </select>
              </label>
              <label className="form-field">
                <span>Quantity *</span>

                <input
                  required
                  min="1"
                  step="1"
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="40"
                />
              </label>
              <label className="form-field">
                <span>Unit *</span>
                <select
                  required
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                >
                  <option>portions</option>
                  <option>meal boxes</option>
                  <option>packs</option>
                  <option>items</option>
                  <option>cups</option>
                </select>
              </label>
              
                
<div className="form-field full pickup-location-field">
  <span>Pickup location *</span>

  <input
    required
    name="location"
    value={form.location}
    onChange={handleChange}
    placeholder="e.g. Sector 18, Rajpura"
  />

  <small className="field-hint">
    Enter the restaurant address or area where food can be collected.
  </small>

  
<div className="location-action-row">
  <button
    type="button"
    className="button button-secondary location-share-button"
    onClick={handleShareLocation}
    disabled={locationLoading}
  >
    {locationLoading
      ? "Getting location..."
      : providerLocation
        ? "Refresh My Location"
        : "Share My Location"}
  </button>
</div>

{providerLocation && (
  <div className="location-confirmation">
    <div className="location-confirmation-icon">
      <svg
        viewBox="0 0 24 24"
        width="25"
        height="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    </div>

    <div className="location-confirmation-copy">
      <strong>Location shared</strong>
      <span>
        Your pickup coordinates are ready to be attached to your donation.
      </span>
    </div>

    <span className="location-confirmation-check">✓</span>
  </div>
)}

{locationMessage && !providerLocation && (
  <div className="location-error-message" role="status" aria-live="polite">
    {locationMessage}
  </div>
)}

              </div>
              <label className="form-field">
                <span>Pickup deadline *</span>
                <input
                  required
                  type="datetime-local"
                  name="pickupDeadline"
                  value={form.pickupDeadline}
                  onChange={handleChange}
                />
                <small className="field-hint">
                  Select the pickup date and time.
                </small>
              </label>
              <label className="form-field full">
                <span>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Add any useful details about the food..."
                ></textarea>
              </label>
            </div>
            <button
              className="button button-primary"
              type="submit"
              disabled={uploading}
            >
              {uploading
                ? "Saving donation..."
                : editingId !== null
                  ? "Update donation →"
                  : "Publish donation →"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                  setImageFile(null);
                  setImagePreview("");
                  setExistingImageUrl("");
                  setFormError("");
                  setMessage("");
                  setProviderLocation(null);
                  setLocationMessage("");

                  if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                  }
                }}
              >
                Cancel editing
              </button>
            )}
          </form>

          <aside className="dashboard-panel dashboard-side">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">MY DONATIONS</p>
                <h2>Recent listings</h2>
              </div>
            </div>
            {myDonations.length === 0 ? (
              <div className="empty-inline">
                <span>🆕</span>
                <div>
                  <strong>No listings yet on this account.</strong>
                  <p>
                    You're signed in as <strong>{session?.name}</strong>. Post
                    your first donation on the left — or if you expected to see
                    existing listings, log out and sign back in using the exact
                    name you used before.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mini-list">
                {myDonations.slice(0, 10).map((donation) => (
                  <div className="mini-list-item" key={donation.id}>
                    <Link
                      to={`/food/${donation.id}`}
                      className="mini-list-link"
                    >
                      <span className="mini-list-icon">{donation.accent}</span>

                      <span>
                        <strong>{donation.foodName}</strong>
                        <small>
                          {donation.quantity} {donation.unit} ·{" "}
                          {donation.location}
                        </small>
                      </span>
                    </Link>

                    <span
                      className={`status-pill status-${donation.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {donation.status}
                    </span>

                    {donation.status === "Claimed" && (
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => markAsPickedUp(donation.id)}
                      >
                        Mark as Picked Up
                      </button>
                    )}
                    {donation.status === "Available" && (
                      <div className="donation-actions">
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => {
                            setForm({
                              foodName: donation.foodName || "",
                              category: donation.category || "Cooked Meals",
                              quantity: String(donation.quantity ?? ""),
                              unit: donation.unit || "portions",
                              foodType: donation.foodType || "Vegetarian",
                              location: donation.location || "",
                              pickupDeadline: toLocalDateTimeInput(
                                donation.pickupDeadline,
                              ),
                              description: donation.description || "",
                            });
                            setExistingImageUrl(donation.imageUrl || "");
                            setProviderLocation(donation.coordinates || null);
                            setLocationMessage("");
                            setImageFile(null);
                            setImagePreview("");
                            setEditingId(donation.id);
                            setMessage(
                              "Editing your donation. Update the details on the left.",
                            );
                            setFormError("");
                            formRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Delete "${donation.foodName}"? This cannot be undone.`,
                            );
                            if (confirmed) {
                              dispatch(removeDonation(donation.id));
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="dashboard-panel request-panel provider-requests-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">REQUEST LIFECYCLE</p>
              <h2>NGO requests for your food</h2>
              <p className="muted-text">
                Review pending requests and keep a history of accepted, declined
                and completed pickups.
              </p>
            </div>
            <span className="request-count">{newRequestCount} pending</span>
          </div>

          {incomingRequests.length > 0 && (
            <div
              className="status-filter-bar"
              aria-label="Filter provider requests"
            >
              {[
                "All",
                "Requested",
                "Accepted",
                "Completed",
                "Declined",
                "Not selected",
                "Cancelled",
                "Expired",
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`status-filter-btn ${requestFilter === option ? "active" : ""}`}
                  onClick={() => setRequestFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {incomingRequests.length === 0 ? (
            <div className="empty-inline">
              <span>📭</span>
              <div>
                <strong>No NGO requests yet.</strong>
                <p>
                  When an NGO requests one of your listings, the request and its
                  status will appear here.
                </p>
              </div>
            </div>
          ) : visibleIncomingRequests.length === 0 ? (
            <p className="muted-text">No requests match this status filter.</p>
          ) : (
            <div className="request-list">
              {visibleIncomingRequests.map((request) => {
                const canReview =
                  request.status === "Requested" &&
                  request.donation?.status === "Available" &&
                  !isDeadlinePassed(request.donation?.pickupDeadline);
                return (
                  <article
                    className="request-item request-item-detailed"
                    key={request.id}
                  >
                    <div className="request-item-copy">
                      <strong>{request.ngoName || "Community NGO"}</strong>
                      <small>
                        Requested:{" "}
                        {request.donationName ||
                          request.donation?.foodName ||
                          "Food donation"}
                      </small>
                      <small>
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString(
                              "en-IN",
                              { dateStyle: "medium", timeStyle: "short" },
                            )
                          : "Request date unavailable"}
                      </small>
                    </div>
                    <div className="request-item-status-actions">
                      <span
                        className={`status-pill status-${request.displayStatus.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {request.displayStatus}
                      </span>
                      {canReview && (
                        <>
                          <button
                            type="button"
                            className="small-action accept"
                            onClick={() =>
                              updateRequest(request.id, "Accepted")
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="small-action decline"
                            onClick={() =>
                              updateRequest(request.id, "Declined")
                            }
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {request.donation && (
                        <Link
                          className="text-link"
                          to={`/food/${request.donation.id}`}
                        >
                          View listing →
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
