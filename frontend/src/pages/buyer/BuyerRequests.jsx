import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ArrowUpRight, Clock, Store } from 'lucide-react';
import { requestService } from '../../services/api';
import { StatusBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const BuyerRequests = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Purchase Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track commercial proposals and fulfillment status submitted to sellers</p>
        </div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm"
        >
          <Store className="w-4 h-4" />
          <span>Browse More Parts</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No purchase requests submitted yet"
            description="When you request to buy industrial components in the marketplace, your quotes will appear here."
            actionText="Find Parts to Purchase"
            actionLink="/marketplace"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Part Specification</th>
                  <th className="py-3.5 px-4">Seller Company</th>
                  <th className="py-3.5 px-4">Requested Qty</th>
                  <th className="py-3.5 px-4">Unit Price</th>
                  <th className="py-3.5 px-4">Total Amount (₹)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Action</th>
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
                          <p className="text-[11px] text-slate-500">{r.part_brand} • {r.part_model || 'Standard'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-semibold">{r.seller_company || r.seller_name}</td>
                    <td className="py-4 px-4 font-bold">{r.quantity} units</td>
                    <td className="py-4 px-4 text-slate-600">₹{parseFloat(r.unit_price).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ₹{parseFloat(r.total_price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/parts/${r.part_id}`}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 transition-colors inline-flex"
                        title="View Part Details"
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
