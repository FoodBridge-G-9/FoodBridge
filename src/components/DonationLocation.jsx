
import React, { useState } from "react";

export default function DonationLocation({ donation }) {
  const [ngoCoordinates, setNgoCoordinates] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const coordinates = donation?.coordinates;
  const latitude = Number(coordinates?.latitude);
  const longitude = Number(coordinates?.longitude);

  const hasCoordinates =
    coordinates?.latitude != null &&
    coordinates?.longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  const getNGOLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Your browser does not support location access."
      );
      return;
    }

    setLoading(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNgoCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationMessage("Your location is ready.");
        setLoading(false);
      },
      (error) => {
        setLocationMessage(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Allow access in browser settings."
            : "Could not detect your location. Please try again."
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  if (!hasCoordinates) {
    return (
      <div className="donation-location-unavailable">
        <span>📍</span>
        <span>
          {donation?.location || "Pickup address not provided"}
        </span>
        <small>
          Map location is not available for this donation.
        </small>
      </div>
    );
  }

  // Include both endpoints when the NGO location is available.
  const bounds = ngoCoordinates
    ? {
        minLat:
          Math.min(latitude, ngoCoordinates.latitude) - 0.005,
        maxLat:
          Math.max(latitude, ngoCoordinates.latitude) + 0.005,
        minLon:
          Math.min(longitude, ngoCoordinates.longitude) - 0.005,
        maxLon:
          Math.max(longitude, ngoCoordinates.longitude) + 0.005,
      }
    : {
        minLat: latitude - 0.005,
        maxLat: latitude + 0.005,
        minLon: longitude - 0.008,
        maxLon: longitude + 0.008,
      };

  // OpenStreetMap preview: provider marker and, when available,
  // NGO marker. This preview does not draw the road route.
  const mapUrl =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${bounds.minLon}%2C${bounds.minLat}` +
    `%2C${bounds.maxLon}%2C${bounds.maxLat}` +
    `&layer=mapnik&marker=${latitude}%2C${longitude}`;

  
const directionsUrl = ngoCoordinates
  ? `https://www.google.com/maps/dir/?api=1` +
    `&origin=${ngoCoordinates.latitude},${ngoCoordinates.longitude}` +
    `&destination=${latitude},${longitude}` +
    `&travelmode=driving`
  : `https://www.google.com/maps/dir/?api=1` +
    `&destination=${latitude},${longitude}` +
    `&travelmode=driving`;

  const openOSMUrl =
    `https://www.openstreetmap.org/?mlat=${latitude}` +
    `&mlon=${longitude}#map=16/${latitude}/${longitude}`;

  return (
    <section className="donation-location">
      <div className="donation-location-heading">
        <span
          className="donation-location-icon"
          aria-hidden="true"
        >
          📍
        </span>

        <div>
          <h3>Restaurant Pickup Location</h3>
          <p>
            {donation.location || "Provider's shared location"}
          </p>
        </div>
      </div>

      <div className="donation-location-map">
        <iframe
          title="Donation pickup location map"
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        <a
          href={openOSMUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open interactive map ↗
        </a>
      </div>

      <div className="ngo-route-section">
        <h3>🧭 Route to the Restaurant</h3>

        <p>
          Detect your current location to get directions
          from your location to the provider.
        </p>

        <button
          type="button"
          className="button button-primary donation-directions-button"
          onClick={getNGOLocation}
          disabled={loading}
        >
          {loading
            ? "Detecting location..."
            : ngoCoordinates
              ? "Refresh My Location"
              : "Use My Current Location"}
        </button>

        {locationMessage && (
          <p role="status">{locationMessage}</p>
        )}

        {ngoCoordinates && (
          <div className="ngo-route-details">
            <p>
              <strong>Starting point:</strong> Your current location
            </p>
            <p>
              <strong>Destination:</strong>{" "}
              {donation.location || "Provider's restaurant"}
            </p>
          </div>
        )}

        <a
          className="button button-primary donation-directions-button"
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {ngoCoordinates
            ? "Get Route & Directions ↗"
            : "Directions to Restaurant ↗"}
        </a>
      </div>
    </section>
  );
}
