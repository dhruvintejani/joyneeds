import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Structural foundation + one authored visual system. No conflicting legacy theme layers.
import "./index.css";
import "./reference.css";
import "./auth/auth.css";
import "./studio.css";
import App from "./App";
import { CustomerAuthProvider } from "./auth/CustomerAuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomerAuthProvider>
      <App />
    </CustomerAuthProvider>
  </StrictMode>,
);
