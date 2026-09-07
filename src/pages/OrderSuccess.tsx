import { Navigate } from "react-router-dom";
// No order-confirmation route is permitted until orders can be verified server-side.
export default function OrderSuccess() {
  return <Navigate to="/checkout" replace />;
}
