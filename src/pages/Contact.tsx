import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, HelpCircle, Truck, RefreshCcw, XCircle, ShieldCheck, FileText } from "lucide-react";

const helpLinks = [
  {
    icon: <HelpCircle className="w-5 h-5" />,
    label: "Frequently Asked Questions",
    description: "Find answers to common questions about orders, shipping, and returns.",
    to: "/faq",
  },
  {
    icon: <Truck className="w-5 h-5" />,
    label: "Shipping Policy",
    description: "Learn about how we ship your orders and delivery timelines.",
    to: "/shipping-policy",
  },
  {
    icon: <RefreshCcw className="w-5 h-5" />,
    label: "Return & Refund Policy",
    description: "Understand how returns and refunds work at JoyNeeds.",
    to: "/return-refund-policy",
  },
  {
    icon: <XCircle className="w-5 h-5" />,
    label: "Cancellation Policy",
    description: "Find out how to cancel an order and what to expect.",
    to: "/cancellation-policy",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    label: "Privacy Policy",
    description: "Read how we handle your personal information.",
    to: "/privacy-policy",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Terms & Conditions",
    description: "The terms that govern your use of JoyNeeds.",
    to: "/terms-and-conditions",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-900 py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-blue-500/30 mb-6">
              Contact JoyNeeds
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight"
          >
            We're Here to <span className="text-yellow-400">Help</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed"
          >
            Have a question about your order, a product, or a policy? Reach out to us directly — we're happy to help.
          </motion.p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="group p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Email Support</h2>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Send us an email and we'll get back to you as soon as we can.
              </p>
              <a
                href="mailto:dhruvintejani.work@gmail.com"
                className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm hover:text-blue-900 transition-colors break-all"
              >
                <Mail className="w-4 h-4 shrink-0" />
                dhruvintejani.work@gmail.com
              </a>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="group p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-100 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Phone Support</h2>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Prefer to talk? Give us a call directly.
              </p>
              <a
                href="tel:9913871759"
                className="inline-flex items-center gap-2 text-slate-800 font-semibold text-sm hover:text-slate-900 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                9913871759
              </a>
            </motion.div>
          </div>

          {/* Quick Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-2xl p-6 text-white text-center mb-16"
          >
            <p className="font-semibold mb-1">Preferred Contact Method</p>
            <p className="text-blue-100 text-sm leading-relaxed">
              For order-related queries, please email or call us directly. We respond to all inquiries personally.
            </p>
          </motion.div>

          {/* Help Links */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-slate-900 mb-2"
            >
              Quick Help
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 mb-8"
            >
              Your question might already be answered in one of our policy pages.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {helpLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Link
                    to={link.to}
                    className="group flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 group-hover:border-blue-200 flex items-center justify-center shrink-0 text-blue-600 shadow-sm">
                      {link.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors text-sm mb-0.5">
                        {link.label}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{link.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
