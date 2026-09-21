import React from 'react';
import { Link } from 'react-router-dom';
import { Cog, ShieldCheck, RefreshCw, Truck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Value Proposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800/80">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">Circular Industrial Economy</h4>
              <p className="text-sm text-slate-400">Transform dead capital and idle factory inventory into working liquidity while reducing scrap metal waste.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">Verified B2B Suppliers</h4>
              <p className="text-sm text-slate-400">All machine parts undergo administrative listing verification, specifications review, and condition audits.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">Direct Industrial Connect</h4>
              <p className="text-sm text-slate-400">Structured inquiry and formal purchase request pipelines connect workshops directly with factory plant managers.</p>
            </div>
          </div>
        </div>

        {/* Navigation & Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Cog className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">MACHINE<span className="text-orange-500">X</span></span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              "Give Your Unused Machine Parts a Second Life" — India's premier B2B industrial marketplace for surplus, excess, and obsolete machinery spares.
            </p>
            <div className="text-xs space-y-1.5 pt-2 text-slate-500">
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-orange-400" /> Industrial Park, Andheri East, Mumbai 400069</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-orange-400" /> +91 (22) 4900-5800</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-orange-400" /> contact@machinex-b2b.com</p>
            </div>
          </div>

          {/* Column 1: Marketplace */}
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Marketplace</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Browse All Parts</Link></li>
              <li><Link to="/marketplace?condition=New+%2F+Unused" className="hover:text-white transition-colors">New / Unused Parts</Link></li>
              <li><Link to="/marketplace?condition=Surplus" className="hover:text-white transition-colors">Surplus Lots</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories Catalog</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About MachineX</Link></li>
            </ul>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Categories</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/marketplace?category=1" className="hover:text-white transition-colors">Bearings & Bushings</Link></li>
              <li><Link to="/marketplace?category=2" className="hover:text-white transition-colors">Motors & Drives</Link></li>
              <li><Link to="/marketplace?category=3" className="hover:text-white transition-colors">Industrial Gears</Link></li>
              <li><Link to="/marketplace?category=4" className="hover:text-white transition-colors">Hydraulic Pumps</Link></li>
              <li><Link to="/marketplace?category=5" className="hover:text-white transition-colors">Sensors & PLCs</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform & Viva Note */}
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">For Businesses</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/register?role=seller" className="hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link to="/register?role=buyer" className="hover:text-white transition-colors">Register as Buyer</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Help Desk & Support</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Demo Portal Login</Link></li>
              <li><span className="inline-block px-2 py-0.5 mt-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium">College MDM Project</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MACHINEX B2B Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
