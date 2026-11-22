import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, FileCheck2, Headphones, Heart, PackageCheck, ShoppingBag } from "lucide-react";

export function TrustStrip() {
  const items = [
    { Icon: FileCheck2, title: "Details, clearly presented", text: "Know what you're browsing" },
    { Icon: ShoppingBag, title: "Your bag, your pace", text: "Saved on your browser" },
    { Icon: Heart, title: "Save the good finds", text: "Your favorites in one place" },
    { Icon: Headphones, title: "Need a hand?", text: "We're here for questions" },
  ];
  return <section className="reference-trust" aria-label="How JoyNeeds works"><div className="container reference-trust-grid">
    {items.map(({ Icon, title, text }) => (
      <div className="reference-trust-item" key={title}>
        <span className="reference-trust-icon"><Icon size={22} strokeWidth={1.6}/></span>
        <div><strong>{title}</strong><small>{text}</small></div>
      </div>
    ))}
  </div></section>;
}
export function NewsletterBand() {
  // Replace an inert email subscription form with a real, working contact CTA.
  return <section className="jn-contact-band"><div className="container jn-contact-band-inner">
    <div><p className="jn-overline">STAY CURIOUS</p><h2>Have something in mind?</h2><p>Need help finding a product or have a question about JoyNeeds?</p></div>
    <Link to="/contact" className="jn-button jn-button-light">Get in touch <ArrowUpRight size={19}/></Link>
  </div></section>;
}
export function PageBanner({ eyebrow, title, subtitle, compact = false }: { eyebrow?: string; title: string; subtitle?: string; compact?: boolean }) {
  return <section className={"reference-page-banner jn-page-banner" + (compact ? " compact" : "")}>
    <div className="reference-page-banner-copy">{eyebrow && <p className="jn-overline">{eyebrow}</p>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
    <div className="jn-page-banner-art" aria-hidden="true"><span className="jn-page-banner-disc"/><PackageCheck size={92} strokeWidth={.8}/><span>JOYNEEDS / EVERYDAY EDIT</span></div>
  </section>;
}
export function SectionHeading({ eyebrow, title, to, linkLabel = "View all" }: { eyebrow?: string; title: string; to?: string; linkLabel?: string }) {
  return <div className="reference-section-heading"><div>{eyebrow && <p className="jn-overline">{eyebrow}</p>}<h2>{title}</h2></div>
    {to && <Link to={to} className="reference-link">{linkLabel} <ArrowRight size={17}/></Link>}</div>;
}
