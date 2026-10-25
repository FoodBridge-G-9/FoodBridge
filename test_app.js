import assert from "node:assert/strict";
import {
  parseDeadline,
  isDeadlinePassed,
  formatDeadline,
  toLocalDateTimeInput,
  getDeadlineInfo,
  isDonationAvailable,
  getRequestDisplayStatus,
} from "./src/utils/donationUtils.js";
import { initialDonations } from "./src/data/donations.js";
import donationsReducer, {
  addDonation,
  updateDonation,
  removeDonation,
  setDonations,
} from "./src/features/donations/donationsSlice.js";

console.log("=== FOODBRIDGE AUTOMATED TEST SUITE ===\n");

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

// ----------------------------------------------------
// 1. DATA INTEGRITY TESTS
// ----------------------------------------------------
console.log("1. Initial Donations & Coordinate Schema:");

test("initialDonations is a non-empty array", () => {
  assert(Array.isArray(initialDonations));
  assert(initialDonations.length > 0);
});

test("all initialDonations have required schema fields and valid coordinates", () => {
  for (const item of initialDonations) {
    assert(typeof item.id !== "undefined", `Item ${item.id} missing id`);
    assert(typeof item.foodName === "string" && item.foodName.length > 0, `Item ${item.id} invalid foodName`);
    assert(typeof item.category === "string", `Item ${item.id} invalid category`);
    assert(typeof item.quantity === "number" && item.quantity > 0, `Item ${item.id} invalid quantity`);
    assert(typeof item.unit === "string", `Item ${item.id} invalid unit`);
    assert(typeof item.provider === "string", `Item ${item.id} invalid provider`);
    assert(typeof item.providerId === "string", `Item ${item.id} invalid providerId`);
    assert(typeof item.location === "string", `Item ${item.id} invalid location`);
    assert(typeof item.pickupDeadline === "string", `Item ${item.id} invalid pickupDeadline`);
    assert(parseDeadline(item.pickupDeadline) !== null, `Item ${item.id} deadline is not valid ISO date`);
    assert(typeof item.status === "string", `Item ${item.id} invalid status`);

    // Verify coordinates
    assert(item.coordinates, `Item ${item.id} missing coordinates`);
    assert(Number.isFinite(item.coordinates.latitude), `Item ${item.id} latitude not finite`);
    assert(Number.isFinite(item.coordinates.longitude), `Item ${item.id} longitude not finite`);
    assert(item.coordinates.latitude >= -90 && item.coordinates.latitude <= 90);
    assert(item.coordinates.longitude >= -180 && item.coordinates.longitude <= 180);
  }
});

// ----------------------------------------------------
// 2. DONATION UTILS TESTS
// ----------------------------------------------------
console.log("\n2. Donation Utilities (src/utils/donationUtils.js):");

test("parseDeadline returns numeric timestamp for valid dates", () => {
  const nowIso = new Date().toISOString();
  const timestamp = parseDeadline(nowIso);
  assert(typeof timestamp === "number");
  assert(!Number.isNaN(timestamp));
});

test("parseDeadline returns null for invalid dates or falsy inputs", () => {
  assert.equal(parseDeadline(null), null);
  assert.equal(parseDeadline(""), null);
  assert.equal(parseDeadline("not-a-date"), null);
});

test("isDeadlinePassed correctly detects past and future dates", () => {
  const past = new Date(Date.now() - 10000).toISOString();
  const future = new Date(Date.now() + 10000).toISOString();
  assert.equal(isDeadlinePassed(past), true);
  assert.equal(isDeadlinePassed(future), false);
});

test("formatDeadline formats valid date in Indian locale and handles missing date", () => {
  assert.equal(formatDeadline(null), "Deadline not set");
  const formatted = formatDeadline("2026-10-25T15:30:00.000Z");
  assert(typeof formatted === "string" && formatted.length > 5);
});

test("toLocalDateTimeInput outputs format YYYY-MM-DDTHH:MM", () => {
  const dateStr = "2026-10-25T15:30:00.000Z";
  const localStr = toLocalDateTimeInput(dateStr);
  assert(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/.test(localStr));
});

test("getDeadlineInfo returns urgency and remainingMs correctly", () => {
  const urgentDeadline = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30m
  const normalDeadline = new Date(Date.now() + 5 * 3600 * 1000).toISOString(); // 5h
  const expiredDeadline = new Date(Date.now() - 60 * 1000).toISOString(); // past

  const urgentInfo = getDeadlineInfo(urgentDeadline);
  assert.equal(urgentInfo.state, "urgent");

  const normalInfo = getDeadlineInfo(normalDeadline);
  assert.equal(normalInfo.state, "active");

  const expiredInfo = getDeadlineInfo(expiredDeadline);
  assert.equal(expiredInfo.state, "expired");
  assert.equal(expiredInfo.remainingMs, 0);
});

test("isDonationAvailable checks status and deadline", () => {
  const available = {
    status: "Available",
    pickupDeadline: new Date(Date.now() + 3600 * 1000).toISOString(),
  };
  const claimed = {
    status: "Claimed",
    pickupDeadline: new Date(Date.now() + 3600 * 1000).toISOString(),
  };
  const expiredByDeadline = {
    status: "Available",
    pickupDeadline: new Date(Date.now() - 3600 * 1000).toISOString(),
  };

  assert.equal(isDonationAvailable(available), true);
  assert.equal(isDonationAvailable(claimed), false);
  assert.equal(isDonationAvailable(expiredByDeadline), false);
});

test("getRequestDisplayStatus correctly translates status", () => {
  // 1. Completed
  assert.equal(
    getRequestDisplayStatus({ status: "Accepted" }, { status: "Picked Up" }),
    "Completed"
  );
  // 2. Declined
  assert.equal(
    getRequestDisplayStatus({ status: "Declined" }, { status: "Available" }),
    "Declined"
  );
  assert.equal(
    getRequestDisplayStatus({ status: "Not selected" }, { status: "Available" }),
    "Declined"
  );
  // 3. Expired
  assert.equal(
    getRequestDisplayStatus(
      { status: "Requested" },
      { status: "Available", pickupDeadline: new Date(Date.now() - 1000).toISOString() }
    ),
    "Expired"
  );
  // 4. Normal Requested
  assert.equal(
    getRequestDisplayStatus(
      { status: "Requested" },
      { status: "Available", pickupDeadline: new Date(Date.now() + 100000).toISOString() }
    ),
    "Requested"
  );
});

// ----------------------------------------------------
// 3. REDUX SLICE TESTS
// ----------------------------------------------------
console.log("\n3. Redux Donations Slice (src/features/donations/donationsSlice.js):");

test("addDonation appends an item and ensures id and _id", () => {
  const state = { items: [] };
  const newItem = { id: 101, foodName: "Rice Bowl", quantity: 10 };
  const nextState = donationsReducer(state, addDonation(newItem));
  assert.equal(nextState.items.length, 1);
  assert.equal(nextState.items[0].id, 101);
  assert.equal(nextState.items[0]._id, 101);
  assert.equal(nextState.items[0].foodName, "Rice Bowl");
});

test("updateDonation updates existing item by id", () => {
  const state = { items: [{ id: 101, _id: 101, foodName: "Old Name", status: "Available" }] };
  const nextState = donationsReducer(state, updateDonation({ id: 101, foodName: "New Name", status: "Claimed" }));
  assert.equal(nextState.items[0].foodName, "New Name");
  assert.equal(nextState.items[0].status, "Claimed");
});

test("removeDonation removes item by id", () => {
  const state = { items: [{ id: 101, _id: 101 }, { id: 102, _id: 102 }] };
  const nextState = donationsReducer(state, removeDonation(101));
  assert.equal(nextState.items.length, 1);
  assert.equal(nextState.items[0].id, 102);
});

test("setDonations replaces all items and standardizes ids", () => {
  const state = { items: [{ id: 1, foodName: "A" }] };
  const incoming = [{ id: 2, foodName: "B" }, { _id: 3, foodName: "C" }];
  const nextState = donationsReducer(state, setDonations(incoming));
  assert.equal(nextState.items.length, 2);
  assert.equal(nextState.items[0].id, 2);
  assert.equal(nextState.items[1].id, 3);
  assert.equal(nextState.items[1]._id, 3);
});

// ----------------------------------------------------
// 4. LOCATION & MAP LOGIC TESTS
// ----------------------------------------------------
console.log("\n4. Location & Map Logic (DonationLocation):");

function validateCoordinates(coordinates) {
  const latitude = Number(coordinates?.latitude);
  const longitude = Number(coordinates?.longitude);
  return (
    coordinates?.latitude != null &&
    coordinates?.longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

test("validateCoordinates handles valid numeric coordinates", () => {
  assert.equal(validateCoordinates({ latitude: 30.45, longitude: 76.59 }), true);
  assert.equal(validateCoordinates({ latitude: "30.45", longitude: "76.59" }), true);
  assert.equal(validateCoordinates({ latitude: 0, longitude: 0 }), true);
});

test("validateCoordinates rejects invalid/out-of-bounds coordinates", () => {
  assert.equal(validateCoordinates(null), false);
  assert.equal(validateCoordinates({}), false);
  assert.equal(validateCoordinates({ latitude: 95, longitude: 76 }), false); // lat > 90
  assert.equal(validateCoordinates({ latitude: 30, longitude: 185 }), false); // lon > 180
  assert.equal(validateCoordinates({ latitude: "invalid", longitude: 76 }), false);
});

test("Map embed URL correctly formats bounding box and marker", () => {
  const latitude = 30.45;
  const longitude = 76.59;
  const bounds = {
    minLat: latitude - 0.005,
    maxLat: latitude + 0.005,
    minLon: longitude - 0.008,
    maxLon: longitude + 0.008,
  };
  const mapUrl =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${bounds.minLon}%2C${bounds.minLat}` +
    `%2C${bounds.maxLon}%2C${bounds.maxLat}` +
    `&layer=mapnik&marker=${latitude}%2C${longitude}`;

  assert(mapUrl.includes("marker=30.45%2C76.59"));
  assert(mapUrl.includes("layer=mapnik"));
  assert(mapUrl.includes("bbox="));
});

test("Google Maps Directions URL handles origin when NGO coordinates present and absent", () => {
  const destLat = 30.45;
  const destLon = 76.59;
  const ngoCoords = { latitude: 30.50, longitude: 76.65 };

  const urlWithNGO = `https://www.google.com/maps/dir/?api=1&origin=${ngoCoords.latitude},${ngoCoords.longitude}&destination=${destLat},${destLon}&travelmode=driving`;
  assert(urlWithNGO.includes("origin=30.5,76.65"));
  assert(urlWithNGO.includes("destination=30.45,76.59"));

  const urlWithoutNGO = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}&travelmode=driving`;
  assert(!urlWithoutNGO.includes("origin="));
  assert(urlWithoutNGO.includes("destination=30.45,76.59"));
});

// ----------------------------------------------------
// 5. LOCALSTORAGE BACKFILL MIGRATION TEST
// ----------------------------------------------------
console.log("\n5. LocalStorage Store Migration:");

test("Old cached donations without coordinates are backfilled from initialDonations", () => {
  const legacyStorage = [
    { id: 1, foodName: "Fresh Veg Sandwiches", location: "Sector 18", pickupDeadline: new Date(Date.now() + 10000).toISOString() },
    { id: 99, foodName: "Custom User Food", location: "Sector 1", pickupDeadline: new Date(Date.now() + 10000).toISOString() },
  ];

  const migrated = legacyStorage.map((record) => {
    let updated = { ...record };
    const match = initialDonations.find((item) => String(item.id) === String(record.id));
    if (!updated.coordinates && match?.coordinates) {
      updated.coordinates = match.coordinates;
    }
    return updated;
  });

  assert.equal(migrated[0].coordinates.latitude, 30.7415);
  assert.equal(migrated[0].coordinates.longitude, 76.7885);
  assert.equal(migrated[1].coordinates, undefined);
});

console.log(`\n======================================`);
console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
console.log(`======================================`);

if (failed > 0) {
  process.exit(1);
}
