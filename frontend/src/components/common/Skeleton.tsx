import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-soft-card animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-16"></div>
      </div>
      <div className="h-5 bg-slate-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-200 rounded w-full"></div>
        <div className="h-3.5 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <div className="h-6 bg-slate-200 rounded w-20"></div>
        <div className="h-6 bg-slate-200 rounded w-16"></div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        <div className="flex space-x-4 pt-2">
          <div className="h-8 bg-slate-200 rounded w-24"></div>
          <div className="h-8 bg-slate-200 rounded w-24"></div>
          <div className="h-8 bg-slate-200 rounded w-24"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-64"></div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-64"></div>
      </div>
    </div>
  );
};
