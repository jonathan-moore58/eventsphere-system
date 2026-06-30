import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import type { Event } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockChartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const mockPieData = [
  { name: 'VIP', value: 400 },
  { name: 'GENERAL', value: 300 },
  { name: 'EARLY BIRD', value: 300 }
];

const COLORS = ['#eab308', '#fafafa', '#27272a']; // Yellow, White, Zinc

export default function OrganizerDashboard() {
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['myEvents'],
    queryFn: async () => {
      const { data } = await api.get<Event[]>('/events/my-events');
      return data;
    }
  });

  const handleClone = async (id: string, title: string) => {
    try {
      await toast.promise(api.post(`/events/${id}/clone`), {
        loading: 'CLONING_MANIFEST...',
        success: 'MANIFEST_DUPLICATED',
        error: 'SYS_ERR_CLONE_FAILED'
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to completely cancel "${title}"? All attendees will be refunded and notified.`)) return;
    try {
      await toast.promise(api.post(`/events/${id}/cancel`), {
        loading: 'PROCESSING_CANCELLATION...',
        success: 'EVENT_CANCELLED',
        error: 'SYS_ERR_CANCEL_FAILED'
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#27272a] pb-6 gap-6">
        <div>
          <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2">
            // SYS:PRODUCER_DASHBOARD
          </span>
          <h1 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight">
            SYSTEM TELEMETRY
          </h1>
        </div>
        <Link to="/dashboard/organizer/create">
          <button className="bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-6 py-4 hover:bg-[#fafafa] transition-colors brutal-border border-[#eab308] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            INITIALIZE NEW MANIFEST
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#27272a] border border-[#27272a]">
        {isLoading ? (
          <div className="md:col-span-4 bg-[#18181b] p-8 text-center font-mono-custom text-[#eab308] text-sm animate-pulse">
            GATHERING_METRICS...
          </div>
        ) : (
          <>
            <div className="bg-[#18181b] p-8">
              <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">TOTAL_RECORDS</div>
              <div className="text-5xl font-display-custom font-bold text-[#fafafa]">{events?.length || 0}</div>
            </div>
            <div className="bg-[#18181b] p-8 border-t md:border-t-0 md:border-l border-[#eab308]">
              <div className="font-mono-custom text-[10px] text-[#eab308] mb-2 font-bold uppercase tracking-widest">LIVE_OPERATIONS</div>
              <div className="text-5xl font-display-custom font-bold text-[#eab308]">{events?.filter(e => e.status === 'PUBLISHED').length || 0}</div>
            </div>
            <div className="bg-[#18181b] p-8">
              <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">GROSS_REVENUE</div>
              <div className="text-5xl font-display-custom font-bold text-[#fafafa]">PKR 12.4K</div>
            </div>
            <div className="bg-[#18181b] p-8">
              <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">TOTAL_ADMISSIONS</div>
              <div className="text-5xl font-display-custom font-bold text-[#fafafa]">842</div>
            </div>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#18181b] brutal-border p-6 h-96 flex flex-col">
          <h3 className="text-2xl font-display-custom font-bold text-[#fafafa] uppercase mb-6 border-b border-[#27272a] pb-2">TRANSACTION VELOCITY</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#a1a1aa" tick={{fontFamily: 'Space Mono', fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" tick={{fontFamily: 'Space Mono', fontSize: 10}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontFamily: 'Space Mono', fontSize: '12px', color: '#fafafa' }} itemStyle={{ color: '#eab308' }} />
                <Area type="monotone" dataKey="revenue" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#18181b] brutal-border p-6 h-96 flex flex-col">
          <h3 className="text-2xl font-display-custom font-bold text-[#fafafa] uppercase mb-6 border-b border-[#27272a] pb-2">TIER DISTRIBUTION</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={2} dataKey="value" stroke="none">
                  {mockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontFamily: 'Space Mono', fontSize: '12px', color: '#fafafa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#18181b] brutal-border">
        <div className="p-6 border-b border-[#27272a]">
          <h2 className="text-3xl font-display-custom font-bold text-[#fafafa] uppercase tracking-tight">ACTIVE MANIFESTS</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#fafafa] font-mono-custom">
            <thead className="text-[10px] uppercase bg-[#09090b] text-[#a1a1aa] border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">MANIFEST_TITLE</th>
                <th className="px-6 py-4 font-bold tracking-widest">SYS.STATUS</th>
                <th className="px-6 py-4 font-bold tracking-widest">MAX_CAPACITY</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">OPERATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {events?.map(event => (
                <tr key={event.id} className="hover:bg-[#27272a] transition-colors group">
                  <td className="px-6 py-5 font-bold uppercase">{event.title}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 text-[10px] font-bold tracking-widest border ${
                      event.status === 'PUBLISHED' 
                        ? 'border-[#eab308] text-[#eab308] bg-[#eab308]/10' 
                        : 'border-[#a1a1aa] text-[#a1a1aa] bg-[#27272a]/50'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">{event.capacity}</td>
                  <td className="px-6 py-5 text-right space-x-4 flex justify-end items-center h-full">
                    <Link to={`/dashboard/organizer/events/${event.id}/analytics`} className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#fafafa]">
                      ANALYTICS
                    </Link>
                    <Link to={`/dashboard/organizer/checkin/${event.id}`} className="text-[#eab308] hover:text-[#fafafa] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#fafafa]">
                      CHECK_IN
                    </Link>
                    <button onClick={() => handleClone(event.id, event.title)} className="text-[#a1a1aa] hover:text-[#eab308] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#eab308]">
                      CLONE
                    </button>
                    {event.status !== 'CANCELLED' && (
                      <button onClick={() => handleCancel(event.id, event.title)} className="text-[#ef4444] hover:text-[#fafafa] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#fafafa]">
                        CANCEL
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {events?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-[#a1a1aa] text-xs tracking-widest uppercase">
                    NO_ACTIVE_MANIFESTS_FOUND. INITIATE_NEW_RECORD.
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
