import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            Privacy Policy
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
          className="prose prose-slate max-w-none"
        >
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 text-sm text-blue-800">
            <p className="font-semibold mb-1">About This Policy</p>
            <p className="leading-relaxed">
              This Privacy Policy explains how JoyNeeds collects, uses, and protects your personal information when you use our website and place orders. By using JoyNeeds, you agree to the practices described in this policy.
            </p>
          </div>

          <Section title="1. Information We Collect">
            <p>When you use JoyNeeds, we may collect the following types of personal information:</p>
            <ul>
              <li><strong>Full Name</strong> — provided when placing an order or contacting us</li>
              <li><strong>Email Address</strong> — for order confirmation and communication</li>
              <li><strong>Phone Number</strong> — for order updates and support</li>
              <li><strong>Shipping Address</strong> — including street address, city, state, and PIN code — for delivery purposes</li>
              <li><strong>Order Information</strong> — the products you purchase and transaction details</li>
            </ul>
            <p>We do not collect financial information such as credit card numbers directly. Payment processing, when enabled, will be handled by a third-party payment provider (such as Razorpay) and governed by their privacy policy.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your order — including confirmation, updates, and support</li>
              <li>To contact you regarding payment when required</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To maintain and improve our website and services</li>
            </ul>
            <p>We do not use your personal information for advertising or sell it to third parties.</p>
          </Section>

          <Section title="3. Local Storage and Cart Data">
            <p>JoyNeeds uses your browser's local storage to save your shopping cart between visits. This data is stored locally on your device and includes the products you've added to your cart. This information is not transmitted to our servers unless you complete the checkout process.</p>
            <p>You can clear your cart data at any time by clearing your browser's local storage or by removing items from your cart.</p>
          </Section>

          <Section title="4. Cookies">
            <p>Our website may use essential browser cookies or local storage to ensure the website functions correctly (for example, to maintain your cart session). We do not currently use advertising cookies or tracking cookies.</p>
          </Section>

          <Section title="5. Third-Party Payment Providers">
            <p>When online payment is enabled on JoyNeeds, payments will be processed through a third-party provider such as Razorpay. When you make a payment, you will be interacting with that third party's platform, which has its own privacy policy and terms. We do not store your payment card details.</p>
          </Section>

          <Section title="6. Data Sharing">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following limited circumstances:</p>
            <ul>
              <li>With shipping and logistics partners, to the extent necessary to deliver your order</li>
              <li>With payment processors when a payment transaction occurs</li>
              <li>When required by applicable law or legal process</li>
            </ul>
          </Section>

          <Section title="7. Data Security">
            <p>We take reasonable technical and organisational measures to protect your personal information from unauthorised access, loss, or misuse. However, no data transmission over the internet or storage system is completely secure, and we cannot guarantee absolute security.</p>
          </Section>

          <Section title="8. Data Retention">
            <p>We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, including to process your orders and comply with any applicable legal obligations. If you would like your data deleted, you may contact us and we will handle your request to the extent possible.</p>
          </Section>

          <Section title="9. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information, subject to legal obligations</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p>To exercise any of these rights, please contact us using the details below.</p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>JoyNeeds is not intended for use by persons under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will take steps to remove it.</p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we make material changes, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically.</p>
          </Section>

          <Section title="12. Contact Us">
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:</p>
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
      <div className="text-slate-600 leading-relaxed space-y-3 text-sm">
        {children}
      </div>
    </div>
  );
}
