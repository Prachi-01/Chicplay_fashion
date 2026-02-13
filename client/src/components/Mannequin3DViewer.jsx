import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    Environment,
    ContactShadows,
    useGLTF,
    Html,
    PresentationControls
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RotateCw,
    ZoomIn,
    ZoomOut,
    Sun,
    Moon,
    Maximize2,
    X,
    Camera,
    Download,
    Palette,
    Sparkles,
    RefreshCw
} from 'lucide-react';
import * as THREE from 'three';

// Loading placeholder component
const LoadingSpinner = () => (
    <Html center>
        <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-600">Loading 3D Model...</p>
        </div>
    </Html>
);

// Fallback Mannequin made with basic Three.js shapes (when no GLB available)
const FallbackMannequin = ({ color = '#E5E7EB', bodyType = 'slim' }) => {
    const groupRef = useRef();

    // Body proportions based on body type
    const proportions = {
        slim: { torsoWidth: 0.35, hipWidth: 0.38, shoulderWidth: 0.42 },
        athletic: { torsoWidth: 0.38, hipWidth: 0.40, shoulderWidth: 0.45 },
        curvy: { torsoWidth: 0.40, hipWidth: 0.48, shoulderWidth: 0.44 },
        plus: { torsoWidth: 0.45, hipWidth: 0.52, shoulderWidth: 0.48 }
    };

    const p = proportions[bodyType] || proportions.slim;

    return (
        <group ref={groupRef} position={[0, -0.9, 0]}>
            {/* Head */}
            <mesh position={[0, 1.65, 0]}>
                <sphereGeometry args={[0.12, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 1.48, 0]}>
                <cylinderGeometry args={[0.06, 0.07, 0.12, 16]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Shoulders */}
            <mesh position={[0, 1.38, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.06, p.shoulderWidth * 2, 8, 16]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Upper Torso */}
            <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[p.torsoWidth, p.shoulderWidth, 0.3, 16]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Mid Torso (Waist) */}
            <mesh position={[0, 0.95, 0]}>
                <cylinderGeometry args={[p.torsoWidth * 0.85, p.torsoWidth, 0.2, 16]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Lower Torso (Hips) */}
            <mesh position={[0, 0.75, 0]}>
                <cylinderGeometry args={[p.hipWidth, p.torsoWidth * 0.85, 0.22, 16]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
            </mesh>

            {/* Left Arm */}
            <group position={[-p.shoulderWidth - 0.08, 1.35, 0]} rotation={[0, 0, -0.3]}>
                <mesh position={[0, -0.18, 0]}>
                    <capsuleGeometry args={[0.045, 0.28, 8, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.48, 0]}>
                    <capsuleGeometry args={[0.04, 0.26, 8, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.68, 0]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
            </group>

            {/* Right Arm */}
            <group position={[p.shoulderWidth + 0.08, 1.35, 0]} rotation={[0, 0, 0.3]}>
                <mesh position={[0, -0.18, 0]}>
                    <capsuleGeometry args={[0.045, 0.28, 8, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.48, 0]}>
                    <capsuleGeometry args={[0.04, 0.26, 8, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.68, 0]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
            </group>

            {/* Left Leg */}
            <group position={[-0.12, 0.55, 0]}>
                <mesh position={[0, -0.22, 0]}>
                    <capsuleGeometry args={[0.08, 0.38, 8, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.62, 0]}>
                    <capsuleGeometry args={[0.065, 0.38, 8, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.88, 0.04]} rotation={[0.3, 0, 0]}>
                    <boxGeometry args={[0.1, 0.06, 0.18]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
            </group>

            {/* Right Leg */}
            <group position={[0.12, 0.55, 0]}>
                <mesh position={[0, -0.22, 0]}>
                    <capsuleGeometry args={[0.08, 0.38, 8, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
                <mesh position={[0, -0.62, 0]}>
                    <capsuleGeometry args={[0.065, 0.38, 8, 16]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.88, 0.04]} rotation={[0.3, 0, 0]}>
                    <boxGeometry args={[0.1, 0.06, 0.18]} />
                    <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
                </mesh>
            </group>
        </group>
    );
};

// GLB Model Loader Component
const GLTFMannequin = ({ modelPath, color = '#E5E7EB', scale = 1 }) => {
    const { scene } = useGLTF(modelPath);
    const modelRef = useRef();

    useEffect(() => {
        // Apply color to all meshes
        scene.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: color,
                    roughness: 0.4,
                    metalness: 0.1
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene, color]);

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={scale}
            position={[0, -0.9, 0]}
        />
    );
};

// Auto-rotation component
const AutoRotate = ({ enabled, speed = 0.5 }) => {
    const { camera, gl } = useThree();
    const controlsRef = useRef();

    useFrame(() => {
        if (enabled && controlsRef.current) {
            controlsRef.current.update();
        }
    });

    return null;
};

// Main 3D Viewer Component
const Mannequin3DViewer = ({
    modelPath = null,
    onCaptureImage,
    className = '',
    defaultBodyType = 'slim',
    compact = false
}) => {
    const canvasRef = useRef();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [autoRotate, setAutoRotate] = useState(false);
    const [lightMode, setLightMode] = useState('studio'); // 'studio', 'warm', 'cool', 'dramatic'
    const [mannequinColor, setMannequinColor] = useState('#E5E7EB');
    const [bodyType, setBodyType] = useState(defaultBodyType);
    const [zoom, setZoom] = useState(1);
    const [modelError, setModelError] = useState(false);

    const skinTones = [
        { id: 'light', color: '#F5E6D3', label: 'Light' },
        { id: 'medium', color: '#D4A574', label: 'Medium' },
        { id: 'tan', color: '#A67B5B', label: 'Tan' },
        { id: 'dark', color: '#6B4423', label: 'Dark' },
        { id: 'neutral', color: '#E5E7EB', label: 'Neutral Gray' }
    ];

    const bodyTypes = [
        { id: 'slim', label: 'Slim' },
        { id: 'athletic', label: 'Athletic' },
        { id: 'curvy', label: 'Curvy' },
        { id: 'plus', label: 'Plus' }
    ];

    const lightModes = [
        { id: 'studio', label: 'Studio', icon: Sun },
        { id: 'warm', label: 'Warm', icon: Sun },
        { id: 'cool', label: 'Cool', icon: Moon },
        { id: 'dramatic', label: 'Dramatic', icon: Sparkles }
    ];

    const getEnvironment = () => {
        switch (lightMode) {
            case 'warm': return 'sunset';
            case 'cool': return 'night';
            case 'dramatic': return 'city';
            default: return 'studio';
        }
    };

    const getAmbientIntensity = () => {
        switch (lightMode) {
            case 'warm': return 0.6;
            case 'cool': return 0.4;
            case 'dramatic': return 0.3;
            default: return 0.5;
        }
    };

    // Capture screenshot
    const captureScreenshot = () => {
        if (canvasRef.current) {
            const canvas = canvasRef.current.querySelector('canvas');
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                if (onCaptureImage) {
                    onCaptureImage(dataUrl);
                } else {
                    // Download the image
                    const link = document.createElement('a');
                    link.download = 'mannequin-view.png';
                    link.href = dataUrl;
                    link.click();
                }
            }
        }
    };

    const ViewerContent = ({ isModal = false }) => (
        <div className={`relative ${isModal ? 'w-full h-full' : 'w-full h-[500px]'}`}>
            <div ref={!isModal ? canvasRef : null} className="w-full h-full rounded-3xl overflow-hidden">
                <Canvas
                    shadows
                    camera={{ position: [0, 0.5, 2.5], fov: 45 }}
                    gl={{ preserveDrawingBuffer: true, antialias: true }}
                    dpr={[1, 2]}
                >
                    {/* Lighting */}
                    <ambientLight intensity={getAmbientIntensity()} />
                    <spotLight
                        position={[5, 5, 5]}
                        angle={0.3}
                        penumbra={1}
                        intensity={lightMode === 'dramatic' ? 1.5 : 1}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                    />
                    <pointLight position={[-5, 5, -5]} intensity={0.5} />

                    {/* Environment */}
                    <Environment preset={getEnvironment()} background={false} />

                    {/* Controls */}
                    <PresentationControls
                        global
                        config={{ mass: 2, tension: 500 }}
                        snap={{ mass: 4, tension: 400 }}
                        rotation={[0, 0, 0]}
                        polar={[-Math.PI / 4, Math.PI / 4]}
                        azimuth={[-Math.PI / 2, Math.PI / 2]}
                    >
                        <Suspense fallback={<LoadingSpinner />}>
                            {modelPath && !modelError ? (
                                <GLTFMannequin
                                    modelPath={modelPath}
                                    color={mannequinColor}
                                    scale={zoom}
                                />
                            ) : (
                                <FallbackMannequin
                                    color={mannequinColor}
                                    bodyType={bodyType}
                                />
                            )}
                        </Suspense>
                    </PresentationControls>

                    {/* Ground shadow */}
                    <ContactShadows
                        position={[0, -0.9, 0]}
                        opacity={0.4}
                        scale={3}
                        blur={2.5}
                        far={4}
                    />

                    {/* Orbit Controls */}
                    <OrbitControls
                        enablePan={false}
                        minDistance={1.5}
                        maxDistance={5}
                        autoRotate={autoRotate}
                        autoRotateSpeed={2}
                        minPolarAngle={Math.PI / 6}
                        maxPolarAngle={Math.PI / 1.5}
                    />
                </Canvas>
            </div>

            {/* Control Panel */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                {/* Left Controls */}
                <div className="flex flex-col gap-2">
                    {/* Skin Tone Selector */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg">
                        <p className="text-xs font-bold text-gray-500 mb-2">Skin Tone</p>
                        <div className="flex gap-2">
                            {skinTones.map(tone => (
                                <button
                                    key={tone.id}
                                    onClick={() => setMannequinColor(tone.color)}
                                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${mannequinColor === tone.color
                                            ? 'border-pink-500 ring-2 ring-pink-200'
                                            : 'border-gray-200'
                                        }`}
                                    style={{ backgroundColor: tone.color }}
                                    title={tone.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Body Type Selector */}
                    {!modelPath && (
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg">
                            <p className="text-xs font-bold text-gray-500 mb-2">Body Type</p>
                            <div className="flex gap-1">
                                {bodyTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setBodyType(type.id)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${bodyType === type.id
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Controls */}
                <div className="flex flex-col gap-2 items-end">
                    {/* View Controls */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-lg flex gap-1">
                        <button
                            onClick={() => setAutoRotate(!autoRotate)}
                            className={`p-2 rounded-lg transition-all ${autoRotate ? 'bg-pink-500 text-white' : 'hover:bg-gray-100'
                                }`}
                            title="Auto Rotate"
                        >
                            <RotateCw size={18} className={autoRotate ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                            title="Zoom In"
                        >
                            <ZoomIn size={18} />
                        </button>
                        <button
                            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                            title="Zoom Out"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <button
                            onClick={captureScreenshot}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                            title="Capture Screenshot"
                        >
                            <Camera size={18} />
                        </button>
                        {!isModal && (
                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                                title="Fullscreen"
                            >
                                <Maximize2 size={18} />
                            </button>
                        )}
                    </div>

                    {/* Lighting Controls */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-lg flex gap-1">
                        {lightModes.map(mode => {
                            const Icon = mode.icon;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setLightMode(mode.id)}
                                    className={`p-2 rounded-lg transition-all ${lightMode === mode.id
                                            ? 'bg-pink-500 text-white'
                                            : 'hover:bg-gray-100'
                                        }`}
                                    title={mode.label}
                                >
                                    <Icon size={18} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Model Info */}
            {!modelPath && (
                <div className="absolute top-4 left-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 shadow-lg">
                    <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
                        <RefreshCw size={14} />
                        Using procedural mannequin. Add a GLB model for enhanced quality.
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className={className}>
            <ViewerContent />

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-8"
                    >
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all z-10"
                        >
                            <X size={24} className="text-white" />
                        </button>

                        <div className="w-full h-full max-w-6xl max-h-[90vh]">
                            <ViewerContent isModal={true} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Preload hook for GLB models
Mannequin3DViewer.preload = (modelPath) => {
    if (modelPath) {
        useGLTF.preload(modelPath);
    }
};

export default Mannequin3DViewer;
