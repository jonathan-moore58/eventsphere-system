import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
const mockUsers = [
  { id: '1', name: 'ADMIN USER', email: 'ADMIN@EMS.COM', role: 'ADMIN', status: 'ACTIVE' },
  { id: '2', name: 'ORGANIZER PRO', email: 'ORG@EMS.COM', role: 'ORGANIZER', status: 'ACTIVE' },
  { id: '3', name: 'JOHN DOE', email: 'JOHN@EXAMPLE.COM', role: 'ATTENDEE', status: 'ACTIVE' },
  { id: '4', name: 'JANE SPAM', email: 'JANE@SPAM.COM', role: 'ATTENDEE', status: 'SUSPENDED' },
];

export default function AdminDashboard() {
  const { data: pendingEvents, refetch } = useQuery({
    queryKey: ['pendingEvents'],
    queryFn: async () => {
      const { data } = await api.get('/admin/pending-events');
      return data;
    }
  });

  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApprove = async (id: string, title: string) => {
    if (!window.confirm(`APPROVE MANIFEST: ${title}?`)) return;
    try {
      setApprovingId(id);
      await api.post(`/admin/events/${id}/approve`);
      toast.success(`MANIFEST APPROVED: ${title}`);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'SYS.ERR // APPROVAL FAILED');
    } finally {
      setApprovingId(null);
    }
  };

  const { data: telemetry, isLoading: telLoading } = useQuery({
    queryKey: ['telemetry'],
    queryFn: async () => {
      const { data } = await api.get('/admin/telemetry');
      return data;
    }
  });

  const handleExport = (type: string) => {
    if (!telemetry) return;
    toast.success(`GENERATING ${type} REPORT...`);

    if (type === 'CSV') {
      const headers = ['ID', 'Title', 'Organizer', 'Status', 'Capacity', 'Created At'];
      const rows = telemetry.allEvents.map((e: any) => [
        e.id, 
        `"${e.title}"`, 
        `"${e.organizer.user.name}"`, 
        e.status, 
        e.capacity, 
        e.createdAt
      ]);
      const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EventSphere_Dump_${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (type === 'PDF') {
      const doc = new jsPDF();
      doc.setFillColor(9, 9, 11);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(234, 179, 8);
      doc.setFontSize(10);
      doc.setFont('courier', 'bold');
      doc.text('// SYS:GLOBAL_TELEMETRY_REPORT', 20, 20);

      doc.setTextColor(250, 250, 250);
      doc.setFontSize(14);
      doc.text(`TOTAL PLATFORM USERS: ${telemetry.totalUsers}`, 20, 40);
      doc.text(`TOTAL SYSTEM MANIFESTS: ${telemetry.totalEvents}`, 20, 50);
      doc.text(`TOTAL NETWORK REVENUE: $${telemetry.revenue.toFixed(2)}`, 20, 60);

      doc.setFontSize(10);
      doc.setTextColor(161, 161, 170);
      doc.text(`REPORT GENERATED: ${new Date().toISOString()}`, 20, 80);

      doc.save(`EventSphere_Telemetry_${new Date().getTime()}.pdf`);
    }
  };

  const handleAction = (action: string, user: string) => {
    toast.success(`COMMAND '${action}' EXECUTED FOR TARGET '${user}'`);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[#27272a] pb-6 gap-6">
        <div>
          <span className="font-mono-custom text-xs font-bold text-[#ef4444] tracking-widest uppercase block mb-2 animate-pulse">
            // SYS:ADMIN_OVERRIDE
          </span>
          <h1 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight">
            GLOBAL TELEMETRY
          </h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => handleExport('CSV')} className="bg-[#27272a] text-[#fafafa] font-mono-custom font-bold uppercase text-sm px-6 py-4 hover:bg-[#eab308] hover:text-[#09090b] transition-colors border border-[#27272a] hover:border-[#eab308]">
            EXPORT_CSV
          </button>
          <button onClick={() => handleExport('PDF')} className="bg-[#27272a] text-[#fafafa] font-mono-custom font-bold uppercase text-sm px-6 py-4 hover:bg-[#ef4444] hover:text-[#09090b] transition-colors border border-[#27272a] hover:border-[#ef4444]">
            EXPORT_PDF
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#27272a] border border-[#27272a]">
        <div className="bg-[#18181b] p-8">
          <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">TOTAL_IDENTITIES</div>
          <div className="text-5xl font-display-custom font-bold text-[#fafafa]">{telLoading ? '...' : telemetry?.totalUsers}</div>
        </div>
        
        <div className="bg-[#18181b] p-8">
          <div className="font-mono-custom text-[10px] text-[#a1a1aa] mb-2 font-bold uppercase tracking-widest">TOTAL_MANIFESTS</div>
          <div className="text-5xl font-display-custom font-bold text-[#fafafa]">{telLoading ? '...' : telemetry?.totalEvents}</div>
        </div>

        <div className="bg-[#18181b] p-8 border-t md:border-t-0 md:border-l border-[#eab308]">
          <div className="font-mono-custom text-[10px] text-[#eab308] mb-2 font-bold uppercase tracking-widest">GLOBAL_REVENUE</div>
          <div className="text-5xl font-display-custom font-bold text-[#eab308]">${telLoading ? '...' : telemetry?.revenue.toFixed(2)}</div>
        </div>
        <div className="bg-[#18181b] p-8 border-t md:border-t-0 md:border-l border-[#10b981]">
          <div className="font-mono-custom text-[10px] text-[#10b981] mb-2 font-bold uppercase tracking-widest">SYS.UPTIME</div>
          <div className="text-5xl font-display-custom font-bold text-[#10b981]">99.5%</div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-[#18181b] brutal-border">
        <div className="p-6 border-b border-[#27272a]">
          <h2 className="text-3xl font-display-custom font-bold text-[#fafafa] uppercase tracking-tight text-[#eab308] animate-pulse">PENDING MANIFESTS (APPROVAL REQUIRED)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#fafafa] font-mono-custom">
            <thead className="text-[10px] uppercase bg-[#09090b] text-[#a1a1aa] border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">MANIFEST_TITLE</th>
                <th className="px-6 py-4 font-bold tracking-widest">ORGANIZER</th>
                <th className="px-6 py-4 font-bold tracking-widest">START_DATE</th>
                <th className="px-6 py-4 font-bold tracking-widest">SYS.STATUS</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">OVERRIDE_COMMANDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {pendingEvents?.map((event: any) => (
                <tr key={event.id} className="hover:bg-[#27272a] transition-colors group">
                  <td className="px-6 py-5 font-bold text-[#fafafa] uppercase">{event.title}</td>
                  <td className="px-6 py-5 text-xs text-[#a1a1aa] uppercase">{event.organizer?.user?.name || 'UNKNOWN'}</td>
                  <td className="px-6 py-5 text-xs text-[#a1a1aa]">{format(new Date(event.startTime), 'dd.MM.yyyy')}</td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-1 text-[10px] font-bold tracking-widest border border-[#eab308] text-[#eab308] bg-[#eab308]/10">
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right space-x-4">
                    <a 
                      href={`/events/${event.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#a1a1aa] hover:text-[#eab308] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#eab308]"
                    >
                      VIEW
                    </a>
                    <button 
                      onClick={() => handleApprove(event.id, event.title)}
                      disabled={approvingId === event.id}
                      className="text-[#10b981] hover:text-[#fafafa] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#fafafa] disabled:opacity-50"
                    >
                      {approvingId === event.id ? 'APPROVING...' : 'APPROVE'}
                    </button>
                  </td>
                </tr>
              ))}
              {pendingEvents?.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#a1a1aa] text-xs tracking-widest uppercase">
                    SYS.LOG // NO PENDING MANIFESTS.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-[#18181b] brutal-border">
        <div className="p-6 border-b border-[#27272a] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h2 className="text-3xl font-display-custom font-bold text-[#fafafa] uppercase tracking-tight">IDENTITY MANAGEMENT</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <input 
              placeholder="SEARCH_QUERY..." 
              className="bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-xs focus:outline-none focus:border-[#eab308] uppercase" 
            />
            <select className="bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-xs focus:outline-none focus:border-[#eab308] uppercase">
              <option value="ALL">FILTER: ALL_ROLES</option>
              <option value="ADMIN">FILTER: ADMIN</option>
              <option value="ORGANIZER">FILTER: ORGANIZER</option>
              <option value="ATTENDEE">FILTER: ATTENDEE</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#fafafa] font-mono-custom">
            <thead className="text-[10px] uppercase bg-[#09090b] text-[#a1a1aa] border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">TARGET_ID</th>
                <th className="px-6 py-4 font-bold tracking-widest">COMM_CHANNEL</th>
                <th className="px-6 py-4 font-bold tracking-widest">CLEARANCE_LEVEL</th>
                <th className="px-6 py-4 font-bold tracking-widest">SYS.STATUS</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">OVERRIDE_COMMANDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {mockUsers.map(user => (
                <tr key={user.id} className="hover:bg-[#27272a] transition-colors group">
                  <td className="px-6 py-5 font-bold">{user.name}</td>
                  <td className="px-6 py-5 text-xs text-[#a1a1aa]">{user.email}</td>
                  <td className="px-6 py-5">
                    <select
                      defaultValue={user.role}
                      onChange={(e) => handleAction(`UPDATE_CLEARANCE: ${e.target.value}`, user.name)}
                      className="bg-[#09090b] border border-[#27272a] px-2 py-1 text-[#fafafa] font-mono-custom text-[10px] focus:outline-none focus:border-[#eab308] uppercase"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="ORGANIZER">ORGANIZER</option>
                      <option value="ATTENDEE">ATTENDEE</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 text-[10px] font-bold tracking-widest border ${
                      user.status === 'ACTIVE' 
                        ? 'border-[#10b981] text-[#10b981] bg-[#10b981]/10' 
                        : 'border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10 animate-pulse'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right space-x-4">
                    {user.status === 'ACTIVE' ? (
                      <button onClick={() => handleAction('SUSPEND_ACCESS', user.name)} className="text-[#ef4444] hover:text-[#fafafa] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#fafafa]">
                        SUSPEND
                      </button>
                    ) : (
                      <button onClick={() => handleAction('RESTORE_ACCESS', user.name)} className="text-[#10b981] hover:text-[#fafafa] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#fafafa]">
                        RESTORE
                      </button>
                    )}
                    <button onClick={() => handleAction('PURGE_RECORD', user.name)} className="text-[#a1a1aa] hover:text-[#ef4444] transition-colors text-xs uppercase tracking-widest border-b border-transparent hover:border-[#ef4444]">
                      PURGE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
