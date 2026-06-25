import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'CONFERENCE', venue: '',
    startTime: '', endTime: '', capacity: 100
  });

  const [ticketData, setTicketData] = useState({
    name: 'GENERAL ADMISSION', price: 50, qtyTotal: 100, saleStart: '', saleEnd: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Create Event
      const eventRes = await api.post('/events', formData);
      const eventId = eventRes.data.id;

      // Create Ticket Type
      await api.post(`/events/${eventId}/tickets`, {
        ...ticketData,
        saleStart: formData.startTime,
        saleEnd: formData.endTime
      });

      toast.success('MANIFEST PUBLISHED SUCCESSFULLY');
      navigate('/dashboard/organizer');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'SYS.ERR // FAILED TO PUBLISH');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.name === 'category' ? e.target.value.toUpperCase() : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto space-y-12 pb-20">
      <div className="border-b-2 border-[#27272a] pb-6">
        <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2">
          // SYS:MANIFEST_GENERATOR
        </span>
        <h1 className="text-5xl font-display-custom font-bold text-[#fafafa] uppercase leading-none tracking-tight">
          INITIALIZE PRODUCTION MANIFEST
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* SECTION 1: EVENT DETAILS */}
        <div className="bg-[#18181b] brutal-border p-8 md:p-10 relative">
          <div className="absolute top-0 left-0 bg-[#eab308] text-[#09090b] font-mono-custom text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
            SEC:01
          </div>
          <h2 className="text-3xl font-display-custom font-bold text-[#fafafa] uppercase mb-8 mt-2 border-b border-[#27272a] pb-4">
            CORE PARAMETERS
          </h2>
          
          <div className="space-y-6">
            <div className="group">
              <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                MANIFEST_TITLE
              </label>
              <input required name="title" onChange={handleChange} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" placeholder="ENTER EVENT TITLE" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                  SYS.CATEGORY
                </label>
                <select name="category" onChange={handleChange} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors uppercase">
                  <option value="CONFERENCE">CONFERENCE</option>
                  <option value="CONCERT">CONCERT</option>
                  <option value="WORKSHOP">WORKSHOP</option>
                  <option value="SPORTS">SPORTS</option>
                  <option value="FESTIVAL">FESTIVAL</option>
                </select>
              </div>
              <div className="group">
                <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                  MAX_CAPACITY
                </label>
                <input required type="number" name="capacity" onChange={handleChange} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" placeholder="100" />
              </div>
            </div>
            
            <div className="group">
              <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                MISSION_BRIEF (DESCRIPTION)
              </label>
              <textarea required name="description" onChange={handleChange} rows={4} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" placeholder="ENTER EVENT DETAILS..."></textarea>
            </div>
          </div>
        </div>

        {/* SECTION 2: DATE & VENUE */}
        <div className="bg-[#18181b] brutal-border p-8 md:p-10 relative">
          <div className="absolute top-0 left-0 bg-[#eab308] text-[#09090b] font-mono-custom text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
            SEC:02
          </div>
          <h2 className="text-3xl font-display-custom font-bold text-[#fafafa] uppercase mb-8 mt-2 border-b border-[#27272a] pb-4">
            LOGISTICS DATA
          </h2>
          
          <div className="space-y-6">
            <div className="group">
              <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                LOC_DATA (VENUE)
              </label>
              <input required name="venue" onChange={handleChange} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors uppercase" placeholder="ENTER VENUE ADDRESS" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                  T_ZERO (START TIME)
                </label>
                <input required type="datetime-local" name="startTime" onChange={handleChange} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" />
              </div>
              <div className="group">
                <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                  T_END (END TIME)
                </label>
                <input required type="datetime-local" name="endTime" onChange={handleChange} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TICKET CONFIGURATION */}
        <div className="bg-[#18181b] brutal-border p-8 md:p-10 relative">
          <div className="absolute top-0 left-0 bg-[#eab308] text-[#09090b] font-mono-custom text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
            SEC:03
          </div>
          <h2 className="text-3xl font-display-custom font-bold text-[#fafafa] uppercase mb-8 mt-2 border-b border-[#27272a] pb-4">
            TICKET ALLOCATION
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                TIER_NAME
              </label>
              <input required value={ticketData.name} onChange={e => setTicketData({...ticketData, name: e.target.value.toUpperCase()})} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors uppercase" />
            </div>
            <div className="group">
              <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                ENTRY_FEE (PKR)
              </label>
              <input required type="number" value={ticketData.price} onChange={e => setTicketData({...ticketData, price: Number(e.target.value)})} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" />
            </div>
            <div className="group">
              <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
                ALLOCATION_QTY
              </label>
              <input required type="number" value={ticketData.qtyTotal} onChange={e => setTicketData({...ticketData, qtyTotal: Number(e.target.value)})} className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors" />
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full md:w-auto bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-lg px-12 py-5 hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#eab308]"
          >
            {loading ? 'TRANSMITTING...' : 'PUBLISH MANIFEST'}
          </button>
        </div>
      </form>
    </div>
  );
}
