import React, { useState, useEffect, useMemo } from 'react';
import { STLLoader } from 'three-stdlib';
import * as THREE from 'three';

const loader = new STLLoader();

export default function StlModel({ url, material }) {
    const [geometry, setGeometry] = useState(null);

    useEffect(() => {
        if (!url) return;

        loader.load(url, (geo) => {
            // Center the geometry
            geo.computeBoundingBox();
            geo.center();
            geo.computeVertexNormals();
            setGeometry(geo);
        }, undefined, (error) => {
            console.error('Error loading STL:', error);
        });

        // Cleanup
        return () => {
            if (geometry) {
                geometry.dispose();
            }
        };
    }, [url]);

    // Calculate scale to fit model nicely
    const scale = useMemo(() => {
        if (!geometry) return 1;
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        // Scale to fit within ~50 units
        return maxDim > 0 ? 50 / maxDim : 1;
    }, [geometry]);

    if (!geometry) return null;

    return (
        <mesh geometry={geometry} scale={scale} castShadow receiveShadow>
            <meshStandardMaterial
                color={material?.color || '#888888'}
                metalness={material?.metalness ?? 0.5}
                roughness={material?.roughness ?? 0.5}
                transparent={material?.transparent || false}
                opacity={material?.opacity ?? 1}
            />
        </mesh>
    );
}
