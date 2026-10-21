
import React, { useState } from "react";
import "./RestaurantSearch.css";

const STORAGE_KEY = "foodbridge-registered-restaurants";

const restaurants = [
  {
    id: "R001",
    name: "Green Leaf Bakery",
    location: "Rajpura, Punjab",
  },
  {
    id: "R002",
    name: "Green Leaf Bakery",
    location: "Patiala, Punjab",
  },
  {
    id: "R003",
    name: "Food Corner",
    location: "Rajpura, Punjab",
  },
  {
    id: "R004",
    name: "Sunrise Restaurant",
    location: "Chandigarh",
  },
];

function getSavedRestaurants() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

 function RestaurantSearch({
  mode,
  onContinue,
  onRegisterNew,
  onProviderLogin,
}) {
  const [search, setSearch] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRegisterMessage, setShowRegisterMessage] = useState(false);
  const [registeredRestaurants, setRegisteredRestaurants] =
    useState(getSavedRestaurants);
const [password, setPassword] = useState("");
const [loginError, setLoginError] = useState("");
  const allRestaurants = [...restaurants, ...registeredRestaurants];

  const filteredRestaurants = allRestaurants.filter((restaurant) => {
    const searchText = search.trim().toLowerCase();

    return (
      restaurant.name.toLowerCase().includes(searchText) ||
      restaurant.location.toLowerCase().includes(searchText)
    );
  });

  function handleSearch(value) {
    setSearch(value);
    setSelectedRestaurant(null);
    setShowRegisterMessage(false);
  }

  
function handleSelect(restaurant) {
  const hasCityInName = /\bpune\b/i.test(restaurant.name);
  const hasPuneLocation = /\bpune\b/i.test(restaurant.location);

  const updatedRestaurant =
    hasCityInName && !hasPuneLocation
      ? {
          ...restaurant,
          name: restaurant.name.replace(/\s*,?\s*pune$/i, "").trim(),
          location: "Pune, Maharashtra",
        }
      : restaurant;

  if (updatedRestaurant !== restaurant) {
    const updatedRestaurants = registeredRestaurants.map((item) =>
      item.id === restaurant.id ? updatedRestaurant : item
    );

    setRegisteredRestaurants(updatedRestaurants);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedRestaurants)
    );
  }

  setSelectedRestaurant(updatedRestaurant);
  setSearch(
    `${updatedRestaurant.name} — ${updatedRestaurant.location}`
  );
  setShowRegisterMessage(false);
}

    
function handleRegisterNew() {
  const searchText = search.trim();

  if (!searchText) return;

  // Extract Pune from the end of the entered text.
  const isPune = /\s+pune$/i.test(searchText);

  const name = searchText
    .replace(/\s+pune$/i, "")
    .trim();

  if (!name) return;

  // Avoid registering a restaurant that already exists.
  const existing = allRestaurants.find(
    (restaurant) =>
      restaurant.name.toLowerCase() === name.toLowerCase() &&
      (
        !isPune ||
        restaurant.location.toLowerCase().includes("pune")
      )
  );

  if (existing) {
    setSelectedRestaurant(existing);
    setSearch(`${existing.name} — ${existing.location}`);
    setShowRegisterMessage(false);
    return;
  }

  const newRestaurant = {
    id: `R${Date.now()}`,
    name,
    location: isPune
      ? "Pune, Maharashtra"
      : "Location to be confirmed",
    verificationStatus: "pending",
  };

  const updatedRestaurants = [
    ...registeredRestaurants,
    newRestaurant,
  ];

  setRegisteredRestaurants(updatedRestaurants);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedRestaurants)
  );

  setSelectedRestaurant(newRestaurant);
  setSearch(`${newRestaurant.name} — ${newRestaurant.location}`);
  setShowRegisterMessage(true);

  onRegisterNew?.(newRestaurant.name);
}


  return (
    <div className="restaurant-search-page">
      <div className="restaurant-search-card">
        <p className="brand-label">FOODBRIDGE</p>

        <h2>Find your restaurant</h2>

        <p className="search-description">
          Search by restaurant name or branch location
          to find your business.
        </p>

        <label htmlFor="restaurant-search">
          Restaurant name or location
        </label>

        <input
          id="restaurant-search"
          type="text"
          placeholder="e.g. Green Leaf Bakery, Rajpura"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          autoComplete="off"
        />
      {mode === "login" && (
  <>
    <label htmlFor="restaurant-password">
      Password
    </label>

    <input
      id="restaurant-password"
      type="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        setLoginError("");
      }}
      autoComplete="current-password"
    />

    {loginError && (
      <p role="alert" className="login-error">
        {loginError}
      </p>
    )}
  </>
)}
        {search.trim() !== "" && !selectedRestaurant && (
          <div className="restaurant-results">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((restaurant) => (
                <button
                  type="button"
                  key={restaurant.id}
                  className="restaurant-option"
                  onClick={() => handleSelect(restaurant)}
                >
                  <span className="restaurant-name">
                    {restaurant.name}
                  </span>

                  <span className="restaurant-location">
                    {restaurant.location}
                  </span>
                </button>
              ))
            ) : (
              <p className="no-results">
                Restaurant not found. You can register it below.
              </p>
            )}
          </div>
        )}

        {selectedRestaurant && (
          <div className="selected-restaurant">
            <p>Selected restaurant branch</p>
            <strong>{selectedRestaurant.name}</strong>
            <span>{selectedRestaurant.location}</span>
          </div>
        )}

        {showRegisterMessage && (
          <p className="registration-notice" role="status">
            Restaurant saved in the demo directory.
            Its location and business details still need confirmation.
            This does not mean the restaurant is verified.
          </p>
        )}

        <button
  type="button"
  className="continue-button"
  disabled={
    !selectedRestaurant ||
    (mode === "login" && !password.trim())
  }
  onClick={() => {
    if (mode === "login") {
      onProviderLogin?.(selectedRestaurant, password);
    } else {
      onContinue?.(selectedRestaurant);
    }
  }}
>
  Continue
</button>

        <div className="register-prompt">
          <span>Can't find your restaurant?</span>

          <button
            type="button"
            className="register-link"
            onClick={handleRegisterNew}
          >
            Register a new restaurant
          </button>
        </div>

        <p className="verification-note">
          Selecting or registering a restaurant does not verify
          its identity. New providers must complete verification.
        </p>
      </div>
    </div>
  );
}

export default RestaurantSearch;
