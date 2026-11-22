import { useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ArrowUpRight } from "lucide-react";
import PremiumSelect from "../components/common/PremiumSelect";
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
          <PremiumSelect label="Category" value={params.get("category") || ""} onChange={(value) => update("category", value)}
            options={[{ value: "", label: "All categories" }, ...categories.map((item) => ({value: item.name, label: item.name}))]} />
        </fieldset>
      )}

      {subcategories.length > 0 && (
        <fieldset>
          <legend>Subcategory</legend>
          <PremiumSelect label="Subcategory" value={params.get("subcategory") || ""} onChange={(value) => update("subcategory", value)}
            options={[{value: "", label: "All subcategories"}, ...subcategories.map((name) => ({ value: name, label: name }))]} />
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
          <PremiumSelect label="Minimum rating" value={params.get("rating") || ""} onChange={(value) => update("rating", value)}
            options={[{value:"", label:"All ratings"},{value:"4",label:"4 stars & up"},{value:"3",label:"3 stars & up"}]} />
        </fieldset>
      )}

      {hasVerifiedDiscounts && (
        <fieldset>
          <legend>Discount</legend>
          <PremiumSelect label="Discount" value={params.get("discount") || ""} onChange={(value) => update("discount", value)}
            options={[{value:"",label:"All products"},{value:"10",label:"10% or more"},{value:"25",label:"25% or more"},{value:"50",label:"50% or more"}]} />
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

        <div className="jn-shop-intro">
          <span>CURATED FOR YOUR ROUTINE</span>
          <p>Explore the things you'll reach for every day. Find your favorites, your way.</p>
          <a href="#products" aria-label="Browse products below">Discover the edit <ArrowUpRight size={17} /></a>
        </div>
        <div className="reference-catalog-layout" id="products">
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
              <div className="reference-sort-label">
                <span>Sort by</span>
                <PremiumSelect label="Sort products" className="jn-sort-select" value={selectedSort}
                  onChange={(value) => update("sort", value)}
                  options={availableSortOptions.map(([value, label]) => ({value, label}))}/>
              </div>
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
                {pages > 1 && <nav className="pagination reference-pagination" aria-label="Product pages">
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
                </nav>}
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
