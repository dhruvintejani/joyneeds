import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useCatalogStore } from "../../store/catalogStore";
import { matchesSearch, money } from "../../utils/catalog";
import ProductImage from "./ProductImage";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const products = useCatalogStore((state) => state.products);
  const catalogStatus = useCatalogStore((state) => state.status);
  const wrapper = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const id = useId();

  const results = debounced.trim()
    ? products.filter((product) => matchesSearch(product, debounced)).slice(0, 5)
    : [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(query);
      setActive(-1);
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const visible = open && !!query.trim();

  return (
    <div
      className="search-box"
      ref={wrapper}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          navigate("/search?q=" + encodeURIComponent(query.trim()));
          setOpen(false);
        }}
      >
        <Search size={18} aria-hidden="true" />
        <label className="sr-only" htmlFor={id}>
          Search products
        </label>
        <input
          ref={input}
          id={id}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={id + "-results"}
          aria-activedescendant={
            visible && active >= 0 ? id + "-option-" + active : undefined
          }
          placeholder="Search your everyday needs"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setActive(-1);
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActive((index) =>
                results.length
                  ? (index +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      results.length) %
                    results.length
                  : -1,
              );
            }
            if (
              event.key === "Enter" &&
              visible &&
              active >= 0 &&
              results[active]
            ) {
              event.preventDefault();
              navigate("/product/" + results[active].slug);
              setOpen(false);
            }
          }}
        />
        {query && (
          <button
            type="button"
            className="icon-button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
          >
            <X size={16} />
          </button>
        )}
      </form>
      {visible && (
        <div className="search-results">
          <ul
            id={id + "-results"}
            role="listbox"
            aria-label="Product suggestions"
          >
            {results.map((product, index) => (
              <li
                key={product.id}
                id={id + "-option-" + index}
                role="option"
                aria-selected={active === index}
                onMouseEnter={() => setActive(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  navigate("/product/" + product.slug);
                  setOpen(false);
                }}
                className={active === index ? "active" : ""}
              >
                <ProductImage src={product.image} alt="" />
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                </div>
                <b>{money(product.price)}</b>
              </li>
            ))}
          </ul>
          {!results.length && (
            <p className="search-message" role="status">
              {catalogStatus === "loading" || debounced !== query
                ? "Searching…"
                : catalogStatus === "error"
                  ? "Search is temporarily unavailable."
                  : "No matching products. Try another word."}
            </p>
          )}
          <Link
            className="search-all"
            to={"/search?q=" + encodeURIComponent(query)}
            onClick={() => setOpen(false)}
          >
            See all results
          </Link>
        </div>
      )}
    </div>
  );
}
