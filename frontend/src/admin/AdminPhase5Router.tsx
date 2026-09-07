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
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  FileText,
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
import {
  archiveAdminCategory,
  archiveAdminProduct,
  createAdminCategory,
  createAdminProduct,
  getAdminDashboard,
  listAdminCategories,
  listAdminProducts,
  logoutAdmin,
  updateAdminCategory,
  updateAdminProduct,
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
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: Boxes },
  { to: "/admin/customers", label: "Customers", Icon: UsersRound },
  { to: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/admin/coupons", label: "Coupons", Icon: TicketPercent },
  { to: "/admin/content", label: "Content", Icon: FileText },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
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
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/:productId/edit" element={<ProductEditor />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<PendingModule title="Orders" text="Order management becomes live in Phase 6." />} />
          <Route path="orders/:orderId" element={<PendingModule title="Order Details" text="Real order detail APIs are added in Phase 6." />} />
          <Route path="customers" element={<PendingModule title="Customers" text="Customer records will use synced Clerk users and order history in the next backend phase." />} />
          <Route path="customers/:customerId" element={<PendingModule title="Customer Details" text="Customer history is connected with the order/customer APIs." />} />
          <Route path="analytics" element={<PendingModule title="Analytics" text="Revenue and order analytics will use real server-side order/payment data only." />} />
          <Route path="coupons" element={<PendingModule title="Coupons" text="No fake coupon data is created. Promotion rules are not enabled yet." />} />
          <Route path="content" element={<PendingModule title="Content" text="Store content persistence is reserved for a later backend module." />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
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
        <div className="admin-brand-row"><Link to="/admin"><img src="/brand/joyneeds-logo.png" alt="JoyNeeds" /></Link><button className="admin-mobile-close" onClick={() => setOpen(false)}><X size={20} /></button></div>
        <nav className="admin-nav">{nav.map(({ to, label, Icon, exact }) => <NavLink key={to} to={to} end={exact} className={({ isActive }) => isActive ? "active" : ""}><Icon size={20} /><span>{label}</span></NavLink>)}</nav>
        <div className="admin-sidebar-spacer" />
        <Link className="admin-view-store" to="/"><ExternalLink size={18} /> View Store</Link>
        <button
          className="admin-view-store"
          onClick={async () => {
            try { await logoutAdmin(); } finally { window.location.assign("/admin"); }
          }}
        ><LogOut size={18} /> Sign Out</button>
        <div className="admin-sidebar-footer"><img src="/brand/joyneeds-logo.png" alt="JoyNeeds" /><span>Admin Panel</span><small>Secure session</small></div>
      </aside>
      {open && <button className="admin-overlay" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <div className="admin-shell">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setOpen(true)}><Menu size={21} /></button>
          <form className="admin-global-search" onSubmit={(event) => { event.preventDefault(); navigate(query.trim() ? `/admin/products?q=${encodeURIComponent(query.trim())}` : "/admin/products"); }}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /></form>
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
  return <div><PageHeader title="Welcome back, Admin! 👋" subtitle="Live store data from the JoyNeeds backend." />{error && <div className="admin-auth-error">{error}</div>}<div className="admin-stats-grid"><StatCard label="Total Products" value={data?.totalProducts ?? "—"} detail="Database catalog" Icon={Package} /><StatCard label="Active Products" value={data?.activeProducts ?? "—"} detail="Published" Icon={Activity} tone="green" /><StatCard label="Categories" value={data?.categories ?? "—"} detail="Active groups" Icon={Boxes} tone="amber" /><StatCard label="Orders" value={data?.orders ?? "—"} detail="Real records only" Icon={ClipboardList} tone="red" /></div><div className="admin-dashboard-grid"><section className="admin-panel"><div className="admin-panel-heading"><h2>Store Snapshot</h2><span>Live backend</span></div><div className="admin-content-cards"><div><strong>{data ? moneyPaise(data.netRevenuePaise) : "—"}</strong><p>Net paid revenue</p></div><div><strong>{data?.customers ?? "—"}</strong><p>Synced customer accounts</p></div><div><strong>{data?.outOfStockProducts ?? "—"}</strong><p>Out of stock products</p></div></div></section><section className="admin-panel"><div className="admin-panel-heading"><h2>Next backend module</h2><span>Phase 6</span></div><p className="admin-muted">Orders, inventory-safe checkout, customer history and admin order management are connected next.</p></section></div></div>;
}

function Products() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get("q") || "");
  const [loading, setLoading] = useState(true);
  const refresh = async () => { setLoading(true); try { setProducts(await listAdminProducts()); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to load products."); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); }, []);
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return q ? products.filter((product) => `${product.name} ${product.sku} ${product.category.name}`.toLowerCase().includes(q)) : products; }, [products, query]);
  return <div><PageHeader title="Products" subtitle="Manage the live catalog stored in PostgreSQL." action={<Link className="admin-primary-button" to="/admin/products/new"><Plus size={18} /> Add Product</Link>} /><div className="admin-stats-grid"><StatCard label="Total Products" value={products.length} Icon={Package} /><StatCard label="Active" value={products.filter((p) => p.active).length} Icon={Activity} tone="green" /><StatCard label="Out of Stock" value={products.filter((p) => p.stockStatus === "OUT_OF_STOCK").length} Icon={Boxes} tone="red" /><StatCard label="Featured" value={products.filter((p) => p.featured).length} Icon={ShoppingBag} tone="amber" /></div><section className="admin-panel admin-table-panel"><div className="admin-filter-row"><label className="admin-search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /></label></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><ProductImage src={product.images[0]?.secureUrl || product.images[0]?.sourceUrl || "/brand/joyneeds-icon.png"} alt={product.name} /><div><strong>{product.name}</strong><small>SKU: {product.sku}</small></div></div></td><td>{product.category.name}</td><td><strong>{moneyPaise(product.pricePaise)}</strong></td><td>{product.stockQuantity ?? "—"}</td><td><span className={`admin-status-pill ${product.active && product.stockStatus === "IN_STOCK" ? "green" : "red"}`}>{product.active && product.stockStatus === "IN_STOCK" ? "Active" : "Unavailable"}</span></td><td><div className="admin-row-actions"><Link className="admin-icon-button" to={`/admin/products/${product.id}/edit`}><Pencil size={17} /></Link><button className="admin-danger-button" onClick={async () => { if (!window.confirm(`Archive ${product.name}?`)) return; try { await archiveAdminProduct(product.id); await refresh(); await useCatalogStore.getState().loadCatalog(true); toast.success("Product archived."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to archive product."); } }}>Archive</button></div></td></tr>)}{!loading && !filtered.length && <tr><td colSpan={6}>No products found.</td></tr>}</tbody></table></div><div className="admin-table-footer">{loading ? "Loading…" : `Showing ${filtered.length} of ${products.length} products`}</div></section></div>;
}

function ProductEditor() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", categoryId: "", price: "", stock: "", shortDescription: "", description: "", active: true, featured: false, newArrival: false });
  const product = productId ? products.find((item) => item.id === productId) : undefined;

  useEffect(() => { Promise.all([listAdminProducts(), listAdminCategories()]).then(([p, c]) => { setProducts(p); setCategories(c.filter((item) => item.active)); }).catch((err) => toast.error(err instanceof Error ? err.message : "Unable to load editor.")); }, []);
  useEffect(() => { if (!product) return; setForm({ name: product.name, sku: product.sku, categoryId: product.categoryId, price: String(product.pricePaise / 100), stock: product.stockQuantity == null ? "" : String(product.stockQuantity), shortDescription: product.shortDescription, description: product.description, active: product.active, featured: product.featured, newArrival: product.newArrival }); }, [product]);

  return <div><PageHeader title={productId ? "Edit Product" : "Add Product"} subtitle="Changes are validated and saved through the protected admin API." action={<Link className="admin-outline-button" to="/admin/products"><ArrowLeft size={17} /> Back to Products</Link>} /><form className="admin-editor-grid" onSubmit={async (event) => { event.preventDefault(); if (!form.categoryId) return toast.error("Select a category."); const price = Number(form.price); if (!Number.isFinite(price) || price < 0) return toast.error("Enter a valid price."); setSaving(true); try { const input = { name: form.name.trim(), sku: form.sku.trim(), categoryId: form.categoryId, pricePaise: Math.round(price * 100), stockQuantity: form.stock === "" ? null : Number(form.stock), shortDescription: form.shortDescription.trim(), description: form.description.trim(), active: form.active, featured: form.featured, newArrival: form.newArrival }; if (productId) await updateAdminProduct(productId, input); else await createAdminProduct(input); await useCatalogStore.getState().loadCatalog(true); toast.success(productId ? "Product updated." : "Product created."); navigate("/admin/products"); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to save product."); } finally { setSaving(false); } }}><section className="admin-panel admin-form-card"><h2>Product Information</h2><div className="admin-form-grid"><label className="wide">Product Name<input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>SKU<input required minLength={2} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label><label>Category<select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Choose category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Price (₹)<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label><label>Stock Quantity<input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Unknown" /></label><label className="wide">Short Description<textarea required minLength={2} rows={3} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} /></label><label className="wide">Full Description<textarea required minLength={2} rows={7} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label></div></section><aside className="admin-panel admin-form-card"><h2>Publishing</h2><label className="admin-check-row"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label><label className="admin-check-row"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label><label className="admin-check-row"><input type="checkbox" checked={form.newArrival} onChange={(e) => setForm({ ...form, newArrival: e.target.checked })} /> New arrival</label><div className="admin-upload-placeholder"><Package size={32} /><span>Cloudinary image upload is connected in Phase 7. Existing images are preserved when editing.</span></div><div className="admin-form-actions"><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : productId ? "Save Changes" : "Create Product"}</button><Link className="admin-outline-button" to="/admin/products">Cancel</Link></div></aside></form></div>;
}

function Categories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: "0" });
  const refresh = () => listAdminCategories().then(setCategories).catch((err) => toast.error(err instanceof Error ? err.message : "Unable to load categories."));
  useEffect(() => { void refresh(); }, []);
  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", sortOrder: "0" }); setShowForm(true); };
  const openEdit = (category: AdminCategory) => { setEditing(category); setForm({ name: category.name, description: category.description || "", sortOrder: String(category.sortOrder) }); setShowForm(true); };
  return <div><PageHeader title="Categories" subtitle="Manage the storefront category structure stored in PostgreSQL." action={<button className="admin-primary-button" onClick={openCreate}><Plus size={18} /> Add Category</button>} />{showForm && <form className="admin-panel admin-form-card admin-category-form" onSubmit={async (event) => { event.preventDefault(); try { const input = { name: form.name.trim(), description: form.description.trim() || null, sortOrder: Number(form.sortOrder) || 0, active: true }; if (editing) await updateAdminCategory(editing.id, input); else await createAdminCategory(input); await refresh(); await useCatalogStore.getState().loadCatalog(true); setShowForm(false); toast.success(editing ? "Category updated." : "Category created."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to save category."); } }}><h2>{editing ? "Edit Category" : "Add Category"}</h2><div className="admin-form-grid"><label>Name<input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Sort Order<input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></label><label className="wide">Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label></div><div className="admin-form-actions"><button className="admin-primary-button" type="submit">Save Category</button><button className="admin-outline-button" type="button" onClick={() => setShowForm(false)}>Cancel</button></div></form>}<section className="admin-panel admin-table-panel"><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Category</th><th>Slug</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td><strong>{category.name}</strong><small className="admin-muted">{category.description || "No description"}</small></td><td>{category.slug}</td><td>{category._count?.products ?? "—"}</td><td><span className={`admin-status-pill ${category.active ? "green" : "red"}`}>{category.active ? "Active" : "Archived"}</span></td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={() => openEdit(category)}><Pencil size={17} /></button>{category.active && <button className="admin-danger-button" onClick={async () => { if (!window.confirm(`Archive ${category.name}?`)) return; try { await archiveAdminCategory(category.id); await refresh(); await useCatalogStore.getState().loadCatalog(true); toast.success("Category archived."); } catch (err) { toast.error(err instanceof Error ? err.message : "Unable to archive category."); } }}>Archive</button>}</div></td></tr>)}</tbody></table></div></section></div>;
}

function PendingModule({ title, text }: { title: string; text: string }) {
  return <div><PageHeader title={title} subtitle={text} /><section className="admin-panel"><div className="admin-empty-module"><span><ClipboardList size={30} /></span><h2>{title} backend is not connected yet</h2><p>{text}</p></div></section></div>;
}

function SettingsPage() {
  return <div><PageHeader title="Settings" subtitle="Integration status without exposing credentials." /><div className="admin-settings-grid"><section className="admin-panel admin-form-card"><h2>Authentication</h2><p className="admin-muted">Admin: separate email/password with database-backed secure session cookie.</p><p className="admin-muted">Customers: optional Clerk authentication.</p></section><section className="admin-panel admin-form-card"><h2>Upcoming Integrations</h2><p>Cloudinary → Phase 7</p><p>Razorpay → Phase 8</p><p>Brevo → Phase 9</p></section></div></div>;
}
