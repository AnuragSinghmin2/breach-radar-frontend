import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, FileText, Activity, Zap, Users, ShieldCheck,
  Globe, Target, BarChart2, Lock,
  CheckCircle
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import Footer from "./Footer";
import LandingNavbar from "./LandingNavbar";
import "./LandingPage.css";

const metrics = [
  { label: "Critical", value: "03", tone: "red" },
  { label: "High", value: "07", tone: "amber" },
  { label: "Medium", value: "12", tone: "yellow" },
  { label: "Protected", value: "20", tone: "green" },
];

const rows = [
  ["Cross Site Scripting", "example.com", "Critical", "Open", "May 2026"],
  ["SQL Injection", "secure.app", "High", "Open", "May 2026"],
  ["Security Misconfiguration", "cloud-api.net", "Medium", "Fixed", "May 2026"],
  ["Missing Security Headers", "appshield.io", "Low", "Closed", "May 2026"],
];

const features = [
  {
    icon: Search,
    title: "Comprehensive Scanning",
    text: "Scan your entire web application for 1000+ security vulnerabilities with our advanced scanning engine.",
    tone: "green",
  },
  {
    icon: FileText,
    title: "Detailed Reports",
    text: "Get in-depth reports with actionable insights, fix recommendations, and risk assessment.",
    tone: "purple",
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    text: "Continuous monitoring and instant alerts for new vulnerabilities and security threats.",
    tone: "blue",
  },
  {
    icon: Zap,
    title: "Easy Integration",
    text: "Seamlessly integrate with your existing CI/CD pipeline and development workflow.",
    tone: "yellow",
  },
  {
    icon: Users,
    title: "Team Management",
    text: "Manage your team, set permissions, security collaboration, and improve threats.",
    tone: "pink",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Ready",
    text: "Meet industry compliance standards with automated compliance checking and accurate.",
    tone: "cyan",
  },
];

const processSteps = [
  {
    number: "01",
    icon: Globe,
    title: "Add Your Domain",
    text: "Enter your domain and verify ownership using our simple verification methods.",
  },
  {
    number: "02",
    icon: Target,
    title: "Start Scanning",
    text: "Our AI-powered scanner analyzes your website for vulnerabilities.",
  },
  {
    number: "03",
    icon: BarChart2,
    title: "Get Results",
    text: "Receive detailed reports with security score and vulnerability details.",
  },
  {
    number: "04",
    icon: Lock,
    title: "Fix & Secure",
    text: "Follow our recommendations to fix issues and secure your app/domain.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    desc: "Perfect for individuals getting started",
    price: "0",
    suffix: "/mo",
    features: ["1 User Seat", "1 Verified Domain", "2 Scans / month", "Basic Reports", "Community Support"],
    cta: "Get Started Free",
  },
  {
    name: "Starter",
    desc: "Perfect for small websites & startups",
    price: "999",
    suffix: "/mo",
    features: ["3 User Seats", "5 Verified Domains", "30 Scans / month", "Email Alerts", "Standard Support", "Basic API Access"],
    cta: "Get Started",
  },
  {
    name: "Professional",
    desc: "Great for growing businesses",
    price: "2,999",
    suffix: "/mo",
    popular: true,
    features: ["10 User Seats", "25 Verified Domains", "200 Scans / month", "Continuous Monitoring", "Full API Access", "Priority Support", "Compliance Reports"],
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    desc: "For large organizations",
    price: "9,999",
    suffix: "/mo",
    features: ["Unlimited User Seats", "Unlimited Domains", "Unlimited Scans", "Custom Scanning Agents", "SAML SSO Integration", "Dedicated TAM", "Custom Integrations"],
    cta: "Get Started",
  },
];

const testimonials = [
  {
    quote:
      "PentestRadar helped us identify critical vulnerabilities that could have been exploited. The reports are detailed and easy to understand.",
    name: "Rahul Sharma",
    role: "CTO, TechCorp",
    avatar: "RS",
  },
  {
    quote:
      "The best security scanning tool we've used. Fast, accurate, and the support team is fantastic.",
    name: "Priya Patel",
    role: "Security Head, DevStudio",
    avatar: "PP",
  },
  {
    quote:
      "Comprehensive scanning with actionable insights. Highly recommended for any business serious about security.",
    name: "Amit Kumar",
    role: "Founder, WebSecure",
    avatar: "AK",
  },
];

function DashboardMockup() {
  return (
    <div className="dashboard-wrap" aria-label="Security dashboard preview">
      <div className="dashboard-glow"></div>
      <div className="dashboard-card">
        <aside className="side-panel">
          <div className="side-brand">
            <BrandLogo iconSize={20} />
          </div>
          {["Dashboard", "Scans", "Reports", "Vulnerabilities", "Plugins", "Settings", "Integrations"].map(
            (item) => (
              <span className={item === "Dashboard" ? "active side-link" : "side-link"} key={item}>
                {item}
              </span>
            )
          )}
          <div className="plan-box">
            <small>Your Plan</small>
            <strong>Enterprise</strong>
            <span>2,485 scans left</span>
          </div>
        </aside>

        <div className="dash-main">
          <header className="dash-header">
            <div>
              <h2>Dashboard</h2>
              <span>Overview of your security posture</span>
            </div>
            <div className="dash-tools">
              <span className="search-dot"></span>
              <span className="alert-dot"></span>
              <div className="avatar">A</div>
              <div>
                <strong>Admin</strong>
                <small>Lead PM</small>
              </div>
            </div>
          </header>

          <div className="metric-grid">
            {metrics.map((metric) => (
              <article className={`metric ${metric.tone}`} key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.label === "Protected" ? "All clear" : "Need review"}</small>
              </article>
            ))}
          </div>

          <div className="dash-grid">
            <article className="score-panel">
              <div className="panel-head">
                <h3>Security Score</h3>
              </div>
              <div className="score-ring">
                <span>68</span>
                <small>/100</small>
              </div>
              <div className="score-note">
                <strong>Good</strong>
                <span>Your security score is better than 74% of similar websites.</span>
              </div>
            </article>

            <article className="chart-panel">
              <div className="panel-head">
                <h3>Scan Activity</h3>
                <span>60 Days</span>
              </div>
              <div className="chart">
                <svg viewBox="0 0 330 130" aria-hidden="true">
                  <defs>
                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#19e58b" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#19e58b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    className="area"
                    d="M0 104 C35 102 36 44 72 50 C105 57 102 96 139 82 C171 67 170 25 210 44 C243 61 239 68 269 54 C295 43 311 42 330 58 L330 130 L0 130 Z"
                  />
                  <path
                    className="line"
                    d="M0 104 C35 102 36 44 72 50 C105 57 102 96 139 82 C171 67 170 25 210 44 C243 61 239 68 269 54 C295 43 311 42 330 58"
                  />
                </svg>
              </div>
              <div className="chart-labels">
                <span>May 1</span>
                <span>May 15</span>
                <span>May 30</span>
                <span>Jun 15</span>
              </div>
            </article>
          </div>

          <article className="table-card">
            <div className="panel-head">
              <h3>Recent Vulnerabilities</h3>
              <span>View all</span>
            </div>
            <div className="vuln-table">
              {rows.map(([issue, domain, severity, status, date]) => (
                <div className="table-row" key={issue}>
                  <span>{issue}</span>
                  <span>{domain}</span>
                  <span className={`pill ${severity.toLowerCase()}`}>{severity}</span>
                  <span className={`state ${status.toLowerCase()}`}>{status}</span>
                  <span>{date}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sectionId = location.hash.replace("#", "");
    if (!sectionId) return;

    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [location.hash]);

  return (
    <main className="scan-page">
      <div className="scan-shell">
        <LandingNavbar />

        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">AI-powered security scanner</div>
            <h1>
              Find &amp; Fix Security
              <span> Vulnerabilities </span>
              Before Hackers Do
            </h1>
            <p>
              Automated vulnerability scanning for your web applications. Get detailed reports, fix
              issues faster, and secure your digital presence.
            </p>

            <div className="hero-actions">
              <button className="start-btn" type="button" onClick={() => navigate("/register")}>
                Start Scanning Now
              </button>
              <button className="demo-btn" type="button">
                <span>View Demo</span>
                <span className="play">▶</span>
              </button>
            </div>

            <div className="proof-grid">
              <div>
                <span className="proof-icon">
                  <CheckCircle size={18} color="#16e095" strokeWidth={2} />
                </span>
                <strong>Accurate Scanning</strong>
                <small>Advanced detection engine</small>
              </div>
              <div>
                <span className="proof-icon amber">
                  <Zap size={18} color="#f59e0b" strokeWidth={2} />
                </span>
                <strong>Fast &amp; Reliable</strong>
                <small>Scan websites in minutes</small>
              </div>
              <div>
                <span className="proof-icon yellow">
                  <Lock size={18} color="#eab308" strokeWidth={2} />
                </span>
                <strong>Secure &amp; Private</strong>
                <small>Your data is fully protected</small>
              </div>
            </div>
          </div>

          <DashboardMockup />
        </section>

        <section className="trusted" aria-label="Trusted by companies">
          <p>Trusted by 10,000+ companies worldwide</p>
          <div className="logos">
            <span>Fortune 500</span>
            <span>Startups</span>
            <span>Enterprises</span>
            <span>Agencies</span>
            <span>Dev Teams</span>
            <span>SaaS Companies</span>
          </div>
        </section>

        <section className="features-section" id="features" aria-labelledby="features-title">
          <div className="features-shell">
            <div className="section-kicker">Features</div>
            <h2 id="features-title">Everything You Need for Advanced Security</h2>
            <p>Powerful tools to identify, analyze, and fix security vulnerabilities</p>

            <div className="features-grid">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <article className="feature-card" key={feature.title}>
                    <span className={`feature-icon ${feature.tone}`}>
                      <IconComponent size={26} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="process-section" id="how-it-works" aria-labelledby="process-title">
          <div className="section-kicker">How It Works</div>
          <h2 id="process-title">Simple 4-Step Process</h2>
          <p>Get started with security scanning in minutes</p>

          <div className="process-grid">
            {processSteps.map((step) => {
              const IconComponent = step.icon;
              return (
                <article className="process-card" key={step.number}>
                  <span className="step-badge">{step.number}</span>
                  <span className="process-icon">
                    <IconComponent size={28} strokeWidth={1.8} />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="pricing-section" id="pricing" aria-labelledby="pricing-title">
          <div className="section-kicker">Pricing</div>
          <h2 id="pricing-title">Choose the Perfect Plan for You</h2>
          <p>Simple, transparent pricing. No hidden fees.</p>

          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article className={plan.popular ? "price-card popular" : "price-card"} key={plan.name}>
                {plan.popular && <span className="popular-badge">Most Popular</span>}
                <h3>{plan.name}</h3>
                <p>{plan.desc}</p>
                <div className={plan.custom ? "price custom-price" : "price"}>
                  {plan.custom ? (
                    <strong>{plan.price}</strong>
                  ) : (
                    <>
                      <span>₹</span>
                      <strong>{plan.price}</strong>
                      <small>{plan.suffix}</small>
                    </>
                  )}
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button
                  className={plan.custom ? "sales-btn" : "start-btn"}
                  type="button"
                  onClick={() => navigate("/register")}
                >
                  {plan.cta}
                </button>
              </article>
            ))}
          </div>

          <div className="pricing-notes">
            <span>30-Day Money Back Guarantee</span>
            <span>No Setup Fees</span>
            <span>Cancel Anytime</span>
          </div>
        </section>

        <section className="testimonials-section" aria-labelledby="testimonials-title">
          <div className="section-kicker">Testimonials</div>
          <h2 id="testimonials-title">What Our Customers Say</h2>

          <div className="testimonial-wrap">
            <button className="slider-btn prev" type="button" aria-label="Previous testimonial">
              &lt;
            </button>
            <div className="testimonial-grid">
              {testimonials.map((item) => (
                <article className="testimonial-card" key={item.name}>
                  <div className="stars">★★★★★</div>
                  <p>{item.quote}</p>
                  <div className="customer">
                    <span>{item.avatar}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.role}</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button className="slider-btn next" type="button" aria-label="Next testimonial">
              &gt;
            </button>
          </div>

          <div className="slider-dots" aria-hidden="true">
            <span></span>
            <span className="active"></span>
            <span></span>
          </div>
        </section>

        <div className="landing-footer-hidden" aria-hidden="true">
          <div className="footer-top">
            <div className="footer-brand">
              <a className="brand" href="/">
                <BrandLogo iconSize={22} />
              </a>
              <p>
                AI-powered vulnerability scanning platform helping businesses secure their digital
                assets.
              </p>
              <div className="social-links" aria-label="Social links">
                <a href="#" aria-label="Twitter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" aria-label="GitHub">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" aria-label="YouTube">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {[].map(([title, ...links]) => (
              <div className="footer-group" key={title}>
                <h3>{title}</h3>
                {links.map((link) => (
                  <a href="#" key={link}>
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <span>© 2025 PentestRadar. All rights reserved.</span>
            <span>Made with love for a more secure web</span>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}