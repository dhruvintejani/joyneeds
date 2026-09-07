import { Link } from "react-router-dom";
import { faqs } from "../data/policies";
import { Breadcrumb, PageHeading } from "../components/common/UI";
export default function FAQ() {
  return (
    <div className="container narrow section-bottom">
      <Breadcrumb items={[{ label: "FAQ" }]} />
      <PageHeading title="A few useful answers">
        Shopping, shipping, and everything in between.
      </PageHeading>
      <div className="faq-list">
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <div className="discovery-band">
        <div>
          <h2>Still wondering?</h2>
          <p>We’re happy to hear your question.</p>
        </div>
        <Link className="button secondary" to="/contact">
          Contact us
        </Link>
      </div>
    </div>
  );
}
