import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function OTPVerifyPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/verify-otp', { email, otp });
      setAuth(res.data.user, res.data.token);
      toast.success('CLEARANCE VERIFIED.');
      
      if (res.data.user.role === 'ORGANIZER') {
        navigate('/dashboard/organizer');
      } else if (res.data.user.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/attendee');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'VERIFICATION FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative mt-24 mb-16">
      <div className="bg-[#18181b] p-8 md:p-12 brutal-border relative z-10 ticket-mask-both">
        <div className="mb-10 border-b-2 border-[#27272a] pb-4">
          <span className="font-mono-custom text-xs font-bold text-[#ef4444] tracking-widest uppercase block mb-2 animate-pulse">
            // SEC:VERIFY_PENDING
          </span>
          <h1 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight">
            AUTHENTICATE
          </h1>
          <p className="font-mono-custom text-xs text-[#a1a1aa] uppercase mt-2">
            ENTER THE 6-DIGIT CODE SENT TO {email}
          </p>
        </div>

        <div className="mb-6 p-4 border border-[#eab308] bg-[#eab308]/10">
          <p className="font-mono-custom text-xs text-[#eab308] font-bold uppercase">
            SYS.DEBUG_MODE: <br/> USE OVERRIDE CODE <span className="text-[#fafafa] bg-[#09090b] px-2 py-1 ml-1 tracking-widest">123456</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
              ONE_TIME_PASSCODE (OTP)
            </label>
            <input 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              maxLength={6}
              className="w-full bg-[#09090b] border border-[#27272a] px-4 py-4 text-center text-4xl tracking-[1em] text-[#fafafa] font-mono-custom font-bold focus:outline-none focus:border-[#eab308] transition-colors uppercase"
              placeholder="000000"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || otp.length !== 6}
            className="w-full mt-8 bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-4 py-4 hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
            {!loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#27272a] text-center">
          <p className="font-mono-custom text-xs text-[#a1a1aa] uppercase">
            DID NOT RECEIVE CODE? <br/>
            <button className="text-[#eab308] hover:text-[#fafafa] hover:underline transition-colors mt-2 inline-block">
              RESEND OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
