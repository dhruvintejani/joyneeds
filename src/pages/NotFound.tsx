import { Link } from "react-router-dom";
import SearchBox from "../components/common/SearchBox";
export default function NotFound() {
  return (
    <div className="container not-found">
      <p className="error-number">404</p>
      <h1>This find got away.</h1>
      <p className="muted">
        The page may have moved, or the address isn’t quite right.
      </p>
      <SearchBox />
      <div className="form-actions">
        <Link className="button primary" to="/">
          Back to Home
        </Link>
        <Link className="button secondary" to="/shop">
          Browse products
        </Link>
      </div>
    </div>
  );
}
