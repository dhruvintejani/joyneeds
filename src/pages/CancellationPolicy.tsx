import { motion } from "framer-motion";

export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            Cancellation Policy
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
              If you need to cancel your order, please act quickly and contact us as soon as possible. This policy explains when and how cancellations may be made at JoyNeeds.
            </p>
          </div>

          <Section title="1. How to Request a Cancellation">
            <p>To request a cancellation, please contact us immediately after placing your order:</p>
            <p>
              Email: <a href="mailto:dhruvintejani.work@gmail.com" className="text-blue-600 hover:underline">dhruvintejani.work@gmail.com</a><br />
              Phone: <a href="tel:9913871759" className="text-blue-600 hover:underline">9913871759</a>
            </p>
            <p>Please include your order details and the reason for cancellation in your message.</p>
          </Section>

          <Section title="2. Before Order Processing">
            <p>Cancellations are most easily accommodated before your order has been processed or payment has been arranged. If you contact us promptly after placing your order, we will do our best to cancel it without issue.</p>
          </Section>

          <Section title="3. After Order Processing">
            <p>Once an order has been confirmed and payment arranged, cancellation may still be possible but cannot be guaranteed. We will assess each request on a case-by-case basis.</p>
          </Section>

          <Section title="4. After Shipment">
            <p>Once an order has been dispatched, it cannot be cancelled. If you no longer wish to receive the item after it has been shipped, you may need to refuse delivery or refer to our <a href="/return-refund-policy" className="text-blue-600 hover:underline">Return & Refund Policy</a> once the item is delivered.</p>
          </Section>

          <Section title="5. Refunds for Cancelled Orders">
            <p>If an order is successfully cancelled before payment is made, no charge will be applied.</p>
            <p>If payment has already been made at the time of cancellation, a refund will be initiated using the same payment method. Refund timelines may vary depending on your bank or payment provider. We will communicate the expected timeline when processing your refund.</p>
          </Section>

          <Section title="6. Orders Cancelled by JoyNeeds">
            <p>In rare circumstances, JoyNeeds may need to cancel an order — for example, due to product unavailability, payment issues, or errors in pricing. In such cases, we will inform you promptly and process a full refund if payment has been made.</p>
          </Section>

          <Section title="7. Contact Us">
            <p>For cancellation requests or related questions, please contact us:</p>
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
