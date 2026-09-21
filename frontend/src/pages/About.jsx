import React from 'react';
import {
  Cog,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  Factory,
  CheckCircle2,
  Users,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Circular Manufacturing Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          "Give Your Unused Machine Parts a Second Life"
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          MachineX is a specialized B2B marketplace engineered for factories, MSMEs, machining workshops, and processing plants across India to monetize surplus inventory and source genuine spares.
        </p>
      </div>

      {/* Industrial Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">The Problem</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Billions in Dead Capital Trapped in Inactive Spares
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            During line modernizations, cancelled expansion projects, or OEM equipment decommissioning, industrial businesses are left holding high-value components—motors, ball bearings, gearboxes, valves, and PLCs.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Historically, these precision parts sat in warehouses depreciating until being scrapped for pennies on the dollar. Meanwhile, neighboring workshops faced months of OEM lead time for the exact same replacement units.
          </p>
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-orange-600" /> Over 18% of industrial inventory sits inactive
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-orange-600" /> Massive carbon footprint in fabricating unnecessary duplicates
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">The MachineX Solution</span>
          <h3 className="text-2xl font-black text-white">An Audited, Structured B2B Exchange</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            MachineX provides verified sellers with an automated inventory valuation dashboard, structured condition classifications, and administrative oversight.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <span className="text-2xl font-black text-amber-400 block">40% - 70%</span>
              <span className="text-xs text-slate-400 mt-1 block">Cost recovery on surplus items</span>
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-400 block">&lt; 48 Hours</span>
              <span className="text-xs text-slate-400 mt-1 block">Average dispatch timeframe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Platform Core Pillars</h2>
          <p className="text-xs text-slate-500 mt-1">Built to professional B2B engineering and commercial standards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Administrative Quality Control</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Every part listing undergoes rigorous administrative verification before entering public circulation to prevent counterfeit or misrepresented lots.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Live Inventory Valuation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Sellers instantly view their aggregated Surplus Inventory Value (`Quantity × Price`), giving financial controllers total visibility over capital recovery.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Factory className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Direct Plant Connections</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Structured multi-tier communication through inquiries and purchase requests with automated calculations and inventory locking.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
