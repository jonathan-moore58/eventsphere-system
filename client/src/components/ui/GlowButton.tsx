import React from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
}

export function GlowButton({ children, variant = 'primary', className = '', ...props }: GlowButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-brand-violet to-brand-magenta hover:from-brand-violet/80 hover:to-brand-magenta/80 text-white shadow-glow-violet',
    outline: 'border border-white/20 text-white hover:bg-white/10 backdrop-blur-[20px]',
    ghost: 'text-brand-violet hover:text-brand-violet/80 hover:bg-brand-violet/10',
  };
  return (
    <button className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
