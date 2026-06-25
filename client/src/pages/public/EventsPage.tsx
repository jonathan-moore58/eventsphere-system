import React, { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { PosterCard } from '../../components/events/PosterCard';

export default function EventsPage() {
  const { data: events, isLoading, error } = useEvents();
  const [filter, setFilter] = useState('ALL');

  if (isLoading) return (
    <div className="min-h-screen bg-[#09090b] p-8 flex items-center justify-center">
      <div className="font-mono-custom text-[#eab308] text-sm font-bold uppercase animate-pulse">
        LOADING_DIRECTORY...
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#09090b] p-8 flex items-center justify-center">
      <div className="font-mono-custom text-[#ef4444] text-sm font-bold uppercase">
        SYS.ERR // FAILED TO LOAD DIRECTORY
      </div>
    </div>
  );

  const filteredEvents = events?.filter(event => {
    if (filter === 'ALL') return true;
    return event.category.toUpperCase() === filter;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-body-custom pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header / Title */}
        <div className="mb-12 border-b-2 border-[#27272a] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="font-mono-custom text-sm text-[#eab308] font-bold mb-2 uppercase tracking-widest">// DIR:EVENTS</div>
            <h1 className="font-display-custom text-7xl md:text-8xl uppercase tracking-tight leading-none text-[#fafafa]">
              THE DIRECTORY
            </h1>
          </div>
          
          {/* Brutalist Filters */}
          <div className="flex gap-2 bg-[#18181b] p-2 brutal-border">
            {['ALL', 'CONCERT', 'CONFERENCE', 'SPORTS', 'FESTIVAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`font-mono-custom text-[10px] sm:text-xs font-bold px-4 py-2 uppercase transition-colors ${
                  filter === cat 
                    ? 'bg-[#eab308] text-[#09090b]' 
                    : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* The Poster Wall */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents?.map((event, index) => (
            <PosterCard key={event.id} event={event} index={index} />
          ))}
          
          {filteredEvents?.length === 0 && (
            <div className="col-span-full border border-dashed border-[#27272a] p-16 text-center">
              <span className="font-mono-custom text-[#a1a1aa] uppercase text-sm font-bold tracking-widest">
                NO_RECORDS_FOUND_FOR_QUERY
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
