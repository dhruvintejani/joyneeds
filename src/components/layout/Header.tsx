import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, Menu, X, ChevronDown } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { categories, categoryToSlug } from "../../data/products";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.getCartCount());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-blue-500" : "text-slate-200 hover:text-white"
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="JoyNeeds Home">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-yellow-400">Joy</span>
              <span className="text-white">Needs</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/shop" className={navLinkClass}>
              Shop
            </NavLink>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium text-slate-200 hover:text-white transition-colors duration-200"
                aria-haspopup="true"
                aria-expanded={catOpen}
              >
                Categories <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
                    role="menu"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/category/${categoryToSlug[cat]}`}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        role="menuitem"
                        onClick={() => setCatOpen(false)}
                      >
                        {cat}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "220px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-slate-800 text-white text-sm rounded-lg px-3 py-1.5 outline-none border border-slate-700 focus:border-blue-500 transition-colors"
                    aria-label="Search products"
                  />
                </motion.form>
              )}
            </AnimatePresence>

            <button
              onClick={() => {
                if (searchOpen && searchQuery.trim()) {
                  navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                  setSearchOpen(false);
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
              className="p-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </motion.span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-slate-900 border-t border-slate-800 overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/shop" onClick={() => setMobileOpen(false)}>Shop</MobileNavLink>

              <div className="pt-1 pb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">
                  Categories
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${categoryToSlug[cat]}`}
                    className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>

              <MobileNavLink to="/about" onClick={() => setMobileOpen(false)}>About</MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileNavLink>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-slate-800 text-white text-sm rounded-lg px-3 py-2 outline-none border border-slate-700 focus:border-blue-500"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Go
                </button>
              </form>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileNavLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:text-white hover:bg-slate-800"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
