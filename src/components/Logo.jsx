import React from "react";
import { Link } from "react-router-dom";
import foodBridgeLogo from "../images/FoodBridge-Logo.png";

export default function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark">
        <img src={foodBridgeLogo} alt="FoodBridge" />
      </span>

      <span>FoodBridge</span>
    </Link>
  );
}
