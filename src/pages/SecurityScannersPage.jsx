import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import "../components/LandingPage.css";
import "./AboutUsPage.css";
import "./SecurityScannersPage.css";

const scannerCategories = [
  {
    title: "Authentication & Account Security",
    scanners: [
      { num: "01", name: "IDOR (Insecure Direct Object Reference)" },
      { num: "02", name: "Broken Authentication" },
      { num: "03", name: "OTP Bypass" },
      { num: "04", name: "Forgot Password Weakness" },
      { num: "05", name: "Password Reset Token Issues" },
      { num: "06", name: "Session Fixation" },
      { num: "07", name: "Session Hijacking" },
      { num: "08", name: "JWT Security Issues" },
      { num: "09", name: "MFA Bypass" },
      { num: "10", name: "Weak Password Policy" }
    ]
  },
  {
    title: "Authorization",
    scanners: [
      { num: "11", name: "Privilege Escalation" },
      { num: "12", name: "Missing Access Control" },
      { num: "13", name: "Horizontal Privilege Escalation" },
      { num: "14", name: "Vertical Privilege Escalation" }
    ]
  },
  {
    title: "Business Logic",
    scanners: [
      { num: "15", name: "Business Logic Flaws" },
      { num: "16", name: "Coupon / Discount Abuse" },
      { num: "17", name: "Payment Manipulation" },
      { num: "18", name: "Price Tampering" },
      { num: "19", name: "Race Condition" },
      { num: "20", name: "Duplicate Transaction" }
    ]
  },
  {
    title: "API Security",
    scanners: [
      { num: "21", name: "Broken Object Level Authorization (BOLA)" },
      { num: "22", name: "Broken Function Level Authorization (BFLA)" },
      { num: "23", name: "Excessive Data Exposure" },
      { num: "24", name: "Mass Assignment" },
      { num: "25", name: "API Rate Limit Issues" }
    ]
  },
  {
    title: "Cloud & Infrastructure",
    scanners: [
      { num: "26", name: "Exposed Admin Panels" },
      { num: "27", name: "Public Cloud Storage Exposure" },
      { num: "28", name: "Security Misconfiguration" },
      { num: "29", name: "Default Credentials" },
      { num: "30", name: "Sensitive Information Disclosure" }
    ]
  },
  {
    title: "File & Upload",
    scanners: [
      { num: "31", name: "Unrestricted File Upload" },
      { num: "32", name: "Path Traversal" },
      { num: "33", name: "Insecure File Download" }
    ]
  },
  {
    title: "Injection",
    scanners: [
      { num: "34", name: "SQL Injection" },
      { num: "35", name: "NoSQL Injection" },
      { num: "36", name: "Command Injection" },
      { num: "37", name: "SSTI" },
      { num: "38", name: "XXE" }
    ]
  },
  {
    title: "Client Side",
    scanners: [
      { num: "39", name: "Cross-Site Scripting (XSS)" },
      { num: "40", name: "Cross-Site Request Forgery (CSRF)" },
      { num: "41", name: "Open Redirect" },
      { num: "42", name: "Clickjacking" },
      { num: "43", name: "CORS Misconfiguration" }
    ]
  },
  {
    title: "SSRF & Network",
    scanners: [
      { num: "44", name: "SSRF" },
      { num: "45", name: "Host Header Injection" },
      { num: "46", name: "HTTP Request Smuggling" }
    ]
  },
  {
    title: "Information Disclosure",
    scanners: [
      { num: "47", name: "Directory Listing" },
      { num: "48", name: "Backup File Exposure" },
      { num: "49", name: "Git Repository Exposure" },
      { num: "50", name: "Debug Mode Enabled" }
    ]
  }
];

export default function SecurityScannersPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleOpenDemoReport = () => {
    window.open("/sample-report.pdf", "_blank", "noopener,noreferrer");
  };

  return (
    <main className="about-page scanners-page-main">
      <div className="about-shell">
        <LandingNavbar />

        <section className="about-hero scanners-hero">
          <div className="eyebrow">Security Scanners</div>
          <h1>
            50 Security Checks for Complete
            <span> Protection </span>
          </h1>
          <p className="scanners-subtitle">
            Comprehensive passive security checks designed to identify common web application and infrastructure vulnerabilities.
          </p>
          <div className="scanners-hero-actions">
            <button className="start-btn" type="button" onClick={handleOpenDemoReport}>
              View Sample Security Report
            </button>
            <button className="demo-btn" type="button" onClick={() => navigate("/register")}>
              <span>Get Started</span>
            </button>
          </div>
        </section>

        {/* 50 Scanners List Grid */}
        <section className="scanners-list-section">
          <div className="scanners-page-grid">
            {scannerCategories.map((cat) => (
              <div key={cat.title} className="scanners-page-cat-card">
                <h3>{cat.title}</h3>
                <ul>
                  {cat.scanners.map((s) => (
                    <li key={s.num}>
                      <span className="scanners-page-num">{s.num}.</span> {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
