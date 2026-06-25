import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventDetail } from '../../hooks/useEvents';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  }
  return url;
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: event, isLoading } = useEventDetail(id!);

  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  if (isLoading) return (
    <div className="min-h-screen bg-[#09090b] p-8 flex items-center justify-center">
      <div className="font-mono-custom text-[#eab308] text-sm font-bold uppercase animate-pulse">
        LOADING_EVENT_DATA...
      </div>
    </div>
  );
  
  if (!event) return (
    <div className="min-h-screen bg-[#09090b] p-8 flex items-center justify-center">
      <div className="font-mono-custom text-[#ef4444] text-sm font-bold uppercase">
        SYS.ERR // EVENT_NOT_FOUND
      </div>
    </div>
  );

  const handleTicketChange = (ticketId: string, delta: number) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [ticketId]: next };
    });
  };

  const totalSelected = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  const totalPrice = event.ticketTypes?.reduce((total, t) => total + (selectedTickets[t.id] || 0) * t.price, 0) || 0;

  const handleProceed = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Save selection to state or pass via navigation state
    navigate(`/booking/${event.id}`, { state: { selectedTickets } });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-body-custom pb-32">
      
      {/* ------------------------------------------
          HERO: THE RIDER HEADER
      ------------------------------------------ */}
      <div className="relative h-[60vh] w-full bg-black border-b-2 border-[#27272a] overflow-hidden">
        {event.bannerImage && (
          <img 
            src={getImageUrl(event.bannerImage)} 
            className="w-full h-full object-cover filter grayscale opacity-50" 
            alt={event.title} 
          />
        )}
        
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 pointer-events-none"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-mono-custom text-xs font-bold px-3 py-1 bg-[#eab308] text-[#09090b] uppercase tracking-widest mb-4 inline-block">
                SYS.CAT // {event.category}
              </span>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-display-custom font-bold text-[#fafafa] uppercase leading-none tracking-tight">
                {event.title}
              </h1>
            </div>
            <div className="font-mono-custom text-xs text-[#a1a1aa] uppercase text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-[#eab308] pl-4 md:pr-4 md:pl-0">
              <span className="block text-[#fafafa] font-bold">ORGANIZER_ID:</span>
              {event.organizer?.user.name} <br/>
              <span className="block mt-2 text-[#fafafa] font-bold">STATUS:</span>
              {event.status}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* ------------------------------------------
            LEFT COLUMN: THE SPECS
        ------------------------------------------ */}
        <div className="lg:col-span-2 space-y-12">
          
          <section>
            <div className="font-mono-custom text-sm text-[#eab308] font-bold mb-2 uppercase tracking-widest">// SEC:BRIEF</div>
            <h2 className="text-4xl font-display-custom font-bold text-[#fafafa] uppercase mb-6">EVENT PARAMETERS</h2>
            <div className="font-mono-custom text-sm text-[#a1a1aa] leading-relaxed uppercase whitespace-pre-line border-l border-[#27272a] pl-6">
              {event.description}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#27272a] border border-[#27272a]">
            <div className="bg-[#18181b] p-8">
              <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase tracking-widest mb-2">T_ZERO (START_TIME)</p>
              <p className="font-mono-custom text-lg text-[#fafafa] font-bold uppercase">{format(new Date(event.startTime), 'dd.MM.yyyy')} <br/> {format(new Date(event.startTime), 'HH:mm')}</p>
            </div>
            <div className="bg-[#18181b] p-8">
              <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase tracking-widest mb-2">LOC_DATA (VENUE)</p>
              <p className="font-mono-custom text-lg text-[#fafafa] font-bold uppercase">{event.venue}</p>
            </div>
            <div className="bg-[#18181b] p-8 md:col-span-2 flex justify-between items-center group cursor-pointer hover:bg-[#1f1f22] transition-colors">
               <div>
                <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase tracking-widest mb-2">NAV_SYSTEM</p>
                <p className="font-mono-custom text-lg text-[#eab308] font-bold uppercase">OPEN IN GOOGLE MAPS</p>
               </div>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </section>
        </div>

        {/* ------------------------------------------
            RIGHT COLUMN: THE BOX OFFICE TERMINAL
        ------------------------------------------ */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#18181b] brutal-border relative ticket-mask-both">
            <div className="p-8 pb-10">
              <div className="border-b border-[#27272a] pb-4 mb-8">
                <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2">
                  // SEC:BOX_OFFICE
                </span>
                <h3 className="text-4xl font-display-custom font-bold text-[#fafafa] uppercase leading-none tracking-tight">
                  TICKET TERMINAL
                </h3>
              </div>
              
              <div className="space-y-6 mb-8">
                {event.ticketTypes?.map(ticket => (
                  <div key={ticket.id} className="border-l-2 border-[#eab308] bg-[#09090b] p-4 flex justify-between items-center">
                    <div>
                      <p className="font-mono-custom text-sm font-bold text-[#fafafa] uppercase">{ticket.name}</p>
                      <p className="font-mono-custom text-xs text-[#a1a1aa] mt-1">PKR {ticket.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-[#18181b] brutal-border p-1">
                      <button 
                        onClick={() => handleTicketChange(ticket.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-[#fafafa] hover:bg-[#27272a] transition-colors disabled:opacity-30"
                        disabled={!selectedTickets[ticket.id]}
                      >-</button>
                      <span className="font-mono-custom text-sm font-bold text-[#eab308] w-6 text-center">
                        {selectedTickets[ticket.id] || 0}
                      </span>
                      <button 
                        onClick={() => handleTicketChange(ticket.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#fafafa] hover:bg-[#27272a] transition-colors disabled:opacity-30"
                        disabled={(selectedTickets[ticket.id] || 0) >= ticket.qtyRemaining}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-[#27272a] pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-mono-custom text-xs text-[#a1a1aa] uppercase tracking-widest">TOTAL_DUE:</span>
                  <span className="font-mono-custom text-2xl font-bold text-[#fafafa]">PKR {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleProceed}
                disabled={totalSelected === 0}
                className="w-full bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-4 py-5 hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
              >
                {isAuthenticated ? 'INITIATE TRANSACTION' : 'REQUIRE LOGIN TO BOOK'}
                {isAuthenticated && !totalSelected && <span className="text-[10px] tracking-widest">(SELECT QTY)</span>}
              </button>
            </div>
            <div className="h-12 w-full barcode-horizontal-white opacity-50 my-6"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
