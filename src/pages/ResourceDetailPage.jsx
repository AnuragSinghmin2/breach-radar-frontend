import { useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import "../components/LandingPage.css";
import "./ResourceDetailPage.css";

const resourcesBySlug = {
  "product-brochure": {
    icon: FileText,
    tone: "green",
    eyebrow: "Product Brochure",
    headingPrefix: "A clear overview of",
    headingHighlight: "PentestRadar",
    description:
      "Understand what our continuous security testing platform delivers, how it fits into modern workflows, and what teams typically achieve.",
    includes: [
      {
        title: "Core capabilities",
        text: "Continuous scanning, validated risk findings, and remediation guidance designed for execution.",
      },
      {
        title: "How teams use it",
        text: "Discover assets continuously, prioritize by evidence, and keep security evidence current.",
      },
      {
        title: "Value in practice",
        text: "Reduce time between detection and remediation while minimizing noisy, non-actionable alerts.",
      },
    ],
    useCases: [
      { icon: ShieldCheck, label: "Security leadership briefings" },
      { icon: BookOpen, label: "Procurement & evaluation" },
      { icon: FileText, label: "Team onboarding" },
    ],
  },

  datasheets: {
    icon: FileSpreadsheet,
    tone: "blue",
    eyebrow: "Datasheets",
    headingPrefix: "Technical details for",
    headingHighlight: "real integrations",
    description:
      "A reference view of how PentestRadar approaches coverage, validation, and reporting across web and API surfaces.",
    includes: [
      {
        title: "Coverage model",
        text: "What we scan across web apps, portals, APIs, and external exposure—continuously.",
      },
      {
        title: "Validation approach",
        text: "Evidence-backed results designed to reduce false positives and keep prioritization accurate.",
      },
      {
        title: "Reporting shape",
        text: "Reports and recommendations mapped for engineering workflows and release cycles.",
      },
    ],
    useCases: [
      { icon: FileSpreadsheet, label: "Solution architects" },
      { icon: ShieldCheck, label: "Engineering review sessions" },
      { icon: ListChecks, label: "Security program planning" },
    ],
  },

  "compliance-reports": {
    icon: FileCheck2,
    tone: "purple",
    eyebrow: "Compliance Reports",
    headingPrefix: "Evidence aligned to",
    headingHighlight: "security standards",
    description:
      "Audit-ready summaries that help teams stay aligned by keeping security evidence current between assessment cycles.",
    includes: [
      {
        title: "Evidence snapshots",
        text: "Maintain context across validated findings and security testing activity.",
      },
      {
        title: "Audit-friendly summaries",
        text: "Structured outputs designed to support compliance reviews with less scramble.",
      },
      {
        title: "Continuous readiness",
        text: "Avoid last-minute gaps by validating risk as your exposure changes.",
      },
    ],
    useCases: [
      { icon: FileCheck2, label: "Compliance teams" },
      { icon: ShieldCheck, label: "Security governance" },
      { icon: BookOpen, label: "Audit preparation" },
    ],
  },

  "security-checklists": {
    icon: ListChecks,
    tone: "amber",
    eyebrow: "Security Checklists",
    headingPrefix: "Step-by-step hardening",
    headingHighlight: "guides",
    description:
      "Practical checklists that turn validated findings into remediation actions your teams can implement confidently.",
    includes: [
      {
        title: "Remediation workflows",
        text: "Guidance that maps to engineering execution and release planning.",
      },
      {
        title: "Risk-aware prioritization",
        text: "Focus on what reduces real exploitable exposure, not just what looks severe.",
      },
      {
        title: "Continuous improvement",
        text: "Iterate over time as your systems evolve, keeping fixes durable.",
      },
    ],
    useCases: [
      { icon: ListChecks, label: "AppSec enablement" },
      { icon: ShieldCheck, label: "Hardening campaigns" },
      { icon: FileText, label: "Engineering action planning" },
    ],
  },
};

export default function ResourceDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const content = slug ? resourcesBySlug[slug] : undefined;
  const HeroIcon = content?.icon ?? FileText;
  const tone = content?.tone ?? "green";

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="resource-page">
      <div className="resource-shell">
        <LandingNavbar />

        <section className="resource-hero">
          <div className="resource-eyebrow">
            <span className={`resource-hero-icon ${tone}`}>
              <HeroIcon size={16} strokeWidth={2.2} />
            </span>
            {content?.eyebrow ?? "Resource"}
          </div>

          <h1>
            {content?.headingPrefix ?? "Secure"} <span>{content?.headingHighlight ?? "your posture"}</span>
          </h1>

          <p>{content?.description ?? "Explore this resource and request access to the full material."}</p>

          <div className="resource-hero-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              Request Access
            </button>
            <button className="demo-btn" type="button" onClick={() => navigate("/#pricing")}>
              View Pricing
            </button>
          </div>
        </section>

        <section className="resource-section">
          <div className="resource-kicker">Includes</div>
          <h2>Built for security teams and decision-makers</h2>
          <p className="resource-lead">
            Each resource is designed to reduce uncertainty: validate what matters, prioritize fixes, and keep evidence current.
          </p>

          <div className="resource-includes-grid">
            {(content?.includes ?? []).map(({ title, text }) => (
              <article className="resource-include-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
                <button
                  className="demo-btn resource-include-link"
                  type="button"
                  onClick={() => navigate("/register")}
                >
                  <span>Get This Resource</span>
                  <ArrowRight size={16} strokeWidth={2.4} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="resource-section alt">
          <div className="resource-kicker">Best for</div>
          <h2>Where this helps the most</h2>
          <div className="resource-pill-row">
            {(content?.useCases ?? []).map(({ icon: Icon, label }) => (
              <div className="resource-pill" key={label}>
                <Icon size={18} strokeWidth={2.2} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="resource-cta">
          <p className="resource-tagline">Discover Risks. Validate Threats. Strengthen Security.</p>
          <div className="resource-cta-actions">
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

