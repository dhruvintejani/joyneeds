import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ArrowUpRight,
  CookingPot,
  House,
  Laptop,
  CarFront,
  Sparkles,
  PawPrint,
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
import { useCustomerAuth } from "../../auth/CustomerAuthProvider";
import { site } from "../../config/site";
import SearchBox from "../common/SearchBox";
import { Drawer } from "../common/UI";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useEffect(() => { setCategoriesOpen(false); setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!categoriesOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) setCategoriesOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCategoriesOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [categoriesOpen]);
  const count = useCartStore((state) => state.getCartCount());
  const saved = useDiscoveryStore((state) => state.wishlist.length);
  const categories = useCatalogStore((state) => state.categories);
  const auth = useCustomerAuth();
  const accountTitle = auth.enabled && auth.isSignedIn
    ? auth.user?.firstName || "Account"
    : auth.enabled
      ? "Sign in"
      : "Account";
  const accountSubtitle = auth.enabled && auth.isSignedIn ? "Signed in" : "Guest";

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
          <img src="/brand/joyneeds-logo.png" alt="JoyNeeds" width={2048} height={682} />
        </Link>

        <div className="reference-header-search">
          <SearchBox />
        </div>

        <div className="reference-header-actions">
          <Link className="reference-account-preview" to={auth.isSignedIn ? "/account" : "/sign-in"} aria-label={auth.isSignedIn ? "Customer account" : "Customer sign in"}>
            <UserRound size={21} />
            <span>
              <b>{accountTitle}</b>
              <small>{accountSubtitle}</small>
            </span>
          </Link>
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
          <div className="reference-category-menu" ref={categoryMenuRef}>
            <button
              type="button"
              className="reference-category-trigger"
              aria-expanded={categoriesOpen}
              onClick={() => setCategoriesOpen((value) => !value)}
            >
              <Menu size={18} /><span>Explore categories</span><ChevronDown className={categoriesOpen ? "jn-chevron-open" : ""} size={16} />
            </button>
            {categoriesOpen && (
              <div className="reference-category-dropdown jn-mega-menu">
                <div className="jn-mega-content">
                  <div className="jn-mega-heading"><span>SHOP BY CATEGORY</span><Link to="/shop" onClick={() => setCategoriesOpen(false)}>View everything <ArrowUpRight size={15}/></Link></div>
                  <div className="jn-mega-list">
                    {categories.map((category, index) => {
                      const icons = [CookingPot, House, Laptop, CarFront, Sparkles, PawPrint];
                      const Icon = icons[index % icons.length];
                      return <Link className="jn-mega-link" key={category.id} to={`/category/${category.slug}`} onClick={() => setCategoriesOpen(false)}>
                        <span className="jn-mega-icon"><Icon size={20} strokeWidth={1.6}/></span>
                        <span><strong>{category.name}</strong><small>{category.description || "Discover the collection"}</small></span><ArrowUpRight size={16}/>
                      </Link>;
                    })}
                  </div>
                </div>
                <div className="jn-mega-feature">
                  <span>THE EVERYDAY EDIT</span>
                  <strong>Find a little more joy in the details.</strong>
                  <Link to="/shop" onClick={() => setCategoriesOpen(false)}>Explore all finds <ArrowUpRight size={17}/></Link>
                </div>
              </div>
            )}
          </div>

          <nav className="reference-desktop-nav" aria-label="Main navigation">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/shop">All Products</NavLink>
            {categories.slice(0, 3).map((category) => (
              <NavLink key={category.id} to={`/category/${category.slug}`}>{category.name}</NavLink>
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
            <Link key={category.id} to={`/category/${category.slug}`}>{category.name}</Link>
          ))}
          <Link to="/account">Account</Link>
          <Link to="/sign-in">Sign in</Link>
          <Link to="/sign-up">Create account</Link>
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
