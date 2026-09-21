import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Check, X, ArrowUpRight, Ban } from 'lucide-react';
import { reportService } from '../../services/api';
import { StatusBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getReports();
      if (res.data?.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdate = async (id, status, action = null) => {
    try {
      await reportService.update(id, { status, action });
      toast.success(
        action === 'takedown_listing'
          ? 'Listing taken down from marketplace and report resolved.'
          : `Report status marked as ${status}.`
      );
      loadReports();
    } catch (err) {
      toast.error(err.message || 'Failed to update report.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reported Machinery Listings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          User-flagged listings requiring administrative verification or catalog takedowns
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Zero active reports"
            description="No listings are currently flagged for policy or specification violations."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Flagged Machine Part</th>
                  <th className="py-3.5 px-4">Reported Reason</th>
                  <th className="py-3.5 px-4">Reporter Info</th>
                  <th className="py-3.5 px-4">Seller Company</th>
                  <th className="py-3.5 px-4">Report Status</th>
                  <th className="py-3.5 px-4 text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reports.map((r) => (
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
                          <p className="text-[11px] text-slate-500">{r.part_brand}</p>
                          {r.details && (
                            <p className="text-[10px] text-rose-600 font-mono mt-0.5 max-w-xs">
                              Note: {r.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                        {r.reason}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      <p className="font-semibold">{r.reporter_name}</p>
                      <p className="text-[10px] text-slate-400">{r.reporter_email}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-semibold">{r.seller_company || r.seller_name}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      {r.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdate(r.id, 'dismissed')}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
                            title="Dismiss Report"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleUpdate(r.id, 'resolved', 'takedown_listing')}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
                            title="Takedown listing and reject it"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Takedown</span>
                          </button>
                        </div>
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
