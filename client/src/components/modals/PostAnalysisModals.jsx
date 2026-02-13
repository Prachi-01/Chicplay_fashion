import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, ShoppingBag, Zap, Star, Trophy,
    Smartphone, Camera, Users, Share2, Heart,
    ChevronRight, ArrowRight, CreditCard, Gift,
    Truck, Sparkles, RefreshCw, Eye, Ruler, Home, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useGameStore } from '../../store/gameStore';
import { VirtualModel, AugmentedReality, SizeVisualization } from '../VirtualTryOn';

const PostAnalysisModals = ({ activeModal, setActiveModal, look, archetype }) => {
    const [step, setStep] = useState(1);
    const [socialProof, setSocialProof] = useState(null);
    const [tryOnMode, setTryOnMode] = useState(null); // 'model', 'ar', or 'size'
    const { addToCart } = useCart();
    const { addPoints, addAchievement } = useGameStore();

    // Handle ESC key to close or go back
    const handleEscapeKey = useCallback((e) => {
        if (e.key === 'Escape') {
            if (tryOnMode) {
                setTryOnMode(null); // Go back to selection
            } else {
                handleClose(); // Close modal entirely
            }
        }
    }, [tryOnMode]);

    useEffect(() => {
        if (activeModal) {
            window.addEventListener('keydown', handleEscapeKey);
        }
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, [activeModal, handleEscapeKey]);


    // Social Proof interval
    useEffect(() => {
        if (activeModal === 'bundle' && step === 2) {
            const proofs = [
                "Sarah from Chicago just bought this bundle!",
                "Jessica added the earrings to her bundle",
                "Trending: Purchased 42 times today"
            ];
            const interval = setInterval(() => {
                setSocialProof(proofs[Math.floor(Math.random() * proofs.length)]);
                setTimeout(() => setSocialProof(null), 3000);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [activeModal, step]);

    // Reset step when modal changes
    useEffect(() => {
        setStep(1);
        setTryOnMode(null);
    }, [activeModal]);

    const handleClose = () => {
        setActiveModal(null);
    };

    if (!activeModal) return null;

    const renderBundleContent = () => {
        switch (step) {
            case 1: // Selection Feedback
                return (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center p-12 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }}
                            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200"
                        >
                            <Check size={48} className="text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-mocha mb-2">BUNDLE SELECTED!</h2>
                        <p className="text-gray-500 font-bold">Unlocking smart savings for your {archetype} look...</p>
                        <motion.button
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            onClick={() => setStep(2)}
                            className="mt-8 px-8 py-3 bg-mocha text-white rounded-full font-bold flex items-center gap-2"
                        >
                            Open Smart Bundle Cart <ArrowRight size={18} />
                        </motion.button>
                    </motion.div>
                );
            case 2: // Smart Bundle Cart
                return (
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-mocha italic">🎁 SMART BUNDLE ACTIVATED!</h2>
                                <p className="text-gray-500 text-sm">The complete Signature Look experience is ready for you.</p>
                            </div>
                            <div className="bg-green-100 text-green-600 px-4 py-2 rounded-full font-bold text-sm">
                                Save $89 Total
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Core Outfit</h3>
                                {look.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border font-bold text-mocha">
                                                {item.name[0]}
                                            </div>
                                            <span className="font-bold text-mocha">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-400 line-through text-xs">${Math.round(item.price * 1.15)}</span>
                                            <div className="font-black text-mocha">${item.price}</div>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-4 bg-mocha/5 rounded-xl border-t-2 border-mocha">
                                    <div className="flex justify-between font-black text-mocha">
                                        <span>Subtotal</span>
                                        <span>${look.cost}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Choose Your Tier</h3>
                                <div className="space-y-3">
                                    {[
                                        { t: 1, name: "CORE OUTFIT", desc: "Top + Bottom + Shoes", save: "15%", price: look.cost, was: Math.round(look.cost * 1.2) },
                                        { t: 2, name: "COMPLETE LOOK", desc: "Core + 3 Accessories", save: "24%", price: Math.round(look.cost * 1.4), was: Math.round(look.cost * 1.8), recommended: true },
                                        { t: 3, name: "ULTIMATE STYLE", desc: "Everything + Personal Session", save: "30%", price: Math.round(look.cost * 1.8), was: Math.round(look.cost * 2.6) }
                                    ].map(tier => (
                                        <div key={tier.t} className={`tier-card p-4 rounded-2xl border-2 cursor-pointer relative ${tier.recommended ? 'border-green-500 bg-green-50/30' : 'border-gray-100 bg-white'}`}>
                                            {tier.recommended && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full">🎯 RECOMMENDED</span>}
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-black text-mocha text-sm">TIER {tier.t}: {tier.name}</span>
                                                <span className="text-green-600 font-bold text-xs">Save {tier.save}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mb-2">• {tier.desc}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-lg text-mocha">${tier.price}</span>
                                                <span className="text-xs text-gray-400 line-through">(WAS ${tier.was})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setStep(3)} className="w-full py-4 bg-green-600 text-white rounded-xl font-black shadow-lg hover:bg-green-700 transition">
                                    Proceed to Bundle Checkout
                                </button>
                            </div>
                        </div>

                        {/* Social Proof Popup */}
                        <AnimatePresence>
                            {socialProof && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-green-100 flex items-center gap-3 z-[350]"
                                >
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-bold text-mocha">{socialProof}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                );
            case 3: // Post-Bundle / Confirmation
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center">
                        <div className="mb-8">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                className="inline-block p-4 bg-green-100 rounded-full text-green-600 mb-4"
                            >
                                <Trophy size={48} />
                            </motion.div>
                            <h2 className="text-3xl font-black text-mocha mb-2">🎉 BUNDLE CONFIRMED!</h2>
                            <p className="text-gray-500">Your signature style is locked and loaded.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            {[
                                { icon: <Sparkles />, label: "Points", val: "+350 XP" },
                                { icon: <Truck />, label: "Shipping", val: "FREE Express" },
                                { icon: <Gift />, label: "Gift", val: "Style Guide" }
                            ].map((p, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                                    <div className="flex justify-center text-mocha mb-1">{p.icon}</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase">{p.label}</div>
                                    <div className="font-bold text-sm text-mocha">{p.val}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-mocha/5 p-6 rounded-2xl text-left mb-8">
                            <h4 className="text-xs font-black text-mocha uppercase tracking-widest mb-4">What Happens Next:</h4>
                            <ul className="space-y-3 text-sm text-mocha/70">
                                <li className="flex items-center gap-3"><span className="w-5 h-5 bg-mocha text-white text-[10px] rounded-full flex items-center justify-center font-bold">1</span> Bundle Assembly starts today</li>
                                <li className="flex items-center gap-3"><span className="w-5 h-5 bg-mocha text-white text-[10px] rounded-full flex items-center justify-center font-bold">2</span> Digital Style Guide sent to your inbox</li>
                                <li className="flex items-center gap-3"><span className="w-5 h-5 bg-mocha text-white text-[10px] rounded-full flex items-center justify-center font-bold">3</span> Scheduling your 30-min Virtual Session</li>
                            </ul>
                        </div>

                        <button onClick={handleClose} className="w-full py-4 bg-mocha text-white rounded-xl font-black">
                            Return to Studio
                        </button>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const renderTryOnContent = () => {
        // If a mode is selected, render via Portal for TRUE FULL FRAME



        if (tryOnMode === 'model') {
            return createPortal(
                <VirtualModel
                    onClose={() => setTryOnMode(null)}
                    look={look}
                    archetype={archetype}
                />,
                document.body
            );
        }

        if (tryOnMode === 'ar') {
            return createPortal(
                <AugmentedReality
                    onClose={() => setTryOnMode(null)}
                    look={look}
                    archetype={archetype}
                />,
                document.body
            );
        }

        if (tryOnMode === 'size') {
            return createPortal(
                <SizeVisualization
                    onClose={() => setTryOnMode(null)}
                    look={look}
                    archetype={archetype}
                />,
                document.body
            );
        }

        // Method Selection UI
        return (
            <div className="p-8">
                <h2 className="text-3xl font-black text-mocha mb-2">👗 VIRTUAL TRY-ON STUDIO</h2>
                <p className="text-gray-500 mb-8 font-medium">Experience your {archetype} look before you buy.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Virtual Model Option */}
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTryOnMode('model')}
                        className="step-card group relative cursor-pointer bg-white rounded-2xl p-6 border-2 border-transparent hover:border-blue-300 transition-all shadow-lg hover:shadow-xl"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <Users size={32} className="text-blue-600" />
                        </div>
                        <h4 className="font-black text-mocha mb-2 text-lg">AI REALISTIC TRY-ON</h4>
                        <p className="text-sm text-gray-500 font-medium mb-4">Powered by Fal.ai Qwen-Vision</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                            <li className="flex items-center gap-2">✓ No camera needed</li>
                            <li className="flex items-center gap-2">✓ Fast loading</li>
                            <li className="flex items-center gap-2">✓ Drag & drop dresses</li>
                            <li className="flex items-center gap-2">✓ Body type selector</li>
                        </ul>
                    </motion.div>

                    {/* Augmented Reality Option */}
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTryOnMode('ar')}
                        className="step-card group relative cursor-pointer bg-white rounded-2xl p-6 border-2 border-transparent hover:border-purple-300 transition-all shadow-lg hover:shadow-xl"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <Smartphone size={32} className="text-purple-600" />
                        </div>
                        <h4 className="font-black text-mocha mb-2 text-lg">AUGMENTED REALITY</h4>
                        <p className="text-sm text-gray-500 font-medium mb-4">See the dress on YOU with camera or photo</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                            <li className="flex items-center gap-2">✓ Live camera try-on</li>
                            <li className="flex items-center gap-2">✓ Photo upload option</li>
                            <li className="flex items-center gap-2">✓ Dress overlay adjustment</li>
                            <li className="flex items-center gap-2">✓ Save & share looks</li>
                        </ul>
                    </motion.div>

                    {/* Size Visualization Option */}
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTryOnMode('size')}
                        className="step-card group relative cursor-pointer bg-white rounded-2xl p-6 border-2 border-transparent hover:border-orange-300 transition-all shadow-lg hover:shadow-xl"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <Ruler size={32} className="text-orange-600" />
                        </div>
                        <h4 className="font-black text-mocha mb-2 text-lg">SIZE VISUALIZATION</h4>
                        <p className="text-sm text-gray-500 font-medium mb-4">Measurement-based size prediction</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                            <li className="flex items-center gap-2">✓ Enter measurements</li>
                            <li className="flex items-center gap-2">✓ Compare to objects</li>
                            <li className="flex items-center gap-2">✓ Size charts & graphs</li>
                            <li className="flex items-center gap-2">✓ Fit reviews from similar users</li>
                        </ul>
                    </motion.div>
                </div>

                {/* Quick Tips */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                    <p className="text-sm text-blue-700 font-medium">
                        💡 <strong>Tip:</strong> For the most realistic experience, try our <span className="text-blue-900 font-bold">Augmented Reality</span> mode - see dresses on yourself with your camera or upload a photo!
                    </p>
                </div>
            </div>
        );
    };

    const renderShareContent = () => {
        switch (step) {
            case 1: // Destination Selection
                return (
                    <div className="p-8">
                        <h2 className="text-3xl font-black text-mocha mb-2">📢 SHARE YOUR STYLE</h2>
                        <p className="text-gray-500 mb-8 font-medium">Let the world see your curated {archetype} aesthetic.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: 'social', icon: <Share2 size={32} />, title: "SOCIAL MEDIA", desc: "Instagram, TikTok, Pinterest templates.", color: "bg-orange-50 text-orange-600" },
                                { id: 'friends', icon: <Users size={32} />, title: "FRIENDS & SQUAD", desc: "Get votes and feedback privately.", color: "bg-green-50 text-green-600", recommended: true },
                                { id: 'save', icon: <Heart size={32} />, title: "SAVE & ORGANIZE", desc: "Add to boards or private lookbooks.", color: "bg-pink-50 text-pink-600" }
                            ].map(opt => (
                                <motion.div
                                    key={opt.id}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setStep(2)}
                                    className="step-card group text-center"
                                >
                                    <div className={`mx-auto w-16 h-16 rounded-full ${opt.color} flex items-center justify-center mb-4`}>
                                        {opt.icon}
                                    </div>
                                    <h4 className="font-extrabold text-mocha mb-1">{opt.title}</h4>
                                    <p className="text-xs text-gray-400 font-bold">{opt.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            case 2: // Social Templates
                return (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-mocha uppercase">Choose a Template</h2>
                            <span className="text-orange-600 text-xs font-black">+75 XP REWARD</span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[1, 2, 3, 4].map(t => (
                                <div key={t} className="aspect-[3/4] bg-gray-100 rounded-2xl border-2 border-transparent hover:border-orange-500 cursor-pointer overflow-hidden p-2">
                                    <div className="w-full h-full bg-white rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                                        <Sparkles className="text-orange-300 mb-2" />
                                        <span className="text-[10px] font-black text-gray-400">TEMPLATE {t}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 mb-8">
                            <h4 className="text-xs font-black text-orange-700 uppercase mb-2">Smart Caption Generator:</h4>
                            <p className="text-sm italic text-orange-800/70">
                                "Embracing my inner {archetype} with this perfect ensemble! 💖 Found my signature look on ChicPlay Fashion. #SignatureStyle #ChicPlay"
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-black shadow-lg">Post to Instagram</button>
                            <button onClick={() => setStep(3)} className="flex-1 py-4 bg-mocha text-white rounded-xl font-black">Other Platforms</button>
                        </div>
                    </div>
                );
            case 3: // Community Sharing
                return (
                    <div className="p-8 text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                            <Users size={40} />
                        </motion.div>
                        <h2 className="text-3xl font-black text-mocha mb-2">STYLE SQUAD REACTION</h2>
                        <p className="text-gray-500 mb-8 font-bold text-sm italic">"Sharing with friends increases your confidence Score by 40%!"</p>

                        <div className="space-y-3 mb-8">
                            {[
                                { name: "Sarah (Style Twin)", archetype: "Romantic Dreamer" },
                                { name: "Jessica", archetype: "Modern Classic" }
                            ].map(friend => (
                                <div key={friend.name} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-mocha rounded-full" />
                                        <div className="text-left">
                                            <div className="font-black text-mocha">{friend.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">{friend.archetype}</div>
                                        </div>
                                    </div>
                                    <button className="px-4 py-1.5 bg-mocha text-white rounded-full text-xs font-bold">SEND</button>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleClose} className="w-full py-4 border-2 border-mocha text-mocha rounded-xl font-black hover:bg-mocha hover:text-white transition">
                            Done Sharing
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            <div className="absolute inset-x-8 bottom-8 top-8 z-[300]">
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full h-full glass-panel rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="flex justify-end p-6 border-b border-white/50">
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-black/5 rounded-full transition"
                        >
                            <X size={24} className="text-mocha/50" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            {activeModal === 'bundle' && renderBundleContent()}
                            {activeModal === 'tryon' && renderTryOnContent()}
                            {activeModal === 'share' && renderShareContent()}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PostAnalysisModals;
