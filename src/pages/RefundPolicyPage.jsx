import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CreditCard,
  XCircle,
  Banknote,
  Scale,
  Gift,
  ShieldAlert,
  Clock,
  Mail,
} from "lucide-react";
import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import "../components/LandingPage.css";
import "./AboutUsPage.css";
import "./PrivacyPolicyPage.css";
import "./RefundPolicyPage.css";

const sections = [
  {
    icon: CreditCard,
    iconTone: "blue",
    title: "1. Subscription Services",
    body: (
      <>
        <p>
          PentestRadar provides subscription-based cybersecurity services, including continuous security
          assessment, vulnerability monitoring, reporting, and related platform features.
        </p>
        <p>
          By purchasing a subscription, you agree to the pricing, billing cycle, and terms applicable to your
          selected plan.
        </p>
      </>
    ),
  },
  {
    icon: XCircle,
    iconTone: "green",
    title: "2. Subscription Cancellation",
    body: (
      <>
        <p>
          Customers may cancel their subscription at any time through their account settings or by contacting
          our support team.
        </p>
        <p>Upon cancellation:</p>
        <ul>
          <li>Your subscription will remain active until the end of the current billing period.</li>
          <li>No additional charges will be applied after the current subscription term expires.</li>
          <li>Access to premium features may be discontinued upon subscription expiry.</li>
        </ul>
      </>
    ),
  },
  {
    icon: Banknote,
    iconTone: "red",
    title: "3. Refund Policy",
    body: (
      <>
        <p>
          Due to the nature of digital cybersecurity services, security assessments, cloud resources, and
          platform access, all subscription fees are generally non-refundable.
        </p>
        <p>Refunds will not be provided for:</p>
        <ul>
          <li>Partial subscription periods</li>
          <li>Unused services</li>
          <li>Change of mind</li>
          <li>Failure to use the platform</li>
          <li>Customer-side technical issues unrelated to PentestRadar</li>
        </ul>
      </>
    ),
  },
  {
    icon: Scale,
    iconTone: "purple",
    title: "4. Exceptional Refund Requests",
    body: (
      <>
        <p>
          Refund requests may be considered on a case-by-case basis under exceptional circumstances,
          including:
        </p>
        <ul>
          <li>Duplicate payment transactions</li>
          <li>Incorrect billing caused by a system error</li>
          <li>Service unavailability caused solely by PentestRadar for an extended period</li>
        </ul>
        <p>Approved refunds, if any, will be processed through the original payment method.</p>
      </>
    ),
  },
  {
    icon: Gift,
    iconTone: "green",
    title: "5. Free Trials and Promotional Offers",
    body: (
      <>
        <p>Where free trials or promotional access are offered:</p>
        <ul>
          <li>Users may cancel at any time before the trial period ends.</li>
          <li>
            Failure to cancel before the trial expiry may result in automatic conversion to a paid
            subscription if applicable.
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: ShieldAlert,
    iconTone: "red",
    title: "6. Account Suspension or Termination",
    body: (
      <>
        <p>PentestRadar reserves the right to suspend or terminate accounts that:</p>
        <ul>
          <li>Violate applicable laws</li>
          <li>Engage in unauthorized security testing</li>
          <li>Breach platform terms and conditions</li>
          <li>Misuse the service</li>
        </ul>
        <p>In such cases, refunds will not be issued.</p>
      </>
    ),
  },
  {
    icon: Clock,
    iconTone: "blue",
    title: "7. Refund Processing Time",
    body: (
      <p>
        Where a refund is approved, processing may take 7–15 business days depending on the payment provider,
        bank, or financial institution.
      </p>
    ),
  },
  {
    icon: Mail,
    iconTone: "green",
    title: "8. Contact Us",
    body: (
      <>
        <p className="policy-contact">
          <strong>PentestRadar Support</strong>
          <br />
          <br />
          Email: <a href="mailto:support@pentestradar.com">support@pentestradar.com</a>
          <br />
          Website: <a href="http://www.pentestradar.com">www.pentestradar.com</a>
        </p>
      </>
    ),
  },
];

const policyGroups = [
  {
    kicker: "Your Plan",
    heading: "Subscriptions and Cancellations",
    lead: "Understand how PentestRadar subscription services work and how you can cancel at any time.",
    sectionClass: "",
    items: sections.slice(0, 2),
  },
  {
    kicker: "Refunds",
    heading: "Refund Terms and Exceptions",
    lead: "Our refund policy reflects the digital nature of cybersecurity services, with limited exceptions where applicable.",
    sectionClass: "alt",
    items: sections.slice(2, 4),
  },
  {
    kicker: "Usage Terms",
    heading: "Trials, Promotions, and Account Access",
    lead: "Terms governing free trials, promotional offers, and account suspension or termination.",
    sectionClass: "",
    items: sections.slice(4, 6),
  },
  {
    kicker: "Support",
    heading: "Processing Times and Contact",
    lead: "Refund processing timelines and how to reach our support team for billing inquiries.",
    sectionClass: "alt",
    items: sections.slice(6),
    singleColumn: true,
  },
];

export default function RefundPolicyPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="about-page privacy-page refund-page">
      <div className="about-shell">
        <LandingNavbar />

        <section className="about-hero privacy-hero refund-hero">
          <div className="eyebrow">Cancellation and Refund Policy</div>
          <h1>
            Clear &amp; Fair
            <span> Refund Terms </span>
            for Every Plan
          </h1>
          <p className="privacy-updated">Last Updated: [Date]</p>
          <p>
            Thank you for choosing PentestRadar. This Cancellation and Refund Policy outlines the terms
            governing subscription cancellations, refunds, and account termination for our services.
          </p>
        </section>

        {policyGroups.map(({ kicker, heading, lead, sectionClass, items, singleColumn }) => (
          <section className={`about-section privacy-section refund-section ${sectionClass}`.trim()} key={kicker}>
            <div className="section-kicker">{kicker}</div>
            <h2>{heading}</h2>
            <p className="section-lead">{lead}</p>

            <div className={`about-grid privacy-grid refund-grid ${singleColumn ? "one" : "two"}`}>
              {items.map(({ icon: Icon, iconTone, title, body }) => (
                <article className="about-card policy-card refund-card" key={title}>
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

        <section className="about-cta privacy-cta refund-cta">
          <div className="about-icon green privacy-cta-icon">
            <ShieldCheck size={24} strokeWidth={2.2} />
          </div>
          <p className="about-tagline">
            By purchasing or using PentestRadar services, you acknowledge and agree to this Cancellation and
            Refund Policy.
          </p>
          <div className="about-cta-actions">
            <button className="start-btn" type="button" onClick={() => navigate("/register")}>
              View Plans
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
