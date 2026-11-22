import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ChartNoAxesCombined, ImagePlus, Boxes, LoaderCircle, LockKeyhole, PackageOpen, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminSession, loginAdmin, type AdminSession } from "../api/admin";
import { apiBaseUrl } from "../api/catalog";
import "./admin.css";
import "./admin-phase5.css";

type Status = "loading" | "authenticated" | "signed-out" | "unconfigured" | "unavailable";

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(apiBaseUrl ? "loading" : "unconfigured");
  const [session, setSession] = useState<AdminSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const checkSession = useCallback(async () => {
    if (!apiBaseUrl) {
      setStatus("unconfigured");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const data = await getAdminSession();
      setSession(data);
      setStatus("authenticated");
    } catch (cause) {
      const code = typeof cause === "object" && cause !== null && "status" in cause
        ? Number((cause as { status?: unknown }).status)
        : 0;
      setSession(null);
      if (code === 401) setStatus("signed-out");
      else if (code === 503) setStatus("unconfigured");
      else {
        setStatus("unavailable");
        setError("Unable to contact the protected admin service. Check the backend URL and network connection.");
      }
    }
  }, []);

  useEffect(() => { void checkSession(); }, [checkSession]);

  if (status === "loading") {
    return <div className="admin-auth-screen" role="status">
      <LoaderCircle className="admin-auth-spinner" size={34}/>
      <p>Checking your secure admin session…</p>
    </div>;
  }

  if (status === "authenticated" && session) return <>{children}</>;

  return (
    <div className="admin-auth-screen">
      <div className="admin-auth-card">
        <img src="/brand/joyneeds-logo.png" alt="JoyNeeds"/>
        <span className="admin-auth-icon"><LockKeyhole size={25}/></span>
        <h1>{status === "signed-out" ? "Admin sign in" :
             status === "unavailable" ? "Admin service unavailable" :
             "Admin panel setup"}</h1>
        <p>{status === "signed-out"
          ? "Authorized administrators can manage the store through a protected session."
          : status === "unavailable"
            ? "The admin service could not be reached. No product data has been changed."
            : "The protected admin workspace is ready for backend and database configuration."}</p>

        {status === "signed-out" ? (
          <form onSubmit={async (event) => {
            event.preventDefault();
            if (submitting) return;
            setSubmitting(true);
            setError(null);
            try {
              const data = await loginAdmin(email, password);
              setSession(data);
              setPassword("");
              setStatus("authenticated");
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Unable to sign in.");
            } finally {
              setSubmitting(false);
            }
          }}>
            <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required/></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8}/></label>
            {error && <div className="admin-auth-error" role="alert">{error}</div>}
            <button type="submit" className="admin-primary-button" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in securely"}
            </button>
          </form>
        ) : (
          <>
            <div className="admin-auth-notice" role="status">
              {status === "unavailable" ? error : <>
                Connect <code>VITE_API_URL</code> to your deployed secured API.
                Set <code>DATABASE_URL</code>, <code>ADMIN_EMAIL</code>, and a bcrypt
                <code>ADMIN_PASSWORD_HASH</code> on the backend. No demo admin access
                or plaintext passwords are enabled.
              </>}
            </div>
            <button className="admin-primary-button" type="button" onClick={() => void checkSession()}>
              <RefreshCw size={16}/> Check connection again
            </button>
            <div className="jn-admin-setup-features" aria-label="Features available after setup">
              <span><PackageOpen size={17}/> Products & pricing</span>
              <span><Boxes size={17}/> Categories & stock</span>
              <span><ImagePlus size={17}/> Product photos</span>
              <span><ChartNoAxesCombined size={17}/> Orders & reporting</span>
            </div>
          </>
        )}
        <Link to="/"><ArrowLeft size={15}/> Back to store</Link>
      </div>
    </div>
  );
}
