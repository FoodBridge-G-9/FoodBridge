import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import FoodCard from "../components/FoodCard";
import SectionHeading from "../components/SectionHeading";
import { initialDonations } from "../data/donations";

export default function Home() {
  const featured = initialDonations.slice(0, 3);

  return (
    <div>
      <section className="hero-section">
        <div className="hero-shape hero-shape-one"></div>
        <div className="hero-shape hero-shape-two"></div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">FOOD RESCUE, MADE SIMPLE</p>
            <h1>
              Turn surplus food into <span>shared meals.</span>
            </h1>
            <p className="hero-description">
              Restaurants, bakeries and event organizers can share extra edible
              food with nearby NGOs and shelters before it goes to waste.
            </p>
            <div className="hero-actions">
              <Button to="/login">Donate Surplus Food</Button>
              <Button to="/food" variant="outline">
                Find Available Food
              </Button>
            </div>
            <div className="trust-row">
              <span>✓ Simple to use</span>
              <span>✓ Local connections</span>
              <span>✓ Faster food rescue</span>
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="Illustration showing food rescue"
          >
            <div className="hero-card hero-card-main">
              <div className="mini-label">TODAY'S SURPLUS</div>
              <div className="hero-food-icon">🥗</div>
              <h3>Fresh meals available</h3>
              <p>65 portions · Sector 15</p>
              <div className="hero-progress">
                <span></span>
              </div>
              <div className="hero-progress-labels">
                <span>Shared with NGO</span>
                <strong>82%</strong>
              </div>
            </div>
            <div className="floating-card floating-card-top">
              <span className="floating-icon">🤝</span>
              <span>
                <strong>Matched!</strong>
                <small>Hope Shelter</small>
              </span>
            </div>
            <div className="floating-card floating-card-bottom">
              <span className="floating-icon">♻️</span>
              <span>
                <strong>Food rescued</strong>
                <small>Before it was wasted</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-strip">
        <div className="container impact-grid">
          <div>
            <strong>150+</strong>
            <span>Meals listed</span>
          </div>
          <div>
            <strong>32</strong>
            <span>Donations this month</span>
          </div>
          <div>
            <strong>12</strong>
            <span>Community partners</span>
          </div>
          <div>
            <strong>94%</strong>
            <span>Successful pickups</span>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <SectionHeading
            eyebrow="THE PROBLEM"
            title="Good food should not become waste."
            description="Surplus food can have a very short window before it is no longer useful. FoodBridge reduces the time between discovering surplus and finding a suitable community partner."
          />
          <div className="problem-grid">
            <div className="problem-card problem-card-warm">
              <span className="problem-number">01</span>
              <h3>Surplus appears unexpectedly</h3>
              <p>
                Restaurants, bakeries and events can end the day with perfectly
                edible food that has no planned destination.
              </p>
            </div>
            <div className="problem-card">
              <span className="problem-number">02</span>
              <h3>NGOs don't always know it exists</h3>
              <p>
                Community organizations may need food but have no central place
                to discover nearby donations in time.
              </p>
            </div>
            <div className="problem-card problem-card-green">
              <span className="problem-number">03</span>
              <h3>Manual calling wastes precious time</h3>
              <p>
                Contacting multiple organizations one by one slows down
                coordination while food continues to age.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="HOW FOODBRIDGE WORKS"
            title="Three simple steps to rescue a meal."
            description="The first version focuses on making discovery and coordination straightforward for both sides of the platform."
            centered
          />
          <div className="steps-grid">
            <div className="step-card">
              <span>01</span>
              <div className="step-icon">📋</div>
              <h3>Post the surplus</h3>
              <p>
                Share what food is available, how much there is and when it can
                be picked up.
              </p>
            </div>
            <div className="step-card">
              <span>02</span>
              <div className="step-icon">🔎</div>
              <h3>Find a match</h3>
              <p>
                NGOs browse food by category and location to find donations that
                fit their needs.
              </p>
            </div>
            <div className="step-card">
              <span>03</span>
              <div className="step-icon">🤝</div>
              <h3>Connect & collect</h3>
              <p>
                The NGO requests the donation and the provider can prepare it
                for pickup.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tinted">
        <div className="container">
          <div className="section-heading-row">
            <SectionHeading
              eyebrow="AVAILABLE NOW"
              title="Food looking for a home"
              description="A few sample listings show what NGOs can discover through the platform."
            />
            <Link className="button button-outline" to="/food">
              View all food
            </Link>
          </div>
          <div className="food-grid">
            {featured.map((donation) => (
              <FoodCard donation={donation} key={donation.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <p className="eyebrow">READY TO CONNECT?</p>
            <h2>One extra meal can still make a difference.</h2>
          </div>
          <div className="cta-actions">
            <Button to="/login">Get Started</Button>
            <Link className="cta-text-link" to="/how-it-works">
              Learn how it works →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
