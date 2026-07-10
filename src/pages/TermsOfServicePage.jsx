import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  FileCheck,
  Layers,
  Shield,
  User,
  CreditCard,
  Copyright,
  FileText,
  Ban,
  Lock,
  AlertTriangle,
  Scale,
  Activity,
  ShieldAlert,
  RefreshCw,
  MapPin,
  Mail,
} from "lucide-react";
import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import "../components/LandingPage.css";
import "./AboutUsPage.css";
import "./PrivacyPolicyPage.css";
import "./TermsOfServicePage.css";

const sections = [
  {
    icon: FileCheck,
    iconTone: "green",
    title: "1. Acceptance of Terms",
    body: (
      <>
        <p>
          By registering for an account, purchasing a subscription, or using PentestRadar, you acknowledge
          that you have read, understood, and agreed to these Terms and all applicable laws and regulations.
        </p>
        <p>If you do not agree with these Terms, you must not use our services.</p>
      </>
    ),
  },
  {
    icon: Layers,
    iconTone: "blue",
    title: "2. Description of Services",
    body: (
      <>
        <p>PentestRadar provides cybersecurity-related services, including but not limited to:</p>
        <ul>
          <li>Security assessments</li>
          <li>Vulnerability identification</li>
          <li>Attack surface monitoring</li>
          <li>Security reporting</li>
          <li>Risk assessment</li>
          <li>Security intelligence and related services</li>
        </ul>
        <p>Service features may change, improve, or be discontinued at our discretion.</p>
      </>
    ),
  },
  {
    icon: Shield,
    iconTone: "purple",
    title: "3. Authorized Use Only",
    body: (
      <>
        <p>
          Users may only use PentestRadar to assess digital assets that they own or are legally authorized
          to test.
        </p>
        <p>By initiating any security assessment, you represent and warrant that:</p>
        <ul>
          <li>You own the target assets; or</li>
          <li>You have obtained written authorization from the asset owner.</li>
        </ul>
        <p>Unauthorized testing of third-party systems is strictly prohibited.</p>
        <p>Users are solely responsible for ensuring compliance with applicable laws and regulations.</p>
      </>
    ),
  },
  {
    icon: User,
    iconTone: "green",
    title: "4. User Accounts",
    body: (
      <>
        <p>Users are responsible for:</p>
        <ul>
          <li>Maintaining account confidentiality</li>
          <li>Protecting login credentials</li>
          <li>All activities conducted under their account</li>
          <li>Providing accurate account information</li>
        </ul>
        <p>
          PentestRadar is not responsible for losses resulting from unauthorized account access caused by user
          negligence.
        </p>
      </>
    ),
  },
  {
    icon: CreditCard,
    iconTone: "blue",
    title: "5. Subscription and Billing",
    body: (
      <>
        <p>Certain services require a paid subscription.</p>
        <p>By purchasing a subscription, you agree to:</p>
        <ul>
          <li>Pay all applicable fees</li>
          <li>Maintain valid payment information</li>
          <li>Authorize recurring billing where applicable</li>
        </ul>
        <p>Subscription fees are subject to change with prior notice.</p>
      </>
    ),
  },
  {
    icon: Copyright,
    iconTone: "purple",
    title: "6. Intellectual Property",
    body: (
      <>
        <p>
          All platform content, software, designs, trademarks, logos, reports, technology, and materials are
          owned by PentestRadar or its licensors.
        </p>
        <p>Users may not:</p>
        <ul>
          <li>Copy</li>
          <li>Modify</li>
          <li>Reverse engineer</li>
          <li>Resell</li>
          <li>Redistribute</li>
          <li>Reproduce</li>
        </ul>
        <p>any part of the platform without prior written permission.</p>
      </>
    ),
  },
  {
    icon: FileText,
    iconTone: "green",
    title: "7. Security Assessment Results",
    body: (
      <>
        <p>
          Security findings, reports, recommendations, and risk assessments are provided for informational
          and security improvement purposes only.
        </p>
        <p>PentestRadar does not guarantee:</p>
        <ul>
          <li>Complete vulnerability detection</li>
          <li>Error-free operation</li>
          <li>Prevention of cyber incidents</li>
          <li>Regulatory compliance</li>
        </ul>
        <p>Security remains a shared responsibility between the platform and the customer.</p>
      </>
    ),
  },
  {
    icon: Ban,
    iconTone: "red",
    title: "8. Prohibited Activities",
    body: (
      <>
        <p>Users shall not:</p>
        <ul>
          <li>Use the platform for unlawful purposes</li>
          <li>Test systems without authorization</li>
          <li>Interfere with platform operations</li>
          <li>Attempt to gain unauthorized access</li>
          <li>Distribute malware or malicious content</li>
          <li>Abuse platform resources</li>
        </ul>
        <p>Violation may result in account suspension or termination.</p>
      </>
    ),
  },
  {
    icon: Lock,
    iconTone: "blue",
    title: "9. Confidentiality",
    body: (
      <>
        <p>
          PentestRadar will make reasonable efforts to protect confidential customer information and security
          assessment data.
        </p>
        <p>
          Users are responsible for safeguarding any reports or sensitive information generated through the
          platform.
        </p>
      </>
    ),
  },
  {
    icon: AlertTriangle,
    iconTone: "red",
    title: "10. Limitation of Liability",
    body: (
      <>
        <p>To the maximum extent permitted by law, PentestRadar shall not be liable for:</p>
        <ul>
          <li>Indirect damages</li>
          <li>Consequential damages</li>
          <li>Business interruption</li>
          <li>Loss of profits</li>
          <li>Loss of data</li>
          <li>Security incidents beyond our reasonable control</li>
        </ul>
        <p>
          Total liability shall not exceed the amount paid by the customer during the preceding twelve months.
        </p>
      </>
    ),
  },
  {
    icon: Scale,
    iconTone: "purple",
    title: "11. Indemnification",
    body: (
      <>
        <p>
          Users agree to indemnify and hold harmless PentestRadar, its officers, employees, and affiliates
          from any claims, liabilities, damages, or expenses arising from:
        </p>
        <ul>
          <li>Unauthorized testing activities</li>
          <li>Violation of these Terms</li>
          <li>Violation of applicable laws</li>
          <li>Misuse of the platform</li>
        </ul>
      </>
    ),
  },
  {
    icon: Activity,
    iconTone: "green",
    title: "12. Service Availability",
    body: (
      <>
        <p>
          While we strive to maintain reliable services, PentestRadar does not guarantee uninterrupted or
          error-free availability.
        </p>
        <p>
          Maintenance, upgrades, or unforeseen circumstances may result in temporary service interruptions.
        </p>
      </>
    ),
  },
  {
    icon: ShieldAlert,
    iconTone: "red",
    title: "13. Suspension and Termination",
    body: (
      <>
        <p>We reserve the right to suspend or terminate accounts that:</p>
        <ul>
          <li>Violate these Terms</li>
          <li>Engage in unauthorized activities</li>
          <li>Create security risks</li>
          <li>Abuse platform resources</li>
        </ul>
        <p>Termination may occur without prior notice in serious cases.</p>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    iconTone: "blue",
    title: "14. Privacy",
    body: (
      <p>
        Use of the platform is also governed by our Privacy Policy, which forms an integral part of these
        Terms.
      </p>
    ),
  },
  {
    icon: RefreshCw,
    iconTone: "green",
    title: "15. Changes to Terms",
    body: (
      <>
        <p>PentestRadar may modify these Terms at any time.</p>
        <p>
          Updated versions will be published on our website with a revised effective date. Continued use of
          the platform constitutes acceptance of updated Terms.
        </p>
      </>
    ),
  },
  {
    icon: MapPin,
    iconTone: "purple",
    title: "16. Governing Law and Jurisdiction",
    body: (
      <>
        <p>These Terms shall be governed by and construed in accordance with the laws of India.</p>
        <p>
          Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts
          located in Uttar Pradesh, India.
        </p>
      </>
    ),
  },
  {
    icon: Mail,
    iconTone: "green",
    title: "17. Contact Information",
    body: (
      <p className="policy-contact">
        <strong>PentestRadar</strong>
        <br />
        <br />
        Email: <a href="mailto:legal@pentestradar.com">legal@pentestradar.com</a>
        <br />
        Website: <a href="http://www.pentestradar.com">www.pentestradar.com</a>
      </p>
    ),
  },
];

const policyGroups = [
  {
    kicker: "Agreement",
    heading: "Acceptance and Services",
    lead: "These terms govern your access to PentestRadar and outline the cybersecurity services we provide.",
    sectionClass: "",
    items: sections.slice(0, 2),
  },
  {
    kicker: "Your Responsibilities",
    heading: "Authorized Use, Accounts, and Billing",
    lead: "Requirements for lawful platform use, account security, and subscription obligations.",
    sectionClass: "alt",
    items: sections.slice(2, 5),
  },
  {
    kicker: "Platform Rules",
    heading: "Intellectual Property, Results, and Conduct",
    lead: "Ownership rights, assessment limitations, prohibited activities, and confidentiality expectations.",
    sectionClass: "",
    items: sections.slice(5, 9),
  },
  {
    kicker: "Legal Protection",
    heading: "Liability, Indemnification, and Availability",
    lead: "Legal limitations, indemnification obligations, service availability, and account enforcement.",
    sectionClass: "alt",
    items: sections.slice(9, 13),
  },
  {
    kicker: "Policies & Contact",
    heading: "Privacy, Updates, and Governing Law",
    lead: "Related policies, terms updates, jurisdiction, and how to reach our legal team.",
    sectionClass: "",
    items: sections.slice(13),
    singleColumn: true,
  },
];

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="about-page privacy-page terms-page">
      <div className="about-shell">
        <LandingNavbar />

        <section className="about-hero privacy-hero terms-hero">
          <div className="eyebrow">Terms and Conditions</div>
          <h1>
            Terms and
            <span> Conditions </span>
            for Every User
          </h1>
          <p className="privacy-updated">Last Updated: [Date]</p>
          <p>
            Welcome to PentestRadar. These Terms and Conditions (&quot;Terms&quot;) govern your access to and
            use of the PentestRadar website, platform, products, and services. By accessing or using our
            services, you agree to be bound by these Terms.
          </p>
        </section>

        {policyGroups.map(({ kicker, heading, lead, sectionClass, items, singleColumn }) => (
          <section className={`about-section privacy-section terms-section ${sectionClass}`.trim()} key={kicker}>
            <div className="section-kicker">{kicker}</div>
            <h2>{heading}</h2>
            <p className="section-lead">{lead}</p>

            <div className={`about-grid privacy-grid terms-grid ${singleColumn ? "one" : "two"}`}>
              {items.map(({ icon: Icon, iconTone, title, body }) => (
                <article className="about-card policy-card terms-card" key={title}>
                  <div className={`about-icon ${iconTone}`}>
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <h3>{title}</h3>
                  <div className="policy-body">{body}</div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="about-cta privacy-cta terms-cta">
          <div className="about-icon green privacy-cta-icon">
            <ShieldCheck size={24} strokeWidth={2.2} />
          </div>
          <p className="about-tagline">
            By accessing or using PentestRadar, you acknowledge that you have read, understood, and agreed to
            these Terms and Conditions.
          </p>
          <div className="about-cta-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              Create Account
            </button>
            <button className="demo-btn" type="button" onClick={() => navigate("/privacy")}>
              <span>Privacy Policy</span>
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
