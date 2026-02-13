import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ZoomIn, ZoomOut, Move,
    User, Palette, Camera, Download,
    X, Check, Heart, ShoppingBag,
    Sparkles, RefreshCw, Sliders, Maximize2,
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Users
} from 'lucide-react';
import './VirtualModel.css';

// Image Processor for Background Removal (Advanced)
const TransparentImage = ({ src, alt, className, style, forceProcess = false, onLoad, onAnalysis }) => {
    const [processedSrc, setProcessedSrc] = useState(src);

    useEffect(() => {
        if (!src) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Analysis variables
            let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
            let hasVisiblePixels = false;

            // Simple transparency check logic for external images if needed
            // let isTransparent = false; // Unused for now

            // Calculate average corner color for background removal
            const corners = [
                0, canvas.width - 1,
                (canvas.height - 1) * canvas.width,
                (canvas.height * canvas.width) - 1
            ];

            let bgR = 0, bgG = 0, bgB = 0;
            let cornerCount = 0;

            for (let c of corners) {
                const i = c * 4;
                if (data[i + 3] > 0) {
                    bgR += data[i]; bgG += data[i + 1]; bgB += data[i + 2];
                    cornerCount++;
                }
            }
            if (cornerCount > 0) {
                bgR /= cornerCount; bgG /= cornerCount; bgB /= cornerCount;
            }

            for (let i = 0; i < data.length; i += 4) {
                // Check visibility/transparency bounds
                if (data[i + 3] > 20) {
                    const x = (i / 4) % canvas.width;
                    const y = Math.floor((i / 4) / canvas.width);
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    hasVisiblePixels = true;
                }

                // Background removal if forced or needed (simplified for brevity, main focus is analysis)
                if ((forceProcess || src.startsWith('/products')) && data[i + 3] > 0) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

                    if (dist < 30) {
                        data[i + 3] = 0; // Remove background
                    } else if (Math.max(r, g, b) > 240 && dist < 60) {
                        data[i + 3] = 0; // Remove whites
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);
            setProcessedSrc(canvas.toDataURL());

            if (onLoad) onLoad();

            // Send analysis data
            if (onAnalysis && hasVisiblePixels) {
                onAnalysis({
                    minX, maxX, minY, maxY,
                    width: maxX - minX,
                    height: maxY - minY,
                    originalWidth: canvas.width,
                    originalHeight: canvas.height
                });
            }
        };

        img.onerror = () => {
            setProcessedSrc(src);
            if (onLoad) onLoad();
        };

    }, [src, forceProcess, onLoad, onAnalysis]);

    return (
        <img
            src={processedSrc}
            alt={alt}
            className={className}
            style={style}
            draggable={false}
        />
    );
};

// Dress overlay library with clean local assets
const DRESS_LIBRARY = [
    {
        id: 7,
        name: 'Purple Ball Gown',
        thumbnail: '/products/purple_ball_gown.png',
        overlay: '/products/purple_ball_gown.png',
        category: 'Glamour',
        color: '#9B59B6',
        position: { top: 12, left: 50 },
        scale: 1.15,
        status: 'approved'
    },
    {
        id: 1,
        name: 'Red Silk Gown',
        thumbnail: '/products/straight_red_gown.png',
        overlay: '/products/straight_red_gown.png',
        category: 'Evening',
        color: '#C0392B',
        position: { top: 15, left: 50 },
        scale: 1.05,
        status: 'approved'
    },
    {
        id: 2,
        name: 'Navy Sheath',
        thumbnail: '/products/straight_navy_dress.png',
        overlay: '/products/straight_navy_dress.png',
        category: 'Work',
        color: '#2C3E50',
        position: { top: 20, left: 50 },
        scale: 0.9,
        status: 'approved'
    },
    {
        id: 3,
        name: 'Floral Chiffon',
        thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=280&fit=crop',
        overlay: '/images/virtual-tryon/dress-casual-sundress.png',
        category: 'Summer',
        color: '#E6E6FA',
        position: { top: 18, left: 50 },
        scale: 0.95,
        status: 'approved'
    },
    {
        id: 4,
        name: 'Elegant Maxi',
        thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=280&fit=crop',
        overlay: '/images/virtual-tryon/dress-elegant-maxi.png',
        category: 'Evening',
        color: '#9B59B6',
        position: { top: 15, left: 50 },
        scale: 1.0,
        status: 'approved'
    },
    {
        id: 5,
        name: 'White Column',
        thumbnail: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=280&fit=crop',
        overlay: '/images/virtual-tryon/dress-elegant-maxi.png',
        category: 'Elegant',
        color: '#FFFFFF',
        position: { top: 18, left: 50 },
        scale: 0.92,
        status: 'approved'
    },
    {
        id: 6,
        name: 'Pink Lace Flare',
        thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=280&fit=crop',
        overlay: '/products/blush_dress.png',
        category: 'Romantic',
        color: '#FFB7C5',
        position: { top: 18, left: 50 },
        scale: 0.95,
        status: 'approved'
    }
];

// Body type configurations
const BODY_TYPES = [
    { id: 'petite', label: 'Petite', modelScale: 0.9, dressScale: 0.88, offsetY: -2 },
    { id: 'average', label: 'Average', modelScale: 1.0, dressScale: 1.0, offsetY: 0 },
    { id: 'tall', label: 'Tall', modelScale: 1.1, dressScale: 1.08, offsetY: 2 },
    { id: 'curvy', label: 'Curvy', modelScale: 1.0, dressScale: 1.05, offsetY: 0.5 }
];

// Pose configurations (IDs only, src constructed dynamically)
const POSES = [
    { id: 'front', label: 'Front View' },
    { id: 'side', label: 'Side Profile' },
    { id: 'walking', label: 'Walking' },
    { id: 'back', label: 'Back View' }
];

// Available Models
const MODELS = [
    { id: 'model1', name: 'Bella (Standard)' },
    { id: 'model2', name: 'Sofia (Curvy)' },
    { id: 'model3', name: 'Luna (Petite)' }
];

const VirtualModel = ({ onClose, look, archetype }) => {
    const containerRef = useRef();
    const [bodyType, setBodyType] = useState('average');
    const [selectedPose, setSelectedPose] = useState(POSES[0]);
    const [selectedModel, setSelectedModel] = useState(MODELS[0]);
    const [customModelImage, setCustomModelImage] = useState(null);

    // AI Virtual Try-On State
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiResultImage, setAiResultImage] = useState(null);
    const [showAiResultModal, setShowAiResultModal] = useState(false);
    const [aiRequestId, setAiRequestId] = useState(null);

    // Webcam State
    const [showWebcam, setShowWebcam] = useState(false);

    // Helper to get dynamic model image source
    const getModelImageSrc = () => {
        if (customModelImage) return customModelImage;
        // Construct path: /images/virtual-tryon/model-{id}-{pose}.png
        // Mapping legacy "model-base" to "model1-front" effectively
        if (selectedModel.id === 'model1' && selectedPose.id === 'front') return '/images/virtual-tryon/model-base.png';
        if (selectedModel.id === 'model1' && selectedPose.id === 'side') return '/images/virtual-tryon/model-side.png';
        if (selectedModel.id === 'model1' && selectedPose.id === 'walking') return '/images/virtual-tryon/model-walking.png';
        if (selectedModel.id === 'model1' && selectedPose.id === 'back') return '/images/virtual-tryon/model-back.png';

        // For other models, assume standard naming convention
        return `/images/virtual-tryon/${selectedModel.id}-${selectedPose.id}.png`;
    };

    // Initialize dress from passed 'look' or default
    const [selectedDress, setSelectedDress] = useState(() => {
        if (look && look.items) {
            // Find the dress/gown/main item in the look
            const dressItem = look.items.find(i => ['Dress', 'Gown', 'Outerwear', 'Top'].includes(i.category));
            if (dressItem && dressItem.overlay) {
                return {
                    id: dressItem.id,
                    name: dressItem.name,
                    thumbnail: look.image,
                    overlay: dressItem.overlay,
                    category: archetype || 'Custom',
                    price: dressItem.price,
                    position: { top: 18, left: 50 }, // AI will auto-correct this
                    scale: 1.0
                };
            }
        }
        return DRESS_LIBRARY[0];
    });

    const [showDressPanel, setShowDressPanel] = useState(true);
    const [showControlPanel, setShowControlPanel] = useState(true);
    const [showAdjustControls, setShowAdjustControls] = useState(false);

    // Dress overlay adjustments
    const [dressPosition, setDressPosition] = useState({ top: 18, left: 50 });
    const [dressScale, setDressScale] = useState(0.85);
    const [dressOpacity, setDressOpacity] = useState(1);
    const [blendMode, setBlendMode] = useState('normal');

    // Image loading state
    const [modelLoaded, setModelLoaded] = useState(false);
    const [dressLoaded, setDressLoaded] = useState(false);

    // Drag handling refs
    const draggedRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0, top: 0, left: 0 });
    const latestPosRef = useRef(dressPosition);

    // ESC key handler
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Body type adjustment
    const bodyTypeConfig = BODY_TYPES.find(b => b.id === bodyType) || BODY_TYPES[1];

    // Update dress position when selecting a new dress or body type
    useEffect(() => {
        if (selectedDress) {
            // Apply body type offset to initial position as a baseline
            // Actual auto-fit will happen once the image loads and is analyzed
            setDressPosition({
                top: selectedDress.position.top + (bodyTypeConfig.offsetY || 0),
                left: selectedDress.position.left
            });
            setDressScale(selectedDress.scale);
            setDressLoaded(false);
        }
    }, [selectedDress, bodyType]);

    // AI Virtual Try-On Function
    const handleAiTryOn = async () => {
        if (!selectedDress) return;
        setIsAiGenerating(true);
        setAiResultImage(null);
        try {
            console.log('✨ Initiating AI Virtual Try-On...');

            // Get base64 of model image
            const modelSrc = customModelImage || getModelImageSrc();
            const modelRes = await fetch(modelSrc);
            const modelBlob = await modelRes.blob();
            const modelBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(modelBlob);
            });

            // Get base64 of dress overlay (the "manual thing" image)
            const dressRes = await fetch(selectedDress.overlay);
            const dressBlob = await dressRes.blob();
            const dressBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(dressBlob);
            });

            const response = await axios.post('/api/ai/virtual-try-on', {
                personImage: modelBase64,
                dressImage: dressBase64,
                prompt: `A high-fashion photoshoot. The model has a ${bodyType} body type and is in a ${selectedPose.label}. The dress should fit perfectly and look realistic with natural folds and shadows.`
            });

            if (response.data.imageUrl) {
                setAiResultImage(response.data.imageUrl);
                setAiRequestId(response.data.requestId);
                setShowAiResultModal(true); // Automatically show the result in place of the viewer
                console.log('✅ AI Realistic Vision Fetched:', response.data.imageUrl);
            }
        } catch (error) {
            console.error("❌ AI Try-On Failed:", error);
            const msg = error.response?.data?.message || "AI Reality Engine is temporarily offline.";
            alert(`AI Error: ${msg}`);
        } finally {
            setIsAiGenerating(false);
        }
    };

    // Update latestPosRef whenever dressPosition changes
    useEffect(() => {
        latestPosRef.current = dressPosition;
    }, [dressPosition]);

    // Auto-Fit Function (Updated with AI)
    const handleDressAnalysis = useCallback(async (metrics) => {
        // We keep this for now as a basic placeholder, but the real power is the FAL AI
    }, [selectedDress, bodyType]);

    // Drag Handlers
    const handleDragMove = useCallback((e) => {
        if (!draggedRef.current || !containerRef.current) return;

        const modelContainer = containerRef.current.querySelector('.vm-model-container');
        if (!modelContainer) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const { width, height } = modelContainer.getBoundingClientRect();
        if (width === 0 || height === 0) return;

        const deltaX = clientX - dragStartRef.current.x;
        const deltaY = clientY - dragStartRef.current.y;

        const deltaLeft = (deltaX / width) * 100;
        const deltaTop = (deltaY / height) * 100;

        const newPos = {
            left: Math.min(100, Math.max(0, dragStartRef.current.left + deltaLeft)),
            top: Math.min(100, Math.max(0, dragStartRef.current.top + deltaTop))
        };

        setDressPosition(newPos);
    }, []);

    const handleDragEnd = useCallback(() => {
        draggedRef.current = false;

        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('pointermove', handleDragMove);
        window.removeEventListener('pointerup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
    }, [handleDragMove]);

    const handleDragStart = (e) => {
        if (e.button !== undefined && e.button !== 0) return;

        e.preventDefault();
        draggedRef.current = true;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        dragStartRef.current = {
            x: clientX,
            y: clientY,
            top: dressPosition.top,
            left: dressPosition.left
        };

        window.addEventListener('mousemove', handleDragMove, { passive: false });
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('pointermove', handleDragMove, { passive: false });
        window.addEventListener('pointerup', handleDragEnd);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
    };

    // Fine-tune dress position
    const adjustPosition = (direction, amount = 2) => {
        setDressPosition(prev => {
            switch (direction) {
                case 'up': return { ...prev, top: Math.max(0, prev.top - amount) };
                case 'down': return { ...prev, top: Math.min(80, prev.top + amount) };
                case 'left': return { ...prev, left: Math.max(0, prev.left - amount) };
                case 'right': return { ...prev, left: Math.min(100, prev.left + amount) };
                default: return prev;
            }
        });
    };

    const captureScreenshot = useCallback(() => {
        if (containerRef.current) {
            import('html2canvas').then(({ default: html2canvas }) => {
                const tryOnArea = containerRef.current.querySelector('.vm-tryon-area');
                if (tryOnArea) {
                    html2canvas(tryOnArea, {
                        backgroundColor: null,
                        useCORS: true,
                        scale: 2
                    }).then(canvas => {
                        const link = document.createElement('a');
                        link.download = `virtual-tryon-${Date.now()}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    });
                }
            });
        }
    }, []);

    const resetAdjustments = () => {
        if (selectedDress) {
            setDressPosition({
                top: selectedDress.position.top + bodyTypeConfig.offsetY,
                left: selectedDress.position.left
            });
            setDressScale(selectedDress.scale);
            setDressOpacity(1);
            setBlendMode('normal');
        }
    };

    return (
        <div className="vm-fullframe" ref={containerRef}>
            {/* ========== MAIN TRY-ON AREA ========== */}
            <div className="vm-tryon-area">
                {(!modelLoaded || !dressLoaded) && (
                    <div className="vm-loading">
                        <div className="vm-loading-spinner"></div>
                        <span>Loading try-on...</span>
                    </div>
                )}

                {/* Base Model Image or Webcam */}
                <div
                    className="vm-model-container"
                    style={{
                        transform: `scale(${bodyTypeConfig.modelScale})`
                    }}
                >
                    {showWebcam ? (
                        <Webcam
                            audio={false}
                            className="vm-model-image"
                            style={{ objectFit: 'cover', transform: 'scaleX(-1)' }} // Mirror effect
                            onUserMedia={() => setModelLoaded(true)}
                        />
                    ) : (
                        <img
                            src={getModelImageSrc()}
                            alt="Virtual Model"
                            className="vm-model-image"
                            onLoad={() => setModelLoaded(true)}
                            draggable={false}
                            onError={(e) => {
                                if (!customModelImage) {
                                    e.target.src = '/images/virtual-tryon/model-base.png'; // Fallback
                                }
                            }}
                        />
                    )}

                    {/* Dress Overlay Matte (Hides body under dress when Multiplying) */}
                    {/* ... (Matte logic unchanged) ... */}
                </div>

                {/* Dress Overlay (Matte for Multiply Mode) */}
                {selectedDress && blendMode === 'multiply' && (
                    <motion.div
                        className="vm-dress-overlay-matte"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: dressScale * bodyTypeConfig.dressScale
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                            top: `${dressPosition.top}%`,
                            left: `${dressPosition.left}%`,
                            mixBlendMode: 'normal',
                            pointerEvents: 'none',
                            zIndex: 10,
                            position: 'absolute',
                            width: '100%',
                            filter: 'brightness(0) invert(1)'
                        }}
                    >
                        <TransparentImage
                            src={selectedDress.overlay}
                            forceProcess={true}
                            className="vm-dress-image"
                            draggable={false}
                            style={{ width: '100%' }}
                        />
                    </motion.div>
                )}

                {/* AI Realistic Result Layer (Full Frame "Photoshoot" Feel) */}
                <AnimatePresence>
                    {showAiResultModal && aiResultImage && (
                        <motion.div
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8"
                        >
                            <div className="relative w-full h-full flex flex-col items-center justify-center">
                                <img
                                    src={aiResultImage}
                                    alt="AI Realistic Vision"
                                    className="h-full w-full object-contain rounded-2xl shadow-[0_0_100px_rgba(168,85,247,0.3)] transition-all duration-700"
                                />

                                <div className="absolute top-8 left-8 flex flex-col gap-2">
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                                        <Sparkles className="text-purple-400" size={32} />
                                        REALISTIC VISION
                                    </h3>
                                    <p className="text-white/50 text-xs font-bold uppercase tracking-[0.3em]">AI Generated Ensemble • Fal.ai Studio</p>
                                </div>

                                <div className="absolute bottom-8 flex gap-4">
                                    <button
                                        onClick={() => setShowAiResultModal(false)}
                                        className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                                    >
                                        <RefreshCw size={20} /> Back to Edit
                                    </button>
                                    {aiResultImage && (
                                        <a
                                            href={aiResultImage}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                                        >
                                            <Maximize2 size={20} /> Inspect Result
                                        </a>
                                    )}
                                    <button
                                        onClick={captureScreenshot}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        <Download size={20} /> High-Res Export
                                    </button>
                                </div>

                                {aiRequestId && (
                                    <div className="absolute top-8 right-8 text-[10px] text-white/20 font-mono">
                                        REF: {aiRequestId}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dress Overlay Container for Dragging (Manual Thing - we hide it if AI is active) */}
                {selectedDress && !aiResultImage && !isAiGenerating && (
                    <div
                        className="vm-manual-overlay-container"
                        style={{
                            position: 'absolute',
                            top: `${dressPosition.top}%`,
                            left: `${dressPosition.left}%`,
                            zIndex: 50,
                            cursor: 'move',
                            touchAction: 'none',
                            userSelect: 'none',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                    >
                        <motion.div
                            className="vm-dress-overlay"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: dressOpacity,
                                scale: dressScale * bodyTypeConfig.dressScale
                            }}
                            transition={{ duration: 0.3 }}
                            style={{
                                position: 'relative',
                                top: 0,
                                left: 0,
                                mixBlendMode: blendMode,
                                pointerEvents: 'none'
                            }}
                        >
                            <TransparentImage
                                src={selectedDress.overlay}
                                forceProcess={true}
                                alt={selectedDress.name}
                                className="vm-dress-image"
                                onLoad={() => setDressLoaded(true)}
                                draggable={false}
                                onAnalysis={handleDressAnalysis}
                            />
                        </motion.div>
                    </div>
                )}

                <div className="vm-shadow-effect"></div>
            </div>

            {/* ========== LEFT CONTROL PANEL ========== */}
            <AnimatePresence>
                {showControlPanel && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -500, opacity: 0 }}
                        className="vm-control-panel-left"
                    >
                        <div className="vm-panel-header">
                            <h3>Model Settings</h3>
                        </div>

                        <div className="vm-panel-section">
                            <h4><Users size={14} /> Select Model</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {MODELS.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedModel(m)}
                                        className={`vm-body-type-btn ${selectedModel.id === m.id ? 'active' : ''}`}
                                        style={{ textAlign: 'left', paddingLeft: '1rem' }}
                                    >
                                        <span className="font-bold">{m.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="vm-panel-section">
                            <h4><User size={14} /> Body Type</h4>
                            <div className="vm-body-type-list">
                                {BODY_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setBodyType(type.id)}
                                        className={`vm-body-type-btn ${bodyType === type.id ? 'active' : ''}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="vm-panel-section">
                            <h4><Camera size={14} /> Model Pose</h4>
                            {/* Custom Upload */}
                            <div className="mb-3">
                                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors w-full">
                                    <Camera size={16} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500">Upload Your Photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    setCustomModelImage(e.target.result);
                                                    setSelectedPose({ id: 'custom', label: 'Custom' });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                                {customModelImage && (
                                    <button
                                        onClick={() => { setCustomModelImage(null); setSelectedPose(POSES[0]); }}
                                        className="text-[10px] text-red-500 font-bold mt-1 w-full text-center hover:underline"
                                    >
                                        Remove Custom Photo
                                    </button>
                                )}
                            </div>

                            {!customModelImage && (
                                <div className="grid grid-cols-2 gap-2">
                                    {POSES.map(pose => (
                                        <button
                                            key={pose.id}
                                            onClick={() => setSelectedPose(pose)}
                                            className={`vm-body-type-btn ${selectedPose.id === pose.id ? 'active' : ''}`}
                                            style={{ fontSize: '10px' }}
                                        >
                                            {pose.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t">
                                <button
                                    onClick={() => setShowWebcam(!showWebcam)}
                                    className={`w-full py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${showWebcam
                                        ? 'bg-red-500 text-white shadow-lg'
                                        : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {showWebcam ? <X size={16} /> : <Camera size={16} />}
                                    {showWebcam ? 'Stop Camera' : 'Use Live Camera'}
                                </button>
                                {showWebcam && (
                                    <p className="text-[10px] text-gray-500 text-center mt-2">
                                        Stand back for best fit. Dress will overlay on camera feed.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="vm-panel-section">
                            <h4><Sliders size={14} /> Quick Adjust</h4>
                            <div className="vm-quick-adjust">
                                <button className="vm-quick-btn" onClick={() => setDressScale(s => Math.max(0.3, s - 0.1))}><ZoomOut size={14} /> Smaller</button>
                                <button className="vm-quick-btn" onClick={() => setDressScale(s => Math.min(1.5, s + 0.1))}><ZoomIn size={14} /> Larger</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== FLOATING CLOSE BUTTON ========== */}
            <button onClick={onClose} className="vm-float-close" title="Close (ESC)">
                <X size={24} />
            </button>

            {/* ========== FLOATING TOP CONTROLS ========== */}
            <div className="vm-float-top-controls">
                <button
                    onClick={handleAiTryOn}
                    className={`vm-float-btn ${isAiGenerating ? 'animating' : ''}`}
                    title="Generate Realistic AI Try-On"
                >
                    <Sparkles size={20} className={isAiGenerating ? "animate-spin text-purple-500" : "text-rosegold"} />
                </button>
                <button
                    onClick={() => setShowAdjustControls(!showAdjustControls)}
                    className={`vm-float-btn ${showAdjustControls ? 'active' : ''}`}
                    title="Fine-tune Position"
                >
                    <Move size={20} />
                </button>
                <button
                    onClick={captureScreenshot}
                    className="vm-float-btn"
                    title="Screenshot"
                >
                    <Camera size={20} />
                </button>
                <button
                    onClick={resetAdjustments}
                    className="vm-float-btn"
                    title="Reset Adjustments"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* ========== ADJUSTMENT CONTROLS ========== */}
            <AnimatePresence>
                {showAdjustControls && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="vm-adjust-controls"
                    >
                        <div className="vm-adjust-section">
                            <span className="vm-adjust-label">Position</span>
                            <div className="vm-position-pad">
                                <button onClick={() => adjustPosition('up')} className="vm-pos-btn up"><ChevronUp size={16} /></button>
                                <div className="vm-pos-middle">
                                    <button onClick={() => adjustPosition('left')} className="vm-pos-btn left"><ChevronLeft size={16} /></button>
                                    <div className="vm-pos-center"></div>
                                    <button onClick={() => adjustPosition('right')} className="vm-pos-btn right"><ChevronRight size={16} /></button>
                                </div>
                                <button onClick={() => adjustPosition('down')} className="vm-pos-btn down"><ChevronDown size={16} /></button>
                            </div>
                        </div>

                        <div className="vm-adjust-section">
                            <span className="vm-adjust-label">Size</span>
                            <div className="vm-scale-controls">
                                <button onClick={() => setDressScale(s => Math.max(0.3, s - 0.05))} className="vm-scale-btn"><ZoomOut size={16} /></button>
                                <span className="vm-scale-value">{Math.round(dressScale * 100)}%</span>
                                <button onClick={() => setDressScale(s => Math.min(1.5, s + 0.05))} className="vm-scale-btn"><ZoomIn size={16} /></button>
                            </div>
                        </div>

                        <div className="vm-adjust-section">
                            <span className="vm-adjust-label">Opacity</span>
                            <input
                                type="range"
                                min="0.3" max="1" step="0.05"
                                value={dressOpacity}
                                onChange={(e) => setDressOpacity(parseFloat(e.target.value))}
                                className="vm-opacity-slider"
                            />
                        </div>

                        <div className="vm-adjust-section">
                            <span className="vm-adjust-label">Blend</span>
                            <select
                                value={blendMode}
                                onChange={(e) => setBlendMode(e.target.value)}
                                className="vm-blend-select"
                            >
                                <option value="normal">Normal</option>
                                <option value="multiply">Multiply</option>
                                <option value="overlay">Overlay</option>
                            </select>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* ========== FLOATING DRESS SELECTOR ========== */}
            <AnimatePresence>
                {showDressPanel && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        className="vm-float-right-panel"
                    >
                        <div className="vm-panel-header">
                            <h3><Sparkles size={16} /> Dress Library</h3>
                        </div>
                        <div className="vm-dress-scroll">
                            {/* Upload Button */}
                            <label className="vm-dress-card-float upload-btn cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-50 flex flex-col items-center justify-center gap-2 p-2">
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <Camera size={20} className="text-gray-500" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 text-center leading-tight">Upload<br />Dress</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                const newDress = {
                                                    id: `custom_${Date.now()}`,
                                                    name: "Custom Dress",
                                                    category: "Upload",
                                                    price: 0,
                                                    thumbnail: ev.target.result,
                                                    overlay: ev.target.result
                                                };
                                                // For now, allow selecting it immediately.
                                                // Ideally, we'd add it to a list, but setting it as selected works for immediate try-on.
                                                setSelectedDress(newDress);
                                                // Reset file input value to allow re-uploading same file if needed
                                                e.target.value = null;
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>

                            {DRESS_LIBRARY.map(dress => (
                                <motion.button
                                    key={dress.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSelectedDress(dress)}
                                    className={`vm-dress-card-float ${selectedDress?.id === dress.id ? 'selected' : ''}`}
                                >
                                    <img src={dress.thumbnail} alt={dress.name} />
                                    <div className="vm-dress-info">
                                        <span className="vm-dress-name">{dress.name}</span>
                                        <span className="vm-dress-cat">{dress.category}</span>
                                    </div>
                                    {selectedDress?.id === dress.id && <div className="vm-dress-check"><Check size={14} /></div>}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== FLOATING BOTTOM ACTIONS ========== */}
            <div className="vm-float-bottom">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="vm-action-primary"><ShoppingBag size={20} /> Add to Cart</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="vm-action-secondary"><Heart size={20} /> Save Look</motion.button>
                <div style={{ position: 'relative' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAiTryOn}
                        disabled={isAiGenerating}
                        className={`vm-action-magic bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white px-8 py-4 rounded-full font-black shadow-[0_10px_40px_rgba(168,85,247,0.4)] flex items-center gap-3 transition-all ${isAiGenerating ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-[0_15px_50px_rgba(168,85,247,0.6)] hover:-translate-y-1'}`}
                        style={{ border: 'none' }}
                    >
                        <Sparkles className={isAiGenerating ? 'animate-spin' : 'animate-pulse'} size={24} />
                        {isAiGenerating ? 'Generating Reality...' : 'Realistic AI Try-On'}
                    </motion.button>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={captureScreenshot} className="vm-action-tertiary"><Download size={20} /> Download</motion.button>
            </div>

            {/* ========== CURRENT DRESS INDICATOR ========== */}
            {selectedDress && (
                <div className="vm-current-dress-indicator">
                    <img src={selectedDress.thumbnail} alt={selectedDress.name} />
                    <div>
                        <span className="vm-cdi-name">{selectedDress.name}</span>
                        <span className="vm-cdi-cat">{selectedDress.category}</span>
                    </div>
                </div>
            )}

            {/* ========== TOGGLE PANELS ========== */}
            <div className="vm-panel-toggles">
                <button onClick={() => setShowControlPanel(!showControlPanel)} className={`vm-toggle-btn ${showControlPanel ? 'active' : ''}`} title="Body Controls"><User size={18} /></button>
                <button onClick={() => setShowDressPanel(!showDressPanel)} className={`vm-toggle-btn ${showDressPanel ? 'active' : ''}`} title="Dress Library"><Sparkles size={18} /></button>
            </div>

            <div className="vm-instructions">
                <span>💡 Tip: Click & Drag dress to position perfectly!</span>
            </div>
        </div>
    );
};

export default VirtualModel;
