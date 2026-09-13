import React from "react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark" aria-hidden="true">
        FB
      </span>
      <span>FoodBridge</span>
    </Link>
  );
}
