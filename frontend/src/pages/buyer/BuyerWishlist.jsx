import React, { useState, useEffect } from 'react';
import { Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { wishlistService } from '../../services/api';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { ProductSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const BuyerWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadWishlist = async () => {
    try {
      const res = await wishlistService.getWishlist();
      if (res.data?.wishlist) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      toast.error('Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleWishlistToggle = (partId, isStillInWishlist) => {
    if (!isStillInWishlist) {
      setWishlist((prev) => prev.filter((item) => item.id !== partId));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Machine Parts</h1>
        <p className="text-xs text-slate-500 mt-0.5">Quickly access items you are evaluating for upcoming maintenance or machine builds</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your wishlist is empty"
          description="Save parts from the marketplace to keep track of pricing and stock availability."
          actionText="Browse Marketplace"
          actionLink="/marketplace"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((part) => (
            <ProductCard
              key={part.id}
              part={part}
              isInWishlist={true}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
