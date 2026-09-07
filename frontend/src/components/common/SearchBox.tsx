import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { products } from "../../data/products";
import { matchesSearch, money } from "../../utils/catalog";
import ProductImage from "./ProductImage";
export default function SearchBox() {
  const [query, setQuery] = useState(""),
    [debounced, setDebounced] = useState(""),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const wrapper = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate(),
    location = useLocation(),
    id = useId();
  const results = debounced.trim()
    ? products.filter((p) => matchesSearch(p, debounced)).slice(0, 5)
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
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
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
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              setActive((i) =>
                results.length
                  ? (i + (e.key === "ArrowDown" ? 1 : -1) + results.length) %
                    results.length
                  : -1,
              );
            }
            if (
              e.key === "Enter" &&
              visible &&
              active >= 0 &&
              results[active]
            ) {
              e.preventDefault();
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
            {results.map((p, i) => (
              <li
                key={p.id}
                id={id + "-option-" + i}
                role="option"
                aria-selected={active === i}
                onMouseEnter={() => setActive(i)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  navigate("/product/" + p.slug);
                  setOpen(false);
                }}
                className={active === i ? "active" : ""}
              >
                <ProductImage src={p.image} alt="" />
                <div>
                  <strong>{p.name}</strong>
                  <span>{p.category}</span>
                </div>
                <b>{money(p.price)}</b>
              </li>
            ))}
          </ul>
          {!results.length && (
            <p className="search-message" role="status">
              {debounced !== query
                ? "Searching…"
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
