import { LogOut, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import { PageBanner } from "../components/common/ReferenceUI";
import { useCustomerAuth } from "../auth/CustomerAuthProvider";

export default function Account() {
  const auth = useCustomerAuth();

  if (!auth.enabled) {
    return (
      <div className="container account-page">
        <PageBanner
          eyebrow="Your account"
          title="Guest shopping is ready"
          subtitle="Customer sign-in is optional and will appear here once Clerk keys are configured."
          compact
        />
        <section className="account-panel account-empty">
          <UserRound size={34} />
          <h2>Customer accounts are not configured yet</h2>
          <p>You can still browse, save your cart and wishlist, and use guest checkout.</p>
        </section>
      </div>
    );
  }

  if (!auth.isLoaded) {
    return (
      <div className="container account-page">
        <section className="account-panel account-empty">
          <p>Loading your account…</p>
        </section>
      </div>
    );
  }

  if (!auth.isSignedIn) {
    return (
      <div className="container account-page">
        <PageBanner
          eyebrow="Your account"
          title="Welcome to JoyNeeds"
          subtitle="Sign in when you want an account. Guest checkout always remains available."
          compact
        />
        <section className="account-panel account-empty">
          <ShieldCheck size={36} />
          <h2>Sign in or create an account</h2>
          <p>Use email/password or any social sign-in method enabled for the JoyNeeds Clerk application.</p>
          <div className="account-actions">
            <button className="account-primary" type="button" onClick={auth.openSignIn}>Sign in</button>
            <button className="account-secondary" type="button" onClick={auth.openSignUp}>Create account</button>
          </div>
        </section>
      </div>
    );
  }

  const displayName = [auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(" ") || "JoyNeeds customer";

  return (
    <div className="container account-page">
      <PageBanner
        eyebrow="Your account"
        title={`Hello, ${auth.user?.firstName || "there"}`}
        subtitle="Your customer profile is connected securely through Clerk."
        compact
      />

      <div className="account-grid">
        <section className="account-panel account-profile">
          <div className="account-avatar">
            {auth.user?.imageUrl ? <img src={auth.user.imageUrl} alt="" /> : <UserRound size={30} />}
          </div>
          <div>
            <small>Profile</small>
            <h2>{displayName}</h2>
            <p>{auth.user?.email || "Email managed by your sign-in provider"}</p>
          </div>
          <button className="account-secondary" type="button" onClick={() => void auth.signOut()}>
            <LogOut size={17} /> Sign out
          </button>
        </section>

        <section className="account-panel account-orders">
          <ShoppingBag size={28} />
          <div>
            <small>Orders</small>
            <h2>Order history comes next</h2>
            <p>Real orders will appear here after the order backend phase. No placeholder purchases are shown.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
