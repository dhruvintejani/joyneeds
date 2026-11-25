import { Toaster } from "react-hot-toast";
export default function Toast() {
  return <Toaster position="top-right" gutter={10} containerStyle={{ top: 20, right: 20, left: 20 }} toastOptions={{
    duration: 3500,
    style: { background: "#ffffff", color: "#214d37", border: "1px solid #d7eadc", borderRadius: "14px", padding: "13px 16px", fontSize: "14px", fontWeight: "500", boxShadow: "0 12px 36px rgba(23,68,45,.13)", maxWidth: "380px" },
    success: { iconTheme: { primary: "#2c8052", secondary: "#ffffff" } },
    error: { iconTheme: { primary: "#b54747", secondary: "#ffffff" }, style: { borderColor: "#efd6d6", color: "#5c3030" } },
    loading: { iconTheme: { primary: "#2c8052", secondary: "#e2f2e7" } },
  }}/>;
}
