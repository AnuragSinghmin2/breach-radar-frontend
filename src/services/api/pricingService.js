import { apiClient } from "./client";

export const DEFAULT_FALLBACK_PLANS = [
  {
    _id: "plan-free",
    id: "plan-free",
    name: "Free",
    displayName: "Free",
    desc: "Perfect for individuals getting started with vulnerability scanning.",
    price: 0,
    rawPrice: 0,
    currency: "INR",
    billingInterval: "month",
    suffix: "/mo",
    popular: false,
    isPopular: false,
    cta: "Get Started Free",
    ctaText: "Get Started Free",
    features: [
      "1 User Seat",
      "1 Verified Domain",
      "2 Scans / month",
      "Basic Vulnerability Reports",
      "Community Support"
    ]
  },
  {
    _id: "plan-starter",
    id: "plan-starter",
    name: "Starter",
    displayName: "Starter",
    desc: "Ideal for small websites, developers & early-stage startups.",
    price: 999,
    rawPrice: 999,
    currency: "INR",
    billingInterval: "month",
    suffix: "/mo",
    popular: false,
    isPopular: false,
    cta: "Get Started",
    ctaText: "Get Started",
    features: [
      "3 User Seats",
      "5 Verified Domains",
      "30 Scans / month",
      "Email & Webhook Alerts",
      "Standard Support",
      "Basic API Access"
    ]
  },
  {
    _id: "plan-pro",
    id: "plan-pro",
    name: "Professional",
    displayName: "Professional",
    desc: "Comprehensive automated security for growing teams & modern SaaS.",
    price: 2999,
    rawPrice: 2999,
    currency: "INR",
    billingInterval: "month",
    suffix: "/mo",
    popular: true,
    isPopular: true,
    cta: "Get Started",
    ctaText: "Get Started",
    features: [
      "10 User Seats",
      "25 Verified Domains",
      "200 Scans / month",
      "Continuous Security Monitoring",
      "Full REST API Access",
      "Priority 24/7 Support",
      "Compliance Reports (OWASP / SOC 2)"
    ]
  },
  {
    _id: "plan-enterprise",
    id: "plan-enterprise",
    name: "Enterprise",
    displayName: "Enterprise",
    desc: "Custom security infrastructure, dedicated support & high scan scale.",
    price: 9999,
    rawPrice: 9999,
    currency: "INR",
    billingInterval: "month",
    suffix: "/mo",
    popular: false,
    isPopular: false,
    cta: "Get Started",
    ctaText: "Get Started",
    features: [
      "Unlimited User Seats",
      "Unlimited Domains",
      "Unlimited Scans",
      "Custom Scanning Agents",
      "SAML SSO & Role-Based Access",
      "Dedicated Technical Account Manager",
      "Custom Integrations & SLA"
    ]
  }
];

/**
 * Fetch public active subscription pricing plans for the landing page.
 */
export async function getPublicPricing() {
  try {
    const { data } = await apiClient.get("/pricing", {
      params: { _t: Date.now() },
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
    if (data && Array.isArray(data.plans) && data.plans.length > 0) {
      return data.plans;
    }
  } catch (err) {
    console.warn("[pricingService] apiClient.get('/pricing') failed, trying direct endpoint:", err?.message);
  }

  // Direct fetch fallback for production / local environments
  try {
    const response = await fetch(`/api/v1/pricing?_t=${Date.now()}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.plans) && data.plans.length > 0) {
        return data.plans;
      }
    }
  } catch (err2) {
    console.warn("[pricingService] Direct fetch failed, returning default plans:", err2?.message);
  }

  return DEFAULT_FALLBACK_PLANS;
}

export default {
  getPublicPricing,
  DEFAULT_FALLBACK_PLANS
};
