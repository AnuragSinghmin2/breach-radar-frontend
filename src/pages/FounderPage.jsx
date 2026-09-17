import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Sparkles,
  Target,
  BookOpen,
  Map,
  MessageSquare,
  Telescope,
  ShieldCheck,
  Award,
  Globe,
  CheckCircle2,
  Quote,
  ArrowRight,
} from "lucide-react";
import { FaInstagram, FaFacebook, FaLinkedin, FaGlobe } from "react-icons/fa";
import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import "../components/LandingPage.css";
import "./AboutUsPage.css";
import "./FounderPage.css";

const journeySteps = [
  {
    step: "01",
    heading: "Small Village Roots & Early Curiosity",
    text: "I started my journey from a small village with a strong interest in computers and technology.",
  },
  {
    step: "02",
    heading: "Hands-on Learning & Ethical Hacking",
    text: "Over the years, I developed my skills in cybersecurity and ethical hacking through practical learning.",
  },
  {
    step: "03",
    heading: "A Decade of Security Excellence",
    text: "I have spent more than 10 years working in cybersecurity and vulnerability research.",
  },
  {
    step: "04",
    heading: "Responsible Bug Disclosure",
    text: "My work involved responsibly identifying and reporting security vulnerabilities.",
  },
  {
    step: "05",
    heading: "Real-World Business Insights",
    text: "This experience helped me understand the real security challenges faced by businesses.",
  },
  {
    step: "06",
    heading: "The Entrepreneurial Drive",
    text: "With an entrepreneurial approach, I started working towards building practical cybersecurity solutions.",
  },
  {
    step: "07",
    heading: "The Creation of PentestRadar",
    text: "This journey led to the development of PentestRadar.",
  },
  {
    step: "08",
    heading: "Global Vision from India",
    text: "Today, my vision is to build a trusted cybersecurity company from India for the global market.",
  },
];

export default function FounderPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="about-page founder-editorial-page">
      <div className="about-shell">
        <LandingNavbar />

        {/* HERO SECTION */}
        <section className="founder-hero-section">
          <div className="founder-hero-container">
            <div className="founder-hero-content">
              <div className="eyebrow">
                <ShieldCheck size={14} /> FROM THE FOUNDER
              </div>
              <h1>
                Built From Experience,
                <span> Built With </span>
                Purpose
              </h1>
              <p>
                A comprehensive look at the journey, vision, philosophy, and future roadmap of PentestRadar — directly from its founder.
              </p>

              <div className="founder-profile-info">
                <div className="profile-details">
                  <h3 className="founder-name">Mrityunjay Singh</h3>
                  <p className="founder-badge-text">Founder &amp; CEO • PentestRadar</p>
                </div>
                <div className="founder-stats-pill">
                  <Award size={18} className="stat-icon" />
                  <span>10+ Years Security Experience</span>
                </div>
              </div>
            </div>

            <div className="founder-hero-image-col">
              <div className="founder-image-card">
                <div className="founder-image-wrapper">
                  <img
                    src="/founder.jpg"
                    alt="Mrityunjay Singh - Founder & CEO of PentestRadar"
                    className="founder-portrait"
                  />
                  <div className="founder-image-glow"></div>
                  <div className="founder-image-badge">
                    <Globe size={16} />
                    <span>Global Vision</span>
                  </div>
                </div>

                {/* SOCIAL MEDIA LINKS UNDER FOUNDER IMAGE */}
                <div className="founder-social-links">
                  <a
                    href="https://in.linkedin.com/in/mrityunjay-singh-ceo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="founder-social-icon linkedin"
                    title="LinkedIn - Mrityunjay Singh"
                    aria-label="LinkedIn Profile"
                  >
                    <FaLinkedin />
                  </a>
                  <a
                    href="https://www.instagram.com/mrityunjayceo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="founder-social-icon instagram"
                    title="Instagram - @mrityunjayceo"
                    aria-label="Instagram Profile"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://www.facebook.com/dharnamrityunjay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="founder-social-icon facebook"
                    title="Facebook - Mrityunjay Singh"
                    aria-label="Facebook Profile"
                  >
                    <FaFacebook />
                  </a>
                  <a
                    href="https://mrityunjaysingh.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="founder-social-icon website"
                    title="Personal Website - mrityunjaysingh.com"
                    aria-label="Official Website"
                  >
                    <FaGlobe />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN DETAILED ARTICLE WRAPPER */}
        <div className="founder-article-wrapper">
          {/* 1. FOUNDER'S JOURNEY */}
          <section className="founder-detailed-block journey-block">
            <div className="section-kicker">01. NARRATIVE STORY</div>
            <h2 className="editorial-heading">Founder’s Journey</h2>
            <div className="editorial-lead">
              From humble beginnings to solving real-world cybersecurity challenges for businesses globally.
            </div>

            <div className="journey-timeline-editorial">
              {journeySteps.map(({ step, heading, text }) => (
                <div className="journey-editorial-item" key={step}>
                  <div className="journey-editorial-marker">
                    <span>{step}</span>
                  </div>
                  <div className="journey-editorial-body">
                    <h4>{heading}</h4>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. FOUNDER'S VISION */}
          <section className="founder-detailed-block">
            <div className="editorial-header">
              <div className="editorial-icon blue">
                <Eye size={24} />
              </div>
              <div>
                <span className="block-number">SECTION 01</span>
                <h2 className="editorial-title">1. Founder’s Vision</h2>
              </div>
            </div>

            <div className="editorial-content-box">
              <p className="editorial-text highlight-lead">
                My vision is to build a trusted cybersecurity company from India that makes professional security testing simple, affordable and accessible to businesses of every size.
              </p>
              <p className="editorial-text">
                I want to help create a digital ecosystem where security is considered an essential part of business growth, not just a technical requirement.
              </p>

              <div className="vision-highlights-grid">
                <div className="vision-pill">
                  <CheckCircle2 size={18} />
                  <span>Trusted Global Brand from India</span>
                </div>
                <div className="vision-pill">
                  <CheckCircle2 size={18} />
                  <span>Simple &amp; Affordable Testing</span>
                </div>
                <div className="vision-pill">
                  <CheckCircle2 size={18} />
                  <span>Security as Growth Driver</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. WHY PENTESTRADAR */}
          <section className="founder-detailed-block">
            <div className="editorial-header">
              <div className="editorial-icon green">
                <Sparkles size={24} />
              </div>
              <div>
                <span className="block-number">SECTION 02</span>
                <h2 className="editorial-title">2. Why PentestRadar</h2>
              </div>
            </div>

            <div className="editorial-content-box">
              <p className="editorial-text">
                PentestRadar was born from my practical experience in cybersecurity and vulnerability research. I saw that many startups and MSMEs need regular security testing but often face high costs, limited expertise and complex processes.
              </p>
              <p className="editorial-text">
                PentestRadar aims to make security testing more accessible through an easy-to-use technology platform.
              </p>

              <div className="problem-solution-callout">
                <div className="callout-col problem">
                  <h5>The Challenge in the Market</h5>
                  <p>Startups and MSMEs face sky-high pentesting costs, lack specialized in-house security teams, and struggle with bloated, complex evaluation processes.</p>
                </div>
                <div className="callout-col solution">
                  <h5>The PentestRadar Solution</h5>
                  <p>An intuitive, accessible, and automated technology platform that streamlines security scans and delivers actionable remediation guidance without friction.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. FOUNDER'S MISSION */}
          <section className="founder-detailed-block">
            <div className="editorial-header">
              <div className="editorial-icon purple">
                <Target size={24} />
              </div>
              <div>
                <span className="block-number">SECTION 03</span>
                <h2 className="editorial-title">3. Founder’s Mission</h2>
              </div>
            </div>

            <div className="editorial-content-box">
              <p className="editorial-text highlight-lead">
                Our mission is to help businesses identify vulnerabilities before they become serious security incidents.
              </p>
              <p className="editorial-text">
                We want to simplify security testing, provide clear risk information and help organisations continuously improve their digital security.
              </p>
            </div>
          </section>

          {/* 5. OUR PHILOSOPHY */}
          <section className="founder-detailed-block philosophy-block">
            <div className="editorial-header">
              <div className="editorial-icon red">
                <BookOpen size={24} />
              </div>
              <div>
                <span className="block-number">SECTION 04</span>
                <h2 className="editorial-title">4. Our Philosophy</h2>
              </div>
            </div>

            <div className="editorial-content-box">
              <div className="philosophy-quote-banner">
                <p>We believe <strong>security should be accessible to everyone</strong>.</p>
              </div>

              <p className="editorial-text">
                A small startup may not have a large cybersecurity team, but its website, application and customer data still need protection.
              </p>
              <p className="editorial-text">
                We focus on practical technology, responsible security practices, continuous improvement and building long-term trust with our users.
              </p>

              <div className="philosophy-pillars-list">
                <div className="pillar-item">
                  <span className="pillar-num">01</span>
                  <div>
                    <h6>Practical Technology</h6>
                    <p>Building real-world tools that deliver immediate, actionable value rather than theoretical noise.</p>
                  </div>
                </div>
                <div className="pillar-item">
                  <span className="pillar-num">02</span>
                  <div>
                    <h6>Responsible Security</h6>
                    <p>Adhering to ethical hacking standards, zero false-positive priorities, and safe vulnerability disclosures.</p>
                  </div>
                </div>
                <div className="pillar-item">
                  <span className="pillar-num">03</span>
                  <div>
                    <h6>Continuous Improvement</h6>
                    <p>Helping organizations maintain an evolving defense posture as technology environments grow.</p>
                  </div>
                </div>
                <div className="pillar-item">
                  <span className="pillar-num">04</span>
                  <div>
                    <h6>Long-term Trust</h6>
                    <p>Earning customer confidence through data protection, transparency, and dependable security results.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. THE ROAD AHEAD */}
          <section className="founder-detailed-block">
            <div className="editorial-header">
              <div className="editorial-icon blue">
                <Map size={24} />
              </div>
              <div>
                <span className="block-number">SECTION 05</span>
                <h2 className="editorial-title">5. The Road Ahead</h2>
              </div>
            </div>

            <div className="editorial-content-box">
              <p className="editorial-text">
                Our journey is focused on continuously improving PentestRadar and expanding its security capabilities.
              </p>
              <p className="editorial-text">
                We plan to strengthen automated testing, vulnerability management, monitoring, reporting and integrations while making the platform suitable for a wider range of businesses and applications.
              </p>

              <div className="roadmap-capabilities-grid">
                <div className="roadmap-cap-card">Automated Security Scans</div>
                <div className="roadmap-cap-card">Vulnerability Management</div>
                <div className="roadmap-cap-card">Continuous Monitoring</div>
                <div className="roadmap-cap-card">Comprehensive Reporting</div>
                <div className="roadmap-cap-card">Enterprise Integrations</div>
                <div className="roadmap-cap-card">Multi-Platform Protection</div>
              </div>
            </div>
          </section>

          {/* 7. FOUNDER'S MESSAGE */}
          <section className="founder-detailed-block message-featured-block">
            <div className="editorial-header">
              <div className="editorial-icon green">
                <MessageSquare size={24} />
              </div>
              <div>
                <span className="block-number">SECTION 06</span>
                <h2 className="editorial-title">6. Founder’s Message</h2>
              </div>
            </div>

            <div className="editorial-quote-box">
              <Quote size={40} className="quote-watermark" />
              <blockquote className="founder-personal-quote">
                “Over the years, I have seen how quickly a small security weakness can become a major problem. Through PentestRadar, my aim is to use my cybersecurity experience to build a practical solution that helps businesses find their security gaps early and take action before attackers do.”
              </blockquote>
              <div className="founder-signature-block">
                <div className="sig-details">
                  <span className="sig-name">Mrityunjay Singh</span>
                  <span className="sig-company">Founder &amp; CEO, PentestRadar</span>
                </div>
              </div>
            </div>
          </section>

          {/* 8. FUTURE VISION */}
          <section className="founder-detailed-block future-block">
            <div className="editorial-header">
              <div className="editorial-icon purple">
                <Telescope size={24} />
              </div>
              <div>
                <span className="block-number">SECTION 07</span>
                <h2 className="editorial-title">7. Future Vision</h2>
              </div>
            </div>

            <div className="editorial-content-box">
              <p className="editorial-text highlight-lead">
                Our long-term vision is to build a globally trusted cybersecurity platform from India.
              </p>
              <p className="editorial-text">
                We want PentestRadar to help startups, MSMEs and enterprises adopt continuous security practices and contribute towards building a safer and more secure digital future.
              </p>
            </div>
          </section>
        </div>

        {/* CTA BANNER */}
        <section className="about-cta">
          <p className="about-tagline">Discover Risks. Validate Threats. Strengthen Security.</p>
          <div className="about-cta-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              Start Scanning Now <ArrowRight size={16} style={{ marginLeft: "6px" }} />
            </button>
            <button className="demo-btn" type="button" onClick={() => navigate("/#pricing")}>
              <span>View Pricing</span>
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

