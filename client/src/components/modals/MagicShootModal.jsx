import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Sparkles, Wand2, Loader } from 'lucide-react';

const MagicShootModal = ({ isOpen, onClose, prompt, originalImage, onGenerate }) => {
    const [generating, setGenerating] = useState(false);
    const [resultImage, setResultImage] = useState(null);

    // Simulate generation process when modal opens with a prompt
    useEffect(() => {
        if (isOpen && prompt && !resultImage) {
            startSimulation();
        }
    }, [isOpen, prompt]);

    const startSimulation = async () => {
        setGenerating(true);
        try {
            // Call our new backend endpoint which uses Pollinations.ai
            const response = await fetch('/api/ai/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await response.json();

            if (data.imageUrl) {
                setResultImage(data.imageUrl);
            } else {
                setResultImage('/images/magic-shoot-result.png'); // Fallback
            }
        } catch (error) {
            console.error("Generation failed", error);
            setResultImage('/images/magic-shoot-result.png'); // Fallback
        }
        setGenerating(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col shadow-2xl relative">
                    {/* Header */}
                    <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg text-white">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl text-gray-800">Magic Photoshoot</h2>
                                <p className="text-xs text-gray-500">AI-Powered Editorial Generation</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left: Inputs & Prompt */}
                        <div className="w-1/3 p-6 border-r bg-gray-50 overflow-y-auto">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Wand2 size={16} /> AI Directive
                            </h3>

                            {/* Input Preview */}
                            {originalImage && (
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Source</label>
                                    <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-white">
                                        <img src={originalImage} alt="Input" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                                <p className="text-sm text-gray-600 italic leading-relaxed">
                                    "{prompt}"
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Style</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {['Editorial', 'Cinematic', 'Luxury', '8k'].map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Result */}
                        <div className="w-2/3 bg-gray-900 relative flex items-center justify-center">
                            {generating ? (
                                <div className="text-center">
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-4 border-purple-500/30 rounded-full"
                                        />
                                        <motion.div
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-2 border-4 border-pink-500/30 rounded-full"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center text-white">
                                            <Sparkles className="animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-white font-bold text-xl mb-2">Dreaming up your shot...</h3>
                                    <p className="text-gray-400 text-sm">Applying shadows, lighting, and textures</p>
                                </div>
                            ) : resultImage ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative w-full h-full p-8 flex flex-col items-center justify-center"
                                >
                                    <img
                                        src={resultImage}
                                        alt="Magic Result"
                                        className="max-h-[80%] max-w-full rounded-lg shadow-2xl object-contain mb-6 border border-gray-700"
                                    />

                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                                            <Download size={18} /> Download HD
                                        </button>
                                        <button className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-bold hover:bg-white/20 transition-colors backdrop-blur-sm">
                                            <Share2 size={18} /> Share
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-gray-500">Waiting for prompt...</div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MagicShootModal;
