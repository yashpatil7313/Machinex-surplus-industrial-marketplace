import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Check, X, Building, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { requestService } from '../../services/api';
import { StatusBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const SellerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadRequests = async () => {
    try {
      const res = await requestService.getRequests();
      if (res.data?.requests) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      toast.error('Failed to load purchase requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await requestService.update(id, { status });
      toast.success(`Purchase request marked as ${status}.`);
      loadRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to update request.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Received Purchase Requests</h1>
        <p className="text-xs text-slate-500 mt-0.5">Formal purchase orders issued by verified commercial buyers</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title="No purchase requests received yet"
            description="When buyers commit to purchasing your listed surplus spares, their formal orders will appear here for your review and fulfillment."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Component</th>
                  <th className="py-3.5 px-4">Buyer Company</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Requested Qty</th>
                  <th className="py-3.5 px-4">Total Value (Qty × Price)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.part_image || '/uploads/siemens-motor.jpg'}
                          alt={r.part_name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-900"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{r.part_name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">PN: {r.part_model || 'N/A'}</p>
                          {r.message && (
                            <p className="text-[10px] text-slate-600 italic mt-0.5 max-w-xs truncate">
                              "{r.message}"
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{r.buyer_company || r.buyer_name}</p>
                      <p className="text-[10px] text-slate-500">{r.buyer_name}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-orange-500" /> {r.buyer_phone || 'N/A'}</p>
                      <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5"><Mail className="w-3 h-3" /> {r.buyer_email}</p>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      {r.quantity} units
                    </td>
                    <td className="py-4 px-4 font-black text-emerald-600 text-sm">
                      ₹{parseFloat(r.total_price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      {r.status === 'pending' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleAction(r.id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(r.id, 'approved')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                          >
                            Accept Order
                          </button>
                        </div>
                      ) : r.status === 'approved' ? (
                        <button
                          onClick={() => handleAction(r.id, 'completed')}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 capitalize">{r.status}</span>
                      )}
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
