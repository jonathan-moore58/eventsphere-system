import React from 'react';

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden h-[400px] flex flex-col animate-pulse">
      <div className="h-48 bg-white/10 w-full mb-6"></div>
      <div className="px-6 flex-1 flex flex-col">
        <div className="h-6 bg-white/10 rounded-md w-3/4 mb-4"></div>
        <div className="h-4 bg-white/10 rounded-md w-1/2 mb-2"></div>
        <div className="h-4 bg-white/10 rounded-md w-1/3 mb-auto"></div>
        <div className="h-10 bg-white/10 rounded-xl w-full mt-4"></div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
      <div className="h-10 bg-white/10 rounded w-1/3"></div>
    </div>
  );
}
