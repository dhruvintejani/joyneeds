// Verify these values before accepting orders or submitting for merchant review.
// Contact details below are retained from the existing repository, not invented.
const publicValue = (key: string, fallback = "") => {
  const value = import.meta.env[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

export const site = {
  brandName: "JoyNeeds",
  domain: publicValue("VITE_SITE_URL", "https://joyneeds.vercel.app").replace(/\/+$/, ""),
  supportEmail: publicValue("VITE_SUPPORT_EMAIL", "dhruvintejani.work@gmail.com"),
  businessEmail: publicValue("VITE_BUSINESS_EMAIL", "dhruvintejani.work@gmail.com"),
  phone: publicValue("VITE_SUPPORT_PHONE", "9913871759"),
  businessAddress: publicValue("VITE_BUSINESS_ADDRESS"),
  legalEntityName: publicValue("VITE_LEGAL_ENTITY_NAME"),
  socialLinks: [] as { label: string; url: string }[],
  shippingTimelines: publicValue("VITE_SHIPPING_TIMELINES"),
  shippingCoverage: publicValue("VITE_SHIPPING_COVERAGE"),
  returnWindow: publicValue("VITE_RETURN_WINDOW"),
  refundTimeline: publicValue("VITE_REFUND_TIMELINE"),
  cancellationWindow: publicValue("VITE_CANCELLATION_WINDOW"),
  shippingFee: null as number | null,
  catalogVerified: import.meta.env.VITE_CATALOG_VERIFIED === "true",
  policiesVerified: import.meta.env.VITE_POLICIES_VERIFIED === "true",
  // The backend enforces its own independent payment and order gates.
  checkoutEnabled: import.meta.env.VITE_CHECKOUT_ENABLED === "true",
};
export const pendingPolicy = "To be confirmed before orders open.";
