import React from 'react';

export const ConditionBadge = ({ condition }) => {
  const c = (condition || '').toLowerCase();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (c.includes('unused') || c.includes('new / unused')) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
  } else if (c.includes('surplus')) {
    style = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
  } else if (c.includes('like new')) {
    style = 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
  } else if (c.includes('good')) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (c.includes('fair')) {
    style = 'bg-orange-50 text-orange-700 border-orange-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border tracking-tight ${style}`}>
      {condition || 'Surplus'}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  if (s === 'approved') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    label = 'Approved';
  } else if (s === 'pending') {
    style = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    label = 'Pending Review';
  } else if (s === 'rejected') {
    style = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    label = 'Rejected';
  } else if (s === 'sold') {
    style = 'bg-slate-200 text-slate-700 border-slate-300 font-semibold';
    label = 'Sold Out';
  } else if (s === 'completed') {
    style = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
    label = 'Completed';
  } else if (s === 'accepted') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    label = 'Accepted';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {label}
    </span>
  );
};
