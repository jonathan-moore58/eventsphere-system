import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ATTENDEE', 'ORGANIZER'])
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'ATTENDEE' }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      await api.post('/auth/register', data);
      toast.success('PERSONNEL REGISTERED. AWAITING VERIFICATION.');
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'REGISTRATION FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative mt-16 mb-16">
      <div className="bg-[#18181b] p-8 md:p-12 brutal-border relative z-10 ticket-mask-both">
        <div className="mb-10 border-b-2 border-[#27272a] pb-4">
          <span className="font-mono-custom text-xs font-bold text-[#eab308] tracking-widest uppercase block mb-2">
            // SEC:ONBOARD
          </span>
          <h1 className="text-5xl font-display-custom text-[#fafafa] uppercase leading-none tracking-tight">
            ISSUE CREDENTIALS
          </h1>
          <p className="font-mono-custom text-xs text-[#a1a1aa] uppercase mt-2">
            REGISTER FOR PLATFORM ACCESS.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="group">
            <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
              PERSONNEL_NAME
            </label>
            <input 
              {...register('name')}
              className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors"
              placeholder="JOHN DOE"
            />
            {errors.name && <p className="text-[#ef4444] font-mono-custom text-[10px] uppercase mt-2">{errors.name.message}</p>}
          </div>

          <div className="group">
            <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-2 group-focus-within:text-[#eab308] transition-colors">
              USER_IDENTIFIER (EMAIL)
            </label>
            <input 
              {...register('email')}
              type="email"
              className="w-full bg-[#09090b] border border-[#27272a] px-4 py-3 text-[#fafafa] font-mono-custom text-sm focus:outline-none focus:border-[#eab308] transition-colors"
              placeholder="OPERATOR@DOMAIN.COM"
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

          <div>
            <label className="block font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase mb-3">
              CLEARANCE_LEVEL
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border px-4 py-3 flex flex-col items-center justify-center text-center transition-colors ${selectedRole === 'ATTENDEE' ? 'border-[#eab308] bg-[#eab308]/10' : 'border-[#27272a] bg-[#09090b] hover:border-[#a1a1aa]'}`}>
                <input type="radio" value="ATTENDEE" {...register('role')} className="hidden" />
                <span className={`font-mono-custom text-sm font-bold uppercase ${selectedRole === 'ATTENDEE' ? 'text-[#eab308]' : 'text-[#a1a1aa]'}`}>ATTENDEE</span>
              </label>
              
              <label className={`cursor-pointer border px-4 py-3 flex flex-col items-center justify-center text-center transition-colors ${selectedRole === 'ORGANIZER' ? 'border-[#eab308] bg-[#eab308]/10' : 'border-[#27272a] bg-[#09090b] hover:border-[#a1a1aa]'}`}>
                <input type="radio" value="ORGANIZER" {...register('role')} className="hidden" />
                <span className={`font-mono-custom text-sm font-bold uppercase ${selectedRole === 'ORGANIZER' ? 'text-[#eab308]' : 'text-[#a1a1aa]'}`}>ORGANIZER</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-8 bg-[#eab308] text-[#09090b] font-mono-custom font-bold uppercase text-sm px-4 py-4 hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? 'REGISTERING...' : 'INITIATE CLEARANCE'}
            {!loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#27272a] text-center">
          <p className="font-mono-custom text-xs text-[#a1a1aa] uppercase">
            EXISTING PERSONNEL? <br/>
            <Link to="/login" className="text-[#eab308] hover:text-[#fafafa] hover:underline transition-colors mt-2 inline-block">
              ACCESS SYSTEM LOGIN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
