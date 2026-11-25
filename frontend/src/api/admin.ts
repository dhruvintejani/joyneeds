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

export type AdminProductImage = {
  id: string;
  productId?: string;
  publicId: string | null;
  sourceUrl: string | null;
  secureUrl: string | null;
  altText: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  pricePaise: number;
  originalPricePaise: number | null;
  subcategory: string | null;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  shippingInfo: string | null;
  returnInfo: string | null;
  sku: string;
  stockQuantity: number | null;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK";
  featured: boolean;
  newArrival: boolean;
  active: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string; active: boolean };
  images: AdminProductImage[];
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
  subcategory?: string | null;
  features?: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  shippingInfo?: string | null;
  returnInfo?: string | null;
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
  couponCode?: string | null;
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

  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body && !isFormData ? { "Content-Type": "application/json" } : {}),
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
export const logoutAdmin = () => adminRequest<void>("/api/admin/auth/logout", { method: "POST" });
export const getAdminDashboard = () => adminRequest<AdminDashboard>("/api/admin/dashboard");

export type AdminProductsPage = {
  items: AdminProduct[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
export async function listAdminProductsPage({
  page = 1, limit = 20, q = "", status = "all",
}: { page?: number; limit?: number; q?: string; status?: "active" | "inactive" | "all" } = {}): Promise<AdminProductsPage> {
  const params = new URLSearchParams({
    status, page: String(Math.max(1, Math.floor(page))),
    limit: String(Math.min(100, Math.max(1, Math.floor(limit)))),
  });
  if (q.trim()) params.set("q", q.trim().slice(0, 100));
  return adminRequest<AdminProductsPage>(`/api/admin/products?${params.toString()}`);
}
export async function listAdminProducts() {
  return (await listAdminProductsPage({ limit: 100 })).items;
}

export const getAdminProduct = (id: string) =>
  adminRequest<AdminProduct>(`/api/admin/products/${encodeURIComponent(id)}`);

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

export const listAdminProductImages = (productId: string) =>
  adminRequest<AdminProductImage[]>(`/api/admin/products/${encodeURIComponent(productId)}/images`);

export const uploadAdminProductImages = (productId: string, files: File[]) => {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));
  return adminRequest<AdminProductImage[]>(
    `/api/admin/products/${encodeURIComponent(productId)}/images`,
    { method: "POST", body: form },
  );
};

export const replaceAdminProductImage = (productId: string, imageId: string, file: File) => {
  const form = new FormData();
  form.append("image", file);
  return adminRequest<AdminProductImage[]>(
    `/api/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}/replace`,
    { method: "POST", body: form },
  );
};

export const deleteAdminProductImage = (productId: string, imageId: string) =>
  adminRequest<AdminProductImage[]>(
    `/api/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
    { method: "DELETE" },
  );

export const listAdminCategories = () => adminRequest<AdminCategory[]>("/api/admin/categories");
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

export async function listAdminOrdersPage(status: AdminOrderStatus | "ALL" = "ALL", q = "", page = 1) {
  const params = new URLSearchParams({ status, limit: "25", page: String(page) });
  if (q.trim()) params.set("q", q.trim().slice(0,120));
  const data = await adminRequest<{
    items: AdminOrderListItem[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>(`/api/admin/orders?${params.toString()}`);
  return data;
}
export async function listAdminOrders(status: AdminOrderStatus | "ALL" = "ALL", q = "") { return (await listAdminOrdersPage(status,q)).items; }

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

export type AdminCustomer = { id: string; firstName: string | null; lastName: string | null; email: string | null; createdAt: string; _count: { orders: number } };
export type AdminCustomerDetail = AdminCustomer & { orders: Array<{ id: string; orderNumber: string; status: AdminOrderStatus; totalPaise: number; createdAt: string }> };
export const listAdminCustomers = (q: string, page: number) => adminRequest<{ items: AdminCustomer[]; pagination: { page: number; limit: number; total: number; pages: number } }>("/api/admin/customers?" + new URLSearchParams({ q, page: String(page), limit: "20" }));
export const getAdminCustomer = (id: string) => adminRequest<AdminCustomerDetail>("/api/admin/customers/" + encodeURIComponent(id));

export type AdminPaymentRecord = { id: string; provider: string; status: string; amountPaise: number; refundedAmountPaise: number; currency: string; providerPaymentId: string | null; createdAt: string; order: { id: string; orderNumber: string } };
export type AdminPaymentsPage = { items: AdminPaymentRecord[]; pagination: { page: number; pages: number; total: number; limit: number }; summary: { paidPaise: number; refundedPaise: number; pendingCount: number }; configuration: { provider: string; checkoutEnabled: boolean; paytmConfigured: boolean; razorpayConfigured: boolean } };
export const listAdminPayments = (filters: { q: string; provider: string; status: string; page: number }) => adminRequest<AdminPaymentsPage>("/api/admin/payments?" + new URLSearchParams({ q: filters.q, provider: filters.provider, status: filters.status, page: String(filters.page) }));

export type AdminCoupon={id:string;code:string;percentOff:number;minSubtotalPaise:number;active:boolean;expiresAt:string|null;createdAt:string;updatedAt:string};
export type CouponInput=Pick<AdminCoupon,"code"|"percentOff"|"minSubtotalPaise"|"active"|"expiresAt">;
export const listAdminCoupons=(q:string,page:number)=>adminRequest<{items:AdminCoupon[];total:number;pages:number;page:number}>("/api/admin/coupons?"+new URLSearchParams({q,page:String(page)}));
export const saveAdminCoupon=(value:CouponInput,id?:string)=>adminRequest<AdminCoupon>(id?"/api/admin/coupons/"+encodeURIComponent(id):"/api/admin/coupons",{method:id?"PATCH":"POST",body:JSON.stringify(value)});
export const archiveAdminCoupon=(id:string)=>adminRequest<AdminCoupon>("/api/admin/coupons/"+encodeURIComponent(id),{method:"DELETE"});
export type StoreContent={heroEyebrow:string;heroTitle:string;heroAccent:string;heroDescription:string;announcement:string|null};
export const getAdminContent=()=>adminRequest<StoreContent>("/api/admin/content");
export const saveAdminContent=(value:StoreContent)=>adminRequest<StoreContent>("/api/admin/content",{method:"PUT",body:JSON.stringify(value)});
