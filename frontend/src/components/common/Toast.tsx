import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#1e293b",
          color: "#f8fafc",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        },
        success: {
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
