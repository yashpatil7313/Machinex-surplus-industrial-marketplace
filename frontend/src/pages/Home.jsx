import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  RefreshCcw,
  CheckCircle2,
  Package,
  Layers,
  Factory,
  ChevronRight,
  Flame
} from 'lucide-react';
import { partsService, categoryService } from '../services/api';
import { ProductCard } from '../components/marketplace/ProductCard';
import { ProductSkeleton } from '../components/common/LoadingSkeleton';

export const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredParts, setFeaturedParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [partsRes, catsRes] = await Promise.all([
          partsService.getFeatured(),
          categoryService.getCategories(),
        ]);
        if (partsRes.data?.parts) {
          setFeaturedParts(partsRes.data.parts);
        }
        if (catsRes.data?.categories) {
          setCategories(catsRes.data.categories.slice(0, 12));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-slate-800">
        {/* Abstract Industrial Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-orange-600/20 blur-[130px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-orange-400 text-xs font-semibold tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                <span>India's B2B Surplus Machine Parts Exchange</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Give Your Unused Machine Parts a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">Second Life</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
                Buy and sell surplus industrial machine parts through a trusted marketplace. Recover capital from idle factory spares or source certified replacement components at fair industrial rates.
              </p>

              {/* Large Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-2xl">
                <div className="p-2 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center gap-2 backdrop-blur-xl">
                  <div className="flex items-center gap-3 px-4 w-full flex-1">
                    <Search className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search machine parts, brands, models (e.g. 5 HP Siemens motor)..."
                      className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    <span>Search Parts</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Popular:</span>
                  <button type="button" onClick={() => navigate('/marketplace?search=Siemens')} className="hover:text-orange-400">Siemens Motors</button>
                  <span>•</span>
                  <button type="button" onClick={() => navigate('/marketplace?search=SKF')} className="hover:text-orange-400">SKF Bearings</button>
                  <span>•</span>
                  <button type="button" onClick={() => navigate('/marketplace?search=Bosch')} className="hover:text-orange-400">Bosch Pumps</button>
                  <span>•</span>
                  <button type="button" onClick={() => navigate('/marketplace?search=Allen+Bradley')} className="hover:text-orange-400">Allen Bradley PLCs</button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/marketplace"
                  className="px-7 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/25 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Browse Marketplace</span>
                </Link>
                <Link
                  to="/register?role=seller"
                  className="px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Factory className="w-4 h-4 text-orange-400" />
                  <span>Sell Your Surplus</span>
                </Link>
              </div>
            </div>

            {/* Right Industrial Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual Card Frame */}
                <div className="rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-mono text-slate-400 ml-2">INDUSTRIAL TELEMETRY</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      LIVE EXCHANGE
                    </span>
                  </div>

                  {/* Machine Part Preview Card in Hero */}
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                      <img
                        src="/uploads/siemens-motor.jpg"
                        alt="Siemens 5 HP Industrial Motor"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/90 text-white text-xs font-bold shadow">
                          New / Unused
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 text-xs font-mono">
                          IE3 Premium
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-orange-400 tracking-wider uppercase">FEATURED LOT #1042</span>
                        <h4 className="text-lg font-bold text-white">Siemens 5 HP Industrial Motor</h4>
                        <p className="text-xs text-slate-400 font-mono">PN: 1LE1001-1DB22-2AA4</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Surplus Offer</span>
                        <span className="text-xl font-black text-amber-400">₹38,500</span>
                      </div>
                    </div>

                    {/* Metric Bars */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60 text-xs text-slate-300">
                      <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
                        <span className="text-slate-400 block text-[10px]">OEM Pack Status</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sealed Crates
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
                        <span className="text-slate-400 block text-[10px]">Supplier Rating</span>
                        <span className="font-semibold text-white mt-0.5">4.9 / 5.0 ★ Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Pill */}
                <div className="absolute -bottom-6 -left-6 bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Avg Surplus Savings</span>
                    <p className="text-base font-extrabold text-white">35% - 60% vs OEM List</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Value Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-slate-200 shadow-subtle">
          <div className="text-center p-4">
            <span className="text-3xl font-black text-slate-900 block tracking-tight">13+</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Industrial Categories</span>
          </div>
          <div className="text-center p-4 border-l border-slate-100">
            <span className="text-3xl font-black text-orange-600 block tracking-tight">₹2.8 Cr+</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Surplus Value Mapped</span>
          </div>
          <div className="text-center p-4 border-l border-slate-100">
            <span className="text-3xl font-black text-slate-900 block tracking-tight">100%</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Admin Verified Listings</span>
          </div>
          <div className="text-center p-4 border-l border-slate-100">
            <span className="text-3xl font-black text-emerald-600 block tracking-tight">24h - 48h</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Dispatch SLA</span>
          </div>
        </div>
      </section>

      {/* 3. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">
              <Layers className="w-4 h-4" />
              <span>Explore Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Popular Industrial Categories
            </h2>
            <p className="text-sm text-slate-600 mt-1">Browse active surplus lots mapped across core plant machinery divisions.</p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/marketplace?category=${cat.id}`}
              className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-orange-500/50 hover:shadow-elevated transition-all duration-300 flex flex-col items-center text-center justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-orange-50 group-hover:text-orange-600 text-slate-700 flex items-center justify-center transition-colors mb-3">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {cat.parts_count || 0} listings
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Machine Parts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">
              <Flame className="w-4 h-4 fill-current" />
              <span>Verified Listings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Machine Parts
            </h2>
            <p className="text-sm text-slate-600 mt-1">Ready-to-dispatch surplus spares inspected and available for direct procurement.</p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            <span>Browse Full Marketplace</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredParts.map((part) => (
              <ProductCard key={part.id} part={part} />
            ))}
          </div>
        )}
      </section>

      {/* 5. How MachineX Works */}
      <section className="bg-slate-900 text-white py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Streamlined Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">How MachineX Works</h2>
            <p className="text-slate-400 text-sm">A verified three-step pipeline built specifically for industrial B2B procurement and asset recovery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-slate-950/60 border border-slate-800 relative group hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-orange-400 font-black text-xl flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">List Your Surplus</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Sellers, workshops, and plants upload their unused or obsolete machine parts with photos, model numbers, conditions, and prices. Listings are reviewed by administrators.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-orange-400">
                <CheckCircle2 className="w-4 h-4" /> Live Inventory Valuation
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-slate-950/60 border border-slate-800 relative group hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 font-black text-xl flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Find the Right Part</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Buyers search with smart keyword matching, filter by industrial condition, brand, and category, and inspect detailed manufacturer specifications.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                <CheckCircle2 className="w-4 h-4" /> Keyword Smart Ranking
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-slate-950/60 border border-slate-800 relative group hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-black text-xl flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Connect & Purchase</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Send structured inquiries, negotiate batches, or issue purchase requests with automated total pricing calculations for immediate seller fulfillment.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Auto Price Calculation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why MachineX? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">The Business Value</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Why Choose MachineX for Plant Operations?
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Industrial facilities routinely suffer from stranded capital in the form of surplus OEM spares purchased for cancelled expansion lines or decommissioned cells. MachineX bridges this gap.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Get Started on MachineX</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Reduce Industrial Waste</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Promote circular economy principles by preventing functional high-grade machinery from ending up as scrap.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Recover Value from Unused Inventory</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Convert dead warehouse space and inactive spares into real operating cash flow for your business.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Find Affordable Machine Parts</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Obtain genuine OEM components at fractions of the official catalog cost with zero long overseas lead times.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Simplify Surplus Management</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Track comprehensive inventory values (`Quantity × Price`), customer inquiries, and purchase orders in one dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
