import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function AnimatedSection({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state immediately to prevent FOUC
    gsap.set(el, { opacity: 0, y: 60 });

    const ctx = gsap.context(() => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 50%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Cleanup: kill all GSAP animations and ScrollTriggers created in this context
    return () => ctx.revert();
  }, []);
  
  return <div ref={ref} className={className}>{children}</div>;
}
