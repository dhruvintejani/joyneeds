import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { site } from "../config/site";
export default function MainLayout() {
  const [offline, setOffline] = useState(!navigator.onLine);
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
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
