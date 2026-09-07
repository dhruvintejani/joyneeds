import { ArrowRight, FileCheck2, Heart, Leaf, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../components/common/UI";
import { PageBanner } from "../components/common/ReferenceUI";

export default function About() {
  return (
    <div className="container reference-about-page section-bottom">
      <Breadcrumb items={[{ label: "About us" }]} />
      <PageBanner
        eyebrow="ABOUT JOYNEEDS"
        title="Everyday essentials, thoughtfully presented."
        subtitle="JoyNeeds is being built around a simple idea: make useful products easier to discover without making shopping feel noisy or complicated."
      />

      <section className="reference-about-values">
        {[
          {
            Icon: FileCheck2,
            title: "Clarity first",
            text: "Product information should be easy to read, compare and understand.",
          },
          {
            Icon: Leaf,
            title: "Calm shopping",
            text: "A clean experience that helps you focus on what is actually useful.",
          },
          {
            Icon: Heart,
            title: "Made for real life",
            text: "Everyday finds for home, work and the small moments in between.",
          },
          {
            Icon: Sparkles,
            title: "No fake urgency",
            text: "No invented reviews, countdowns or exaggerated claims just to force a decision.",
          },
        ].map(({ Icon, title, text }) => (
          <article key={title}>
            <span><Icon size={23} /></span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="reference-about-story">
        <div>
          <p className="reference-kicker">OUR APPROACH</p>
          <h2>Making everyday shopping simpler, clearer and more useful.</h2>
          <p>
            JoyNeeds is designed around practical browsing. We want product pages to answer the
            questions that matter, policies to be easy to find, and saved products to stay close
            without forcing you to create an account.
          </p>
          <p>
            The store is still being prepared for launch. That means business-specific policy,
            shipping and catalog details remain clearly marked until they are confirmed.
          </p>
          <Link className="button primary" to="/shop">
            Shop Our Collection <ArrowRight size={17} />
          </Link>
        </div>
        <div className="reference-about-image" aria-hidden="true">
          <img src="/reference/reference-home.webp" alt="" />
          <span className="reference-script">Small essentials. Better everyday.</span>
        </div>
      </section>

      <section className="reference-about-why">
        <div>
          <p className="reference-kicker">WHY JOYNEEDS</p>
          <h2>More than a product grid.</h2>
          <p>
            The goal is a trustworthy storefront where the interface feels polished while the
            information stays honest about what is and is not confirmed yet.
          </p>
        </div>
        <div className="reference-about-why-grid">
          <article><strong>Useful details</strong><span>Clear descriptions and specifications where available.</span></article>
          <article><strong>Saved favourites</strong><span>Wishlist and recently viewed products stay on your browser.</span></article>
          <article><strong>Accessible support</strong><span>Contact, FAQ and policy links remain easy to reach.</span></article>
          <article><strong>Launch-ready foundation</strong><span>Built to connect to real orders and payments in later phases.</span></article>
        </div>
      </section>
    </div>
  );
}
