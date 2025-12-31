import React from 'react';

// ===== DIMENSION ANNOTATIONS =====
export default function DimensionAnnotations({ dimensions, visible }) {
    if (!visible || !dimensions) return null;

    const { length = 50, width = 50, height = 10 } = dimensions;

    return (
        <group>
            {/* Length annotation (X-axis) */}
            {length && (
                <group position={[0, -width / 2 - 15, height / 2]}>
                    {/* Line */}
                    <mesh>
                        <boxGeometry args={[length, 0.5, 0.5]} />
                        <meshBasicMaterial color="#00f0ff" />
                    </mesh>
                    {/* End caps */}
                    <mesh position={[-length / 2, 0, 0]}>
                        <boxGeometry args={[0.5, 5, 0.5]} />
                        <meshBasicMaterial color="#00f0ff" />
                    </mesh>
                    <mesh position={[length / 2, 0, 0]}>
                        <boxGeometry args={[0.5, 5, 0.5]} />
                        <meshBasicMaterial color="#00f0ff" />
                    </mesh>
                </group>
            )}

            {/* Width annotation (Y-axis) */}
            {width && (
                <group position={[length / 2 + 15, 0, height / 2]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <boxGeometry args={[width, 0.5, 0.5]} />
                        <meshBasicMaterial color="#10b981" />
                    </mesh>
                    <mesh position={[0, -width / 2, 0]}>
                        <boxGeometry args={[5, 0.5, 0.5]} />
                        <meshBasicMaterial color="#10b981" />
                    </mesh>
                    <mesh position={[0, width / 2, 0]}>
                        <boxGeometry args={[5, 0.5, 0.5]} />
                        <meshBasicMaterial color="#10b981" />
                    </mesh>
                </group>
            )}

            {/* Height annotation (Z-axis) */}
            {height && (
                <group position={[length / 2 + 15, width / 2 + 15, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <boxGeometry args={[0.5, height, 0.5]} />
                        <meshBasicMaterial color="#f59e0b" />
                    </mesh>
                    <mesh position={[0, 0, -height / 2]}>
                        <boxGeometry args={[5, 5, 0.5]} />
                        <meshBasicMaterial color="#f59e0b" />
                    </mesh>
                    <mesh position={[0, 0, height / 2]}>
                        <boxGeometry args={[5, 5, 0.5]} />
                        <meshBasicMaterial color="#f59e0b" />
                    </mesh>
                </group>
            )}
        </group>
    );
}
