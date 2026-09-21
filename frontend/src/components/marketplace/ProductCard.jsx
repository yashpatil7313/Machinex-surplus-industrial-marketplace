import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Building2, Layers, Sparkles, ArrowUpRight } from 'lucide-react';
import { ConditionBadge } from '../common/ConditionBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { wishlistService } from '../../services/api';

export const ProductCard = ({ part, isInWishlist = false, onWishlistToggle }) => {
  const { isAuthenticated, isBuyer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in as a buyer to save items to your wishlist.');
      navigate('/login');
      return;
    }

    if (!isBuyer) {
      toast.warning('Only buyer accounts can maintain a wishlist.');
      return;
    }

    try {
      if (isInWishlist) {
        await wishlistService.remove(part.id);
        toast.success(`Removed "${part.name}" from wishlist.`);
      } else {
        await wishlistService.add(part.id);
        toast.success(`Added "${part.name}" to wishlist.`);
      }
      if (onWishlistToggle) {
        onWishlistToggle(part.id, !isInWishlist);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(part.price);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Smart Match Tag */}
      {part.is_best_match && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-600 text-white text-[11px] font-bold shadow-md shadow-orange-600/30">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Best Match</span>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${
          isInWishlist
            ? 'bg-rose-50 text-rose-600 border border-rose-200'
            : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-200/60'
        }`}
      >
        <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current text-rose-500' : ''}`} />
      </button>

      {/* Part Image Preview */}
      <Link to={`/parts/${part.id}`} className="block relative h-48 sm:h-52 bg-slate-950 overflow-hidden">
        <img
          src={part.image || '/uploads/siemens-motor.jpg'}
          alt={part.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/uploads/siemens-motor.jpg';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute bottom-2.5 left-2.5">
          <ConditionBadge condition={part.condition_state} />
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Brand Strip */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span className="flex items-center gap-1 uppercase tracking-wider text-[11px] font-bold text-slate-400">
              <Layers className="w-3 h-3 text-orange-500" />
              {part.category_name}
            </span>
            <span className="font-semibold text-slate-700">{part.brand}</span>
          </div>

          {/* Part Name */}
          <Link to={`/parts/${part.id}`} className="block">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {part.name}
            </h3>
          </Link>

          {/* Model Number */}
          {part.model_number && (
            <p className="text-xs font-mono text-slate-500 mt-1 truncate">
              PN: {part.model_number}
            </p>
          )}

          {/* Seller & Location Strip */}
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{part.seller_company || part.seller_name}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{part.location || 'India'}</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Unit Price</span>
            <p className="text-lg font-black text-slate-900 tracking-tight">{formattedPrice}</p>
            <span className="text-[11px] text-slate-500 font-medium">Qty: <span className="font-bold text-slate-700">{part.quantity} available</span></span>
          </div>

          <Link
            to={`/parts/${part.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 group-hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm group-hover:shadow-orange-600/20"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
