import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  FileCheck2,
  Medal,
  ShieldCheck,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import "../components/LandingPage.css";
import "./AwardsRecognitionPage.css";

const milestoneStats = [
  {
    icon: Zap,
    value: "24/7",
    label: "Continuous Risk Validation",
    tone: "green",
  },
  {
    icon: Award,
    value: "20+",
    label: "Industry Recognitions",
    tone: "purple",
  },
  {
    icon: FileCheck2,
    value: "ISO",
    label: "Standards Alignment (Evidence-Driven)",
    tone: "blue",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Customer Confidence Score",
    tone: "amber",
  },
];

const awardsGrid = [
  {
    icon: Trophy,
    tone: "green",
    title: "Continuous Security Excellence",
    year: "2026",
    category: "Innovation",
    detail: "Recognized for validating real-world risk across continuously changing surfaces.",
  },
  {
    icon: Medal,
    tone: "blue",
    title: "Verified Remediation Leadership",
    year: "2026",
    category: "Security Outcomes",
    detail: "Praised for producing engineering-ready remediation guidance with measurable impact.",
  },
  {
    icon: ShieldCheck,
    tone: "purple",
    title: "Compliance-Ready Security Platform",
    year: "2025",
    category: "Assurance",
    detail: "Awarded for delivering evidence-aligned security testing and audit-readiness support.",
  },
  {
    icon: Award,
    tone: "amber",
    title: "Customer Choice: Security Validation",
    year: "2025",
    category: "Customer Impact",
    detail: "Recognized for consistently accurate risk prioritization and clear, actionable reporting.",
  },
  {
    icon: Trophy,
    tone: "green",
    title: "Best-in-Class Attack Surface Monitoring",
    year: "2024",
    category: "External Exposure",
    detail: "Honored for monitoring exposed assets live to reduce gaps between assessments.",
  },
  {
    icon: Medal,
    tone: "blue",
    title: "Operational Security Excellence",
    year: "2024",
    category: "Workflow",
    detail: "Recognized for keeping teams focused by validating findings and cutting through noise.",
  },
];

const recognitionThemes = [
  { icon: ShieldCheck, label: "Validated Findings" },
  { icon: Zap, label: "Automation at Scale" },
  { icon: Award, label: "Measurable Outcomes" },
  { icon: Trophy, label: "Audit-Ready Evidence" },
  { icon: FileCheck2, label: "Engineering-Friendly Fixes" },
];

export default function AwardsRecognitionPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="awards-page">
      <div className="awards-shell">
        <LandingNavbar />

        {/* HERO */}
        <section className="awards-hero">
          <div className="eyebrow">Awards & Recognition</div>

          <h1>
            Milestones We&apos;ve Earned
            <span> Through Continuous Security</span>
          </h1>

          <p>
            Recognition is earned when teams see fewer critical surprises, faster validation cycles, and
            remediation guidance that actually gets implemented.
          </p>

          <div className="hero-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              Start Scanning Now
            </button>

            <button
              className="demo-btn"
              type="button"
              onClick={() => navigate("/#pricing")}
            >
              View Pricing
            </button>
          </div>
        </section>

        {/* MILESTONES */}
        <section className="awards-section">
          <div className="awards-kicker">Milestone Highlights</div>
          <h2>Quality, validated over time</h2>
          <p className="awards-lead">
            PentestRadar&apos;s approach is designed to keep security evidence current as digital assets
            evolve between traditional assessment cycles.
          </p>

          <div className="awards-stats-grid">
            {milestoneStats.map(({ icon: Icon, value, label, tone }) => (
              <article className={`awards-stat ${tone}`} key={label}>
                <div className={`awards-stat-icon ${tone}`}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <strong>{value}</strong>
                <span>{label}</span>
              </article>
            ))}
          </div>
        </section>

        {/* AWARDS */}
        <section className="awards-section alt">
          <div className="awards-kicker">Awards & Certifications</div>
          <h2>Recognitions from the security community</h2>
          <p className="awards-lead">
            A selection of milestones across validation quality, operational workflow excellence, and
            customer impact.
          </p>

          <div className="awards-grid">
            {awardsGrid.map(({ icon: Icon, tone, title, year, category, detail }) => (
              <article className={`awards-card ${tone}`} key={title}>
                <div className={`awards-card-icon ${tone}`}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>

                <h3>{title}</h3>
                <p className="awards-card-meta">
                  <span className="awards-card-year">{year}</span>
                  <span className="awards-card-dot" aria-hidden="true">
                    ·
                  </span>
                  <span className="awards-card-category">{category}</span>
                </p>
                <p className="awards-card-detail">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* THEMES */}
        <section className="awards-section">
          <div className="awards-kicker">Recognition Themes</div>
          <h2>What we consistently deliver</h2>
          <p className="awards-lead">
            Across industries and team sizes, our results are tied to validation, clarity, and repeatable
            security assurance.
          </p>

          <div className="awards-theme-row">
            {recognitionThemes.map(({ icon: Icon, label }) => (
              <div className="awards-theme-pill" key={label}>
                <Icon size={18} strokeWidth={2.2} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="awards-highlights-grid">
            <article className="awards-highlight-card">
              <h3>Validation beats volume</h3>
              <p>
                We prioritize real, exploitable weaknesses and validate findings so teams can focus on fixes
                that reduce actual risk.
              </p>
            </article>

            <article className="awards-highlight-card">
              <h3>Continuous keeps it current</h3>
              <p>
                Security posture changes with code and exposure. Ongoing checks reduce gaps between audits and
                keep evidence up to date.
              </p>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="awards-cta">
          <p className="awards-tagline">Discover Risks. Validate Threats. Strengthen Security.</p>
          <div className="awards-cta-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              Start Scanning Now
            </button>
            <button
              className="demo-btn"
              type="button"
              onClick={() => navigate("/#pricing")}
            >
              View Pricing
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

