import { Link, useNavigate } from "react-router-dom";
import { FaGithub, FaLinkedinIn, FaTwitter, FaYoutube } from "react-icons/fa";
import BrandLogo from "./BrandLogo";
import "./footer.css";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", path: "/#features" },
      { label: "How It Works", path: "/#how-it-works" },
      { label: "Pricing", path: "/#pricing" },
      { label: "Changelog", path: "/#changelog" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Web Applications", path: "/#solutions" },
      { label: "API Security", path: "/#solutions" },
      { label: "Compliance", path: "/#solutions" },
      { label: "Integrations", path: "/#integrations" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", path: "/#documentation" },
      { label: "Blog", path: "/#blog" },
      { label: "Security Guide", path: "/#guide" },
      { label: "Help Center", path: "/#help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", path: "/about" },
      { label: "Refund Policy", path: "/refund-policy" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms-of-service" },
    ],
  },
];

export default function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="ss-footer">
      <div className="ss-footer-brand">
        <BrandLogo className="ss-footer-logo" iconSize={24} />

        <p>
          AI-powered security scanning platform to protect your digital assets.
        </p>

        <div className="ss-footer-socials" aria-label="Social links">
          <button type="button" aria-label="Twitter" title="Twitter">
            <FaTwitter />
          </button>

          <button type="button" aria-label="LinkedIn" title="LinkedIn">
            <FaLinkedinIn />
          </button>

          <button type="button" aria-label="GitHub" title="GitHub">
            <FaGithub />
          </button>

          <button type="button" aria-label="YouTube" title="YouTube">
            <FaYoutube />
          </button>
        </div>
      </div>

      <div className="ss-footer-links">
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h4>{group.title}</h4>

            {group.links.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavigation(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="ss-footer-trust">
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

        <p>&copy; 2026 PentestRadar. All rights reserved.</p>
      </div>
    </footer>
  );
}
