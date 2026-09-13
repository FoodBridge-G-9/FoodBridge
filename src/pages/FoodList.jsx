import React from "react";
import { useMemo, useState } from "react";
import FoodCard from "../components/FoodCard";
import SectionHeading from "../components/SectionHeading";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialDonations } from "../data/donations";
import { STORAGE_KEYS } from "../utils/storage";

const SORT_OPTIONS = [
  { value: "default", label: "Sort: Newest first" },
  { value: "quantity-desc", label: "Sort: Most quantity" },
  { value: "name-asc", label: "Sort: Name (A-Z)" },
];

export default function FoodList() {
  const [savedDonations] = useLocalStorage(
    STORAGE_KEYS.donations,
    initialDonations,
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [foodType, setFoodType] = useState("All");
  const [location, setLocation] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const categories = useMemo(
    () => ["All", ...new Set(savedDonations.map((item) => item.category))],
    [savedDonations],
  );

  const locations = useMemo(
    () => ["All", ...new Set(savedDonations.map((item) => item.location))],
    [savedDonations],
  );

  const filteredDonations = useMemo(() => {
    const matches = savedDonations.filter((donation) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        `${donation.foodName} ${donation.provider} ${donation.location}`
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesCategory =
        category === "All" || donation.category === category;
      const matchesType = foodType === "All" || donation.foodType === foodType;
      const matchesLocation =
        location === "All" || donation.location === location;
      return matchesSearch && matchesCategory && matchesType && matchesLocation;
    });

    const sorted = [...matches];
    if (sortBy === "quantity-desc") {
      sorted.sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.foodName.localeCompare(b.foodName));
    }
    return sorted;
  }, [savedDonations, search, category, foodType, location, sortBy]);

  return (
    <div>
      <section className="page-hero section-tinted">
        <div className="container">
          <p className="eyebrow">FOOD AVAILABLE NOW</p>
          <h1>Find surplus food near you.</h1>
          <p>
            Browse current listings from restaurants, bakeries and event
            organizers.
          </p>
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
                placeholder="Search food, provider or location"
                aria-label="Search food, provider or location"
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
          </div>

          <div className="section-heading-row list-heading-row">
            <SectionHeading
              title={`${filteredDonations.length} donation${filteredDonations.length === 1 ? "" : "s"} found`}
              description="Choose a listing to view its full details."
            />
          </div>

          {filteredDonations.length > 0 ? (
            <div className="food-grid">
              {filteredDonations.map((donation) => (
                <FoodCard donation={donation} key={donation.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div>🔎</div>
              <h3>No donations match your search.</h3>
              <p>Try a different keyword or reset your filters.</p>
              <button
                className="button button-outline"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setFoodType("All");
                  setLocation("All");
                  setSortBy("default");
                }}
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
