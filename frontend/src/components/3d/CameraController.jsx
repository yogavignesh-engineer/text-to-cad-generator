import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraController({ hasModel }) {
    const vec = new THREE.Vector3();

    useFrame((state) => {
        const step = 0.05;
        if (hasModel) {
            // Zoom in slightly when model is present
            state.camera.position.lerp(vec.set(50, 40, 50), step);
            state.camera.lookAt(0, 0, 0);
        } else {
            // Idle state
            state.camera.position.lerp(vec.set(100, 80, 100), step);
            state.camera.lookAt(0, 0, 0);
        }
        state.camera.updateProjectionMatrix();
    });

    return null;
}
