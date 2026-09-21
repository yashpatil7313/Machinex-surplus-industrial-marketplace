import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Check,
  X,
  Trash2,
  Search,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { adminService, partsService } from '../../services/api';
import { StatusBadge, ConditionBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getListings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined
      });
      if (res.data?.listings) {
        setListings(res.data.listings);
      }
    } catch (err) {
      toast.error('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadListings();
  };

  const handleApprove = async (id, name) => {
    try {
      await adminService.approveListing(id);
      toast.success(`"${name}" has been approved and is now live in the marketplace!`);
      loadListings();
    } catch (err) {
      toast.error(err.message || 'Failed to approve listing.');
    }
  };

  const handleReject = async (id, name) => {
    try {
      await adminService.rejectListing(id, { reason: 'Failed catalog specification standards' });
      toast.warning(`"${name}" has been rejected.`);
      loadListings();
    } catch (err) {
      toast.error(err.message || 'Failed to reject listing.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await partsService.delete(id);
      toast.success('Listing permanently deleted.');
      setListings((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Listing Approvals & Moderation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin gatekeeper: only approved machine parts appear publicly in the marketplace
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['all', 'pending', 'approved', 'rejected', 'sold'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search part, brand, seller..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </form>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : listings.length === 0 ? (
          <EmptyState
            title="No listings in this view"
            description="All pending listings have been reviewed, or no listings match your search query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Component</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Seller Company</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {listings.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || '/uploads/siemens-motor.jpg'}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-900"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {p.brand} {p.model_number ? `• PN: ${p.model_number}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{p.category_name}</td>
                    <td className="py-4 px-4 text-slate-800 font-semibold">
                      {p.seller_company || p.seller_name}
                    </td>
                    <td className="py-4 px-4">
                      <ConditionBadge condition={p.condition_state} />
                    </td>
                    <td className="py-4 px-4 font-bold">{p.quantity}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/parts/${p.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                          title="View Details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>

                        {p.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(p.id, p.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                            title="Approve listing for live marketplace"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {p.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(p.id, p.name)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 transition-colors"
                            title="Reject listing"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors"
                          title="Permanently Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
