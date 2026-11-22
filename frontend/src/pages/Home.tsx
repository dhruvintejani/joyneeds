import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, CarFront, CookingPot, Heart,
  House, MonitorSmartphone, PackageCheck, PawPrint, SearchCheck, Sparkles
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { Reveal, Skeleton } from "../components/common/UI";
import { useCatalogStore } from "../store/catalogStore";

const categoriesVisual = [
  { name: "Home & Kitchen", Icon: CookingPot, number: "01", tint: "oat", caption: "Tools for daily rituals" },
  { name: "Storage & Organization", Icon: House, number: "02", tint: "sage", caption: "Space to breathe" },
  { name: "Mobile & Desk", Icon: MonitorSmartphone, number: "03", tint: "blue", caption: "Made for your setup" },
  { name: "Car & Bike", Icon: CarFront, number: "04", tint: "clay", caption: "Everyday on the move" },
  { name: "Personal Care Accessories", Icon: Sparkles, number: "05", tint: "rose", caption: "A moment for yourself" },
  { name: "Pet & Everyday", Icon: PawPrint, number: "06", tint: "sand", caption: "Little daily comforts" },
] as const;
const editorialHome = "https://images.unsplash.com/photo-1759239572496-4ec13e7643d6?auto=format&fit=crop&w=1500&q=80";
const editorialLiving = "https://images.unsplash.com/photo-1585128792020-803d29415281?auto=format&fit=crop&w=1300&q=80";

export default function Home() {
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const status = useCatalogStore((state) => state.status);
  if (status === "idle" || status === "loading") return <Skeleton />;
  const featured = products.filter((product) => product.featured);
  const featuredProducts = (featured.length ? featured : products).slice(0, 8);
  const moreProducts = products.filter((product) => !featuredProducts.some((item) => item.id === product.id)).slice(0, 4);
  return (
    <div className="jn-storefront">
      <section className="jn-hero" aria-label="Discover JoyNeeds">
        <div className="container jn-hero-inner">
          <div className="jn-hero-copy">
            <p className="jn-overline"><span className="jn-overline-line" /> THE JOY OF EVERYDAY LIVING</p>
            <h1>Little things.<br /><em>Better days.</em></h1>
            <p className="jn-hero-lead">Discover the practical finds that make home, work and life in between feel a little easier.</p>
            <div className="jn-hero-actions">
              <Link to="/shop" className="jn-button jn-button-dark">Explore the collection <ArrowUpRight size={18} /></Link>
              <a className="jn-text-link" href="#collections">Browse categories <ArrowRight size={17} /></a>
            </div>
            <div className="jn-hero-meta"><span className="jn-hero-metadata-line" /><span>Useful by design.</span><span>Simple by nature.</span></div>
          </div>
          <div className="jn-hero-image">
            <img src={editorialHome} alt="Warm, naturally lit home kitchen with wood countertops" fetchPriority="high" decoding="async" onError={(event) => { event.currentTarget.src = "/reference/reference-home.webp"; }} />
            <div className="jn-photo-label"><span className="jn-label-circle"><Sparkles size={16}/></span><span>Made for the moments<br />in between.</span></div>
            <span className="jn-hero-image-index">01 / 03 — EVERYDAY EDIT</span>
          </div>
        </div>
      </section>
      <div className="container">
        <div className="jn-intro-benefits" aria-label="Shopping experience">
          <div><SearchCheck size={22}/><span><strong>Discover with ease</strong><small>Organized for everyday needs</small></span></div>
          <div><Heart size={22}/><span><strong>Keep your favorites</strong><small>Save what catches your eye</small></span></div>
          <div><BadgeCheck size={22}/><span><strong>Information first</strong><small>Clear product details</small></span></div>
        </div>
        <Reveal>
          <section className="jn-section jn-collection-section" id="collections">
            <div className="jn-section-heading">
              <div><p className="jn-overline">01 / EXPLORE</p><h2>Find your kind of <em>everyday.</em></h2></div>
              <Link className="jn-view-link" to="/shop">View the whole collection <ArrowUpRight size={18}/></Link>
            </div>
            <div className="jn-category-grid">
              {categories.map((category) => {
                const visual = categoriesVisual.find((entry) => entry.name === category.name);
                const Icon = visual?.Icon ?? House;
                return (
                  <Link className={"jn-category-tile jn-tint-" + (visual?.tint ?? "oat")} key={category.id} to={"/category/" + category.slug}>
                    <span className="jn-category-index">{visual?.number ?? "—"} / COLLECTION</span>
                    <div className="jn-category-art" aria-hidden="true"><span className="jn-category-art-glow" /><Icon size={64} strokeWidth={1.15}/></div>
                    <div className="jn-category-bottom"><span><strong>{category.name}</strong><small>{visual?.caption ?? "Explore the collection"}</small></span><ArrowUpRight size={20}/></div>
                  </Link>
                );
              })}
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="jn-section jn-featured-section">
            <div className="jn-section-heading">
              <div><p className="jn-overline">02 / THE EDIT</p><h2>Thoughtful finds for <em>real life.</em></h2></div>
              <Link className="jn-view-link" to="/shop">Shop all products <ArrowUpRight size={18}/></Link>
            </div>
            {featuredProducts.length ? (
              <div className="product-grid jn-product-grid">
                {featuredProducts.map((product) => <ProductCard product={product} key={product.id} />)}
              </div>
            ) : <div className="jn-empty-message">The collection will appear here when products are available.</div>}
          </section>
        </Reveal>
      </div>
      <Reveal>
        <section className="jn-editorial">
          <div className="container jn-editorial-layout">
            <div className="jn-editorial-visual">
              <img src={editorialLiving} alt="Bright minimalist living room with a wood sideboard and comfortable chair" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = "/reference/reference-home.webp"; }} />
              <span>THE EVERYDAY EDIT / JOYNEEDS</span>
            </div>
            <div className="jn-editorial-copy">
              <p className="jn-overline">A LITTLE MORE JOY</p>
              <h2>Space for the things <em>that matter.</em></h2>
              <p>It's the small, useful details that make a difference. Explore considered ideas for a home, desk and routine that work for you.</p>
              <Link className="jn-button jn-button-light" to="/shop">Browse everyday essentials <ArrowUpRight size={19}/></Link>
              <span className="jn-editorial-decor">EVERYDAY, MADE EASIER</span>
            </div>
          </div>
        </section>
      </Reveal>
      <div className="container">
        {moreProducts.length > 0 && <Reveal>
          <section className="jn-section jn-more-section">
            <div className="jn-section-heading">
              <div><p className="jn-overline">03 / KEEP EXPLORING</p><h2>There’s more to <em>discover.</em></h2></div>
              <Link className="jn-view-link" to="/shop">See everything <ArrowUpRight size={18}/></Link>
            </div>
            <div className="product-grid jn-product-grid">
              {moreProducts.map((product) => <ProductCard product={product} key={product.id} />)}
            </div>
          </section>
        </Reveal>}
        <Reveal>
          <section className="jn-values-section">
            <div><p className="jn-overline">THE JOYNEEDS APPROACH</p><h2>Shopping that feels <em>refreshingly simple.</em></h2></div>
            <div className="jn-values-grid">
              <article><span><SearchCheck size={23}/></span><h3>Easy to explore</h3><p>Find useful products with straightforward categories and filters.</p></article>
              <article><span><Heart size={23}/></span><h3>Keep it close</h3><p>Save favorites and return to your shopping bag whenever you like.</p></article>
              <article><span><PackageCheck size={23}/></span><h3>Details that matter</h3><p>Check available product information before making a decision.</p></article>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
