import { useState } from "react";
import Footer from "./Footer";
import LandingNavbar from "./LandingNavbar";
import SupportModal from "./SupportModal";
import "./SignInPage.css";
import "./LandingPage.css";

const benefits = [
  {
    icon: "scan",
    title: "Comprehensive Scanning",
    text: "Scan your web applications for 1000+ vulnerabilities in minutes.",
  },
  {
    icon: "report",
    title: "Detailed Reports",
    text: "Get actionable insights and step-by-step remediation guidance.",
  },
  {
    icon: "monitor",
    title: "Real-time Monitoring",
    text: "Continuous monitoring and alerts to stay protected 24/7.",
  },
  {
    icon: "enterprise",
    title: "Enterprise Security",
    text: "Bank-level security with SOC 2 compliance and data encryption.",
  },
];

export default function AuthPageLayout({ children }) {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="auth-navbar">
          <LandingNavbar onOpenSupport={() => setIsSupportOpen(true)} />
        </div>
      </header>

      <main className="signin-page">
        <section className="signin-info" aria-label="PentestRadar overview">
          <div className="trust-badge">
            <span></span>
            Trusted by 10,000+ businesses worldwide
          </div>

          <h1>
            Find &amp; Fix Security
            <span> Vulnerabilities </span>
            Before Hackers Do
          </h1>
          <p className="signin-lead">
            Automated vulnerability scanning, in-depth reports, and AI-powered insights to keep your
            applications and data safe.
          </p>

          <div className="benefit-list">
            {benefits.map((item) => (
              <article className="benefit-item" key={item.title}>
                <span className={`benefit-icon ${item.icon}`}></span>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="security-visual" aria-hidden="true">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>
            <div className="shield-stage">
              <span className="big-shield"></span>
            </div>
          </div>
        </section>

        <section className="signin-panel-wrap" aria-label="Authentication form">
          {children}
        </section>
      </main>

      <Footer showSupport onOpenSupport={() => setIsSupportOpen(true)} />

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
}