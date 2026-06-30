import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { GoogleLogin } from '@react-oauth/google';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      setAuth(res.data.user, res.data.token);
      toast.success('GOOGLE AUTH GRANTED');
      routeUser(res.data.user.role);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'GOOGLE_AUTH_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const routeUser = (role: string) => {
    if (role === 'ORGANIZER') navigate('/dashboard/organizer');
    else if (role === 'ADMIN') navigate('/dashboard/admin');
    else navigate('/dashboard/attendee');
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', data);
      
      if (res.data.requiresOtp) {
        setTempToken(res.data.tempToken);
        toast.success('OTP SENT TO EMAIL');
      } else {
        setAuth(res.data.user, res.data.token);
        toast.success('ACCESS GRANTED');
        routeUser(res.data.user.role);
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/login-verify', { tempToken, otp });
      setAuth(res.data.user, res.data.token);
      toast.success('ACCESS GRANTED');
      routeUser(res.data.user.role);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'OTP VERIFICATION FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative mt-24 mb-16">
      <div className="bg-[#18181b] p-8 md:p-12 brutal-border relative z-10 ticket-mask-both">
        <div className="mb-10 border-b-2 border-[#27272a] pb-4">
          <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2">
            Welcome Back
          </span>
          <h1 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight">
            Sign In
          </h1>
          <p className="font-mono-custom text-xs text-[#a1a1aa] uppercase mt-2">
            Sign in to access your dashboard and manage your events.
          </p>
        </div>

        {tempToken ? (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono-custom text-xs font-bold text-[#fafafa] uppercase tracking-widest">
                ENTER 6-DIGIT OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full bg-[#27272a] border border-[#3f3f46] text-[#fafafa] font-mono-custom p-4 focus:outline-none focus:border-[#eab308] transition-colors"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase py-4 hover:bg-[#facc15] transition-colors disabled:opacity-50"
            >
              {loading ? 'VERIFYING...' : 'VERIFY & ENTER'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono-custom text-xs font-bold text-[#fafafa] uppercase tracking-widest">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-[#27272a] border border-[#3f3f46] text-[#fafafa] font-mono-custom p-4 focus:outline-none focus:border-[#eab308] transition-colors"
                placeholder="name@example.com"
              />
              {errors.email && <p className="text-[#ef4444] text-xs font-mono-custom uppercase">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="font-mono-custom text-xs font-bold text-[#fafafa] uppercase tracking-widest">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full bg-[#27272a] border border-[#3f3f46] text-[#fafafa] font-mono-custom p-4 focus:outline-none focus:border-[#eab308] transition-colors"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-[#ef4444] text-xs font-mono-custom uppercase">{errors.password.message}</p>}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link to="/forgot-password" className="text-xs font-mono-custom text-[#a1a1aa] hover:text-[#fafafa] uppercase transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase py-4 hover:bg-[#facc15] transition-colors disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
            
            <div className="flex items-center justify-center my-4">
              <span className="text-[#a1a1aa] text-xs font-mono-custom uppercase">OR CONTINUE WITH</span>
            </div>
            
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error('GOOGLE_LOGIN_FAILED')}
                theme="filled_black"
              />
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#27272a] text-center">
          <p className="font-mono-custom text-xs text-[#a1a1aa] uppercase">
            Don't have an account? <br/>
            <Link to="/register" className="text-[#eab308] hover:text-[#fafafa] hover:underline transition-colors mt-2 inline-block">
              SIGN UP HERE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
