import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ArrowUpRight, TrendingUp } from 'lucide-react';
import { requestService } from '../../services/api';
import { StatusBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestService.getRequests()
      .then((res) => {
        if (res.data?.requests) {
          setRequests(res.data.requests);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalVolume = requests
    .filter((r) => r.status === 'approved' || r.status === 'completed')
    .reduce((acc, curr) => acc + parseFloat(curr.total_price || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchase Requests Audit</h1>
          <p className="text-xs text-slate-500 mt-0.5">Platform-wide trade transactions, buyer purchase orders, and settlements</p>
        </div>
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-3 text-xs">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Settled Volume: <strong className="text-slate-900 font-mono text-sm">₹{totalVolume.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title="No platform transactions"
            description="Purchase orders submitted across all buyers and sellers will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Component</th>
                  <th className="py-3.5 px-4">Buyer Details</th>
                  <th className="py-3.5 px-4">Seller Details</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Total Amount (₹)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Part Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 text-sm">{r.part_name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">PN: {r.part_model || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{r.buyer_company || r.buyer_name}</p>
                      <p className="text-[10px] text-slate-400">{r.buyer_email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{r.seller_company || r.seller_name}</p>
                      <p className="text-[10px] text-slate-400">{r.seller_email}</p>
                    </td>
                    <td className="py-4 px-4 font-bold">{r.quantity} units</td>
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ₹{parseFloat(r.total_price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/parts/${r.part_id}`}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 inline-flex"
                        title="View Part Listing"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
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
