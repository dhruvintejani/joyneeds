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
import { products, categories, categoryToSlug } from "../data/products";
import ProductCard from "../components/product/ProductCard";
import { site } from "../config/site";
const icons = [CookingPot, Boxes, Laptop, Car, Sparkles, PawPrint];
export default function Home() {
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const best = site.catalogVerified
    ? products.filter((p) => p.bestseller).slice(0, 4)
    : [];
  const arrivals = products.filter((p) => p.newArrival).slice(0, 4);
  return (
    <div className="container">
      <section className="hero">
        <div>
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
          {categories.map((cat, i) => {
            const Icon = icons[i] || Grid2X2;
            return (
              <Link
                className="category-tile"
                key={cat}
                to={"/category/" + categoryToSlug[cat]}
              >
                <Icon size={26} strokeWidth={1.5} />
                <span>{cat}</span>
                <ArrowRight size={16} />
              </Link>
            );
          })}
        </div>
      </section>
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
          {featured.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      </section>
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
      {[
        [best, "Best sellers"],
        [arrivals, "Just added"],
      ].map(([items, title]) => {
        const list = items as typeof products;
        return (
          list.length > 0 && (
            <section className="section" key={title as string}>
              <div className="section-heading">
                <h2>{title as string}</h2>
                <Link to="/shop" className="text-link">
                  Explore more
                </Link>
              </div>
              <div className="product-grid">
                {list.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )
        );
      })}
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
              <Icon size={23} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
