import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function RotatingSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const elapsed = state.clock.elapsedTime;
      meshRef.current.rotation.x = elapsed * 0.08;
      meshRef.current.rotation.y = elapsed * 0.12;
      // Subtle pulsing scale
      const pulse = 1 + Math.sin(elapsed * 0.5) * 0.03;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2.5, 2]} />
      <meshStandardMaterial 
        color="#7C3AED"
        wireframe={true}
        transparent={true}
        opacity={0.15}
        emissive="#7C3AED"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export function DashboardSphere() {
  return (
    <Canvas style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#7C3AED" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#06B6D4" />
      <RotatingSphere />
    </Canvas>
  );
}
