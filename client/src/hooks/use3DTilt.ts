import { useRef, useCallback } from 'react';

export function use3DTilt(intensity = 10) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    // Smooth transition while moving
    card.style.transition = 'transform 0.15s ease-out';
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

    // Dynamic glare effect — position a radial highlight following the cursor
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    card.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(124,58,237,0.12) 0%, transparent 60%), rgba(255,255,255,0.04)`;
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    if (ref.current) {
      // Slower, more satisfying return to rest
      ref.current.style.transition = 'transform 0.5s ease-out, background 0.5s ease-out';
      ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      ref.current.style.background = 'rgba(255,255,255,0.04)';
    }
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
