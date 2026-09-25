import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Layers,
  ArrowRight,
  Clock,
  DollarSign,
  Download
} from 'lucide-react';
import { adminService } from '../../services/api';
import { StatusBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    adminService.getStatistics()
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadBackup = async () => {
    setExporting(true);
    try {
      const res = await adminService.exportBackup();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `machinex-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Full database & image backup downloaded!');
    } catch (err) {
      toast.error(err.message || 'Failed to download backup');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const { stats, charts, recentActivity } = data || {
    stats: {},
    charts: { listingsByCategory: [], listingStatusDist: [], usersByRole: [] },
    recentActivity: { recentListings: [], recentRequests: [] }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Master Governance Console</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System Control & Telemetry</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Platform overview, listing verification queue, user directory, and compliance moderation.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{exporting ? 'Exporting...' : 'Download DB Snapshot'}</span>
          </button>
          <Link
            to="/admin/listings"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Pending Listings ({stats.pendingListings || 0})</span>
          </Link>
        </div>
      </div>

      {/* 7 Required Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Users</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalUsers}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Buyers</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">{stats.totalBuyers}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Sellers</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{stats.totalSellers}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Listings</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalListings}</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-subtle">
          <span className="text-[11px] font-bold text-amber-700 block uppercase">Pending Review</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">{stats.pendingListings}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Sold Out</span>
          <span className="text-2xl font-black text-slate-600 mt-1 block">{stats.soldParts}</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-subtle">
          <span className="text-[11px] font-bold text-rose-700 block uppercase">Reported Items</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{stats.totalReports}</span>
        </div>
      </div>

      {/* Visual Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Listings by Category */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Listings by Category</span>
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Count</span>
          </div>

          <div className="space-y-3">
            {charts.listingsByCategory.map((c, i) => {
              const maxVal = Math.max(...charts.listingsByCategory.map(x => x.count), 1);
              const pct = Math.round((c.count / maxVal) * 100);
              return (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700 truncate max-w-[180px]">{c.name}</span>
                    <span className="text-slate-900 font-mono">{c.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Listing Status Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>Listing Moderation Status</span>
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Status</span>
          </div>

          <div className="space-y-4 pt-2">
            {charts.listingStatusDist.map((s, i) => {
              let color = 'bg-slate-500';
              let text = 'text-slate-700';
              if (s.status === 'approved') { color = 'bg-emerald-500'; text = 'text-emerald-700'; }
              if (s.status === 'pending') { color = 'bg-amber-500'; text = 'text-amber-700'; }
              if (s.status === 'rejected') { color = 'bg-rose-500'; text = 'text-rose-700'; }

              const pct = stats.totalListings > 0 ? Math.round((s.count / stats.totalListings) * 100) : 0;

              return (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${color}`}></span>
                    <span className="text-xs font-bold capitalize text-slate-800">{s.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 font-mono">{s.count}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Users by Role */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>User Base Distribution</span>
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Roles</span>
          </div>

          <div className="space-y-4 pt-2">
            {charts.usersByRole.map((u, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">{u.role}</span>
                  <p className="text-[10px] text-slate-400">Authenticated platform accounts</p>
                </div>
                <span className="text-xl font-black text-slate-900 font-mono">{u.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Part Submissions</h3>
            <Link to="/admin/listings" className="text-xs font-bold text-orange-600 hover:text-orange-700">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.recentListings.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[10px] text-slate-500">By {item.company_name || item.seller_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchase Requests */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Recent Purchase Transactions</h3>
            <Link to="/admin/requests" className="text-xs font-bold text-orange-600 hover:text-orange-700">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.recentRequests.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{item.part_name}</p>
                  <p className="text-[10px] text-slate-500">Buyer: {item.buyer_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-600 font-mono">₹{parseFloat(item.total_price).toLocaleString('en-IN')}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
