import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';
import {
    Camera, Video, VideoOff,
    Download, X, Check, Sparkles,
    Wand2, FlipHorizontal, Save,
    Loader2, AlertCircle, Upload
} from 'lucide-react';
import './AugmentedReality.css';

// Dress overlay configurations
const DRESS_OVERLAYS = [
    { id: 1, name: 'Elegant Evening', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=450&fit=crop', category: 'Evening' },
    { id: 2, name: 'Casual Sundress', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=450&fit=crop', category: 'Casual' },
    { id: 3, name: 'Work Chic', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=300&h=450&fit=crop', category: 'Work' },
    { id: 4, name: 'Boho Vibes', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=450&fit=crop', category: 'Boho' },
    { id: 5, name: 'Party Glam', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&h=450&fit=crop', category: 'Party' },
    { id: 6, name: 'Summer Fresh', image: 'https://images.unsplash.com/photo-1518622358385-8ea7d346b08d?w=300&h=450&fit=crop', category: 'Summer' }
];

// MediaPipe Pose landmark indices
const POSE_LANDMARKS = {
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_HIP: 23,
    RIGHT_HIP: 24
};

const AugmentedReality = ({ onClose, look, archetype }) => {
    // States
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraFacing, setCameraFacing] = useState('user');
    const [isLoading, setIsLoading] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [bodyLandmarks, setBodyLandmarks] = useState(null);
    const [isPoseReady, setIsPoseReady] = useState(false);
    const [selectedDress, setSelectedDress] = useState(DRESS_OVERLAYS[0]);
    const [showDressOverlay, setShowDressOverlay] = useState(true);
    const [dressOpacity, setDressOpacity] = useState(0.85);
    const [dressScale, setDressScale] = useState(1.0);
    const [captureFlash, setCaptureFlash] = useState(false);
    const [showDressPanel, setShowDressPanel] = useState(true);

    // Refs
    const webcamRef = useRef(null);
    const poseRef = useRef(null);
    const animationFrameRef = useRef(null);
    const containerRef = useRef(null);

    // ESC key handler
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Initialize MediaPipe Pose
    useEffect(() => {
        let mounted = true;

        const initPose = async () => {
            try {
                setIsLoading(true);
                const { Pose } = await import('@mediapipe/pose');

                if (!mounted) return;

                const pose = new Pose({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
                });

                pose.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                pose.onResults((results) => {
                    if (results.poseLandmarks) {
                        setBodyLandmarks(results.poseLandmarks);
                    }
                });

                poseRef.current = pose;
                setIsPoseReady(true);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to initialize MediaPipe Pose:', error);
                setIsLoading(false);
            }
        };

        initPose();
        return () => {
            mounted = false;
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    // Pose detection loop
    const detectPose = useCallback(async () => {
        if (!poseRef.current || !webcamRef.current?.video) return;
        const video = webcamRef.current.video;
        if (video.readyState === 4) {
            try {
                await poseRef.current.send({ image: video });
            } catch (err) { }
        }
        animationFrameRef.current = requestAnimationFrame(detectPose);
    }, []);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            setIsLoading(true);
            await navigator.mediaDevices.getUserMedia({
                video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setHasPermission(true);
            setIsCameraOn(true);
            setCapturedImage(null);
            setIsLoading(false);
        } catch (err) {
            setHasPermission(false);
            setIsLoading(false);
        }
    }, [cameraFacing]);

    // Start pose detection when camera is on
    useEffect(() => {
        if (isCameraOn && isPoseReady) {
            const timeout = setTimeout(detectPose, 500);
            return () => clearTimeout(timeout);
        }
    }, [isCameraOn, isPoseReady, detectPose]);

    // Calculate dress overlay position based on landmarks
    const dressOverlayStyle = useMemo(() => {
        if (!bodyLandmarks || !showDressOverlay) return null;

        const ls = bodyLandmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const rs = bodyLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
        const lh = bodyLandmarks[POSE_LANDMARKS.LEFT_HIP];
        const rh = bodyLandmarks[POSE_LANDMARKS.RIGHT_HIP];

        if (!ls || !rs || ls.visibility < 0.5 || rs.visibility < 0.5) return null;

        const shoulderWidth = Math.abs(rs.x - ls.x) * 100;
        const centerX = ((ls.x + rs.x) / 2) * 100;
        const centerY = ((ls.y + rs.y) / 2) * 100;
        const bodyHeight = lh && rh ? Math.abs((lh.y + rh.y) / 2 - centerY / 100) * 100 : 40;

        return {
            position: 'absolute',
            left: `${centerX}%`,
            top: `${centerY + 5}%`,
            width: `${shoulderWidth * 3 * dressScale}%`,
            height: `${Math.max(bodyHeight * 2.5, 50) * dressScale}%`,
            transform: 'translateX(-50%)',
            opacity: dressOpacity,
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
            transition: 'all 0.1s ease-out',
            zIndex: 10
        };
    }, [bodyLandmarks, showDressOverlay, dressOpacity, dressScale]);

    // Fallback overlay
    const fallbackStyle = useMemo(() => ({
        position: 'absolute',
        left: '50%',
        top: '35%',
        width: `${45 * dressScale}%`,
        height: '55%',
        transform: 'translateX(-50%)',
        opacity: dressOpacity,
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
        zIndex: 10
    }), [dressOpacity, dressScale]);

    // Capture photo
    const capturePhoto = useCallback(async () => {
        if (!webcamRef.current) return;
        setCaptureFlash(true);
        setTimeout(() => setCaptureFlash(false), 200);

        try {
            const container = containerRef.current?.querySelector('.ar-live-view');
            if (container) {
                const canvas = await html2canvas(container, { useCORS: true, scale: 2 });
                setCapturedImage(canvas.toDataURL('image/png'));
            } else {
                setCapturedImage(webcamRef.current.getScreenshot());
            }
            setIsCameraOn(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        } catch (err) {
            setCapturedImage(webcamRef.current.getScreenshot());
            setIsCameraOn(false);
        }
    }, []);

    // Download photo
    const downloadPhoto = () => {
        if (!capturedImage) return;
        const link = document.createElement('a');
        link.download = `ar-tryon-${Date.now()}.png`;
        link.href = capturedImage;
        link.click();
    };

    // Reset
    const resetCamera = () => {
        setCapturedImage(null);
        setBodyLandmarks(null);
        startCamera();
    };

    // Video constraints
    const videoConstraints = useMemo(() => ({
        facingMode: cameraFacing,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: { ideal: 16 / 9 }
    }), [cameraFacing]);

    return (
        <div className="ar-fullframe" ref={containerRef}>
            {/* Capture Flash */}
            <AnimatePresence>
                {captureFlash && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        className="ar-flash"
                    />
                )}
            </AnimatePresence>

            {/* ========== MAIN VIEW ========== */}
            <div className="ar-main-view">
                {!isCameraOn && !capturedImage ? (
                    // Start Screen
                    <div className="ar-start-screen">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="ar-start-content"
                        >
                            <div className="ar-start-icon">
                                <Camera size={64} />
                            </div>
                            <h2>AR Virtual Try-On</h2>
                            <p>Stand back so your full upper body is visible in the camera</p>

                            <div className="ar-start-buttons">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={startCamera}
                                    className="ar-btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <><Loader2 size={22} className="animate-spin" /> Loading...</> : <><Video size={22} /> Start Camera</>}
                                </motion.button>
                            </div>

                            {hasPermission === false && (
                                <div className="ar-error">
                                    <AlertCircle size={18} />
                                    Camera access denied. Please enable permissions.
                                </div>
                            )}
                        </motion.div>
                    </div>
                ) : isCameraOn ? (
                    // Live Camera View
                    <div className="ar-live-view">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/png"
                            videoConstraints={videoConstraints}
                            className="ar-webcam"
                            mirrored={cameraFacing === 'user'}
                            onUserMediaError={() => setHasPermission(false)}
                        />

                        {/* Dress Overlay */}
                        {showDressOverlay && (
                            <div className="ar-dress-overlay" style={dressOverlayStyle || fallbackStyle}>
                                <img src={selectedDress.image} alt={selectedDress.name} crossOrigin="anonymous" />
                            </div>
                        )}

                        {/* Body Guide */}
                        {!bodyLandmarks && isPoseReady && (
                            <div className="ar-body-guide">
                                <div className="ar-guide-outline"></div>
                                <p>Step back to show upper body</p>
                            </div>
                        )}
                    </div>
                ) : capturedImage ? (
                    // Captured Photo View
                    <div className="ar-captured-view">
                        <img src={capturedImage} alt="Captured" className="ar-captured-img" />
                        <div className="ar-captured-actions">
                            <button onClick={resetCamera} className="ar-cap-btn">
                                <Camera size={20} /> Retake
                            </button>
                            <button onClick={downloadPhoto} className="ar-cap-btn primary">
                                <Download size={20} /> Download
                            </button>
                            <button onClick={() => { }} className="ar-cap-btn">
                                <Save size={20} /> Save
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ========== FLOATING CLOSE ========== */}
            <button onClick={onClose} className="ar-float-close" title="Close (ESC)">
                <X size={24} />
            </button>

            {/* ========== FLOATING CAMERA CONTROLS ========== */}
            {isCameraOn && (
                <div className="ar-float-controls">
                    <button onClick={() => setIsCameraOn(false)} className="ar-ctrl-btn danger">
                        <VideoOff size={22} />
                    </button>
                    <button onClick={capturePhoto} className="ar-capture-btn">
                        <Camera size={32} />
                    </button>
                    <button onClick={() => setCameraFacing(f => f === 'user' ? 'environment' : 'user')} className="ar-ctrl-btn">
                        <FlipHorizontal size={22} />
                    </button>
                </div>
            )}

            {/* ========== FLOATING DRESS TOGGLE ========== */}
            {isCameraOn && (
                <button
                    onClick={() => setShowDressOverlay(!showDressOverlay)}
                    className={`ar-float-toggle ${showDressOverlay ? 'active' : ''}`}
                >
                    <Wand2 size={18} />
                    {showDressOverlay ? 'Hide' : 'Show'}
                </button>
            )}

            {/* ========== STATUS INDICATOR ========== */}
            {isCameraOn && (
                <div className="ar-status">
                    <span className={`ar-dot ${bodyLandmarks ? 'active' : ''}`}></span>
                    {bodyLandmarks ? 'Body Detected' : 'Waiting for body...'}
                </div>
            )}

            {/* ========== FLOATING DRESS PANEL ========== */}
            <AnimatePresence>
                {showDressPanel && (isCameraOn || !capturedImage) && (
                    <motion.div
                        initial={{ x: 200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 200, opacity: 0 }}
                        className="ar-float-dress-panel"
                    >
                        <div className="ar-panel-head">
                            <h3><Sparkles size={16} /> Dresses</h3>
                        </div>
                        <div className="ar-dress-list">
                            {DRESS_OVERLAYS.map(dress => (
                                <button
                                    key={dress.id}
                                    onClick={() => setSelectedDress(dress)}
                                    className={`ar-dress-item ${selectedDress?.id === dress.id ? 'selected' : ''}`}
                                >
                                    <img src={dress.image} alt={dress.name} />
                                    <span>{dress.name}</span>
                                    {selectedDress?.id === dress.id && <Check size={14} className="ar-check" />}
                                </button>
                            ))}
                        </div>

                        {/* Controls */}
                        <div className="ar-dress-controls">
                            <label>Opacity</label>
                            <input type="range" min="0.3" max="1" step="0.05" value={dressOpacity} onChange={e => setDressOpacity(parseFloat(e.target.value))} />
                            <label>Size</label>
                            <input type="range" min="0.5" max="1.5" step="0.05" value={dressScale} onChange={e => setDressScale(parseFloat(e.target.value))} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== PANEL TOGGLE ========== */}
            <button
                onClick={() => setShowDressPanel(!showDressPanel)}
                className={`ar-panel-toggle ${showDressPanel ? 'active' : ''}`}
            >
                <Sparkles size={20} />
            </button>
        </div>
    );
};

export default AugmentedReality;
