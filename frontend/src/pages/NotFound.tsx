import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Compass, Search, Sparkles } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { useCatalogStore } from "../store/catalogStore";
import { SectionHeading } from "../components/common/ReferenceUI";

export default function NotFound() {
  const products = useCatalogStore((state) => state.products);
  const recommendations = products.slice(0, 4);

  return (
    <div className="container jn-404-page section-bottom">
      <nav className="jn-auth-breadcrumb" aria-label="Page navigation">
        <Link to="/"><ArrowLeft size={15}/> Home</Link><span>/</span><span>Page not found</span>
      </nav>
      <section className="jn-404-hero" aria-labelledby="not-found-title">
        <div className="jn-404-copy">
          <span className="jn-overline"><Sparkles size={15}/> A LITTLE DETOUR</span>
          <strong className="jn-404-number" aria-hidden="true">404<span>.</span></strong>
          <h1 id="not-found-title">This page has <em>wandered off.</em></h1>
          <p>We couldn't find the page you're looking for. Your next useful find could be just around the corner.</p>
          <div className="jn-404-actions">
            <Link className="jn-button jn-button-dark" to="/">Back to the homepage <ArrowRight size={17}/></Link>
            <Link className="jn-404-outline" to="/shop"><Compass size={17}/> Explore products</Link>
          </div>
          <form action="/search" method="get" className="jn-404-search">
            <Search size={19}/>
            <input type="search" name="q" aria-label="Search the JoyNeeds collection" placeholder="Or search the collection…" />
            <button type="submit" aria-label="Search products"><ArrowRight size={19}/></button>
          </form>
        </div>
        <div className="jn-404-visual" aria-hidden="true">
          <span className="jn-404-visual-note">LOST SOMETHING?</span>
          <span className="jn-404-visual-label">There’s more joy to discover.</span>
        </div>
      </section>
      {recommendations.length > 0 && (
        <section className="jn-404-recommendations">
          <SectionHeading eyebrow="STILL EXPLORING?" title="Some everyday finds worth a look" to="/shop" linkLabel="Explore all products" />
          <div className="product-grid reference-related-grid">
            {recommendations.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}
    </div>
  );
}
