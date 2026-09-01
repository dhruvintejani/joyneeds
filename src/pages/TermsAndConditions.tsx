import { motion } from "framer-motion";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            Terms & Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm"
          >
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </motion.p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 text-sm text-blue-800">
            <p className="leading-relaxed">
              Please read these Terms & Conditions carefully before using JoyNeeds. By accessing and using our website, you agree to be bound by these terms.
            </p>
          </div>

          <Section title="1. Acceptance of Terms">
            <p>By using the JoyNeeds website and placing orders, you agree to these Terms & Conditions. If you do not agree, please do not use our website.</p>
          </Section>

          <Section title="2. Website Usage">
            <p>JoyNeeds is an online retail store providing everyday consumer products. You may use this website for personal, non-commercial shopping purposes. You agree not to misuse the website in any way that could damage, disable, or impair our services.</p>
          </Section>

          <Section title="3. Product Information">
            <p>We make every reasonable effort to ensure that product descriptions, images, and pricing are accurate. However, product images are for illustrative purposes and may not represent the exact product in every detail. We reserve the right to correct errors or inaccuracies at any time.</p>
          </Section>

          <Section title="4. Product Availability">
            <p>All products are subject to availability. We reserve the right to limit quantities or discontinue products at any time. If a product you have ordered becomes unavailable, we will contact you to resolve the situation.</p>
          </Section>

          <Section title="5. Pricing">
            <p>All prices displayed on JoyNeeds are in Indian Rupees (INR). Prices are inclusive of applicable taxes unless otherwise stated. Shipping charges, where applicable, will be communicated separately. We reserve the right to change product prices at any time without prior notice, but price changes will not affect orders that have already been confirmed.</p>
          </Section>

          <Section title="6. Orders and Order Acceptance">
            <p>Placing an order on JoyNeeds constitutes an offer to purchase. An order is only confirmed when we accept it, which we will communicate to you via email or phone. We reserve the right to refuse or cancel any order at our discretion, including in cases of pricing errors, product availability, or suspected fraudulent activity.</p>
          </Section>

          <Section title="7. Payment">
            <p>Online payment through Razorpay will be available shortly. Until then, payment arrangements will be made directly with you via email or phone after your order is placed. You are required to make payment in full before your order is shipped.</p>
          </Section>

          <Section title="8. Shipping">
            <p>Orders are shipped after payment is confirmed. Delivery timelines and shipping charges are outlined in our <a href="/shipping-policy" className="text-blue-600 hover:underline">Shipping Policy</a>. We are not responsible for delays caused by shipping carriers or factors outside our control.</p>
          </Section>

          <Section title="9. Returns and Refunds">
            <p>Returns and refunds are handled in accordance with our <a href="/return-refund-policy" className="text-blue-600 hover:underline">Return & Refund Policy</a>. Please review that policy before placing an order.</p>
          </Section>

          <Section title="10. Cancellations">
            <p>Order cancellation requests are handled in accordance with our <a href="/cancellation-policy" className="text-blue-600 hover:underline">Cancellation Policy</a>.</p>
          </Section>

          <Section title="11. Intellectual Property">
            <p>All content on the JoyNeeds website — including text, images, logos, and design — is the property of JoyNeeds or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content from this website without prior written permission.</p>
          </Section>

          <Section title="12. User Responsibilities">
            <p>You agree to provide accurate and complete information when placing orders. You are responsible for maintaining the confidentiality of any information you provide. You agree not to use the website for any unlawful purpose.</p>
          </Section>

          <Section title="13. Prohibited Activities">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Submit false or misleading orders</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Use automated tools to scrape or extract data from our website</li>
              <li>Engage in fraudulent activity of any kind</li>
            </ul>
          </Section>

          <Section title="14. Limitation of Liability">
            <p>To the maximum extent permitted by applicable law, JoyNeeds shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid for the relevant product(s) giving rise to the claim.</p>
          </Section>

          <Section title="15. Governing Law">
            <p>These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts of India.</p>
          </Section>

          <Section title="16. Changes to These Terms">
            <p>We reserve the right to update these Terms & Conditions at any time. Changes will be posted on this page with an updated date. Your continued use of JoyNeeds after any changes constitutes acceptance of the updated terms.</p>
          </Section>

          <Section title="17. Contact">
            <p>
              For questions regarding these Terms & Conditions:<br /><br />
              <strong>JoyNeeds</strong><br />
              Email: <a href="mailto:dhruvintejani.work@gmail.com" className="text-blue-600 hover:underline">dhruvintejani.work@gmail.com</a><br />
              Phone: <a href="tel:9913871759" className="text-blue-600 hover:underline">9913871759</a>
            </p>
          </Section>
        </motion.div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
        {title}
      </h2>
      <div className="text-slate-600 leading-relaxed space-y-3 text-sm">{children}</div>
    </div>
  );
}
