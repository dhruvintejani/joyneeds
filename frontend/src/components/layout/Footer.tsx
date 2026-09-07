import { Link } from "react-router-dom";
import { useCatalogStore } from "../../store/catalogStore";
import { site } from "../../config/site";
import { NewsletterBand, TrustStrip } from "../common/ReferenceUI";

const help = [
  ["FAQ", "/faq"],
  ["Contact us", "/contact"],
  ["Shipping policy", "/shipping-policy"],
  ["Returns policy", "/return-policy"],
  ["Refunds & cancellation", "/refund-cancellation"],
] as const;

export default function Footer() {
  const categories = useCatalogStore((state) => state.categories);

  return (
    <>
      <TrustStrip />
      <NewsletterBand />
      <footer className="site-footer reference-footer">
        <div className="container reference-footer-grid">
          <div className="reference-footer-brand">
            <Link to="/" aria-label="JoyNeeds home">
              <img
                src="/brand/joyneeds-logo.png"
                alt="JoyNeeds"
                width={2048}
                height={682}
              />
            </Link>
            <p>
              Thoughtfully presented everyday essentials, with clear information
              and a calmer way to browse.
            </p>
            <a href={"mailto:" + site.supportEmail}>{site.supportEmail}</a>
          </div>

          <div className="reference-footer-column">
            <h2>Shop</h2>
            <Link to="/shop">All products</Link>
            {categories.slice(0, 5).map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>

          <div className="reference-footer-column">
            <h2>Customer Care</h2>
            {help.map(([label, to]) => (
              <Link key={to} to={to}>
                {label}
              </Link>
            ))}
          </div>

          <div className="reference-footer-column">
            <h2>About</h2>
            <Link to="/about">About us</Link>
            <Link to="/faq">Why JoyNeeds</Link>
            <Link to="/contact">Need help?</Link>
            <Link to="/privacy-policy">Privacy policy</Link>
            <Link to="/terms">Terms & conditions</Link>
          </div>

          <div className="reference-footer-note">
            <span className="reference-script">A little more joy, every day.</span>
            <p>Questions? We’re happy to help.</p>
            <a href={"mailto:" + site.supportEmail}>{site.supportEmail}</a>
          </div>
        </div>

        <div className="container reference-footer-bottom">
          <span>© {new Date().getFullYear()} JoyNeeds. All rights reserved.</span>
          <div>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/faq">Help</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
