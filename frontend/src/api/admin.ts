import { apiBaseUrl, CatalogApiError } from "./catalog";

export type AdminSession = {
  authenticated: true;
  admin: true;
  email: string;
  expiresAt?: string;
};

export type AdminDashboard = {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  categories: number;
  orders: number;
  customers: number;
  netRevenuePaise: number;
};

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
  _count?: { products: number };
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  pricePaise: number;
  originalPricePaise: number | null;
  sku: string;
  stockQuantity: number | null;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK";
  featured: boolean;
  newArrival: boolean;
  active: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string; active: boolean };
  images: Array<{
    id: string;
    sourceUrl: string | null;
    secureUrl: string | null;
    altText: string | null;
    sortOrder: number;
  }>;
  addedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductInput = {
  name: string;
  slug?: string;
  shortDescription: string;
  description: string;
  pricePaise: number;
  originalPricePaise?: number | null;
  sku: string;
  stockQuantity?: number | null;
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK";
  featured?: boolean;
  newArrival?: boolean;
  active?: boolean;
  categoryId: string;
};

export type AdminCategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  active?: boolean;
  sortOrder?: number;
};

export type AdminOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalPaise: number;
  currency: string;
  status: AdminOrderStatus;
  inventoryCommittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { items: number };
  payments: Array<{ status: string }>;
};

export type AdminOrder = AdminOrderListItem & {
  userId: string | null;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    sku: string;
    pricePaise: number;
    quantity: number;
    productImage: string | null;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    status: string;
    amountPaise: number;
    refundedAmountPaise: number;
    providerOrderId: string | null;
    providerPaymentId: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new CatalogApiError("The admin API is not configured for this deployment.");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => null)) as
    | { data?: T; error?: { code?: string; message?: string } }
    | null;

  if (!response.ok || !body?.data) {
    const error = new CatalogApiError(
      body?.error?.message || "The admin service returned an unexpected response.",
      response.status,
    );
    (error as CatalogApiError & { code?: string }).code = body?.error?.code;
    throw error;
  }

  return body.data;
}

export const getAdminSession = () => adminRequest<AdminSession>("/api/admin/auth/session");
export const loginAdmin = (email: string, password: string) =>
  adminRequest<AdminSession>("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
export const logoutAdmin = () =>
  adminRequest<void>("/api/admin/auth/logout", { method: "POST" });
export const getAdminDashboard = () => adminRequest<AdminDashboard>("/api/admin/dashboard");

export async function listAdminProducts() {
  const data = await adminRequest<{
    items: AdminProduct[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>("/api/admin/products?status=all&limit=100");
  return data.items;
}

export const createAdminProduct = (input: AdminProductInput) =>
  adminRequest<AdminProduct>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
export const updateAdminProduct = (id: string, input: Partial<AdminProductInput>) =>
  adminRequest<AdminProduct>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
export const archiveAdminProduct = (id: string) =>
  adminRequest<{ id: string; active: boolean; stockStatus: string }>(
    `/api/admin/products/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

export const listAdminCategories = () =>
  adminRequest<AdminCategory[]>("/api/admin/categories");
export const createAdminCategory = (input: AdminCategoryInput) =>
  adminRequest<AdminCategory>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
export const updateAdminCategory = (id: string, input: Partial<AdminCategoryInput>) =>
  adminRequest<AdminCategory>(`/api/admin/categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
export const archiveAdminCategory = (id: string) =>
  adminRequest<AdminCategory>(`/api/admin/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export async function listAdminOrders(status: AdminOrderStatus | "ALL" = "ALL", q = "") {
  const params = new URLSearchParams({ status, limit: "100" });
  if (q.trim()) params.set("q", q.trim());
  const data = await adminRequest<{
    items: AdminOrderListItem[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>(`/api/admin/orders?${params.toString()}`);
  return data.items;
}

export const getAdminOrder = (id: string) =>
  adminRequest<AdminOrder>(`/api/admin/orders/${encodeURIComponent(id)}`);

export const updateAdminOrder = (
  id: string,
  input: {
    status: AdminOrderStatus;
    courier?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
  },
) =>
  adminRequest<AdminOrder>(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
