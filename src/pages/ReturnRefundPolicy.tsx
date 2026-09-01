import { motion } from "framer-motion";

export default function ReturnRefundPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            Return & Refund Policy
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
              We want you to be satisfied with your purchase from JoyNeeds. If you experience any issue with your order, please review this policy and contact us. We're here to help.
            </p>
          </div>

          <Section title="1. Return Eligibility">
            <p>A product may be eligible for return if:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The product arrived damaged or defective</li>
              <li>You received the wrong product</li>
              <li>The product does not match its description on the website</li>
              <li>The product is unused and in its original packaging</li>
            </ul>
            <p>Products that have been used, altered, or damaged by the customer are not eligible for return. We reserve the right to assess the condition of any returned product before processing a refund.</p>
          </Section>

          <Section title="2. How to Request a Return">
            <p>To initiate a return, please contact us as soon as possible after receiving your order:</p>
            <p>
              Email: <a href="mailto:dhruvintejani.work@gmail.com" className="text-blue-600 hover:underline">dhruvintejani.work@gmail.com</a><br />
              Phone: <a href="tel:9913871759" className="text-blue-600 hover:underline">9913871759</a>
            </p>
            <p>When contacting us, please provide your order details, the reason for the return, and any relevant photographs (especially in cases of damage or incorrect items).</p>
          </Section>

          <Section title="3. Damaged Products">
            <p>If your product arrives damaged, please document the damage with photographs and contact us immediately. Do not discard the original packaging, as it may be required for the return process.</p>
          </Section>

          <Section title="4. Wrong Products">
            <p>If you receive a product that is different from what you ordered, please contact us immediately. We will arrange for the correct product to be sent or a refund to be issued, as appropriate.</p>
          </Section>

          <Section title="5. Defective Products">
            <p>If a product is found to be defective upon first use, please contact us with details of the defect. We will assess the situation and determine the appropriate resolution.</p>
          </Section>

          <Section title="6. Product Condition for Return">
            <p>Products submitted for return must be:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Unused (unless defective upon first use)</li>
              <li>In original packaging where possible</li>
              <li>Returned with all accessories and components included in the original order</li>
            </ul>
          </Section>

          <Section title="7. Refund Process">
            <p>Once a return is received and verified by our team, we will process a refund. The refund will be issued using the same payment method used for the original purchase where possible.</p>
            <p>Refund timelines may vary depending on your bank or payment provider. We will communicate the expected refund timeline when processing your request.</p>
          </Section>

          <Section title="8. Non-Returnable Products">
            <p>Certain products may not be eligible for return due to hygiene or safety reasons. These include, but may not be limited to, personal care accessories that have been opened or used. This will be clarified on a case-by-case basis when you contact us.</p>
          </Section>

          <Section title="9. Return Shipping">
            <p>Return shipping arrangements will be discussed when you contact us. In cases where the return is due to our error (wrong item, defective product), we will cover reasonable return shipping costs. In other cases, return shipping may be the responsibility of the customer.</p>
          </Section>

          <Section title="10. Contact Us">
            <p>For any return or refund queries, please contact us:</p>
            <p>
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
