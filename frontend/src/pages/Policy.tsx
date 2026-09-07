import { Link, useLocation } from "react-router-dom";
import { FileText, Headphones, ShieldCheck } from "lucide-react";
import { policies } from "../data/policies";
import { site } from "../config/site";
import { Breadcrumb } from "../components/common/UI";
import { PageBanner } from "../components/common/ReferenceUI";

export default function Policy({ policyKey }: { policyKey?: string }) {
  const location = useLocation();
  const activeKey = policyKey || location.pathname.slice(1);
  const policy = policies[activeKey] || policies.terms;

  return (
    <div className="container reference-policy-page section-bottom">
      <Breadcrumb items={[{ label: "Policies", to: "/privacy-policy" }, { label: policy.title }]} />
      <PageBanner
        eyebrow="JOYNEEDS POLICIES"
        title={policy.title}
        subtitle={policy.intro}
        compact
      />

      <div className="reference-policy-layout">
        <aside>
          <nav className="reference-policy-nav" aria-label="Shopping policies">
            {Object.entries(policies).map(([key, item]) => (
              <Link
                key={key}
                to={`/${key}`}
                aria-current={item.title === policy.title ? "page" : undefined}
              >
                <FileText size={18} />
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="reference-policy-help">
            <ShieldCheck size={30} />
            <h2>Have a Question?</h2>
            <p>We’re here to help you understand the information on this page.</p>
            <Link className="button secondary" to="/contact">Contact Us</Link>
          </div>
        </aside>

        <article className="reference-policy-content">
          {!site.policiesVerified && (
            <p className="notice">
              Draft for review · Business-specific details remain unconfirmed. This is not a
              launch-ready policy.
            </p>
          )}

          {policy.sections.map((section, index) => (
            <section key={section.title}>
              <span className="reference-policy-number">{index + 1}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </div>
            </section>
          ))}

          <section>
            <span className="reference-policy-number"><Headphones size={18} /></span>
            <div>
              <h2>Contact JoyNeeds</h2>
              <p>
                <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
                {site.phone && <>{" · "}<a href={`tel:${site.phone}`}>{site.phone}</a></>}
              </p>
              {!site.legalEntityName && (
                <p className="muted small">
                  Legal business identity and business address must be supplied before sales begin.
                </p>
              )}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
