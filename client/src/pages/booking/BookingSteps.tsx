import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useEventDetail } from '../../hooks/useEvents';

export default function BookingSteps() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: event, isLoading } = useEventDetail(eventId!);

  const selectedTickets: Record<string, number> = location.state?.selectedTickets || {};
  
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (Object.keys(selectedTickets).length === 0 && step === 1) {
      toast.error('NO_TICKETS_SELECTED');
      navigate(`/events/${eventId}`);
    }
  }, []);

  useEffect(() => {
    if (step === 1 && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (step === 1 && timeLeft === 0) {
      toast.error('SESSION_TIMEOUT. HOLD_RELEASED.');
      navigate(`/events/${eventId}`);
    }
  }, [step, timeLeft, eventId, navigate]);

  const handleCreateBooking = async () => {
    try {
      setIsProcessing(true);
      const items = Object.entries(selectedTickets)
        .filter(([_, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));
        
      const res = await api.post('/bookings', { eventId, items });
      setBookingId(res.data.id);
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'FAILED_TO_INITIALIZE_TRANSACTION');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const res = await api.post(`/bookings/${bookingId}/confirm`, {
        cardDetails: { mock: true }
      });
      setQrCode(res.data.booking.qrCode);
      toast.success('TRANSACTION_AUTHORIZED');
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'TRANSACTION_REJECTED');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !event) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="font-mono-custom text-[#eab308] text-sm font-bold uppercase animate-pulse">
        CONNECTING_TO_TERMINAL...
      </div>
    </div>
  );

  const totalPrice = event.ticketTypes?.reduce((total, t) => total + (selectedTickets[t.id] || 0) * t.price, 0) || 0;
  const totalSelected = Object.values(selectedTickets).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);

  return (
    <div className="min-h-screen bg-[#09090b] p-4 md:p-8 pt-24 pb-32 flex justify-center items-start text-[#fafafa] font-body-custom">
      <div className="w-full max-w-4xl relative">
        
        {/* Header Terminal Info */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#27272a] pb-4 gap-4">
          <div>
            <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2">
              // POS:TERMINAL_01
            </span>
            <h1 className="text-4xl md:text-5xl font-display-custom uppercase tracking-tight">SECURE CHECKOUT</h1>
          </div>
          <div className="font-mono-custom text-xs text-[#a1a1aa] uppercase text-left md:text-right">
            STATUS: <span className="text-[#fafafa] font-bold">ACTIVE</span> <br/>
            STEP: <span className="text-[#fafafa] font-bold">0{step}/03</span>
          </div>
        </div>

        {/* ------------------------------------------
            STEP 1: CONFIRMATION
        ------------------------------------------ */}
        {step === 1 && (
          <div className="bg-[#18181b] brutal-border p-6 md:p-10 relative">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 border-b border-[#27272a] pb-4">
              <h2 className="text-3xl font-display-custom uppercase">ORDER MANIFEST</h2>
              
              {/* 10 MINUTE HOLD TIMER */}
              <div className="bg-[#ef4444]/10 border border-[#ef4444] px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></div>
                <div className="font-mono-custom text-sm font-bold text-[#ef4444] tracking-widest">
                  HOLD_EXPIRING: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-10 font-mono-custom">
              {/* Table Header */}
              <div className="flex justify-between text-xs text-[#a1a1aa] uppercase border-b border-[#27272a] pb-2 mb-4">
                <span className="w-16">QTY</span>
                <span className="flex-1">DESCRIPTION</span>
                <span className="text-right">AMOUNT</span>
              </div>

              {event.ticketTypes?.map(t => {
                const qty = selectedTickets[t.id] || 0;
                if (qty === 0) return null;
                return (
                  <div key={t.id} className="flex justify-between items-center text-sm text-[#fafafa] bg-[#09090b] p-3 border-l-2 border-[#eab308]">
                    <span className="w-16 font-bold">{String(qty).padStart(2, '0')}</span>
                    <span className="flex-1 uppercase">{t.name}</span>
                    <span className="text-right">PKR {(qty * t.price).toFixed(2)}</span>
                  </div>
                );
              })}
              
              <div className="flex justify-between text-xl font-bold text-[#fafafa] border-t-2 border-dashed border-[#27272a] pt-6 mt-6">
                <span>TOTAL_DUE</span>
                <span className="text-[#eab308]">PKR {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end border-t border-[#27272a] pt-6">
              <Link to={`/events/${eventId}`} className="w-full sm:w-auto">
                <button className="w-full border border-[#27272a] bg-[#09090b] text-[#fafafa] font-mono-custom font-bold uppercase text-sm px-6 py-4 hover:border-[#fafafa] transition-colors">
                  CANCEL_HOLD
                </button>
              </Link>
              <button 
                onClick={handleCreateBooking} 
                disabled={isProcessing}
                className="w-full sm:w-auto bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-8 py-4 hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'PROCESSING...' : 'CONFIRM MANIFEST'}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------
            STEP 2: PAYMENT
        ------------------------------------------ */}
        {step === 2 && (
          <div className="bg-[#18181b] brutal-border p-6 md:p-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-display-custom uppercase mb-8 border-b border-[#27272a] pb-4">PAYMENT TERMINAL</h2>
            
            <div className="bg-[#eab308]/10 border border-[#eab308] p-4 mb-8">
              <p className="font-mono-custom text-xs text-[#eab308] font-bold uppercase mb-1">SYS.DEBUG_MODE // MOCK GATEWAY</p>
              <p className="font-mono-custom text-sm text-[#fafafa] tracking-widest">USE DEMO CREDENTIALS: 4242 4242 4242 4242</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
              {['CARD', 'JAZZCASH', 'BANK_TRANSFER'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`font-mono-custom text-xs font-bold px-2 py-3 uppercase transition-colors border ${
                    paymentMethod === method 
                      ? 'bg-[#eab308] text-[#09090b] border-[#eab308]' 
                      : 'bg-[#09090b] text-[#a1a1aa] border-[#27272a] hover:text-[#fafafa] hover:border-[#a1a1aa]'
                  }`}
                >
                  {method.replace('_', ' ')}
                </button>
              ))}
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              {paymentMethod === 'CARD' && (
                <div className="space-y-4">
                  <div className="group">
                    <label className="block font-mono-custom text-[10px] font-bold text-[#a1a1aa] uppercase mb-1">CARD_NUMBER</label>
                    <input className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" placeholder="XXXX XXXX XXXX XXXX" defaultValue="4242 4242 4242 4242" required />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2 group">
                      <label className="block font-mono-custom text-[10px] font-bold text-[#a1a1aa] uppercase mb-1">EXPIRY (MM/YY)</label>
                      <input className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" placeholder="MM/YY" defaultValue="12/26" required />
                    </div>
                    <div className="w-1/2 group">
                      <label className="block font-mono-custom text-[10px] font-bold text-[#a1a1aa] uppercase mb-1">SECURITY_CODE (CVC)</label>
                      <input className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" placeholder="123" defaultValue="123" required />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block font-mono-custom text-[10px] font-bold text-[#a1a1aa] uppercase mb-1">CARDHOLDER_NAME</label>
                    <input className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" placeholder="NAME ON CARD" defaultValue="DEMO USER" required />
                  </div>
                </div>
              )}
              
              {paymentMethod === 'JAZZCASH' && (
                <div className="group">
                  <label className="block font-mono-custom text-[10px] font-bold text-[#a1a1aa] uppercase mb-1">MOBILE_NUMBER</label>
                  <input className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" placeholder="03XX XXXXXXX" defaultValue="03001234567" required />
                </div>
              )}

              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="group">
                  <label className="block font-mono-custom text-[10px] font-bold text-[#a1a1aa] uppercase mb-1">IBAN_NUMBER</label>
                  <input className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" placeholder="PKXX XXXX XXXXXXXXXXXXXXXXXXXXXX" defaultValue="PK00DEMO1234567890" required />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full mt-8 bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-4 py-5 hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isProcessing ? 'AUTHORIZING...' : `AUTHORIZE PKR ${totalPrice.toFixed(2)}`}
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------
            STEP 3: TICKET ISSUED
        ------------------------------------------ */}
        {step === 3 && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <div className="inline-block bg-[#10b981]/20 border border-[#10b981] text-[#10b981] font-mono-custom font-bold px-4 py-2 mb-4 tracking-widest uppercase">
                TRANSACTION_SUCCESS
              </div>
              <h2 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight mb-2">PASS ISSUED</h2>
              <p className="font-mono-custom text-xs text-[#a1a1aa] uppercase">A SECURE COPY HAS BEEN TRANSMITTED TO YOUR INBOX.</p>
            </div>

            {/* PHYSICAL TICKET RENDER */}
            <div className="relative w-full bg-white text-black brutal-border ticket-mask-both">
              <div className="p-8 pb-12 flex flex-col items-center text-center">
                <span className="font-mono-custom text-[10px] font-bold border border-black px-2 py-1 uppercase tracking-widest mb-6">
                  OFFICIAL EVENT PASS
                </span>
                
                <h3 className="text-4xl font-display-custom uppercase leading-none tracking-tight mb-6">
                  {event.title}
                </h3>
                
                {qrCode && (
                  <div className="bg-white p-2 border-4 border-black mb-6">
                    <img src={qrCode} alt="Entry QR Code" className="w-48 h-48" />
                  </div>
                )}
                
                <div className="w-full border-t-2 border-dashed border-black pt-4 flex justify-between items-center text-left">
                  <div>
                    <span className="block font-mono-custom text-[10px] uppercase font-bold text-gray-500">BOOKING_REF</span>
                    <span className="font-mono-custom font-bold text-lg">{bookingId}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono-custom text-[10px] uppercase font-bold text-gray-500">ADMIT</span>
                    <span className="font-mono-custom font-bold text-lg">{totalSelected}</span>
                  </div>
                </div>
              </div>
              
              {/* Barcode Footer */}
              <div className="h-16 w-full barcode-vertical border-t border-black bg-black filter invert"></div>
            </div>

            <div className="mt-12 flex justify-center">
              <Link to="/dashboard/attendee" className="w-full">
                <button className="w-full bg-[#27272a] text-[#fafafa] font-mono-custom font-bold uppercase text-sm px-8 py-4 hover:bg-[#eab308] hover:text-[#09090b] transition-colors border border-[#3f3f46]">
                  ACCESS ATTENDEE DASHBOARD
                </button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
