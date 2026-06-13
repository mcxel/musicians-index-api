"use client";

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

function Avatar({ active, position }: { active: boolean; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} position={position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
        <meshStandardMaterial
          color={active ? '#00FFFF' : '#AA2DFF'}
          roughness={0.1}
          metalness={0.9}
          emissive={active ? '#00FFFF' : '#000000'}
          emissiveIntensity={active ? 0.4 : 0}
        />
      </mesh>
    </Float>
  );
}

const POSITIONS: [number, number, number][] = [
  [-3, 0, -2], [0, 0, 0], [3, 0, -2], [-1.5, 0, -4], [1.5, 0, -4],
  [-4, 0, 0], [4, 0, 0], [-2, 0, 2], [2, 0, 2],
];

export default function AvatarLobbyCanvas({ activeCount = 5 }: { activeCount?: number }) {
  const positions = POSITIONS.slice(0, Math.min(activeCount, POSITIONS.length));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.55 }}>
      <Canvas
        shadows
        camera={{ position: [0, 3, 9], fov: 45 }}
        gl={{ powerPreference: 'high-performance', antialias: false, alpha: true }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.3} />
          <spotLight
            position={[10, 15, 10]}
            angle={0.2}
            penumbra={1}
            intensity={2}
            castShadow
          />
          {positions.map((pos, i) => (
            <Avatar key={i} active={i === 0} position={pos} />
          ))}
          <ContactShadows
            resolution={512}
            scale={20}
            blur={2.5}
            opacity={0.4}
            far={10}
            color="#00FFFF"
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
