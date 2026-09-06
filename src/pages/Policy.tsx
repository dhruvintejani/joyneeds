import { Link, useLocation } from "react-router-dom";
import { policies } from "../data/policies";
import { site } from "../config/site";
import { Breadcrumb, PageHeading } from "../components/common/UI";
export default function Policy({ policyKey }: { policyKey?: string }) {
  const location = useLocation();
  const policy =
    policies[policyKey || location.pathname.slice(1)] || policies.terms;
  return (
    <div className="container section-bottom">
      <Breadcrumb items={[{ label: policy.title }]} />
      <PageHeading title={policy.title}>{policy.intro}</PageHeading>
      <div className="policy-layout">
        <nav className="policy-nav" aria-label="Shopping policies">
          {Object.entries(policies).map(([key, p]) => (
            <Link
              key={key}
              to={"/" + key}
              aria-current={p.title === policy.title ? "page" : undefined}
            >
              {p.title}
            </Link>
          ))}
        </nav>
        <article className="prose">
          {!site.policiesVerified && (
            <p className="notice">
              Draft for review · Business-specific details remain unconfirmed.
              This is not a launch-ready policy.
            </p>
          )}
          {policy.sections.map((s, i) => (
            <section key={s.title}>
              <h2>
                {i + 1}. {s.title}
              </h2>
              <p>{s.text}</p>
            </section>
          ))}
          <section>
            <h2>Contact JoyNeeds</h2>
            <p>
              <a href={"mailto:" + site.supportEmail}>{site.supportEmail}</a>
              {site.phone && (
                <>
                  {" "}
                  · <a href={"tel:" + site.phone}>{site.phone}</a>
                </>
              )}
            </p>
            {!site.legalEntityName && (
              <p className="muted small">
                Legal business identity and business address must be supplied
                before sales begin.
              </p>
            )}
          </section>
        </article>
      </div>
    </div>
  );
}
