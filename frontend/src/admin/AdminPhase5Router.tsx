import { useEffect, useState, type ReactNode } from "react";
import {
  Routes,
  Route,
  NavLink,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  ExternalLink,
  FileText,
  CircleHelp,
  ArrowRight,
  LockKeyhole,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  TicketPercent,
  UsersRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "../components/common/ConfirmDialog";
import AdminPaymentsWorkspace from "./AdminPaymentsWorkspace";
import AdminOrderWorkspace from "./AdminOrderWorkspace";
import AdminProductEditorWorkspace from "./AdminProductEditorWorkspace";
import {
  archiveAdminCategory,
  archiveAdminProduct,
  createAdminCategory,
  getAdminDashboard,
  listAdminCategories,
  listAdminCustomers,
  getAdminCustomer,
  type AdminCustomer,
  type AdminCustomerDetail,
  listAdminProductsPage,
  logoutAdmin,
  updateAdminCategory,
  type AdminCategory,
  type AdminDashboard,
  type AdminProduct,
} from "../api/admin";
import ProductImage from "../components/common/ProductImage";
import { useCatalogStore } from "../store/catalogStore";
import "./admin.css";

type StatTone = "blue" | "green" | "amber" | "red";

const nav = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", Icon: ClipboardList },
  { to: "/admin/payments", label: "Payments", Icon: CreditCard },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: Boxes },
  { to: "/admin/customers", label: "Customers", Icon: UsersRound },
  { to: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/admin/coupons", label: "Coupons", Icon: TicketPercent },
  { to: "/admin/content", label: "Content", Icon: FileText },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
  { to: "/admin/help", label: "Help & setup", Icon: CircleHelp },
];

const moneyPaise = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value / 100);

export default function AdminPhase5Router() {
  return (
    <>
      <Helmet><title>JoyNeeds Admin</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<AdminProductEditorWorkspace key="new" />} />
          <Route path="products/:productId/edit" element={<AdminProductEditorWorkspace />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<AdminOrderWorkspace />} />
          <Route path="orders/:orderId" element={<AdminOrderWorkspace />} />
          <Route path="payments" element={<AdminPaymentsWorkspace />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:customerId" element={<CustomerDetail />} />
          <Route path="analytics" element={<AnalyticsOverview />} />
          <Route path="coupons" element={<PendingModule title="Coupons" text="Promotion and coupon rules are not enabled, so no fake coupon data is shown." />} />
          <Route path="content" element={<PendingModule title="Content" text="Store content persistence is not enabled; storefront content remains code-managed." />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<AdminHelp />} />
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Routes>
    </>
  );
}

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-brand-row"><Link to="/admin"><img src="/brand/joyneeds-logo.png" alt="JoyNeeds" /></Link><button className="admin-mobile-close" onClick={() => setOpen(false)} aria-label="Close admin navigation"><X size={20} /></button></div>
        <nav className="admin-nav">{nav.map(({ to, label, Icon, exact }) => <NavLink key={to} to={to} end={exact} className={({ isActive }) => isActive ? "active" : ""}><Icon size={20} /><span>{label}</span></NavLink>)}</nav>
        <div className="admin-sidebar-spacer" />
        <Link className="admin-view-store" to="/"><ExternalLink size={18} /> View Store</Link>
        <button className="admin-view-store" onClick={async () => { try { await logoutAdmin(); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to sign out. Try again."); return; } window.location.assign("/admin"); }}><LogOut size={18} /> Sign Out</button>
        <div className="admin-sidebar-footer"><img src="/brand/joyneeds-logo.png" alt="JoyNeeds" /><span>Admin Panel</span><small>Secure session</small></div>
      </aside>
      {open && <button className="admin-overlay" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <div className="admin-shell">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setOpen(true)} aria-label="Open admin navigation"><Menu size={21} /></button>
          <form className="admin-global-search" onSubmit={(event) => { event.preventDefault(); navigate(query.trim() ? `/admin/products?q=${encodeURIComponent(query.trim())}` : "/admin/products"); }}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." aria-label="Search admin products" /></form>
          <div className="admin-top-actions"><div className="admin-user-badge">A</div><div className="admin-user-copy"><strong>Admin</strong><small>Secure session</small></div></div>
        </header>
        <main className="admin-content"><Outlet /></main>
        <footer className="admin-footer"><span>© {new Date().getFullYear()} JoyNeeds.</span><div><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms">Terms</Link><Link to="/contact">Help</Link></div></footer>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="admin-page-header"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="admin-page-action">{action}</div>}</div>;
}

function StatCard({ label, value, detail, Icon, tone = "blue" }: { label: string; value: ReactNode; detail?: string; Icon: typeof Package; tone?: StatTone }) {
  return <article className="admin-stat-card"><span className={`admin-stat-icon ${tone}`}><Icon size={24} /></span><div><p>{label}</p><strong>{value}</strong>{detail && <small>{detail}</small>}</div></article>;
}

function Dashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getAdminDashboard().then(setData).catch((err) => setError(err instanceof Error ? err.message : "Unable to load dashboard.")); }, []);
  return <div><PageHeader title="Welcome back, Admin! 👋" subtitle="Live store data from the JoyNeeds backend." />{error && <div className="admin-auth-error">{error}</div>}<div className="admin-stats-grid"><StatCard label="Total Products" value={data?.totalProducts ?? "—"} detail="Database catalog" Icon={Package} /><StatCard label="Active Products" value={data?.activeProducts ?? "—"} detail="Published" Icon={Activity} tone="green" /><StatCard label="Categories" value={data?.categories ?? "—"} detail="Active groups" Icon={Boxes} tone="amber" /><StatCard label="Orders" value={data?.orders ?? "—"} detail="Real records only" Icon={ClipboardList} tone="red" /></div><div className="admin-dashboard-grid"><section className="admin-panel"><div className="admin-panel-heading"><h2>Store Snapshot</h2><span>Live backend</span></div><div className="admin-content-cards"><div><strong>{data ? moneyPaise(data.netRevenuePaise) : "—"}</strong><p>Net paid revenue</p></div><div><strong>{data?.customers ?? "—"}</strong><p>Synced customer accounts</p></div><div><strong>{data?.outOfStockProducts ?? "—"}</strong><p>Out of stock products</p></div></div></section><section className="admin-panel"><div className="admin-panel-heading"><h2>Commerce Operations</h2><span>Backend connected</span></div><p className="admin-muted">Catalog, orders, inventory, payments, product images and transactional email are wired to protected backend services. Preview-only modules stay clearly disabled rather than showing fabricated data.</p></section></div></div>;
}

function Products() {
  const confirm = useConfirm();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => { setDebouncedQuery(query.trim()); setPage(1); }, 250);
    return () => window.clearTimeout(id);
  }, [query]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void Promise.all([
      listAdminProductsPage({ q: debouncedQuery, page, limit: 20 }),
      getAdminDashboard(),
    ]).then(([result, summary]) => {
      if (!active) return;
      setProducts(result.items);
      setPagination(result.pagination);
      setDashboard(summary);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Unable to load products.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [debouncedQuery, page]);
  const refresh = async () => {
    setLoading(true);
    try {
      const [result, summary] = await Promise.all([
        listAdminProductsPage({ q: debouncedQuery, page, limit: 20 }),
        getAdminDashboard(),
      ]);
      setProducts(result.items);
      setPagination(result.pagination);
      setDashboard(summary);
      setError("");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Unable to refresh products.");
    } finally { setLoading(false); }
  };
  return (
    <div className="jn-admin-products-workspace">
      <PageHeader title="Products" subtitle="Edit your catalog, pricing, inventory, and images securely."
        action={<Link className="admin-primary-button" to="/admin/products/new"><Plus size={18}/> Add Product</Link>}/>
      <div className="admin-stats-grid">
        <StatCard label="Total Products" value={dashboard?.totalProducts ?? "—"} Icon={Package}/>
        <StatCard label="Published" value={dashboard?.activeProducts ?? "—"} Icon={Activity} tone="green"/>
        <StatCard label="Out of Stock" value={dashboard?.outOfStockProducts ?? "—"} Icon={Boxes} tone="red"/>
        <StatCard label="Categories" value={dashboard?.categories ?? "—"} Icon={ShoppingBag} tone="amber"/>
      </div>
      <section className="admin-panel admin-table-panel">
        <div className="admin-filter-row jn-admin-product-filters">
          <label className="admin-search-field">
            <Search size={18}/>
            <input value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products by name, SKU, or slug" aria-label="Search products"/>
          </label>
          <Link className="admin-outline-button" to="/admin/categories"><Boxes size={17}/> Categories</Link>
        </div>
        {error && <div className="admin-auth-error" role="alert">{error}</div>}
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><div className="admin-product-cell">
                    <ProductImage src={product.images[0]?.secureUrl || product.images[0]?.sourceUrl || ""} alt={product.name}/>
                    <div><strong>{product.name}</strong><small>SKU: {product.sku}</small></div>
                  </div></td>
                  <td>{product.category.name}</td>
                  <td><strong>{moneyPaise(product.pricePaise)}</strong>
                    {product.originalPricePaise !== null && product.originalPricePaise > product.pricePaise && <small className="jn-admin-price-old">{moneyPaise(product.originalPricePaise)}</small>}
                  </td>
                  <td>{product.stockQuantity ?? "—"}</td>
                  <td><span className={`admin-status-pill ${product.active && product.stockStatus === "IN_STOCK" ? "green" : "red"}`}>
                    {product.active && product.stockStatus === "IN_STOCK" ? "Active" : "Unavailable"}
                  </span></td>
                  <td><div className="admin-row-actions">
                    <Link className="admin-icon-button" to={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`} title="Edit product"><Pencil size={17}/></Link>
                    <button className="admin-danger-button" type="button" disabled={!product.active} onClick={async () => {
                      if (!await confirm({ title: "Archive product?", message: `${product.name} will be removed from the storefront. Existing orders are retained.`, confirmLabel: "Archive product" })) return;
                      try {
                        await archiveAdminProduct(product.id);
                        await refresh();
                        await useCatalogStore.getState().loadCatalog(true);
                        toast.success("Product archived.");
                      } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Unable to archive product."); }
                    }}>Archive</button>
                  </div></td>
                </tr>
              ))}
              {!loading && !products.length && <tr><td colSpan={6}>{debouncedQuery ? "No matching products." : "No products yet. Add your first product to get started."}</td></tr>}
              {loading && <tr><td colSpan={6}>Loading products…</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="admin-table-footer jn-admin-page-controls">
          <span>{loading ? "Loading…" : `Showing ${products.length} of ${pagination.total} matching products`}</span>
          <div>
            <button type="button" className="admin-outline-button" disabled={loading || page <= 1} onClick={() => setPage((value) => Math.max(1,value-1))}>Previous</button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <button type="button" className="admin-outline-button" disabled={loading || page >= pagination.pages} onClick={() => setPage((value) => value+1)}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Categories() {
  const confirm = useConfirm();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: "0" });
  const refresh = () => listAdminCategories().then(setCategories).catch((err) => toast.error(err instanceof Error ? err.message : "Unable to load categories."));
  useEffect(() => { void refresh(); }, []);
  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", sortOrder: "0" }); setShowForm(true); };
  const openEdit = (category: AdminCategory) => { setEditing(category); setForm({ name: category.name, description: category.description || "", sortOrder: String(category.sortOrder) }); setShowForm(true); };
  return <div><PageHeader title="Categories" subtitle="Manage the storefront category structure stored in PostgreSQL." action={<button className="admin-primary-button" onClick={openCreate}><Plus size={18} /> Add Category</button>} />{showForm && <form className="admin-panel admin-form-card admin-category-form" onSubmit={async (event) => { event.preventDefault(); try { const input = { name: form.name.trim(), description: form.description.trim() || null, sortOrder: Number(form.sortOrder) || 0, active: true }; if (editing) await updateAdminCategory(editing.id, input); else await createAdminCategory(input); await refresh(); await useCatalogStore.getState().loadCatalog(true); setShowForm(false); toast.success(editing ? "Category updated." : "Category created."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to save category."); } }}><h2>{editing ? "Edit Category" : "Add Category"}</h2><div className="admin-form-grid"><label>Name<input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Sort Order<input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></label><label className="wide">Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label></div><div className="admin-form-actions"><button className="admin-primary-button" type="submit">Save Category</button><button className="admin-outline-button" type="button" onClick={() => setShowForm(false)}>Cancel</button></div></form>}<section className="admin-panel admin-table-panel"><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Category</th><th>Slug</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td><strong>{category.name}</strong><small className="admin-muted">{category.description || "No description"}</small></td><td>{category.slug}</td><td>{category._count?.products ?? "—"}</td><td><span className={`admin-status-pill ${category.active ? "green" : "red"}`}>{category.active ? "Active" : "Archived"}</span></td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => openEdit(category)}><Pencil size={17} /></button>{category.active && <button className="admin-danger-button" onClick={async () => { if (!await confirm({ title: "Archive category?", message: `${category.name} will no longer be available as an active category.`, confirmLabel: "Archive category" })) return; try { await archiveAdminCategory(category.id); await refresh(); await useCatalogStore.getState().loadCatalog(true); toast.success("Category archived."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to archive category."); } }}>Archive</button>}</div></td></tr>)}</tbody></table></div></section></div>;
}

function PendingModule({ title, text }: { title: string; text: string }) {
  const features: Record<string, string[]> = {
    Customers: ["Customer profiles", "Support history", "Marketing preferences"],
    "Customer Details": ["Customer profile", "Order history", "Account support"],
    Coupons: ["Discount codes", "Usage limits", "Start and end dates"],
    Content: ["Homepage sections", "Store notices", "Editorial banners"],
  };
  return (
    <div className="jn-admin-module">
      <PageHeader title={title} subtitle="Management workspace" />
      <section className="admin-panel jn-admin-module-intro">
        <span className="jn-admin-module-icon"><LockKeyhole size={29}/></span>
        <p className="admin-eyebrow">NOT ACTIVE YET</p>
        <h2>{title} management is being prepared.</h2>
        <p>{text}</p>
        <div className="jn-admin-module-features">
          {(features[title] || ["Reporting", "Management", "Activity history"]).map((name) =>
            <span key={name}><CircleHelp size={15}/>{name}</span>)}
        </div>
        <div className="jn-admin-module-actions">
          <Link className="admin-primary-button" to="/admin">Back to dashboard <ArrowRight size={16}/></Link>
          <Link className="admin-outline-button" to="/admin/help">Setup guide</Link>
        </div>
      </section>
      <div className="jn-admin-module-links">
        <Link to="/admin/products"><Package size={20}/><span><strong>Manage products</strong><small>Catalog and inventory</small></span><ArrowRight size={16}/></Link>
        <Link to="/admin/orders"><ClipboardList size={20}/><span><strong>Review orders</strong><small>Payment and order records</small></span><ArrowRight size={16}/></Link>
        <Link to="/admin/categories"><Boxes size={20}/><span><strong>Edit categories</strong><small>Storefront organization</small></span><ArrowRight size={16}/></Link>
      </div>
    </div>
  );
}

function AnalyticsOverview() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void getAdminDashboard()
      .then((summary) => { if (active) setData(summary); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load analytics."); });
    return () => { active = false; };
  }, []);
  return <div>
    <PageHeader title="Store Analytics" subtitle="Real totals from the secured store database. No invented charts or customer activity."/>
    {error && <div className="admin-auth-error" role="alert">{error}</div>}
    <div className="admin-stats-grid">
      <StatCard label="Net paid revenue" value={data ? moneyPaise(data.netRevenuePaise) : "—"} Icon={BarChart3} tone="green"/>
      <StatCard label="Orders" value={data?.orders ?? "—"} Icon={ClipboardList}/>
      <StatCard label="Customers" value={data?.customers ?? "—"} Icon={UsersRound} tone="amber"/>
      <StatCard label="Active products" value={data?.activeProducts ?? "—"} Icon={Package}/>
    </div>
    <section className="admin-panel jn-admin-analytics-note">
      <h2>Overview</h2>
      <p>These totals use existing server-side paid-order and catalog records. Date-range charts, traffic sources, conversion funnels, and customer-level insights are not available without additional verified event data.</p>
      <Link className="admin-outline-button" to="/admin/orders">Inspect orders <ArrowRight size={16}/></Link>
    </section>
  </div>;
}

function AdminHelp() {
  return <div>
    <PageHeader title="Help & setup" subtitle="A practical checklist for safely launching the JoyNeeds commerce backend." />
    <section className="admin-panel jn-admin-setup">
      <p className="admin-eyebrow">BEFORE ACCEPTING ORDERS</p>
      <h2>Activate your store in the right order.</h2>
      <div className="jn-admin-setup-steps">
        <article><span>01</span><div><h3>Database and backend</h3><p>Deploy the Node.js backend with a Neon PostgreSQL <code>DATABASE_URL</code>. Point the storefront at it with <code>VITE_API_URL</code>.</p></div></article>
        <article><span>02</span><div><h3>Secure administrator access</h3><p>Configure <code>ADMIN_EMAIL</code> and a bcrypt <code>ADMIN_PASSWORD_HASH</code> on the backend. Never expose credentials in frontend code.</p></div></article>
        <article><span>03</span><div><h3>Images and inventory</h3><p>Configure Cloudinary credentials, add real merchandise photos, and confirm categories, stock and product prices.</p></div></article>
        <article><span>04</span><div><h3>Customer authentication</h3><p>Configure Clerk with a publishable key on the frontend and the matching server-side credentials when customer sign-in is needed.</p></div></article>
        <article><span>05</span><div><h3>Payments and launch checks</h3><p>Verify the merchant's Paytm or Razorpay account, test payment status server-side, publish approved policies and only then enable checkout.</p></div></article>
      </div>
      <div className="jn-admin-module-actions">
        <Link className="admin-primary-button" to="/admin/products">Product catalog <ArrowRight size={16}/></Link>
        <Link className="admin-outline-button" to="/admin/settings">Store settings</Link>
      </div>
    </section>
  </div>;
}

function AdminNotFound() {
  return <div className="jn-admin-missing">
    <span className="jn-admin-missing-number">404</span>
    <h1>That admin page isn't here.</h1>
    <p>The requested workspace could not be found. No store data was changed.</p>
    <div className="jn-admin-module-actions">
      <Link className="admin-primary-button" to="/admin">Dashboard <ArrowRight size={17}/></Link>
      <Link className="admin-outline-button" to="/admin/help">Help & setup</Link>
    </div>
  </div>;
}

function SettingsPage() {
  const settings = [
    ["Database", "Neon PostgreSQL", "Persistent store catalog, stock, orders and admin sessions."],
    ["Administrator", "Protected server login", "Email and bcrypt password hash with an HttpOnly session."],
    ["Customer accounts", "Clerk", "Customer sign-in is optional; it must be configured separately."],
    ["Product images", "Cloudinary", "Secure uploads and managed product photographs."],
    ["Payment gateway", "Paytm or Razorpay", "Enable only after a verified merchant account and server-side payment tests."],
    ["Notifications", "Brevo", "Optional transactional email integration once sender details are verified."],
  ];
  return <div>
    <PageHeader title="Store Settings" subtitle="Service architecture and integration requirements, without showing credentials." />
    <section className="admin-panel jn-admin-settings-panel">
      <div className="admin-panel-heading"><h2>Connected services</h2><span>Configuration overview</span></div>
      <p className="admin-muted">This page documents the expected integrations. It does not claim that each provider is active, and never reveals private keys.</p>
      <div className="jn-admin-settings-list">
        {settings.map(([label, provider, details]) =>
          <div key={label}><div><strong>{label}</strong><span>{provider}</span></div><p>{details}</p></div>)}
      </div>
      <Link className="admin-outline-button" to="/admin/help"><CircleHelp size={16}/> View setup checklist</Link>
    </section>
  </div>;
}

function customerName(customer: AdminCustomer) {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Customer";
}
function Customers() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminCustomer[]>([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    void listAdminCustomers(search, page).then(result => {
      if (!active) return;
      setItems(result.items); setPages(result.pagination.pages); setTotal(result.pagination.total);
    }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load customers."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, page]);
  return <div><PageHeader title="Customers" subtitle="Real registered customer accounts and their order history."/>
    <section className="admin-panel admin-table-panel">
      <form className="admin-filter-row" onSubmit={event => { event.preventDefault(); setSearch(q.trim()); setPage(1); }}>
        <label className="admin-search-field"><Search size={18}/><input aria-label="Search customers" placeholder="Search by name or email" maxLength={100} value={q} onChange={event => setQ(event.target.value)}/></label>
        <button className="admin-primary-button" type="submit">Search</button>
      </form>
      {error && <div role="alert" className="admin-auth-error">{error}</div>}
      <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Joined</th><th>Details</th></tr></thead><tbody>
      {loading ? <tr><td colSpan={5}>Loading customers…</td></tr> : error ? null : items.length ? items.map(customer => <tr key={customer.id}><td><strong>{customerName(customer)}</strong></td><td>{customer.email || "—"}</td><td>{customer._count.orders}</td><td>{new Date(customer.createdAt).toLocaleDateString("en-IN")}</td><td><Link className="admin-outline-button" to={"/admin/customers/" + customer.id}>View</Link></td></tr>) : <tr><td colSpan={5}>No registered customers found.</td></tr>}
      </tbody></table></div>
      <div className="admin-table-footer jn-admin-page-controls"><span>{total} accounts</span><div><button type="button" className="admin-outline-button" disabled={loading || page <= 1} onClick={() => setPage(n => n-1)}>Previous</button><span>Page {page} of {pages}</span><button type="button" className="admin-outline-button" disabled={loading || page >= pages} onClick={() => setPage(n => n+1)}>Next</button></div></div>
    </section></div>;
}
function CustomerDetail() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!customerId) return;
    let active = true; setCustomer(null); setError("");
    void getAdminCustomer(customerId).then(data => { if (active) setCustomer(data); }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load customer."); });
    return () => { active = false; };
  }, [customerId]);
  return <div><PageHeader title="Customer details" action={<Link className="admin-outline-button" to="/admin/customers"><ArrowLeft size={17}/> All customers</Link>}/>
    {error ? <p role="alert" className="admin-auth-error">{error}</p> : !customer ? <p>Loading customer…</p> : <>
      <section className="admin-panel"><h2>{customerName(customer)}</h2><p>{customer.email || "Email unavailable"}</p><p>Joined {new Date(customer.createdAt).toLocaleDateString("en-IN")} · {customer._count.orders} orders</p></section>
      <section className="admin-panel admin-table-panel"><div className="admin-panel-heading"><h2>Recent orders</h2><span>Up to 50 latest orders</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>{customer.orders.map(order => <tr key={order.id}><td><Link to={"/admin/orders/" + order.id}>{order.orderNumber}</Link></td><td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td><td>{order.status.replace(/_/g, " ")}</td><td>{moneyPaise(order.totalPaise)}</td></tr>)}{!customer.orders.length && <tr><td colSpan={4}>No linked orders yet.</td></tr>}</tbody></table></div></section>
    </>}
  </div>;
}
