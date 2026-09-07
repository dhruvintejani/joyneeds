import { Link } from "react-router-dom";
import {
  ArrowRight,
  Grid2X2,
  Heart,
  ListChecks,
  MessageCircle,
  CookingPot,
  Boxes,
  Laptop,
  Car,
  Sparkles,
  PawPrint,
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { Reveal, Skeleton } from "../components/common/UI";
import { site } from "../config/site";
import { useCatalogStore } from "../store/catalogStore";

const icons = [CookingPot, Boxes, Laptop, Car, Sparkles, PawPrint];

export default function Home() {
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const status = useCatalogStore((state) => state.status);
  const featured = products.filter((product) => product.featured).slice(0, 8);
  const best = site.catalogVerified
    ? products.filter((product) => product.bestseller).slice(0, 4)
    : [];
  const arrivals = products.filter((product) => product.newArrival).slice(0, 4);

  if (status === "idle" || status === "loading") return <Skeleton />;

  return (
    <div className="container">
      <Reveal>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">THE EVERYDAY EDIT</p>
            <h1>
              Little finds.
              <br />
              <span>Better everyday.</span>
            </h1>
            <p>
              Useful essentials for your home, your workspace, and all the moments
              in between.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/shop">
                Explore the collection <ArrowRight size={18} />
              </Link>
              <a className="text-link" href="#categories">
                Shop by category
              </a>
            </div>
            <div className="hero-meta" aria-label="JoyNeeds shopping features">
              <span>Clear product details</span>
              <span>Guest shopping</span>
              <span>Saved on your browser</span>
            </div>
          </div>
          <div className="hero-brand">
            <img
              src="/brand/joyneeds-logo.png"
              alt="JoyNeeds — everyday essentials"
              width={2048}
              height={682}
              fetchPriority="high"
            />
            <div className="hero-note">
              <span>HOME · WORK · LIFE</span>
              <p>Find what fits your day.</p>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section categories-section" id="categories">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MAKE ROOM FOR USEFUL</p>
              <h2>What’s on your list?</h2>
            </div>
            <Link to="/shop" className="text-link">
              Browse all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => {
              const Icon = icons[index] || Grid2X2;
              return (
                <Link
                  className="category-tile"
                  key={category.id}
                  to={"/category/" + category.slug}
                >
                  <span className="category-icon">
                    <Icon size={25} strokeWidth={1.55} />
                  </span>
                  <span>{category.name}</span>
                  <ArrowRight size={16} />
                </Link>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A GOOD PLACE TO START</p>
              <h2>The featured edit</h2>
            </div>
            <Link to="/shop?featured=1" className="text-link">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="discovery-band">
          <div>
            <p className="eyebrow">LESS CLUTTER. MORE CLARITY.</p>
            <h2>A place for everything.</h2>
            <p>
              Explore storage and organization for the spaces you use every day.
            </p>
          </div>
          <Link to="/category/storage-organization" className="button secondary">
            Discover storage <ArrowRight size={18} />
          </Link>
        </section>
      </Reveal>

      {[
        [best, "Best sellers"],
        [arrivals, "Just added"],
      ].map(([items, title]) => {
        const list = items as typeof products;
        return (
          list.length > 0 && (
            <Reveal key={title as string}>
              <section className="section">
                <div className="section-heading">
                  <h2>{title as string}</h2>
                  <Link to="/shop" className="text-link">
                    Explore more
                  </Link>
                </div>
                <div className="product-grid">
                  {list.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            </Reveal>
          )
        );
      })}

      <Reveal>
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SHOPPING, KEPT SIMPLE</p>
              <h2>A little less searching.</h2>
            </div>
            <Link className="text-link" to="/about">
              Meet JoyNeeds <ArrowRight size={16} />
            </Link>
          </div>
          <div className="benefit-grid">
            {[
              {
                Icon: ListChecks,
                title: "Details before decisions",
                text: "Compare prices, features, and product information in one place.",
              },
              {
                Icon: Heart,
                title: "Keep your favourites",
                text: "Save your finds and come back to them on this browser.",
              },
              {
                Icon: MessageCircle,
                title: "Questions are welcome",
                text: "Find our contact details and shopping policies whenever you need them.",
              },
            ].map(({ Icon, title, text }) => (
              <div className="benefit" key={title}>
                <span className="benefit-icon">
                  <Icon size={22} strokeWidth={1.55} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
