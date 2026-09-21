import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  FileCheck,
  Clock,
  CheckCircle2,
  Store,
  ArrowRight,
  MessageSquare,
  Package
} from 'lucide-react';
import { wishlistService, requestService, inquiryService } from '../../services/api';
import { StatusBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export const BuyerDashboard = () => {
  const [stats, setStats] = useState({
    wishlistCount: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuyerData = async () => {
      try {
        const [wRes, rRes, iRes] = await Promise.all([
          wishlistService.getWishlist(),
          requestService.getRequests(),
          inquiryService.getInquiries()
        ]);

        const wItems = wRes.data?.wishlist || [];
        const rItems = rRes.data?.requests || [];
        const iItems = iRes.data?.inquiries || [];

        setStats({
          wishlistCount: wItems.length,
          totalRequests: rItems.length,
          pendingRequests: rItems.filter(r => r.status === 'pending').length,
          approvedRequests: rItems.filter(r => r.status === 'approved').length
        });

        setRecentRequests(rItems.slice(0, 5));
        setRecentInquiries(iItems.slice(0, 5));
      } catch (err) {
        console.error('Failed to load buyer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBuyerData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Buyer Workspace</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Buyer Procurement Hub</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Track purchase quotes, supplier inquiries, and saved machinery lots.</p>
        </div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all"
        >
          <Store className="w-4 h-4" />
          <span>Browse Marketplace</span>
        </Link>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{stats.wishlistCount}</span>
            <span className="text-xs text-slate-500 block font-medium">Wishlist Items</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{stats.totalRequests}</span>
            <span className="text-xs text-slate-500 block font-medium">Purchase Requests</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600">{stats.pendingRequests}</span>
            <span className="text-xs text-slate-500 block font-medium">Pending Approvals</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600">{stats.approvedRequests}</span>
            <span className="text-xs text-slate-500 block font-medium">Approved Orders</span>
          </div>
        </div>
      </div>

      {/* Recent Purchase Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">Recent Purchase Requests</h2>
          </div>
          <Link to="/buyer/requests" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={3} />
        ) : recentRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No purchase requests submitted yet. Browse the marketplace and request to buy surplus parts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Machine Part</th>
                  <th className="py-3 px-4">Seller</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Total Price (₹)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <Link to={`/parts/${req.part_id}`} className="font-bold text-slate-900 hover:text-orange-600">
                        {req.part_name}
                      </Link>
                      <p className="text-[10px] text-slate-400 font-mono">PN: {req.part_model || 'N/A'}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{req.seller_company || req.seller_name}</td>
                    <td className="py-3 px-4 font-bold">{req.quantity}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{parseFloat(req.total_price).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">Recent Supplier Inquiries</h2>
          </div>
          <Link to="/buyer/inquiries" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={2} />
        ) : recentInquiries.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No supplier inquiries sent yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{inq.part_name}</span>
                    <span className="text-[10px] text-slate-400">to {inq.seller_company || inq.seller_name}</span>
                  </div>
                  <p className="text-slate-600 mt-1 line-clamp-1 italic">"{inq.message}"</p>
                  {inq.reply && (
                    <p className="text-emerald-700 font-medium mt-1">Reply: {inq.reply}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={inq.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
