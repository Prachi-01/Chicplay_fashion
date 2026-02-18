import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Heart, Share2, Star, Truck, ShieldCheck,
    ChevronLeft, ChevronRight, ZoomIn, Check, X, Sparkles,
    Package, Ruler, Leaf, Award, ArrowRight, Home, Gift, RefreshCw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import ProductBadge from '../components/product/ProductBadge';
import SizeCalculator from '../components/SizeCalculator';
import FootwearSizeModal from '../components/modals/FootwearSizeModal';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart, cart } = useCart();
    const { toggleWishlist, wishlist, addPoints, markBingoSquare } = useGameStore();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [similarProducts, setSimilarProducts] = useState([]);
    const [showCartModal, setShowCartModal] = useState(false);
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [showFootwearSizeModal, setShowFootwearSizeModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [showFullReviewModal, setShowFullReviewModal] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isZooming, setIsZooming] = useState(false);
    const [isVendorOpen, setIsVendorOpen] = useState(false);

    // Review State
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [canReview, setCanReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', fit: 'True to Size', bodyType: '' });

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (user) checkReviewEligibility();
    }, [id, user]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);

            // Set default color
            if (res.data.colorVariations?.length > 0) {
                setSelectedColorIndex(0);
            }

            // Set default size
            const hasVariations = res.data.colorVariations?.length > 0;
            const sizeStock = hasVariations
                ? res.data.colorVariations[0].sizeStock
                : res.data.sizeStock;

            if (sizeStock?.length > 0) {
                const availableSize = sizeStock.find(s => s.quantity > 0);
                if (availableSize) setSelectedSize(availableSize.size);
            }

            // Fetch similar products
            fetchSimilarProducts(res.data.category);
        } catch (err) {
            console.error('Error fetching product:', err);
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const fetchSimilarProducts = async (category) => {
        try {
            const res = await api.get('/products');
            const similar = res.data
                .filter(p => p.category === category && p._id !== id && p.status === 'approved')
                .slice(0, 6);
            setSimilarProducts(similar);
        } catch (err) {
            console.error('Error fetching similar products:', err);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data.reviews || []);
            setReviewStats(res.data.stats || null);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const checkReviewEligibility = async () => {
        try {
            const res = await api.get(`/reviews/eligibility/${id}`);
            setCanReview(res.data.canReview);
        } catch (err) {
            console.error('Error checking eligibility:', err);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewData.comment.trim()) {
            toast.error('Please add a comment');
            return;
        }

        setIsSubmittingReview(true);
        try {
            await api.post('/reviews', { ...reviewData, productId: id });
            toast.success('🎉 Thank you! Review submitted.');
            setShowReviewForm(false);
            setReviewData({ rating: 5, comment: '', fit: 'True to Size', bodyType: '' });
            fetchReviews();
            checkReviewEligibility();
            fetchProduct(); // Refresh overall rating
        } catch (err) {
            console.error('Error submitting review:', err);
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error('Please select a size first!');
            return;
        }

        const hasVariations = product.colorVariations?.length > 0;
        const selectedVariation = hasVariations ? product.colorVariations[selectedColorIndex] : null;
        const currentStockList = hasVariations ? selectedVariation.sizeStock : product.sizeStock;
        const stockItem = currentStockList?.find(s => s.size === selectedSize);

        let availableStock;
        if (stockItem && typeof stockItem.quantity === 'number') {
            availableStock = stockItem.quantity;
        } else {
            availableStock = product.stock || 0;
        }

        const cartItem = cart.find(item =>
            item._id === product._id &&
            item.size === selectedSize &&
            item.selectedColor === (selectedVariation?.colorName || product.attributes?.color)
        );
        const currentCartQty = cartItem ? cartItem.quantity : 0;

        if (availableStock <= 0) {
            toast.error(`Sorry, size ${selectedSize} is out of stock!`);
            return;
        }

        if (currentCartQty + 1 > availableStock) {
            toast.error(`Sorry, we only have ${availableStock} left in this size!`);
            return;
        }

        const displayImages = getDisplayImages();
        addToCart({
            ...product,
            size: selectedSize,
            selectedColor: selectedVariation?.colorName || product.attributes?.color,
            displayedImage: displayImages[currentImageIndex]?.url || product.images[0]
        });

        addPoints(product.gameStats?.xpReward || 10);
        if (product.category) markBingoSquare(product.category, 'purchase', product);

        setShowCartModal(true);
    };

    const handleWishlist = () => {
        toggleWishlist(product);
        addPoints(15);
        if (product.category) markBingoSquare(product.category, 'wishlist', product);
    };

    const handleColorChange = (index) => {
        setSelectedColorIndex(index);
        setCurrentImageIndex(0);
        setSelectedSize('');
    };

    const handleMouseMove = (e) => {
        if (!isZooming) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    const getDisplayImages = () => {
        const hasVariations = product.colorVariations?.length > 0;
        const selectedVariation = hasVariations ? product.colorVariations[selectedColorIndex] : null;

        if (hasVariations && selectedVariation) {
            return Object.entries(selectedVariation.images)
                .filter(([_, url]) => url)
                .map(([type, url]) => ({ type, url }));
        }
        return product.images.map((url, idx) => ({ type: idx === 0 ? 'front' : 'other', url }));
    };

    const isInWishlist = wishlist.find(item => item._id === product?._id);

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Sparkles className="text-rosegold" size={48} />
                </motion.div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
                <h2 className="text-3xl font-bold text-mocha mb-4">Product not found</h2>
                <Link to="/shop" className="text-rosegold hover:underline">Return to Shop</Link>
            </div>
        );
    }

    const hasVariations = product.colorVariations?.length > 0;
    const selectedVariation = hasVariations ? product.colorVariations[selectedColorIndex] : null;
    const displayImages = getDisplayImages();
    const currentImageData = displayImages[currentImageIndex] || displayImages[0];
    const currentSizeStock = hasVariations ? selectedVariation?.sizeStock : product.sizeStock;

    return (
        <div className="min-h-screen bg-cream pb-20">
            {/* Simple Back Button */}
            <div className="container mx-auto px-6 py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-mocha/60 hover:text-rosegold transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-blush/10 group-hover:bg-rosegold group-hover:text-white transition-all">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Back</span>
                </button>
            </div>

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Side - Image Gallery (Sticky) */}
                    <div className="lg:sticky lg:top-24 space-y-6">
                        {/* Main Image with Zoom */}
                        <div
                            className="product-image-container relative bg-white rounded-3xl overflow-hidden shadow-lg border border-blush/20"
                            onMouseMove={handleMouseMove}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={`${selectedColorIndex}-${currentImageIndex}`}
                                    src={currentImageData?.url}
                                    alt={product.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-[600px] object-cover"
                                    style={isZooming ? {
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                        transform: 'scale(2)',
                                        transition: 'transform 0.2s ease-out'
                                    } : {}}
                                />
                            </AnimatePresence>

                            {/* Badge */}
                            <div className="absolute top-4 left-4">
                                <ProductBadge badge={product.badge} />
                            </div>

                            {/* Zoom Toggle Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsZooming(!isZooming)}
                                className={`absolute top-4 right-4 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg border transition-all ${isZooming
                                    ? 'bg-rosegold text-white border-rosegold'
                                    : 'bg-white/90 text-mocha border-blush/20 hover:border-rosegold'
                                    }`}
                            >
                                <ZoomIn size={18} />
                                {isZooming ? 'Zoomed 2x' : 'Click to Zoom'}
                            </motion.button>

                            {/* Navigation Arrows */}
                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition z-10"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition z-10"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Thumbnails */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-12 h-16 rounded-xl overflow-hidden border-2 transition-all relative ${idx === currentImageIndex ? 'border-mocha scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[7px] text-white font-black uppercase py-0.5 text-center">
                                            {img.type}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="lg:h-[600px] lg:overflow-y-scroll custom-scrollbar pr-6 space-y-6 flex flex-col">
                        <div className="pb-24 space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        {product.archetype && (
                                            <p className="text-xs font-black text-rosegold uppercase tracking-widest mb-1">
                                                {Array.isArray(product.archetype) ? product.archetype[0] : product.archetype}
                                            </p>
                                        )}
                                        <h1 className="text-4xl font-black text-mocha leading-tight">{product.name}</h1>
                                        {selectedVariation && (
                                            <p className="text-sm font-bold text-gray-400 mt-1 italic">Color: {selectedVariation.colorName}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleWishlist}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isInWishlist ? 'bg-pink-50 text-pink-500 scale-110' : 'bg-white text-gray-400 hover:text-pink-500'
                                            }`}
                                    >
                                        <Heart size={24} fill={isInWishlist ? 'currentColor' : 'none'} />
                                    </button>
                                </div>

                                {/* Price & Rating */}
                                <div className="flex items-center gap-6 mb-6">
                                    <p className="text-5xl font-black text-rosegold">₹{product.salePrice || product.price}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={18}
                                                    className={i < Math.floor(product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-400 font-bold">({product.reviewsCount || 0} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-blush/20">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Product Vision</h4>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    {product.description || "A masterfully crafted piece designed to blend timeless elegance with modern comfort."}
                                </p>
                            </div>

                            {/* Fabric & Eco Score */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase mb-1">Fabric</h5>
                                    <p className="text-sm font-bold text-mocha">{product.attributes?.material || 'Premium Silk Blend'}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase mb-1">Sustainability</h5>
                                    <div className="flex items-center gap-1">
                                        <Leaf size={14} className="text-green-500" />
                                        <p className="text-sm font-bold text-mocha">92% Eco-Score</p>
                                    </div>
                                </div>
                            </div>

                            {/* Color Variations */}
                            {hasVariations && (
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Signature Colors</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {product.colorVariations.map((variation, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleColorChange(i)}
                                                className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 relative ${selectedColorIndex === i ? 'border-mocha shadow-xl scale-125' : 'border-white shadow-sm'
                                                    }`}
                                                style={{ backgroundColor: variation.hexCode }}
                                                title={variation.colorName}
                                            >
                                                {selectedColorIndex === i && (
                                                    <motion.div
                                                        layoutId="color-active"
                                                        className="absolute -bottom-2 -right-2 w-6 h-6 bg-mocha text-white rounded-full flex items-center justify-center shadow-lg"
                                                    >
                                                        <Check size={14} strokeWidth={4} />
                                                    </motion.div>
                                                )}
                                                {!variation.available && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference">
                                                        <X size={18} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {currentSizeStock && currentSizeStock.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Available Sizes</h4>
                                        <button
                                            onClick={() => {
                                                if (product.category === 'shoes') {
                                                    setShowFootwearSizeModal(true);
                                                } else {
                                                    setShowSizeModal(true);
                                                }
                                            }}
                                            className="flex items-center gap-1.5 text-rosegold hover:text-mocha transition-colors text-xs font-bold uppercase tracking-wider group"
                                        >
                                            <Ruler size={16} className="group-hover:scale-110 transition-transform" />
                                            {product.category === 'shoes' ? 'Size Chart' : 'Size Calculator'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {currentSizeStock.map(s => {
                                            const isOutOfStock = s.quantity <= 0;
                                            return (
                                                <button
                                                    key={s.size}
                                                    disabled={isOutOfStock}
                                                    onClick={() => setSelectedSize(s.size)}
                                                    className={`min-w-[64px] h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative ${selectedSize === s.size
                                                        ? 'border-mocha bg-mocha text-white shadow-lg scale-105'
                                                        : isOutOfStock
                                                            ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60'
                                                            : 'border-gray-100 text-mocha hover:border-mocha/30 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="text-sm font-black">{s.size}</span>
                                                    <span className={`text-[8px] font-bold uppercase mt-0.5 ${isOutOfStock ? 'text-red-400' : 'opacity-40'}`}>
                                                        {isOutOfStock ? 'Sold Out' : `${s.quantity} Left`}
                                                    </span>
                                                    {selectedSize === s.size && (
                                                        <motion.div layoutId="size-active" className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons with XP */}
                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-mocha text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                                >
                                    <ShoppingBag size={24} />
                                    ADD TO BAG
                                </motion.button>
                                <div className="bg-orange-50 px-6 py-2 rounded-2xl flex flex-col items-center justify-center border border-orange-100">
                                    <span className="text-[10px] font-black text-orange-400 uppercase">XP Reward</span>
                                    <span className="text-2xl font-black text-mocha">+{product.gameStats?.xpReward || 50}</span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-5 bg-white text-mocha rounded-2xl shadow-lg hover:text-blue-500 transition-all border-2 border-blush/20"
                                >
                                    <Share2 size={24} />
                                </motion.button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/60 backdrop-blur rounded-2xl p-4 text-center border border-blush/20">
                                    <Truck className="mx-auto mb-2 text-rosegold" size={24} />
                                    <p className="text-xs font-bold text-mocha">Free Shipping</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur rounded-2xl p-4 text-center border border-blush/20">
                                    <ShieldCheck className="mx-auto mb-2 text-rosegold" size={24} />
                                    <p className="text-xs font-bold text-mocha">Secure Payment</p>
                                </div>
                                <div className="bg-white/60 backdrop-blur rounded-2xl p-4 text-center border border-blush/20">
                                    <Leaf className="mx-auto mb-2 text-rosegold" size={24} />
                                    <p className="text-xs font-bold text-mocha">Eco-Friendly</p>
                                </div>
                            </div>

                            {/* Specifications */}
                            {product.specifications && product.specifications.length > 0 && (
                                <div className="bg-white rounded-3xl p-6 border border-blush/20">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Detailed Specifications</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[...product.specifications].sort((a, b) => (a.order || 0) - (b.order || 0)).map((spec, idx) => (
                                            <div key={idx} className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl flex-shrink-0">
                                                    {spec.icon || '✨'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider truncate mb-0.5">{spec.key}</h5>
                                                    <p className="text-xs font-bold text-mocha leading-tight">{spec.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Vendor Details Accordion */}
                            {product.vendorDetails && (
                                <div className="border-t border-b border-gray-100 py-4">
                                    <button
                                        onClick={() => setIsVendorOpen(!isVendorOpen)}
                                        className="w-full flex items-center justify-between text-left group"
                                    >
                                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Vendor Details</span>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isVendorOpen ? 'bg-mocha text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-mocha/10 group-hover:text-mocha'
                                            }`}>
                                            {isVendorOpen ? (
                                                <div className="w-3 h-0.5 bg-white rounded-full" />
                                            ) : (
                                                <div className="relative w-3 h-3 flex items-center justify-center">
                                                    <div className="absolute w-3 h-0.5 bg-current rounded-full" />
                                                    <div className="absolute w-0.5 h-3 bg-current rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isVendorOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-6 pb-2 space-y-4">
                                                    <div>
                                                        <h5 className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">Sold by</h5>
                                                        <p className="text-sm font-medium text-gray-500">
                                                            {product.vendorDetails.soldBy || "ChicPlay Fashion"}
                                                        </p>
                                                    </div>
                                                    {product.vendorDetails.manufacturerName && (
                                                        <div>
                                                            <h5 className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">Manufacturer</h5>
                                                            <p className="text-sm font-medium text-gray-500">
                                                                {product.vendorDetails.manufacturerName}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {product.vendorDetails.manufacturerAddress && (
                                                        <div>
                                                            <h5 className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">Address</h5>
                                                            <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                                                {product.vendorDetails.manufacturerAddress}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>

            {/* Reviews Section - Full Width Below the Grid */}
            <div className="full-width-section mt-20 border-t border-gray-100 pt-16">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-mocha mb-2">Customer Reviews</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={24} fill={i < Math.floor(reviewStats?.averageRating || 0) ? "currentColor" : "none"} />
                                    ))}
                                </div>
                                <span className="text-xl font-bold text-mocha">{reviewStats?.averageRating || 0} out of 5</span>
                                <span className="text-mocha/40">•</span>
                                <span className="text-mocha/60">{reviews.length} total reviews</span>
                            </div>
                        </div>

                        {canReview && !showReviewForm && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowReviewForm(true)}
                                className="bg-rosegold text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-rosegold/20"
                            >
                                WRITE A REVIEW
                            </motion.button>
                        )}
                    </div>

                    {/* Review Form */}
                    <AnimatePresence>
                        {showReviewForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-12 overflow-hidden"
                            >
                                <form onSubmit={handleReviewSubmit} className="bg-white rounded-3xl p-8 border-2 border-blush/20 shadow-xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-black text-mocha">Share Your Experience</h3>
                                        <button type="button" onClick={() => setShowReviewForm(false)} className="text-mocha/40 hover:text-mocha">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Overall Rating</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${reviewData.rating >= star ? 'bg-yellow-400 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            <Star size={24} fill={reviewData.rating >= star ? "currentColor" : "none"} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">How does it fit?</label>
                                                <div className="flex gap-3">
                                                    {['Runs Small', 'True to Size', 'Runs Large'].map((f) => (
                                                        <button
                                                            key={f}
                                                            type="button"
                                                            onClick={() => setReviewData({ ...reviewData, fit: f })}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${reviewData.fit === f ? 'border-mocha bg-mocha text-white' : 'border-gray-100 text-gray-500 hover:border-mocha/20'
                                                                }`}
                                                        >
                                                            {f}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Review Comment</label>
                                            <textarea
                                                required
                                                value={reviewData.comment}
                                                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                                placeholder="What did you love about this piece? How was the fabric and style?"
                                                className="w-full h-32 bg-gray-50 rounded-2xl p-4 border-2 border-transparent focus:border-rosegold/30 focus:bg-white outline-none transition-all text-mocha placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmittingReview}
                                            className={`bg-mocha text-white px-12 py-4 rounded-2xl font-black shadow-xl transition-all flex items-center gap-3 ${isSubmittingReview ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black'
                                                }`}
                                        >
                                            {isSubmittingReview ? <RefreshCw className="animate-spin" size={20} /> : <Award size={20} />}
                                            SUBMIT REVIEW
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Reviews List */}
                    <div className="space-y-8">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <motion.div
                                    key={review._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-3xl p-8 border border-blush/20 shadow-sm"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 group cursor-pointer"
                                        onClick={() => {
                                            setSelectedReview(review);
                                            setShowFullReviewModal(true);
                                        }}>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex gap-1 text-yellow-400 mb-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                    <h4 className="font-black text-mocha">{review.userName}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                        <span>Verified Purchase</span>
                                                        <span>•</span>
                                                        <span>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-3 py-1 bg-pink-50 text-rosegold text-[10px] font-black rounded-full uppercase">
                                                        {review.fit}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-mocha/70 font-medium leading-relaxed italic">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-mocha/5 rounded-3xl border-2 border-dashed border-mocha/10">
                                <Sparkles className="mx-auto mb-4 text-mocha/10" size={48} />
                                <h3 className="text-xl font-black text-mocha/30">No reviews yet</h3>
                            </div>
                        )}
                    </div>

                    {/* Similar Products */}
                    {similarProducts.length > 0 && (
                        <div className="pt-16 border-t border-gray-100">
                            <h2 className="text-2xl font-black text-mocha mb-8 flex items-center gap-3">
                                <Sparkles className="text-rosegold" size={24} />
                                More to Discover
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {similarProducts.slice(0, 6).map((item) => (
                                    <motion.div
                                        key={item._id}
                                        whileHover={{ y: -8 }}
                                        onClick={() => navigate(`/products/${item._id}`)}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-blush/20"
                                    >
                                        <div className="relative aspect-[3/4] bg-gray-100">
                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 left-2 scale-75 origin-top-left">
                                                <ProductBadge badge={item.badge} />
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-bold text-mocha text-xs mb-1 line-clamp-1">{item.name}</h3>
                                            <p className="text-rosegold font-black text-sm">₹{item.price}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full-Screen Review Modal */}
            <AnimatePresence>
                {showFullReviewModal && selectedReview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-6 md:p-12"
                    >
                        <button
                            onClick={() => setShowFullReviewModal(false)}
                            className="absolute top-8 right-8 text-mocha/40 hover:text-mocha transition-colors p-2 rounded-full hover:bg-mocha/5"
                        >
                            <X size={32} />
                        </button>

                        <div className="max-w-4xl w-full">
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="space-y-12"
                            >
                                <div className="space-y-6 text-center">
                                    <div className="flex justify-center gap-2 text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={24} fill={i < selectedReview.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-mocha leading-tight">
                                        "{selectedReview.comment}"
                                    </h2>
                                    <div className="flex items-center justify-center gap-4 text-xl font-black text-mocha">
                                        <div className="w-12 h-12 rounded-full bg-rosegold/10 flex items-center justify-center text-rosegold">
                                            {selectedReview.userName.charAt(0)}
                                        </div>
                                        <span>{selectedReview.userName}</span>
                                        <span className="text-mocha/20">|</span>
                                        <span className="text-rosegold uppercase tracking-widest text-sm">{selectedReview.fit}</span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-mocha/5">
                                    <div className="bg-cream/50 rounded-4xl p-8 space-y-4">
                                        <h4 className="text-xs font-black text-mocha/40 uppercase tracking-tighter">Product details</h4>
                                        <p className="text-2xl font-black text-mocha">{product.name}</p>
                                        <div className="flex gap-2">
                                            <span className="px-4 py-2 bg-white rounded-xl text-sm font-bold shadow-sm">Size: Selected</span>
                                            <span className="px-4 py-2 bg-white rounded-xl text-sm font-bold shadow-sm">Color: {product.color}</span>
                                        </div>
                                    </div>
                                    <div className="bg-mocha text-white rounded-4xl p-8 space-y-4 shadow-2xl">
                                        <Award className="text-rosegold" size={32} />
                                        <h4 className="text-xs font-black text-white/40 uppercase tracking-tighter">Verified Reviewer</h4>
                                        <p className="text-lg font-medium opacity-80 leading-relaxed">
                                            This player has confirmed they own this item and has worn it. Their feedback helps our community of fashion gamers!
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add to Cart Success Modal */}
            <AnimatePresence>
                {showCartModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCartModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="text-green-600" size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-mocha mb-2">Added to Bag!</h3>
                                <p className="text-mocha/60">Your item has been added successfully</p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowCartModal(false)}
                                    className="flex-1 bg-white text-mocha border-2 border-blush/20 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Continue Shopping
                                </button>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="flex-1 bg-rosegold text-white py-4 rounded-2xl font-bold hover:bg-pink-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Go to Cart
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Size Modals */}
            <AnimatePresence>
                {showSizeModal && createPortal(
                    <SizeCalculator
                        onClose={() => setShowSizeModal(false)}
                    />,
                    document.body
                )}
                {showFootwearSizeModal && createPortal(
                    <FootwearSizeModal
                        isOpen={showFootwearSizeModal}
                        onClose={() => setShowFootwearSizeModal(false)}
                    />,
                    document.body
                )}
            </AnimatePresence>
        </div >
    );
};

export default ProductDetail;
