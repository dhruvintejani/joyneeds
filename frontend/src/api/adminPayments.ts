import { apiBaseUrl, CatalogApiError } from "./catalog";

export type AdminRefundResult = {
  refundId: string;
  amountPaise: number;
  status: string;
  orderId: string;
};

export async function refundAdminOrder(
  orderId: string,
  input: { amountPaise?: number; reason?: string } = {},
): Promise<AdminRefundResult> {
  if (!apiBaseUrl) throw new CatalogApiError("The admin payment API is not configured for this deployment.");
  const response = await fetch(`${apiBaseUrl}/api/admin/orders/${encodeURIComponent(orderId)}/refund`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await response.json().catch(() => null)) as
    | { data?: AdminRefundResult; error?: { code?: string; message?: string } }
    | null;
  if (!response.ok || !body?.data) {
    const error = new CatalogApiError(
      body?.error?.message || "Unable to request the refund.",
      response.status,
    );
    (error as CatalogApiError & { code?: string }).code = body?.error?.code;
    throw error;
  }
  return body.data;
}
