import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { contactEnabled, sendContactMessage } from "../api/contact";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { FileText, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { site } from "../config/site";
import FormField from "../components/common/FormField";
import { Breadcrumb, Button } from "../components/common/UI";
import { PageBanner } from "../components/common/ReferenceUI";

const schema = Yup.object({
  name: Yup.string().trim().min(2, "Enter your name").max(80).required("Name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  message: Yup.string()
    .trim()
    .min(10, "Please add a little more detail")
    .max(2000)
    .required("Message is required"),
});

export default function Contact() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => { let active = true; void contactEnabled().then(value => { if (active) setEnabled(value); }).catch(() => undefined); return () => { active = false; }; }, []);
  return (
    <div className="container reference-contact-page section-bottom">
      <Breadcrumb items={[{ label: "Contact us" }]} />
      <PageBanner
        theme="contact"
        eyebrow="CONTACT JOYNEEDS"
        title="We’re here to help."
        subtitle="Have a product question, need help finding a policy, or just want to say hello? Reach out using the confirmed contact details below."
        compact
      />

      <section className="reference-contact-cards" aria-label="Contact options">
        <article>
          <span><Mail size={22} /></span>
          <div><h3>Email Us</h3><a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a></div>
        </article>
        {site.phone && (
          <article>
            <span><Phone size={22} /></span>
            <div><h3>Call Us</h3><a href={`tel:${site.phone}`}>{site.phone}</a></div>
          </article>
        )}
        <article>
          <span><MessageCircle size={22} /></span>
          <div><h3>Quick Answers</h3><Link to="/faq">Browse the FAQ</Link></div>
        </article>
        <article>
          <span><FileText size={22} /></span>
          <div><h3>Policies</h3><Link to="/shipping-policy">Shipping & returns information</Link></div>
        </article>
      </section>

      <div className="reference-contact-layout">
        <section className="reference-contact-form-card">
          <p className="reference-kicker">SEND US A MESSAGE</p>
          <h2>We’d love to hear from you.</h2>
          <p className="muted">{enabled ? "Send your message directly to our support inbox." : "This form opens a draft in your email app. It does not send automatically."}</p>

          <Formik
            initialValues={{ name: "", email: "", message: "", website: "" }}
            validationSchema={schema}
            onSubmit={async (values, { setStatus, setSubmitting, resetForm }) => {
              if (enabled) {
                setStatus(undefined);
                try { await sendContactMessage(values); resetForm(); setStatus("Your message was accepted for delivery. Thank you for contacting JoyNeeds."); }
                catch (error) { setStatus(error instanceof Error ? error.message : "Unable to send your message. Please use the support email."); }
                finally { setSubmitting(false); }
                return;
              }
              window.location.href =
                `mailto:${site.supportEmail}?subject=${encodeURIComponent(`JoyNeeds enquiry from ${values.name}`)}` +
                `&body=${encodeURIComponent(`${values.message}\n\nName: ${values.name}\nReply email: ${values.email}`)}`;
              setStatus(
                "Your email app was requested. Review and send the draft there. If it did not open, email us directly using the address on this page.",
              );
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, status }) => (
              <Form noValidate>
                <div hidden aria-hidden="true"><label>Leave this field empty<Field name="website" tabIndex={-1} autoComplete="off" /></label></div>
                <div className="form-grid">
                  <FormField label="Your name" name="name" autoComplete="name" required maxLength={80} />
                  <FormField label="Your email" name="email" type="email" autoComplete="email" required />
                </div>
                <FormField label="Your message" name="message" multiline required maxLength={2000} />
                <p className="muted small">
                  Please do not include passwords, card details, or other sensitive information.
                </p>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending…" : enabled ? "Send message" : "Open email draft"}
                </Button>
                {status && <p role="status" className="notice">{status}</p>}
              </Form>
            )}
          </Formik>
        </section>

        <aside className="reference-contact-aside">
          <div className="reference-contact-aside-image" aria-hidden="true">
            <img src="/reference/reference-home.webp" alt="" />
          </div>
          <div className="reference-contact-aside-copy">
            <p className="reference-kicker">A CALMER SUPPORT EXPERIENCE</p>
            <h2>Let’s make the answer easy to find.</h2>
            <p>
              Product details, policies and FAQs are kept visible so you can find answers before
              needing to contact us.
            </p>
            <ul>
              <li className="jn-icon-row"><ShieldCheck size={18} aria-hidden="true" /><span>No payment details requested here</span></li>
              <li className="jn-icon-row"><FileText size={18} aria-hidden="true" /><span>Policies are linked throughout the store</span></li>
              <li className="jn-icon-row"><MessageCircle size={18} aria-hidden="true" /><span>Direct email support remains available</span></li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="reference-quick-help">
        <div>
          <h2>Need Quick Help?</h2>
          <p>Find answers to common questions.</p>
        </div>
        <div>
          <Link to="/faq">Frequently Asked Questions</Link>
          <Link to="/return-policy">Returns information</Link>
          <Link to="/shipping-policy">Shipping information</Link>
          <Link to="/privacy-policy">Privacy</Link>
        </div>
      </section>
    </div>
  );
}
