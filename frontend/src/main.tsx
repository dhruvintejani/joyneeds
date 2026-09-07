import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./premium.css";
import "./reference.css";
import "./reference-polish.css";
import "./auth/auth.css";
import App from "./App";
import { CustomerAuthProvider } from "./auth/CustomerAuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomerAuthProvider>
      <App />
    </CustomerAuthProvider>
  </StrictMode>,
);
