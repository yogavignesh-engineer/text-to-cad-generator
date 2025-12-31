import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { parsePrompt } from '../../utils/geometryEngine';
import { MATERIALS } from '../MaterialSelector';

// Note: parsePrompt needs to be imported or duplicated.
// I imported it from utils since I just created it.

export default function DynamicModel({ prompt, type }) {
    const mesh = useRef();
    const geometry = parsePrompt(prompt);
    const mat = MATERIALS[type] || MATERIALS.steel;

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    const { shape, dimensions } = geometry;

    return (
        <mesh ref={mesh} position={[0, 0, 0]} castShadow receiveShadow>
            {shape === 'box' && <boxGeometry args={[dimensions.length, dimensions.width, dimensions.height]} />}
            {(shape === 'cylinder' || shape === 'rod' || shape === 'shaft') && <cylinderGeometry args={[dimensions.diameter / 2, dimensions.diameter / 2, dimensions.height, 32]} />}
            {shape === 'sphere' && <sphereGeometry args={[dimensions.radius, 32, 32]} />}
            {shape === 'cone' && <coneGeometry args={[dimensions.diameter / 2, dimensions.height, 32]} />}
            {shape === 'torus' && <torusGeometry args={[dimensions.radius, dimensions.tube, 16, 100]} />}
            {shape === 'gear' && <cylinderGeometry args={[dimensions.diameter / 2, dimensions.diameter / 2, 10, 20]} />}

            <meshStandardMaterial
                color={mat.color}
                metalness={mat.metalness}
                roughness={mat.roughness}
                wireframe={true} // Preview mode as wireframe
                wireframeLinewidth={2}
            />
        </mesh>
    );
}
