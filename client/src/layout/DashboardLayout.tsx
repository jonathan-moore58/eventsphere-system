import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { DashboardSphere } from '../components/3d/DashboardSphere';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-brand-dark text-slate-400 relative">
      <DashboardSphere />
      <nav className="border-b border-white/10 bg-white/5 p-4 flex justify-between items-center backdrop-blur-[20px] sticky top-0 z-50">
        <div className="text-white font-display font-bold text-xl tracking-tight">EventSphere</div>
        <div className="flex gap-4 items-center">
          <Link to="/dashboard/profile" className="hover:text-white transition-colors">
            <span>{user?.name} ({user?.role})</span>
          </Link>
          <button onClick={logout} className="text-sm text-brand-magenta hover:text-white transition-colors">Logout</button>
        </div>
      </nav>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}
