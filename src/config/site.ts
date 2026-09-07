// Verify these values before accepting orders or submitting for merchant review.
// Contact details below are retained from the existing repository, not invented.
export const site = {
  brandName: "JoyNeeds",
  domain: "https://joyneeds.vercel.app",
  supportEmail: "dhruvintejani.work@gmail.com",
  businessEmail: "dhruvintejani.work@gmail.com",
  phone: "9913871759",
  businessAddress: "",
  legalEntityName: "",
  socialLinks: [] as { label: string; url: string }[],
  shippingTimelines: "",
  shippingCoverage: "",
  returnWindow: "",
  refundTimeline: "",
  cancellationWindow: "",
  shippingFee: null as number | null,
  catalogVerified: false,
  policiesVerified: false,
  // This frontend has no order/payment service. Do not enable payments here.
  checkoutEnabled: false,
};
export const pendingPolicy = "To be confirmed before orders open.";
