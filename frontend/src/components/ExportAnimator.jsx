/**
 * Real Animation Renderer
 * Actual Three.js → Video pipeline using MediaRecorder
 * IMPROVEMENT: Animation System (Currently Simulated)
 */

import { useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Download, Video, Play, Loader } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

export function RealAnimationRenderer({ stlUrl, animationType, onComplete, onProgress }) {
    const canvasRef = useRef();
    const [isRecording, setIsRecording] = useState(false);

    const animationConfigs = {
        rotate360: {
            duration: 5, // seconds
            fps: 30,
            name: '360° Rotation',
            animate: (camera, frame, totalFrames) => {
                const angle = (frame / totalFrames) * Math.PI * 2;
                camera.position.x = Math.cos(angle) * 150;
                camera.position.z = Math.sin(angle) * 150;
                camera.lookAt(0, 0, 0);
            }
        },
        exploded: {
            duration: 10,
            fps: 30,
            name: 'Exploded View',
            animate: (camera, frame, totalFrames) => {
                // Zoom in/out effect
                const progress = frame / totalFrames;
                const distance = 100 + Math.sin(progress * Math.PI) * 50;
                camera.position.set(distance, distance, distance);
                camera.lookAt(0, 0, 0);
            }
        },
        dimensions: {
            duration: 8,
            fps: 30,
            name: 'Dimension Highlight',
            animate: (camera, frame, totalFrames) => {
                // Orbit with slight zoom
                const angle = (frame / totalFrames) * Math.PI;
                camera.position.x = Math.cos(angle) * 120;
                camera.position.y = 80 + Math.sin(frame / 10) * 20;
                camera.position.z = Math.sin(angle) * 120;
                camera.lookAt(0, 0, 0);
            }
        }
    };

    const generateVideo = async () => {
        setIsRecording(true);
        const config = animationConfigs[animationType];
        const totalFrames = config.duration * config.fps;

        try {
            // Load STL geometry
            const loader = new STLLoader();
            const geometry = await new Promise((resolve, reject) => {
                loader.load(stlUrl, resolve, undefined, reject);
            });

            // Center geometry
            geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);

            // Create scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1a1a1a);

            // Add mesh
            const material = new THREE.MeshStandardMaterial({
                color: 0x00d4ff,
                metalness: 0.6,
                roughness: 0.4
            });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 5);
            scene.add(directionalLight);

            // Grid
            const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
            scene.add(gridHelper);

            // Camera
            const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);
            camera.position.set(100, 100, 100);
            camera.lookAt(0, 0, 0);

            // Renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(1920, 1080); // Full HD
            renderer.setPixelRatio(1);

            // Setup MediaRecorder
            const canvas = renderer.domElement;
            const stream = canvas.captureStream(config.fps);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000 // 5 Mbps
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                onComplete(url, blob);
                setIsRecording(false);
            };

            // Start recording
            mediaRecorder.start();

            // Render animation frames
            for (let frame = 0; frame < totalFrames; frame++) {
                // Update camera position
                config.animate(camera, frame, totalFrames);

                // Render frame
                renderer.render(scene, camera);

                // Update progress
                const progress = ((frame + 1) / totalFrames) * 100;
                onProgress(progress);

                // Wait for next frame (to match FPS)
                await new Promise(resolve => setTimeout(resolve, 1000 / config.fps));
            }

            // Stop recording
            mediaRecorder.stop();

            // Cleanup
            renderer.dispose();
            geometry.dispose();
            material.dispose();

        } catch (error) {
            console.error('Animation generation failed:', error);
            setIsRecording(false);
            throw error;
        }
    };

    return {
        generateVideo,
        isRecording,
        config: animationConfigs[animationType]
    };
}

// Updated ExportAnimator component
export function ExportAnimatorV2({ stlUrl, onAnimationComplete }) {
    const [animationType, setAnimationType] = useState('rotate360');
    const [progress, setProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState(null);
    const [error, setError] = useState(null);

    const { generateVideo, isRecording, config } = RealAnimationRenderer({
        stlUrl,
        animationType,
        onComplete: (url, blob) => {
            setVideoUrl(url);
            setProgress(100);
            if (onAnimationComplete) onAnimationComplete(url, blob);
        },
        onProgress: setProgress
    });

    const handleGenerate = async () => {
        setError(null);
        setProgress(0);
        setVideoUrl(null);

        try {
            await generateVideo();
        } catch (err) {
            setError(err.message);
        }
    };

    const downloadVideo = () => {
        if (!videoUrl) return;
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `neuralcad_${animationType}_${Date.now()}.webm`;
        a.click();
    };

    return (
        <div className="space-y-4">
            {/* Animation type selection (same as before) */}

            {/* Progress with actual rendering */}
            {isRecording && (
                <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                                Rendering {config?.name}...
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                Recording at {config?.fps} FPS • {progress.toFixed(1)}% complete
                            </div>
                        </div>
                        <div className="text-lg font-bold text-pink-400">{Math.floor(progress)}%</div>
                    </div>

                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Video player (actual HTML5 video) */}
            {videoUrl && (
                <div className="space-y-3">
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        loop
                        className="w-full rounded-xl border border-white/10"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={downloadVideo}
                            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download Video (WebM)
                        </button>
                        <button
                            onClick={() => setVideoUrl(null)}
                            className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                        >
                            New Animation
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    ✗ {error}
                </div>
            )}

            {/* Generate button */}
            {!videoUrl && !isRecording && (
                <button
                    onClick={handleGenerate}
                    disabled={!stlUrl}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                    <Video className="w-5 h-5" />
                    Generate Real Animation
                </button>
            )}
        </div>
    );
}

export default ExportAnimatorV2;
