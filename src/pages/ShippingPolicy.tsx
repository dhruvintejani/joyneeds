import { motion } from "framer-motion";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            Shipping Policy
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
              This Shipping Policy explains how JoyNeeds handles the shipping and delivery of your orders. Please read it carefully before placing an order.
            </p>
          </div>

          <Section title="1. Order Processing">
            <p>After your order is placed, our team will contact you to confirm the order and arrange payment. Orders are processed and prepared for shipment after payment is confirmed.</p>
            <p>Order processing typically takes <strong>1–3 business days</strong> from the time payment is confirmed, though this may vary depending on product availability and order volume.</p>
          </Section>

          <Section title="2. Shipping and Delivery">
            <p>JoyNeeds ships orders across India. Once your order has been dispatched, you will be notified with any available tracking or delivery information.</p>
            <p>Estimated delivery timelines may vary depending on your location and the shipping carrier. While we aim to get your order to you as quickly as possible, we cannot guarantee specific delivery dates as these are determined by the shipping carrier.</p>
          </Section>

          <Section title="3. Shipping Charges">
            <p>Shipping charges, if any, will be communicated to you during the order confirmation process. Charges may vary based on your delivery location, order size, and weight.</p>
            <p>Any promotional free shipping offers, where available, will be clearly stated at the time of the offer.</p>
          </Section>

          <Section title="4. Serviceability">
            <p>We ship to most serviceable locations within India. If we are unable to ship to your location, we will inform you promptly after you place your order. In such cases, you will not be charged.</p>
          </Section>

          <Section title="5. Delivery Delays">
            <p>While we make every effort to ensure timely delivery, delays may occasionally occur due to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>High order volumes</li>
              <li>Natural events, strikes, or circumstances beyond our control</li>
              <li>Delays caused by shipping carriers</li>
              <li>Incorrect or incomplete delivery address provided by the customer</li>
              <li>Public holidays</li>
            </ul>
            <p>JoyNeeds is not responsible for delays caused by shipping carriers or external circumstances. If your order is significantly delayed, please contact us and we will do our best to assist.</p>
          </Section>

          <Section title="6. Incorrect Delivery Address">
            <p>Please ensure that the delivery address you provide at checkout is accurate and complete. JoyNeeds is not responsible for failed deliveries or delays resulting from an incorrect address provided by the customer. If you realise you've entered an incorrect address, please contact us immediately after placing your order.</p>
          </Section>

          <Section title="7. Damaged or Lost Packages">
            <p>If your order arrives visibly damaged, please document the damage and contact us as soon as possible. We will work with you to investigate and resolve the issue.</p>
            <p>If your package appears to have been lost in transit, please contact us so we can initiate an inquiry with the shipping carrier.</p>
          </Section>

          <Section title="8. Contact Us">
            <p>For any shipping-related questions or concerns, please contact us:</p>
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
