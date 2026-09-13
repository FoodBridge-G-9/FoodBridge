import React from "react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialDonations } from "../data/donations";
import { STORAGE_KEYS } from "../utils/storage";

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

export default function ProviderDashboard({ session }) {
  const [donations, setDonations] = useLocalStorage(
    STORAGE_KEYS.donations,
    initialDonations,
  );
  const [requests, setRequests] = useLocalStorage(STORAGE_KEYS.requests, []);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
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
  const activeCount = useMemo(
    () =>
      myDonations.filter((donation) => donation.status === "Available").length,
    [myDonations],
  );

  const handleChange = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const handleSubmit = (event) => {
    event.preventDefault();

    const quantity = Number(form.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setFormError("Quantity must be a whole number greater than 0.");
      return;
    }

    setFormError("");
    const newDonation = {
      ...form,
      id: Date.now(),
      provider: session.name,
      providerId: session.id,
      quantity,
      status: "Available",
      accent: "🍲",
    };
    setDonations((current) => [newDonation, ...current]);
    setForm(emptyForm);
    setMessage("Donation published successfully. It is now visible to NGOs.");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      setDonations((current) =>
        current.map((donation) =>
          donation.id === target.donationId
            ? { ...donation, status: "Claimed" }
            : donation,
        ),
      );
    }
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
                  name="pickupDeadline"
                  value={form.pickupDeadline}
                  onChange={handleChange}
                  placeholder="e.g. Today, 10:30 PM"
                />
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
            <button className="button button-primary" type="submit">
              Publish donation →
            </button>
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
                {myDonations.slice(0, 5).map((donation) => (
                  <Link
                    to={`/food/${donation.id}`}
                    className="mini-list-item"
                    key={donation.id}
                  >
                    <span className="mini-list-icon">{donation.accent}</span>
                    <span>
                      <strong>{donation.foodName}</strong>
                      <small>
                        {donation.quantity} {donation.unit} ·{" "}
                        {donation.location}
                      </small>
                    </span>
                    <span>→</span>
                  </Link>
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
            <span className="request-count">{incomingRequests.length}</span>
          </div>
          {incomingRequests.length === 0 ? (
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
              {incomingRequests.map((request) => (
                <div
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
                    {request.status === "Requested" && (
                      <>
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
                      </>
                    )}
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
