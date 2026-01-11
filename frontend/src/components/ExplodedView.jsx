/**
 * Exploded View Animation Component
 * For assemblies - separates and animates parts
 * AWARD-WINNING FEATURE
 */

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Environment } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

// Animated part that moves based on explosion level
function AnimatedPart({ geometry, basePosition, explosionDirection, explosionLevel, color }) {
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current) {
            // Smoothly interpolate position
            const offset = explosionLevel * 50; // 50mm max displacement
            meshRef.current.position.x = basePosition.x + (explosionDirection.x * offset);
            meshRef.current.position.y = basePosition.y + (explosionDirection.y * offset);
            meshRef.current.position.z = basePosition.z + (explosionDirection.z * offset);
        }
    });

    return (
        <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial
                color={color || "#00d4ff"}
                metalness={0.8}
                roughness={0.2}
                envMapIntensity={1}
            />
        </mesh>
    );
}

export function ExplodedView({ parts, assemblyName = "Assembly" }) {
    const [explosionLevel, setExplosionLevel] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-animate explosion
    const handleAutoExplode = () => {
        setIsAnimating(true);
        let level = 0;
        const interval = setInterval(() => {
            level += 0.02;
            setExplosionLevel(level);
            if (level >= 1) {
                clearInterval(interval);
                setIsAnimating(false);
            }
        }, 50);
    };

    // Auto-animate collapse
    const handleAutoCollapse = () => {
        setIsAnimating(true);
        let level = 1;
        const interval = setInterval(() => {
            level -= 0.02;
            setExplosionLevel(level);
            if (level <= 0) {
                clearInterval(interval);
                setIsAnimating(false);
            }
        }, 50);
    };

    if (!parts || parts.length === 0) {
        return (
            <div className="text-center text-gray-400 py-12">
                <div className="text-xl mb-2">No assembly loaded</div>
                <div className="text-sm">This feature works with multi-part assemblies</div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-96 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-500/30 overflow-hidden">
            {/* Title */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-purple-500/50 rounded-lg px-4 py-2 text-white z-10">
                <div className="text-sm font-bold text-purple-400">🔧 Exploded View</div>
                <div className="text-xs text-gray-400 mt-1">{assemblyName}</div>
            </div>

            {/* 3D Canvas */}
            <Canvas shadows camera={{ position: [150, 150, 150], fov: 50 }}>
                <color attach="background" args={['#0a0a0a']} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <spotLight
                    position={[100, 100, 100]}
                    angle={0.3}
                    penumbra={1}
                    intensity={1}
                    castShadow
                />
                <pointLight position={[-100, -100, -100]} intensity={0.5} />

                {/* Animated Parts */}
                <Center>
                    {parts.map((part, index) => (
                        <AnimatedPart
                            key={index}
                            geometry={part.geometry}
                            basePosition={part.basePosition || { x: 0, y: 0, z: 0 }}
                            explosionDirection={part.explosionDirection || { x: 0, y: index * 0.3, z: 0 }}
                            explosionLevel={explosionLevel}
                            color={part.color}
                        />
                    ))}
                </Center>

                {/* Environment */}
                <Environment preset="studio" />

                {/* Controls */}
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                />
            </Canvas>

            {/* Control Panel */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-purple-500/50 rounded-xl p-4 min-w-[400px] z-10">
                {/* Slider */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">Explosion Level</span>
                        <span className="text-sm font-bold text-white">
                            {explosionLevel === 0 ? 'Assembled' : `${Math.round(explosionLevel * 100)}% Exploded`}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={explosionLevel}
                        onChange={(e) => setExplosionLevel(parseFloat(e.target.value))}
                        disabled={isAnimating}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
                    />
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleAutoCollapse}
                        disabled={isAnimating || explosionLevel === 0}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ◀ Assemble
                    </button>
                    <button
                        onClick={handleAutoExplode}
                        disabled={isAnimating || explosionLevel === 1}
                        className="flex-1 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Explode ▶
                    </button>
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
                🖱️ Drag to rotate • Scroll to zoom • Use slider to control explosion
            </div>

            <style jsx>{`
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
        .slider-purple::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
      `}</style>
        </div>
    );
}

export default ExplodedView;
