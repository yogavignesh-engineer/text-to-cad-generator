import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Grid, ContactShadows, Environment, Stars, PerspectiveCamera, Float, MeshTransmissionMaterial, SpotLight, useHelper } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Animated Particles Background
function AnimatedParticles({ count = 1000, darkMode }) {
  const points = useRef();
  const particlesPosition = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        color={darkMode ? "#667eea" : "#764ba2"}
        sizeAttenuation
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Floating Holographic Grid
function HolographicGrid({ darkMode }) {
  const gridRef = useRef();
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5 - 30;
    }
  });

  return (
    <group ref={gridRef}>
      <Grid 
        infiniteGrid 
        fadeDistance={450} 
        sectionColor={darkMode ? "#667eea" : "#764ba2"} 
        sectionSize={60} 
        cellSize={12} 
        cellThickness={0.8}
        fadeStrength={2}
      />
    </group>
  );
}

// Enhanced Lighting Setup
function EnhancedLighting({ darkMode }) {
  const spotLightRef = useRef();
  
  useFrame((state) => {
    if (spotLightRef.current) {
      spotLightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 50;
      spotLightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.3) * 50;
    }
  });

  return (
    <>
      <ambientLight intensity={darkMode ? 0.4 : 0.6} />
      <directionalLight 
        position={[15, 15, 8]} 
        intensity={darkMode ? 1.8 : 2.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
      />
      <spotLight 
        ref={spotLightRef}
        position={[60, 60, 60]} 
        angle={0.25} 
        intensity={darkMode ? 2.5 : 3} 
        castShadow 
        penumbra={0.5}
        color="#667eea"
      />
      <pointLight position={[-60, 30, -60]} color="#b026ff" intensity={darkMode ? 4 : 2} />
      <pointLight position={[60, -30, 60]} color="#00f0ff" intensity={darkMode ? 3 : 1.5} />
      
      {/* Rim Lighting */}
      <pointLight position={[0, 50, -100]} color="#ff00ff" intensity={2} distance={200} />
      <pointLight position={[0, -50, 100]} color="#00ffff" intensity={2} distance={200} />
    </>
  );
}

// Model Container with Float Animation
export function FloatingModelContainer({ children, hasModel }) {
  return (
    <Float
      speed={2}
      rotationIntensity={0.3}
      floatIntensity={0.5}
      floatingRange={[-0.5, 0.5]}
    >
      <Center>
        {children}
      </Center>
    </Float>
  );
}

// Main Enhanced Canvas
export default function EnhancedCanvas({ children, darkMode, enablePostProcessing = true }) {
  const bgColor = darkMode ? '#000' : '#f0f0f0';

  return (
    <Canvas 
      shadows 
      dpr={[1, 2]} 
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      }}
    >
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[bgColor, 100, 400]} />
      
      <PerspectiveCamera makeDefault position={[100, 80, 100]} fov={28} />
      
      <Environment preset="city" />
      <EnhancedLighting darkMode={darkMode} />
      
      {darkMode && (
        <>
          <Stars radius={350} depth={50} count={7000} factor={5} saturation={0} speed={0.5} />
          <AnimatedParticles count={500} darkMode={darkMode} />
        </>
      )}

      {children}
      
      <ContactShadows 
        position={[0, -30, 0]} 
        opacity={darkMode ? 0.6 : 0.3} 
        scale={100} 
        blur={2.5} 
      />
      
      <HolographicGrid darkMode={darkMode} />

      <OrbitControls 
        makeDefault 
        enableDamping 
        dampingFactor={0.05}
        minDistance={30}
        maxDistance={300}
        maxPolarAngle={Math.PI / 2}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />

      {enablePostProcessing && (
        <EffectComposer>
          <Bloom 
            intensity={darkMode ? 1.2 : 0.8} 
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            blendFunction={BlendFunction.SCREEN}
          />
          <ChromaticAberration 
            offset={[0.0005, 0.0005]} 
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
