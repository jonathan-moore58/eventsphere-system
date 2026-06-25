import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassCard({ children, className = '', glow = false }: GlassCardProps) {
  return (
    <div className={`
      rounded-2xl border border-white/10 p-6
      bg-white/5 backdrop-blur-[20px]
      transition-all duration-300
      ${glow ? 'shadow-glow-violet hover:shadow-glow-violet' : 'shadow-card'}
      ${className}
    `}>
      {children}
    </div>
  );
}
