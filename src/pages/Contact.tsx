import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { site } from "../config/site";
import FormField from "../components/common/FormField";
import { Breadcrumb, PageHeading, Button } from "../components/common/UI";
const schema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Enter your name")
    .max(80)
    .required("Name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  message: Yup.string()
    .trim()
    .min(10, "Please add a little more detail")
    .max(2000)
    .required("Message is required"),
});
export default function Contact() {
  return (
    <div className="container section-bottom">
      <Breadcrumb items={[{ label: "Contact us" }]} />
      <PageHeading title="Let’s make it simple.">
        A product question or something else? Get in touch.
      </PageHeading>
      <div className="contact-grid">
        <div>
          <h2>Contact JoyNeeds</h2>
          <dl className="contact-details">
            <div>
              <dt>Email</dt>
              <dd>
                <a className="text-link" href={"mailto:" + site.supportEmail}>
                  {site.supportEmail}
                </a>
              </dd>
            </div>
            {site.phone && (
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={"tel:" + site.phone}>{site.phone}</a>
                </dd>
              </div>
            )}
            {site.businessAddress && (
              <div>
                <dt>Business address</dt>
                <dd>{site.businessAddress}</dd>
              </div>
            )}
            {site.legalEntityName && (
              <div>
                <dt>Operated by</dt>
                <dd>{site.legalEntityName}</dd>
              </div>
            )}
          </dl>
          <div className="notice">
            <h3>A quick answer might be here</h3>
            <p>Browse ordering, delivery, and returns information.</p>
            <Link to="/faq" className="text-link">
              Read the FAQ →
            </Link>
          </div>
        </div>
        <div className="panel">
          <h2>Write us a message</h2>
          <p className="muted">
            This form opens a draft in your email app. It does not send
            automatically.
          </p>
          <Formik
            initialValues={{ name: "", email: "", message: "" }}
            validationSchema={schema}
            onSubmit={(v, { setStatus, setSubmitting }) => {
              window.location.href =
                "mailto:" +
                site.supportEmail +
                "?subject=" +
                encodeURIComponent("JoyNeeds enquiry from " + v.name) +
                "&body=" +
                encodeURIComponent(
                  v.message +
                    "\n\nName: " +
                    v.name +
                    "\nReply email: " +
                    v.email,
                );
              setStatus(
                "Your email app was requested. Review and send the draft there. If it did not open, email us directly using the address on this page.",
              );
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, status }) => (
              <Form noValidate>
                <FormField
                  label="Your name"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={80}
                />
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
                <FormField
                  label="Your message"
                  name="message"
                  multiline
                  required
                  maxLength={2000}
                />
                <p className="muted small">
                  Please do not include passwords, card details, or other
                  sensitive information.
                </p>
                <Button type="submit" disabled={isSubmitting}>
                  Open email draft
                </Button>
                {status && (
                  <p role="status" className="notice">
                    {status}
                  </p>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
