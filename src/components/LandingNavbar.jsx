import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Monitor,
  ShoppingBag,
  Code2,
  BookOpen,
  FileCode,
  BookMarked,
  Info,
  Briefcase,
  Mail,
} from "lucide-react";
import BrandLogo from "./BrandLogo";

const navDropdowns = [
  {
    title: "Solutions",
    items: [
      { icon: Monitor, title: "Web Applications", text: "Scan apps, portals, and dashboards" },
      { icon: ShoppingBag, title: "E-commerce", text: "Protect checkouts and storefronts" },
      { icon: Code2, title: "API Security", text: "Find risks across public APIs" },
    ],
  },
  {
    title: "Resources",
    items: [
      { icon: BookOpen, title: "Blog", text: "Security updates and product notes" },
      { icon: FileCode, title: "Documentation", text: "Guides, setup, and API reference" },
      { icon: BookMarked, title: "Security Guide", text: "Best practices for safer releases" },
    ],
  },
  {
    title: "Company",
    items: [
      { icon: Info, title: "About Us", text: "Meet the PentestRadar team", href: "/about" },
      { icon: Briefcase, title: "Careers", text: "Build security tools with us" },
      { icon: Mail, title: "Contact Us", text: "Talk to sales or support" },
    ],
  },
];

export default function LandingNavbar() {
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

  function handleMenuItemClick(event, href) {
    setOpenDropdown(null);
    if (!href) return;
    event.preventDefault();
    navigate(href);
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
              <div className="nav-menu">
                {dropdown.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <a
                      className="nav-menu-item"
                      href={item.href || "#"}
                      key={item.title}
                      onClick={(event) => handleMenuItemClick(event, item.href)}
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
