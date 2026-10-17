
import React,{ useState } from "react";
import "./RestaurantSearch.css";

// Sample data for the FoodBridge demo.
// These entries are NOT government-verified businesses.
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

function RestaurantSearch({ onContinue, onRegisterNew }) {
  const [search, setSearch] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState(null);
  const [showRegisterMessage, setShowRegisterMessage] =
    useState(false);

  const filteredRestaurants = restaurants.filter((restaurant) => {
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
    setSelectedRestaurant(restaurant);
    setSearch(`${restaurant.name} — ${restaurant.location}`);
    setShowRegisterMessage(false);
  }

  function handleRegisterNew() {
    setShowRegisterMessage(true);

    if (onRegisterNew) {
      onRegisterNew(search.trim());
    }
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
                Restaurant not found. Please check the
                name or location.
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
            This restaurant is not in our demo directory.
            You can register it for admin verification.
            It will not be approved automatically.
          </p>
        )}

        <button
          type="button"
          className="continue-button"
          disabled={!selectedRestaurant}
          onClick={() => onContinue?.(selectedRestaurant)}
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
          Selecting a restaurant does not verify its
          identity. New providers must complete verification.
        </p>
      </div>
    </div>
  );
}

export default RestaurantSearch;
