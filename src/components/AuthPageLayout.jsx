import { useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import Footer from "./Footer";
import "./SignInPage.css";

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

const navDropdowns = [
  {
    title: "Solutions",
    items: [
      { icon: "web", title: "Web Applications", text: "Scan apps, portals, and dashboards" },
      { icon: "shop", title: "E-commerce", text: "Protect checkouts and storefronts" },
      { icon: "api", title: "API Security", text: "Find risks across public APIs" },
    ],
  },
  {
    title: "Resources",
    items: [
      { icon: "blog", title: "Blog", text: "Security updates and product notes" },
      { icon: "docs", title: "Documentation", text: "Guides, setup, and API reference" },
      { icon: "guide", title: "Security Guide", text: "Best practices for safer releases" },
    ],
  },
  {
    title: "Company",
    items: [
      { icon: "about", title: "About Us", text: "Meet the SecureScan team" },
      { icon: "careers", title: "Careers", text: "Build security tools with us" },
      { icon: "contact", title: "Contact Us", text: "Talk to sales or support" },
    ],
  },
];

export default function AuthPageLayout({ children }) {
  const navigate = useNavigate();

  function goToLandingSection(sectionId) {
    navigate(`/#${sectionId}`);
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <nav className="navbar auth-navbar" aria-label="Primary navigation">
          <a
            className="brand"
            href="/"
            onClick={(event) => {
              event.preventDefault();
              navigate("/");
            }}
          >
            <BrandLogo iconSize={22} />
          </a>

          <div className="nav-links">
            <a
              href="/#features"
              onClick={(event) => {
                event.preventDefault();
                goToLandingSection("features");
              }}
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              onClick={(event) => {
                event.preventDefault();
                goToLandingSection("how-it-works");
              }}
            >
              How It Works
            </a>
            <a
              href="/#pricing"
              onClick={(event) => {
                event.preventDefault();
                goToLandingSection("pricing");
              }}
            >
              Pricing
            </a>
            {navDropdowns.map((dropdown) => (
              <div className="nav-dropdown" key={dropdown.title}>
                <button className="dropdown-trigger" type="button">
                  {dropdown.title}
                </button>
                <div className="nav-menu">
                  {dropdown.items.map((item) => (
                    <a className="nav-menu-item" href="#" key={item.title}>
                      <span className={`menu-icon ${item.icon}`}></span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.text}</small>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="nav-actions">
            <button className="login" type="button" onClick={() => navigate("/login")}>
              Log in
            </button>
            <button className="start-btn small" type="button" onClick={() => navigate("/register")}>
              Get Started
            </button>
          </div>
        </nav>
      </header>

      <main className="signin-page">
        <section className="signin-info" aria-label="SecureScan overview">
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

      <Footer />
    </div>
  );
}
