import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Building2,
  MapPin,
  ShieldCheck,
  Package,
  Layers,
  Send,
  ShoppingCart,
  AlertTriangle,
  ChevronLeft,
  Clock,
  CheckCircle2,
  X,
  Star,
  FileText
} from 'lucide-react';
import { partsService, wishlistService, inquiryService, requestService, reportService } from '../services/api';
import { ConditionBadge } from '../components/common/ConditionBadge';
import { ProductCard } from '../components/marketplace/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer } = useAuth();
  const toast = useToast();

  const [part, setPart] = useState(null);
  const [relatedParts, setRelatedParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Modals
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Form states
  const [inquiryData, setInquiryData] = useState({ message: '', quantity: 1 });
  const [buyData, setBuyData] = useState({ quantity: 1, message: '' });
  const [reportData, setReportData] = useState({ reason: 'Incorrect information', details: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await partsService.getById(id);
        if (res.data?.part) {
          setPart(res.data.part);
          setRelatedParts(res.data.relatedParts || []);
          // Check wishlist if buyer
          if (isAuthenticated && isBuyer) {
            const wRes = await wishlistService.getWishlist();
            const exists = (wRes.data?.wishlist || []).some((w) => w.id === parseInt(id, 10));
            setIsInWishlist(exists);
          }
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo(0, 0);
  }, [id, isAuthenticated, isBuyer]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in as a buyer to save parts to your wishlist.');
      navigate('/login');
      return;
    }
    if (!isBuyer) {
      toast.warning('Only buyer accounts can use the wishlist feature.');
      return;
    }

    try {
      if (isInWishlist) {
        await wishlistService.remove(part.id);
        setIsInWishlist(false);
        toast.success(`Removed from wishlist.`);
      } else {
        await wishlistService.add(part.id);
        setIsInWishlist(true);
        toast.success(`Added to wishlist.`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Submit Inquiry
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to send inquiries to sellers.');
      navigate('/login');
      return;
    }
    if (part.seller_id === user?.id) {
      toast.warning('You cannot send inquiries for your own listing.');
      return;
    }

    setSubmitting(true);
    try {
      await inquiryService.create({
        part_id: part.id,
        message: inquiryData.message,
        quantity: inquiryData.quantity
      });
      toast.success('Your inquiry has been sent to the seller!');
      setInquiryModalOpen(false);
      setInquiryData({ message: '', quantity: 1 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Purchase Request
  const handleBuySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to submit purchase requests.');
      navigate('/login');
      return;
    }
    if (part.seller_id === user?.id) {
      toast.warning('You cannot buy your own listed machine parts.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestService.create({
        part_id: part.id,
        quantity: buyData.quantity,
        message: buyData.message
      });
      toast.success(`Purchase request submitted for ₹${res.data.total_price}! Seller notified.`);
      setBuyModalOpen(false);
      setBuyData({ quantity: 1, message: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Report
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to report listings.');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await reportService.create({
        part_id: part.id,
        reason: reportData.reason,
        details: reportData.details
      });
      toast.success('Report submitted to MachineX moderators.');
      setReportModalOpen(false);
      setReportData({ reason: 'Incorrect information', details: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-32"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 h-96 bg-slate-200 rounded-3xl"></div>
          <div className="md:col-span-5 space-y-4">
            <div className="h-8 bg-slate-300 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-24 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Machine Part Not Found</h2>
        <p className="text-slate-500 mb-6">This listing may have been sold or removed by administrators.</p>
        <Link to="/marketplace" className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(part.price);

  const calculatedTotal = (buyData.quantity * part.price).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/marketplace" className="hover:text-orange-600 flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </Link>
        <span>/</span>
        <Link to={`/marketplace?category=${part.category_id}`} className="hover:text-orange-600">
          {part.category_name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{part.name}</span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Gallery / Large Visual */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl bg-slate-950 overflow-hidden border border-slate-800 shadow-elevated group">
            <img
              src={part.image || '/uploads/siemens-motor.jpg'}
              alt={part.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/uploads/siemens-motor.jpg';
              }}
              className="w-full h-80 sm:h-[450px] object-cover"
            />
            <div className="absolute top-4 left-4">
              <ConditionBadge condition={part.condition_state} />
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>MachineX Verified Listing • Ready for Dispatch</span>
              </div>
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Spec Sheet & Purchasing Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  {part.brand}
                </span>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-xl border transition-all ${
                    isInWishlist
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-slate-50 text-slate-400 hover:text-rose-500 border-slate-200'
                  }`}
                  title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {part.name}
              </h1>

              {part.model_number && (
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Model / Part Number: <span className="font-semibold text-slate-800">{part.model_number}</span>
                </p>
              )}
            </div>

            {/* Price Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">Surplus Price</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">{formattedPrice}</span>
                <span className="text-xs text-slate-500 ml-1">/ unit</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Stock Available</span>
                <span className="text-sm font-bold text-emerald-600">{part.quantity} units in stock</span>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{part.category_name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                <span className="font-semibold text-slate-900 mt-0.5 block truncate">{part.location || 'India'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setBuyModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Request to Buy</span>
              </button>

              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-orange-400" />
                <span>Send Inquiry</span>
              </button>
            </div>
          </div>

          {/* Seller Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Seller</span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span>{part.seller_rating || '4.9'} / 5.0</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-lg">
                <Building2 className="w-6 h-6 text-slate-600" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-slate-900 truncate">{part.seller_company || part.seller_name}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 truncate mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {part.seller_location || part.location || 'India'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Certified Industrial Supplier • Verified Business Identity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <FileText className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold text-slate-900">Technical Description & Condition Notes</h3>
        </div>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-line">
          {part.description || 'No additional technical specifications provided for this machine part.'}
        </div>
      </div>

      {/* Related Machine Parts */}
      {relatedParts.length > 0 && (
        <div className="space-y-6 pt-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Similar Catalog Items</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Related Machine Parts</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedParts.map((rp) => (
              <ProductCard key={rp.id} part={rp} />
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Send Inquiry */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Send Inquiry to Seller</h3>
              <button onClick={() => setInquiryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-slate-900">{part.name}</p>
                <p className="text-slate-500">Seller: {part.seller_company || part.seller_name}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quantity Required</label>
                <input
                  type="number"
                  min="1"
                  max={part.quantity}
                  value={inquiryData.quantity}
                  onChange={(e) => setInquiryData({ ...inquiryData, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Message</label>
                <textarea
                  rows="4"
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                  placeholder="Ask about test certificates, shipping terms, packaging, or compatibility..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Request to Buy (With Automatic Quantity × Price Calculation) */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Submit Purchase Request</h3>
              <button onClick={() => setBuyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBuySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quantity (Max: {part.quantity})</label>
                <input
                  type="number"
                  min="1"
                  max={part.quantity}
                  value={buyData.quantity}
                  onChange={(e) => setBuyData({ ...buyData, quantity: Math.min(part.quantity, Math.max(1, parseInt(e.target.value, 10) || 1)) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              {/* Automatic Calculation Card */}
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-1.5">
                <div className="flex justify-between text-xs text-orange-950">
                  <span>Unit Price:</span>
                  <span className="font-semibold">{formattedPrice}</span>
                </div>
                <div className="flex justify-between text-xs text-orange-950">
                  <span>Quantity:</span>
                  <span className="font-semibold">× {buyData.quantity}</span>
                </div>
                <div className="pt-2 border-t border-orange-200/80 flex justify-between text-sm font-black text-orange-950">
                  <span>Total Payable:</span>
                  <span className="text-lg text-orange-600">{calculatedTotal}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Purchase Note / Shipping Address</label>
                <textarea
                  rows="3"
                  value={buyData.message}
                  onChange={(e) => setBuyData({ ...buyData, message: e.target.value })}
                  placeholder="Provide delivery location, GST number, or PO reference..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBuyModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Report Listing */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Report Inappropriate Listing</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Report</label>
                <select
                  value={reportData.reason}
                  onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Incorrect information">Incorrect information</option>
                  <option value="Fraudulent listing">Fraudulent listing</option>
                  <option value="Duplicate listing">Duplicate listing</option>
                  <option value="Wrong category">Wrong category</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Additional Details</label>
                <textarea
                  rows="3"
                  value={reportData.details}
                  onChange={(e) => setReportData({ ...reportData, details: e.target.value })}
                  placeholder="Explain why this listing violates MachineX standards..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
