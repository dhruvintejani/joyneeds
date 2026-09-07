import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { products, categorySlugMap } from "../../data/products";
import { site } from "../../config/site";
const titles: Record<string, string> = {
  "/": "Useful finds for everyday life",
  "/shop": "All products",
  "/search": "Search results",
  "/wishlist": "Your wishlist",
  "/cart": "Your shopping bag",
  "/checkout": "Checkout preview",
  "/about": "Our story",
  "/contact": "Contact us",
  "/faq": "Frequently asked questions",
  "/privacy-policy": "Privacy policy",
  "/terms": "Terms & conditions",
  "/shipping-policy": "Shipping policy",
  "/return-policy": "Return policy",
  "/refund-cancellation": "Refund & cancellation policy",
};
export default function SEO() {
  const { pathname } = useLocation();
  const product = pathname.startsWith("/product/")
    ? products.find((p) => "/product/" + p.slug === pathname)
    : undefined;
  const category = pathname.startsWith("/category/")
    ? categorySlugMap[pathname.slice(10)]
    : undefined;
  const title =
    product?.name || category || titles[pathname] || "Page not found";
  const description =
    product?.shortDescription ||
    (category
      ? "Explore " + category + " in the JoyNeeds collection."
      : "Discover useful everyday products for your home, workspace, and daily life at JoyNeeds. " +
        title +
        ".");
  const canonical = site.domain + pathname;
  const noindex =
    !site.catalogVerified ||
    !site.policiesVerified ||
    ["/search", "/cart", "/checkout", "/wishlist"].includes(pathname) ||
    (!titles[pathname] && !product && !category);
  const structured =
    product && site.catalogVerified
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.shortDescription,
          sku: product.sku,
          image: new URL(product.image, site.domain).href,
          brand: { "@type": "Brand", name: "JoyNeeds" },
        }
      : pathname === "/"
        ? {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.brandName,
            url: site.domain,
          }
        : null;
  return (
    <Helmet>
      <title>{title} | JoyNeeds</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      <meta property="og:title" content={title + " | JoyNeeds"} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={product ? "product" : "website"} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title + " | JoyNeeds"} />
      <meta name="twitter:description" content={description} />
      {structured && (
        <script type="application/ld+json">
          {JSON.stringify(structured).replace(/</g, "\\u003c")}
        </script>
      )}
    </Helmet>
  );
}
