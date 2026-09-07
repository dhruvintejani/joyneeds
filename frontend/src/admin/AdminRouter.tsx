import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Routes,
  Route,
  Navigate,
  NavLink,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  TicketPercent,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import ProductImage from "../components/common/ProductImage";
import { useCatalogStore } from "../store/catalogStore";
import { money } from "../utils/catalog";
import { site } from "../config/site";
import "./admin.css";

type StatTone = "blue" | "green" | "amber" | "red";

const nav = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", Icon: ClipboardList },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: Boxes },
  { to: "/admin/customers", label: "Customers", Icon: UsersRound },
  { to: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/admin/coupons", label: "Coupons", Icon: TicketPercent },
  { to: "/admin/content", label: "Content", Icon: FileText },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminRouter() {
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return (
    <>
      <Helmet>
        <title>JoyNeeds Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetails />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/:productId/edit" element={<ProductEditor />} />
          <Route path="categories" element={<Categories />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:customerId" element={<CustomerDetails />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="content" element={<Content />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </>
  );
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setSidebarOpen(false), [location.pathname]);

  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-brand-row">
          <Link to="/admin" aria-label="JoyNeeds admin dashboard">
            <img src="/brand/joyneeds-logo.png" alt="JoyNeeds" />
          </Link>
          <button className="admin-mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close admin navigation">
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {nav.map(({ to, label, Icon, exact }) => (
            <NavLink key={to} to={to} end={exact} className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-spacer" />
        <div className="admin-support-card">
          <HelpCircle size={24} />
          <strong>Need help?</strong>
          <p>Admin backend features will be connected in later phases.</p>
          <Link to="/contact" className="admin-outline-button">Get support</Link>
        </div>
        <Link className="admin-view-store" to="/"><ExternalLink size={18} /> View Store</Link>
        <div className="admin-sidebar-footer">
          <img src="/brand/joyneeds-logo.png" alt="JoyNeeds" />
          <span>Admin Panel</span>
          <small>UI preview</small>
        </div>
      </aside>

      {sidebarOpen && <button className="admin-overlay" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-shell">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open admin navigation"><Menu size={21} /></button>
          <form
            className="admin-global-search"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = query.trim();
              navigate(trimmed ? `/admin/products?q=${encodeURIComponent(trimmed)}` : "/admin/products");
            }}
          >
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, orders, customers..." aria-label="Search admin" />
          </form>
          <div className="admin-top-actions">
            <button className="admin-icon-button" aria-label="Notifications" onClick={() => toast("Notifications will connect with admin backend events.")}><Bell size={21} /></button>
            <div className="admin-user-badge">A</div>
            <div className="admin-user-copy"><strong>Admin</strong><small>UI preview</small></div>
            <ChevronDown size={17} />
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-preview-banner">
            <strong>Admin UI preview</strong>
            <span>Authentication, order management, customer data and write actions are not connected yet.</span>
          </div>
          <Outlet />
        </main>

        <footer className="admin-footer">
          <span>© {new Date().getFullYear()} JoyNeeds.</span>
          <div><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms">Terms</Link><Link to="/contact">Help</Link></div>
        </footer>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="admin-page-header">
      <div>
        {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="admin-page-action">{action}</div>}
    </div>
  );
}

function StatCard({ label, value, detail, Icon, tone = "blue" }: { label: string; value: ReactNode; detail?: string; Icon: typeof Package; tone?: StatTone }) {
  return (
    <article className="admin-stat-card">
      <span className={`admin-stat-icon ${tone}`}><Icon size={24} /></span>
      <div><p>{label}</p><strong>{value}</strong>{detail && <small>{detail}</small>}</div>
    </article>
  );
}

function EmptyModule({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="admin-empty-module">
      <span><FolderKanban size={30} /></span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}

function Dashboard() {
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const status = useCatalogStore((state) => state.status);
  const activeProducts = products.filter((product) => product.stockStatus === "in_stock").length;

  return (
    <div>
      <PageHeader title="Welcome back, Admin! 👋" subtitle="Here’s what is available in your JoyNeeds store right now." />
      <div className="admin-stats-grid">
        <StatCard label="Total Products" value={status === "ready" ? products.length : "—"} detail="Live catalog" Icon={Package} />
        <StatCard label="Active Products" value={status === "ready" ? activeProducts : "—"} detail="Currently available" Icon={ShoppingBag} tone="green" />
        <StatCard label="Categories" value={status === "ready" ? categories.length : "—"} detail="Live catalog" Icon={Boxes} tone="amber" />
        <StatCard label="Orders" value="—" detail="Order API not connected" Icon={ClipboardList} tone="red" />
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-chart-panel">
          <div className="admin-panel-heading"><h2>Sales Overview</h2><span>Awaiting order data</span></div>
          <div className="admin-empty-chart"><BarChart3 size={34} /><strong>Revenue analytics will appear here</strong><p>Once real orders and payments are connected, this area will use server-authoritative totals.</p></div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>Orders by Status</h2><span>Not connected</span></div>
          <div className="admin-donut-placeholder"><div>—<small>Orders</small></div></div>
          <ul className="admin-legend">
            <li><span className="green" />Delivered <strong>—</strong></li>
            <li><span className="blue" />Shipped <strong>—</strong></li>
            <li><span className="amber" />Processing <strong>—</strong></li>
            <li><span className="red" />Cancelled <strong>—</strong></li>
          </ul>
        </section>
      </div>

      <div className="admin-dashboard-grid lower">
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>Catalog Preview</h2><Link to="/admin/products">View all</Link></div>
          <div className="admin-product-preview-list">
            {products.slice(0, 5).map((product) => (
              <div key={product.id}>
                <ProductImage src={product.image} alt={product.name} />
                <div><strong>{product.name}</strong><small>{product.category}</small></div>
                <span>{money(product.price)}</span>
              </div>
            ))}
            {!products.length && <p className="admin-muted">Catalog is loading or unavailable.</p>}
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>Recent Orders</h2><Link to="/admin/orders">View all</Link></div>
          <EmptyModule title="No order data yet" text="Real orders will appear after the order APIs are implemented." />
        </section>
      </div>
    </div>
  );
}

function Products() {
  const allProducts = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = allProducts.filter((product) => {
      if (q && !`${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(q)) return false;
      if (category && product.category !== category) return false;
      if (stock && product.stockStatus !== stock) return false;
      return true;
    });
    return [...items].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return (b.addedAt || "").localeCompare(a.addedAt || "");
    });
  }, [allProducts, query, category, stock, sort]);

  const active = allProducts.filter((product) => product.stockStatus === "in_stock").length;
  const lowStock = allProducts.filter((product) => product.stockQuantity != null && product.stockQuantity > 0 && product.stockQuantity <= 10).length;
  const out = allProducts.filter((product) => product.stockStatus === "out_of_stock").length;

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your product catalog, inventory and details." action={<Link className="admin-primary-button" to="/admin/products/new"><Plus size={18} /> Add Product</Link>} />
      <div className="admin-stats-grid">
        <StatCard label="Total Products" value={allProducts.length} detail="Database catalog" Icon={Package} />
        <StatCard label="Active Products" value={active} detail="Available now" Icon={Activity} tone="green" />
        <StatCard label="Low Stock" value={lowStock} detail="Only known inventory" Icon={Boxes} tone="amber" />
        <StatCard label="Out of Stock" value={out} detail="Unavailable" Icon={Package} tone="red" />
      </div>

      <section className="admin-panel admin-table-panel">
        <div className="admin-filter-row">
          <label className="admin-search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /></label>
          <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All Categories</option>{categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
          <select value={stock} onChange={(event) => setStock(event.target.value)}><option value="">All Status</option><option value="in_stock">In Stock</option><option value="out_of_stock">Out of Stock</option></select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Sort by: Newest</option><option value="name">Name</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option></select>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Added</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((product) => {
                const knownLow = product.stockQuantity != null && product.stockQuantity > 0 && product.stockQuantity <= 10;
                return (
                  <tr key={product.id}>
                    <td><div className="admin-product-cell"><ProductImage src={product.image} alt={product.name} /><div><strong>{product.name}</strong><small>SKU: {product.sku}</small></div></div></td>
                    <td>{product.category}</td>
                    <td><strong>{money(product.price)}</strong></td>
                    <td>{product.stockQuantity ?? "—"}</td>
                    <td><StatusPill status={product.stockStatus === "out_of_stock" ? "Out of Stock" : knownLow ? "Low Stock" : "Active"} /></td>
                    <td>{product.addedAt ? new Date(product.addedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                    <td><div className="admin-row-actions"><Link to={`/admin/products/${product.id}/edit`} className="admin-icon-button" aria-label={`Edit ${product.name}`}><Pencil size={17} /></Link><button className="admin-icon-button" onClick={() => toast("More product actions will be connected with the admin write API.")}><MoreHorizontal size={18} /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="admin-table-footer">Showing {filtered.length} of {allProducts.length} products</div>
      </section>
    </div>
  );
}

function ProductEditor() {
  const { productId } = useParams();
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const product = productId ? products.find((item) => item.id === productId) : undefined;
  const isEdit = !!productId;
  const [form, setForm] = useState({ name: "", sku: "", category: "", price: "", stock: "", shortDescription: "" });

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      stock: product.stockQuantity == null ? "" : String(product.stockQuantity),
      shortDescription: product.shortDescription,
    });
  }, [product]);

  return (
    <div>
      <PageHeader eyebrow="Products" title={isEdit ? "Edit Product" : "Add Product"} subtitle="UI is ready; saving will be enabled when secure admin write APIs are implemented." action={<Link className="admin-outline-button" to="/admin/products"><ArrowLeft size={17} /> Back to Products</Link>} />
      {isEdit && !product ? (
        <EmptyModule title="Product not found" text="This product is not available in the current catalog." />
      ) : (
        <form className="admin-editor-grid" onSubmit={(event) => { event.preventDefault(); toast("No changes were saved. Admin product write APIs are not connected yet."); }}>
          <section className="admin-panel admin-form-card">
            <h2>Product Information</h2>
            <div className="admin-form-grid">
              <label className="wide">Product Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>SKU<input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} /></label>
              <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="">Choose category</option>{categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
              <label>Price (₹)<input type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
              <label>Stock Quantity<input type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="Unknown" /></label>
              <label className="wide">Short Description<textarea value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} rows={5} /></label>
            </div>
          </section>
          <aside className="admin-panel admin-form-card">
            <h2>Product Media</h2>
            {product ? <ProductImage src={product.image} alt={product.name} className="admin-editor-image" /> : <div className="admin-upload-placeholder"><Package size={36} /><span>Image upload comes with Cloudinary/admin write phase.</span></div>}
            <div className="admin-form-actions"><button type="submit" className="admin-primary-button">{isEdit ? "Save Changes" : "Create Product"}</button><Link to="/admin/products" className="admin-outline-button">Cancel</Link></div>
            <p className="admin-muted">Submitting this preview does not change the database.</p>
          </aside>
        </form>
      )}
    </div>
  );
}

function Categories() {
  const categories = useCatalogStore((state) => state.categories);
  const products = useCatalogStore((state) => state.products);
  return (
    <div>
      <PageHeader title="Categories" subtitle="Organize the real JoyNeeds catalog into clear storefront groups." action={<button className="admin-primary-button" onClick={() => toast("Category creation will be enabled with admin write APIs.")}><Plus size={18} /> Add Category</button>} />
      <section className="admin-panel admin-table-panel">
        <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Category</th><th>Slug</th><th>Products</th><th>Description</th><th>Actions</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td><div className="admin-category-cell"><span><Boxes size={19} /></span><strong>{category.name}</strong></div></td><td>{category.slug}</td><td>{products.filter((product) => product.category === category.name).length}</td><td>{category.description || "—"}</td><td><button className="admin-icon-button" onClick={() => toast("Category editing will be enabled with admin write APIs.")}><Pencil size={17} /></button></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}

function Orders() {
  return (
    <div>
      <PageHeader eyebrow="Orders" title="Orders" subtitle="Track, review and manage real customer orders once order APIs are connected." />
      <div className="admin-stats-grid"><StatCard label="Total Orders" value="—" detail="Not connected" Icon={ClipboardList} /><StatCard label="Processing" value="—" detail="Not connected" Icon={Activity} tone="amber" /><StatCard label="Shipped" value="—" detail="Not connected" Icon={Package} tone="blue" /><StatCard label="Delivered" value="—" detail="Not connected" Icon={ShoppingBag} tone="green" /></div>
      <section className="admin-panel admin-table-panel"><div className="admin-filter-row"><label className="admin-search-field"><Search size={18} /><input placeholder="Search orders..." disabled /></label><select disabled><option>All Status</option></select><select disabled><option>Newest First</option></select></div><EmptyModule title="No order data connected" text="This panel will populate from server-side order APIs after checkout and payment phases are implemented." action={<Link to="/" className="admin-outline-button">View storefront</Link>} /></section>
    </div>
  );
}

function OrderDetails() {
  const { orderId } = useParams();
  return (
    <div>
      <PageHeader eyebrow="Orders › Order Details" title={orderId ? `Order ${orderId}` : "Order Details"} subtitle="No real order record is connected for this route." action={<Link className="admin-outline-button" to="/admin/orders"><ArrowLeft size={17} /> All Orders</Link>} />
      <div className="admin-order-layout"><section className="admin-panel"><div className="admin-panel-heading"><h2>Order Items</h2><span>Awaiting data</span></div><EmptyModule title="Order details unavailable" text="Items, totals, addresses and payment status will load from the backend order service when implemented." /></section><aside className="admin-panel admin-actions-panel"><h2>Order Actions</h2><button disabled className="admin-primary-button">Update Status</button><button disabled className="admin-outline-button">Print Invoice</button><button disabled className="admin-outline-button">Contact Customer</button><button disabled className="admin-danger-button">Cancel Order</button></aside></div>
    </div>
  );
}

function Customers() {
  return (
    <div>
      <PageHeader eyebrow="Customers › All Customers" title="Customers" subtitle="View and manage customers after authenticated accounts and order APIs are connected." action={<button className="admin-primary-button" disabled><Plus size={18} /> Add Customer</button>} />
      <div className="admin-stats-grid"><StatCard label="Total Customers" value="—" detail="Clerk/user sync not connected" Icon={UsersRound} /><StatCard label="New Customers" value="—" detail="Not connected" Icon={UserRound} tone="green" /><StatCard label="Repeat Customers" value="—" detail="Requires order history" Icon={ShoppingBag} tone="amber" /><StatCard label="Inactive Customers" value="—" detail="Requires real activity" Icon={UserRound} tone="red" /></div>
      <section className="admin-panel admin-table-panel"><div className="admin-filter-row"><label className="admin-search-field"><Search size={18} /><input placeholder="Search customers by name, email or phone..." disabled /></label><select disabled><option>All Status</option></select><select disabled><option>Newest First</option></select></div><EmptyModule title="No customer data connected" text="Customer records will come from Clerk + Neon user synchronization. No sample people are shown here." /></section>
    </div>
  );
}

function CustomerDetails() {
  const { customerId } = useParams();
  return <div><PageHeader eyebrow="Customers › Customer Details" title={customerId ? `Customer ${customerId}` : "Customer Details"} subtitle="Customer profiles will use real Clerk/Neon data when connected." action={<Link className="admin-outline-button" to="/admin/customers"><ArrowLeft size={17} /> All Customers</Link>} /><EmptyModule title="Customer profile not connected" text="Orders, addresses, contact information and account activity will appear here after authentication and user APIs are implemented." /></div>;
}

function Analytics() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="A clean reporting workspace ready for real order, revenue and customer metrics." />
      <div className="admin-stats-grid"><StatCard label="Revenue" value="—" detail="Payment/order data required" Icon={CircleDollarSign} /><StatCard label="Orders" value="—" detail="Order API required" Icon={ClipboardList} tone="green" /><StatCard label="Customers" value="—" detail="User sync required" Icon={UsersRound} tone="amber" /><StatCard label="Conversion" value="—" detail="Analytics events required" Icon={Activity} tone="red" /></div>
      <div className="admin-dashboard-grid"><section className="admin-panel admin-chart-panel"><div className="admin-panel-heading"><h2>Revenue Trend</h2><span>No data yet</span></div><div className="admin-empty-chart"><BarChart3 size={38} /><strong>Analytics will use real transactions</strong><p>No synthetic revenue or order numbers are shown.</p></div></section><section className="admin-panel"><div className="admin-panel-heading"><h2>Performance Breakdown</h2><span>Awaiting data</span></div><EmptyModule title="Nothing to report yet" text="Connect orders, payments and analytics events first." /></section></div>
    </div>
  );
}

function Coupons() {
  return <div><PageHeader title="Coupons" subtitle="Create and manage discount codes after server-side promotion rules are implemented." action={<button className="admin-primary-button" disabled><Plus size={18} /> Add Coupon</button>} /><section className="admin-panel"><EmptyModule title="Coupons are not enabled yet" text="No fake promotion codes are created. This UI is ready for a future backend coupon service." /></section></div>;
}

function Content() {
  const cards = [
    ["Homepage", "Hero copy, category highlights and merchandising sections."],
    ["Policies", "Shipping, returns, privacy and terms content."],
    ["FAQ", "Customer-help questions and answers."],
    ["SEO", "Page titles, descriptions and social metadata."],
  ];
  return <div><PageHeader title="Content" subtitle="Manage storefront messaging without changing the storefront design system." /><div className="admin-content-cards">{cards.map(([title, text]) => <section className="admin-panel" key={title}><span className="admin-stat-icon blue"><FileText size={22} /></span><h2>{title}</h2><p>{text}</p><button className="admin-outline-button" onClick={() => toast("Content editing persistence is not connected yet.")}>Open editor <ArrowRight size={16} /></button></section>)}</div></div>;
}

function AdminSettings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Store configuration preview. Secrets and credentials are never exposed here." />
      <div className="admin-settings-grid">
        <section className="admin-panel admin-form-card"><h2>Store Details</h2><div className="admin-form-grid"><label>Store Name<input value={site.brandName} readOnly /></label><label>Storefront URL<input value={site.domain} readOnly /></label><label>Support Email<input value={site.supportEmail} readOnly /></label><label>Support Phone<input value={site.phone || "Not configured"} readOnly /></label></div></section>
        <section className="admin-panel admin-form-card"><h2>Integrations</h2><div className="admin-integration-list"><Integration label="Neon PostgreSQL" status="Schema ready" /><Integration label="Clerk Authentication" status="Not connected" /><Integration label="Razorpay" status="Not connected" /><Integration label="Cloudinary" status="Not connected" /><Integration label="Brevo" status="Not connected" /></div></section>
      </div>
    </div>
  );
}

function Integration({ label, status }: { label: string; status: string }) {
  return <div><div><strong>{label}</strong><small>{status}</small></div><StatusPill status={status.includes("ready") ? "Ready" : "Pending"} /></div>;
}

function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/ /g, "-");
  return <span className={`admin-status ${key}`}>{status}</span>;
}
