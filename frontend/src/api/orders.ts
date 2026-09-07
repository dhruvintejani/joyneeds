import { apiBaseUrl, CatalogApiError } from "./catalog";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string;
  pricePaise: number;
  quantity: number;
  productImage: string | null;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalPaise: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments?: Array<{
    status: string;
    amountPaise: number;
    refundedAmountPaise: number;
  }>;
};

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  items: Array<{ productId: string; quantity: number }>;
};

export type CreatedOrder = CustomerOrder & {
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  paymentReady: boolean;
  inventoryReserved: boolean;
  note: string;
};

type CustomerCart = { items: Array<{ productId: string; quantity: number }> };

async function request<T>(path: string, init?: RequestInit, token?: string | null): Promise<T> {
  if (!apiBaseUrl) throw new CatalogApiError("The order API is not configured for this deployment.");
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => null)) as
    | { data?: T; error?: { code?: string; message?: string } }
    | null;
  if (!response.ok || !body?.data) {
    const error = new CatalogApiError(
      body?.error?.message || "The order service returned an unexpected response.",
      response.status,
    );
    (error as CatalogApiError & { code?: string }).code = body?.error?.code;
    throw error;
  }
  return body.data;
}

export const createOrder = (input: CreateOrderInput, token?: string | null) =>
  request<CreatedOrder>(
    "/api/orders",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );

export const getCustomerOrders = (token: string) =>
  request<CustomerOrder[]>("/api/account/orders", undefined, token);

export const getCustomerCart = (token: string) =>
  request<CustomerCart>("/api/account/cart", undefined, token);

export const syncCustomerCart = (
  items: Array<{ productId: string; quantity: number }>,
  token: string,
) =>
  request<CustomerCart>(
    "/api/account/cart",
    { method: "PUT", body: JSON.stringify({ items }) },
    token,
  );
