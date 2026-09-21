import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { inquiryService } from '../../services/api';
import { StatusBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const BuyerInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inquiryService.getInquiries()
      .then((res) => {
        if (res.data?.inquiries) {
          setInquiries(res.data.inquiries);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Inquiries</h1>
        <p className="text-xs text-slate-500 mt-0.5">Communications and technical Q&A sent to machinery sellers</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : inquiries.length === 0 ? (
          <EmptyState
            title="No inquiries sent yet"
            description="Have questions regarding technical specifications or certifications? Send inquiries directly to sellers from any machine part details page."
            actionText="Browse Marketplace"
            actionLink="/marketplace"
          />
        ) : (
          inquiries.map((inq) => (
            <div key={inq.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={inq.part_image || '/uploads/siemens-motor.jpg'}
                    alt={inq.part_name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-900"
                  />
                  <div>
                    <Link to={`/parts/${inq.part_id}`} className="font-bold text-slate-900 text-sm hover:text-orange-600">
                      {inq.part_name}
                    </Link>
                    <p className="text-xs text-slate-500">Seller: {inq.seller_company || inq.seller_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">Qty: {inq.quantity}</span>
                  <StatusBadge status={inq.status} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Your Message</span>
                <p className="text-xs text-slate-700 leading-relaxed italic">"{inq.message}"</p>
              </div>

              {inq.reply ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Seller Response</span>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">{inq.reply}</p>
                </div>
              ) : (
                <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Awaiting reply from supplier
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
