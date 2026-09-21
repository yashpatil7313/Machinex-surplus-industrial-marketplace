import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, X as XIcon, CornerDownRight, Clock, Send } from 'lucide-react';
import { inquiryService } from '../../services/api';
import { StatusBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const SellerInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('accepted');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const loadInquiries = async () => {
    try {
      const res = await inquiryService.getInquiries();
      if (res.data?.inquiries) {
        setInquiries(res.data.inquiries);
      }
    } catch (err) {
      toast.error('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const openReply = (inquiry, defaultStatus = 'accepted') => {
    setReplyModal(inquiry);
    setReplyText(inquiry.reply || '');
    setReplyStatus(defaultStatus);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inquiryService.update(replyModal.id, {
        status: replyStatus,
        reply: replyText.trim()
      });
      toast.success(`Inquiry updated to ${replyStatus}.`);
      setReplyModal(null);
      loadInquiries();
    } catch (err) {
      toast.error(err.message || 'Failed to update inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buyer Inquiries</h1>
        <p className="text-xs text-slate-500 mt-0.5">Answer technical questions, confirm dispatch timelines, and quote terms</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No inquiries received yet"
            description="When buyers have questions regarding your surplus machine parts, their messages will appear here."
          />
        ) : (
          inquiries.map((inq) => (
            <div key={inq.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{inq.part_name}</h3>
                  <p className="text-xs text-slate-500">
                    From: <strong className="text-slate-800">{inq.buyer_name}</strong> ({inq.buyer_company || 'Independent Buyer'}) • Tel: {inq.buyer_phone || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    Required Qty: {inq.quantity}
                  </span>
                  <StatusBadge status={inq.status} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Buyer Question</span>
                <p className="text-xs text-slate-700 leading-relaxed italic">"{inq.message}"</p>
              </div>

              {inq.reply && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Your Sent Response</span>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">{inq.reply}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => openReply(inq, 'rejected')}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => openReply(inq, 'accepted')}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>Reply & Accept</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Respond to Inquiry</h3>
              <button onClick={() => setReplyModal(null)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Set Status</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="accepted">Accepted (Ready to supply)</option>
                  <option value="completed">Completed (Inquiry resolved)</option>
                  <option value="rejected">Rejected (Not feasible)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Reply Message</label>
                <textarea
                  rows="4"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Confirm stock condition, test reports, or shipping timeline..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyModal(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending...' : 'Send Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
