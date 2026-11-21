import { Link } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  CircleHelp,
  FileCheck2,
  Heart,
  Leaf,
  ShoppingBag,
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import ProductImage from "../components/common/ProductImage";
import { Reveal, Skeleton } from "../components/common/UI";
import { SectionHeading } from "../components/common/ReferenceUI";
import { useCatalogStore } from "../store/catalogStore";

export default function Home() {
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const status = useCatalogStore((state) => state.status);

  if (status === "idle" || status === "loading") return <Skeleton />;

  const featured = products.filter((product) => product.featured).slice(0, 8);
  const showProducts = featured.length ? featured : products.slice(0, 8);

  return (
    <div className="reference-home-page">
      <section className="reference-home-hero">
        <div className="container reference-home-hero-inner">
          <div className="reference-home-copy">
            <p className="reference-kicker">EVERYDAY ESSENTIALS</p>
            <h1>
              Make everyday
              <br />
              <span>feel effortless.</span>
            </h1>
            <p className="reference-hero-lead">
              Discover practical essentials for your home, workspace and everyday routines. Find what fits your life, all in one place.
            </p>
            <div className="reference-hero-actions">
              <Link className="button primary" to="/shop">
                Shop Now <ArrowRight size={18} />
              </Link>
              <a className="button secondary" href="#categories">
                Explore Categories
              </a>
            </div>
            <div className="reference-hero-points" aria-label="JoyNeeds features">
              <span><FileCheck2 size={20} /> Clear details</span>
              <span><ShoppingBag size={20} /> Guest shopping</span>
              <span><Heart size={20} /> Save favourites</span>
            </div>
          </div>

          <div className="reference-home-visual" aria-label="JoyNeeds lifestyle">
            <img src="/reference/reference-home.webp" alt="Calm home essentials setting" />
            <div className="reference-home-floating-card">
              <Leaf size={21} />
              <span>Small essentials.<br />A little more joy.</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <Reveal>
          <section className="reference-section" id="categories">
            <SectionHeading eyebrow="FIND YOUR ESSENTIALS" title="Shop by category" to="/shop" linkLabel="Explore all" />
            <div className="reference-category-cards">
              {categories.map((category) => {
                const firstProduct = products.find((product) => product.category === category.name);
                return (
                  <Link
                    className="reference-category-card"
                    key={category.id}
                    to={`/category/${category.slug}`}
                  >
                    <div className="reference-category-photo">
                      {firstProduct ? (
                        <ProductImage src={firstProduct.image} alt="" />
                      ) : (
                        <span><Boxes size={32} /></span>
                      )}
                    </div>
                    <div>
                      <strong>{category.name}</strong>
                      <span>{category.description || "Explore useful everyday picks"}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="reference-section">
            <SectionHeading
              eyebrow="A GOOD PLACE TO START"
              title="Featured Products"
              to="/shop?featured=1"
              linkLabel="Browse all"
            />
            {showProducts.length ? (
              <div className="product-grid reference-home-product-grid">
                {showProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="reference-empty-panel">Products will appear here when the catalog is available.</div>
            )}
          </section>
        </Reveal>

        <Reveal>
          <section className="reference-section">
            <SectionHeading eyebrow="DISCOVER MORE" title="Explore the collection" to="/shop" linkLabel="View all products" />
            <div className="jn-discovery-grid">
              {categories.slice(0, 3).map((category) => (
                <Link key={category.id} to={`/category/${category.slug}`} className="jn-discovery-tile">
                  <span className="jn-discovery-icon"><Boxes size={26} strokeWidth={1.5} /></span>
                  <span><strong>{category.name}</strong><small>{category.description || "Discover the collection"}</small></span>
                  <ArrowRight size={20} />
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="reference-story-band">
            <div className="reference-story-image" aria-hidden="true">
              <img src="/reference/reference-home.webp" alt="" />
            </div>
            <div className="reference-story-copy">
              <p className="reference-kicker">WHY JOYNEEDS</p>
              <h2>Less noise. More useful choices.</h2>
              <p>
                JoyNeeds is being built around clear product information, calm
                browsing and practical everyday finds — without fake urgency or
                exaggerated claims.
              </p>
              <Link className="button primary" to="/about">
                Our Story <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="reference-section">
            <SectionHeading eyebrow="SHOPPING, KEPT SIMPLE" title="Designed around real decisions" />
            <div className="reference-benefit-grid">
              {[
                {
                  Icon: FileCheck2,
                  title: "Details before decisions",
                  text: "See the product information we actually have, with missing details called out clearly.",
                },
                {
                  Icon: Heart,
                  title: "Keep your favourites",
                  text: "Save items to your browser and return to them without creating an account.",
                },
                {
                  Icon: CircleHelp,
                  title: "Questions are welcome",
                  text: "Policies, FAQs and contact options stay easy to reach throughout the site.",
                },
              ].map(({ Icon, title, text }) => (
                <article className="reference-benefit-card" key={title}>
                  <span><Icon size={24} /></span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
