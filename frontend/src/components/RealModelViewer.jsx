/**
 * REAL Model Viewer - Loads ACTUAL generated STL/GLB files
 * FIXES: Split-brain architecture issue
 * 
 * This replaces regex-based primitive rendering with real file loading
 */

import { Suspense, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, useGLTF, Center } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import { Loader } from 'lucide-react';

// STL Model Loader
function STLModel({ url }) {
    const geometry = useLoader(STLLoader, url);

    // Center the geometry
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);

    return (
        <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial
                color="#00d4ff"
                metalness={0.8}
                roughness={0.2}
                envMapIntensity={1}
            />
        </mesh>
    );
}

// GLB Model Loader
function GLBModel({ url }) {
    const { scene } = useGLTF(url);

    return <primitive object={scene} castShadow receiveShadow />;
}

// Loading fallback
function LoadingBox() {
    return (
        <mesh>
            <boxGeometry args={[20, 20, 20]} />
            <meshStandardMaterial color="#444" wireframe />
        </mesh>
    );
}

// Main viewer component
export function RealModelViewer({ modelUrl, format = 'stl', metadata = null }) {
    const [error, setError] = useState(null);

    if (!modelUrl) {
        return (
            <div className="w-full h-96 flex items-center justify-center bg-gray-900 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-center">
                    <div className="text-xl mb-2">No model loaded</div>
                    <div className="text-sm">Generate a model to see it here</div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-96 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-cyan-500/30 overflow-hidden">
            {/* Physics HUD Overlay */}
            {metadata && (
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-4 text-white font-mono text-xs z-10">
                    <div className="text-cyan-400 font-bold mb-2">📊 Engineering Analysis</div>
                    <div className="space-y-1">
                        {metadata.volume_mm3 && (
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Volume:</span>
                                <span className="text-white">{metadata.volume_mm3.toFixed(2)} mm³</span>
                            </div>
                        )}
                        {metadata.mass_g && (
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Mass:</span>
                                <span className="text-green-400 font-bold">{metadata.mass_g.toFixed(2)} g</span>
                            </div>
                        )}
                        {metadata.surface_area_mm2 && (
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Area:</span>
                                <span className="text-white">{metadata.surface_area_mm2.toFixed(2)} mm²</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3D Canvas */}
            <Canvas shadows camera={{ position: [100, 100, 100], fov: 50 }}>
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

                {/* Model */}
                <Suspense fallback={<LoadingBox />}>
                    <Center>
                        {format === 'glb' ? (
                            <GLBModel url={modelUrl} />
                        ) : (
                            <STLModel url={modelUrl} />
                        )}
                    </Center>
                </Suspense>

                {/* Environment */}
                <Environment preset="studio" />
                <ContactShadows
                    position={[0, -50, 0]}
                    opacity={0.4}
                    scale={200}
                    blur={2}
                />

                {/* Controls */}
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={50}
                    maxDistance={500}
                />
            </Canvas>

            {/* Loading overlay */}
            {error && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                    <div className="text-red-400 text-center">
                        <div className="text-xl mb-2">❌ Failed to load model</div>
                        <div className="text-sm">{error}</div>
                    </div>
                </div>
            )}

            {/* Controls hint */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
                🖱️ Click + drag to rotate • Scroll to zoom
            </div>
        </div>
    );
}

export default RealModelViewer;
