import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Info, Trophy, Sparkles, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { toast, Toaster } from 'react-hot-toast';
import { Tag, Truck, RefreshCcw, Star, Percent } from 'lucide-react';

const PRIZES = [
    { label: '5% OFF', icon: <Percent className="w-5 h-5" />, value: '5OFF', color: '#FFB5B5', textColor: '#A04747' },
    { label: '50 XP', icon: <Star className="w-5 h-5" />, value: 50, color: '#A3E4D7', textColor: '#1D8348' },
    { label: 'Free Shipping', icon: <Truck className="w-5 h-5" />, value: 'SHIP', color: '#D2B4DE', textColor: '#633974' },
    { label: 'Try Again', icon: <RefreshCcw className="w-5 h-5" />, value: 0, color: '#F9E79F', textColor: '#9A7D0A' },
    { label: '10% OFF', icon: <Percent className="w-5 h-5" />, value: '10OFF', color: '#AED6F1', textColor: '#1B4F72' },
    { label: '100 XP', icon: <Star className="w-5 h-5" />, value: 100, color: '#FAD7A0', textColor: '#7E5109' },
    { label: '5% OFF', icon: <Tag className="w-5 h-5" />, value: '5OFF', color: '#D5F5E3', textColor: '#145A32' },
    { label: 'Try Again', icon: <RefreshCcw className="w-5 h-5" />, value: 0, color: '#F5CBA7', textColor: '#6E2C00' }
];

const SpinWheel = () => {
    const navigate = useNavigate();
    const { points, addPoints, addDiscount } = useGameStore();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [wonPrize, setWonPrize] = useState(null);
    const [status, setStatus] = useState({ canSpin: false, nextSpinAvailableAt: null });
    const [timeLeft, setTimeLeft] = useState("");
    const timerRef = useRef(null);

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/game/spin/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus(res.data);
        } catch (err) {
            console.error("Failed to fetch spin status", err);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const updateCountdown = () => {
        if (!status.nextSpinAvailableAt) return;

        const now = new Date();
        const next = new Date(status.nextSpinAvailableAt);
        const diff = next - now;

        if (diff <= 0) {
            setTimeLeft("");
            setStatus(prev => ({ ...prev, canSpin: true }));
            return;
        }

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    useEffect(() => {
        if (!status.canSpin && status.nextSpinAvailableAt) {
            timerRef.current = setInterval(updateCountdown, 1000);
            updateCountdown();
        } else {
            clearInterval(timerRef.current);
            setTimeLeft("");
        }
        return () => clearInterval(timerRef.current);
    }, [status]);

    const handleSpin = async () => {
        if (!status.canSpin || isSpinning) return;

        setIsSpinning(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/game/spin/spin', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { prize: serverPrize, nextSpinAvailableAt } = res.data;

            // Find index of the prize to land on it visually
            const winnerIndex = PRIZES.findIndex(p => p.label === serverPrize.label);
            const landingIndex = winnerIndex !== -1 ? winnerIndex : 0;

            const extraRotation = 1800 + (360 - (landingIndex * 45) - 22.5);
            setRotation(prev => prev + extraRotation);

            setTimeout(() => {
                setIsSpinning(false);
                setWonPrize(PRIZES[landingIndex]);

                // Update local storage points/discounts for immediate feedback
                if (typeof serverPrize.value === 'number' && serverPrize.value > 0) {
                    addPoints(serverPrize.value);
                } else if (typeof serverPrize.value === 'string' && serverPrize.value.includes('OFF')) {
                    addDiscount({ type: 'percentage', value: serverPrize.value.replace('OFF', '') + '%' });
                }

                setShowModal(true);
                setStatus({ canSpin: false, nextSpinAvailableAt });
            }, 3000);

        } catch (err) {
            setIsSpinning(false);
            const orbitalMsg = err.response?.data?.message || "Something went wrong";
            toast.error(orbitalMsg);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FF] font-outfit p-8 overflow-hidden relative">
            <Toaster position="bottom-right" />

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-12 flex items-center justify-between relative z-10">
                <button onClick={() => navigate('/game-zone')} className="flex items-center gap-2 text-indigo-400/60 hover:text-indigo-600 font-black uppercase text-[10px] tracking-widest group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Lab
                </button>
                <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-indigo-100 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">
                        {status.canSpin ? "Spin Available" : "Locked"}
                    </span>
                </div>
            </div>

            <main className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
                <div className="mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-4 uppercase leading-none">
                        Spin & Win <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">Exclusive Rewards</span> Today!
                    </h1>
                    <p className="text-gray-500 font-medium max-w-md mx-auto text-lg leading-relaxed">
                        Try your luck on our magical wheel. You could win discounts, bonus XP, or free shipping instantly!
                    </p>
                </div>

                <div className="relative mb-12">
                    {/* The Wheel Container */}
                    <div className="relative w-80 h-80 md:w-[450px] md:h-[450px]">
                        <motion.div
                            animate={{ rotate: rotation }}
                            transition={{ duration: 3, ease: [0.13, 0.99, 0.3, 1] }}
                            className="w-full h-full rounded-full border-[12px] border-white relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden ring-8 ring-white/50 backdrop-blur-sm"
                            style={{
                                background: `conic-gradient(${PRIZES.map((p, i) => `${p.color} ${i * 45}deg ${(i + 1) * 45}deg`).join(', ')})`
                            }}
                        >
                            {PRIZES.map((prize, idx) => (
                                <div key={idx} className="absolute inset-0 origin-center" style={{ transform: `rotate(${idx * 45 + 22.5}deg)` }}>
                                    <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-center" style={{ color: prize.textColor }}>
                                        <div className="mb-2 opacity-80">{prize.icon}</div>
                                        <div className="text-[10px] md:text-xs font-black uppercase tracking-tight max-w-[60px]">
                                            {prize.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Center Pin Button */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center z-20 ring-4 ring-white/30">
                            <button
                                onClick={handleSpin}
                                disabled={!status.canSpin || isSpinning}
                                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all ${status.canSpin && !isSpinning
                                    ? 'bg-gradient-to-br from-indigo-500 to-rose-400 text-white shadow-lg hover:scale-105 active:scale-95'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <span className="text-[10px] font-black tracking-widest leading-none">TAP TO</span>
                                <span className="text-lg font-black tracking-[0.05em]">SPIN</span>
                            </button>
                        </div>

                        {/* Stopper */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-12 bg-white rounded-full shadow-xl z-30 flex items-center justify-center">
                            <div className="w-2 h-6 bg-red-500 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-sm space-y-6">
                    <button
                        onClick={handleSpin}
                        disabled={!status.canSpin || isSpinning}
                        className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-[0.2em] shadow-xl transition-all relative overflow-hidden group ${status.canSpin && !isSpinning
                            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            {isSpinning ? (
                                <RefreshCcw className="w-6 h-6 animate-spin" />
                            ) : status.canSpin ? (
                                <Zap className="w-6 h-6 fill-current" />
                            ) : (
                                <Trophy className="w-6 h-6" />
                            )}
                            {isSpinning ? 'SPINNING...' : status.canSpin ? 'SPIN THE WHEEL' : 'LOCKED'}
                        </div>
                        {status.canSpin && !isSpinning && (
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        )}
                    </button>

                    <div className="flex justify-center items-center gap-8">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                {status.canSpin ? "Ready to Win" : "Next Spin In"}
                            </p>
                            <p className="text-sm font-black text-gray-800">
                                {status.canSpin ? "GOOD LUCK!" : timeLeft || "COMPLETED"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <Info className="w-4 h-4" />
                    New daily spin available every 24 hours
                </div>
            </main>

            {/* Reward Feedback Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-3xl relative overflow-hidden"
                        >
                            {/* Confetti Background Effect */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

                            <div className="mb-6 inline-flex w-20 h-20 rounded-full bg-indigo-50 items-center justify-center text-4xl">
                                🎉
                            </div>

                            <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Congratulations!</h3>
                            <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">You've unlocked a reward</p>

                            <div className="bg-indigo-50 rounded-3xl p-6 mb-8 border-2 border-dashed border-indigo-200">
                                <div className="text-indigo-600 mb-2 flex justify-center">{wonPrize?.icon}</div>
                                <div className="text-4xl font-black text-gray-900 tracking-tighter">
                                    {wonPrize?.label}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg"
                            >
                                AWESOME!
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpinWheel;
