import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radar,
  ShieldCheck,
  Layers,
  Gauge,
  ClipboardCheck,
  Building2,
  Rocket,
  Users2,
  Compass,
  Target,
} from "lucide-react";
import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import "../components/LandingPage.css";
import "./AboutUsPage.css";

const problemPoints = [
  {
    icon: Layers,
    title: "Constantly Changing Surface",
    text: "Websites, applications, APIs, and cloud environments evolve every day, creating new security risks continuously.",
  },
  {
    icon: Gauge,
    title: "Periodic Testing Falls Short",
    text: "Traditional assessments are expensive, time-consuming, and run only occasionally — leaving gaps between testing cycles.",
  },
  {
    icon: Radar,
    title: "Exposure Between Cycles",
    text: "Organizations remain exposed the moment new assets or code ship after a one-time audit is complete.",
  },
];

const platformSteps = [
  {
    icon: Compass,
    title: "Continuous Discovery",
    text: "We continuously discover your digital assets across web, application, API, and cloud surfaces.",
  },
  {
    icon: Radar,
    title: "Identify Weaknesses",
    text: "Our engine identifies security weaknesses as they emerge, not just at scheduled checkpoints.",
  },
  {
    icon: ClipboardCheck,
    title: "Validate Findings",
    text: "Every finding is validated to cut through noise and surface real, exploitable risk.",
  },
  {
    icon: ShieldCheck,
    title: "Actionable Remediation",
    text: "We deliver clear, actionable remediation guidance so teams can fix issues with confidence.",
  },
];

const audiences = [
  { icon: Rocket, label: "Startups" },
  { icon: Building2, label: "MSMEs" },
  { icon: Users2, label: "Enterprises" },
  { icon: ShieldCheck, label: "Public Sector" },
];

export default function AboutUsPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="about-page">
      <div className="about-shell">
        <LandingNavbar />

        {/* HERO */}
        <section className="about-hero">
          <div className="eyebrow">About PentestRadar</div>
          <h1>
            Continuous Security Testing for a
            <span> Constantly Moving </span>
            Target
          </h1>
          <p>
            PentestRadar is a cybersecurity technology company dedicated to helping organizations stay
            ahead of evolving cyber threats through continuous security testing and risk validation.
          </p>
        </section>

        {/* PROBLEM */}
        <section className="about-section">
          <div className="section-kicker">The Problem</div>
          <h2>Security Testing Wasn&apos;t Built for Today&apos;s Pace</h2>
          <p className="section-lead">
            In today&apos;s rapidly changing digital landscape, every new deployment can open a new door
            for attackers. Point-in-time assessments simply can&apos;t keep up.
          </p>

          <div className="about-grid three">
            {problemPoints.map(({ icon: Icon, title, text }) => (
              <article className="about-card" key={title}>
                <div className="about-icon red">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* PLATFORM / SOLUTION */}
        <section className="about-section alt">
          <div className="section-kicker">Our Approach</div>
          <h2>A Continuous, Scalable Approach to Security</h2>
          <p className="section-lead">
            PentestRadar was built to close the gap traditional testing leaves open. Our platform
            continuously discovers your assets, tests them, and turns findings into fixes.
          </p>

          <div className="about-grid four">
            {platformSteps.map(({ icon: Icon, title, text }, index) => (
              <article className="about-card step" key={title}>
                <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="about-icon green">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* VISION / MISSION */}
        <section className="about-section">
          <div className="vm-grid">
            <article className="vm-card">
              <div className="about-icon blue">
                <Compass size={24} strokeWidth={2.2} />
              </div>
              <h3>Our Vision</h3>
              <p>To build the most trusted continuous security validation platform for the digital economy.</p>
            </article>
            <article className="vm-card">
              <div className="about-icon purple">
                <Target size={24} strokeWidth={2.2} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To make enterprise-grade security testing accessible, affordable, and scalable for
                organizations of all sizes.
              </p>
            </article>
          </div>
        </section>

        {/* WHO WE SERVE */}
        <section className="about-section alt">
          <div className="section-kicker">Security For Everyone</div>
          <h2>Built for Organizations of Every Size</h2>
          <p className="section-lead">
            We believe cybersecurity should be accessible to every organization, not just those with
            large security budgets and dedicated security teams. By combining automation, continuous
            monitoring, and intelligent risk prioritization, we help teams reduce cyber risk and protect
            their digital infrastructure.
          </p>

          <div className="audience-row">
            {audiences.map(({ icon: Icon, label }) => (
              <div className="audience-pill" key={label}>
                <Icon size={18} strokeWidth={2.2} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TAGLINE / CTA */}
        <section className="about-cta">
          <p className="about-tagline">Discover Risks. Validate Threats. Strengthen Security.</p>
          <div className="about-cta-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              Start Scanning Now
            </button>
            <button
              className="demo-btn"
              type="button"
              onClick={() => navigate("/#pricing")}
            >
              <span>View Pricing</span>
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
