import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { STLLoader } from 'three-stdlib';
import { Center } from '@react-three/drei';

const loader = new STLLoader();

export default function StlModel({ url, material }) {
    const meshRef = useRef();
    const geometryRef = useRef(null);

    useEffect(() => {
        if (!url) return;
        loader.load(url, (geo) => {
            geo.computeVertexNormals();
            geometryRef.current = geo;
        });
    }, [url]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
        }
    });

    if (!geometryRef.current) return null;

    return (
        <Center top>
            <mesh ref={meshRef} geometry={geometryRef.current} castShadow receiveShadow>
                <meshStandardMaterial
                    color={material.color}
                    metalness={material.metalness}
                    roughness={material.roughness}
                    clearcoat={material.clearcoat || 0}
                    transmission={material.transmission || 0}
                    opacity={material.opacity || 1}
                    transparent={material.transparent || false}
                />
            </mesh>
        </Center>
    );
}
