import { FaGithub, FaLinkedinIn, FaTwitter, FaYoutube } from "react-icons/fa";
import BrandLogo from "./BrandLogo";
import "./footer.css";

const footerGroups = [
  {
    title: "Product",
    links: ["Features", "How It Works", "Pricing", "Changelog"],
  },
  {
    title: "Solutions",
    links: ["Web Applications", "API Security", "Compliance", "Integrations"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Blog", "Security Guide", "Help Center"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Privacy Policy", "Terms of Service"],
  },
];

export default function Footer() {
  return (
    <footer className="ss-footer">
      <div className="ss-footer-brand">
        <BrandLogo className="ss-footer-logo" iconSize={24} />
        <p>AI-powered security scanning platform to protect your digital assets.</p>

        <div className="ss-footer-socials" aria-label="Social links">
          <button type="button" aria-label="Twitter" title="Twitter">
            <FaTwitter aria-hidden="true" />
          </button>
          <button type="button" aria-label="LinkedIn" title="LinkedIn">
            <FaLinkedinIn aria-hidden="true" />
          </button>
          <button type="button" aria-label="GitHub" title="GitHub">
            <FaGithub aria-hidden="true" />
          </button>
          <button type="button" aria-label="YouTube" title="YouTube">
            <FaYoutube aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="ss-footer-links">
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h4>{group.title}</h4>
            {group.links.map((link) => (
              <button key={link} type="button">
                {link}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="ss-footer-trust">
        <p>&copy; 2024 SecureScan. All rights reserved.</p>

        <div className="ss-footer-badges">
          <span>
            <i>ISO</i>
            <b>ISO 27001</b>
            <small>Certified</small>
          </span>
          <span>
            <i>GD</i>
            <b>GDPR</b>
            <small>Compliant</small>
          </span>
          <span>
            <i>S2</i>
            <b>SOC 2</b>
            <small>Type II</small>
          </span>
        </div>
      </div>
    </footer>
  );
}
