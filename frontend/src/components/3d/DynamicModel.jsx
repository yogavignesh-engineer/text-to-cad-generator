import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { Center, Float } from '@react-three/drei';

export function DynamicModel({ fileUrl, color = "#29b6f6" }) {
    // If no file, return null (parent handles loading state)
    if (!fileUrl) return null;

    const geom = useLoader(STLLoader, fileUrl);
    const meshRef = useRef();

    // Auto-center the geometry
    useEffect(() => {
        geom.computeVertexNormals();
        geom.center();
    }, [geom]);

    // Elite Visuals: Physical Material (Metal look)
    return (
        <Center>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={meshRef} geometry={geom} castShadow receiveShadow>
                    <meshPhysicalMaterial
                        color={color}
                        metalness={0.8}
                        roughness={0.2}
                        clearcoat={1.0}
                        clearcoatRoughness={0.1}
                        envMapIntensity={1}
                    />
                </mesh>
            </Float>
        </Center>
    );
}

export default DynamicModel;
