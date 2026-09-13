import React from "react";
import { Link } from "react-router-dom";

export default function Button({
  children,
  to,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
}) {
  const className = `button button-${variant}`;

  if (to) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={className}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
