import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Star, Leaf, ShieldCheck, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useGameStore } from '../../store/gameStore';
import { toast } from 'react-hot-toast';


const ProductQuickViewModal = ({ product, isOpen, onClose }) => {
    const { addToCart, cart } = useCart();
    const { toggleWishlist, wishlist } = useGameStore();
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [viewMode, setViewMode] = useState('front'); // 'front', 'back', 'side', 'fabric', 'lifestyle'
    const [isVendorOpen, setIsVendorOpen] = useState(false);

    if (!product) return null;

    const hasVariations = product.colorVariations && product.colorVariations.length > 0;
    const selectedVariation = hasVariations ? product.colorVariations[selectedColorIndex] : null;

    // Determine which images to show
    const displayImages = hasVariations
        ? Object.entries(selectedVariation.images)
            .filter(([_, url]) => url) // Only show images that have URLs
            .map(([type, url]) => ({ type, url }))
        : product.images.map((url, idx) => ({ type: idx === 0 ? 'front' : 'other', url }));

    const currentImageData = displayImages[currentImageIndex] || displayImages[0];

    const isWishlisted = wishlist.find(item => item._id === product._id);

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    const handleColorChange = (index) => {
        setSelectedColorIndex(index);
        setCurrentImageIndex(0); // Reset to front view of new color
        setSelectedSize(""); // Reset size when color changes
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] md:h-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-mocha hover:bg-mocha hover:text-white transition-all shadow-lg"
                        >
                            <X size={20} />
                        </button>

                        {/* Image Gallery Section */}
                        <div className="md:w-1/2 relative bg-gray-50 h-[400px] md:h-auto">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={`${selectedColorIndex}-${currentImageIndex}`}
                                    src={currentImageData?.url}
                                    alt={product.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition z-10"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition z-10"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}

                            {/* Thumbnails */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-10 h-14 rounded-xl overflow-hidden border-2 transition-all relative ${idx === currentImageIndex ? 'border-mocha scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[6px] text-white font-black uppercase py-0.5 text-center">
                                            {img.type}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Badge */}
                            <div className="absolute top-6 left-6 flex gap-2">
                                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-mocha shadow-sm border border-blush/20">
                                    ✨ {product.gameStats?.rarity || 'Common'}
                                </span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-black text-rosegold uppercase tracking-widest mb-1">{product.archetype}</p>
                                        <h2 className="text-3xl font-black text-mocha leading-tight">{product.name}</h2>
                                        {selectedVariation && (
                                            <p className="text-sm font-bold text-gray-400 mt-1 italic">Color: {selectedVariation.colorName}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => toggleWishlist(product)}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isWishlisted ? 'bg-pink-50 text-pink-500 scale-110' : 'bg-gray-50 text-gray-400 hover:text-pink-500'}`}
                                    >
                                        <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-6 mb-8">
                                    <p className="text-4xl font-black text-mocha">₹{product.price}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} className={i < Math.floor(product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-400 font-bold">({product.reviewsCount || 0} reviews)</span>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-10">
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Product Vision</h4>
                                        <p className="text-gray-500 font-medium leading-relaxed">
                                            {product.description || "A masterfully crafted piece designed to blend timeless elegance with modern comfort. Perfect for making a statement at any occasion."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase mb-1">Fabric</h5>
                                            <p className="text-sm font-bold text-mocha">{product.attributes?.material || 'Premium Silk Blend'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase mb-1">Sustainability</h5>
                                            <div className="flex items-center gap-1">
                                                <Leaf size={12} className="text-green-500" />
                                                <p className="text-sm font-bold text-mocha">92% Eco-Score</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Signature Colors</h4>
                                        <div className="flex flex-wrap gap-4">
                                            {hasVariations ? (
                                                product.colorVariations.map((variation, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleColorChange(i)}
                                                        className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 relative ${selectedColorIndex === i ? 'border-mocha shadow-xl scale-125' : 'border-white shadow-sm'}`}
                                                        style={{ backgroundColor: variation.hexCode }}
                                                        title={variation.colorName}
                                                    >
                                                        {selectedColorIndex === i && (
                                                            <motion.div layoutId="color-active" className="absolute -bottom-2 -right-2 w-5 h-5 bg-mocha text-white rounded-full flex items-center justify-center text-[10px] shadow-lg">
                                                                <Check size={12} strokeWidth={4} />
                                                            </motion.div>
                                                        )}
                                                        {!variation.available && (
                                                            <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference">
                                                                <X size={16} />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                [product.attributes?.color || '#000000', '#FDE68A', '#FF6B8B'].map((color, i) => (
                                                    <button
                                                        key={i}
                                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-125 ${i === 0 ? 'border-mocha shadow-md' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {product.specifications && product.specifications.length > 0 && (
                                        <div className="bg-white rounded-3xl p-2">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Detailed Specifications</h4>
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
                                    <div className="border-t border-b border-gray-100 py-4 my-2">
                                        <button
                                            onClick={() => setIsVendorOpen(!isVendorOpen)}
                                            className="w-full flex items-center justify-between text-left group"
                                        >
                                            <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Vendor Details</span>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isVendorOpen ? 'bg-mocha text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-mocha/10 group-hover:text-mocha'}`}>
                                                {isVendorOpen ? (
                                                    <div className="w-3 h-0.5 bg-white rounded-full" /> // Minus sign
                                                ) : (
                                                    <div className="relative w-3 h-3 flex items-center justify-center">
                                                        <div className="absolute w-3 h-0.5 bg-current rounded-full" />
                                                        <div className="absolute w-0.5 h-3 bg-current rounded-full" />
                                                    </div> // Plus sign
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
                                                    <div className="pt-6 pb-2 space-y-6">
                                                        <div>
                                                            <h5 className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">Sold by</h5>
                                                            <p className="text-sm font-medium text-gray-500">
                                                                {product.vendorDetails?.soldBy || "ChicPlay Fashion"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h5 className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">Name of Manufacturer/Packer</h5>
                                                            <p className="text-sm font-medium text-gray-500">
                                                                {product.vendorDetails?.manufacturerName || "Good Tribe Private Ltd"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h5 className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">Address of Manufacturer</h5>
                                                            <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-sm">
                                                                {product.vendorDetails?.manufacturerAddress || "Building No.: D-257, Sector 63, NOIDA, Gautambuddha Nagar, Uttar Pradesh, 201301"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Available Sizes</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {(hasVariations ? selectedVariation.sizeStock : product.sizeStock || []).length > 0 ? (
                                                (hasVariations ? selectedVariation.sizeStock : product.sizeStock).map(s => {
                                                    const isOutOfStock = s.quantity <= 0;
                                                    return (
                                                        <button
                                                            key={s.size}
                                                            disabled={isOutOfStock}
                                                            onClick={() => setSelectedSize(s.size)}
                                                            className={`min-w-[56px] h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative ${selectedSize === s.size
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
                                                                <motion.div layoutId="size-active" className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                                                            )}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                ['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setSelectedSize(size)}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-all ${selectedSize === size ? 'border-mocha bg-mocha text-white shadow-lg' : 'border-gray-100 text-mocha hover:border-mocha/30'
                                                            }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-dashed border-gray-100">
                                <button
                                    onClick={() => {
                                        if (!selectedSize) {
                                            toast.error("Please select a size first!");
                                            return;
                                        }

                                        // Check Stock Limit
                                        const currentStockList = hasVariations ? selectedVariation.sizeStock : product.sizeStock;
                                        const stockItem = currentStockList?.find(s => s.size === selectedSize);

                                        let availableStock;
                                        if (stockItem && typeof stockItem.quantity === 'number') {
                                            availableStock = stockItem.quantity;
                                        } else if (currentStockList && currentStockList.length > 0) {
                                            availableStock = 0;
                                        } else if (typeof product.stock === 'number' && !hasVariations) {
                                            availableStock = product.stock;
                                        } else {
                                            availableStock = 999;
                                        }

                                        const cartItem = cart.find(item =>
                                            item._id === product._id &&
                                            item.size === selectedSize &&
                                            item.selectedColor === (selectedVariation?.colorName || product.attributes?.color)
                                        );
                                        const currentCartQty = cartItem ? cartItem.quantity : 0;

                                        if (availableStock <= 0) {
                                            toast.error(`Sorry, size ${selectedSize} is out of stock in this color!`);
                                            return;
                                        }

                                        if (currentCartQty + 1 > availableStock) {
                                            toast.error(`Sorry, we only have ${availableStock} left in this size!`);
                                            return;
                                        }

                                        addToCart({
                                            ...product,
                                            size: selectedSize,
                                            selectedColor: selectedVariation?.colorName || product.attributes?.color,
                                            displayedImage: currentImageData?.url || product.images[0]
                                        });
                                    }}
                                    className="flex-1 bg-mocha text-white py-5 rounded-[20px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95"
                                >
                                    <ShoppingBag size={24} />
                                    ADD TO BAG
                                </button>

                                <div className="bg-orange-50 px-6 py-2 rounded-[20px] flex flex-col items-center justify-center border border-orange-100">
                                    <span className="text-[10px] font-black text-orange-400 uppercase">XP Reward</span>
                                    <span className="text-xl font-black text-mocha">+{product.gameStats?.xpReward || 50}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div >
            )}
        </AnimatePresence >
    );
};

export default ProductQuickViewModal;
