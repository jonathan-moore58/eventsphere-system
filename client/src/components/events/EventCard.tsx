import React from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '../../types';
import { use3DTilt } from '../../hooks/use3DTilt';
import { format } from 'date-fns';

const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('/uploads')) {
    const isProd = import.meta.env.PROD;
    const defaultBaseUrl = isProd ? 'https://efficient-reprieve-production-9d02.up.railway.app' : 'http://localhost:5000';
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : defaultBaseUrl;
    return `${baseUrl}${url}`;
  }
  return url;
};

export function EventCard({ event }: { event: Event }) {
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt(10);

  return (
    <Link to={`/events/${event.id}`}>
      <div 
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-[20px] transition-all duration-300 shadow-card hover:shadow-glow-violet cursor-pointer h-full flex flex-col group"
      >
        <div className="h-48 bg-gradient-brand w-full relative">
          {event.bannerImage && (
            <img src={getImageUrl(event.bannerImage)} alt={event.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute top-4 left-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-black/50 text-white border-white/20 backdrop-blur-md">
              {event.category}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-md ${event.capacity > 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
              {event.capacity > 0 ? 'Available' : 'Sold Out'}
            </span>
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
          
          <div className="mt-auto space-y-2 text-sm text-slate-400">
            <p>📅 {format(new Date(event.startTime), 'MMM d, yyyy h:mm a')}</p>
            <p>📍 {event.venue}</p>
            <p>👥 {event.capacity} spots left</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-brand-cyan font-bold">
              {event.ticketTypes && event.ticketTypes.length > 0 ? `From Rs. ${Math.min(...event.ticketTypes.map(t => t.price))}` : 'Free'}
            </span>
            <span className="text-brand-violet font-semibold text-sm group-hover:text-white transition-colors">Book Now →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
