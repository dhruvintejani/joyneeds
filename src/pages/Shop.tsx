import { useState } from "react";
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { categories, categorySlugMap, products } from "../data/products";
import { discount, selectProducts, sortOptions } from "../utils/catalog";
import { site } from "../config/site";
import ProductCard from "../components/product/ProductCard";
import {
  Breadcrumb,
  Drawer,
  EmptyState,
  PageHeading,
  Button,
} from "../components/common/UI";
import NotFound from "./NotFound";

export default function Shop() {
  const [params, setParams] = useSearchParams(),
    { category: slug } = useParams();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const category = slug ? categorySlugMap[slug] : undefined;
  if (slug && !category) return <NotFound />;

  const hasVerifiedRatings =
    site.catalogVerified &&
    products.some((p) => p.rating !== null && p.reviewCount > 0);
  const hasVerifiedDiscounts =
    site.catalogVerified && products.some((p) => discount(p) > 0);
  const availableSortOptions = Object.entries(sortOptions).filter(([value]) => {
    if (value === "rating") return hasVerifiedRatings;
    if (value === "discount") return hasVerifiedDiscounts;
    if (value === "popular") return site.catalogVerified;
    return true;
  });

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    if (key === "q") next.delete("search");
    setParams(next, { replace: true });
  };

  const selected = selectProducts(params, category);
  const pages = Math.max(1, Math.ceil(selected.length / 12));
  const rawPage = Number(params.get("page"));
  const page = Number.isFinite(rawPage)
    ? Math.min(pages, Math.max(1, Math.floor(rawPage)))
    : 1;
  const active = [...params.entries()].filter(([key, value]) => {
    if (!value) return false;
    if (key === "rating" && !hasVerifiedRatings) return false;
    if (key === "discount" && !hasVerifiedDiscounts) return false;
    return [
      "q",
      "search",
      "category",
      "subcategory",
      "min",
      "max",
      "rating",
      "discount",
      "stock",
      "featured",
      "new",
    ].includes(key);
  });
  const subcategories = [
    ...new Set(
      products
        .filter((p) => !category || p.category === category)
        .map((p) => p.subcategory)
        .filter((s): s is string => !!s),
    ),
  ];

  const filters = (
    <div className="filters">
      {!category && (
        <div className="field">
          <label htmlFor={drawer ? "category-mobile" : "category-desktop"}>
            Category
          </label>
          <select
            id={drawer ? "category-mobile" : "category-desktop"}
            value={params.get("category") || ""}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      )}
      {subcategories.length > 0 && (
        <label className="field">
          Subcategory
          <select
            value={params.get("subcategory") || ""}
            onChange={(e) => update("subcategory", e.target.value)}
          >
            <option value="">All subcategories</option>
            {subcategories.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      )}
      <fieldset>
        <legend>Price range</legend>
        <div className="price-fields">
          <label>
            Min ₹
            <input
              type="number"
              min="0"
              value={params.get("min") || ""}
              onChange={(e) => update("min", e.target.value)}
              placeholder="0"
            />
          </label>
          <span>–</span>
          <label>
            Max ₹
            <input
              type="number"
              min="0"
              value={params.get("max") || ""}
              onChange={(e) => update("max", e.target.value)}
              placeholder="Any"
            />
          </label>
        </div>
      </fieldset>
      {hasVerifiedRatings && (
        <label className="field">
          Minimum rating
          <select
            value={params.get("rating") || ""}
            onChange={(e) => update("rating", e.target.value)}
          >
            <option value="">All ratings</option>
            <option value="4">4 stars & up</option>
            <option value="3">3 stars & up</option>
          </select>
        </label>
      )}
      {hasVerifiedDiscounts && (
        <label className="field">
          Discount
          <select
            value={params.get("discount") || ""}
            onChange={(e) => update("discount", e.target.value)}
          >
            <option value="">All products</option>
            <option value="10">10% or more</option>
            <option value="25">25% or more</option>
            <option value="50">50% or more</option>
          </select>
        </label>
      )}
      <fieldset>
        <legend>Show me</legend>
        {[
          ["stock", "Available products"],
          ["featured", "Featured"],
          ["new", "New arrivals"],
        ].map(([key, label]) => (
          <label className="check-label" key={key}>
            <input
              type="checkbox"
              checked={params.get(key) === "1"}
              onChange={(e) => update(key, e.target.checked ? "1" : "")}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <Button variant="ghost" onClick={() => setParams({})}>
        Clear all filters
      </Button>
    </div>
  );

  const title =
    category ||
    (location.pathname === "/search" ? "Search results" : "All products");
  const selectedSort = availableSortOptions.some(
    ([value]) => value === params.get("sort"),
  )
    ? params.get("sort")!
    : "featured";

  return (
    <div className="container">
      <Breadcrumb items={[{ label: title }]} />
      <PageHeading title={title}>
        Find the little things that make a difference.
      </PageHeading>
      <div className="catalog-layout">
        <aside className="desktop-filters" aria-label="Product filters">
          <h2>Filter by</h2>
          {!drawer && filters}
        </aside>
        <div className="catalog-main">
          <div className="catalog-toolbar">
            <label className="catalog-query">
              <span className="sr-only">Search this collection</span>
              <input
                type="search"
                placeholder="Search this collection"
                value={params.get("q") || params.get("search") || ""}
                onChange={(e) => update("q", e.target.value)}
              />
            </label>
            <button
              className="button secondary mobile-filter-button"
              onClick={() => setDrawer(true)}
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
            <label className="sort-label">
              <span>Sort by</span>
              <select
                value={selectedSort}
                onChange={(e) => update("sort", e.target.value)}
              >
                {availableSortOptions.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="result-summary">
            <span role="status">
              {selected.length} product{selected.length !== 1 ? "s" : ""}
            </span>
            {active.length > 0 && (
              <button onClick={() => setParams({})} className="text-link">
                Clear filters
              </button>
            )}
          </div>
          {active.length > 0 && (
            <div className="filter-chips" aria-label="Active filters">
              {active.map(([key, value]) => (
                <button key={key} onClick={() => update(key, "")}>
                  {key === "stock"
                    ? "Available"
                    : key === "new"
                      ? "New arrivals"
                      : key === "featured"
                        ? "Featured"
                        : key + ": " + value}
                  <X size={13} />
                  <span className="sr-only">Remove filter</span>
                </button>
              ))}
            </div>
          )}
          {selected.length ? (
            <>
              <div className="product-grid catalog-grid">
                {selected.slice((page - 1) * 12, page * 12).map((p) => (
                  <ProductCard product={p} key={p.id} />
                ))}
              </div>
              <nav className="pagination" aria-label="Product pages">
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i}
                    aria-label={"Page " + (i + 1)}
                    aria-current={page === i + 1 ? "page" : undefined}
                    onClick={() => {
                      const next = new URLSearchParams(params);
                      next.set("page", String(i + 1));
                      setParams(next);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </>
          ) : (
            <EmptyState title="No products match just yet">
              <p>Try a different search or clear a filter.</p>
              <Button variant="secondary" onClick={() => setParams({})}>
                Clear filters
              </Button>
            </EmptyState>
          )}
        </div>
      </div>
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Filter products"
      >
        {drawer && filters}
        <Button onClick={() => setDrawer(false)}>
          Show {selected.length} products
        </Button>
      </Drawer>
    </div>
  );
}
