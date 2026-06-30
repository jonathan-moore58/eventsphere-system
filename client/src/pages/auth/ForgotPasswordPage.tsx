import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'Check server console for reset link (demo mode)');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'SYS.ERR // RECOVERY FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-[#18181b] brutal-border p-8 md:p-10 relative">
        <div className="absolute top-0 right-0 bg-[#eab308] text-[#09090b] font-mono-custom text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
          Account Recovery
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-display-custom font-bold text-[#fafafa] uppercase tracking-tight mb-2">
            FORGOT PASSWORD
          </h2>
          <p className="font-mono-custom text-[10px] text-[#a1a1aa] uppercase tracking-widest leading-relaxed">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block font-mono-custom text-[10px] font-bold text-[#a1a1aa] uppercase mb-1 group-focus-within:text-[#eab308] transition-colors">
              EMAIL_ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors"
              placeholder="ENTER EMAIL"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-4 py-4 hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[#fafafa]"
          >
            {loading ? 'SENDING...' : 'SEND RESET LINK'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#27272a] text-center">
          <Link to="/login" className="font-mono-custom text-xs text-[#a1a1aa] hover:text-[#eab308] uppercase tracking-widest transition-colors border-b border-transparent hover:border-[#eab308]">
            BACK TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
}
