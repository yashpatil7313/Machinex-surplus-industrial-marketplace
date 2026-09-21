import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  ChevronDown,
  Filter,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { partsService, categoryService, wishlistService } from '../services/api';
import { ProductCard } from '../components/marketplace/ProductCard';
import { ProductSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isBuyer } = useAuth();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  // Data States
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Available brands list
  const availableBrands = [
    'Siemens',
    'SKF',
    'Bosch Rexroth',
    'Schneider Electric',
    'ABB',
    'Parker Hannifin',
    'Mitsubishi Electric',
    'FAG / Schaeffler',
    'Allen-Bradley',
    'Grundfos',
    'THK Japan'
  ];

  const availableConditions = [
    'New / Unused',
    'Surplus',
    'Like New',
    'Used - Good',
    'Used - Fair'
  ];

  // Fetch Categories on mount
  useEffect(() => {
    categoryService.getCategories()
      .then((res) => {
        if (res.data?.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch Wishlist IDs if logged in as buyer
  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated && isBuyer) {
      try {
        const res = await wishlistService.getWishlist();
        if (res.data?.wishlist) {
          setWishlistIds(new Set(res.data.wishlist.map(w => w.id)));
        }
      } catch (err) {
        console.warn('Could not fetch wishlist:', err.message);
      }
    }
  }, [isAuthenticated, isBuyer]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Fetch Parts based on active filters
  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: sort !== 'newest' ? sort : undefined,
      };

      if (search.trim()) params.search = search.trim();
      if (category && category !== 'all') params.category = category;
      if (condition && condition !== 'all') params.condition = condition;
      if (brand && brand !== 'all') params.brand = brand;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (inStockOnly) params.in_stock = true;

      const res = await partsService.getParts(params);
      if (res.data?.parts) {
        setParts(res.data.parts);
        setPagination(res.data.pagination || { total: res.data.parts.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch marketplace parts:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, condition, brand, minPrice, maxPrice, inStockOnly, sort, page]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  // Sync state to URL params
  const applyFiltersToUrl = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category && category !== 'all') params.set('category', category);
    if (condition && condition !== 'all') params.set('condition', condition);
    if (brand && brand !== 'all') params.set('brand', brand);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (inStockOnly) params.set('in_stock', 'true');
    if (sort && sort !== 'newest') params.set('sort', sort);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    applyFiltersToUrl();
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setCondition('all');
    setBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSort('newest');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handleWishlistToggle = (partId, isNowInWishlist) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isNowInWishlist) next.add(partId);
      else next.delete(partId);
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Search Bar */}
      <div className="mb-8 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Industrial Procurement</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Machine Parts Marketplace</h1>
          <p className="text-sm text-slate-600 mt-1">Browse, filter, and inspect verified surplus, unused, and refurbished industrial components.</p>
        </div>

        {/* Global Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search part name, brand, model (e.g. 5 HP Siemens motor)..."
              className="w-full pl-12 pr-28 py-3 bg-white border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm font-semibold text-slate-700 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-orange-500" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-2xl shadow-sm text-xs font-medium text-slate-700">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer pr-2"
              >
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900">Filters</h3>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.parts_count || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Condition</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => { setCondition('all'); setPage(1); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    condition === 'all' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Conditions
                </button>
                {availableConditions.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCondition(c); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      condition === c ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Brand</label>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* In-Stock Only Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Mobile Filter Sheet */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end md:hidden">
            <div className="w-80 max-w-full bg-white h-full p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg">Filter Marketplace</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="all">All Conditions</option>
                    {availableConditions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="all">All Brands</option>
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-orange-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => {
                    applyFiltersToUrl();
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold text-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-xs"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Product Grid */}
        <div className="md:col-span-3 space-y-6">
          {/* Active Filter Tags */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/80">
            <span>Showing <strong className="text-slate-900">{pagination.total}</strong> active machine parts</span>
            {search && (
              <span className="flex items-center gap-1 text-orange-600 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Ranked by relevance for "{search}"
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : parts.length === 0 ? (
            <EmptyState
              title="No machine parts matched your search"
              description="Try adjusting your keywords, widening the price range, or selecting another category."
              actionText="Clear All Filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {parts.map((part) => (
                <ProductCard
                  key={part.id}
                  part={part}
                  isInWishlist={wishlistIds.has(part.id)}
                  onWishlistToggle={handleWishlistToggle}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-8 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-slate-600 px-3">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
