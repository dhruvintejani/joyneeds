import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { site } from "../config/site";
import { useCatalogStore } from "../store/catalogStore";

export default function MainLayout() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const location = useLocation();
  const loadCatalog = useCatalogStore((state) => state.loadCatalog);
  const catalogStatus = useCatalogStore((state) => state.status);
  const catalogError = useCatalogStore((state) => state.error);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      {!site.catalogVerified && (
        <div className="prelaunch">
          Preview catalog · Product details are being confirmed. Orders and
          payments are not open.
        </div>
      )}
      {offline && (
        <div role="status" className="offline">
          You’re offline. Some pages and photos may not be available.
        </div>
      )}
      {catalogStatus === "error" && (
        <div role="alert" className="offline">
          {catalogError || "The product catalog is temporarily unavailable."}{" "}
          <button className="text-link" onClick={() => void loadCatalog(true)}>
            Retry
          </button>
        </div>
      )}
      <main id="main-content" tabIndex={-1}>
        <motion.div
          className="page-transition"
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
