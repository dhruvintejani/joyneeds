import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileCheck2,
  Headphones,
  Leaf,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

export function TrustStrip() {
  const items = [
    {
      Icon: FileCheck2,
      title: "Clear product details",
      text: "Useful information before you decide",
    },
    {
      Icon: PackageCheck,
      title: "Policies in one place",
      text: "Shipping and returns are easy to find",
    },
    {
      Icon: ShoppingBag,
      title: "Simple guest shopping",
      text: "Save your bag on this browser",
    },
    {
      Icon: Headphones,
      title: "Support when needed",
      text: "Questions are always welcome",
    },
  ];

  return (
    <section className="reference-trust" aria-label="JoyNeeds shopping features">
      <div className="container reference-trust-grid">
        {items.map(({ Icon, title, text }) => (
          <div className="reference-trust-item" key={title}>
            <span className="reference-trust-icon">
              <Icon size={24} strokeWidth={1.65} />
            </span>
            <div>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NewsletterBand() {
  return (
    <section className="reference-newsletter">
      <div className="container reference-newsletter-inner">
        <div className="reference-newsletter-copy">
          <span className="reference-newsletter-icon">
            <Leaf size={27} />
          </span>
          <div>
            <strong>Stay close to JoyNeeds</strong>
            <small>Product updates and email subscriptions will be enabled later.</small>
          </div>
        </div>
        <div className="reference-newsletter-form" aria-label="Newsletter preview">
          <input
            type="email"
            placeholder="Email updates coming soon"
            aria-label="Newsletter email preview"
            disabled
          />
          <button type="button" disabled aria-label="Newsletter is not enabled yet">
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="reference-script">A little more joy, every day.</div>
      </div>
    </section>
  );
}

export function PageBanner({
  eyebrow,
  title,
  subtitle,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <section className={`reference-page-banner ${compact ? "compact" : ""}`}>
      <div className="reference-page-banner-copy">
        {eyebrow && <p className="reference-kicker">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="reference-page-banner-art" aria-hidden="true">
        <img src="/reference/reference-home.webp" alt="" />
        <span className="reference-script">Small essentials. Better days.</span>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  to,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  to?: string;
  linkLabel?: string;
}) {
  return (
    <div className="reference-section-heading">
      <div>
        {eyebrow && <p className="reference-kicker">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {to && (
        <Link to={to} className="reference-link">
          {linkLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
