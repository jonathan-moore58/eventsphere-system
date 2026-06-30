import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('SYS.ERR // INVALID OR MISSING TOKEN');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('SYS.ERR // PASSWORDS DO NOT MATCH');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/auth/reset-password', { token, newPassword });
      toast.success(res.data.message || 'PASSWORD RESET SUCCESSFUL');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'SYS.ERR // RESET FAILED');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-[#ef4444] font-mono-custom font-bold uppercase">
        SYS.ERR // NO RECOVERY TOKEN DETECTED IN URL
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-[#18181b] brutal-border p-8 md:p-10 relative">
        <div className="absolute top-0 right-0 bg-[#eab308] text-[#09090b] font-mono-custom text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
          SYS:RECOVERY
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-display-custom font-bold text-[#fafafa] uppercase tracking-tight mb-2">
            SET NEW PASSWORD
          </h2>
          <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase tracking-widest leading-relaxed">
            ENTER YOUR NEW CREDENTIALS BELOW.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block font-mono-custom text-[10px] font-bold text-[#a1a1aa] uppercase mb-1 group-focus-within:text-[#eab308] transition-colors">
              NEW_PASSWORD
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors"
              placeholder="ENTER NEW PASSWORD"
            />
          </div>
          
          <div className="group">
            <label className="block font-mono-custom text-[10px] font-bold text-[#a1a1aa] uppercase mb-1 group-focus-within:text-[#eab308] transition-colors">
              CONFIRM_PASSWORD
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors"
              placeholder="CONFIRM NEW PASSWORD"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-4 py-4 hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[#fafafa]"
          >
            {loading ? 'PROCESSING...' : 'UPDATE CREDENTIALS'}
          </button>
        </form>
      </div>
    </div>
  );
}
