import { apiClient } from "./client";

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
      return data?.plans || [];
    }
  } catch (err2) {
    console.error("[pricingService] Direct fetch also failed:", err2?.message);
  }

  return [];
}

export default {
  getPublicPricing
};
