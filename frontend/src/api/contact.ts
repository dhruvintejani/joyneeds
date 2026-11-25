import { apiBaseUrl, CatalogApiError } from "./catalog";
export const contactEnabled = async () => {
  if (!apiBaseUrl) return false;
  const response = await fetch(apiBaseUrl + "/api/contact");
  if (!response.ok) return false;
  const result = await response.json() as { data?: { enabled?: boolean } };
  return result.data?.enabled === true;
};
export const sendContactMessage = async (values: { name: string; email: string; message: string; website: string }) => {
  if (!apiBaseUrl) throw new CatalogApiError("Online enquiries are not configured.");
  const response = await fetch(apiBaseUrl + "/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
  const result = await response.json().catch(() => null) as { data?: { accepted?: boolean }; error?: { message?: string } } | null;
  if (!response.ok || !result?.data?.accepted) throw new CatalogApiError(result?.error?.message || "Unable to send your message.", response.status);
};
