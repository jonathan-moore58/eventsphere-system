import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useEvents } from '../../hooks/useEvents';
import { PosterCard } from '../../components/events/PosterCard';
import { useAuthStore } from '../../store/authStore';

// ------------------------------------------
// HELPER FOR IMAGES
// ------------------------------------------
const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000';
    return `${baseUrl}${url}`;
  }
  return url;
};



// ------------------------------------------
// MAIN COMPONENT
// ------------------------------------------
export default function LandingPage() {
  const { data: events } = useEvents();
  const featuredEvents = events?.slice(0, 3) || [];
  const [time, setTime] = useState('');
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const updateTime = () => setTime(new Date().toISOString().split('T')[1].substring(0, 8));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="bg-[#09090b] min-h-screen text-[#fafafa] font-body-custom selection:bg-[#eab308] selection:text-[#09090b] overflow-x-hidden">

        {/* ==========================================
            BRUTALIST NAVBAR
        ========================================== */}
        <nav className="w-full border-b-2 border-[#27272a] bg-[#09090b] px-4 md:px-8 py-4 flex justify-between items-center relative z-20">
          <div className="font-display-custom text-2xl text-[#fafafa] tracking-widest uppercase">
            EVENTSPHERE
          </div>
          <div className="flex items-center gap-4 md:gap-8 font-mono-custom text-xs font-bold uppercase">
            <Link to="/events" className="text-[#a1a1aa] hover:text-[#eab308] transition-colors">
              [ DIRECTORY ]
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-[#09090b] bg-[#eab308] px-3 py-1 hover:bg-[#fafafa] transition-colors">
                [ {user?.role === 'organizer' || user?.role === 'admin' ? 'NODE_ADMIN' : 'DASHBOARD'} ]
              </Link>
            ) : (
              <Link to="/login" className="text-[#a1a1aa] hover:text-[#eab308] transition-colors">
                [ AUTH ]
              </Link>
            )}
          </div>
        </nav>

        {/* ==========================================
            HERO: THE TICKET STUB
        ========================================== */}
        <section className="relative pt-24 pb-12 px-4 md:px-8 w-full flex justify-center">
          <div className="w-full max-w-6xl relative z-10">

            {/* The Physical Ticket */}
            <div className="bg-[#eab308] text-[#09090b] relative shadow-2xl flex flex-col md:flex-row ticket-mask-both md:ticket-mask-horizontal">

              {/* Ticket Main Body */}
              <div className="flex-1 p-8 md:p-16 pt-16 md:pt-16 pb-12 md:pb-16 relative flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#09090b]/20 border-dashed">

                {/* Meta Header */}
                <div className="flex justify-between items-start mb-12">
                  <div className="font-mono-custom text-xs font-bold uppercase tracking-widest">
                    EVENTSPHERE_SYSTEM <br />
                    PLATFORM_ACCESS_NODE
                  </div>
                  <div className="font-mono-custom text-xs font-bold uppercase text-right">
                    SYS.TIME // {time} <br />
                    LOC // PAKISTAN
                  </div>
                </div>

                <h1 className="font-display-custom text-7xl md:text-[8rem] lg:text-[10rem] leading-[0.85] tracking-tight mb-8">
                  LIVE<br />ACCESS.
                </h1>

                <p className="font-mono-custom text-sm md:text-base max-w-lg font-bold mb-12 border-l-4 border-[#09090b] pl-4">
                  THE AUTHENTIC PLATFORM FOR LIVE EVENTS.
                  DISCOVER HEADLINERS, SECURE YOUR SPOT, AND POWER YOUR NEXT SHOW.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <Link to="/events" className="w-full sm:w-auto">
                    <button className="w-full px-8 py-4 bg-[#09090b] text-[#eab308] font-mono-custom font-bold uppercase text-sm hover:bg-[#18181b] transition-colors flex items-center justify-center gap-3">
                      ISSUE PASS
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </Link>
                  <Link to="/register" className="w-full sm:w-auto">
                    <button className="w-full px-8 py-4 bg-transparent border-2 border-[#09090b] text-[#09090b] font-mono-custom font-bold uppercase text-sm hover:bg-[#09090b] hover:text-[#eab308] transition-colors flex items-center justify-center">
                      SYSTEM LOGIN
                    </button>
                  </Link>
                </div>
              </div>

              {/* Ticket Stub (Right side on desktop, bottom on mobile) */}
              <div className="w-full md:w-48 lg:w-64 bg-[#eab308] p-8 flex flex-col justify-between items-center relative min-h-[250px]">

                <div className="w-full text-center mb-6">
                  <div className="font-display-custom text-4xl transform md:rotate-90 md:translate-y-16 tracking-widest">ADMIT ONE</div>
                </div>

                {/* Massive CSS Barcode */}
                <div className="barcode-vertical w-16 h-32 md:h-64 mt-auto mb-6 md:mb-12 opacity-80 hidden md:block"></div>
                <div className="barcode-horizontal-white w-full h-16 opacity-80 block md:hidden bg-blend-difference filter invert"></div>

                <div className="font-mono-custom text-xs font-bold">NO: 8249-112</div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            METRICS / SYSTEM STATUS
        ========================================== */}
        <section className="border-y border-[#27272a] bg-[#09090b] py-4 mt-12 overflow-hidden flex items-center">
          <div className="marquee-container font-mono-custom text-xs text-[#eab308] tracking-widest font-bold">
            <div className="marquee-content">
              <span className="pr-4">SYSTEM STATUS: ONLINE // EVENTS_HOSTED: 500+ // TICKETS_PROCESSED: 50,000+ // UPTIME: 99.9% // SECURE_NODE_ACTIVE // SYSTEM STATUS: ONLINE // EVENTS_HOSTED: 500+ // TICKETS_PROCESSED: 50,000+ // UPTIME: 99.9% // SECURE_NODE_ACTIVE //</span>
              <span className="pr-4">SYSTEM STATUS: ONLINE // EVENTS_HOSTED: 500+ // TICKETS_PROCESSED: 50,000+ // UPTIME: 99.9% // SECURE_NODE_ACTIVE // SYSTEM STATUS: ONLINE // EVENTS_HOSTED: 500+ // TICKETS_PROCESSED: 50,000+ // UPTIME: 99.9% // SECURE_NODE_ACTIVE //</span>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION: HEADLINERS (Featured Events)
        ========================================== */}
        <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-2 border-[#27272a] pb-6 gap-6">
            <div>
              <div className="font-mono-custom text-sm text-[#eab308] font-bold mb-2 uppercase">// SEC:01</div>
              <h2 className="font-display-custom text-6xl md:text-7xl uppercase tracking-tight leading-none text-[#fafafa]">HEADLINERS</h2>
            </div>
            <Link to="/events">
              <button className="font-mono-custom text-sm uppercase text-[#fafafa] border border-[#27272a] px-6 py-3 hover:bg-[#fafafa] hover:text-[#09090b] transition-colors flex items-center gap-2 font-bold">
                VIEW ALL LOGS <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event: any, index: number) => (
              <PosterCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </section>

        {/* ==========================================
            SECTION: ENTRY PROTOCOL
        ========================================== */}
        <section className="py-24 border-t border-[#27272a] bg-[#111]">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="mb-16">
              <div className="font-mono-custom text-sm text-[#eab308] font-bold mb-2 uppercase">// SEC:02</div>
              <h2 className="font-display-custom text-6xl md:text-7xl uppercase tracking-tight leading-none text-[#fafafa]">ENTRY PROTOCOL</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#27272a] border border-[#27272a]">
              {[
                { step: '01', title: 'LOCATE', desc: 'Scan the network for active events in your sector.' },
                { step: '02', title: 'AUTHORIZE', desc: 'Secure payment via encrypted gateways (Card, JazzCash).' },
                { step: '03', title: 'EXECUTE', desc: 'Present digital barcode at checkpoint for instant access.' }
              ].map((item, i) => (
                <div key={i} className="bg-[#18181b] p-10 flex flex-col h-full hover:bg-[#1f1f22] transition-colors">
                  <div className="font-mono-custom text-4xl text-[#eab308] font-bold mb-12 opacity-50">{item.step}</div>
                  <h3 className="font-display-custom text-4xl text-[#fafafa] mb-4">{item.title}</h3>
                  <p className="font-mono-custom text-sm text-[#a1a1aa] leading-relaxed uppercase">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION: BACKSTAGE ACCESS (Features)
        ========================================== */}
        <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="mb-12 border-b-2 border-[#27272a] pb-6">
            <div className="font-mono-custom text-sm text-[#eab308] font-bold mb-2 uppercase">// SEC:03</div>
            <h2 className="font-display-custom text-6xl md:text-7xl uppercase tracking-tight leading-none text-[#fafafa]">BACKSTAGE ACCESS</h2>
            <p className="font-mono-custom text-sm text-[#a1a1aa] uppercase mt-4 max-w-2xl">
              INFRASTRUCTURE BUILT FOR ORGANIZERS WHO DEMAND ABSOLUTE CONTROL OVER THEIR PRODUCTION.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { id: 'TELEMETRY', title: 'REAL-TIME ANALYTICS', text: 'Live dashboard tracking gross revenue, check-in flow rates, and audience demographics.' },
              { id: 'SECURITY', title: 'SMART TICKETING', text: 'Dynamic, non-replicable QR codes processed securely at the gate via organizer tools.' },
              { id: 'COMMS', title: 'AUDIENCE COMMS', text: 'Direct broadcast capabilities to ticket holders regarding venue changes or set times.' },
              { id: 'FINANCE', title: 'PAYMENT ROUTING', text: 'Instant processing across local networks including IBFT, ensuring fast liquidity.' }
            ].map((feat, i) => (
              <div key={i} className="brutal-border bg-[#18181b] p-8 flex flex-col group hover:border-[#eab308] transition-colors">
                <div className="flex justify-between items-center border-b border-[#27272a] pb-4 mb-6">
                  <h3 className="font-display-custom text-3xl text-[#fafafa] group-hover:text-[#eab308] transition-colors">{feat.title}</h3>
                  <span className="font-mono-custom text-xs text-[#a1a1aa] bg-[#09090b] px-2 py-1">SYS.{feat.id}</span>
                </div>
                <p className="font-mono-custom text-sm text-[#a1a1aa] leading-relaxed uppercase">{feat.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
            FINAL CTA
        ========================================== */}
        <section className="py-32 border-t border-[#27272a] bg-[#18181b] flex justify-center items-center px-4">
          <div className="text-center max-w-3xl">
            <h2 className="font-display-custom text-6xl md:text-8xl text-[#fafafa] mb-8 leading-none tracking-tight">
              INITIATE <br /><span className="text-[#eab308]">PRODUCTION.</span>
            </h2>
            <p className="font-mono-custom text-sm text-[#a1a1aa] mb-12 uppercase font-bold">
              SYSTEM STANDING BY. LAUNCH YOUR NEXT EVENT.
            </p>
            <Link to="/register">
              <button className="px-12 py-5 bg-[#fafafa] text-[#09090b] font-mono-custom font-bold uppercase text-sm hover:bg-[#eab308] transition-colors flex items-center justify-center gap-3 mx-auto">
                CREATE ORGANIZER ACCOUNT
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </Link>
          </div>
        </section>

        {/* ==========================================
            FOOTER
        ========================================== */}
        <footer className="border-t-4 border-[#eab308] py-8 bg-[#09090b]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase">
              © 2026 EVENTSPHERE
            </div>
            <div className="flex gap-6 font-mono-custom text-xs font-bold text-[#a1a1aa]">
              <span className="hover:text-[#eab308] cursor-pointer uppercase transition-colors">PROTOCOL</span>
              <span className="hover:text-[#eab308] cursor-pointer uppercase transition-colors">TERMS</span>
              <span className="hover:text-[#eab308] cursor-pointer uppercase transition-colors">CONTACT</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
