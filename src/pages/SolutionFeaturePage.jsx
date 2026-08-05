import { useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ClipboardCheck,
  Code2,
  Globe,
  Radar,
  ScanEye,
  ShieldAlert,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";
import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import "../components/LandingPage.css";
import "./SolutionFeaturePage.css";

const solutionBySlug = {
  "continuous-security-testing": {
    icon: Radar,
    tone: "green",
    eyebrow: "Continuous Security Testing",
    headingPrefix: "Ongoing scans that",
    headingHighlight: "never sleep",
    description:
      "Continuous discovery and validation keep your security evidence current as your code and exposure change between assessments.",
    outcomes: [
      {
        icon: Radar,
        tone: "green",
        title: "Always-on discovery",
        text: "Track exposed assets across web, apps, APIs, and external surfaces.",
      },
      {
        icon: ClipboardCheck,
        tone: "purple",
        title: "Validated findings",
        text: "Reduce noise by validating what’s actionable and prioritizing what matters.",
      },
      {
        icon: Star,
        tone: "amber",
        title: "Assurance you can trust",
        text: "Security posture stays current without waiting for the next cycle.",
      },
    ],
    bestFor: [
      { icon: Target, label: "DevSecOps teams" },
      { icon: ShieldAlert, label: "Audit-driven orgs" },
      { icon: TrendingUp, label: "Fast-moving startups" },
    ],
  },

  "vulnerability-assessment": {
    icon: ShieldAlert,
    tone: "red",
    eyebrow: "Vulnerability Assessment",
    headingPrefix: "Identify real risk, not",
    headingHighlight: "just alerts",
    description:
      "Find, validate, and prioritize vulnerabilities using evidence-driven testing so teams fix the exposures that can actually be exploited.",
    outcomes: [
      {
        icon: ShieldAlert,
        tone: "red",
        title: "Risk-ranked results",
        text: "Prioritize issues by real-world exploitability and impact.",
      },
      {
        icon: ClipboardCheck,
        tone: "green",
        title: "Validation first",
        text: "Confirm findings so engineering time goes to actionable remediation.",
      },
      {
        icon: Target,
        tone: "blue",
        title: "Clear next steps",
        text: "Action guidance that aligns to how teams build and release software.",
      },
    ],
    bestFor: [
      { icon: Target, label: "Security engineers" },
      { icon: ClipboardCheck, label: "Compliance teams" },
      { icon: ShieldAlert, label: "Risk owners" },
    ],
  },

  "web-application-security": {
    icon: Globe,
    tone: "blue",
    eyebrow: "Web Application Security",
    headingPrefix: "Secure your apps and",
    headingHighlight: "customer-facing portals",
    description:
      "From UI to APIs behind the scenes, assess what users touch and what attackers reach—then validate findings for confident fixes.",
    outcomes: [
      {
        icon: Globe,
        tone: "blue",
        title: "Full web surface coverage",
        text: "Test front-ends, portals, and connected services for exploitable risk.",
      },
      {
        icon: ClipboardCheck,
        tone: "purple",
        title: "Evidence-backed validation",
        text: "Turn scan results into verified security findings teams can act on.",
      },
      {
        icon: TrendingUp,
        tone: "amber",
        title: "Better iteration speed",
        text: "Reduce the time between detection and remediation with ongoing assurance.",
      },
    ],
    bestFor: [
      { icon: Globe, label: "Customer portals" },
      { icon: Target, label: "App security owners" },
      { icon: ShieldAlert, label: "Platform teams" },
    ],
  },

  "api-security-testing": {
    icon: Code2,
    tone: "purple",
    eyebrow: "API Security Testing",
    headingPrefix: "Validate risks across your",
    headingHighlight: "public APIs",
    description:
      "Reduce API exposure by scanning and validating weaknesses across endpoints, auth flows, and integrated services.",
    outcomes: [
      {
        icon: Code2,
        tone: "purple",
        title: "Endpoint-focused testing",
        text: "Assess attack paths across public API surfaces and app integrations.",
      },
      {
        icon: ClipboardCheck,
        tone: "green",
        title: "Verified exploitability",
        text: "Validate findings to keep priority lists engineering-ready.",
      },
      {
        icon: Target,
        tone: "blue",
        title: "Actionable remediation",
        text: "Fix guidance that maps to API behavior and release workflows.",
      },
    ],
    bestFor: [
      { icon: Code2, label: "API platforms" },
      { icon: ClipboardCheck, label: "Dev teams" },
      { icon: TrendingUp, label: "Integrations & partners" },
    ],
  },

  "external-attack-surface-monitoring": {
    icon: ScanEye,
    tone: "green",
    eyebrow: "External Attack Surface Monitoring",
    headingPrefix: "Track every exposed asset",
    headingHighlight: "live",
    description:
      "Monitor external exposure continuously so newly reachable systems don’t go unnoticed between assessments.",
    outcomes: [
      {
        icon: ScanEye,
        tone: "green",
        title: "Continuous surface visibility",
        text: "Detect changes in exposure and alert your team quickly.",
      },
      {
        icon: ClipboardCheck,
        tone: "purple",
        title: "Validated alerts",
        text: "Avoid alarm fatigue by validating what’s actionable.",
      },
      {
        icon: Target,
        tone: "amber",
        title: "Focus fixes fast",
        text: "Prioritize the exposures most likely to become real incidents.",
      },
    ],
    bestFor: [
      { icon: ScanEye, label: "External exposure owners" },
      { icon: Target, label: "Security ops" },
      { icon: ShieldAlert, label: "Risk & audit teams" },
    ],
  },

  "security-risk-prioritization": {
    icon: TrendingUp,
    tone: "amber",
    eyebrow: "Security Risk Prioritization",
    headingPrefix: "Focus on fixes that",
    headingHighlight: "reduce real risk",
    description:
      "Rank vulnerabilities by evidence-backed exploitability so you can drive remediation with confidence and clarity.",
    outcomes: [
      {
        icon: TrendingUp,
        tone: "amber",
        title: "Evidence-backed ranking",
        text: "Turn findings into risk tiers your team can plan around.",
      },
      {
        icon: ClipboardCheck,
        tone: "green",
        title: "Noise reduction",
        text: "Validate results to keep priority queues accurate and actionable.",
      },
      {
        icon: Target,
        tone: "blue",
        title: "Remediation alignment",
        text: "Help engineering pick the next best fix without guesswork.",
      },
    ],
    bestFor: [
      { icon: TrendingUp, label: "Security leads" },
      { icon: ClipboardCheck, label: "DevSecOps planners" },
      { icon: Target, label: "Engineering managers" },
    ],
  },

  "compliance-security-audits": {
    icon: ClipboardCheck,
    tone: "blue",
    eyebrow: "Compliance & Security Audits",
    headingPrefix: "Stay audit-ready with",
    headingHighlight: "evidence that stays current",
    description:
      "Keep documentation aligned to your security testing results with continuous validation and assessment records.",
    outcomes: [
      {
        icon: ClipboardCheck,
        tone: "blue",
        title: "Audit-ready evidence",
        text: "Maintain security assessment context designed for compliance reviews.",
      },
      {
        icon: ShieldAlert,
        tone: "green",
        title: "Validated risk context",
        text: "Support compliance decisions with findings grounded in evidence.",
      },
      {
        icon: Star,
        tone: "purple",
        title: "Continuous assurance",
        text: "Reduce last-minute scramble with ongoing validation between audits.",
      },
    ],
    bestFor: [
      { icon: ClipboardCheck, label: "Compliance teams" },
      { icon: ShieldAlert, label: "Security leadership" },
      { icon: Star, label: "Audit owners" },
    ],
  },
};

export default function SolutionFeaturePage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const content = slug ? solutionBySlug[slug] : undefined;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const iconTone = content?.tone ?? "green";
  const HeroIcon = content?.icon ?? Radar;

  return (
    <main className="solution-page">
      <div className="solution-shell">
        <LandingNavbar />

        <section className="solution-hero">
          <div className="solution-eyebrow">
            <span className={`solution-hero-icon ${iconTone}`}>
              <HeroIcon size={16} strokeWidth={2.2} />
            </span>
            {content?.eyebrow ?? "Solution"}
          </div>

          <h1>
            {content?.headingPrefix ?? "Security"} <span>{content?.headingHighlight ?? "that scales"}</span>
          </h1>

          <p>{content?.description ?? "Explore the solution details and validate what matters most."}</p>

          <div className="solution-hero-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              Start Scanning Now
            </button>
            <button className="demo-btn" type="button" onClick={() => navigate("/#pricing")}>
              View Pricing
            </button>
          </div>
        </section>

        <section className="solution-section">
          <div className="solution-kicker">What you get</div>
          <h2>Outcome-driven security validation</h2>
          <p className="solution-lead">
            {content?.description ??
              "Evidence-driven testing that validates risk and keeps remediation focused."}
          </p>

          <div className="solution-outcomes-grid">
            {(content?.outcomes ?? []).map(({ icon: Icon, tone, title, text }) => (
              <article className={`solution-card ${tone}`} key={title}>
                <div className={`solution-card-icon ${tone}`}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="solution-section alt">
          <div className="solution-kicker">How it works</div>
          <h2>Validation you can act on</h2>
          <p className="solution-lead">
            A consistent workflow keeps security evidence current and fixes prioritized by real exploitability.
          </p>

          <div className="solution-steps-grid">
            {[
              { number: "01", icon: Radar, tone: "blue", title: "Discover", text: "Find assets and surfaces continuously as exposure changes." },
              { number: "02", icon: ShieldAlert, tone: "green", title: "Assess & Validate", text: "Validate findings to reduce noise and confirm actionable risk." },
              { number: "03", icon: ClipboardCheck, tone: "purple", title: "Prioritize", text: "Rank issues based on evidence-backed exploitability and impact." },
              { number: "04", icon: Target, tone: "amber", title: "Remediate", text: "Deliver engineering-friendly guidance so teams can fix confidently." },
            ].map(({ number, icon: StepIcon, tone, title, text }) => (
              <article className={`solution-step-card ${tone}`} key={number}>
                <span className="solution-step-number">{number}</span>
                <div className={`solution-step-icon ${tone}`}>
                  <StepIcon size={22} strokeWidth={2.2} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="solution-section">
          <div className="solution-kicker">Best for</div>
          <h2>Teams that need continuous assurance</h2>
          <div className="solution-pill-row">
            {(content?.bestFor ?? []).map(({ icon: Icon, label }) => (
              <div className="solution-pill" key={label}>
                <Icon size={18} strokeWidth={2.2} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="solution-cta">
          <p className="solution-tagline">Discover Risks. Validate Threats. Strengthen Security.</p>
          <div className="solution-cta-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              Start Scanning Now
            </button>
            <button className="demo-btn" type="button" onClick={() => navigate("/#pricing")}>
              View Pricing
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

