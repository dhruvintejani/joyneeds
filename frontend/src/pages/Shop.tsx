import { useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCatalogStore } from "../store/catalogStore";
import { discount, selectProducts, sortOptions } from "../utils/catalog";
import { site } from "../config/site";
import ProductCard from "../components/product/ProductCard";
import { Breadcrumb, Drawer, EmptyState, Button, Skeleton } from "../components/common/UI";
import { PageBanner } from "../components/common/ReferenceUI";
import NotFound from "./NotFound";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { category: slug } = useParams();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const status = useCatalogStore((state) => state.status);
  const category = slug ? categories.find((item) => item.slug === slug) : undefined;

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
    <div className="reference-filters">
      {!category && (
        <fieldset>
          <legend>Category</legend>
          <select
            id={drawer ? "category-mobile" : "category-desktop"}
            value={params.get("category") || ""}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </select>
        </fieldset>
      )}

      {subcategories.length > 0 && (
        <fieldset>
          <legend>Subcategory</legend>
          <select
            value={params.get("subcategory") || ""}
            onChange={(event) => update("subcategory", event.target.value)}
          >
            <option value="">All subcategories</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory}>{subcategory}</option>
            ))}
          </select>
        </fieldset>
      )}

      <fieldset>
        <legend>Price Range</legend>
        <div className="reference-price-fields">
          <label>
            <span>Min ₹</span>
            <input
              type="number"
              min="0"
              value={params.get("min") || ""}
              onChange={(event) => update("min", event.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            <span>Max ₹</span>
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

      <fieldset>
        <legend>Availability</legend>
        <label className="reference-check-row">
          <input
            type="checkbox"
            checked={params.get("stock") === "1"}
            onChange={(event) => update("stock", event.target.checked ? "1" : "")}
          />
          Available products
        </label>
      </fieldset>

      <fieldset>
        <legend>Collection</legend>
        <label className="reference-check-row">
          <input
            type="checkbox"
            checked={params.get("featured") === "1"}
            onChange={(event) => update("featured", event.target.checked ? "1" : "")}
          />
          Featured
        </label>
        <label className="reference-check-row">
          <input
            type="checkbox"
            checked={params.get("new") === "1"}
            onChange={(event) => update("new", event.target.checked ? "1" : "")}
          />
          New arrivals
        </label>
      </fieldset>

      {hasVerifiedRatings && (
        <fieldset>
          <legend>Minimum rating</legend>
          <select value={params.get("rating") || ""} onChange={(event) => update("rating", event.target.value)}>
            <option value="">All ratings</option>
            <option value="4">4 stars & up</option>
            <option value="3">3 stars & up</option>
          </select>
        </fieldset>
      )}

      {hasVerifiedDiscounts && (
        <fieldset>
          <legend>Discount</legend>
          <select value={params.get("discount") || ""} onChange={(event) => update("discount", event.target.value)}>
            <option value="">All products</option>
            <option value="10">10% or more</option>
            <option value="25">25% or more</option>
            <option value="50">50% or more</option>
          </select>
        </fieldset>
      )}

      <Button variant="ghost" onClick={() => setParams({})}>Clear all filters</Button>
    </div>
  );

  const isSearch = location.pathname === "/search";
  const searchTerm = params.get("q") || params.get("search") || "";
  const title = category?.name || (isSearch ? "Search Results" : "All Products");
  const subtitle = isSearch && searchTerm
    ? `Showing results for “${searchTerm}”`
    : category?.description || "Explore useful everyday products across the JoyNeeds collection.";
  const selectedSort = availableSortOptions.some(([value]) => value === params.get("sort"))
    ? params.get("sort")!
    : "featured";

  return (
    <div className="reference-shop-page">
      <div className="container">
        <Breadcrumb items={[{ label: title }]} />
        <PageBanner eyebrow={category ? "SHOP BY CATEGORY" : isSearch ? "SEARCH" : "JOYNEEDS COLLECTION"} title={title} subtitle={subtitle} compact />

        <div className="reference-catalog-layout">
          <aside className="reference-filter-sidebar" aria-label="Product filters">
            <div className="reference-filter-title">
              <h2>Filters</h2>
              {active.length > 0 && (
                <button className="reference-link" onClick={() => setParams({})}>Clear All</button>
              )}
            </div>
            {!drawer && filters}
          </aside>

          <section className="reference-catalog-main" aria-label="Product results">
            <div className="reference-catalog-toolbar">
              <div className="reference-result-count" role="status">
                <strong>{selected.length}</strong> product{selected.length !== 1 ? "s" : ""} found
              </div>
              <label className="reference-inline-search">
                <Search size={17} />
                <span className="sr-only">Search this collection</span>
                <input
                  type="search"
                  placeholder="Search this collection"
                  value={searchTerm}
                  onChange={(event) => update("q", event.target.value)}
                />
              </label>
              <button className="button secondary mobile-filter-button" onClick={() => setDrawer(true)}>
                <SlidersHorizontal size={17} /> Filters
              </button>
              <label className="reference-sort-label">
                <span>Sort by:</span>
                <select value={selectedSort} onChange={(event) => update("sort", event.target.value)}>
                  {availableSortOptions.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>

            {active.length > 0 && (
              <div className="reference-filter-chips" aria-label="Active filters">
                {active.map(([key, value]) => (
                  <button key={key} onClick={() => update(key, "")}>
                    {key === "stock"
                      ? "Available"
                      : key === "new"
                        ? "New arrivals"
                        : key === "featured"
                          ? "Featured"
                          : `${key}: ${value}`}
                    <X size={13} />
                  </button>
                ))}
              </div>
            )}

            {selected.length ? (
              <>
                <div className="product-grid reference-catalog-grid">
                  {selected.slice((page - 1) * 12, page * 12).map((product) => (
                    <ProductCard product={product} key={product.id} />
                  ))}
                </div>
                <nav className="pagination reference-pagination" aria-label="Product pages">
                  {Array.from({ length: pages }, (_, index) => (
                    <button
                      key={index}
                      aria-label={`Page ${index + 1}`}
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
                <Button variant="secondary" onClick={() => setParams({})}>Clear filters</Button>
              </EmptyState>
            )}
          </section>
        </div>

        <Drawer open={drawer} onClose={() => setDrawer(false)} title="Filter products">
          {drawer && filters}
          <Button onClick={() => setDrawer(false)}>Show {selected.length} products</Button>
        </Drawer>
      </div>
    </div>
  );
}
