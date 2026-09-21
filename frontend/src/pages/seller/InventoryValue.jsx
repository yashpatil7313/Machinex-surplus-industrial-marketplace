import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Layers, Package, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { partsService } from '../../services/api';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { Link } from 'react-router-dom';

export const InventoryValue = () => {
  const [data, setData] = useState({
    totalInventoryValue: 0,
    activeInventoryValue: 0,
    totalStockUnits: 0,
    totalListings: 0,
    categoryBreakdown: [],
    items: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    partsService.getInventoryValue()
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Financial Telemetry</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Surplus Inventory Valuation</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time algorithmic computation: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono font-bold">Surplus Value = Quantity × Unit Price</code>
        </p>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Total Asset Portfolio</span>
            <Calculator className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
            {formatINR(data.totalInventoryValue)}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Aggregated valuation across all {data.totalListings} machine part lots
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Active Listings</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
            {formatINR(data.activeInventoryValue)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Approved stock currently visible in the public marketplace
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Physical Volume</span>
            <Package className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {data.totalStockUnits}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Total component pieces stored across plant warehouses
          </p>
        </div>
      </div>

      {/* Category Breakdown Valuation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">Valuation by Machinery Division</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Category-Level Aggregation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.categoryBreakdown.map((cat, idx) => {
            const percentage = data.totalInventoryValue > 0
              ? Math.round((cat.totalValue / data.totalInventoryValue) * 100)
              : 0;
            return (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                  <span className="text-xs font-bold text-orange-600 font-mono">{percentage}%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Stock: <strong>{cat.units} units</strong></span>
                  <span className="font-black text-slate-900">{formatINR(cat.totalValue)}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Line-Item Mathematical Audit */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Line-Item Valuation Audit Table</h2>
        {loading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Component</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Quantity (Q)</th>
                  <th className="py-3.5 px-4">Unit Price (P)</th>
                  <th className="py-3.5 px-4">Formula: Q × P</th>
                  <th className="py-3.5 px-4 text-right">Surplus Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <Link to={`/parts/${item.id}`} className="hover:text-orange-600">
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.category_name}</td>
                    <td className="py-3.5 px-4 font-bold">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-slate-700">{formatINR(item.price)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {item.quantity} × ₹{item.price}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm text-right">
                      {formatINR(item.quantity * item.price)}
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
