import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ChevronDown,
  Headphones,
  Heart,
  Leaf,
  Menu,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useDiscoveryStore } from "../../store/discoveryStore";
import { useCatalogStore } from "../../store/catalogStore";
import { site } from "../../config/site";
import SearchBox from "../common/SearchBox";
import { Drawer } from "../common/UI";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const count = useCartStore((state) => state.getCartCount());
  const saved = useDiscoveryStore((state) => state.wishlist.length);
  const categories = useCatalogStore((state) => state.categories);

  return (
    <header className="site-header reference-header">
      <div className="reference-utility-bar">
        <div className="container reference-utility-inner">
          <div className="reference-utility-points" aria-label="Store information">
            <span>Clear product details</span>
            <span>Guest shopping</span>
            <span>Saved cart & wishlist</span>
          </div>
          <a href={"mailto:" + site.supportEmail}>
            <Headphones size={14} /> Need help? {site.supportEmail}
          </a>
        </div>
      </div>

      <div className="container reference-header-main">
        <Link to="/" className="reference-brand" aria-label="JoyNeeds home">
          <img
            src="/brand/joyneeds-logo.png"
            alt="JoyNeeds"
            width={2048}
            height={682}
          />
        </Link>

        <div className="reference-header-search">
          <SearchBox />
        </div>

        <div className="reference-header-actions">
          <span
            className="reference-account-preview"
            title="Account sign-in will be added in a later phase"
            aria-label="Guest account; sign-in is not enabled yet"
          >
            <UserRound size={21} />
            <span>
              <b>Account</b>
              <small>Guest</small>
            </span>
          </span>
          <Link className="reference-action-link" to="/wishlist" aria-label={`Wishlist, ${saved} items`}>
            <span className="reference-action-icon">
              <Heart size={21} />
              {saved > 0 && <i>{saved > 99 ? "99+" : saved}</i>}
            </span>
            <span>Wishlist</span>
          </Link>
          <Link className="reference-action-link" to="/cart" aria-label={`Cart, ${count} items`}>
            <span className="reference-action-icon">
              <ShoppingCart size={21} />
              {count > 0 && <i>{count > 99 ? "99+" : count}</i>}
            </span>
            <span>Cart</span>
          </Link>
          <button
            className="icon-button menu-toggle"
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <div className="reference-nav-wrap">
        <div className="container reference-nav-row">
          <div className="reference-category-menu">
            <button
              type="button"
              className="reference-category-trigger"
              aria-expanded={categoriesOpen}
              onClick={() => setCategoriesOpen((value) => !value)}
            >
              <Menu size={18} /> All Categories <ChevronDown size={16} />
            </button>
            {categoriesOpen && (
              <div className="reference-category-dropdown">
                <Link to="/shop" onClick={() => setCategoriesOpen(false)}>
                  All products
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <nav className="reference-desktop-nav" aria-label="Main navigation">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/shop">All Products</NavLink>
            {categories.slice(0, 3).map((category) => (
              <NavLink key={category.id} to={`/category/${category.slug}`}>
                {category.name}
              </NavLink>
            ))}
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <div className="reference-nav-message">
            <Leaf size={20} /> <span>A little more joy in every day</span>
          </div>
        </div>
      </div>

      <Drawer title="Explore JoyNeeds" open={open} onClose={() => setOpen(false)}>
        <nav
          className="mobile-nav reference-mobile-nav"
          aria-label="Mobile navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <Link to="/">Home</Link>
          <Link to="/shop">All products</Link>
          {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.slug}`}>
              {category.name}
            </Link>
          ))}
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
      </Drawer>
    </header>
  );
}
