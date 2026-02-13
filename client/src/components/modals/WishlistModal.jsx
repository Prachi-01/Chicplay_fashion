import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, ArrowRight, Trash2, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const WishlistModal = ({ isOpen, onClose, onOpenProduct }) => {
    const { wishlist, toggleWishlist } = useGameStore();
    const { addToCart } = useCart();
    const { user } = useAuth();

    // Filter wishlist to hide unapproved products for non-admins
    const filteredWishlist = React.useMemo(() => {
        if (!wishlist) return [];
        if (user?.role === 'admin') return wishlist;

        return wishlist.filter(item => {
            // If status is present, it must be 'approved'
            // If status is missing (legacy/admin seed), we allow it for now
            return item.status === 'approved' || !item.status;
        });
    }, [wishlist, user]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[1000]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 w-full max-w-md h-screen h-[100vh] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[1001] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-mocha flex items-center gap-3">
                                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center">
                                        <Heart size={24} className="text-pink-500 fill-pink-500" />
                                    </div>
                                    YOUR WISHLIST
                                </h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 ml-[60px]">
                                    {filteredWishlist.length} Items Saved
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-mocha hover:bg-gray-100 transition-all active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar min-h-0">
                            {filteredWishlist.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-32 h-32 bg-pink-50 rounded-[3rem] flex items-center justify-center mb-8 animate-pulse-slow">
                                        <Heart size={56} className="text-pink-200" />
                                    </div>
                                    <h3 className="text-2xl font-black text-mocha mb-3">Your Gallery is Empty</h3>
                                    <p className="text-gray-400 max-w-[240px] text-sm leading-relaxed font-medium mb-10">
                                        Keep track of the styles that catch your eye for your next digital shoot!
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-10 py-4 bg-mocha text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-mocha/20 hover:bg-black hover:scale-105 transition-all"
                                    >
                                        Explore Boutique
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-2">
                                    {filteredWishlist.map((item, index) => {
                                        const itemId = item._id || item.id || `wishlist-item-${index}`;
                                        const imageUrl = item.images?.[0] || item.image || (item.colorVariations?.[0]?.images?.front) || 'https://via.placeholder.com/300x400?text=No+Image';

                                        return (
                                            <motion.div
                                                key={itemId}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="group relative bg-white rounded-[2rem] p-4 flex gap-4 border-2 border-transparent hover:border-pink-50 hover:shadow-xl hover:shadow-pink-500/5 transition-all"
                                            >
                                                <div
                                                    className="w-24 h-32 rounded-2xl overflow-hidden cursor-pointer shadow-md flex-shrink-0"
                                                    onClick={() => onOpenProduct(item)}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.name || 'Product'}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Error'; }}
                                                    />
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                                    <div className="min-w-0">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h4 className="font-black text-mocha truncate group-hover:text-rosegold transition-colors">{item.name || 'Untitled Style'}</h4>
                                                            <button
                                                                onClick={() => toggleWishlist(item)}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-200 hover:text-red-500 hover:bg-neutral-50 transition-all flex-shrink-0"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-lg font-black text-rosegold">₹{item.price || 0}</p>
                                                            {item.price && (
                                                                <p className="text-[10px] font-black text-gray-300 uppercase line-through">₹{Math.floor(item.price * 1.5)}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                            className="flex-1 bg-mocha text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-mocha/10"
                                                        >
                                                            <ShoppingBag size={12} />
                                                            Add
                                                        </button>
                                                        <button
                                                            onClick={() => onOpenProduct(item)}
                                                            className="w-12 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-mocha hover:bg-rosegold hover:text-white transition-all shadow-sm"
                                                        >
                                                            <ArrowRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer / Summary */}
                        {filteredWishlist.length > 0 && (
                            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex-shrink-0">
                                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-[2rem] shadow-sm border border-white flex items-center gap-4">
                                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Sparkles className="text-pink-500" size={28} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-mocha uppercase tracking-tight">Elite Studio Selection</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Saved for your Next Shoot</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WishlistModal;
