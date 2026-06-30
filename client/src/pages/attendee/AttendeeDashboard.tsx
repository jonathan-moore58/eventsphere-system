import React, { useState } from 'react';
import { useMyBookings } from '../../hooks/useBookings';
import { format, isFuture } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

export default function AttendeeDashboard() {
  const { data: bookings, isLoading, refetch } = useMyBookings();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setCancellingId(id);
      await api.post(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled successfully');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'SYS.ERR // CANCEL FAILED');
    } finally {
      setCancellingId(null);
    }
  };

  const handleExtractPass = (booking: any) => {
    try {
      toast.loading('GENERATING_PASS_DATA...', { id: 'pdf' });
      const doc = new jsPDF();
      
      // Black background
      doc.setFillColor(9, 9, 11); // #09090b
      doc.rect(0, 0, 210, 297, 'F');
      
      // Yellow accent line
      doc.setFillColor(234, 179, 8); // #eab308
      doc.rect(20, 20, 2, 100, 'F');

      // System Header
      doc.setTextColor(234, 179, 8);
      doc.setFontSize(10);
      doc.setFont('courier', 'bold');
      doc.text('// SYS:OFFICIAL_PASS', 25, 25);

      // Event Title
      doc.setTextColor(250, 250, 250); // #fafafa
      doc.setFontSize(24);
      doc.text(booking.event.title.toUpperCase(), 25, 40);
      
      // Details
      doc.setFontSize(12);
      doc.setTextColor(161, 161, 170); // #a1a1aa
      doc.text(`REFERENCE_ID : ${booking.id}`, 25, 55);
      doc.text(`TICKET_TYPE  : ${booking.items[0]?.ticketType.name || 'STANDARD'}`, 25, 65);
      doc.text(`TOTAL_PAID   : $${booking.totalAmount.toFixed(2)}`, 25, 75);
      doc.text(`DATE_TIME    : ${format(new Date(booking.event.startTime), 'yyyy-MM-dd HH:mm')}`, 25, 85);

      // Footer
      doc.setTextColor(250, 250, 250);
      doc.text('PRESENT THIS DIGITAL RECORD AT ENTRY POINT.', 25, 115);

      doc.save(`EventSphere_Pass_${booking.id}.pdf`);
      toast.success('PASS_EXTRACTED', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('EXTRACTION_FAILED', { id: 'pdf' });
    }
  };

  const totalBookings = bookings?.length || 0;
  const upcomingBookings = bookings?.filter(b => isFuture(new Date(b.event!.startTime))) || [];
  const totalSpent = bookings?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0;

  return (
    <div className="relative z-10 max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#27272a] pb-6 gap-6">
        <div>
          <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2">
            // SYS:ATTENDEE_PORTAL
          </span>
          <h1 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight">
            PERSONAL MANIFEST
          </h1>
        </div>
        <Link to="/events">
          <button className="bg-[#27272a] text-[#fafafa] font-mono-custom font-bold uppercase text-sm px-6 py-4 hover:bg-[#eab308] hover:text-[#09090b] transition-colors border border-[#27272a] hover:border-[#eab308]">
            BROWSE DIRECTORY
          </button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#27272a] border border-[#27272a]">
        {isLoading ? (
          <div className="md:col-span-4 bg-[#18181b] p-8 text-center font-mono-custom text-[#eab308] text-sm animate-pulse">
            LOADING_ATTENDEE_DATA...
          </div>
        ) : (
          <>
            <div className="bg-[#18181b] p-8">
              <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">TOTAL_PASSES</div>
              <div className="text-5xl font-display-custom font-bold text-[#fafafa]">{totalBookings}</div>
            </div>
            <div className="bg-[#18181b] p-8 border-t md:border-t-0 md:border-l border-[#eab308]">
              <div className="font-mono-custom text-[10px] text-[#eab308] mb-2 font-bold uppercase tracking-widest">UPCOMING_EVENTS</div>
              <div className="text-5xl font-display-custom font-bold text-[#eab308]">{upcomingBookings.length}</div>
            </div>
            <div className="bg-[#18181b] p-8">
              <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">EVENTS_ATTENDED</div>
              <div className="text-5xl font-display-custom font-bold text-[#fafafa]">{totalBookings - upcomingBookings.length}</div>
            </div>
            <div className="bg-[#18181b] p-8">
              <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">TOTAL_EXPENDITURE</div>
              <div className="text-5xl font-display-custom font-bold text-[#fafafa]">PKR {totalSpent.toFixed(2)}</div>
            </div>
          </>
        )}
      </div>

      {/* Bookings Table */}
      <div className="bg-[#18181b] brutal-border">
        <div className="p-6 border-b border-[#27272a]">
          <h2 className="text-3xl font-display-custom font-bold text-[#fafafa] uppercase tracking-tight">PASS REGISTRY</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#fafafa] font-mono-custom">
            <thead className="text-[10px] uppercase bg-[#09090b] text-[#a1a1aa] border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">MANIFEST_TITLE</th>
                <th className="px-6 py-4 font-bold tracking-widest">T_ZERO</th>
                <th className="px-6 py-4 font-bold tracking-widest">VALUE</th>
                <th className="px-6 py-4 font-bold tracking-widest">SYS.STATUS</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {bookings?.map(booking => (
                <tr key={booking.id} className="hover:bg-[#27272a] transition-colors group">
                  <td className="px-6 py-5 font-bold uppercase">{booking.event?.title}</td>
                  <td className="px-6 py-5 text-xs text-[#a1a1aa]">{format(new Date(booking.event!.startTime), 'dd.MM.yyyy')}</td>
                  <td className="px-6 py-5 text-xs">PKR {booking.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 text-[10px] font-bold tracking-widest border ${
                      booking.status === 'CONFIRMED' 
                        ? 'border-[#10b981] text-[#10b981] bg-[#10b981]/10' 
                        : 'border-[#eab308] text-[#eab308] bg-[#eab308]/10'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right flex justify-end gap-4 items-center">
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <button onClick={() => handleExtractPass(booking)} className="text-[#eab308] hover:text-[#fafafa] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#fafafa]">
                          EXTRACT_PASS
                        </button>
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="text-[#ef4444] hover:text-[#fafafa] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#fafafa] disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? 'CANCELLING...' : 'CANCEL'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {bookings?.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#a1a1aa] text-xs tracking-widest uppercase">
                    NO_PASSES_FOUND_IN_REGISTRY.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
