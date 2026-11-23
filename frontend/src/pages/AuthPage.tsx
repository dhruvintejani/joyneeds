import { SignIn, SignUp } from "@clerk/react";
import { ArrowLeft, ArrowRight, Heart, LockKeyhole, PackageCheck, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useCustomerAuth } from "../auth/CustomerAuthProvider";

/**
 * Dedicated customer authentication pages. Clerk owns credentials and MFA,
 * so this page never stores user passwords or simulates a successful login.
 */
export default function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  const auth = useCustomerAuth();
  const creating = mode === "sign-up";

  if (auth.enabled && auth.isLoaded && auth.isSignedIn) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="jn-auth-page container">
      <nav className="jn-auth-breadcrumb" aria-label="Account navigation">
        <Link to="/"><ArrowLeft size={15} /> Back to the store</Link>
        <span>/</span><span>{creating ? "Create account" : "Sign in"}</span>
      </nav>

      <div className="jn-auth-layout">
        <section className="jn-auth-story" aria-label="JoyNeeds experience">
          <div className="jn-auth-story-shade"/>
          <div className="jn-auth-story-content">
            <span className="jn-auth-kicker"><Sparkles size={15} /> A LITTLE MORE JOY, EVERY DAY</span>
            <h1>{creating ? <>Make room for <em>the good things.</em></> : <>Welcome back to <em>your everyday.</em></>}</h1>
            <p>Useful finds, simple shopping and thoughtful little details. Discover what makes every day better.</p>
            <div className="jn-auth-story-benefits">
              <span><Heart size={18}/> Save favorite finds</span>
              <span><PackageCheck size={18}/> Revisit your shopping bag</span>
              <span><ShieldCheck size={18}/> Protected sign-in when available</span>
            </div>
          </div>
        </section>

        <section className="jn-auth-surface" aria-labelledby="customer-auth-title">
          <div className="jn-auth-header">
            <span className="jn-auth-icon"><UserRound size={23}/></span>
            <p className="jn-overline">JOYNEEDS CUSTOMER ACCESS</p>
            <h2 id="customer-auth-title">{creating ? "Create an account" : "Sign in to JoyNeeds"}</h2>
            <p>{creating
              ? "Keep your favorite finds close, and make your next visit even easier."
              : "Your saved favorites and shopping bag are just a moment away."}</p>
          </div>

          <nav className="jn-auth-mode-nav" aria-label="Customer account pages">
            <Link
              to="/sign-in"
              className={creating ? "jn-auth-mode-link" : "jn-auth-mode-link is-active"}
              aria-current={creating ? undefined : "page"}
            >Sign in</Link>
            <Link
              to="/sign-up"
              className={creating ? "jn-auth-mode-link is-active" : "jn-auth-mode-link"}
              aria-current={creating ? "page" : undefined}
            >Create account</Link>
          </nav>

          {auth.enabled ? (
            <div className="jn-auth-provider" aria-label={creating ? "Secure account registration" : "Secure account sign-in"}>
              {auth.isLoaded ? (
                creating
                  ? <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/account" />
                  : <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/account" />
              ) : <p className="jn-auth-loading" role="status">Loading secure account access…</p>}
            </div>
          ) : (
            <div className="jn-auth-disabled" role="status">
              <span><LockKeyhole size={25}/></span>
              <strong>{creating ? "Account registration is not active yet" : "Customer sign-in is not active yet"}</strong>
              <p>{creating
                ? "This is the signup page. New accounts can be created once secure Clerk authentication is connected. Until then, you can browse products and save favorites on this device."
                : "This is the login page. Signing in requires the secure Clerk connection to be configured. Until then, you can browse products and save favorites on this device."}</p>
              <Link className="jn-auth-continue" to="/shop">Explore products <ArrowRight size={17}/></Link>
            </div>
          )}

          <div className="jn-auth-switch">
            {creating ? <>Already have an account? <Link to="/sign-in">Sign in</Link></>
              : <>New to JoyNeeds? <Link to="/sign-up">Create an account</Link></>}
          </div>
          <p className="jn-auth-inline-note">
            <ShieldCheck className="jn-auth-inline-icon" size={16} aria-hidden="true" />{"\u00a0"}Account access is managed by our secure authentication provider when enabled.
          </p>
        </section>
      </div>
    </div>
  );
}
