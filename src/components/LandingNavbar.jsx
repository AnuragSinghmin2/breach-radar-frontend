import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Code2,
  BookOpen,
  Info,
  Radar,
  ShieldAlert,
  Globe,
  ScanEye,
  TrendingUp,
  ClipboardCheck,
  FileText,
  FileSpreadsheet,
  FileCheck2,
  ListChecks,
  Award,
  HeartHandshake,
} from "lucide-react";
import BrandLogo from "./BrandLogo";

const navDropdowns = [
  {
    title: "Solutions",
    wide: true,
    items: [
      { icon: Radar, title: "Continuous Security Testing", text: "Ongoing scans that never sleep" },
      { icon: ShieldAlert, title: "Vulnerability Assessment", text: "Identify and rank real-world risks" },
      { icon: Globe, title: "Web Application Security", text: "Scan apps, portals, and dashboards" },
      { icon: Code2, title: "API Security Testing", text: "Find risks across public APIs" },
      { icon: ScanEye, title: "External Attack Surface Monitoring", text: "Track every exposed asset live" },
      { icon: TrendingUp, title: "Security Risk Prioritization", text: "Focus fixes on what matters most" },
      { icon: ClipboardCheck, title: "Compliance & Security Audits", text: "Stay audit-ready around the clock" },
    ],
  },
  {
    title: "Resources",
    wide: true,
    items: [
      { icon: FileText, title: "Product Brochure", text: "Overview of features and plans" },
      { icon: FileSpreadsheet, title: "Datasheets", text: "Technical specs at a glance" },
      { icon: FileCheck2, title: "Compliance Reports", text: "Audit-ready compliance summaries" },
      { icon: ListChecks, title: "Security Checklists", text: "Step-by-step hardening guides" },
      { icon: BookOpen, title: "Case Studies", text: "Real results from real customers" },
    ],
  },
  {
    title: "Company",
    items: [
      { icon: Info, title: "About Us", text: "Meet the PentestRadar team", href: "/about" },
      { icon: BookOpen, title: "Case Studies", text: "Real results from real customers" },
      { icon: Award, title: "Awards & Recognition", text: "Milestones we're proud of" },
      { icon: HeartHandshake, title: "Support", text: "Ways to back our mission", action: "support" },
    ],
  },
];

export default function LandingNavbar({ onOpenSupport }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [openDropdown, setOpenDropdown] = useState(null);
  const navLinksRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!navLinksRef.current?.contains(event.target)) {
        setOpenDropdown(null);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function goToSection(sectionId) {
    if (isHomePage) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", `/#${sectionId}`);
      return;
    }

    navigate(`/#${sectionId}`);
  }

  function handleSectionClick(event, sectionId) {
    event.preventDefault();
    setOpenDropdown(null);
    goToSection(sectionId);
  }

  function handleMenuItemClick(event, item) {
    setOpenDropdown(null);

    if (item.action === "support") {
      event.preventDefault();
      onOpenSupport?.();
      return;
    }

    if (!item.href) return;
    event.preventDefault();
    navigate(item.href);
  }

  function handleDropdownToggle(title) {
    setOpenDropdown((current) => (current === title ? null : title));
  }

  return (
    <nav className="navbar" aria-label="Primary navigation">
      <a
        className="brand"
        href="/"
        onClick={(event) => {
          event.preventDefault();
          setOpenDropdown(null);
          navigate("/");
        }}
      >
        <BrandLogo iconSize={26} />
      </a>

      <div className="nav-links" ref={navLinksRef}>
        <a href="#features" onClick={(event) => handleSectionClick(event, "features")}>
          Features
        </a>
        <a href="#how-it-works" onClick={(event) => handleSectionClick(event, "how-it-works")}>
          How It Works
        </a>
        <a href="#pricing" onClick={(event) => handleSectionClick(event, "pricing")}>
          Pricing
        </a>
        {navDropdowns.map((dropdown) => {
          const isOpen = openDropdown === dropdown.title;

          return (
            <div
              className={`nav-dropdown${isOpen ? " is-open" : ""}`}
              key={dropdown.title}
              onMouseEnter={() => setOpenDropdown(dropdown.title)}
              onMouseLeave={() =>
                setOpenDropdown((current) => (current === dropdown.title ? null : current))
              }
            >
              <button
                className="dropdown-trigger"
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => handleDropdownToggle(dropdown.title)}
              >
                {dropdown.title}
              </button>
              <div className={`nav-menu${dropdown.wide ? " is-wide" : ""}`}>
                {dropdown.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <a
                      className="nav-menu-item"
                      href={item.href || "#"}
                      key={item.title}
                      onClick={(event) => handleMenuItemClick(event, item)}
                    >
                      <span className="menu-icon">
                        <IconComponent size={18} strokeWidth={1.8} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.text}</small>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
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
  );
}