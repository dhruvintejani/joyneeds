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

          {auth.enabled ? (
            <div className="jn-auth-provider" aria-label={creating ? "Secure account registration" : "Secure account sign-in"}>
              {auth.isLoaded ? (
                creating
                  ? <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
                  : <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
              ) : <p className="jn-auth-loading" role="status">Loading secure account access…</p>}
            </div>
          ) : (
            <div className="jn-auth-disabled" role="status">
              <span><LockKeyhole size={25}/></span>
              <strong>Customer accounts are being prepared</strong>
              <p>Sign-in and registration will become available after the secure authentication service is configured. You can explore the collection and save favorites on this device in the meantime.</p>
              <Link className="jn-auth-continue" to="/shop">Explore products <ArrowRight size={17}/></Link>
            </div>
          )}

          <div className="jn-auth-switch">
            {creating ? <>Already have an account? <Link to="/sign-in">Sign in</Link></>
              : <>New to JoyNeeds? <Link to="/sign-up">Create an account</Link></>}
          </div>
          <div className="jn-auth-footnote"><ShieldCheck size={15}/> Account access is managed by our secure authentication provider when enabled.</div>
        </section>
      </div>
    </div>
  );
}
