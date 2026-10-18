import React from "react";
import {useEffect,useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialDonations } from "../data/donations";
import { STORAGE_KEYS } from "../utils/storage";
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
  const{session}=useSessionContext();
  const dispatch = useDispatch();
const donations = useSelector(
  (state) => state.donations.items
);
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
          })
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
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
    () => requests.filter((request) => myDonationIds.has(request.donationId)),
    [requests, myDonationIds],
  );
  
const newRequestCount = incomingRequests.filter((request) => {
  if (request.status !== "Requested") return false;

  const donation = myDonations.find(
    (item) => item.id === request.donationId
  );

  return donation && donation.status === "Available";
}).length;

  const activeCount = useMemo(
    () =>
      myDonations.filter((donation) => donation.status === "Available").length,
    [myDonations],
  );
  const claimedCount = useMemo(
  () => myDonations.filter((donation) => donation.status === "Claimed").length,
  [myDonations],
);

const pickedUpCount = useMemo(
  () => myDonations.filter((donation) => donation.status === "Picked Up").length,
  [myDonations],
);

const expiredCount = useMemo(
  () => myDonations.filter((donation) => donation.status === "Expired").length,
  [myDonations],
);
  const handleChange = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
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
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Image upload failed."
    );
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

  if (!imageFile && editingId === null) {
  setFormError("Please upload a photo of the food donation.");
  return;
}

  setFormError("");
  setMessage("");
  setUploading(true);

 try {
  const existingDonation = donations.find(
    (d) => d.id === editingId
  );

  const imageUrl = imageFile
    ? await uploadImage(imageFile)
    : existingDonation?.imageUrl || "";

  const newDonation = {
    ...form,
    id: editingId ?? Date.now(),
    provider: session.name,
    providerId: session.id,
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
  setMessage("Donation published successfully. It is now visible to NGOs.");
}


    setForm(emptyForm);
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
      error.message || "Could not upload the photo. Please try again."
    );
  } finally {
    setUploading(false);
  }
};

  const updateRequest = (requestId, status) => {
    const target = requests.find((request) => request.id === requestId);
    if (!target) return;

    setRequests((current) =>
      current.map((request) => {
        if (request.id === requestId) return { ...request, status };
        if (
          status === "Accepted" &&
          request.donationId === target.donationId &&
          request.status === "Requested"
        ) {
          return { ...request, status: "Closed" };
        }
        return request;
      }),
    );

    if (status === "Accepted") {
      dispatch(
    updateDonation({
      id: target.donationId,
      status: "Claimed",
    })
  );
    }
  };
  const markAsPickedUp = (donationId) => {
  dispatch(
    updateDonation({
      id: donationId,
      status: "Picked Up",
    })
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

  <div className="notification-wrapper">
    <button
      type="button"
      className="notification-button"
      aria-label={`${newRequestCount} pending NGO requests`}
      onClick={() => setNotificationsOpen((open) => !open)}
    >
      <span className="notification-icon">➤</span>

      {newRequestCount > 0 && (
        <span className="notification-count">
          {newRequestCount > 99 ? "99+" : newRequestCount}
        </span>
      )}
</button>

    {notificationsOpen && (
      <div className="notification-dropdown">
        <h3>NGO Requests</h3>

        
{(() => {
  const activeRequests = incomingRequests.filter((request) => {
    if (request.status !== "Requested") return false;

    const donation = myDonations.find(
      (item) => item.id === request.donationId
    );

    return donation && donation.status !== "Expired";
  });

  return activeRequests.length === 0 ? (
    <p>No new requests yet.</p>
  ) : (
    activeRequests.map((request) => {
      const donation = myDonations.find(
        (item) => item.id === request.donationId
      );

      return (
        <div className="notification-item" key={request.id}>
          <strong>New food request</strong>
          <p>
            {request.ngoName || "An NGO"} requested{" "}
            {donation?.foodName || "your donation"}.
          </p>
        </div>
      );
    })
  );
})()}
      </div>
    )}
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
              <label className="form-field">
                <span>Pickup location *</span>
                <input
                  required
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Sector 18"
                />
              </label>
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
          pickupDeadline: donation.pickupDeadline || "",
          description: donation.description || "",
        });
        setExistingImageUrl(donation.imageUrl || "");
        setImageFile(null);
        setImagePreview("");
        setEditingId(donation.id);
        setMessage("Editing your donation. Update the details on the left.");
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
          `Delete "${donation.foodName}"? This cannot be undone.`
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
              <p className="eyebrow">INCOMING REQUESTS</p>
              <h2>NGOs requesting your food</h2>
            </div>
            <span className="request-count">
            {newRequestCount}
          </span>
          </div>
         {newRequestCount === 0 ?  (
            <div className="empty-inline">
              <span>📭</span>
              <div>
                <strong>No NGO requests yet.</strong>
                <p>
                  Once an NGO requests one of your listings, it will appear here
                  — and only here.
                </p>
              </div>
            </div>
          ) : (
            <div className="request-list">
             {incomingRequests
  .filter((request) => {
    const donation = myDonations.find(
      (item) => item.id === request.donationId
    );

    return (
      donation &&
      donation.status !== "Expired" &&
      donation.status !== "Picked Up" &&
      request.status === "Requested"
    );
  })
  .map((request) => (<div
        className="request-item request-item-detailed"
        key={request.id}
      >
        <div>
          <strong>{request.ngoName}</strong>
          <small>
            Requested: {request.donationName} · {request.providerName}
          </small>
        </div>

        <div className="request-actions">
          <span
            className={`status-pill status-${request.status.toLowerCase()}`}
          >
            {request.status}
          </span>

          <button
            type="button"
            className="small-action accept"
            onClick={() => updateRequest(request.id, "Accepted")}
          >
            Accept
          </button>

          <button
            type="button"
            className="small-action decline"
            onClick={() => updateRequest(request.id, "Declined")}
          >
            Decline
          </button>
        </div>
      </div>
    ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
