import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Boxes,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAdminOrder,
  listAdminOrders,
  updateAdminOrder,
  type AdminOrder,
  type AdminOrderListItem,
  type AdminOrderStatus,
} from "../api/admin";
import ProductImage from "../components/common/ProductImage";
import "./admin.css";

const money = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

const nextStatuses: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

export default function AdminOrderWorkspace() {
  const { orderId } = useParams();
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand-row">
          <Link to="/admin"><img src="/brand/joyneeds-logo.png" alt="JoyNeeds" /></Link>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink to="/admin"><LayoutDashboard size={20} /> Dashboard</NavLink>
          <NavLink to="/admin/orders" className="active"><ClipboardList size={20} /> Orders</NavLink>
          <NavLink to="/admin/products"><Package size={20} /> Products</NavLink>
          <NavLink to="/admin/categories"><Boxes size={20} /> Categories</NavLink>
        </nav>
        <div className="admin-sidebar-spacer" />
        <Link className="admin-view-store" to="/"><ExternalLink size={18} /> View Store</Link>
      </aside>
      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-global-search"><Search size={18} /><span>Order management</span></div>
          <div className="admin-user-copy"><strong>Admin</strong><small>Secure session</small></div>
        </header>
        <main className="admin-content">
          {orderId ? <OrderDetails orderId={orderId} /> : <OrdersList />}
        </main>
      </div>
    </div>
  );
}

function OrdersList() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [status, setStatus] = useState<AdminOrderStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void listAdminOrders(status, query)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [status, query]);

  const counts = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === "PENDING").length,
    processing: orders.filter((order) => ["CONFIRMED", "PROCESSING"].includes(order.status)).length,
    shipped: orders.filter((order) => order.status === "SHIPPED").length,
  }), [orders]);

  return (
    <div>
      <div className="admin-page-header">
        <div><p className="admin-eyebrow">Orders</p><h1>Orders</h1><p>Real orders from the JoyNeeds order service. No sample orders are shown.</p></div>
      </div>
      <div className="admin-stats-grid">
        <Stat label="Loaded Orders" value={counts.total} />
        <Stat label="Pending" value={counts.pending} />
        <Stat label="Confirmed / Processing" value={counts.processing} />
        <Stat label="Shipped" value={counts.shipped} />
      </div>
      <section className="admin-panel admin-table-panel">
        <div className="admin-filter-row">
          <label className="admin-search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer or email..." /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value as AdminOrderStatus | "ALL")}>
            <option value="ALL">All Status</option>
            {Object.keys(nextStatuses).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        {loading && <div className="admin-empty-module"><p>Loading orders…</p></div>}
        {error && <div className="admin-empty-module"><p role="alert">{error}</p></div>}
        {!loading && !error && !orders.length && <div className="admin-empty-module"><ShoppingBag size={30} /><h2>No orders yet</h2><p>Orders will appear here only after they are actually created.</p></div>}
        {!loading && !error && orders.length > 0 && (
          <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Created</th></tr></thead><tbody>
            {orders.map((order) => <tr key={order.id}>
              <td><Link to={`/admin/orders/${order.id}`}><strong>{order.orderNumber}</strong></Link></td>
              <td><strong>{order.customerName}</strong><br/><small>{order.customerEmail}</small></td>
              <td>{order._count.items}</td>
              <td><strong>{money(order.totalPaise)}</strong></td>
              <td><span className="status-pill">{order.status}</span></td>
              <td>{order.payments[0]?.status ?? "Not started"}</td>
              <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
            </tr>)}
          </tbody></table></div>
        )}
      </section>
    </div>
  );
}

function OrderDetails({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [targetStatus, setTargetStatus] = useState<AdminOrderStatus | "">("");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    void getAdminOrder(orderId)
      .then((data) => {
        setOrder(data);
        setCourier(data.courier ?? "");
        setTrackingNumber(data.trackingNumber ?? "");
        setTrackingUrl(data.trackingUrl ?? "");
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load order."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [orderId]);

  if (loading) return <div className="admin-empty-module"><p>Loading order…</p></div>;
  if (error || !order) return <div className="admin-empty-module"><p role="alert">{error || "Order not found."}</p><Link to="/admin/orders">Back to orders</Link></div>;

  const allowed = nextStatuses[order.status];

  return (
    <div>
      <div className="admin-page-header">
        <div><p className="admin-eyebrow">Orders › Details</p><h1>{order.orderNumber}</h1><p>Created {new Date(order.createdAt).toLocaleString("en-IN")}</p></div>
        <Link className="admin-outline-button" to="/admin/orders"><ArrowLeft size={17} /> All Orders</Link>
      </div>
      <div className="admin-order-layout">
        <div>
          <section className="admin-panel admin-table-panel">
            <div className="admin-panel-heading"><h2>Order Items</h2><span>{order.items.length} item{order.items.length === 1 ? "" : "s"}</span></div>
            <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead><tbody>
              {order.items.map((item) => <tr key={item.id}><td><div className="admin-product-cell">{item.productImage ? <ProductImage src={item.productImage} alt={item.productName} /> : null}<strong>{item.productName}</strong></div></td><td>{item.sku}</td><td>{money(item.pricePaise)}</td><td>{item.quantity}</td><td><strong>{money(item.pricePaise * item.quantity)}</strong></td></tr>)}
            </tbody></table></div>
          </section>
          <section className="admin-panel admin-form-card">
            <h2>Customer & Shipping</h2>
            <p><strong>{order.customerName}</strong><br/>{order.customerEmail}<br/>{order.customerPhone}</p>
            <p>{order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}<br/>{order.city}, {order.state} {order.postalCode}<br/>{order.country}</p>
          </section>
        </div>
        <aside className="admin-panel admin-form-card">
          <h2>Order Status</h2>
          <p><span className="status-pill">{order.status}</span></p>
          <p className="admin-muted">Inventory: {order.inventoryCommittedAt ? "Committed" : "Not committed"}</p>
          <label>Next status<select value={targetStatus} onChange={(event) => setTargetStatus(event.target.value as AdminOrderStatus | "")}><option value="">Choose action</option>{allowed.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Courier<input value={courier} onChange={(event) => setCourier(event.target.value)} placeholder="Optional" /></label>
          <label>Tracking number<input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Optional" /></label>
          <label>Tracking URL<input value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} placeholder="https://..." /></label>
          <button className="admin-primary-button" disabled={!targetStatus || saving} onClick={async () => {
            if (!targetStatus) return;
            setSaving(true);
            try {
              const updated = await updateAdminOrder(order.id, {
                status: targetStatus,
                courier: courier || null,
                trackingNumber: trackingNumber || null,
                trackingUrl: trackingUrl || null,
              });
              setOrder(updated);
              setTargetStatus("");
              toast.success("Order updated");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Unable to update order.");
            } finally {
              setSaving(false);
            }
          }}>{saving ? "Updating…" : "Update Order"}</button>
          <hr />
          <dl><div><dt>Subtotal</dt><dd>{money(order.subtotalPaise)}</dd></div><div><dt>Shipping</dt><dd>{money(order.shippingPaise)}</dd></div><div><dt>Discount</dt><dd>{money(order.discountPaise)}</dd></div><div><dt>Total</dt><dd><strong>{money(order.totalPaise)}</strong></dd></div></dl>
          <p className="admin-muted">Payment integration is added in Phase 8. A pending order is not proof of payment.</p>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <article className="admin-stat-card"><span className="admin-stat-icon blue"><ClipboardList size={22} /></span><div><p>{label}</p><strong>{value}</strong></div></article>;
}
