import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Helper for images
const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  }
  return url;
};

export function PosterCard({ event, index }: { event: any, index: number }) {
  return (
    <Link to={`/events/${event.id}`} className="block group h-full">
      <div className="brutal-border hover-brutal-border bg-[#18181b] transition-colors duration-200 h-full flex flex-col relative overflow-hidden">
        
        {/* Top Meta Bar */}
        <div className="border-b border-[#27272a] p-3 flex justify-between items-center bg-[#09090b] group-hover:bg-[#eab308] transition-colors duration-200">
          <span className="font-mono-custom text-xs text-[#a1a1aa] group-hover:text-[#09090b] font-bold">
            SEC:{String(index + 1).padStart(2, '0')}
          </span>
          <span className={`font-mono-custom text-xs font-bold px-2 py-0.5 uppercase ${
            event.capacity > 0 
              ? 'text-emerald-500 border border-emerald-500/30 group-hover:border-black group-hover:text-black' 
              : 'text-[#ef4444] border border-[#ef4444]/30 group-hover:border-black group-hover:text-black'
          }`}>
            {event.capacity > 0 ? 'AVAILABLE' : 'SOLD OUT'}
          </span>
        </div>

        {/* Image / Poster Art */}
        <div className="relative h-72 w-full overflow-hidden bg-black filter grayscale group-hover:grayscale-0 transition-all duration-500">
          <img 
            src={getImageUrl(event.bannerImage)} 
            alt={event.title} 
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" 
          />
          <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 brutal-border">
            <span className="font-mono-custom text-xs text-white uppercase tracking-wider">{event.category}</span>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6 flex flex-col flex-1 bg-[#18181b]">
          <h3 className="font-display-custom text-4xl text-[#fafafa] uppercase leading-none tracking-tight mb-4 group-hover:text-[#eab308] transition-colors">
            {event.title}
          </h3>
          
          <div className="mt-auto space-y-4">
            <div className="flex items-start gap-4 border-t border-[#27272a] pt-4">
              <div className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase w-16">LOC //</div>
              <div className="font-mono-custom text-sm text-[#fafafa] uppercase truncate">{event.venue}</div>
            </div>
            
            <div className="flex items-start gap-4 border-t border-[#27272a] pt-4">
              <div className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase w-16">DATE //</div>
              <div className="font-mono-custom text-sm text-[#fafafa] uppercase">{format(new Date(event.startTime), 'dd.MM.yyyy')}</div>
            </div>

            <div className="flex items-end justify-between border-t border-[#27272a] pt-4 mt-6">
              <div>
                <div className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase mb-1">ENTRY FEE</div>
                <div className="font-mono-custom text-lg text-[#fafafa] font-bold">
                  {event.ticketTypes && event.ticketTypes.length > 0 ? `PKR ${Math.min(...event.ticketTypes.map((t: any) => t.price))}` : 'FREE'}
                </div>
              </div>
              <div className="w-10 h-10 bg-[#27272a] flex items-center justify-center group-hover:bg-[#eab308] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white group-hover:text-black">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
