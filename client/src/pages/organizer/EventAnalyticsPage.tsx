import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const mockDailyData = [
  { name: 'Mon', regs: 10 },
  { name: 'Tue', regs: 15 },
  { name: 'Wed', regs: 8 },
  { name: 'Thu', regs: 25 },
  { name: 'Fri', regs: 40 },
  { name: 'Sat', regs: 55 },
  { name: 'Sun', regs: 30 },
];

export default function EventAnalyticsPage() {
  const { id } = useParams();

  return (
    <div className="relative z-10 max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#27272a] pb-6 gap-6">
        <div>
          <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2">
            // MANIFEST_ID: {id}
          </span>
          <h1 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight">
            MANIFEST TELEMETRY
          </h1>
        </div>
        <Link to="/dashboard/organizer">
          <button className="bg-[#27272a] text-[#fafafa] font-mono-custom font-bold uppercase text-sm px-6 py-4 hover:bg-[#eab308] hover:text-[#09090b] transition-colors border border-[#27272a] hover:border-[#eab308]">
            RETURN TO SOUNDBOARD
          </button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#27272a] border border-[#27272a]">
        <div className="bg-[#18181b] p-8">
          <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">TOTAL_REGS</div>
          <div className="text-5xl font-display-custom font-bold text-[#fafafa]">183 <span className="text-2xl text-[#a1a1aa]">/ 200</span></div>
          <div className="w-full bg-[#09090b] h-1 mt-4">
            <div className="bg-[#eab308] h-full" style={{ width: '91.5%' }}></div>
          </div>
        </div>
        <div className="bg-[#18181b] p-8 border-t md:border-t-0 md:border-l border-[#eab308]">
          <div className="font-mono-custom text-[10px] text-[#eab308] mb-2 font-bold uppercase tracking-widest">GROSS_REVENUE</div>
          <div className="text-5xl font-display-custom font-bold text-[#eab308]">PKR 9.1K</div>
        </div>
        <div className="bg-[#18181b] p-8 border-t md:border-t-0 md:border-l border-[#10b981]">
          <div className="font-mono-custom text-[10px] text-[#10b981] mb-2 font-bold uppercase tracking-widest">CHECK_IN_RATE</div>
          <div className="text-5xl font-display-custom font-bold text-[#10b981]">45%</div>
        </div>
        <div className="bg-[#18181b] p-8">
          <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">REMAINING_INVENTORY</div>
          <div className="text-5xl font-display-custom font-bold text-[#fafafa]">17</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#18181b] brutal-border p-6 h-96 flex flex-col">
          <h3 className="text-2xl font-display-custom font-bold text-[#fafafa] uppercase mb-6 border-b border-[#27272a] pb-2">REGISTRATION VELOCITY</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockDailyData}>
                <defs>
                  <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fafafa" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#fafafa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#a1a1aa" tick={{fontFamily: 'Space Mono', fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" tick={{fontFamily: 'Space Mono', fontSize: 10}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontFamily: 'Space Mono', fontSize: '12px', color: '#fafafa' }} itemStyle={{ color: '#fafafa' }} />
                <Area type="monotone" dataKey="regs" stroke="#fafafa" strokeWidth={2} fillOpacity={1} fill="url(#colorRegs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#18181b] brutal-border p-6 h-96 flex flex-col">
          <h3 className="text-2xl font-display-custom font-bold text-[#fafafa] uppercase mb-6 border-b border-[#27272a] pb-2">WEEKLY DISTRIBUTION</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDailyData}>
                <XAxis dataKey="name" stroke="#a1a1aa" tick={{fontFamily: 'Space Mono', fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" tick={{fontFamily: 'Space Mono', fontSize: 10}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontFamily: 'Space Mono', fontSize: '12px', color: '#fafafa' }} itemStyle={{ color: '#eab308' }} />
                <Bar dataKey="regs" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
