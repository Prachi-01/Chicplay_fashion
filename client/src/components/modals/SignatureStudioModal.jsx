import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    X, Sparkles, ShoppingBag, Heart,
    ArrowRight, RefreshCw, Layers,
    Check, Zap, Trophy, Star, Eye,
    ChevronLeft, ChevronRight, Share2, Home
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useGameStore } from '../../store/gameStore';
import { toast } from 'react-hot-toast';
import './SignatureStudioButtons.css';
import PostAnalysisModals from './PostAnalysisModals';


const LOOKS = {
    'Classic Elegance': [
        {
            id: 'ce1',
            name: "CORE ESSENCE",
            rating: 5,
            match: 95,
            occasion: "Gala & Evening",
            cost: 245,
            image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=800&fit=crop",
            items: [
                { id: '101', name: 'Silk Gown', price: 150, category: 'Dress', overlay: '/products/straight_red_gown.png' },
                { id: '102', name: 'Pearl Clutch', price: 95, category: 'Bag' }
            ],
            alternativeItems: [
                { id: '101b', name: 'Velvet Gown', price: 175, category: 'Dress' },
                { id: '102b', name: 'Gold Minaudiere', price: 120, category: 'Bag' }
            ]
        },
        {
            id: 'ce2',
            name: "MODERN POWER",
            rating: 4,
            match: 88,
            occasion: "Corporate Chic",
            cost: 189,
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop",
            items: [
                { id: '103', name: 'Tailored Blazer', price: 120, category: 'Outerwear', overlay: '/products/straight_navy_dress.png' },
                { id: '104', name: 'Slim Trousers', price: 69, category: 'Bottoms' }
            ],
            alternativeItems: [
                { id: '103b', name: 'Tweed Blazer', price: 140, category: 'Outerwear' },
                { id: '104b', name: 'Wide-Leg Pants', price: 85, category: 'Bottoms' }
            ]
        }
    ],
    'Boho Free Spirit': [
        {
            id: 'bo1',
            name: "DREAMY WANDERER",
            rating: 5,
            match: 98,
            occasion: "Festival & Resort",
            cost: 156,
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
            items: [
                { id: 'boho1', name: 'Floral Maxi', price: 89, category: 'Dress' },
                { id: 'boho2', name: 'Tasseled Bag', price: 67, category: 'Bag' }
            ],
            alternativeItems: [
                { id: 'boho1b', name: 'Paisley Wrap Dress', price: 95, category: 'Dress' },
                { id: 'boho2b', name: 'Macrame Tote', price: 55, category: 'Bag' }
            ]
        }
    ],
    'Modern Minimalist': [
        {
            id: 'mm1',
            name: "PURE LINES",
            rating: 5,
            match: 94,
            occasion: "Architectural Event",
            cost: 210,
            image: "https://images.unsplash.com/photo-1539109132332-629a8b9195d0?w=600&h=800&fit=crop",
            items: [
                { id: 'mm101', name: 'Column Dress', price: 160, category: 'Dress' },
                { id: 'mm102', name: 'Geometric Bag', price: 50, category: 'Bag' }
            ],
            alternativeItems: [
                { id: 'mm101b', name: 'Slate Shirt Dress', price: 145, category: 'Dress' },
                { id: 'mm102b', name: 'Concrete-tone Clutch', price: 65, category: 'Bag' }
            ]
        }
    ],
    'Edgy Trendsetter': [
        {
            id: 'et1',
            name: "VANGUARD LOOK",
            rating: 5,
            match: 96,
            occasion: "Art Gallery Opening",
            cost: 220,
            image: "https://images.unsplash.com/photo-1533512930330-4ac257c86793?w=600&h=800&fit=crop",
            items: [
                { id: 'et101', name: 'Asymmetric Mini', price: 95, category: 'Dress' },
                { id: 'et102', name: 'Leather Boots', price: 125, category: 'Shoes' }
            ],
            alternativeItems: [
                { id: 'et101b', name: 'Metallic Slip', price: 110, category: 'Dress' },
                { id: 'et102b', name: 'Chunky Platform Boots', price: 145, category: 'Shoes' }
            ]
        }
    ],
    'Coastal Girl': [
        {
            id: 'cg1',
            name: "OCEAN BREEZE",
            rating: 5,
            match: 92,
            occasion: "Beach Resort",
            cost: 175,
            image: "https://images.unsplash.com/photo-1518622358385-8ea7d346b08d?w=600&h=800&fit=crop",
            items: [
                { id: 'cg101', name: 'Linen Sundress', price: 88, category: 'Dress' },
                { id: 'cg102', name: 'Straw Tote', price: 87, category: 'Bag' }
            ],
            alternativeItems: [
                { id: 'cg101b', name: 'Cotton Eyelet Dress', price: 92, category: 'Dress' },
                { id: 'cg102b', name: 'Rattan Crossbody', price: 75, category: 'Bag' }
            ]
        }
    ],
    'Glamour Goddess': [
        {
            id: 'gg1',
            name: "STARDUST READY",
            rating: 5,
            match: 97,
            occasion: "Red Carpet",
            cost: 395,
            image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop",
            items: [
                { id: 'gg101', name: 'Sequin Mermaid Gown', price: 295, category: 'Dress', overlay: '/products/purple_ball_gown.png' },
                { id: 'gg102', name: 'Gold Stilettos', price: 100, category: 'Shoes' }
            ],
            alternativeItems: [
                { id: 'gg101b', name: 'Satin Backless Gown', price: 275, category: 'Dress' },
                { id: 'gg102b', name: 'Crystal Pumps', price: 150, category: 'Shoes' }
            ]
        }
    ],
    'Cottagecore': [
        {
            id: 'cc1',
            name: "MEADOW DREAM",
            rating: 5,
            match: 93,
            occasion: "Picnic Date",
            cost: 145,
            image: "https://images.unsplash.com/photo-1518349619163-02319937aaec?w=600&h=800&fit=crop",
            items: [
                { id: 'cc101', name: 'Puff-Sleeve Gingham', price: 68, category: 'Dress' },
                { id: 'cc102', name: 'Boater Hat', price: 77, category: 'Accessory' }
            ],
            alternativeItems: [
                { id: 'cc101b', name: 'Floral Apron Dress', price: 72, category: 'Dress' },
                { id: 'cc102b', name: 'Woven Basket Bag', price: 55, category: 'Bag' }
            ]
        }
    ],
    'Artistic Eclectic': [
        {
            id: 'ae1',
            name: "CREATIVE KINETIC",
            rating: 5,
            match: 91,
            occasion: "Studio Visit",
            cost: 185,
            image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=800&fit=crop",
            items: [
                { id: 'ae101', name: 'Hand-Painted Midi', price: 120, category: 'Dress' },
                { id: 'ae102', name: 'Artisan Scarf', price: 65, category: 'Accessory' }
            ],
            alternativeItems: [
                { id: 'ae101b', name: 'Patchwork Denim Dress', price: 140, category: 'Dress' },
                { id: 'ae102b', name: 'Beaded Statement Necklace', price: 85, category: 'Accessory' }
            ]
        }
    ],
    'Street Style Cool': [
        {
            id: 'ssc1',
            name: "URBAN BEAT",
            rating: 5,
            match: 94,
            occasion: "City Exploration",
            cost: 160,
            image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop",
            items: [
                { id: 'ssc101', name: 'Oversized Hoodie Dress', price: 75, category: 'Dress' },
                { id: 'ssc102', name: 'Graphite Sneakers', price: 85, category: 'Shoes' }
            ],
            alternativeItems: [
                { id: 'ssc101b', name: 'Grafitti Print T-Shirt Dress', price: 65, category: 'Dress' },
                { id: 'ssc102b', name: 'High-Top Leather Sneakers', price: 110, category: 'Shoes' }
            ]
        }
    ],
    'Utility Chic': [
        {
            id: 'uc1',
            name: "FUNCTIONAL FLAIR",
            rating: 5,
            match: 90,
            occasion: "Dynamic Travel",
            cost: 195,
            image: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=600&h=800&fit=crop",
            items: [
                { id: 'uc101', name: 'Cargo Mini Dress', price: 95, category: 'Dress' },
                { id: 'uc102', name: 'Utility Boots', price: 100, category: 'Shoes' }
            ],
            alternativeItems: [
                { id: 'uc101b', name: 'Khaki Trench Dress', price: 120, category: 'Dress' },
                { id: 'uc102b', name: 'Combat Sandals', price: 85, category: 'Shoes' }
            ]
        }
    ],
    'Sophisticated Workwear': [
        {
            id: 'sw1',
            name: "BOARDROOM BOSS",
            rating: 5,
            match: 95,
            occasion: "Executive Dinner",
            cost: 235,
            image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop",
            items: [
                { id: 'sw101', name: 'Bespoke Blazer Dress', price: 165, category: 'Dress' },
                { id: 'sw102', name: 'Leather Portfolio', price: 70, category: 'Accessory' }
            ],
            alternativeItems: [
                { id: 'sw101b', name: 'Pinstripe Sheath Dress', price: 140, category: 'Dress' },
                { id: 'sw102b', name: 'Structured Saffiano Tote', price: 150, category: 'Bag' }
            ]
        }
    ],
    'Romantic Dreamer': [
        {
            id: 'rd1',
            name: "ETHEREAL BLISS",
            rating: 5,
            match: 98,
            occasion: "Garden Wedding",
            cost: 210,
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
            items: [
                { id: 'rd101', name: 'Lace Fit-and-Flare', price: 95, category: 'Dress', overlay: '/products/blush_dress.png' },
                { id: 'rd102', name: 'Silk Slip', price: 115, category: 'Dress' }
            ],
            alternativeItems: [
                { id: 'rd101b', name: 'Tulle Midi Dress', price: 130, category: 'Dress' },
                { id: 'rd102b', name: 'Floral Sash', price: 45, category: 'Accessory' }
            ]
        }
    ],
    'default': [
        {
            id: 'def1',
            name: "SIGNATURE LOOK",
            rating: 5,
            match: 92,
            occasion: "Everyday Style",
            cost: 199,
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop",
            items: [
                { id: 'd1', name: 'Premium Tee', price: 45, category: 'Tops' },
                { id: 'd2', name: 'Designer Denim', price: 154, category: 'Bottoms' }
            ]
        }
    ]
};

const SignatureStudioModal = ({ isOpen, onClose, archetype }) => {
    const { addToCart } = useCart();
    const { addPoints, addAchievement, points } = useGameStore();
    const navigate = useNavigate();
    const [activeLookIdx, setActiveLookIdx] = useState(0);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [isSwapped, setIsSwapped] = useState(false);
    const [styleElements, setStyleElements] = useState({
        femininity: 80,
        elegance: 70,
        comfort: 60,
        trendiness: 50
    });
    const [activeModal, setActiveModal] = useState(null); // 'bundle', 'tryon', 'share'

    // Handle ESC key to close modal
    const handleEscapeKey = useCallback((e) => {
        if (e.key === 'Escape' && !activeModal) {
            onClose();
        }
    }, [onClose, activeModal]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleEscapeKey);
            // Also listen for global escape event
            window.addEventListener('escapePressed', onClose);
        }
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
            window.removeEventListener('escapePressed', onClose);
        };
    }, [isOpen, handleEscapeKey, onClose]);

    // Navigate to home
    const handleGoHome = () => {
        onClose();
        navigate('/');
    };


    const currentArchetypeLooks = LOOKS[archetype] || LOOKS['default'];
    const lookBase = currentArchetypeLooks[activeLookIdx % currentArchetypeLooks.length];

    // Simulate alternative items
    const look = {
        ...lookBase,
        items: isSwapped && lookBase.alternativeItems ? lookBase.alternativeItems : lookBase.items
    };

    const handleBundlePurchase = () => {
        look.items.forEach(item => addToCart(item));
        addPoints(100);
        addAchievement({
            id: 'signature_stylist',
            name: 'Signature Stylist',
            icon: '🛍️',
            date: new Date().toISOString()
        });
        toast.success(`Bundle added to cart! +100 XP unlocked.`, { icon: '✨' });
        onClose();
    };

    const handleSwapItems = () => {
        setIsSwapped(!isSwapped);
        toast.success(isSwapped ? "Original look restored" : "Alternative items swapped!", {
            icon: '🔄',
            style: { borderRadius: '12px', background: '#333', color: '#fff' }
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                />

                <motion.div
                    layoutId="signature-studio"
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* === TOP NAVIGATION BAR === */}
                    <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                onClick={handleGoHome}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-rosegold transition font-semibold"
                            >
                                <Home size={14} />
                                <span className="hidden sm:inline">Home</span>
                            </button>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-400 hidden sm:inline">Style Profile</span>
                            <span className="text-gray-300 hidden sm:inline">/</span>
                            <span className="font-bold text-mocha">Signature Look</span>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 transition font-bold text-sm"
                            title="Close (ESC)"
                        >
                            <X size={18} />
                            <span className="hidden sm:inline">Close</span>
                        </button>
                    </div>

                    {/* === MAIN CONTENT AREA === */}
                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        {/* --- Sidebar / Controls --- */}
                        <div className="md:w-1/3 p-4 md:p-6 lg:p-8 border-r border-gray-100 overflow-y-auto bg-gray-50/50">
                            <div className="mb-6 md:mb-8">
                                <div className="flex items-center gap-2 text-rosegold font-black text-xs uppercase tracking-widest mb-2">
                                    <Sparkles size={14} /> Signature Look Studio
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-mocha leading-tight">
                                    Your Style <br className="hidden md:block" /> DNA Realized
                                </h2>
                                <p className="text-gray-500 text-sm font-medium mt-2">
                                    We've curated professional looks that match your <span className="text-rosegold font-bold">{archetype}</span> archetype.
                                </p>
                            </div>

                            {/* Look Selector Tabs */}
                            <div className="space-y-3 mb-10">
                                {currentArchetypeLooks.map((l, i) => (
                                    <button
                                        key={l.id}
                                        onClick={() => {
                                            setActiveLookIdx(i);
                                            setIsSwapped(false);
                                        }}
                                        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border-2 ${activeLookIdx === i ? 'border-rosegold bg-white shadow-lg' : 'border-transparent bg-gray-100/50 grayscale hover:grayscale-0'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border">
                                                <img src={l.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-left text-sm font-bold text-mocha">{l.name}</div>
                                        </div>
                                        <div className="text-[10px] font-black text-gray-400">{l.match}% Match</div>
                                    </button>
                                ))}
                            </div>

                            {/* Style Sliders */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Style Elements</h4>
                                    <RefreshCw size={14} className="text-gray-300 cursor-pointer hover:text-rosegold" onClick={() => setStyleElements({ femininity: 80, elegance: 70, comfort: 60, trendiness: 50 })} />
                                </div>
                                {Object.entries(styleElements).map(([key, val]) => (
                                    <div key={key} className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-bold text-mocha capitalize">
                                            <span>{key}</span>
                                            <span>{val}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${val}%` }}
                                                className="h-full bg-mocha"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-4 bg-white rounded-2xl border border-mocha/5 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500">Loyalty Perk</span>
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                </div>
                                <div className="text-xs font-medium text-mocha italic">
                                    "Purchasing this signature look will boost your {archetype} mastery by +15%"
                                </div>
                            </div>
                        </div>

                        {/* --- Main Stage --- */}
                        <div className="flex-1 relative bg-cream/20 flex flex-col p-8 overflow-y-auto">
                            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-mocha/30 hover:text-mocha transition z-50"><X /></button>

                            <div className="flex flex-col lg:flex-row gap-10 flex-1">
                                {/* Animated Preview Card */}
                                <div className="lg:w-1/2 relative group">
                                    <motion.div
                                        key={look.id + (isSwapped ? '-swapped' : '')}
                                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white group-hover:shadow-[0_20px_60px_rgba(157,78,221,0.2)] transition-shadow duration-500"
                                    >
                                        <img src={look.image} className="w-full h-full object-cover" />

                                        {/* Overlay Tags */}
                                        <div className="absolute top-6 left-6 space-y-2">
                                            <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-rosegold shadow-sm flex items-center gap-2">
                                                <Zap size={10} className="fill-rosegold" /> {look.match}% STYLE MATCH
                                            </div>
                                            <div className="bg-mocha/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-white shadow-sm">
                                                {look.occasion.toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Glass Interaction Panel */}
                                        <div className="absolute inset-x-6 bottom-6 p-5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 text-mocha group-hover:bg-white/60 transition-colors">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="font-extrabold text-lg">{look.name}</div>
                                                <div className="text-xl font-black text-rosegold">${look.cost}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= look.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"} />)}
                                                <span className="text-[10px] font-bold text-gray-500 ml-1">Verified Fit</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Itemized List & Actions */}
                                <div className="lg:w-1/2 flex flex-col justify-between">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Included in Look</h3>
                                            <button
                                                onClick={handleSwapItems}
                                                className="text-rosegold text-xs font-bold hover:underline flex items-center gap-1"
                                            >
                                                <RefreshCw size={10} /> {isSwapped ? "Revert Selection" : "Swap Items"}
                                            </button>
                                        </div>

                                        {look.items.map((item, idx) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-center gap-4 group cursor-pointer"
                                            >
                                                <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-mocha/5 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                                    <ShoppingBag className="text-gray-300" size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.category}</div>
                                                    <div className="font-bold text-mocha">{item.name}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-mocha">${item.price}</div>
                                                    <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                                        <Check size={8} /> Perfect Match
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        <div className="p-6 bg-rosegold/5 rounded-2xl border-2 border-dashed border-rosegold/20">
                                            <div className="text-xs font-black text-rosegold uppercase mb-2">Why it works for you:</div>
                                            <p className="text-sm text-mocha/70 italic leading-relaxed">
                                                "This curated selection balances your love for {archetype} with modern textures. The {look.items[0].name} provides the structural anchor, while the {look.items[1].name} adds the characteristic flair of your fashion DNA."
                                            </p>
                                        </div>
                                    </div>

                                    <div className="action-buttons-container">
                                        <motion.button
                                            whileHover="hover"
                                            onClick={() => setActiveModal('bundle')}
                                            className="bundle-look-btn group relative"
                                        >
                                            <div className="relative z-10 flex flex-col items-center gap-1">
                                                <ShoppingBag size={24} />
                                                <span>Bundle Entire Look</span>
                                            </div>
                                            {/* Floating Money Emojis */}
                                            <AnimatePresence>
                                                <motion.div
                                                    variants={{
                                                        hover: { opacity: 1 }
                                                    }}
                                                    initial={{ opacity: 0 }}
                                                    className="absolute inset-0 pointer-events-none"
                                                >
                                                    {[1, 2, 3].map(i => (
                                                        <motion.span
                                                            key={i}
                                                            variants={{
                                                                hover: {
                                                                    y: -50,
                                                                    opacity: [0, 1, 0],
                                                                    x: (i - 2) * 20,
                                                                    transition: { duration: 1, repeat: Infinity, delay: i * 0.2 }
                                                                }
                                                            }}
                                                            className="absolute top-0 left-1/2 text-xl"
                                                        >
                                                            💰
                                                        </motion.span>
                                                    ))}
                                                </motion.div>
                                            </AnimatePresence>
                                        </motion.button>

                                        <motion.button
                                            whileHover="hover"
                                            onClick={() => setActiveModal('tryon')}
                                            className="virtual-tryon-btn group relative"
                                        >
                                            <div className="relative z-10 flex flex-col items-center gap-1">
                                                <span>Virtual Try-On</span>
                                            </div>
                                            {/* Floating Clothing Icons */}
                                            <AnimatePresence>
                                                <motion.div
                                                    variants={{
                                                        hover: { opacity: 1 }
                                                    }}
                                                    initial={{ opacity: 0 }}
                                                    className="absolute inset-0 pointer-events-none"
                                                >
                                                    {['👗', '👠', '👜'].map((emoji, i) => (
                                                        <motion.span
                                                            key={i}
                                                            variants={{
                                                                hover: {
                                                                    y: [0, -40, -10],
                                                                    x: [(i - 1) * 30, (i - 1) * 40],
                                                                    rotate: [0, 15, -15, 0],
                                                                    opacity: [0, 1, 0],
                                                                    transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3 }
                                                                }
                                                            }}
                                                            className="absolute top-0 left-1/2 text-xl"
                                                        >
                                                            {emoji}
                                                        </motion.span>
                                                    ))}
                                                </motion.div>
                                            </AnimatePresence>
                                        </motion.button>

                                        <motion.button
                                            whileHover="hover"
                                            onClick={() => setActiveModal('share')}
                                            className="share-style-btn group relative"
                                        >
                                            <div className="relative z-10 flex flex-col items-center gap-1">
                                                <span>Share Style</span>
                                            </div>
                                            {/* Orbiting Social Icons */}
                                            <AnimatePresence>
                                                <motion.div
                                                    variants={{
                                                        hover: { opacity: 1 }
                                                    }}
                                                    initial={{ opacity: 0 }}
                                                    className="absolute inset-0 pointer-events-none"
                                                >
                                                    {['📸', '🎵', '📍'].map((icon, i) => (
                                                        <motion.span
                                                            key={i}
                                                            variants={{
                                                                hover: {
                                                                    rotate: 360,
                                                                    transition: { duration: 3, repeat: Infinity, ease: "linear" }
                                                                }
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                width: '60px',
                                                                height: '60px',
                                                                marginLeft: '-30px',
                                                                marginTop: '-30px'
                                                            }}
                                                        >
                                                            <motion.div
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: '50%',
                                                                    transform: 'translateX(-50%)'
                                                                }}
                                                                className="text-lg"
                                                            >
                                                                {icon}
                                                            </motion.div>
                                                        </motion.span>
                                                    ))}
                                                </motion.div>
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Rewards Reveal */}

                            <div className="mt-8 flex items-center justify-center gap-10 border-t border-gray-100 pt-8 overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Star size={20} /></div>
                                    <div><span className="block text-[10px] font-black text-gray-400 uppercase">Points Pool</span><span className="font-bold text-xs">+100 XP On Purchase</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600"><Trophy size={20} /></div>
                                    <div><span className="block text-[10px] font-black text-gray-400 uppercase">Achievement</span><span className="font-bold text-xs">Signature Stylist Badge</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Layers size={20} /></div>
                                    <div><span className="block text-[10px] font-black text-gray-400 uppercase">Free Perk</span><span className="font-bold text-xs">Style Consultation PDF</span></div>
                                </div>
                            </div>

                            {/* Sub-Modals Overlay */}
                            <PostAnalysisModals
                                activeModal={activeModal}
                                setActiveModal={setActiveModal}
                                look={look}
                                archetype={archetype}
                            />
                        </div>
                    </div>
                </motion.div>

            </div>
        </AnimatePresence>
    );
};

export default SignatureStudioModal;
