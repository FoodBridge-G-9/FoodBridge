import React from "react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="footer-copy">
            A simple way for surplus food to reach people who need it.
          </p>
        </div>
        <div>
          <p className="footer-title">FoodBridge</p>
          <a href="/how-it-works">How It Works</a>
          <a href="/food">Find Food</a>
          <a href="/login">Get Started</a>
        </div>
        <div>
          <p className="footer-title">Built for FEE-II</p>
          <p className="footer-small">
            React · CSS3 · JavaScript · React Router
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 FoodBridge</span>
        <span>Rescue food. Connect communities.</span>
      </div>
    </footer>
  );
}
