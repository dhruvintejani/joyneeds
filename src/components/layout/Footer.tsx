import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-yellow-400">Joy</span>
                <span className="text-white">Needs</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Carefully selected everyday products for home, kitchen, organization, personal care, and daily life.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/shop" className="text-sm text-slate-400 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Customer Support</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-slate-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/return-refund-policy" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2.5 mb-6">
              <li>
                <Link to="/privacy-policy" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>

            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:dhruvintejani.work@gmail.com"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-4 h-4 shrink-0 text-blue-400" />
                  dhruvintejani.work@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:9913871759"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-blue-400" />
                  9913871759
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} JoyNeeds. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
