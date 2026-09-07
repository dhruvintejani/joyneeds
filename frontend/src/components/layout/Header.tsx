import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Heart, ShoppingBag, Menu } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useDiscoveryStore } from "../../store/discoveryStore";
import { useCatalogStore } from "../../store/catalogStore";
import SearchBox from "../common/SearchBox";
import { Drawer } from "../common/UI";

export default function Header() {
  const [open, setOpen] = useState(false);
  const count = useCartStore((state) => state.getCartCount());
  const saved = useDiscoveryStore((state) => state.wishlist.length);
  const categories = useCatalogStore((state) => state.categories);

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link to="/" className="brand" aria-label="JoyNeeds home">
          <img
            src="/brand/joyneeds-logo.png"
            alt="JoyNeeds"
            width={2048}
            height={682}
          />
        </Link>
        <div className="header-search">
          <SearchBox />
        </div>
        <div className="header-actions">
          <Link
            className="icon-button counter-link"
            to="/wishlist"
            aria-label={"Wishlist, " + saved + " items"}
          >
            <Heart size={21} />
            {saved > 0 && <span>{saved}</span>}
          </Link>
          <Link
            className="icon-button counter-link"
            to="/cart"
            aria-label={"Cart, " + count + " items"}
          >
            <ShoppingBag size={21} />
            {count > 0 && <span>{count > 99 ? "99+" : count}</span>}
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
      <div className="nav-border">
        <nav className="container desktop-nav" aria-label="Main navigation">
          <NavLink to="/shop">All products</NavLink>
          {categories.slice(0, 3).map((category) => (
            <NavLink key={category.id} to={"/category/" + category.slug}>
              {category.name}
            </NavLink>
          ))}
          <NavLink to="/about">Our story</NavLink>
          <NavLink to="/contact">Need help?</NavLink>
        </nav>
      </div>
      <Drawer
        title="Explore JoyNeeds"
        open={open}
        onClose={() => setOpen(false)}
      >
        <nav
          className="mobile-nav"
          aria-label="Mobile navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <Link to="/">Home</Link>
          <Link to="/shop">All products</Link>
          {categories.map((category) => (
            <Link key={category.id} to={"/category/" + category.slug}>
              {category.name}
            </Link>
          ))}
          <Link to="/about">Our story</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
      </Drawer>
    </header>
  );
}
