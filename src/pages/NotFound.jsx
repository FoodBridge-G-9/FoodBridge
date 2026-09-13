import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container empty-state not-found-state">
        <div>🌱</div>
        <p className="eyebrow">404</p>
        <h1>This page got misplaced.</h1>
        <p>Let's get you back to the FoodBridge home page.</p>
        <Link className="button button-primary" to="/">
          Back home →
        </Link>
      </div>
    </section>
  );
}
