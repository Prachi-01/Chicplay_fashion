import React, { useState, useMemo, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Trash2, Gift, Sparkles, ShieldCheck,
    ArrowRight, CheckCircle2, TrendingUp, Users,
    CreditCard, Zap, Award, Flame, Star,
    Truck, Package, Share2, Trophy, Heart,
    Leaf, LineChart, Info, MapPin, Apple, Smartphone, Plus, Minus
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useGameStore } from '../store/gameStore';
import { toast, Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

// --- Constants ---
const VIP_TIERS = [
    { level: 1, name: 'Style Newbie', range: '0-5 purchases', discount: 'Basic', shipping: 'Standard', color: 'from-gray-400 to-gray-600' },
    { level: 2, name: 'Fashion Explorer', range: '6-20 purchases', discount: '10%', shipping: 'Free', color: 'from-blue-400 to-blue-600' },
    { level: 3, name: 'Style Icon', range: '21-50 purchases', discount: '15%', shipping: 'Priority', color: 'from-purple-500 to-purple-700' },
    { level: 4, name: 'Fashion Legend', range: '50+ purchases', discount: '20%', shipping: 'White Glove', color: 'from-amber-400 to-orange-600' },
];

const REWARDS_WALLET = [
    { id: 'off5', pts: 500, label: '₹400 OFF', icon: '🎫' },
    { id: 'off12', pts: 1000, label: '₹1000 OFF', icon: '🎁' },
    { id: 'off25', pts: 2000, label: '₹2000 OFF', icon: '💎' },
    { id: 'off75', pts: 5000, label: '₹6000 OFF', icon: '👑' },
];

const BADGE_REWARDS = [
    { id: 'explorer', name: 'Style Explorer', reward: '10% OFF', icon: <Award className="w-5 h-5 text-blue-500" />, active: true },
    { id: 'master', name: 'Color Master', reward: 'Free Shipping', icon: <Sparkles className="w-5 h-5 text-purple-500" />, active: true },
    { id: 'setter', name: 'Trend Setter', reward: 'Early Access', icon: <Zap className="w-5 h-5 text-orange-500" />, active: false },
];

const STREAK_REWARDS = [
    { days: 3, reward: '5% OFF', active: true },
    { days: 7, reward: '10% OFF', active: true },
    { days: 30, reward: '15% OFF', active: false },
];

const RECOMMENDATIONS = [
    { id: 'r1', name: "Straw Hat", price: 2499, xp: 25, image: "https://images.unsplash.com/photo-1572533562304-742d51bd44d4?q=80&w=1000&auto=format&fit=crop" },
    { id: 'r2', name: "Sandals", price: 3599, xp: 30, image: "https://images.unsplash.com/photo-1562273103-919740f44246?q=80&w=1000&auto=format&fit=crop" },
    { id: 'r3', name: "Tote Bag", price: 3199, xp: 40, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop" },
    { id: 'r4', name: "Silk Scarf", price: 1999, xp: 20, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1000&auto=format&fit=crop" }
];

// --- Sub-Components ---

const StepIndicator = ({ currentStep }) => (
    <div className="flex items-center justify-center gap-4 mb-12">
        {['Review', 'Address', 'Payment', 'Success'].map((label, index) => {
            const step = index + 1;
            return (
                <div key={step} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500
                            ${currentStep >= step ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-gray-300 border border-gray-100'}
                        `}>
                            {currentStep > step ? <CheckCircle2 className="w-6 h-6" /> : step}
                        </div>
                        <span className={`text-[10px] font-black uppercase mt-2 tracking-widest ${currentStep >= step ? 'text-rose-500' : 'text-gray-300'}`}>{label}</span>
                    </div>
                    {index < 3 && (
                        <div className={`w-20 h-1 rounded-full -mt-6 transition-all duration-500 ${currentStep > step ? 'bg-rose-500' : 'bg-gray-100'}`} />
                    )}
                </div>
            )
        })}
    </div>
);

const PriceOptimization = () => (
    <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-gray-800 flex items-center gap-2">
                <LineChart className="w-4 h-4 text-emerald-500" />
                PRICE OPTIMIZATION
            </h4>
            <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full border border-emerald-100 uppercase">
                Best price found
            </span>
        </div>
        <div className="h-20 flex items-end gap-1 px-2">
            {[40, 60, 45, 70, 55, 40, 30].map((h, i) => (
                <div
                    key={i}
                    className={`flex-1 rounded-t-lg transition-all duration-1000 ${i === 6 ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                    style={{ height: `${h}%` }}
                />
            ))}
        </div>
        <p className="text-xs font-bold text-gray-500 leading-relaxed italic">
            "Price is at careful minimum. AI predicts 15% increase next week."
        </p>
    </div>
);

const SustainabilityScore = () => (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden group">
        <Leaf className="absolute top-[-20px] right-[-20px] w-24 h-24 opacity-10 rotate-12" />
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
                <Leaf className="w-5 h-5 text-emerald-100" />
            </div>
            <h4 className="font-black text-sm uppercase tracking-wide">Eco-Score: 92/100</h4>
        </div>
        <p className="text-xs font-medium text-emerald-50 mb-4">
            Your cart is 85% more sustainable than average.
            <span className="block mt-1 font-bold">12 trees planted with this order! 🌳</span>
        </p>
        <button className="text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors border border-white/10">
            View Impact
        </button>
    </div>
);

// --- Main Smart Shopping & Checkout Page ---

const Cart = () => {
    const { cart, removeFromCart, clearCart, cartTotal, addToCart, updateQuantity } = useCart();
    const { points, streak, level, addPoints } = useGameStore();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [selectedShipping, setSelectedShipping] = useState('free');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [purchasedOrder, setPurchasedOrder] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [newAddress, setNewAddress] = useState({
        fullName: '',
        phoneNumber: '',
        addressLine: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
    });
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    useEffect(() => {
        if (step === 2) {
            fetchAddresses();
        }
    }, [step]);

    const fetchAddresses = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to continue");
            navigate('/login');
            return;
        }

        setAddressLoading(true);
        try {
            const res = await api.get('/addresses');
            const data = Array.isArray(res.data) ? res.data : [];
            setAddresses(data);

            if (data.length > 0) {
                const defaultAddr = data.find(a => a.isDefault) || data[0];
                setSelectedAddress(defaultAddr);
                setShowAddressForm(false);
            } else {
                setShowAddressForm(true);
            }
        } catch (err) {
            console.error("Failed to fetch addresses:", err);
            // If the table doesn't exist yet or other error, show form anyway
            setShowAddressForm(true);
            toast.error("Add your first shipping address");
        } finally {
            setAddressLoading(false);
        }
    };

    const handleSaveAddress = async (e) => {
        if (e) e.preventDefault();
        if (isSavingAddress) return;

        setIsSavingAddress(true);
        try {
            const res = await api.post('/addresses', newAddress);
            toast.success("Address saved!");
            setAddresses([...addresses, res.data]);
            setSelectedAddress(res.data);
            setShowAddressForm(false);
            setNewAddress({
                fullName: '',
                phoneNumber: '',
                addressLine: '',
                city: '',
                state: '',
                pincode: '',
                landmark: ''
            });
            // Automatically proceed to Step 3 (Payment) after saving
            setStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error("Save address error detail:", err.response?.data);
            const errorMsg = err.response?.data?.message || err.message || "Failed to save address";
            toast.error(errorMsg);

            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                navigate('/login');
            }
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handlePincodeChange = async (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Allow only numbers, max 6 digits
        setNewAddress(prev => ({ ...prev, pincode: value }));

        if (value.length === 6) {
            try {
                // Using Indian Postal Pincode API
                const res = await axios.get(`https://api.postalpincode.in/pincode/${value}`);
                if (res.data && res.data[0].Status === 'Success') {
                    const postOffice = res.data[0].PostOffice[0];
                    setNewAddress(prev => ({
                        ...prev,
                        pincode: value,
                        city: postOffice.District,
                        state: postOffice.State
                    }));
                    toast.success(`${postOffice.District}, ${postOffice.State} detected!`, {
                        icon: '📍',
                        duration: 2000
                    });
                }
            } catch (err) {
                console.error("Pincode lookup failed:", err);
            }
        }
    };


    // Calculations
    const badgeDiscount = cartTotal * 0.1;
    const streakDiscount = cartTotal * 0.05;
    const shippingCost = selectedShipping === 'priority' ? 15 : 0;
    const finalTotal = Math.max(0, cartTotal - appliedDiscount - badgeDiscount - streakDiscount + shippingCost);
    const earnedPoints = Math.floor(cartTotal * 2.5);

    const handleNextStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(step - 1);
    };

    const handleCompletePurchase = async () => {
        setIsProcessing(true);
        try {
            const response = await api.post('/orders', {
                items: cart,
                totalAmount: finalTotal
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            setPurchasedOrder({
                id: response.data.orderId,
                points: response.data.xpEarned + 300,
                newBadge: response.data.levelUp ? "Fashion Legend" : "Fashion Investor",
                savings: appliedDiscount + badgeDiscount + streakDiscount
            });

            addPoints(response.data.xpEarned + 300);
            clearCart();
            setIsProcessing(false);
            setStep(4);
            toast.success("Order Placed Successfully! 🛍️");
        } catch (error) {
            console.error("Purchase error:", error);
            toast.error(error.response?.data?.message || "Failed to process order");
            setIsProcessing(false);
        }
    };


    if (cart.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-8 text-center font-outfit">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-48 h-48 bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center text-8xl mb-8 shadow-2xl border border-white/60"
                >🛍️</motion.div>
                <h2 className="text-5xl font-black text-gray-800 mb-4 tracking-tight">Your bag is empty</h2>
                <p className="text-mocha/60 mb-10 text-lg font-medium">Add some magic to your wardrobe to get started!</p>
                <Link to="/shop">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-12 py-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-[24px] font-black text-lg shadow-xl shadow-rose-200 hover:shadow-rose-300 transition-all uppercase tracking-widest"
                    >
                        START SHOPPING
                    </motion.button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF5F7] font-outfit pb-32">
            <Toaster position="top-right" />

            <header className="bg-white/40 backdrop-blur-xl border-b border-white/20 px-8 py-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-3xl font-black tracking-tighter text-gray-800">
                            Chic<span className="text-rose-500">Play</span>
                        </Link>
                        <Link
                            to="/shop"
                            className="hidden md:flex items-center gap-2 bg-white/80 px-4 py-2 rounded-2xl border border-white shadow-sm text-gray-800 hover:text-rose-500 transition-all font-bold text-sm"
                        >
                            <ArrowRight className="rotate-180" size={16} />
                            Continue Shopping
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase font-black text-rose-400">Level {level}</p>
                            <p className="text-sm font-black text-gray-800">Style Profile</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="flex items-center gap-3 bg-white/80 px-4 py-2 rounded-2xl border border-white shadow-sm">
                            <Gift className="w-4 h-4 text-rose-500" />
                            <span className="font-black text-gray-800">{points} PTS</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-12">
                {step !== 3 && <StepIndicator currentStep={step} />}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12"
                        >
                            {/* Left: Cart & Rewards */}
                            <div className="space-y-12">
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4">
                                            <ShoppingBag className="w-8 h-8 text-rose-500" />
                                            YOUR STYLE BAG
                                        </h2>
                                        <button onClick={clearCart} className="text-xs font-black text-mocha/40 hover:text-red-500 transition-colors uppercase tracking-widest">Clear All</button>
                                    </div>
                                    <div className="space-y-6">
                                        {cart.map((item) => (
                                            <motion.div layout key={item._id} className="bg-white/60 backdrop-blur-md rounded-[40px] p-6 border border-white/40 shadow-xl flex gap-8 group">
                                                <div className="w-40 h-40 bg-gray-50 rounded-3xl overflow-hidden relative shadow-inner shrink-0">
                                                    <img src={item.displayedImage || item.images?.[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl border border-white shadow-sm flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-[10px] font-black uppercase text-gray-800">{item.gameStats?.rarity || 'Epic'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="text-2xl font-black text-gray-800">{item.name}</h3>
                                                                <p className="text-mocha/50 font-bold text-sm">Size: {item.size || 'M'} | Color: {item.selectedColor || 'Classic'}</p>
                                                            </div>
                                                            <button onClick={() => removeFromCart(item._id, item.size)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                        <div className="mt-4 flex flex-wrap gap-3">
                                                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-blue-600">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-black uppercase">Daily Challenge</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 text-orange-600">
                                                                <Users className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-black uppercase">Friends Bought</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 bg-white/80 p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                                                            <button
                                                                onClick={() => updateQuantity(item._id, item.size, -1)}
                                                                className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="font-black text-gray-800 w-4 text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        // Fetch latest stock
                                                                        const res = await api.get(`/products/${item._id}`);
                                                                        const product = res.data;

                                                                        if (!product) {
                                                                            toast.error('Product not found!');
                                                                            return;
                                                                        }

                                                                        const stockItem = product.sizeStock?.find(s => s.size === item.size);
                                                                        const availableStock = stockItem ? stockItem.quantity : product.stock;

                                                                        console.log(`Stock check: Current qty=${item.quantity}, Available=${availableStock}, Size=${item.size}`);

                                                                        if (availableStock <= 0) {
                                                                            toast.error('This item is out of stock!');
                                                                            return;
                                                                        }

                                                                        if (item.quantity >= availableStock) {
                                                                            toast.error(`Only ${availableStock} units available! Already at maximum.`);
                                                                            return;
                                                                        }

                                                                        updateQuantity(item._id, item.size, 1);
                                                                    } catch (err) {
                                                                        console.error("Stock check failed", err);
                                                                        toast.error('Unable to verify stock. Please try again.');
                                                                        // DO NOT increment on error - this was the bug
                                                                    }
                                                                }}
                                                                className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-rose-400 uppercase">Purchase to earn</p>
                                                            <p className="text-3xl font-black text-gray-800">₹{item.price}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                                {/* Rewards Redemption Station */}
                                <section className="space-y-8">
                                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4">
                                        <Trophy className="w-8 h-8 text-amber-500" />
                                        REDEMPTION STATION
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white/60 backdrop-blur-xl rounded-[40px] p-8 border border-white/40 shadow-xl space-y-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-black text-gray-800 flex items-center gap-2">REWARDS WALLET</h4>
                                                <div className="bg-rose-50 px-3 py-1 rounded-full text-rose-600 font-black text-xs">{points} PTS</div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {REWARDS_WALLET.map(reward => (
                                                    <button
                                                        key={reward.id}
                                                        disabled={points < reward.pts}
                                                        onClick={() => setAppliedDiscount(appliedDiscount === parseInt(reward.label.slice(1)) ? 0 : parseInt(reward.label.slice(1)))}
                                                        className={`w-full flex items-center justify-between p-5 rounded-[24px] border transition-all ${points >= reward.pts
                                                            ? (appliedDiscount === parseInt(reward.label.slice(1)) ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-gray-800 border-gray-100 hover:border-rose-200 hover:shadow-lg')
                                                            : 'opacity-40 grayscale cursor-not-allowed bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4 text-left">
                                                            <span className="text-3xl">{reward.icon}</span>
                                                            <div>
                                                                <p className="font-black leading-none text-lg">{reward.label}</p>
                                                                <p className="text-[10px] font-bold opacity-60 uppercase mt-1">{reward.pts} Points</p>
                                                            </div>
                                                        </div>
                                                        {appliedDiscount === parseInt(reward.label.slice(1)) ? <CheckCircle2 className="w-6 h-6" /> : <Plus className={`w-5 h-5 ${points < reward.pts ? 'hidden' : ''}`} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/40 shadow-xl">
                                                <h4 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-widest">Badge Perks</h4>
                                                <div className="space-y-4">
                                                    {BADGE_REWARDS.map(badge => (
                                                        <div key={badge.id} className={`flex items-center justify-between p-4 rounded-2xl border ${badge.active ? 'bg-blue-50 border-blue-100' : 'bg-gray-50/50 border-gray-100 opacity-40'}`}>
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2 bg-white rounded-xl shadow-sm">{badge.icon}</div>
                                                                <div>
                                                                    <p className="text-sm font-black text-gray-800 leading-none">{badge.name}</p>
                                                                    <p className="text-[10px] font-bold text-blue-400 mt-1 uppercase">{badge.reward}</p>
                                                                </div>
                                                            </div>
                                                            {badge.active && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/40 shadow-xl">
                                                <h4 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-widest">Streak Bonus</h4>
                                                <div className="flex gap-3">
                                                    {STREAK_REWARDS.map(s => (
                                                        <div key={s.days} className={`flex-1 text-center p-4 rounded-[20px] border ${s.active ? 'bg-orange-50 border-orange-100 shadow-sm' : 'bg-white border-gray-100 opacity-40'}`}>
                                                            <p className="text-xs font-black text-orange-600">{s.days} DAY</p>
                                                            <p className="text-[10px] font-black text-orange-400 uppercase mt-1">{s.reward}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Side: Order Summary */}
                            <div className="space-y-8">
                                <div className="bg-white rounded-[48px] p-8 shadow-2xl border border-white space-y-8 sticky top-32">
                                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">ORDER SUMMARY</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-mocha/60 font-bold">
                                            <span>Subtotal ({cart.length} items)</span>
                                            <span>₹{cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-mocha/60 font-bold">
                                            <span>Badge Reward (10%)</span>
                                            <span className="text-blue-500">-₹{badgeDiscount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-mocha/60 font-bold">
                                            <span>Streak Reward (5%)</span>
                                            <span className="text-orange-500">-₹{streakDiscount.toFixed(2)}</span>
                                        </div>
                                        {appliedDiscount > 0 && (
                                            <div className="flex justify-between items-center text-mocha/60 font-bold">
                                                <span>Points Discount</span>
                                                <span className="text-rose-500">-₹{appliedDiscount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-mocha/60 font-bold">
                                            <span>Smart Shipping</span>
                                            <span className="text-green-500 uppercase tracking-widest text-xs font-black">Free ✅</span>
                                        </div>
                                        <div className="h-px bg-gray-100 my-4" />
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-rose-400">Total Price</p>
                                                <h4 className="text-4xl font-black text-gray-800 leading-none">₹{finalTotal.toFixed(2)}</h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-black text-green-500">Total Saved</p>
                                                <p className="text-xl font-black text-green-500 tracking-tight">
                                                    ₹{(appliedDiscount + badgeDiscount + streakDiscount).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleNextStep}
                                        className="w-full bg-gray-800 text-white py-6 rounded-3xl font-black text-xl tracking-[0.2em] shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-4 group"
                                    >
                                        CONTINUE
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </motion.button>

                                    <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 space-y-4">
                                        <div className="flex justify-between text-xs font-black uppercase">
                                            <span className="text-rose-600">Level Progress</span>
                                            <span className="text-rose-400">85% to Level {level + 1}</span>
                                        </div>
                                        <div className="w-full h-3 bg-white rounded-full overflow-hidden relative">
                                            <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: '85%' }} />
                                            <div className="h-full bg-rose-300 rounded-full absolute top-0 left-0 transition-all duration-1000 opacity-50" style={{ width: `${85 + 5}%` }} />
                                        </div>
                                        <p className="text-xs font-bold text-rose-500 leading-tight">
                                            ✨ This purchase will earn you +{earnedPoints} XP and unlock new rewards!
                                        </p>
                                    </div>
                                </div>
                                <PriceOptimization />
                                <SustainabilityScore />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[48px] p-10 shadow-2xl border border-white"
                        >
                            <div className="flex flex-col md:flex-row gap-12">
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Shipping Address</h2>
                                        {!showAddressForm && addresses.length > 0 && (
                                            <button
                                                onClick={() => setShowAddressForm(true)}
                                                className="text-sm font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center gap-2"
                                            >
                                                <Plus className="w-5 h-5" /> Add New Address
                                            </button>
                                        )}
                                    </div>

                                    {addressLoading ? (
                                        <div className="flex flex-col items-center py-20 gap-4">
                                            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="font-black text-gray-400 uppercase tracking-widest">Loading Addresses...</p>
                                        </div>
                                    ) : (showAddressForm || (addresses.length === 0 && !addressLoading)) ? (
                                        <form onSubmit={handleSaveAddress} className="space-y-6 bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Full Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="John Doe"
                                                        className="w-full bg-white border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 font-bold outline-none transition-all shadow-sm"
                                                        value={newAddress.fullName}
                                                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        placeholder="+91 XXXXX XXXXX"
                                                        className="w-full bg-white border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 font-bold outline-none transition-all shadow-sm"
                                                        value={newAddress.phoneNumber}
                                                        onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Address Line</label>
                                                <textarea
                                                    required
                                                    placeholder="Apt, Suite, Building, Street"
                                                    className="w-full bg-white border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 font-bold outline-none transition-all shadow-sm min-h-[100px]"
                                                    value={newAddress.addressLine}
                                                    onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">City</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="City"
                                                        className="w-full bg-white border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 font-bold outline-none transition-all shadow-sm"
                                                        value={newAddress.city}
                                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">State</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="State"
                                                        className="w-full bg-white border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 font-bold outline-none transition-all shadow-sm"
                                                        value={newAddress.state}
                                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Pincode 📍</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="XXXXXX"
                                                        className="w-full bg-white border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 font-bold outline-none transition-all shadow-sm"
                                                        value={newAddress.pincode}
                                                        maxLength={6}
                                                        onChange={handlePincodeChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Landmark (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Near, Opposite to..."
                                                    className="w-full bg-white border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 font-bold outline-none transition-all shadow-sm"
                                                    value={newAddress.landmark}
                                                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    id="address-submit-btn"
                                                    type="submit"
                                                    disabled={isSavingAddress}
                                                    className={`flex-1 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl ${isSavingAddress ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'}`}
                                                >
                                                    {isSavingAddress ? 'Saving...' : 'Save Address'}
                                                </button>
                                                {addresses.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAddressForm(false)}
                                                        className="px-8 bg-white text-gray-400 border-2 border-gray-100 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {addresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => setSelectedAddress(addr)}
                                                    className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all relative overflow-hidden group ${selectedAddress?.id === addr.id ? 'bg-white border-rose-500 shadow-xl' : 'bg-gray-50 border-transparent hover:border-gray-100 hover:bg-white'}`}
                                                >
                                                    {addr.isDefault && (
                                                        <div className="absolute top-0 right-0 bg-rose-500 text-white px-4 py-1.5 rounded-bl-[20px] text-[10px] font-black uppercase tracking-widest">
                                                            Default
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className={`p-3 rounded-2xl ${selectedAddress?.id === addr.id ? 'bg-rose-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                                                            <MapPin className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-gray-800">{addr.fullName}</h4>
                                                            <p className="text-xs font-bold text-gray-400">{addr.phoneNumber}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-600 mb-1 leading-relaxed">{addr.addressLine}</p>
                                                    {addr.landmark && <p className="text-xs font-bold text-gray-500 mb-2 italic">Landmark: {addr.landmark}</p>}
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                    {selectedAddress?.id === addr.id && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute bottom-4 right-4 bg-rose-500 text-white p-2 rounded-full shadow-lg"
                                                        >
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-[350px] space-y-6">
                                    <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 space-y-6">
                                        <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm">Summary</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm font-bold text-gray-500">
                                                <span>Items Total</span>
                                                <span>₹{cartTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold text-rose-500">
                                                <span>Total Savings</span>
                                                <span>-₹{(appliedDiscount + badgeDiscount + streakDiscount).toFixed(2)}</span>
                                            </div>
                                            <div className="h-px bg-gray-200" />
                                            <div className="flex justify-between items-end">
                                                <span className="font-black text-gray-800">Final Total</span>
                                                <span className="text-2xl font-black text-gray-800 leading-none">₹{finalTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (showAddressForm) {
                                                    // Trigger the form submit button programmatically or call handlesave
                                                    const submitBtn = document.getElementById('address-submit-btn');
                                                    if (submitBtn) submitBtn.click();
                                                } else {
                                                    handleNextStep();
                                                }
                                            }}
                                            disabled={!selectedAddress && !showAddressForm}
                                            className={`w-full py-6 rounded-[24px] font-black text-lg tracking-widest flex items-center justify-center gap-4 transition-all ${(!selectedAddress && !showAddressForm) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-100'}`}
                                        >
                                            {showAddressForm ? 'SAVE & CONTINUE' : 'PROCEED'} <ArrowRight className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handlePrevStep}
                                            className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                        >
                                            Go back to review
                                        </button>
                                    </div>
                                    <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex items-start gap-4">
                                        <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Fast Delivery</p>
                                            <p className="text-[10px] font-bold text-blue-400 leading-relaxed italic">"Average delivery time to your area is 3.2 days."</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12"
                        >
                            {/* Left: Shipping & Payments */}
                            <div className="space-y-12">
                                <section className="space-y-8">
                                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-4 uppercase tracking-tight">
                                        <Truck className="w-9 h-9 text-blue-500" />
                                        SHIPPING & ASSURANCE
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { id: 'free', icon: <Package className="w-7 h-7" />, title: 'Smart Saver', desc: '3-5 Day Delivery', price: 'FREE', reward: 'Streak Reward' },
                                            { id: 'priority', icon: <Zap className="w-7 h-7" />, title: 'Express Flash', desc: 'Next Day Delivery', price: '₹1200.00', reward: '+150 Pts' }
                                        ].map(option => (
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                key={option.id}
                                                onClick={() => setSelectedShipping(option.id)}
                                                className={`p-8 rounded-[40px] border-2 cursor-pointer transition-all ${selectedShipping === option.id ? 'bg-white border-blue-500 shadow-2xl' : 'bg-white/60 border-transparent hover:border-blue-100'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`p-4 rounded-2xl ${selectedShipping === option.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        {option.icon}
                                                    </div>
                                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${option.id === 'free' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {option.reward}
                                                    </span>
                                                </div>
                                                <h4 className="text-2xl font-black text-gray-800">{option.title}</h4>
                                                <p className="text-sm font-bold text-gray-400 mb-6">{option.desc}</p>
                                                <p className="text-3xl font-black text-gray-800">{option.price}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Confidence Builders */}
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
                                        <ShieldCheck className="absolute bottom-[-20px] left-[-20px] w-56 h-56 opacity-10 -rotate-12" />
                                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <h4 className="text-2xl font-black flex items-center gap-4">
                                                    <ShieldCheck className="w-9 h-9 text-blue-300" />
                                                    FIT GUARANTEE
                                                </h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl border border-white/5">
                                                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl">98%</div>
                                                        <div>
                                                            <p className="text-sm font-black">ACCURACY RATE</p>
                                                            <p className="text-[10px] text-blue-200 uppercase tracking-widest">3D Profile Scan</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs font-medium text-blue-50 leading-relaxed italic">
                                                        "We've cross-referenced 5 similar orders from your history. Size M will be your perfect fit."
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <h4 className="text-2xl font-black flex items-center gap-4">
                                                    <Star className="w-9 h-9 text-yellow-300" />
                                                    STYLE SCORE
                                                </h4>
                                                <div className="bg-white/20 rounded-[40px] p-8 text-center border border-white/10">
                                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-100 mb-2">Style Match</p>
                                                    <p className="text-6xl font-black mb-3">94<span className="text-xl opacity-50">/100</span></p>
                                                    <div className="flex justify-center gap-2">
                                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 text-yellow-300 fill-yellow-300" />)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Complete the look</h2>
                                        <div className="bg-rose-50 px-5 py-2.5 rounded-full border border-rose-100 flex items-center gap-3">
                                            <Sparkles className="w-5 h-5 text-rose-500" />
                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">+200 XP Bonus</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {RECOMMENDATIONS.map(item => (
                                            <motion.div whileHover={{ y: -5 }} key={item.id} className="bg-white/60 backdrop-blur-md p-5 rounded-[32px] border border-white/40 shadow-xl group">
                                                <div className="aspect-square rounded-[24px] overflow-hidden mb-5 relative bg-gray-100">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black shadow-lg">
                                                        +{item.xp} PTS
                                                    </div>
                                                </div>
                                                <h5 className="font-black text-gray-800 text-sm mb-2">{item.name}</h5>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-black text-rose-500 text-lg">₹{item.price}</span>
                                                    <button onClick={() => addToCart({ _id: item.id, name: item.name, price: item.price, images: [item.image] })} className="p-3 bg-gray-800 text-white rounded-2xl hover:bg-rose-500 transition-all shadow-md">
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Right: Payment */}
                            <div className="space-y-8">
                                <div className="bg-white rounded-[48px] p-8 shadow-2xl border border-white space-y-8 sticky top-32">
                                    <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Payment Method</h3>
                                    <div className="space-y-4">
                                        {[
                                            { id: 'card', name: 'Secure Card', icon: <CreditCard className="w-6 h-6" />, desc: 'Visa, MC, Amex' },
                                            { id: 'apple', name: 'Digital Wallet', icon: <Apple className="w-6 h-6" />, desc: 'Apple/Google Pay' },
                                            { id: 'split', name: 'Style Split', icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />, desc: '4 x ₹899.00 (0%)' }
                                        ].map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`flex items-center justify-between p-5 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'bg-gray-50 border-gray-800 shadow-inner' : 'bg-white border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${paymentMethod === method.id ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                        {method.icon}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-black text-gray-800 leading-none">{method.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{method.desc}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === method.id ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200'}`}>
                                                    {paymentMethod === method.id && <CheckCircle2 className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="h-px bg-gray-100 my-4" />

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-1">Final Amount</p>
                                                <h4 className="text-5xl font-black text-gray-800 leading-none">₹{finalTotal.toFixed(2)}</h4>
                                            </div>
                                        </div>

                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            disabled={isProcessing}
                                            onClick={handleCompletePurchase}
                                            className={`w-full py-7 rounded-[32px] font-black text-xl tracking-[0.25em] shadow-2xl transition-all flex items-center justify-center gap-4 relative overflow-hidden ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-emerald-200'
                                                }`}
                                        >
                                            {isProcessing ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                                    PROCESSING
                                                </div>
                                            ) : (
                                                <>PLACE ORDER <CheckCircle2 className="w-7 h-7" /></>
                                            )}
                                        </motion.button>
                                        <button
                                            onClick={handlePrevStep}
                                            className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                        >
                                            Change Address
                                        </button>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                PCI COMPLIANT & SECURE
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rewards Summary */}
                                    <div className="bg-gray-900 rounded-[32px] p-8 text-white space-y-5">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Upcoming Rewards</h5>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-400 uppercase tracking-widest">Base Points</span>
                                                <span className="text-emerald-400">+{earnedPoints} PTS</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-400 uppercase tracking-widest">Multipliers</span>
                                                <span className="text-emerald-400">+300 PTS</span>
                                            </div>
                                            <div className="h-px bg-white/10 my-2" />
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-sm uppercase tracking-[0.1em]">Total Earnings</span>
                                                <span className="text-2xl font-black text-emerald-400">{earnedPoints + 300} PTS</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto space-y-12 py-12"
                        >
                            <div className="bg-white rounded-[80px] p-16 shadow-2xl border border-white text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                    <Sparkles className="absolute top-10 left-10 w-10 h-10 text-yellow-400 animate-pulse" />
                                    <Sparkles className="absolute top-1/4 right-20 w-8 h-8 text-rose-400 animate-bounce" />
                                    <Sparkles className="absolute bottom-20 left-1/4 w-12 h-12 text-blue-400 animate-pulse" />
                                </div>

                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", damping: 10 }}
                                    className="w-48 h-48 bg-emerald-100 rounded-[56px] flex items-center justify-center mx-auto mb-10 shadow-inner"
                                >
                                    <CheckCircle2 className="w-24 h-24 text-emerald-600" />
                                </motion.div>

                                <h1 className="text-6xl font-black text-gray-800 mb-6 tracking-tighter">SUCCESS! 🎉</h1>
                                <p className="text-xl font-bold text-gray-400 mb-8 uppercase tracking-widest">Order {purchasedOrder?.id} confirmed</p>

                                {selectedAddress && (
                                    <div className="bg-blue-50/50 rounded-3xl p-6 mb-16 inline-block text-left border border-blue-100 max-w-md mx-auto">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Truck className="w-4 h-4" /> Shipping TO
                                        </p>
                                        <p className="font-black text-gray-800">{selectedAddress.fullName}</p>
                                        <p className="text-sm font-bold text-gray-600 leading-tight mt-1">
                                            {selectedAddress.addressLine}, {selectedAddress.landmark ? `${selectedAddress.landmark}, ` : ''}{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                                    <div className="bg-gray-50 rounded-[48px] p-10 border border-gray-100 space-y-8 text-left">
                                        <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.3em]">Victory Rewards</h4>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-3xl bg-white shadow-md flex items-center justify-center text-3xl">🏆</div>
                                                <div>
                                                    <p className="text-2xl font-black text-gray-800 leading-none">+{purchasedOrder?.points} PTS</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Total Earnings</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-3xl bg-white shadow-md flex items-center justify-center text-3xl">🎖️</div>
                                                <div>
                                                    <p className="text-2xl font-black text-gray-800 leading-none">{purchasedOrder?.newBadge}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">Achievement Unlocked</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-rose-50 rounded-[48px] p-10 border border-rose-100 space-y-8 flex flex-col justify-center">
                                        <h4 className="font-black text-rose-400 text-[10px] uppercase tracking-[0.3em] text-center">Style Savings</h4>
                                        <div className="text-center">
                                            <p className="text-6xl font-black text-rose-600 mb-2">₹{purchasedOrder?.savings.toFixed(2)}</p>
                                            <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Total Wallet Savings 🎉</p>
                                        </div>
                                        <div className="w-full h-px bg-rose-200" />
                                        <p className="text-xs font-bold text-rose-500 leading-relaxed italic px-4">
                                            "You're in the top 5% of smart shoppers this season!"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6">
                                    <button className="flex-1 bg-gray-800 text-white py-7 rounded-[32px] font-black flex items-center justify-center gap-4 hover:bg-gray-900 transition-all shadow-xl uppercase tracking-widest">
                                        <Share2 className="w-6 h-6" />
                                        Share haul
                                    </button>
                                    <Link to="/shop" className="flex-1 bg-white text-gray-800 border-2 border-gray-100 py-7 rounded-[32px] font-black flex items-center justify-center gap-4 hover:bg-gray-50 transition-all uppercase tracking-widest">
                                        Shop More
                                        <ArrowRight className="w-6 h-6" />
                                    </Link>
                                </div>
                            </div>

                            {/* Global Stats Section */}
                            <div className="bg-white/40 backdrop-blur-xl rounded-[60px] p-12 border border-white/40 shadow-2xl space-y-12">
                                <h3 className="text-3xl font-black text-gray-800 text-center tracking-tight uppercase tracking-widest">Your Style Statistics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                                    {[
                                        { label: 'Total Volume', value: '₹1.4L', icon: <ShoppingBag className="w-6 h-6" /> },
                                        { label: 'Wardrobe Full', value: '82%', icon: <Package className="w-6 h-6" /> },
                                        { label: 'Badge Rank', value: 'Master', icon: <Award className="w-6 h-6" /> },
                                        { label: 'Total Saved', value: '₹24k', icon: <Heart className="w-6 h-6" /> }
                                    ].map(stat => (
                                        <div key={stat.label} className="text-center space-y-4">
                                            <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto text-rose-500">
                                                {stat.icon}
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-gray-800 leading-none mb-2">{stat.value}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-8 bg-white/60 p-10 rounded-[40px] border border-white/40">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-black text-gray-800 uppercase tracking-[0.2em] text-sm">VIP Tier: Silver Elite</h4>
                                        <span className="text-[10px] font-black text-rose-500 uppercase">952 / 1200 XP to Gold</span>
                                    </div>
                                    <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden p-1.5 shadow-inner">
                                        <div className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-pink-600 rounded-full" style={{ width: '78%' }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Cart;
