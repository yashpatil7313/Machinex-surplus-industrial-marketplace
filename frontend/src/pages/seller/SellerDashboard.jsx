import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  Calculator,
  TrendingUp,
  FileCheck,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { partsService, requestService } from '../../services/api';
import { StatusBadge, ConditionBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export const SellerDashboard = () => {
  const [inventoryStats, setInventoryStats] = useState({
    totalInventoryValue: 0,
    activeInventoryValue: 0,
    totalStockUnits: 0,
    totalListings: 0,
    categoryBreakdown: [],
    items: []
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSellerData = async () => {
      try {
        const [valRes, reqRes] = await Promise.all([
          partsService.getInventoryValue(),
          requestService.getRequests()
        ]);
        if (valRes.data) {
          setInventoryStats(valRes.data);
        }
        if (reqRes.data?.requests) {
          setRequests(reqRes.data.requests);
        }
      } catch (err) {
        console.error('Failed to load seller dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSellerData();
  }, []);

  const totalListings = inventoryStats.items.length;
  const activeListings = inventoryStats.items.filter(i => i.status === 'approved').length;
  const pendingListings = inventoryStats.items.filter(i => i.status === 'pending').length;
  const soldParts = inventoryStats.items.filter(i => i.status === 'sold').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const formattedTotalValue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(inventoryStats.totalInventoryValue);

  return (
    <div className="space-y-8">
      {/* Top Banner with Add Part CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Enterprise Asset Recovery</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Seller Operations Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage factory machine part lots, track incoming orders, and audit surplus valuation.</p>
        </div>
        <Link
          to="/seller/add-part"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Machine Part</span>
        </Link>
      </div>

      {/* FEATURE: Surplus Inventory Value Card (Quantity × Price) */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-orange-600/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Inventory Valuation Algorithm</span>
                <h3 className="text-xl font-bold text-white">Surplus Inventory Value (Quantity × Price)</h3>
              </div>
            </div>
            <Link
              to="/seller/inventory"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
            >
              <span>Full Valuation Audit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400 block font-medium">Total Surplus Value</span>
              <span className="text-3xl font-black text-amber-400 tracking-tight mt-1 block">
                {formattedTotalValue}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Aggregated across all listings</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400 block font-medium">Active Public Value</span>
              <span className="text-3xl font-black text-emerald-400 tracking-tight mt-1 block">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(inventoryStats.activeInventoryValue)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Live in approved marketplace</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs text-slate-400 block font-medium">Total Physical Units</span>
              <span className="text-3xl font-black text-white tracking-tight mt-1 block">
                {inventoryStats.totalStockUnits}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Surplus component pieces mapped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{totalListings}</span>
            <span className="text-xs text-slate-500 block font-medium">Total Listings</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600">{activeListings}</span>
            <span className="text-xs text-slate-500 block font-medium">Active Listings</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600">{pendingRequests}</span>
            <span className="text-xs text-slate-500 block font-medium">Pending Requests</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{soldParts}</span>
            <span className="text-xs text-slate-500 block font-medium">Sold Out Parts</span>
          </div>
        </div>
      </div>

      {/* Recent Listings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">Recent Machine Part Listings</h2>
          </div>
          <Link to="/seller/listings" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <span>Manage All Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={3} />
        ) : inventoryStats.items.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No machine parts listed yet. Click "Add Machine Part" to list your surplus inventory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Part Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Valuation (Qty × Price)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventoryStats.items.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <Link to={`/parts/${p.id}`} className="font-bold text-slate-900 hover:text-orange-600 block">
                        {p.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-semibold">{p.brand}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category_name}</td>
                    <td className="py-3 px-4">
                      <ConditionBadge condition={p.condition_state} />
                    </td>
                    <td className="py-3 px-4 font-bold">{p.quantity}</td>
                    <td className="py-3 px-4 text-slate-600">₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ₹{(p.quantity * p.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
