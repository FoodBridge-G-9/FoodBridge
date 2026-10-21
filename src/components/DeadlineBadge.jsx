import React from "react";
import { useEffect, useState } from "react";
import { getDeadlineInfo } from "../utils/donationUtils";

export default function DeadlineBadge({ deadline, compact = false }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const info = getDeadlineInfo(deadline, now);
  const className = `deadline-badge deadline-badge-${info.state}${compact ? " deadline-badge-compact" : ""}`;

  return (
    <span
      className={className}
      aria-live="polite"
      title="Time remaining until pickup deadline"
    >
      <span aria-hidden="true">{info.state === "expired" ? "⌛" : "◷"}</span>
      {info.label}
    </span>
  );
}
