import { site, pendingPolicy } from "../config/site";
export type Policy = {
  title: string;
  intro: string;
  sections: { title: string; text: string }[];
};
const pending = (value: string) => value || pendingPolicy;
export const policies: Record<string, Policy> = {
  "privacy-policy": {
    title: "Privacy policy",
    intro: "How this version of JoyNeeds handles information.",
    sections: [
      {
        title: "Information you enter",
        text: "Checkout fields are validated in your browser and, when ordering is enabled, submitted to our order service to process your purchase. Contact enquiries are sent to our support inbox or passed to your email application, depending on service availability.",
      },
      {
        title: "How information is used",
        text: "We use contact details to respond to enquiries and, when ordering is enabled, to manage orders, fulfillment and service messages. Do not send passwords, payment credentials, or unnecessary sensitive information.",
      },
      {
        title: "Local storage and cookies",
        text: "Your cart, wishlist, and recently viewed product identifiers are stored locally on this browser to preserve your shopping preferences. Clear the site’s browser data to remove them. The application does not implement analytics or advertising cookies.",
      },
      {
        title: "Payments and third parties",
        text: "JoyNeeds uses hosted services for store infrastructure, customer authentication, image storage, transactional email and payment processing when configured. Payment details are handled through the selected payment provider; JoyNeeds verifies payment status server-side.",
      },
      {
        title: "Security and retention",
        text: "No system is completely secure. Avoid sharing sensitive information through email. Business retention periods and future order-data practices are awaiting confirmation before launch.",
      },
      {
        title: "Access, correction and deletion",
        text: "Contact the support email below for questions about information you have sent us or requests relating to it. Browser-only shopping preferences can be removed by clearing this site’s storage.",
      },
      {
        title: "Policy updates",
        text: "This page will be updated when functionality or data practices change. Review the current policy before supplying information.",
      },
    ],
  },
  terms: {
    title: "Terms & conditions",
    intro:
      "These draft terms describe the current frontend preview. They require business and legal review before sales begin.",
    sections: [
      {
        title: "Website use",
        text: "Use JoyNeeds lawfully. Do not attempt to interfere with the site or access information that is not intended for you.",
      },
      {
        title: "Products and pricing",
        text: "The existing catalog is being verified. Prices are displayed in Indian rupees. Product details, photos, availability, taxes and charges must be confirmed before any product is offered for sale.",
      },
      {
        title: "Orders and payments",
        text: "Adding an item to the bag does not place an order. When checkout is enabled, submitting your order creates a pending record; payment must be verified before confirmation. Final order acceptance terms require business review.",
      },
      {
        title: "Shipping, returns and refunds",
        text: "See the corresponding policy pages. Where a value is awaiting confirmation, it is not a delivery or refund commitment. Applicable consumer rights are not excluded by these drafts.",
      },
      {
        title: "Intellectual property and responsibilities",
        text: "Use site content only as permitted by its rights holder. Submit accurate information when making enquiries and do not send unlawful or harmful content.",
      },
      {
        title: "Limitations",
        text: "Availability of this preview is not guaranteed. Nothing in these draft terms is intended to limit rights or remedies that cannot lawfully be excluded.",
      },
      {
        title: "Changes and contact",
        text: "Terms will be reviewed before launch and updated as the service changes. Contact JoyNeeds with questions before relying on incomplete information.",
      },
    ],
  },
  "shipping-policy": {
    title: "Shipping policy",
    intro:
      "Shipping arrangements, delivery coverage and charges must be reviewed before checkout is enabled.",
    sections: [
      {
        title: "Processing and delivery",
        text: pending(site.shippingTimelines),
      },
      {
        title: "Coverage and shipping charges",
        text:
          pending(site.shippingCoverage) +
          " Shipping charges: " +
          (site.shippingFee === null
            ? pendingPolicy
            : "₹" + site.shippingFee + "."),
      },
      {
        title: "Tracking",
        text: "Tracking arrangements and supported carriers have not been finalized. Available tracking details will be disclosed when shipping is offered.",
      },
      {
        title: "Delays",
        text: "Transit time can depend on the destination and carrier. No delivery deadline is promised by this preview.",
      },
      {
        title: "Address issues and failed delivery",
        text: "Check your address before placing an order once ordering is available. Address changes, failed-delivery handling, redelivery and any applicable charges must be confirmed in the final policy.",
      },
    ],
  },
  "return-policy": {
    title: "Return policy",
    intro:
      "This draft must be finalized for the products actually offered. It does not override applicable consumer rights.",
    sections: [
      { title: "Return window", text: pending(site.returnWindow) },
      {
        title: "Eligibility and product condition",
        text: "Product-specific eligibility, condition requirements and exclusions are awaiting confirmation. Any change-of-mind conditions will be distinguished from remedies for defective, damaged, or incorrect goods.",
      },
      {
        title: "Non-returnable items",
        text: "No category exclusions have been finalized. Any applicable exclusions must be disclosed before a purchase, without removing mandatory rights.",
      },
      {
        title: "Damaged, defective or wrong products",
        text: "If ordering becomes available, contact support with the order reference and a description of the issue. Keep relevant photos where practical. The appropriate remedy depends on the issue and applicable rights.",
      },
      {
        title: "Requesting a return",
        text: "Contact support before sending anything back. The return address, shipping-cost responsibility, inspection process and available remedies must be confirmed before launch.",
      },
    ],
  },
  "refund-cancellation": {
    title: "Refund & cancellation policy",
    intro:
      "Cancellation and refund terms depend on the operational policies and applicable consumer rights. Review the details below.",
    sections: [
      {
        title: "Cancellation eligibility",
        text: pending(site.cancellationWindow),
      },
      {
        title: "Refund eligibility",
        text: "Eligibility and remedies must be assessed consistently with the final product policy and applicable consumer rights. This draft does not introduce a blanket no-refund rule.",
      },
      { title: "Refund processing", text: pending(site.refundTimeline) },
      {
        title: "Refund method and payment-provider time",
        text: "The refund method and bank or payment-provider processing estimates will be disclosed when the payment service is connected. No gateway processing time is promised in this preview.",
      },
      {
        title: "Failed or duplicate payments",
        text: "If a payment fails, stays pending or appears duplicated, contact support and your payment provider before attempting another payment. Never share your PIN, OTP or full card details.",
      },
      {
        title: "Request process",
        text: "Contact support with the order or transaction reference, when applicable. Do not send products to an unconfirmed return address.",
      },
    ],
  },
};
export const faqs = [
  [
    "Can I order right now?",
    "You can browse and save products. Checkout is available only when the store and payment service are enabled; check the checkout page for current availability.",
  ],
  [
    "Do I need an account?",
    "No. Guest checkout is supported when ordering is enabled. Customer accounts can sync order history and cart when configured. Your wishlist remains on this browser.",
  ],
  ["Where do you deliver?", pending(site.shippingCoverage)],
  ["How long does delivery take?", pending(site.shippingTimelines)],
  [
    "Can I return a product?",
    pending(site.returnWindow) +
      " Please read the return policy for the current status.",
  ],
  [
    "How do cancellations and refunds work?",
    pending(site.cancellationWindow) +
      " Refund processing: " +
      pending(site.refundTimeline),
  ],
  [
    "Which payment methods are available?",
    "Available payment methods are shown at checkout according to the active payment provider and merchant settings.",
  ],
  [
    "Are all catalog details confirmed?",
    "The existing catalog is awaiting final product and photo verification. Contact us if you need details before launch.",
  ],
  [
    "Will my bag stay saved?",
    "Yes, on this browser when local storage is available. Clearing site data removes your saved bag, wishlist and recently viewed products.",
  ],
];
