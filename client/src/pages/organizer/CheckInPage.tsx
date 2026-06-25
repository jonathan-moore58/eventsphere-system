import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function CheckInPage() {
  const { eventId } = useParams();
  const [manualRef, setManualRef] = useState('');
  const [lastScan, setLastScan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    
    scanner.render(async (decodedText) => {
      // Pause scanning
      scanner.pause();
      await handleCheckIn(decodedText);
      // Resume after 3 seconds
      setTimeout(() => {
        scanner.resume();
      }, 3000);
    }, (err) => {
      // ignore
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const handleCheckIn = async (bookingId: string) => {
    try {
      setLoading(true);
      const res = await api.post('/bookings/checkin', { bookingId });
      setLastScan({ success: true, message: res.data.message, attendee: res.data.attendee, ref: bookingId });
      toast.success(`ADMITTED: ${res.data.attendee}`);
    } catch (err: any) {
      setLastScan({ success: false, message: err.response?.data?.error || 'AUTHORIZATION_DENIED', ref: bookingId });
      toast.error('AUTHORIZATION_DENIED');
    } finally {
      setLoading(false);
      setManualRef('');
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#27272a] pb-6 gap-6">
        <div>
          <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2 animate-pulse">
            // SYS:ACCESS_CONTROL_NODE
          </span>
          <h1 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight">
            ENTRY VERIFICATION
          </h1>
        </div>
        <div className="flex gap-4">
          <Link to="/dashboard/organizer">
            <button className="bg-[#27272a] text-[#fafafa] font-mono-custom font-bold uppercase text-sm px-6 py-4 hover:bg-[#eab308] hover:text-[#09090b] transition-colors border border-[#27272a] hover:border-[#eab308]">
              RETURN TO SOUNDBOARD
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* OPTICAL SCANNER */}
        <div className="bg-[#18181b] brutal-border flex flex-col">
          <div className="p-6 border-b border-[#27272a] bg-[#09090b]">
            <h2 className="text-2xl font-display-custom font-bold text-[#fafafa] uppercase">OPTICAL SCANNER</h2>
            <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase mt-1 tracking-widest">AWAITING QR_CODE DATA...</p>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 pointer-events-none"></div>
            
            <div className="w-full bg-[#09090b] border-4 border-[#27272a] p-4 relative z-20" id="reader-container">
              <div id="reader" className="w-full"></div>
            </div>

            <style>{`
              #reader { border: none !important; }
              #reader button { background: #eab308; color: #09090b; padding: 12px 24px; border: none; font-family: 'Space Mono', monospace; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: all 0.2s; margin-top: 10px; width: 100%; }
              #reader button:hover { background: #fafafa; }
              #reader select { background: #18181b; color: #fafafa; padding: 12px; border: 1px solid #27272a; font-family: 'Space Mono', monospace; margin-bottom: 10px; width: 100%; outline: none; }
              #reader a { display: none !important; }
              #reader__dashboard_section_csr span { color: #a1a1aa; font-family: 'Space Mono', monospace; font-size: 12px; text-transform: uppercase; }
              #reader__scan_region { border: 2px dashed #eab308 !important; }
            `}</style>
          </div>
        </div>

        {/* MANUAL OVERRIDE & LAST SCAN */}
        <div className="space-y-8 flex flex-col">
          
          <div className="bg-[#18181b] brutal-border">
            <div className="p-6 border-b border-[#27272a] bg-[#09090b]">
              <h2 className="text-2xl font-display-custom font-bold text-[#fafafa] uppercase">MANUAL OVERRIDE</h2>
              <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase mt-1 tracking-widest">INPUT BOOKING REF KEY</p>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleCheckIn(manualRef); }} className="flex flex-col sm:flex-row gap-4">
                <input 
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  placeholder="REF_ID (e.g. clk123...)"
                  className="flex-1 bg-[#09090b] border border-[#27272a] px-4 py-4 text-[#fafafa] font-mono-custom font-bold text-sm focus:outline-none focus:border-[#eab308] uppercase"
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-8 py-4 hover:bg-[#fafafa] transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : 'VERIFY'}
                </button>
              </form>
            </div>
          </div>

          {lastScan && (
            <div className={`bg-[#18181b] brutal-border flex-1 flex flex-col ${lastScan.success ? 'border-[#10b981]' : 'border-[#ef4444]'}`}>
               <div className={`p-6 border-b bg-[#09090b] ${lastScan.success ? 'border-[#10b981]' : 'border-[#ef4444]'}`}>
                <h2 className={`text-2xl font-display-custom font-bold uppercase ${lastScan.success ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  LATEST LOG
                </h2>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                <div className={`text-7xl font-display-custom font-bold mb-4 uppercase leading-none ${lastScan.success ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {lastScan.success ? 'GRANTED' : 'DENIED'}
                </div>
                
                <div className="w-full border-t-2 border-dashed border-[#27272a] pt-6 mt-2 mb-6">
                  {lastScan.success ? (
                    <>
                      <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase tracking-widest mb-1">TARGET_ENTITY:</p>
                      <p className="font-mono-custom text-xl text-[#fafafa] font-bold uppercase mb-4">{lastScan.attendee}</p>
                    </>
                  ) : null}
                  <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase tracking-widest mb-1">SYS.RESPONSE:</p>
                  <p className="font-mono-custom text-sm text-[#fafafa] uppercase">{lastScan.message}</p>
                  
                  <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase tracking-widest mt-4 mb-1">SCANNED_REF:</p>
                  <p className="font-mono-custom text-xs text-[#fafafa]">{lastScan.ref}</p>
                </div>
              </div>
            </div>
          )}
          
          {!lastScan && (
             <div className="bg-[#18181b] brutal-border flex-1 flex flex-col opacity-50">
               <div className="p-6 border-b border-[#27272a] bg-[#09090b]">
                 <h2 className="text-2xl font-display-custom font-bold text-[#fafafa] uppercase">LATEST LOG</h2>
               </div>
               <div className="p-8 flex-1 flex items-center justify-center text-center">
                 <p className="font-mono-custom text-sm text-[#a1a1aa] uppercase tracking-widest animate-pulse">STANDBY...</p>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
