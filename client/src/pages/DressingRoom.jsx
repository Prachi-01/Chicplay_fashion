import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from '../services/api';
import {
    ArrowLeft, Star, Trophy, Zap, Save, Share2,
    RotateCw, Palette, Layers, Search, Filter,
    Sparkles, Award, Camera, Download, Users,
    TrendingUp, ShoppingBag, X, ChevronDown,
    Sun, Moon, Cloud, Heart, Target, Gift, Ruler,
    Plus, Minus, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

// Item Types for Drag & Drop
const ItemTypes = {
    CLOTHING: 'clothing'
};

// Category Configuration
const CLOTHING_CATEGORIES = [
    { id: 'all', icon: '✨', label: 'All' },
    { id: 'tops', icon: '👚', label: 'Tops' },
    { id: 'bottoms', icon: '👖', label: 'Bottoms' },
    { id: 'dresses', icon: '👗', label: 'Dresses' },
    { id: 'outerwear', icon: '🧥', label: 'Outerwear' },
    { id: 'shoes', icon: '👠', label: 'Shoes' },
    { id: 'accessories', icon: '👜', label: 'Accessories' }
];

// Available Colors for Color Picker
const AVAILABLE_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84',
    '#355C7D', '#2C3E50', '#E74C3C', '#3498DB', '#1ABC9C'
];

// Body Types & Skin Tones
const BODY_TYPES = [
    { id: 'slim', label: 'Slim', icon: '🧘‍♀️' },
    { id: 'athletic', label: 'Athletic', icon: '💪' },
    { id: 'curvy', label: 'Curvy', icon: '👗' },
    { id: 'plus', label: 'Plus', icon: '✨' }
];

const SKIN_TONES = ['#F8CBB1', '#E8B69A', '#BE8463', '#8D553D', '#5E3C2B']; // Realistic skin tones

const BACKGROUNDS = [
    { id: 'studio', label: 'Studio', color: 'linear-gradient(to bottom, #FDF2F5, white)' },
    { id: 'beach', label: 'Beach', color: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80")' },
    { id: 'city', label: 'City', color: 'url("https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2000&q=80")' },
    { id: 'sunset', label: 'Sunset', color: 'url("https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=2000&q=80")' },
    { id: 'garden', label: 'Garden', color: 'url("https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=2000&q=80")' }
];

// Image Processor for Background Removal
const TransparentImage = ({ src, alt, className, style }) => {
    const [processedSrc, setProcessedSrc] = useState(src);

    useEffect(() => {
        if (!src || src.includes('cloudinary') || src.includes('e_bgremoval')) {
            setProcessedSrc(src);
            return;
        }

        if (!src.startsWith('/products') && !src.startsWith('/assets')) {
            setProcessedSrc(src);
            return;
        }

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

            const samplePoints = [];
            for (let x = 0; x < canvas.width; x += Math.floor(canvas.width / 10)) {
                samplePoints.push({ x, y: 0 });
                samplePoints.push({ x, y: canvas.height - 1 });
            }
            for (let y = 0; y < canvas.height; y += Math.floor(canvas.height / 10)) {
                samplePoints.push({ x: 0, y });
                samplePoints.push({ x: canvas.width - 1, y });
            }

            let bgR = 0, bgG = 0, bgB = 0;
            samplePoints.forEach(p => {
                const idx = (p.y * canvas.width + p.x) * 4;
                bgR += data[idx];
                bgG += data[idx + 1];
                bgB += data[idx + 2];
            });
            bgR /= samplePoints.length;
            bgG /= samplePoints.length;
            bgB /= samplePoints.length;

            const threshold = 35;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const dist = Math.sqrt(Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2));
                if (dist < threshold) data[i + 3] = 0;
                else if (dist < threshold * 1.5) {
                    const alpha = Math.floor(((dist - threshold) / (threshold * 0.5)) * 255);
                    data[i + 3] = Math.max(0, Math.min(255, alpha));
                }
                const brightness = (r + g + b) / 3;
                if (brightness > 235 && dist < threshold * 2) data[i + 3] = 0;
            }

            ctx.putImageData(imageData, 0, 0);
            setProcessedSrc(canvas.toDataURL());
        };
    }, [src]);

    return <img src={processedSrc} alt={alt} className={className} style={style} draggable={false} />;
};

// Draggable Product Card Component
const DraggableProductCard = ({ item, onClick }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.CLOTHING,
        item: { product: item },
        collect: (monitor) => ({ isDragging: monitor.isDragging() })
    }));

    return (
        <motion.div
            ref={drag}
            whileHover={{ scale: 1.05, y: -4 }}
            onClick={onClick}
            className={`cursor-pointer bg-white rounded-xl p-3 border-2 border-transparent hover:border-pink-300 transition-all shadow-sm hover:shadow-lg ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            <div className="relative">
                <TransparentImage src={item.images[0]} alt={item.name} className="w-full h-32 object-contain mix-blend-multiply" />
                {item.gameStats?.rarity && (
                    <div className={`absolute top-1 right-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.gameStats.rarity === 'Legendary' ? 'bg-yellow-400 text-yellow-900' : item.gameStats.rarity === 'Rare' ? 'bg-purple-400 text-purple-900' : 'bg-blue-400 text-blue-900'}`}>
                        {item.gameStats.rarity}
                    </div>
                )}
            </div>
            <div className="mt-2">
                <div className="text-xs font-bold text-gray-700 truncate">{item.name}</div>
                <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-pink-500 font-bold">₹{item.price}</div>
                </div>
            </div>
        </motion.div>
    );
};

// Custom Sparkle Component
const Sparkle = ({ style }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() * 2 }}
        className="absolute pointer-events-none"
        style={style}
    >
        <Sparkles size={16} className="text-white fill-white shadow-xl" />
    </motion.div>
);

// Draggable Item Component (Outfit Layer)
const DraggableItem = ({ item, slot, onRemove, zIndex, initialTop, className = "", bodyType = { id: 'slim' }, bodyLandmarks }) => {
    const getInitialScale = () => {
        let baseScale = 1;
        switch (slot) {
            case 'dress': baseScale = 1.5; break;
            case 'outerwear': baseScale = 1.4; break;
            case 'top': baseScale = 1.2; break;
            case 'bottom': baseScale = 1.3; break;
            case 'shoes': baseScale = 0.9; break;
            case 'accessory': baseScale = 0.7; break;
            default: baseScale = 1;
        }
        if (bodyType.id === 'curvy' || bodyType.id === 'plus') baseScale *= 1.1;
        return baseScale;
    };

    const getAdjustedTop = () => {
        if (!bodyLandmarks) return initialTop;
        const { shoulderLineY, waistLineY } = bodyLandmarks;
        if (slot === 'dress' || slot === 'top' || slot === 'outerwear') return `${shoulderLineY - 5}%`;
        if (slot === 'bottom') return `${waistLineY - 2}%`;
        return initialTop;
    };

    const [scale, setScale] = useState(getInitialScale());
    useEffect(() => { setScale(getInitialScale()); }, [bodyType.id]);

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, x: '-50%', y: -20 }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            style={{ position: 'absolute', top: getAdjustedTop(), left: '50%', zIndex, touchAction: 'none' }}
            className={`cursor-grab group ${className}`}
        >
            <div className="relative transition-transform duration-200" style={{ transform: `scale(${scale})` }}>
                <div className={`group-hover:ring-2 group-hover:ring-pink-300 rounded-xl transition-all duration-200 ${slot === 'dress' || slot === 'outerwear' ? 'w-64' : slot === 'top' ? 'w-48' : slot === 'bottom' ? 'w-56' : slot === 'shoes' ? 'w-32' : 'w-24'}`}>
                    <TransparentImage src={item.images[0]} alt={item.name} className="w-full h-auto object-contain mix-blend-multiply" />
                </div>
                <div className="absolute -top-8 -right-8 opacity-0 group-hover:opacity-100 transition-opacity z-50 flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setScale(s => s + 0.1); }} className="bg-white p-1.5 rounded-full shadow border hover:bg-gray-50"><Plus size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setScale(s => s - 0.1); }} className="bg-white p-1.5 rounded-full shadow border hover:bg-gray-50"><Minus size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onRemove(slot); }} className="bg-white p-1.5 rounded-full shadow border border-rose-100 text-rose-500 hover:bg-rose-50"><X size={14} /></button>
                </div>
            </div>
        </motion.div>
    );
};

// Virtual Mannequin Display Component
const VirtualMannequin = ({ outfit, onDrop, bodyType, bodyLandmarks, skinTone, visibility = {}, selectedBackground, userPhoto }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.CLOTHING,
        drop: (item) => onDrop(item.product),
        collect: (monitor) => ({ isOver: monitor.isOver() })
    }));

    const getBodyScale = () => {
        switch (bodyType.id) {
            case 'curvy': return 'scale-x-[1.1]';
            case 'athletic': return 'scale-x-[1.05]';
            case 'plus': return 'scale-x-[1.2]';
            default: return 'scale-x-100';
        }
    };

    return (
        <div ref={drop} className={`relative w-full h-full transition-all duration-500 flex items-center justify-center ${isOver ? 'bg-pink-100/20' : ''}`} style={{ backgroundImage: selectedBackground.color, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Sparkles */}
            {[...Array(6)].map((_, i) => <Sparkle key={i} style={{ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` }} />)}

            {/* Mannequin Container - Full Body Visible */}
            <div className={`relative h-full w-full max-w-3xl flex items-center justify-center transition-transform duration-500 ${getBodyScale()}`}>
                {userPhoto ? (
                    <div className="relative h-full w-full flex items-center justify-center">
                        <img
                            src={userPhoto}
                            alt="User Mirror"
                            className="h-[95%] w-auto object-contain object-center rounded-[40px] shadow-2xl border-4 border-white/50"
                            style={{ maxHeight: '95%', maxWidth: '100%' }}
                        />
                    </div>
                ) : (
                    <img
                        src="/assets/human_model_full.png"
                        alt="Virtual Try-On Model"
                        className="h-[95%] w-auto object-contain relative z-0"
                        style={{ maxHeight: '95%', maxWidth: '100%' }}
                    />
                )}

                {/* Layered Items */}
                <div className="absolute inset-0 z-10">
                    <AnimatePresence>
                        {outfit.dress && visibility.dress !== false && <DraggableItem key={`dress-${outfit.dress._id}`} item={outfit.dress} slot="dress" bodyType={bodyType} bodyLandmarks={bodyLandmarks} onRemove={() => onDrop({ ...outfit.dress, category: 'remove-dress' }, true)} zIndex={10} initialTop="16%" className="w-64" />}
                        {!outfit.dress && outfit.top && visibility.top !== false && <DraggableItem key={`top-${outfit.top._id}`} item={outfit.top} slot="top" bodyLandmarks={bodyLandmarks} onRemove={() => onDrop({ ...outfit.top, category: 'remove-top' }, true)} zIndex={10} initialTop="4rem" className="w-56" />}
                        {!outfit.dress && outfit.bottom && visibility.bottom !== false && <DraggableItem key={`bottom-${outfit.bottom._id}`} item={outfit.bottom} slot="bottom" bodyLandmarks={bodyLandmarks} onRemove={() => onDrop({ ...outfit.bottom, category: 'remove-bottom' }, true)} zIndex={5} initialTop="12rem" className="w-56" />}
                        {outfit.outerwear && visibility.outerwear !== false && <DraggableItem key={`outerwear-${outfit.outerwear._id}`} item={outfit.outerwear} slot="outerwear" bodyLandmarks={bodyLandmarks} onRemove={() => onDrop({ ...outfit.outerwear, category: 'remove-outerwear' }, true)} zIndex={25} initialTop="4rem" className="w-64" />}
                        {outfit.shoes && visibility.shoes !== false && <DraggableItem key={`shoes-${outfit.shoes._id}`} item={outfit.shoes} slot="shoes" onRemove={() => onDrop({ ...outfit.shoes, category: 'remove-shoes' }, true)} zIndex={15} initialTop="85%" className="w-32" />}
                        {outfit.accessory && visibility.accessory !== false && <DraggableItem key={`accessory-${outfit.accessory._id}`} item={outfit.accessory} slot="accessory" onRemove={() => onDrop({ ...outfit.accessory, category: 'remove-accessory' }, true)} zIndex={30} initialTop="1rem" className="w-32" />}
                    </AnimatePresence>
                </div>

                {/* Empty State Overlay */}
                {Object.values(outfit).every(item => !item) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50">
                        <Sparkles className="w-20 h-20 text-pink-400/30 mb-4 animate-pulse" />
                        <div className="text-4xl font-black text-pink-900/20 uppercase tracking-tighter">Start Your Look</div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Size Advisor Modal
const SizeAdvisorModal = ({ onClose, initialMeasurements }) => {
    const [measurements, setMeasurements] = useState(initialMeasurements || { bust: 34, waist: 28, hips: 38 });
    const [result, setResult] = useState(null);

    const calculateSize = () => {
        let size = measurements.bust < 34 ? 'S' : measurements.bust < 38 ? 'M' : 'L';
        setResult({ size, confidence: '85%' });
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
                <h2 className="text-2xl font-black mb-6">Size Advisor</h2>
                {!result ? (
                    <div className="space-y-4">
                        {['bust', 'waist', 'hips'].map(m => (
                            <div key={m}>
                                <label className="block text-sm font-bold capitalize mb-1">{m} (in)</label>
                                <input type="number" value={measurements[m]} onChange={e => setMeasurements({ ...measurements, [m]: Number(e.target.value) })} className="w-full bg-gray-50 border rounded-xl p-3" />
                            </div>
                        ))}
                        <button onClick={calculateSize} className="w-full bg-pink-500 text-white font-black py-4 rounded-2xl">Calculate</button>
                    </div>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="text-6xl font-black text-pink-500">{result.size}</div>
                        <button onClick={onClose} className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl">Apply</button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// Main Dressing Room Component
const MOCK_WARDROBE = [
    {
        _id: 'mock_1',
        name: 'Floral Silk Dress',
        description: 'Elegant floral silk dress.',
        price: 120,
        category: 'Dresses',
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'],
        attributes: { color: '#FF6B8B', style: 'romantic' },
        status: 'approved'
    },
    {
        _id: 'mock_2',
        name: 'Classic Wrap Dress',
        description: 'Versatile wrap dress.',
        price: 95,
        category: 'Dresses',
        images: ['https://images.unsplash.com/photo-1572804013307-a9a111283282?auto=format&fit=crop&w=800&q=80'],
        attributes: { color: '#C0EBA6', style: 'classic' },
        status: 'approved'
    },
    {
        _id: 'mock_3',
        name: 'Summer Boho Maxi',
        description: 'Light and airy maxi.',
        price: 85,
        category: 'Dresses',
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'],
        attributes: { color: '#FFFFFF', style: 'boho' },
        status: 'approved'
    }
];

const DressingRoom = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { points, addPoints, markBingoSquare } = useGameStore();

    // Core State
    const [activeTab, setActiveTab] = useState('clothing');
    const [activeCategory, setActiveCategory] = useState('all');
    const [wardrobe, setWardrobe] = useState([]);
    const [outfit, setOutfit] = useState({ top: null, bottom: null, dress: null, outerwear: null, shoes: null, accessory: null });
    const [visibility, setVisibility] = useState({ dress: true, top: true, bottom: true, outerwear: true, shoes: true, accessory: true });

    // Customization State
    const [bodyType, setBodyType] = useState(BODY_TYPES[0]);
    const [bodyLandmarks, setBodyLandmarks] = useState(null);
    const [aiMeasurements, setAiMeasurements] = useState(null);
    const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0]);
    const [userPhoto, setUserPhoto] = useState(null);

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiResultImage, setAiResultImage] = useState(null);
    const [showSizeAdvisor, setShowSizeAdvisor] = useState(false);
    const [selectedProductDetail, setSelectedProductDetail] = useState(null);
    const [savedOutfits, setSavedOutfits] = useState([]);
    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;
                setUserPhoto(base64Image);
                toast.success('Virtual Mirror Activated! ✨');

                // AI Processing
                try {
                    toast.loading('AI analyzing body proportions...', { id: 'ai-analysis' });
                    const res = await api.post('/ai/analyze-body', { image: base64Image });

                    const { bodyType: aiBodyType, shoulderLineY, waistLineY, estimatedMeasurements } = res.data;

                    if (aiBodyType) {
                        const matchedType = BODY_TYPES.find(b => b.id === aiBodyType) || BODY_TYPES[0];
                        setBodyType(matchedType);
                        toast.success(`Identified: ${matchedType.label} Shape`, { id: 'ai-analysis' });
                    }

                    if (shoulderLineY) {
                        setBodyLandmarks({ shoulderLineY, waistLineY });
                    }

                    if (estimatedMeasurements) {
                        setAiMeasurements(estimatedMeasurements);
                    }
                } catch (error) {
                    console.error("AI Analysis failed", error);
                    // toast.error("Analysis unavailable. Using default fit.", { id: 'ai-analysis' });
                    toast.dismiss('ai-analysis');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Logic: Equip Item
    const handleEquipItem = (item) => {
        const cat = item.category?.toLowerCase() || '';
        let slot = cat.includes('dress') ? 'dress' : cat.includes('top') ? 'top' : cat.includes('bottom') || cat.includes('skirt') ? 'bottom' : cat.includes('outer') ? 'outerwear' : cat.includes('shoe') ? 'shoes' : 'accessory';

        setOutfit(prev => {
            const next = { ...prev };
            if (slot === 'dress') { next.top = null; next.bottom = null; }
            if (slot === 'top' || slot === 'bottom') next.dress = null;
            next[slot] = item;
            return next;
        });
        addPoints(5);
        toast.success(`Trying on ${item.name}`);
    };

    useEffect(() => {
        api.get('/products')
            .then(res => {
                let products = res.data?.length > 0 ? res.data : MOCK_WARDROBE;

                // CRITICAL: Strictly filter for approved products unless admin
                if (user?.role !== 'admin') {
                    products = products.filter(i => i.status === 'approved');
                }

                setWardrobe(products);
            })
            .catch(() => setWardrobe(MOCK_WARDROBE));
    }, []);

    const filteredWardrobe = useMemo(() => {
        // Ensure uniqueness by ID to avoid repeating dresses
        const uniqueItems = Array.from(new Map(wardrobe.map(item => [item._id, item])).values());

        return uniqueItems.filter(i => {
            const matchesCategory = activeCategory === 'all' || i.category?.toLowerCase().includes(activeCategory.toLowerCase());
            const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
            // Visibility check: must have images and a valid name
            const isVisible = i.images && i.images.length > 0 && i.images[0] && i.name;

            // CRITICAL: Explicitly block pending/rejected, even if !i.status would allow it
            // We use 'user' from useAuth() which is available in the component scope (checked imports)
            if (user?.role !== 'admin' && (i.status === 'pending' || i.status === 'rejected')) {
                return false;
            }

            // Only show published and APPROVED products unless user is admin
            const isApproved = user?.role === 'admin' || i.status === 'approved' || !i.status;
            const isPublished = user?.role === 'admin' || i.isPublished !== false;

            return matchesCategory && matchesSearch && isVisible && isApproved && isPublished;
        });
    }, [wardrobe, activeCategory, searchQuery]);

    const handleReset = () => {
        setOutfit({ top: null, bottom: null, dress: null, outerwear: null, shoes: null, accessory: null });
        setAiResultImage(null);
        toast('Dressing Room Reset');
    };

    const handleAiTryOn = async () => {
        // Validation: Check if user has uploaded their photo
        if (!userPhoto) {
            toast.error("Please upload your photo first using the Camera button!");
            return;
        }

        // Validation: Check if user has selected a dress
        const selectedDress = outfit.dress || outfit.top;
        if (!selectedDress) {
            toast.error("Please select a dress or top to try on!");
            return;
        }

        setIsAiGenerating(true);
        const loadingToast = toast.loading("AI Stylist working... This may take 30-60 seconds");

        try {
            // Prepare the API request
            const requestData = {
                personImage: userPhoto, // Base64 image of the user
                dressImage: selectedDress.images[0], // URL of the selected dress
                prompt: `Realistic virtual try-on of ${selectedDress.name}` // Optional prompt
            };

            console.log('🎨 Sending Virtual Try-On request to fal.ai...');
            const response = await axios.post('/api/ai/virtual-try-on', requestData);

            if (response.data && response.data.imageUrl) {
                setAiResultImage(response.data.imageUrl);
                toast.success("AI Fit Ready! Check the result! ✨", { id: loadingToast });

                // Award points for using AI feature
                addPoints(50);
                markBingoSquare('ai_tryOn');

                console.log('✅ Virtual Try-On Success:', {
                    imageUrl: response.data.imageUrl,
                    requestId: response.data.requestId,
                    dashboardUrl: response.data.dashboardUrl
                });

                // Optional: Open fal.ai dashboard in new tab to view result
                if (response.data.dashboardUrl) {
                    console.log('📊 View result on fal.ai:', response.data.dashboardUrl);
                }
            } else {
                throw new Error('No image URL in response');
            }
        } catch (error) {
            console.error('❌ Virtual Try-On Failed:', error);
            toast.error(
                error.response?.data?.message || "AI Try-On failed. Please try again!",
                { id: loadingToast }
            );
        } finally {
            setIsAiGenerating(false);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-screen w-screen bg-[#FDF2F5] font-sans flex flex-col overflow-hidden text-[#5D445D]">
                <Toaster position="top-right" />

                {/* Header Section */}
                <header className="h-20 flex-shrink-0 flex items-center justify-between px-12 z-[100] relative">
                    <button onClick={() => navigate('/shop')} className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-2xl shadow-sm flex items-center gap-2 font-bold text-[#A67B94] hover:bg-white transition"><ArrowLeft size={18} />Back</button>
                    <div className="bg-white/80 backdrop-blur-md px-8 py-2 rounded-full shadow-sm flex items-center gap-2 border border-pink-100">
                        <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-[10px]">🍪</div>
                        <span className="font-black tracking-tight">{points} pts</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleReset} className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-2xl shadow-sm flex items-center gap-2 font-bold text-red-400 hover:bg-red-50 transition"><RotateCw size={18} />Reset</button>
                        <button onClick={() => toast.success("Outfit Saved!")} className="bg-pink-500 text-white px-6 py-2 rounded-2xl shadow-lg flex items-center gap-2 font-bold hover:bg-pink-600 transition tracking-widest"><Save size={18} />SAVE LOOK</button>
                    </div>
                </header>

                <div className="flex-1 relative flex overflow-hidden">
                    {/* LAYER 1: Perfect Centered Mannequin Stage */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-full pointer-events-auto">
                            <VirtualMannequin
                                outfit={outfit}
                                onDrop={handleEquipItem}
                                bodyType={bodyType}
                                bodyLandmarks={bodyLandmarks}
                                visibility={visibility}
                                selectedBackground={selectedBackground}
                                userPhoto={userPhoto}
                            />
                        </div>
                    </div>

                    {/* LAYER 2: Functional UI Overlay */}
                    <div className="absolute inset-0 z-20 flex justify-between p-6 pointer-events-none">
                        {/* Library Sidebar (Left) */}
                        <aside className="w-[320px] bg-white/70 backdrop-blur-xl rounded-[40px] p-6 shadow-2xl border border-white/50 pointer-events-auto flex flex-col h-full max-h-[calc(100vh-160px)]">
                            <h3 className="font-black text-2xl mb-6">Library</h3>
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" size={18} />
                                <input type="text" placeholder="Search styles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/50 border border-pink-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition" />
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                {CLOTHING_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${activeCategory === cat.id ? 'bg-white shadow-md' : 'hover:bg-white/50'}`}>
                                        <div className="flex items-center gap-3"><span className="text-xl">{cat.icon}</span><span className="font-bold text-sm tracking-tight">{cat.label}</span></div>
                                        <ChevronDown size={16} className="-rotate-90 text-pink-200" />
                                    </button>
                                ))}
                            </div>
                        </aside>

                        {/* Inventory Grid (Right) */}
                        <aside className="w-[320px] bg-white/70 backdrop-blur-xl rounded-[40px] p-6 shadow-2xl border border-white/50 pointer-events-auto flex flex-col h-full max-h-[calc(100vh-160px)]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-2xl tracking-tighter">Items</h3>
                                <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-black">{filteredWardrobe.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <div className="grid grid-cols-2 gap-3">
                                    {filteredWardrobe.map(item => (
                                        <DraggableProductCard key={item._id} item={item} onClick={() => handleEquipItem(item)} />
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* HUD Controls (Bottom) */}
                    <div className="absolute bottom-10 inset-x-0 z-30 flex justify-center pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-2xl rounded-full py-4 px-10 shadow-3xl flex items-center gap-8 border border-white pointer-events-auto">
                            <button onClick={handleAiTryOn} disabled={isAiGenerating} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-pink-200">
                                <Sparkles size={20} className={isAiGenerating ? 'animate-spin' : ''} />
                                {isAiGenerating ? 'STYLING...' : 'Realistic Fit'}
                            </button>
                            <div className="h-10 w-px bg-pink-100" />
                            <div className="flex gap-3">
                                {BACKGROUNDS.slice(0, 3).map(bg => (
                                    <button key={bg.id} onClick={() => setSelectedBackground(bg)} className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${selectedBackground.id === bg.id ? 'bg-pink-500 scale-110 shadow-lg ring-4 ring-pink-100' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                        {bg.id === 'studio' ? '🏢' : bg.id === 'beach' ? '🏖️' : '🌆'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Utility HUD (Top right of center) */}
                    <div className="absolute top-6 right-[350px] z-30 flex flex-col gap-3 pointer-events-auto">
                        <button onClick={() => setShowSizeAdvisor(true)} className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl hover:scale-110 transition text-pink-400" title="Size Advisor">
                            <Ruler size={24} />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl hover:scale-110 transition text-pink-400" title="Virtual Mirror">
                            <Camera size={24} />
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    />
                </div>

                {/* MODALS */}
                <AnimatePresence>
                    {showSizeAdvisor && <SizeAdvisorModal onClose={() => setShowSizeAdvisor(false)} initialMeasurements={aiMeasurements} />}

                    {/* AI Result Modal */}
                    {aiResultImage && (
                        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setAiResultImage(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="relative bg-gradient-to-br from-white to-pink-50 rounded-[40px] p-8 w-full max-w-4xl shadow-2xl border-4 border-white/50"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                            <Sparkles className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                                                AI Virtual Try-On Result
                                            </h2>
                                            <p className="text-sm text-gray-500 font-medium">Powered by fal.ai</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setAiResultImage(null)}
                                        className="w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-50 transition flex items-center justify-center"
                                    >
                                        <X size={24} className="text-gray-400" />
                                    </button>
                                </div>

                                {/* AI Result Image */}
                                <div className="relative bg-white rounded-3xl p-4 shadow-inner mb-6">
                                    <img
                                        src={aiResultImage}
                                        alt="AI Virtual Try-On Result"
                                        className="w-full h-auto max-h-[60vh] object-contain rounded-2xl"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <a
                                        href={aiResultImage}
                                        download="ai-tryon-result.jpg"
                                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-xl transition flex items-center justify-center gap-3"
                                    >
                                        <Download size={20} />
                                        Download Result
                                    </a>
                                    <button
                                        onClick={() => {
                                            setUserPhoto(aiResultImage);
                                            setAiResultImage(null);
                                            toast.success("Applied AI result as your mirror photo!");
                                        }}
                                        className="flex-1 bg-white border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-pink-50 transition flex items-center justify-center gap-3"
                                    >
                                        <Target size={20} />
                                        Use as Mirror
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DndProvider>
    );
};

export default DressingRoom;
