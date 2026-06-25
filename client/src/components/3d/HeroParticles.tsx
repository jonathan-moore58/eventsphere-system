import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseLerped = useRef({ x: 0, y: 0 });
  
  // Generate 5000 random points in a sphere
  const positions = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      const radius = Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  // Secondary layer — cyan accent particles
  const positions2 = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const radius = 1.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  const ref2 = useRef<THREE.Points>(null);

  useFrame((state) => {
    // Read pointer from R3F state (normalized -1 to 1)
    mouseTarget.current.x = state.pointer.x;
    mouseTarget.current.y = state.pointer.y;

    // Smooth lerp toward mouse target
    mouseLerped.current.x += (mouseTarget.current.x - mouseLerped.current.x) * 0.05;
    mouseLerped.current.y += (mouseTarget.current.y - mouseLerped.current.y) * 0.05;

    const elapsed = state.clock.elapsedTime;

    if (ref.current) {
      // Base auto-rotation + mouse parallax
      ref.current.rotation.x = elapsed * 0.03 + mouseLerped.current.y * 0.4;
      ref.current.rotation.y = elapsed * 0.05 + mouseLerped.current.x * 0.4;
    }
    if (ref2.current) {
      // Counter-rotate the cyan layer for depth
      ref2.current.rotation.x = elapsed * -0.02 + mouseLerped.current.y * 0.25;
      ref2.current.rotation.y = elapsed * -0.04 + mouseLerped.current.x * 0.25;
    }
  });

  return (
    <>
      <Points ref={ref} positions={positions} stride={3}>
        <PointMaterial color="#7C3AED" size={0.012} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
      </Points>
      <Points ref={ref2} positions={positions2} stride={3}>
        <PointMaterial color="#06B6D4" size={0.008} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
      </Points>
    </>
  );
}

export function HeroParticles() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ position: 'absolute', inset: 0 }}>
      <ParticleField />
    </Canvas>
  );
}
