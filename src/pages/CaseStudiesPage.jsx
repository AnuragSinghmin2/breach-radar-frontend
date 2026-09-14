// CaseStudiesPage.jsx
// NOTE: Starter production-ready scaffold matching your About page structure.
// Replace/extend as needed.

import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";
import "./CaseStudiesPage.css";

export default function CaseStudiesPage() {
  const navigate = useNavigate();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <main className="case-page">
      <div className="case-shell">
        <LandingNavbar />
        <section className="case-hero">
          <div className="eyebrow">Security Success Stories</div>
          <h1>See How Organizations Reduced Their Security Risks with <span>PentestRadar</span></h1>
          <p>From startups to enterprise applications, discover how automated vulnerability scanning helped teams identify critical security issues before attackers could exploit them.</p>
          <div className="hero-actions">
            <button onClick={()=>navigate("/case-studies")}>View Case Studies</button>
            <button className="secondary" onClick={()=>navigate("/register")}>Start Free Scan</button>
          </div>
        </section>

        <section className="case-section">
          <h2>Case Studies</h2>
          <p>Create the four cards here using the content you provided (SaaS, E‑Commerce, Healthcare, Education).</p>
        </section>

        <section className="case-section alt">
          <h2>Platform Impact</h2>
          <div className="stats">
            <div><strong>10,000+</strong><span>Scans Completed</span></div>
            <div><strong>50,000+</strong><span>Vulnerabilities Identified</span></div>
            <div><strong>95%</strong><span>Customer Satisfaction</span></div>
            <div><strong>300+</strong><span>Organizations Protected</span></div>
          </div>
        </section>

        <section className="case-cta">
          <h2>Ready to Secure Your Application?</h2>
          <p>Identify vulnerabilities before attackers do.</p>
          <button onClick={()=>navigate("/register")}>Start Free Security Scan</button>
        </section>
      </div>
      <Footer />
    </main>
  );
}