import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useGameStore } from '../store/gameStore';
import {
    Filter, Sparkles, Trophy, Flame, Eye, Leaf,
    Palette, Zap, Heart, Search, X, Star, ShoppingBag, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginRequiredModal from '../components/auth/LoginRequiredModal';
import WishlistModal from '../components/modals/WishlistModal';
import ProductQuickViewModal from '../components/modals/ProductQuickViewModal';
import ProductBadge from '../components/product/ProductBadge';
import api from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import './Dresses.css'; // Reusing some shared styles if applicable or ensuring consistency

const Shop = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const { addToCart, cartCount } = useCart();
    const { points, level, experience, markBingoSquare, addPoints, bingoCard } = useGameStore();
    const collectedCount = bingoCard?.squares?.filter(s => s.marked)?.length || 0;

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [loginAction, setLoginAction] = useState("");

    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const gridRef = useRef(null);

    // Sync search/filters from URL and auto-scroll
    useEffect(() => {
        const q = searchParams.get('q') || '';
        const filter = searchParams.get('filter');
        const cat = searchParams.get('category');

        setSearchQuery(q);
        if (cat) setActiveCategory(cat);

        if ((q.trim() !== '' || filter || cat) && gridRef.current) {
            gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [searchParams]);


    // Modals
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { toggleWishlist, wishlist } = useGameStore();

    // Filters
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || "All");
    const [showFilters, setShowFilters] = useState(false);
    const [styleProfile, setStyleProfile] = useState("Boho"); // Mock user profile

    // Auto-scroll when category changes manually
    useEffect(() => {
        if (gridRef.current && activeCategory !== "All") {
            gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeCategory]);

    // Manual refresh function
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/products');
            console.log('🔄 Manual refresh: Fetched', res.data.length, 'products');
            setProducts(res.data);
            toast.success('Products refreshed!');
        } catch (err) {
            console.error("Error refreshing products:", err);
            toast.error("Failed to refresh products");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                console.log('📦 Fetched products from API:', res.data.length, 'products');
                console.log('📊 Products data:', res.data.map(p => ({
                    id: p._id,
                    name: p.name,
                    isPublished: p.isPublished,
                    category: p.category
                })));
                // Simulate gamification metadata augmentation if needed
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                toast.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        // Refresh products when page becomes visible (e.g., switching back from admin tab)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('👁️ Page visible again, refreshing products...');
                fetchProducts();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const categories = ["All", "Dresses", "Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"];

    const filteredProducts = useMemo(() => {
        // Ensure uniqueness by ID to avoid repeating dresses
        const uniqueProducts = Array.from(new Map(products.map(p => [p._id, p])).values());

        console.log('🔍 Filtering products. Total unique:', uniqueProducts.length);
        console.log('👤 Current user role:', user?.role || 'not logged in');
        console.log('📂 Active category:', activeCategory);

        const filtered = uniqueProducts.filter(p => {
            // Case-insensitive category matching (e.g., 'dresses' vs 'Dresses')
            const matchesCategory = activeCategory === "All" ||
                p.category?.toLowerCase() === activeCategory.toLowerCase() ||
                (activeCategory === "Dresses" && p.category?.toLowerCase() === "dress"); // Handle singular/plural

            // Check if product is visible (has images and name)
            const isVisible = p.images && p.images.length > 0 && p.images[0] && p.name;

            // Only show published and APPROVED products unless user is admin
            // CRITICAL: Explicitly block pending/rejected, even if !p.status would allow it (though new products should have status)
            if (user?.role !== 'admin' && (p.status === 'pending' || p.status === 'rejected')) {
                return false;
            }

            const isApproved = user?.role === 'admin' || p.status === 'approved';
            const isPublished = user?.role === 'admin' || p.isPublished !== false;

            const urlFilter = searchParams.get('filter');
            const matchesFilter = !urlFilter ||
                (urlFilter === 'newArrival' && (p.badge?.type === 'newArrival' || p.badge?.type === 'justIn')) ||
                (urlFilter === 'bestSellers' && p.salesCount > 0) ||
                (urlFilter === 'sale' && p.salePrice && p.salePrice < p.price);

            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const passes = matchesCategory && matchesFilter && !p.isExclusive && isVisible && isPublished && isApproved && matchesSearch;

            if (!passes) {
                console.log(`❌ Filtered out: ${p.name}`, {
                    matchesCategory,
                    matchesSearch,
                    isExclusive: p.isExclusive,
                    isVisible,
                    isPublished: p.isPublished,
                    passesPublishCheck: isPublished
                });
            }

            return passes;
        });

        console.log('✅ Filtered products count:', filtered.length);

        // Sort by newest first if 'newArrival' filter is active
        if (searchParams.get('filter') === 'newArrival') {
            return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Sort by sales count if 'bestSellers' filter is active
        if (searchParams.get('filter') === 'bestSellers') {
            return filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        }

        return filtered;
    }, [products, activeCategory, user, searchQuery, searchParams]);

    // --- Interaction Handlers ---
    const handleWishlist = (product) => {
        if (!user) {
            setLoginAction("add items to your wishlist");
            setIsLoginModalOpen(true);
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

    const openQuickViewFromWishlist = (product) => {
        setIsWishlistOpen(false);
        navigate(`/products/${product._id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Sparkles className="text-rosegold" size={48} />
                </motion.div>
                <div className="text-mocha font-bold tracking-widest text-sm uppercase">Curating Collection...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream font-sans pb-20">
            <Toaster position="top-center" />
            <LoginRequiredModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                actionName={loginAction}
            />


            <div className="container mx-auto px-6 mt-8">
                {/* --- Header Actions --- */}
                <div className="flex justify-end mb-8 gap-4">
                    <button
                        onClick={() => setIsWishlistOpen(true)}
                        className="relative bg-white p-4 rounded-2xl shadow-sm border border-blush/20 text-mocha hover:text-pink-500 transition-all flex items-center gap-3 group"
                    >
                        <Heart size={20} className={wishlist.length > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                        <span className="font-bold text-sm">My Wishlist</span>
                        {wishlist.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-bounce">
                                {wishlist.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-blush/20 text-mocha hover:text-blue-500 transition-all flex items-center gap-3 group disabled:opacity-50"
                        title="Refresh products"
                    >
                        <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                        <span className="font-bold text-sm">Refresh</span>
                    </button>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-blush/20 text-mocha flex items-center gap-3">
                        <ShoppingBag size={20} className="text-rosegold" />
                        <span className="font-bold text-sm">{cartCount} Items</span>
                    </div>
                </div>

                {/* --- Gamified Filters Section --- */}
                <div className="flex flex-col lg:flex-row gap-8 mb-12">
                    {/* Sidebar Filters */}
                    <div className="lg:w-64 flex-shrink-0 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blush/20">
                            <h3 className="font-bold text-mocha mb-4 flex items-center gap-2">
                                <Sparkles size={18} className="text-rosegold" />
                                Smart Filters
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl cursor-pointer hover:bg-pink-100 transition border border-pink-100">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg">👗</div>
                                    <div>
                                        <div className="text-xs font-bold text-rosegold uppercase">Style Match</div>
                                        <div className="text-sm font-bold text-mocha">Boho Vibes</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl cursor-pointer hover:bg-orange-100 transition border border-orange-100">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg">🔥</div>
                                    <div>
                                        <div className="text-xs font-bold text-orange-400 uppercase">Daily Challenge</div>
                                        <div className="text-sm font-bold text-mocha">Beach Party</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blush/20">
                            <h3 className="font-bold text-mocha mb-4 flex items-center gap-2">
                                <Filter size={18} /> Categories
                            </h3>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setActiveCategory(cat);
                                            // Clear filter if we click a category explicitly
                                            if (searchParams.get('filter')) {
                                                setSearchParams({});
                                            }
                                        }}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${activeCategory === cat ? 'bg-mocha text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- Product Grid --- */}
                    <div className="flex-1" ref={gridRef}>
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-mocha">
                                {searchParams.get('filter') === 'newArrival'
                                    ? "New Arrivals"
                                    : searchParams.get('filter') === 'bestSellers'
                                        ? "Best Sellers"
                                        : searchParams.get('filter') === 'sale'
                                            ? "Exclusive Sale"
                                            : (activeCategory === "All" ? "Trending Now" : activeCategory)}
                            </h2>
                            <div className="text-sm text-gray-400 font-medium">
                                Showing {filteredProducts.length} items
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-rosegold/20 transition-all duration-500 border border-transparent hover:border-blush/30"
                                >
                                    {/* 3D Tilt Effect Wrapper (Simulated with hover) */}
                                    <div className="h-[400px] relative overflow-hidden bg-gray-100">
                                        <Link to={`/products/${product._id}`}>
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </Link>

                                        {/* Dynamic Product Badges */}
                                        <div className="product-badge-container">
                                            <ProductBadge
                                                badge={searchParams.get('filter') === 'bestSellers'
                                                    ? { type: 'bestSeller', label: 'Best Seller', color: '#F59E0B', icon: 'star' }
                                                    : product.badge
                                                }
                                            />
                                            {!product.badge && product.gameStats.rarity && (
                                                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-mocha shadow-sm border border-blush/20 flex items-center gap-1">
                                                    ✨ {product.gameStats.rarity}
                                                </span>
                                            )}
                                            {product.gameStats.xpReward > 100 && (
                                                <span className="bg-yellow-100/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-yellow-700 shadow-sm border border-yellow-200 flex items-center gap-1 mt-2">
                                                    👑 Legend
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick Actions Sidebar (Slide in on hover) */}
                                        <div className="absolute right-4 top-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                                            <button
                                                onClick={() => handleWishlist(product)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition ${wishlist.find(i => i._id === product._id) ? 'bg-pink-500 text-white' : 'bg-white text-gray-400 hover:text-pink-500'}`}
                                                title="Waitlist (+15 XP)"
                                            >
                                                <Heart size={20} fill={wishlist.find(i => i._id === product._id) ? 'currentColor' : 'none'} />
                                            </button>
                                            <button
                                                onClick={() => handleQuickView(product)}
                                                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 shadow-md hover:scale-110 transition"
                                                title="Quick View (+5 XP)"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </div>

                                        {/* Gamified Add to Cart Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent pt-12">
                                            <button
                                                onClick={() => {
                                                    if (!user) {
                                                        setLoginAction("add stylish items to your bag");
                                                        setIsLoginModalOpen(true);
                                                        return;
                                                    }
                                                    addToCart(product);
                                                    if (product?.category) markBingoSquare(product.category, 'view', product);
                                                }}
                                                className="w-full bg-rosegold text-white py-3 rounded-xl font-bold shadow-lg hover:bg-pink-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>Add to Bag</span>
                                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                                                    +{product.gameStats.xpReward} XP
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link to={`/products/${product._id}`}>
                                                <h3 className="text-lg font-bold text-mocha group-hover:text-rosegold transition-colors line-clamp-1">{product.name}</h3>
                                            </Link>
                                            <span className="font-bold text-rosegold">₹{product.price}</span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex -space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < Math.floor(product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">({product.reviewsCount || 0})</span>
                                        </div>

                                        <div className="pt-3 border-t border-dashed border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Leaf size={12} className="text-green-500" />
                                                <span>Eco-Friendly</span>
                                            </div>
                                            <div className="text-mocha/40">
                                                Level {product.gameStats.requiredLevel}+
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Floating Game Helper --- */}
            <motion.div
                initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 2, type: "spring" }}
                className="fixed bottom-8 left-8 bg-white p-4 rounded-2xl shadow-2xl border-l-4 border-rosegold max-w-sm z-50 hidden md:block"
            >
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-rosegold text-white flex items-center justify-center text-xl">💡</div>
                    <div>
                        <h4 className="font-bold text-mocha text-sm">Stylist Tip</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Pair users matching the "Boho Vibes" profile often buy the <strong>Rose Gold Skirt</strong> to complete their collection!
                        </p>
                    </div>
                    <button className="text-gray-300 hover:text-gray-500"><X size={14} /></button>
                </div>
            </motion.div>
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
        </div>
    );
};

export default Shop;
