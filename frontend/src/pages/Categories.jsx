import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Cpu,
  Cog,
  Zap,
  Activity,
  Box,
  Sliders,
  Shield,
  Disc,
  Filter
} from 'lucide-react';
import { categoryService } from '../services/api';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories()
      .then((res) => {
        if (res.data?.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getCategoryIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('motor')) return Zap;
    if (n.includes('gear')) return Cog;
    if (n.includes('bearing')) return Disc;
    if (n.includes('sensor') || n.includes('electrical')) return Cpu;
    if (n.includes('pump') || n.includes('hydraulic') || n.includes('pneumatic')) return Activity;
    if (n.includes('valve')) return Sliders;
    return Box;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Component Taxonomy</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">Industrial Categories</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Explore surplus machinery parts cataloged by mechanical, electrical, fluid power, and automation engineering divisions.
        </p>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-white border border-slate-200 animate-pulse p-6"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            return (
              <Link
                key={cat.id}
                to={`/marketplace?category=${cat.id}`}
                className="group p-7 rounded-3xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-elevated hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold group-hover:bg-orange-50 group-hover:text-orange-700 transition-colors">
                    {cat.parts_count || 0} active spares
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                    {cat.description || 'Verified industrial parts available for prompt procurement.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                  <span>Explore category</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
