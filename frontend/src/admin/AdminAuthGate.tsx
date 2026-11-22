import { useEffect, useState, type ReactNode } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { getAdminSession, loginAdmin, type AdminSession } from "../api/admin";
import { apiBaseUrl } from "../api/catalog";
import { Link } from "react-router-dom";
import { PackageOpen, ImagePlus, Boxes, ChartNoAxesCombined } from "lucide-react";
import "./admin.css";
import "./admin-phase5.css";

type Status = "loading" | "authenticated" | "signed-out" | "unconfigured";

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<AdminSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    if (!apiBaseUrl) {
      setStatus("unconfigured");
      return () => { active = false; };
    }
    getAdminSession()
      .then((data) => {
        if (!active) return;
        setSession(data);
        setStatus("authenticated");
      })
      .catch((err: unknown) => {
        if (!active) return;
        const statusCode = typeof err === "object" && err && "status" in err ? Number((err as { status?: number }).status) : 0;
        setStatus(statusCode === 503 ? "unconfigured" : "signed-out");
      });
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <div className="admin-auth-screen"><LoaderCircle className="admin-auth-spinner" size={34} /><p>Checking admin session…</p></div>;
  }

  if (status === "authenticated" && session) return <>{children}</>;

  return (
    <div className="admin-auth-screen">
      <div className="admin-auth-card">
        <img src="/brand/joyneeds-logo.png" alt="JoyNeeds" />
        <span className="admin-auth-icon"><LockKeyhole size={25} /></span>
        <h1>{status === "unconfigured" ? "Admin panel setup" : "Admin Sign In"}</h1>
        <p>{status === "unconfigured" ? "Your management panel is built, but its secured server connection is not activated yet." : "Secure access to the JoyNeeds administration panel."}</p>

        {status === "unconfigured" ? (
          <div className="admin-auth-notice">
            The product manager connects to your PostgreSQL database through the protected backend.
            Configure <code>VITE_API_URL</code> on the storefront and the backend database,
            admin session and image-storage settings before editing real products.
            No changes can be saved until that connection is active.
          </div>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitting(true);
              setError(null);
              try {
                const data = await loginAdmin(email, password);
                setSession(data);
                setStatus("authenticated");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Unable to sign in.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
            {error && <div className="admin-auth-error" role="alert">{error}</div>}
            <button type="submit" className="admin-primary-button" disabled={submitting}>{submitting ? "Signing in…" : "Sign In"}</button>
          </form>
        )}

        {status === "unconfigured" && (
          <div className="jn-admin-setup-features" aria-label="Admin features available after setup">
            <span><PackageOpen size={17}/> Products & pricing</span>
            <span><Boxes size={17}/> Categories & stock</span>
            <span><ImagePlus size={17}/> Product photographs</span>
            <span><ChartNoAxesCombined size={17}/> Orders & reporting</span>
          </div>
        )}
        <Link to="/">← Back to store</Link>
      </div>
    </div>
  );
}
