/**
 * AR Viewer Component with QR Code
 * Enables viewing models in Augmented Reality
 * AWARD-WINNING FEATURE
 */

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, QrCode, Download, ExternalLink } from 'lucide-react';

export function ARViewer({ modelUrl, modelName = "CAD Model" }) {
    const [showQR, setShowQR] = useState(false);

    if (!modelUrl) {
        return (
            <div className="text-center text-gray-400 py-8">
                <Smartphone className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <div className="text-sm">Generate a model to view it in AR</div>
            </div>
        );
    }

    // Convert to GLB URL for AR support
    const glbUrl = modelUrl.replace('.stl', '.glb');

    // AR page URL
    const arPageUrl = `${window.location.origin}/ar?model=${encodeURIComponent(glbUrl)}`;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-pink-400" />
                        Augmented Reality View
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                        See your model in your real space using your phone
                    </p>
                </div>
            </div>

            {/* AR Card */}
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border-2 border-purple-500/30 p-6">
                {!showQR ? (
                    /* Initial State */
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                            <QrCode className="w-10 h-10 text-white" />
                        </div>

                        <div>
                            <div className="text-lg font-bold text-white mb-2">
                                View in Your Space
                            </div>
                            <div className="text-sm text-gray-300">
                                Point your phone camera at your desk and see this model appear in 3D
                            </div>
                        </div>

                        <button
                            onClick={() => setShowQR(true)}
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 mx-auto"
                        >
                            <QrCode className="w-5 h-5" />
                            Show QR Code
                        </button>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
                            <div className="text-center">
                                <div className="text-2xl mb-1">📱</div>
                                <div className="text-xs text-gray-400">Phone Camera</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-1">🔄</div>
                                <div className="text-xs text-gray-400">360° Rotation</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-1">📐</div>
                                <div className="text-xs text-gray-400">Real Scale</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* QR Code Shown */
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="bg-white p-4 rounded-xl">
                                <QRCodeSVG
                                    value={arPageUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-white font-medium mb-2">
                                📱 Scan with your phone camera
                            </div>
                            <div className="text-xs text-gray-400">
                                Works on iPhone (iOS 12+) and Android (ARCore supported)
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-black/30 rounded-lg p-4 space-y-2 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                                <span className="text-purple-400 font-bold">1.</span>
                                <span>Open camera app on your phone</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-purple-400 font-bold">2.</span>
                                <span>Point at the QR code above</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-purple-400 font-bold">3.</span>
                                <span>Tap the notification to open</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-purple-400 font-bold">4.</span>
                                <span>Tap "View in your space" button</span>
                            </div>
                        </div>

                        {/* Alternative Link */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowQR(false)}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm transition-all"
                            >
                                ← Back
                            </button>
                            <a
                                href={arPageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Link
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Compatibility Note */}
            <div className="text-xs text-gray-500 text-center">
                🔧 Requires WebXR compatible browser. Works best on mobile devices.
            </div>
        </div>
    );
}

// AR View Page Component (for the actual AR experience)
export function ARViewPage({ modelUrl }) {
    return (
        <div className="h-screen w-screen bg-black">
            <model-viewer
                src={modelUrl}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                shadow-intensity="1"
                auto-rotate
                style={{ width: '100%', height: '100%' }}
            >
                <button
                    slot="ar-button"
                    className="ar-button"
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '16px 32px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        backgroundColor: '#a855f7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.5)',
                        cursor: 'pointer'
                    }}
                >
                    👆 View in your space
                </button>

                <div
                    slot="poster"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        backgroundColor: '#000',
                        color: '#fff',
                        fontSize: '20px'
                    }}
                >
                    <div className="text-center">
                        <div className="text-4xl mb-4">📱</div>
                        <div>Loading 3D Model...</div>
                        <div className="text-sm text-gray-400 mt-2">Tap to view in AR</div>
                    </div>
                </div>
            </model-viewer>
        </div>
    );
}

export default ARViewer;
