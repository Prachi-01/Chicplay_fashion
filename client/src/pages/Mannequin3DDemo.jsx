import { useState } from 'react';
import Mannequin3DViewer from '../components/Mannequin3DViewer';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Box, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Mannequin3DDemo = () => {
    const navigate = useNavigate();
    const [capturedImage, setCapturedImage] = useState(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back</span>
                    </button>

                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Box className="text-pink-500" />
                        3D Mannequin Viewer
                    </h1>

                    <div className="w-20" />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-6 mb-8 text-white shadow-xl"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">Interactive 3D Mannequin</h2>
                            <p className="text-white/90 leading-relaxed">
                                This is your new 3D mannequin viewer built with Three.js and React Three Fiber.
                                It features real-time 3D rotation, multiple body types, skin tones, and lighting modes.
                                Drag to rotate, scroll to zoom, and use the controls to customize!
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 3D Viewer */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
                        >
                            <div className="p-6">
                                <Mannequin3DViewer
                                    onCaptureImage={(dataUrl) => setCapturedImage(dataUrl)}
                                    defaultBodyType="slim"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Instructions & Captured Image */}
                    <div className="space-y-6">
                        {/* Instructions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Info size={20} className="text-blue-500" />
                                How to Use
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-3">
                                    <span className="bg-pink-100 text-pink-600 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                                    <span><strong>Rotate:</strong> Click and drag on the mannequin to rotate it in 3D</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-pink-100 text-pink-600 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                                    <span><strong>Zoom:</strong> Use mouse scroll or the +/- buttons</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-pink-100 text-pink-600 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                                    <span><strong>Skin Tone:</strong> Click the colored circles to change skin tone</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-pink-100 text-pink-600 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</span>
                                    <span><strong>Body Type:</strong> Select Slim, Athletic, Curvy, or Plus</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-pink-100 text-pink-600 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">5</span>
                                    <span><strong>Lighting:</strong> Choose Studio, Warm, Cool, or Dramatic lighting</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-pink-100 text-pink-600 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">6</span>
                                    <span><strong>Auto Rotate:</strong> Click the rotate icon for continuous rotation</span>
                                </li>
                            </ul>
                        </motion.div>

                        {/* Captured Screenshot */}
                        {capturedImage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4">📸 Captured Screenshot</h3>
                                <img
                                    src={capturedImage}
                                    alt="Captured mannequin"
                                    className="w-full rounded-2xl border border-gray-200"
                                />
                                <a
                                    href={capturedImage}
                                    download="mannequin-capture.png"
                                    className="mt-4 block w-full bg-pink-500 text-white text-center py-3 rounded-xl font-bold hover:bg-pink-600 transition"
                                >
                                    Download Image
                                </a>
                            </motion.div>
                        )}

                        {/* Features List */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white"
                        >
                            <h3 className="text-lg font-bold mb-4">✨ Features</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    'Real 3D Rotation',
                                    '4 Body Types',
                                    '5 Skin Tones',
                                    '4 Lighting Modes',
                                    'Screenshot Capture',
                                    'Fullscreen View',
                                    'Auto-Rotate',
                                    'Zoom Controls',
                                    'Touch Support',
                                    'GLB Ready'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mannequin3DDemo;
