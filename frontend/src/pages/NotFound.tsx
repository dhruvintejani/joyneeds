import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { useCatalogStore } from "../store/catalogStore";
import { SectionHeading } from "../components/common/ReferenceUI";

export default function NotFound() {
  const products = useCatalogStore((state) => state.products);
  const recommendations = products.slice(0, 4);

  return (
    <div className="container reference-not-found section-bottom">
      <section className="reference-404-hero">
        <div className="reference-404-copy">
          <p className="reference-kicker">OOPS!</p>
          <strong className="reference-404-number">404</strong>
          <h1>Page Not Found</h1>
          <p>The page you’re looking for doesn’t seem to exist or may have been moved.</p>
          <div className="reference-404-actions">
            <Link className="button primary" to="/">Go to Homepage <ArrowRight size={17} /></Link>
            <Link className="button secondary" to="/shop">Browse All Products</Link>
          </div>
        </div>
        <div className="reference-404-art" aria-hidden="true">
          <img src="/reference/reference-home.webp" alt="" />
          <span className="reference-script">Good things are still ahead.</span>
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="reference-section">
          <SectionHeading title="You Might Like These" to="/shop" linkLabel="View all products" />
          <div className="product-grid reference-related-grid">
            {recommendations.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      <section className="reference-404-search">
        <div>
          <h2>Still can’t find what you’re looking for?</h2>
          <p>Try a product search or explore the full collection.</p>
        </div>
        <form action="/search" className="reference-404-search-form">
          <Search size={18} />
          <input name="q" type="search" placeholder="Search products…" aria-label="Search products" />
          <button className="button primary" type="submit">Search</button>
        </form>
      </section>
    </div>
  );
}
