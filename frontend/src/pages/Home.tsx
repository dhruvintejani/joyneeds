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

  const featured = products.filter((product) => product.featured).slice(0, 5);
  const showProducts = featured.length ? featured : products.slice(0, 5);

  return (
    <div className="reference-home-page">
      <section className="reference-home-hero">
        <div className="container reference-home-hero-inner">
          <div className="reference-home-copy">
            <p className="reference-kicker">EVERYDAY ESSENTIALS</p>
            <h1>
              Useful finds for
              <br />
              <span>a better everyday.</span>
            </h1>
            <p className="reference-hero-lead">
              Thoughtfully presented products for home, work and daily life —
              with clear details and less shopping clutter.
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
            <SectionHeading title="Shop by Category" to="/shop" linkLabel="View all categories" />
            <div className="reference-category-cards">
              {categories.slice(0, 5).map((category) => {
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
