import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.token);
      toast.success('ACCESS GRANTED');
      
      if (res.data.user.role === 'ORGANIZER') {
        navigate('/dashboard/organizer');
      } else if (res.data.user.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/attendee');
      }
    } catch (err: any) {
      if (err.response?.data?.error === 'Please verify your account first') {
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(err.response?.data?.error || 'AUTHORIZATION FAILED');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative mt-24 mb-16">
      <div className="bg-[#18181b] p-8 md:p-12 brutal-border relative z-10 ticket-mask-both">
        <div className="mb-10 border-b-2 border-[#27272a] pb-4">
          <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2">
            // SEC:AUTH
          </span>
          <h1 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight">
            SYSTEM LOGIN
          </h1>
          <p className="font-mono-custom text-xs text-[#a1a1aa] uppercase mt-2">
            ENTER CREDENTIALS TO ACCESS EVENTSPHERE_NODE.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="group">
            <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
              USER_IDENTIFIER (EMAIL)
            </label>
            <input 
              {...register('email')}
              type="email"
              className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors"
              placeholder="operator@domain.com"
            />
            {errors.email && <p className="text-[#ef4444] font-mono-custom text-[10px] uppercase mt-2">{errors.email.message}</p>}
          </div>

          <div className="group">
            <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
              SECURITY_KEY (PASSWORD)
            </label>
            <input 
              {...register('password')}
              type="password"
              className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-[#ef4444] font-mono-custom text-[10px] uppercase mt-2">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-8 bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-4 py-4 hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? 'AUTHENTICATING...' : 'AUTHORIZE ACCESS'}
            {!loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#27272a] text-center">
          <p className="font-mono-custom text-xs text-[#a1a1aa] uppercase">
            UNAUTHORIZED PERSONNEL? <br/>
            <Link to="/register" className="text-[#eab308] hover:text-[#fafafa] hover:underline transition-colors mt-2 inline-block">
              REQUEST SYSTEM ACCESS
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
