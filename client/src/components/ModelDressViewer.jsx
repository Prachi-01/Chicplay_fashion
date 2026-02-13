import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ModelDressViewer = ({ dresses = [], modelImage = '/assets/mannequin.jpg' }) => {
    const [selectedDressIndex, setSelectedDressIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiResultImage, setAiResultImage] = useState(null);

    const currentDress = dresses[selectedDressIndex];

    const nextDress = () => {
        setSelectedDressIndex((prev) => (prev + 1) % dresses.length);
    };

    const prevDress = () => {
        setSelectedDressIndex((prev) => (prev - 1 + dresses.length) % dresses.length);
        setAiResultImage(null);
    };

    const handleAiTryOn = async () => {
        if (!currentDress) return;
        setIsAiGenerating(true);
        try {
            // Get base64 of model image
            const modelRes = await fetch(modelImage);
            const modelBlob = await modelRes.blob();
            const modelBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(modelBlob);
            });

            // Get base64 of dress
            const dressRes = await fetch(currentDress.images[0]);
            const dressBlob = await dressRes.blob();
            const dressBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(dressBlob);
            });

            const response = await axios.post('/api/ai/virtual-try-on', {
                personImage: modelBase64,
                dressImage: dressBase64,
                prompt: `The model is wearing a ${currentDress.name}. High fashion photography, realistic fabric textures.`
            });

            if (response.data.imageUrl) {
                setAiResultImage(response.data.imageUrl);
            }
        } catch (error) {
            console.error("AI Try-On Failed:", error);
        } finally {
            setIsAiGenerating(false);
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Main Model View */}
            <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 rounded-3xl overflow-hidden shadow-2xl">

                {/* Base Model Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={modelImage}
                        alt="Model"
                        className="h-full w-auto object-contain opacity-90"
                        style={{ filter: 'brightness(1.05) contrast(1.05)' }}
                    />
                </div>

                {/* AI Result View */}
                <AnimatePresence>
                    {(aiResultImage || isAiGenerating) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 bg-white flex items-center justify-center"
                        >
                            {isAiGenerating ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-4 border-rosegold border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-bold text-gray-500">AI Styling...</span>
                                </div>
                            ) : (
                                <div className="relative w-full h-full">
                                    <img src={aiResultImage} alt="AI Result" className="w-full h-full object-contain" />
                                    <button
                                        onClick={() => setAiResultImage(null)}
                                        className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow-lg hover:scale-110 transition-all"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dress Overlay (Manual - hidden if AI result exists) */}
                <AnimatePresence mode="wait">
                    {currentDress && !aiResultImage && !isAiGenerating && (
                        <motion.div
                            key={selectedDressIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <img
                                src={currentDress.images[0]}
                                alt={currentDress.name}
                                className="h-full w-auto object-contain mix-blend-multiply"
                                style={{
                                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))',
                                    maxWidth: '80%'
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Controls */}
                {dresses.length > 1 && (
                    <>
                        <button
                            onClick={prevDress}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all"
                        >
                            <ChevronLeft size={24} className="text-gray-700" />
                        </button>

                        <button
                            onClick={nextDress}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all"
                        >
                            <ChevronRight size={24} className="text-gray-700" />
                        </button>
                    </>
                )}

                {/* Fullscreen Button */}
                <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-all"
                >
                    <Maximize2 size={20} className="text-gray-700" />
                </button>

                {/* Dress Info Overlay */}
                {currentDress && (
                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-xl text-gray-900">{currentDress.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{currentDress.description?.slice(0, 80)}...</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-rosegold">${currentDress.price}</div>
                                <div className="text-xs text-gray-400 mt-1">{selectedDressIndex + 1} / {dresses.length}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Try-On Toggle */}
                <button
                    onClick={handleAiTryOn}
                    disabled={isAiGenerating}
                    className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:bg-white transition-all flex items-center gap-2 font-bold text-xs"
                    style={{ zIndex: 30 }}
                >
                    <Sparkles size={16} className={isAiGenerating ? 'animate-spin' : 'text-rosegold'} />
                    {isAiGenerating ? 'Generating...' : 'AI Version'}
                </button>
            </div>

            {/* Thumbnail Gallery */}
            <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
                {dresses.map((dress, index) => (
                    <button
                        key={dress._id || index}
                        onClick={() => setSelectedDressIndex(index)}
                        className={`flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden border-2 transition-all ${index === selectedDressIndex
                            ? 'border-rosegold shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <img
                            src={dress.images[0]}
                            alt={dress.name}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && currentDress && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all"
                        >
                            <X size={24} className="text-white" />
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={modelImage}
                                alt="Model"
                                className="h-full w-auto object-contain opacity-80"
                            />
                            <img
                                src={currentDress.images[0]}
                                alt={currentDress.name}
                                className="absolute h-full w-auto object-contain mix-blend-screen"
                                style={{ filter: 'drop-shadow(0 20px 50px rgba(255,255,255,0.2))' }}
                            />
                        </div>

                        {/* Fullscreen Navigation */}
                        {dresses.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevDress(); }}
                                    className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-4 rounded-full hover:bg-white/30 transition-all"
                                >
                                    <ChevronLeft size={32} className="text-white" />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); nextDress(); }}
                                    className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-4 rounded-full hover:bg-white/30 transition-all"
                                >
                                    <ChevronRight size={32} className="text-white" />
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModelDressViewer;
