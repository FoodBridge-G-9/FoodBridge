import React, { useEffect, useMemo, useState } from "react";
import FoodCard from "../components/FoodCard";
import SectionHeading from "../components/SectionHeading";
import { useSelector } from "react-redux";
import { parseDeadline } from "../utils/donationUtils";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSessionContext } from "../context/SessionContext";
import { STORAGE_KEYS } from "../utils/storage";
import {
  getProviderRatingSummary,
  getFairProviderScore,
} from "../utils/providerRatings";

const SORT_OPTIONS = [
  { value: "urgent", label: "Pickup deadline: soonest" },
  { value: "newest", label: "Newest listings" },
  { value: "quantity-desc", label: "Most quantity" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "rating-desc", label: "Provider rating: highest first" },
];

export default function FoodList() {
  const donations = useSelector((state) => state.donations.items);
  const { session } = useSessionContext();

  const [reviews] = useLocalStorage(STORAGE_KEYS.reviews, []);
  const [requests] = useLocalStorage(STORAGE_KEYS.requests, []);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [foodType, setFoodType] = useState("All");
  const [location, setLocation] = useState("All");
  const [sortBy, setSortBy] = useState("urgent");
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const availableDonations = useMemo(
    () =>
      donations.filter((donation) => {
        const deadline = parseDeadline(donation.pickupDeadline);

        return (
          !["Expired", "Claimed", "Picked Up"].includes(donation.status) &&
          (deadline === null || deadline > now)
        );
      }),
    [donations, now],
  );

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        availableDonations.map((item) => item.category).filter(Boolean),
      ),
    ],
    [availableDonations],
  );

  const locations = useMemo(
    () => [
      "All",
      ...new Set(
        availableDonations.map((item) => item.location).filter(Boolean),
      ),
    ],
    [availableDonations],
  );

  const filteredDonations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const matches = availableDonations.filter((donation) => {
      const searchableText = [
        donation.foodName,
        donation.provider,
        donation.location,
        donation.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      const matchesCategory =
        category === "All" || donation.category === category;

      const matchesType = foodType === "All" || donation.foodType === foodType;

      const matchesLocation =
        location === "All" || donation.location === location;

      const deadline = parseDeadline(donation.pickupDeadline);
      const isUrgent = deadline !== null && deadline - now <= 60 * 60 * 1000;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesLocation &&
        (!showUrgentOnly || isUrgent)
      );
    });

    const sorted = [...matches];

    if (sortBy === "urgent") {
      sorted.sort(
        (a, b) =>
          (parseDeadline(a.pickupDeadline) ?? Infinity) -
          (parseDeadline(b.pickupDeadline) ?? Infinity),
      );
    } else if (sortBy === "quantity-desc") {
      sorted.sort((a, b) => Number(b.quantity) - Number(a.quantity));
    } else if (sortBy === "name-asc") {
      sorted.sort((a, b) => (a.foodName || "").localeCompare(b.foodName || ""));
    } else if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
    } else if (sortBy === "rating-desc") {
      sorted.sort((a, b) => {
        const ratingA = getProviderRatingSummary(reviews, a.providerId);
        const ratingB = getProviderRatingSummary(reviews, b.providerId);

        if (!ratingA.count && ratingB.count) return 1;
        if (!ratingB.count && ratingA.count) return -1;

        return (
          getFairProviderScore(reviews, b.providerId) -
            getFairProviderScore(reviews, a.providerId) ||
          ratingB.count - ratingA.count
        );
      });
    }

    return sorted;
  }, [
    availableDonations,
    search,
    category,
    foodType,
    location,
    sortBy,
    showUrgentOnly,
    now,
    reviews,
  ]);

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setFoodType("All");
    setLocation("All");
    setSortBy("urgent");
    setShowUrgentOnly(false);
  };

  const urgentCount = availableDonations.filter((item) => {
    const deadline = parseDeadline(item.pickupDeadline);
    return deadline !== null && deadline - now <= 60 * 60 * 1000;
  }).length;

  return (
    <div>
      <section className="page-hero section-tinted">
        <div className="container">
          <p className="eyebrow">SURPLUS FOOD, READY TO BE RESCUED</p>
          <h1>Find food before the pickup window closes.</h1>
          <p>
            Browse current listings, compare quantities, and prioritize
            donations that need collection soon.
          </p>

          <div className="listing-summary-pills">
            <span>{availableDonations.length} available listings</span>
            <span>{urgentCount} urgent within 1 hour</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="search-panel">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search food, provider, location or details"
                aria-label="Search food, provider, location or details"
              />
            </label>

            <label className="filter-field">
              <span className="filter-field-label">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All Categories" : item}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span className="filter-field-label">Location</span>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              >
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All Locations" : item}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-field">
              <span className="filter-field-label">Food type</span>
              <select
                value={foodType}
                onChange={(event) => setFoodType(event.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </label>

            <label className="filter-field">
              <span className="filter-field-label">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="urgent-only-control">
              <input
                type="checkbox"
                checked={showUrgentOnly}
                onChange={(event) => setShowUrgentOnly(event.target.checked)}
              />
              <span>Urgent pickups only</span>
            </label>
          </div>

          <div className="section-heading-row list-heading-row">
            <SectionHeading
              title={`${filteredDonations.length} donation${
                filteredDonations.length === 1 ? "" : "s"
              } found`}
              description="Listings are sorted by pickup urgency by default."
            />

            <button
              className="button button-secondary reset-filters-button"
              type="button"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          </div>

          {filteredDonations.length > 0 ? (
            <div className="food-grid">
              {filteredDonations.map((donation) => {
                const myRequest =
                  session?.role === "ngo"
                    ? requests.find(
                        (request) =>
                          String(request.donationId) === String(donation.id) &&
                          String(request.ngoId) === String(session.id),
                      )
                    : null;

                const alreadyClaimed = ["Claimed", "Picked Up"].includes(
                  donation.status,
                );

                const requestPending = myRequest?.status === "Requested";
                const requestAccepted = myRequest?.status === "Accepted";

                const disabled =
                  alreadyClaimed ||
                  requestPending ||
                  requestAccepted ||
                  donation.status === "Expired";

                return (
                  <FoodCard
                    donation={donation}
                    key={donation.id}
                    disabled={disabled}
                    statusLabel={
                      alreadyClaimed
                        ? donation.status === "Picked Up"
                          ? "Picked up"
                          : "Claimed"
                        : requestPending
                          ? "Request Pending"
                          : requestAccepted
                            ? "Request Accepted"
                            : undefined
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div>🔎</div>
              <h3>No available donations match your filters.</h3>
              <p>
                Try a different keyword or reset your filters. New listings may
                appear when providers publish donations.
              </p>
              <button
                className="button button-primary"
                type="button"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
