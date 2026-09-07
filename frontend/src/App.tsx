import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import MainLayout from "./layouts/MainLayout";
import ScrollToTop from "./components/common/ScrollToTop";
import Toast from "./components/common/Toast";
import ErrorBoundary from "./components/common/ErrorBoundary";
import SEO from "./components/common/SEO";
import { Skeleton } from "./components/common/UI";
import AdminAuthGate from "./admin/AdminAuthGate";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Account = lazy(() => import("./pages/Account"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Policy = lazy(() => import("./pages/Policy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminRouter = lazy(() => import("./admin/AdminPhase5Router"));
const AdminOrderWorkspace = lazy(() => import("./admin/AdminOrderWorkspace"));

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <ScrollToTop />
            <SEO />
            <Toast />
            <Suspense fallback={<Skeleton />}>
              <Routes>
                <Route path="/admin/orders" element={<AdminAuthGate><AdminOrderWorkspace /></AdminAuthGate>} />
                <Route path="/admin/orders/:orderId" element={<AdminAuthGate><AdminOrderWorkspace /></AdminAuthGate>} />
                <Route path="/admin/*" element={<AdminAuthGate><AdminRouter /></AdminAuthGate>} />
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/search" element={<Shop />} />
                  <Route path="/category/:category" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  {["privacy-policy", "terms", "shipping-policy", "return-policy", "refund-cancellation"].map((path) => (
                    <Route path={"/" + path} key={path} element={<Policy />} />
                  ))}
                  <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
                  <Route path="/return-refund-policy" element={<Navigate to="/return-policy" replace />} />
                  <Route path="/cancellation-policy" element={<Navigate to="/refund-cancellation" replace />} />
                  <Route path="/order-success" element={<Navigate to="/checkout" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </MotionConfig>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
