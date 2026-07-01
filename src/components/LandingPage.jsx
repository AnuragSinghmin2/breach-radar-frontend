import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import Footer from "./Footer";
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
    icon: "scan",
    title: "Comprehensive Scanning",
    text: "Scan your entire web application for 1000+ security vulnerabilities with our advanced scanning engine.",
    tone: "green",
  },
  {
    icon: "doc",
    title: "Detailed Reports",
    text: "Get in-depth reports with actionable insights, fix recommendations, and risk assessment.",
    tone: "purple",
  },
  {
    icon: "chart",
    title: "Real-time Monitoring",
    text: "Continuous monitoring and instant alerts for new vulnerabilities and security threats.",
    tone: "blue",
  },
  {
    icon: "shield",
    title: "Easy Integration",
    text: "Seamlessly integrate with your existing CI/CD pipeline and development workflow.",
    tone: "yellow",
  },
  {
    icon: "team",
    title: "Team Management",
    text: "Manage your team, set permissions, security collaboration, and improve threats.",
    tone: "pink",
  },
  {
    icon: "compliance",
    title: "Compliance Ready",
    text: "Meet industry compliance standards with automated compliance checking and accurate.",
    tone: "cyan",
  },
];

const processSteps = [
  {
    number: "01",
    icon: "domain",
    title: "Add Your Domain",
    text: "Enter your domain and verify ownership using our simple verification methods.",
  },
  {
    number: "02",
    icon: "target",
    title: "Start Scanning",
    text: "Our AI-powered scanner analyzes your website for vulnerabilities.",
  },
  {
    number: "03",
    icon: "results",
    title: "Get Results",
    text: "Receive detailed reports with security score and vulnerability details.",
  },
  {
    number: "04",
    icon: "secure",
    title: "Fix & Secure",
    text: "Follow our recommendations to fix issues and secure your app/domain.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    desc: "Perfect for small websites",
    price: "99",
    suffix: "/mo",
    features: ["1 Domain Scan", "Basic Vulnerability Report", "Email Support", "PDF Export"],
    cta: "Get Started",
  },
  {
    name: "Professional",
    desc: "Great for growing businesses",
    price: "199",
    suffix: "/mo",
    features: ["10 Domain Scans", "Detailed Reports", "Priority Support", "API Access"],
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    desc: "For large organizations",
    price: "999",
    suffix: "/month",
    popular: true,
    features: [
      "Unlimited Scans",
      "Advanced Reports",
      "Real-time Monitoring",
      "Team Access",
      "API Access",
      "Priority Support",
    ],
    cta: "Get Started",
  },
  {
    name: "Custom",
    desc: "For your custom needs",
    price: "Contact Us",
    suffix: "",
    features: ["Custom Scans", "Dedicated Support", "SLA Guarantee", "Custom Integration"],
    cta: "Contact Sales",
    custom: true,
  },
];

const testimonials = [
  {
    quote:
      "SecureScan helped us identify critical vulnerabilities that could have been exploited. The reports are detailed and easy to understand.",
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

  function handleSectionClick(event, sectionId) {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `/#${sectionId}`);
  }

  return (
    <main className="scan-page">
      <div className="scan-shell">
        <nav className="navbar" aria-label="Primary navigation">
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
            <a href="#features" onClick={(event) => handleSectionClick(event, "features")}>
              Features
            </a>
            <a href="#how-it-works" onClick={(event) => handleSectionClick(event, "how-it-works")}>
              How It Works
            </a>
            <a href="#pricing" onClick={(event) => handleSectionClick(event, "pricing")}>
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
                <span className="proof-icon">✓</span>
                <strong>Accurate Scanning</strong>
                <small>Advanced detection engine</small>
              </div>
              <div>
                <span className="proof-icon amber">⚡</span>
                <strong>Fast &amp; Reliable</strong>
                <small>Scan websites in minutes</small>
              </div>
              <div>
                <span className="proof-icon yellow">🔒</span>
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
              {features.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <span className={`feature-icon ${feature.tone} ${feature.icon}`}>
                    <span></span>
                  </span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                    <a href="#">Learn more <span>+</span></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section" id="how-it-works" aria-labelledby="process-title">
          <div className="section-kicker">How It Works</div>
          <h2 id="process-title">Simple 4-Step Process</h2>
          <p>Get started with security scanning in minutes</p>

          <div className="process-grid">
            {processSteps.map((step) => (
              <article className="process-card" key={step.number}>
                <span className="step-badge">{step.number}</span>
                <span className={`process-icon ${step.icon}`}>
                  <span></span>
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
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

        <section className="newsletter-section" aria-label="Security insights subscription">
          <div className="mail-icon"></div>
          <div>
            <h2>Stay Updated with Security Insights</h2>
            <p>Get the latest security tips, vulnerability alerts, and product updates.</p>
          </div>
          <form className="subscribe-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}>
            <input type="email" placeholder="Enter your email address" aria-label="Email address" />
            <button className="start-btn" type="submit">
              Subscribe
            </button>
          </form>
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
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="GitHub">⌥</a>
                <a href="#" aria-label="YouTube">▶</a>
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
            <span>© 2025 Breach Radar. All rights reserved.</span>
            <span>Made with love for a more secure web</span>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
