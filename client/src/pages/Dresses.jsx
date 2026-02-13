import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { ShoppingBag, Star, Filter, ChevronDown, Sparkles, Heart, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGameStore } from '../store/gameStore';
import WishlistModal from '../components/modals/WishlistModal';
import ProductQuickViewModal from '../components/modals/ProductQuickViewModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductBadge from '../components/product/ProductBadge';
import './Dresses.css';

const ARCHETYPES = [
    {
        id: 'all',
        name: 'All Styles',
        tagline: 'Discover your perfect look',
        description: 'Explore our complete collection of designer dresses curated for every mood and occasion.',
        heroImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2000&auto=format&fit=crop',
        color: '#000000'
    },
    {
        id: 'Romantic Dreamer',
        name: 'Romantic Dreamer',
        tagline: 'Whimsical & Feminine',
        description: 'Soft lace, delicate florals, and flowing silhouettes that evoke timeless romance.',
        heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop',
        color: '#FF6B8B'
    },
    {
        id: 'Modern Minimalist',
        name: 'Modern Minimalist',
        tagline: 'Clean & Structured',
        description: 'Architectural lines and a monochrome palette for the woman who finds power in simplicity.',
        heroImage: 'https://images.unsplash.com/photo-1539109132332-629a8b9195d0?q=80&w=2000&auto=format&fit=crop',
        color: '#2A2A2A'
    },
    {
        id: 'Boho Free Spirit',
        name: 'Boho Free Spirit',
        tagline: 'Artisanal & Earthy',
        description: 'Hand-crafted embroidery, eclectic patterns, and effortlessly layered textures.',
        heroImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2000&auto=format&fit=crop',
        color: '#D48C6A'
    },
    {
        id: 'Coastal Girl',
        name: 'Coastal Girl',
        tagline: 'Breezy & Relaxed',
        description: 'Sun-bleached linens and nautical stripes inspired by the rhythm of the waves.',
        heroImage: 'https://images.unsplash.com/photo-1518622358385-8ea7d346b08d?q=80&w=2000&auto=format&fit=crop',
        color: '#4A90E2'
    },
    {
        id: 'Edgy Trendsetter',
        name: 'Edgy Trendsetter',
        tagline: 'Bold & Avant-Garde',
        description: 'Experimental cuts, bold textures, and a fearless approach to modern fashion.',
        heroImage: 'https://images.unsplash.com/photo-1533512930330-4ac257c86793?q=80&w=2000&auto=format&fit=crop',
        color: '#9D4EDD'
    },
    {
        id: 'Classic Elegance',
        name: 'Classic Elegance',
        tagline: 'Timeless & Poised',
        description: 'Perfect tailoring and sophisticated silhouettes that redefine traditional glamour.',
        heroImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=2000&auto=format&fit=crop',
        color: '#C5A059'
    },
    {
        id: 'Street Style Cool',
        name: 'Street Style Cool',
        tagline: 'Urban & Relaxed',
        description: 'Athletic-inspired comfort mixed with city-ready edge for the modern wanderer.',
        heroImage: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1800&auto=format&fit=crop',
        color: '#4A90E2'
    },
    {
        id: 'Glamour Goddess',
        name: 'Glamour Goddess',
        tagline: 'Luxurious & Dramatic',
        description: 'Sequins, velvet, and show-stopping gowns designed for the spotlight.',
        heroImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=2000&auto=format&fit=crop',
        color: '#FF9E00'
    },
    {
        id: 'Cottagecore',
        name: 'Cottagecore',
        tagline: 'Vintage & Pastoral',
        description: 'Nostalgic gingham, puff sleeves, and sweet details inspired by a simpler life.',
        heroImage: 'https://images.unsplash.com/photo-1518349619163-02319937aaec?q=80&w=2000&auto=format&fit=crop',
        color: '#2EC4B6'
    },
    {
        id: 'Utility Chic',
        name: 'Utility Chic',
        tagline: 'Functional & Structured',
        description: 'Practical details, durable fabrics, and sharp tailoring for the woman on the move.',
        heroImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=2000&auto=format&fit=crop',
        color: '#5D445D'
    },
    {
        id: 'Artistic Eclectic',
        name: 'Artistic Eclectic',
        tagline: 'Creative & Unique',
        description: 'Bold prints, mixed patterns, and unconventional silhouettes for the artistic soul.',
        heroImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop',
        color: '#A67B94'
    },
    {
        id: 'Sophisticated Workwear',
        name: 'Sophisticated Workwear',
        tagline: 'Professional & Polished',
        description: 'Boardroom-ready dresses that command attention and project confidence.',
        heroImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2000&auto=format&fit=crop',
        color: '#2C3E50'
    }
];

const MOODS = [
    { id: 'romantic', name: 'Romantic', icon: '💖', style: 'text-rose-400 bg-rose-50' },
    { id: 'powerful', name: 'Powerful', icon: '⚡', style: 'text-amber-600 bg-amber-50' },
    { id: 'creative', name: 'Creative', icon: '🎨', style: 'text-purple-500 bg-purple-50' },
    { id: 'casual', name: 'Casual', icon: '☕', style: 'text-blue-500 bg-blue-50' }
];

const OCCASIONS = [
    { name: 'Beach', icon: '🏝️' },
    { name: 'Wedding Guest', icon: '⛪' },
    { name: 'Work', icon: '💼' },
    { name: 'Date Night', icon: '🕯️' },
    { name: 'Everyday', icon: '👕' }
];

const Dresses = () => {
    const navigate = useNavigate();
    const { styleArchetype } = useGameStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [archetypes, setArchetypes] = useState(ARCHETYPES); // Fallback to hardcoded initially
    const [activeArchetype, setActiveArchetype] = useState(ARCHETYPES[0]);
    const [activeMood, setActiveMood] = useState(null);
    const [selectedOccasion, setSelectedOccasion] = useState('All');
    const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'official', 'community'
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [loading, setLoading] = useState(true);

    const experienceRef = useRef(null);

    // Sync search from URL and auto-scroll
    useEffect(() => {
        const q = searchParams.get('q') || '';
        setSearchQuery(q);

        if (q.trim() !== '' && experienceRef.current) {
            experienceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [searchParams]);

    // Auto-scroll when filters change
    useEffect(() => {
        if (experienceRef.current) {
            experienceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeArchetype, activeMood, selectedOccasion]);
    const { user } = useAuth();
    const { addToCart } = useCart();
    const sliderRef = useRef(null);

    const scrollSlider = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const { toggleWishlist, wishlist, addPoints, markBingoSquare } = useGameStore();

    // Modals
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const openQuickViewFromWishlist = (product) => {
        setIsWishlistOpen(false);
        navigate(`/products/${product._id}`);
    };

    // Personalization hook
    useEffect(() => {
        if (styleArchetype && activeArchetype.id === 'all') {
            const matched = archetypes.find(a => a.id === styleArchetype || a.name === styleArchetype);
            if (matched) {
                setActiveArchetype(matched);
                toast.success(`Welcome back! Browsing ${matched.name} collection.`, {
                    icon: '🎀',
                    duration: 4000
                });
            }
        }
    }, [styleArchetype, archetypes]);

    useEffect(() => {
        const fetchDresses = async () => {
            try {
                // Fetch products and archetypes in parallel
                const [productRes, archetypeRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories/archetypes')
                ]);

                console.log('📦 Products received from API:', productRes.data);
                setProducts(productRes.data);

                if (archetypeRes.data && archetypeRes.data.length > 0) {
                    // Combine "All Styles" with dynamic archetypes, and MERGE hardcoded metadata
                    const mergedArchetypes = archetypeRes.data.map(dbArch => {
                        const hardcoded = ARCHETYPES.find(a =>
                            a.id === dbArch.id ||
                            a.name === dbArch.name ||
                            a.id?.toLowerCase() === dbArch.id?.toLowerCase()
                        );

                        // Only override if DB value exists and is not empty
                        const merged = { ...hardcoded };
                        Object.keys(dbArch).forEach(key => {
                            if (dbArch[key] !== undefined && dbArch[key] !== null && dbArch[key] !== '') {
                                merged[key] = dbArch[key];
                            }
                        });
                        return merged;
                    });

                    const dynamicArchetypes = [ARCHETYPES[0], ...mergedArchetypes];
                    setArchetypes(dynamicArchetypes);

                    // If we haven't matched a personalization yet, keep default or set to first matched
                    if (styleArchetype) {
                        const matched = dynamicArchetypes.find(a =>
                            a.id === styleArchetype ||
                            a.name === styleArchetype ||
                            a.id?.toLowerCase() === styleArchetype.toLowerCase()
                        );
                        if (matched) setActiveArchetype(matched);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to load dresses", err);
                toast.error("Could not load products.");
                setLoading(false);
            }
        };
        fetchDresses();
    }, [styleArchetype]);

    const filteredDresses = useMemo(() => {
        // Ensure uniqueness by ID to avoid repeating dresses
        const uniqueProducts = Array.from(new Map(products.map(p => [p._id, p])).values());

        return uniqueProducts.filter(dress => {
            if (dress.isExclusive) return false;

            // Visibility check: must have images and a valid name
            const isVisible = dress.images && dress.images.length > 0 && dress.images[0] && dress.name;
            if (!isVisible) return false;

            // CRITICAL: Explicitly block pending/rejected, even if !p.status would allow it
            if (user?.role !== 'admin' && (dress.status === 'pending' || dress.status === 'rejected')) {
                return false;
            }

            // Only show published and APPROVED dresses unless user is admin
            const isApproved = user?.role === 'admin' || dress.status === 'approved';
            const isPublished = user?.role === 'admin' || dress.isPublished !== false;
            if (!isApproved || !isPublished) return false;

            // Source Filter
            if (sourceFilter === 'official' && dress.vendorId) return false;
            if (sourceFilter === 'community' && !dress.vendorId) return false;

            // Handle archetype as array
            const dressArchetypes = Array.isArray(dress.archetype) ? dress.archetype : [dress.archetype].filter(Boolean);
            const activeId = String(activeArchetype.id || '').toLowerCase().trim();
            const activeName = String(activeArchetype.name || '').toLowerCase().trim();

            const matchesArchetype = activeArchetype.id === 'all' ||
                dressArchetypes.some(arch => {
                    const archStr = String(arch || '').toLowerCase().trim();
                    return archStr === activeId || archStr === activeName;
                });

            const matchesSearch = dress.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dress.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            // Handle mood and occasion as arrays
            const dressMoods = Array.isArray(dress.mood) ? dress.mood : [dress.mood].filter(Boolean);
            const dressOccasions = Array.isArray(dress.occasion) ? dress.occasion : [dress.occasion].filter(Boolean);

            const matchesMood = !activeMood || dressMoods.includes(activeMood);
            const matchesOccasion = selectedOccasion === 'All' || dressOccasions.includes(selectedOccasion);

            return matchesArchetype && matchesSearch && matchesMood && matchesOccasion;
        });
    }, [products, activeArchetype, searchQuery, activeMood, selectedOccasion, user, sourceFilter]);

    // Debug logging
    useEffect(() => {
        console.log('🔍 Filtering Debug:');
        console.log('Total products:', products.length);
        console.log('Active archetype:', activeArchetype);
        console.log('Filtered dresses:', filteredDresses.length);

        if (activeArchetype.id !== 'all') {
            const matchingProducts = products.filter(p => {
                const archetypes = Array.isArray(p.archetype) ? p.archetype : [p.archetype].filter(Boolean);
                return archetypes.some(arch =>
                    arch === activeArchetype.id ||
                    arch === activeArchetype.name ||
                    arch?.toLowerCase() === activeArchetype.id?.toLowerCase() ||
                    arch?.toLowerCase() === activeArchetype.name?.toLowerCase()
                );
            });
            console.log(`Products with archetype "${activeArchetype.name}":`, matchingProducts.length);
            console.log('Sample product archetypes:', products.slice(0, 5).map(p => ({ name: p.name, archetype: p.archetype })));
        }
    }, [filteredDresses, products, activeArchetype]);

    const handleAddToCart = (dress) => {
        addToCart(dress);
        toast.success(`+${dress.gameStats?.xpReward || 50} XP`, {
            icon: '✨',
            style: {
                borderRadius: '15px',
                background: '#333',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
            },
        });
    };

    const handleWishlist = (product) => {
        if (!user) {
            toast.error("Please login to save items!");
            return;
        }
        toggleWishlist(product);
        markBingoSquare(product.category || 'Dress', 'wishlist', product);
    };

    const handleQuickView = (product) => {
        navigate(`/products/${product._id}`);
        addPoints(5);
        if (product.category) markBingoSquare(product.category, 'view', product);
    };

    return (
        <div className="dress-collection-container">
            {/* Archetype Selector */}
            <nav className="archetype-selector no-scrollbar">
                {archetypes.map(archetype => (
                    <button
                        key={archetype._id || archetype.id}
                        onClick={() => setActiveArchetype(archetype)}
                        className={`archetype-chip ${activeArchetype.id === archetype.id || activeArchetype.name === archetype.name ? 'active' : ''}`}
                        style={activeArchetype.name === archetype.name ? { backgroundColor: archetype.primaryColor || archetype.color, color: '#fff', borderColor: 'transparent' } : {}}
                    >
                        {archetype.name}
                    </button>
                ))}
            </nav>

            {/* Hero Section */}
            <motion.section
                key={activeArchetype.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="archetype-hero"
                style={{ backgroundImage: `url(${activeArchetype.bannerImage || activeArchetype.heroImage})` }}
            >
                <div className="hero-content">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30"
                    >
                        <Sparkles className="text-white" size={24} />
                    </motion.div>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white uppercase font-black tracking-[0.3em] text-xs mb-3 shadow-sm"
                    >
                        Signature Archetype
                    </motion.p>
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-black"
                    >
                        {activeArchetype.name}
                    </motion.h1>
                    <motion.p
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="font-medium text-lg text-white/90"
                    >
                        "{activeArchetype.tagline}"
                    </motion.p>
                </div>
            </motion.section>

            {/* Experience Controls */}
            <div
                ref={experienceRef}
                className="bg-gradient-to-r from-white via-pink-50/30 to-purple-50/30 border-b border-gray-100 py-6 px-[5%] experience-controls-container sticky top-0 z-40 shadow-md backdrop-blur-sm"
            >
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    {/* Source Filter Row */}
                    <div className="flex flex-col md:flex-row gap-4 justify-end items-center">
                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-gray-200 shadow-sm">
                            {['all', 'official', 'community'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setSourceFilter(filter)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${sourceFilter === filter
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {filter === 'all' ? 'All Sources' : filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full" />

                    {/* Bottom Row: Detailed Filters */}
                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        {/* Mood Match */}
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Sparkles size={12} className="text-pink-500" /> Current Mood
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {MOODS.map(mood => (
                                    <button
                                        key={mood.id}
                                        onClick={() => setActiveMood(activeMood === mood.id ? null : mood.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${activeMood === mood.id
                                            ? `${mood.style} border-transparent ring-2 ring-offset-2 ring-current shadow-lg scale-105`
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span>{mood.icon}</span>
                                        <span>{mood.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Occasion Planner */}
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Filter size={12} className="text-pink-500" /> Occasion
                            </span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedOccasion('All')}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${selectedOccasion === 'All'
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg scale-105'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    All
                                </button>
                                {OCCASIONS.map(occ => (
                                    <button
                                        key={occ.name}
                                        onClick={() => setSelectedOccasion(occ.name)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${selectedOccasion === occ.name
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg scale-105'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span>{occ.icon}</span>
                                        <span>{occ.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personalized Recommendations Section */}
            {
                styleArchetype && activeArchetype.id === styleArchetype && (
                    <section className="personalized-section py-12 px-[5%] bg-gradient-to-r from-pink-50 to-purple-50">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <Sparkles className="text-rosegold" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-mocha">Personalized Picks for You</h3>
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Based on your {styleArchetype} DNA</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {products.filter(p => {
                                    const archetypes = Array.isArray(p.archetype) ? p.archetype : [p.archetype].filter(Boolean);
                                    return archetypes.includes(styleArchetype) && p.gameStats?.rarity === 'Legendary';
                                }).slice(0, 3).map(dress => (
                                    <motion.div
                                        key={`rec-${dress._id}`}
                                        whileHover={{ y: -5 }}
                                        className="bg-white p-4 rounded-[2rem] shadow-xl border border-white flex gap-4 cursor-pointer group"
                                    >
                                        <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={dress.images[0]} alt={dress.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="text-[10px] font-black text-yellow-500 uppercase mb-1">Legendary Match</div>
                                            <h4 className="font-bold text-mocha line-clamp-1">{dress.name}</h4>
                                            <p className="text-rosegold font-black text-sm">₹{dress.price}</p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(dress);
                                                }}
                                                className="mt-2 text-xs font-black text-mocha hover:text-rosegold transition flex items-center gap-1"
                                            >
                                                Quick Add <ChevronDown size={12} className="-rotate-90" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Content Logic */}
            <section className="category-intro py-16">
                <motion.h2
                    key={activeArchetype.name}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-black mb-4"
                >
                    {activeArchetype.id === 'all' ? 'Signature Dress Library' : `${activeArchetype.name} Edits`}
                </motion.h2>
                <p className="text-gray-500 font-medium">
                    {activeArchetype.description}
                </p>
            </section>

            {/* Product Slider Section */}
            <div className="product-slider-wrapper">
                <button
                    className="slider-arrow prev"
                    onClick={() => scrollSlider('left')}
                    aria-label="Previous styles"
                >
                    <ChevronDown size={24} className="rotate-90" />
                </button>

                <main className="dresses-grid" ref={sliderRef}>
                    <AnimatePresence mode='popLayout'>
                        {filteredDresses.map((dress, index) => (
                            <motion.div
                                layout
                                key={dress._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="dress-card"
                            >
                                <div className="dress-image-container">
                                    <Link to={`/products/${dress._id}`}>
                                        <img src={dress.images[0]} alt={dress.name} className="dress-image" />
                                    </Link>
                                    <div className="dress-overlay">
                                        <button
                                            onClick={() => handleQuickView(dress)}
                                            className="quick-view-btn flex flex-col items-center gap-1"
                                        >
                                            <span>Quick View</span>
                                            <span className="text-[10px] opacity-70">Focus Detail</span>
                                        </button>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="product-badge-container">
                                        <ProductBadge badge={dress.badge} />
                                        {!dress.badge && dress.gameStats?.rarity && (
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg backdrop-blur-md ${dress.gameStats.rarity === 'Legendary' ? 'bg-yellow-400 text-black' :
                                                dress.gameStats.rarity === 'Rare' ? 'bg-purple-500 text-white' :
                                                    'bg-white/80 text-mocha'
                                                }`}>
                                                {dress.gameStats.rarity}
                                            </div>
                                        )}
                                        {dress.gameStats?.requiredLevel > 1 && (
                                            <div className="bg-black/80 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg backdrop-blur-md flex items-center gap-1 mt-2">
                                                <Star size={8} className="fill-yellow-400 text-yellow-400" />
                                                Lvl {dress.gameStats.requiredLevel}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="dress-info">
                                    <div className="flex justify-between items-start">
                                        <div className="dress-archetype-tag" style={{ color: activeArchetype.color }}>
                                            {Array.isArray(dress.archetype) ? dress.archetype.join(', ') : dress.archetype}
                                        </div>
                                        <button
                                            onClick={() => handleWishlist(dress)}
                                            className={`transition-all ${wishlist.find(i => i._id === dress._id) ? 'text-pink-500' : 'text-gray-300 hover:text-pink-500'}`}
                                        >
                                            <Heart size={18} fill={wishlist.find(i => i._id === dress._id) ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>
                                    <Link to={`/products/${dress._id}`}>
                                        <h3 className="dress-name">{dress.name}</h3>
                                    </Link>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="dress-price font-black text-lg text-mocha">₹{dress.price}</p>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} className={i < Math.floor(dress.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {(dress.tags || []).slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[9px] bg-gray-100 px-2 py-1 rounded-md text-gray-400 font-bold uppercase tracking-wider">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </main>

                <button
                    className="slider-arrow next"
                    onClick={() => scrollSlider('right')}
                    aria-label="Next styles"
                >
                    <ChevronDown size={24} className="-rotate-90" />
                </button>
            </div>

            {
                loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Sparkles className="w-12 h-12 text-gray-200 animate-pulse mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest">Collecting Styles...</p>
                    </div>
                )
            }

            {
                !loading && filteredDresses.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg font-medium">No dresses found for this selection.</p>
                    </div>
                )
            }
            {/* --- Modals --- */}
            <WishlistModal
                isOpen={isWishlistOpen}
                onClose={() => setIsWishlistOpen(false)}
                onOpenProduct={openQuickViewFromWishlist}
            />

            <ProductQuickViewModal
                isOpen={isQuickViewOpen}
                product={selectedProduct}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </div >
    );
};

export default Dresses;
