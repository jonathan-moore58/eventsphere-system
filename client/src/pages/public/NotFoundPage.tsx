import React from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { GlowButton } from '../../components/ui/GlowButton';
import { useRef } from 'react';
import * as THREE from 'three';

function RotatingTorus() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <meshStandardMaterial 
        color="#EC4899" 
        emissive="#EC4899"
        emissiveIntensity={0.5}
        wireframe={true} 
      />
    </mesh>
  );
}

export default function NotFoundPage() {
  return (
    <div className="relative w-full h-screen bg-brand-dark flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <RotatingTorus />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center">
        <h1 className="text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-brand mb-4 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
          404
        </h1>
        <h2 className="text-3xl font-display font-bold text-white mb-6">
          Lost in the Cosmos
        </h2>
        <p className="text-slate-400 mb-8 max-w-md">
          The event or page you are looking for has vanished into a black hole, or never existed at all.
        </p>
        <Link to="/">
          <GlowButton>Return to Base</GlowButton>
        </Link>
      </div>
    </div>
  );
}
