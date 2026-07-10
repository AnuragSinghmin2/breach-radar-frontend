import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import "../components/LandingPage.css";
import "./AboutUsPage.css";
import "./PrivacyPolicyPage.css";
import {
  ShieldCheck,
  ClipboardList,
  Settings2,
  Globe,
  Lock,
  Share2,
  Archive,
  BarChart2,
  UserCheck,
  ExternalLink,
  RefreshCw,
  Mail,
  Users,
} from "lucide-react";

const sections = [
  {
    icon: ClipboardList,
    iconTone: "blue",
    title: "1. Information We Collect",
    body: (
      <>
        <p>We may collect the following categories of information:</p>

        <h4>Personal Information</h4>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Organization name</li>
          <li>Billing information</li>
          <li>Account credentials</li>
        </ul>

        <h4>Technical Information</h4>
        <ul>
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Operating system</li>
          <li>Log data</li>
          <li>Usage statistics</li>
        </ul>

        <h4>Security Assessment Information</h4>
        <ul>
          <li>Domains submitted for verification</li>
          <li>Publicly accessible assets associated with verified domains</li>
          <li>Security assessment results</li>
          <li>Vulnerability reports</li>
          <li>Remediation records</li>
        </ul>

        <p>
          We do not intentionally collect sensitive personal information unless required to provide our
          services.
        </p>
      </>
    ),
  },
  {
    icon: Settings2,
    iconTone: "green",
    title: "2. How We Use Information",
    body: (
      <>
        <p>We use collected information to:</p>
        <ul>
          <li>Provide and improve our services</li>
          <li>Verify ownership of digital assets</li>
          <li>Perform security assessments</li>
          <li>Generate reports and recommendations</li>
          <li>Provide customer support</li>
          <li>Process payments and subscriptions</li>
          <li>Monitor platform performance and security</li>
          <li>Comply with legal obligations</li>
        </ul>
      </>
    ),
  },
  {
    icon: Globe,
    iconTone: "purple",
    title: "3. Domain Verification and Security Testing",
    body: (
      <>
        <p>
          PentestRadar performs security assessments only on assets that users have verified as owned or
          authorized by them.
        </p>
        <p>
          Users are solely responsible for ensuring they have appropriate authorization before initiating
          any security assessment through our platform.
        </p>
      </>
    ),
  },
  {
    icon: Lock,
    iconTone: "red",
    title: "4. Data Security",
    body: (
      <>
        <p>
          We implement appropriate technical and organizational measures to protect information against
          unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p>Security measures may include:</p>
        <ul>
          <li>Encryption of data in transit</li>
          <li>Access controls</li>
          <li>Secure infrastructure</li>
          <li>Monitoring and logging</li>
          <li>Regular security reviews</li>
        </ul>
        <p>
          While we strive to protect information, no method of transmission or storage can be guaranteed to
          be completely secure.
        </p>
      </>
    ),
  },
  {
    icon: Share2,
    iconTone: "blue",
    title: "5. Information Sharing",
    body: (
      <>
        <p>We do not sell personal information.</p>
        <p>We may share information with:</p>
        <ul>
          <li>Trusted service providers</li>
          <li>Payment processors</li>
          <li>Cloud infrastructure providers</li>
          <li>Legal authorities when required by law</li>
          <li>Business partners with user consent</li>
        </ul>
        <p>
          All third-party providers are expected to maintain appropriate security and confidentiality
          standards.
        </p>
      </>
    ),
  },
  {
    icon: Archive,
    iconTone: "green",
    title: "6. Data Retention",
    body: (
      <>
        <p>We retain information only for as long as necessary to:</p>
        <ul>
          <li>Provide services</li>
          <li>Fulfill contractual obligations</li>
          <li>Comply with legal requirements</li>
          <li>Resolve disputes</li>
          <li>Enforce agreements</li>
        </ul>
        <p>Assessment data and reports may be retained according to customer subscription requirements.</p>
      </>
    ),
  },
  {
    icon: BarChart2,
    iconTone: "purple",
    title: "7. Cookies and Analytics",
    body: (
      <>
        <p>Our website may use cookies and similar technologies to:</p>
        <ul>
          <li>Improve user experience</li>
          <li>Analyze website traffic</li>
          <li>Remember user preferences</li>
          <li>Enhance platform functionality</li>
        </ul>
        <p>Users may manage cookie preferences through browser settings.</p>
      </>
    ),
  },
  {
    icon: UserCheck,
    iconTone: "green",
    title: "8. User Rights",
    body: (
      <>
        <p>Subject to applicable laws, users may have the right to:</p>
        <ul>
          <li>Access personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of information</li>
          <li>Object to certain processing activities</li>
          <li>Withdraw consent where applicable</li>
        </ul>
        <p>Requests may be submitted using the contact information provided below.</p>
      </>
    ),
  },
  {
    icon: ExternalLink,
    iconTone: "blue",
    title: "9. Third-Party Services",
    body: (
      <>
        <p>
          Our platform may contain links to third-party websites or services. We are not responsible for
          the privacy practices or content of third-party platforms.
        </p>
        <p>Users are encouraged to review the privacy policies of those services independently.</p>
      </>
    ),
  },
  {
    icon: Users,
    iconTone: "purple",
    title: "10. Children's Privacy",
    body: (
      <p>
        PentestRadar services are not intended for individuals under the age of 18. We do not knowingly
        collect information from children.
      </p>
    ),
  },
  {
    icon: Globe,
    iconTone: "green",
    title: "11. International Data Transfers",
    body: (
      <p>
        Information may be processed and stored in locations where our service providers operate. We take
        reasonable measures to ensure appropriate protection of transferred information.
      </p>
    ),
  },
  {
    icon: RefreshCw,
    iconTone: "blue",
    title: "12. Changes to This Policy",
    body: (
      <>
        <p>
          We may update this Privacy Policy from time to time. Updated versions will be posted on our
          website with a revised effective date.
        </p>
        <p>Continued use of our services after updates constitutes acceptance of the revised policy.</p>
      </>
    ),
  },
  {
    icon: Mail,
    iconTone: "green",
    title: "13. Contact Us",
    body: (
      <>
        <p>For privacy-related questions or requests, please contact:</p>
        <p className="policy-contact">
          <strong>PentestRadar</strong>
          <br />
          Email: <a href="mailto:privacy@pentestradar.com">privacy@pentestradar.com</a>
          <br />
          Website: <a href="http://www.pentestradar.com">www.pentestradar.com</a>
        </p>
      </>
    ),
  },
];


export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="about-page privacy-page">
      <div className="about-shell">
        <LandingNavbar />

        <section className="about-hero privacy-hero">
          <div className="eyebrow">Privacy Policy</div>
          <h1>
            Your Privacy,
            <span> Protected </span>
            at Every Step
          </h1>
          <p className="privacy-updated">Last Updated: [07/07/2026]</p>
          <p>
            Welcome to PentestRadar. We value your privacy and are committed to protecting your personal
            information. This Privacy Policy explains how PentestRadar collects, uses, stores, and protects
            information when you access our website, platform, products, and services.
          </p>
        </section>

        {sections.map(({ title, body }) => (
          <section className="privacy-section simple-policy-section" key={title}>
            <h2>{title}</h2>
            <div className="policy-text">{body}</div>
          </section>
        ))}

        <section className="about-cta privacy-cta">
          <div className="about-icon green privacy-cta-icon">
            <ShieldCheck size={24} strokeWidth={2.2} />
          </div>
          <p className="about-tagline">
            By using PentestRadar, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <div className="about-cta-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              Get Started Securely
            </button>
            <button className="demo-btn" type="button" onClick={() => navigate("/about")}>
              <span>Learn About Us</span>
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
