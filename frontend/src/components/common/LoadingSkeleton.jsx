import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle animate-pulse">
      <div className="h-48 bg-slate-200"></div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>
        <div className="h-5 bg-slate-300 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="h-6 bg-slate-300 rounded w-20"></div>
          <div className="h-8 bg-slate-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
      <div className="divide-y divide-slate-100">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-16 px-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-6 bg-slate-200 rounded-full w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
