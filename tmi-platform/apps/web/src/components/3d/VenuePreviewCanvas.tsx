"use client";

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

interface VenuePreviewCanvasProps {
  skin: 'theater' | 'stadium' | 'club' | 'outdoor' | 'boardroom' | string;
  accentColor: string;
}

export default function VenuePreviewCanvas({ skin, accentColor }: VenuePreviewCanvasProps) {
  const getStageColor = () => {
    switch (skin) {
      case 'theater': return '#1a0a04';
      case 'stadium': return '#0a0a12';
      case 'club': return '#0a0018';
      case 'outdoor': return '#050c18';
      case 'boardroom': return '#080814';
      default: return '#101020';
    }
  };

  return (
    <div style={{ width: '100%', height: 140, position: 'relative', background: '#020208', borderRadius: 8, overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 2.8, 6.2], fov: 42 }}
        gl={{ powerPreference: 'high-performance', antialias: true }}
      >
        <Suspense fallback={null}>
          <Environment preset="night" />
          <ambientLight intensity={0.25} />
          
          <spotLight
            position={[0, 8, 0]}
            angle={0.4}
            penumbra={0.9}
            intensity={3.5}
            color={accentColor}
            castShadow
          />

          <group position={[0, -0.6, 0]}>
            <mesh receiveShadow castShadow>
              <boxGeometry args={[6.2, 0.35, 3.8]} />
              <meshStandardMaterial color={getStageColor()} roughness={0.25} metalness={0.8} />
            </mesh>

            <mesh position={[0, 0.18, 1.82]}>
              <boxGeometry args={[6.2, 0.04, 0.08]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} />
            </mesh>
            <mesh position={[0, 0.18, -1.82]}>
              <boxGeometry args={[6.2, 0.04, 0.08]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} />
            </mesh>

            <mesh position={[0, 0.95, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
              <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
