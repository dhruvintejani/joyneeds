import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Package, Star, Users } from "lucide-react";
import { categories, categoryIcons } from "../data/products";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const values = [
  {
    icon: <Package className="w-6 h-6" />,
    title: "Practical Products",
    description:
      "We focus on products that actually solve everyday problems — nothing gimmicky, nothing excessive.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Thoughtful Selection",
    description:
      "Every product in our catalog is chosen with care, keeping quality and everyday usefulness in mind.",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Simple Shopping",
    description:
      "We want your shopping experience to be as easy and hassle-free as the products we offer.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Customer First",
    description:
      "We're here to support you — from browsing the catalog to resolving questions after your order.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-900 py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-blue-500/30 mb-6">
              About JoyNeeds
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight"
          >
            Everyday Products.{" "}
            <span className="text-yellow-400">Thoughtfully</span> Chosen.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            JoyNeeds is a focused product brand built around one idea: making your daily life a little easier by offering practical, quality-checked everyday essentials.
          </motion.p>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-slate max-w-none"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
              What is JoyNeeds?
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                JoyNeeds is an online store dedicated to practical everyday products. We curate our catalog across a focused set of categories — Home & Kitchen, Storage & Organization, Mobile & Desk accessories, Car & Bike accessories, Personal Care, and everyday essentials including pet products.
              </p>
              <p>
                We believe that the right everyday product — a good vegetable chopper, a well-designed desk stand, or a reliable bike mount — can genuinely improve your daily routine. We don't try to sell you everything. We try to offer you the right things.
              </p>
              <p>
                Our catalog is deliberately focused. We'd rather carry a smaller number of genuinely useful products than overwhelm you with endless choices. Every product at JoyNeeds is there because it serves a real purpose.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20 bg-slate-50 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 text-center"
          >
            Our Product Categories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-center mb-10 max-w-lg mx-auto"
          >
            Everything we sell fits into one of these six focused categories.
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-slate-100 p-6 text-center"
              >
                <span className="text-3xl mb-3 block" aria-hidden="true">
                  {categoryIcons[cat]}
                </span>
                <h3 className="font-semibold text-slate-800 text-sm">{cat}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 text-center"
          >
            What We Stand For
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-center mb-10 max-w-lg mx-auto"
          >
            Our approach to building JoyNeeds is grounded in a few simple values.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  {value.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{value.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-4"
          >
            Ready to explore?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 mb-8"
          >
            Browse our catalog and find products that make your everyday a little better.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-colors"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
