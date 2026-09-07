import { useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useCatalogStore } from "../store/catalogStore";
import { discount, selectProducts, sortOptions } from "../utils/catalog";
import { site } from "../config/site";
import ProductCard from "../components/product/ProductCard";
import {
  Breadcrumb,
  Drawer,
  EmptyState,
  PageHeading,
  Button,
  Skeleton,
} from "../components/common/UI";
import NotFound from "./NotFound";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { category: slug } = useParams();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const status = useCatalogStore((state) => state.status);
  const category = slug
    ? categories.find((item) => item.slug === slug)
    : undefined;

  if (status === "idle" || status === "loading") return <Skeleton />;
  if (slug && !category) return <NotFound />;

  const hasVerifiedRatings =
    site.catalogVerified &&
    products.some((product) => product.rating !== null && product.reviewCount > 0);
  const hasVerifiedDiscounts =
    site.catalogVerified && products.some((product) => discount(product) > 0);
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

  const selected = selectProducts(products, params, category?.name);
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
        .filter((product) => !category || product.category === category.name)
        .map((product) => product.subcategory)
        .filter((value): value is string => !!value),
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
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {subcategories.length > 0 && (
        <label className="field">
          Subcategory
          <select
            value={params.get("subcategory") || ""}
            onChange={(event) => update("subcategory", event.target.value)}
          >
            <option value="">All subcategories</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory}>{subcategory}</option>
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
              onChange={(event) => update("min", event.target.value)}
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
              onChange={(event) => update("max", event.target.value)}
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
            onChange={(event) => update("rating", event.target.value)}
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
            onChange={(event) => update("discount", event.target.value)}
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
              onChange={(event) =>
                update(key, event.target.checked ? "1" : "")
              }
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
    category?.name ||
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
                onChange={(event) => update("q", event.target.value)}
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
                onChange={(event) => update("sort", event.target.value)}
              >
                {availableSortOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
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
                {selected.slice((page - 1) * 12, page * 12).map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>
              <nav className="pagination" aria-label="Product pages">
                {Array.from({ length: pages }, (_, index) => (
                  <button
                    key={index}
                    aria-label={"Page " + (index + 1)}
                    aria-current={page === index + 1 ? "page" : undefined}
                    onClick={() => {
                      const next = new URLSearchParams(params);
                      next.set("page", String(index + 1));
                      setParams(next);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                  >
                    {index + 1}
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
