export function parseDeadline(value) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function isDeadlinePassed(value, now = Date.now()) {
  const timestamp = parseDeadline(value);
  return timestamp !== null && timestamp <= now;
}

export function formatDeadline(value) {
  const timestamp = parseDeadline(value);
  if (timestamp === null) return "Deadline not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));
}

export function toLocalDateTimeInput(value) {
  const timestamp = parseDeadline(value);
  if (timestamp === null) return "";
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(timestamp - offset).toISOString().slice(0, 16);
}

export function getDeadlineInfo(value, now = Date.now()) {
  const timestamp = parseDeadline(value);
  if (timestamp === null) {
    return { state: "unknown", label: "Deadline not set", remainingMs: null };
  }

  const remainingMs = timestamp - now;
  if (remainingMs <= 0) {
    return { state: "expired", label: "Pickup window expired", remainingMs: 0 };
  }

  const totalMinutes = Math.floor(remainingMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let label;
  if (days > 0) label = `${days}d ${hours}h left`;
  else if (hours > 0) label = `${hours}h ${minutes}m left`;
  else label = `${Math.max(minutes, 1)}m left`;

  return {
    state: remainingMs <= 60 * 60_000 ? "urgent" : "active",
    label,
    remainingMs,
  };
}

export function isDonationAvailable(donation, now = Date.now()) {
  return (
    donation?.status === "Available" &&
    !isDeadlinePassed(donation.pickupDeadline, now)
  );
}

export function getRequestDisplayStatus(request, donation) {
  // A completed pickup requires an accepted request.
  if (donation?.status === "Picked Up" && request?.status === "Accepted") {
    return "Completed";
  }

  // Both explicit rejection and allocation to another NGO
  // should display as Declined.
  if (request?.status === "Declined" || request?.status === "Not selected") {
    return "Declined";
  }

  // Pending or accepted requests expire when the pickup
  // deadline passes, unless the donation was picked up.
  if (
    ["Requested", "Accepted"].includes(request?.status) &&
    donation?.status !== "Picked Up" &&
    (donation?.status === "Expired" ||
      isDeadlinePassed(donation?.pickupDeadline))
  ) {
    return "Expired";
  }

  return request?.status || "Unknown";
}
