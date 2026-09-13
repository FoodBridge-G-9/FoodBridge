import React from "react";
import SectionHeading from "../components/SectionHeading";

export default function HowItWorks() {
  return (
    <div>
      <section className="page-hero section-tinted">
        <div className="container narrow">
          <p className="eyebrow">THE FOODBRIDGE FLOW</p>
          <h1>From surplus to shelter, without the phone-call chain.</h1>
          <p>
            FoodBridge creates one shared place where food providers can
            announce surplus and community organizations can discover it.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="FOR PROVIDERS"
            title="Share food in under a minute."
          />
          <div className="flow-row">
            <div className="flow-card">
              <span>01</span>
              <h3>Describe the food</h3>
              <p>Add the food name, category, quantity and dietary type.</p>
            </div>
            <div className="flow-line" aria-hidden="true">
              →
            </div>
            <div className="flow-card">
              <span>02</span>
              <h3>Add pickup details</h3>
              <p>
                Tell NGOs where the food is and the latest practical pickup
                time.
              </p>
            </div>
            <div className="flow-line" aria-hidden="true">
              →
            </div>
            <div className="flow-card">
              <span>03</span>
              <h3>Wait for a request</h3>
              <p>
                NGOs can view the listing and request the donation directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tinted">
        <div className="container">
          <SectionHeading
            eyebrow="FOR NGOs & SHELTERS"
            title="Find food without calling around."
          />
          <div className="benefits-grid">
            <div>
              <span>🔎</span>
              <h3>Browse nearby listings</h3>
              <p>
                See available donations in one place instead of checking
                multiple providers.
              </p>
            </div>
            <div>
              <span>🏷️</span>
              <h3>Understand the donation</h3>
              <p>
                Each listing clearly shows quantity, category, type and pickup
                deadline.
              </p>
            </div>
            <div>
              <span>🤝</span>
              <h3>Request what fits</h3>
              <p>
                Use the details on the listing to decide whether it works for
                your organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow centered-copy">
          <p className="eyebrow">OUR EVALUATION-I FOCUS</p>
          <h2>A clear frontend workflow before advanced backend features.</h2>
          <p>
            This first project milestone focuses on responsive React UI,
            reusable components, routing, forms, state, browser storage and a
            realistic user journey. More advanced state management, API
            integration and CRUD can be added in later evaluations.
          </p>
        </div>
      </section>
    </div>
  );
}
