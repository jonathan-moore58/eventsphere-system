import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || ''
    }
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      setLoading(true);
      const payload: any = {};
      if (data.name) payload.name = data.name;
      if (data.password) payload.password = data.password;

      const res = await api.put('/auth/profile', payload);
      updateUser(res.data);
      toast.success('IDENTITY_UPDATED');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'UPDATE_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-md bg-[#18181b] brutal-border p-8 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#eab308]/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="font-mono-custom text-xs text-[#eab308] font-bold tracking-widest uppercase mb-2">
            // SYS:IDENTITY_CONFIG
          </div>
          <h1 className="text-4xl font-display-custom font-bold text-[#fafafa] uppercase mb-8 tracking-tight leading-none">
            UPDATE PROFILE
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase tracking-widest">
                DISPLAY_NAME
              </label>
              <input
                {...register('name')}
                className="w-full bg-[#09090b] border border-[#27272a] p-4 text-[#fafafa] font-mono-custom focus:outline-none focus:border-[#eab308] transition-colors"
                placeholder="CURRENT_NAME"
              />
              {errors.name && <p className="text-[#ef4444] text-xs font-mono-custom mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="font-mono-custom text-xs font-bold text-[#a1a1aa] uppercase tracking-widest">
                NEW_AUTHORIZATION_KEY (PASSWORD)
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full bg-[#09090b] border border-[#27272a] p-4 text-[#fafafa] font-mono-custom focus:outline-none focus:border-[#eab308] transition-colors"
                placeholder="LEAVE BLANK TO KEEP CURRENT"
              />
              {errors.password && <p className="text-[#ef4444] text-xs font-mono-custom mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fafafa] text-[#09090b] font-display-custom font-bold text-xl py-4 mt-8 hover:bg-[#eab308] transition-colors disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : 'COMMIT_CHANGES'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
