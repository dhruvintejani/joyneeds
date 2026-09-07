import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleHelp, Headphones, Search } from "lucide-react";
import { faqs } from "../data/policies";
import { Breadcrumb } from "../components/common/UI";
import { PageBanner } from "../components/common/ReferenceUI";

export default function FAQ() {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return faqs;
    return faqs.filter(([question, answer]) =>
      `${question} ${answer}`.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <div className="container reference-faq-page section-bottom">
      <Breadcrumb items={[{ label: "FAQ" }]} />
      <PageBanner
        eyebrow="HELP CENTER"
        title="Frequently Asked Questions"
        subtitle="Find quick answers about browsing, checkout, policies and the current JoyNeeds preview."
        compact
      />

      <label className="reference-faq-search">
        <Search size={19} />
        <span className="sr-only">Search frequently asked questions</span>
        <input
          type="search"
          placeholder="Search your question…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="reference-faq-layout">
        <section className="reference-faq-list" aria-label="Frequently asked questions">
          <div className="reference-faq-title">
            <CircleHelp size={21} />
            <strong>{visible.length} answer{visible.length !== 1 ? "s" : ""}</strong>
          </div>
          {visible.map(([question, answer], index) => (
            <details key={question} open={index === 0 && !query}>
              <summary>
                <span>{index + 1}.</span>
                {question}
              </summary>
              <p>{answer}</p>
            </details>
          ))}
          {!visible.length && (
            <div className="reference-empty-panel">
              No FAQ matches that search. Try another phrase or contact us directly.
            </div>
          )}
        </section>

        <aside className="reference-faq-aside">
          <span><Headphones size={34} /></span>
          <h2>Still Have Questions?</h2>
          <p>Send us your question and we’ll point you to the right information.</p>
          <Link className="button primary" to="/contact">Contact Support</Link>
          <div className="reference-faq-aside-image" aria-hidden="true">
            <img src="/reference/reference-home.webp" alt="" />
            <span className="reference-script">Small questions. Clear answers.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
