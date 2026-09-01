import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail, Phone } from "lucide-react";

type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

const faqs: FAQItem[] = [
  {
    question: "How can I place an order?",
    answer: (
      <>
        Browse our products at <Link to="/shop" className="text-blue-600 hover:underline">the shop</Link>, select the items you'd like, add them to your cart, and proceed to checkout. Fill in your delivery details and place your order.
      </>
    ),
  },
  {
    question: "What payment methods are available?",
    answer:
      "Online payment via Razorpay will be enabled shortly. Currently, after you place an order, our team will contact you on your provided phone number or email to confirm payment and proceed with shipping.",
  },
  {
    question: "How does shipping work?",
    answer: (
      <>
        Once your order is confirmed and payment is arranged, we will ship your products. Orders are typically processed within 1–3 business days. Please refer to our{" "}
        <Link to="/shipping-policy" className="text-blue-600 hover:underline">Shipping Policy</Link> for more details.
      </>
    ),
  },
  {
    question: "How can I request a return?",
    answer: (
      <>
        If you'd like to return a product, please contact us at{" "}
        <a href="mailto:dhruvintejani.work@gmail.com" className="text-blue-600 hover:underline">dhruvintejani.work@gmail.com</a> or call{" "}
        <a href="tel:9913871759" className="text-blue-600 hover:underline">9913871759</a>. Please review our{" "}
        <Link to="/return-refund-policy" className="text-blue-600 hover:underline">Return & Refund Policy</Link> for eligibility details.
      </>
    ),
  },
  {
    question: "How are refunds handled?",
    answer: (
      <>
        Refunds are processed after the returned product is received and verified. Please see our{" "}
        <Link to="/return-refund-policy" className="text-blue-600 hover:underline">Return & Refund Policy</Link> for full details on the refund process and timelines.
      </>
    ),
  },
  {
    question: "How can I contact JoyNeeds?",
    answer: (
      <>
        You can reach us by email at{" "}
        <a href="mailto:dhruvintejani.work@gmail.com" className="text-blue-600 hover:underline">dhruvintejani.work@gmail.com</a>{" "}
        or by phone at{" "}
        <a href="tel:9913871759" className="text-blue-600 hover:underline">9913871759</a>. We respond to all inquiries personally.
      </>
    ),
  },
  {
    question: "Can I cancel an order?",
    answer: (
      <>
        You may request a cancellation by contacting us as soon as possible after placing your order. Cancellations are more easily accommodated before an order is shipped. Please review our{" "}
        <Link to="/cancellation-policy" className="text-blue-600 hover:underline">Cancellation Policy</Link> for full details.
      </>
    ),
  },
  {
    question: "Where can I find product information?",
    answer: (
      <>
        Each product page includes a description, key features, SKU, stock status, shipping information, and return information. Visit{" "}
        <Link to="/shop" className="text-blue-600 hover:underline">the shop</Link> to browse all products.
      </>
    ),
  },
  {
    question: "Do products come with a warranty?",
    answer:
      "Warranty terms vary by product and manufacturer. If you have a question about a specific product's warranty, please contact us directly.",
  },
  {
    question: "What if I receive a damaged or wrong product?",
    answer: (
      <>
        If you receive a damaged or incorrect product, please contact us immediately at{" "}
        <a href="mailto:dhruvintejani.work@gmail.com" className="text-blue-600 hover:underline">dhruvintejani.work@gmail.com</a>{" "}
        with your order details. We'll work to resolve the issue promptly. See our{" "}
        <Link to="/return-refund-policy" className="text-blue-600 hover:underline">Return & Refund Policy</Link> for more information.
      </>
    ),
  },
];

function FAQItem({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="border border-slate-100 rounded-2xl overflow-hidden bg-white"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-800 text-sm sm:text-base leading-snug">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-0.5"
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 leading-relaxed"
          >
            Find quick answers to the most common questions about JoyNeeds, your orders, and our policies.
          </motion.p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-3 mb-12">
          {faqs.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>

        {/* Still have questions */}
        <div className="bg-blue-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Still have a question?</h2>
          <p className="text-blue-100 mb-6 text-sm leading-relaxed">
            Our team is happy to help. Reach out to us directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:dhruvintejani.work@gmail.com"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
            <a
              href="tel:9913871759"
              className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors text-sm border border-blue-500"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
