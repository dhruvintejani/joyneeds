import { Link } from "react-router-dom";
import { site } from "../../config/site";
import { categories, categoryToSlug } from "../../data/products";
const help = [
  ["FAQ", "/faq"],
  ["Contact us", "/contact"],
  ["Shipping", "/shipping-policy"],
  ["Returns", "/return-policy"],
  ["Refunds & cancellation", "/refund-cancellation"],
];
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" aria-label="JoyNeeds home">
            <img
              src="/brand/joyneeds-logo.png"
              alt="JoyNeeds"
              width={2048}
              height={682}
            />
          </Link>
          <p>
            Everyday needs.
            <br />A little more joy.
          </p>
          <a href={"mailto:" + site.supportEmail}>{site.supportEmail}</a>
        </div>
        <div>
          <h2>Discover</h2>
          <Link to="/shop">All products</Link>
          {categories.map((cat) => (
            <Link key={cat} to={"/category/" + categoryToSlug[cat]}>
              {cat}
            </Link>
          ))}
        </div>
        <div>
          <h2>Here to help</h2>
          {help.map(([name, to]) => (
            <Link to={to} key={to}>
              {name}
            </Link>
          ))}
        </div>
        <div>
          <h2>JoyNeeds</h2>
          <Link to="/about">Our story</Link>
          <Link to="/privacy-policy">Privacy policy</Link>
          <Link to="/terms">Terms & conditions</Link>
          {site.socialLinks
            .filter((s) => /^https:\/\//.test(s.url))
            .map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </a>
            ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} JoyNeeds</span>
        <span>Simple choices for daily life.</span>
      </div>
    </footer>
  );
}
