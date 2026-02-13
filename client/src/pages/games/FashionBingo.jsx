import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, CheckCircle2, Trophy, Sparkles, Timer,
    Info, Star, Target, Share2, ShoppingBag,
    Zap, Award, TrendingUp, Users, LayoutGrid, Search, X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { toast, Toaster } from 'react-hot-toast';

const SquareModal = ({ square, isOpen, onClose, squares = [] }) => {
    if (!isOpen || !square) return null;

    const getCollectionTip = (type) => {
        if (type === 'FREE') return "This special square is on us! Use it to jumpstart your patterns.";
        if (type === 'Target') return "Find the specific 'Target Item' in the shop to unlock this square for a massive 150+ XP bonus.";
        if (type === 'Bonus') return "Collect this square to earn an extra spin on the Daily Wheel!";
        return `Explore items in the '${type}' category. Viewing, wishlisting, or try-ons will auto-mark this square.`;
    };

    // Calculate Strategic Value
    const getStrategicAdvice = (id) => {
        const row = Math.floor(id / 5);
        const col = id % 5;
        let lines = 2; // Every square is in at least 1 row and 1 col
        if (id % 6 === 0 || (id % 4 === 0 && id > 0 && id < 24)) lines++;

        return {
            lineCount: lines,
            tip: lines >= 3 ? "HIGH PRIORITY: This square sits on a diagonal intersection!" : "Standard piece for completing rows and columns."
        };
    };

    const strategy = getStrategicAdvice(square.id);

    // Mock social/stats data for demonstration as per requirements
    const mockStats = {
        timesCollected: Math.floor(Math.random() * 20) + 5,
        firstCollected: "3 days ago",
        avgTime: "1.5 hours",
        method: square.details?.action || "Browsing"
    };

    const mockFriends = [
        { name: "Sarah", status: "Collected (2h ago)", color: "bg-pink-100" },
        { name: "Emma", status: "Not collected today", color: "bg-gray-100" },
        { name: "Lisa", status: "Collected (Yesterday)", color: "bg-rose-100" }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 40 }}
                    className="relative w-full max-w-xl bg-white rounded-[40px] shadow-3xl overflow-hidden border border-white max-h-[90vh] overflow-y-auto no-scrollbar"
                >
                    <div className="p-8 md:p-10">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-6">
                                <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center text-4xl shadow-2xl ${square.marked ? 'bg-rose-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                                    {square.type === 'FREE' ? '⭐' : square.type === 'Target' ? '🎯' : square.type === 'Bonus' ? '🌟' : '👗'}
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-1 leading-none">{square.type}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${square.marked ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                                            {square.marked ? 'Collected' : 'Pending Action'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-90">
                                <X className="w-8 h-8 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* 1. Personal Stats Section */}
                            <section className="bg-gray-50 rounded-[32px] p-6 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Your History with this category</p>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Times</p>
                                        <p className="text-lg font-black text-gray-900">{mockStats.timesCollected}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">First Time</p>
                                        <p className="text-lg font-black text-gray-900">3d ago</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Avg Time</p>
                                        <p className="text-lg font-black text-gray-900">{mockStats.avgTime}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Common Via</p>
                                        <p className="text-lg font-black text-rose-500">{mockStats.method}</p>
                                    </div>
                                </div>
                            </section>

                            {/* 2. Friends Activity Section */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Friends activity today</p>
                                    <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+11 others</span>
                                </div>
                                <div className="space-y-3">
                                    {mockFriends.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-rose-200 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center font-black text-xs`}>
                                                    {f.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-800">{f.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{f.status}</p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 3. Strategy Tips Section */}
                            <section className="bg-rose-50 rounded-[32px] p-6 border border-rose-100 relative overflow-hidden">
                                <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-rose-100 rotate-12" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-4">QUICK TIPS & STRATEGY</p>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                                                <LayoutGrid size={16} />
                                            </div>
                                            <p className="text-xs font-bold text-gray-600 leading-relaxed uppercase tracking-wide">
                                                Appears in <span className="text-rose-600">{strategy.lineCount} potential lines</span>. {strategy.tip}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                                                <Timer size={16} />
                                            </div>
                                            <p className="text-xs font-bold text-gray-600 leading-relaxed uppercase tracking-wide">
                                                Collect early to open more line options. Average community collection: <span className="text-rose-600">2.1 hours</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 4. Related Actions Section */}
                            <section className="pt-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">Take action to collect square</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Link
                                        to="/shop"
                                        className="col-span-1 bg-gray-900 text-white p-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02]"
                                    >
                                        <ShoppingBag size={18} /> View Shop
                                    </Link>
                                    <Link
                                        to="/dressing-room"
                                        className="col-span-1 bg-white text-gray-900 border-2 border-gray-100 p-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:border-rose-300 hover:text-rose-500 transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02]"
                                    >
                                        <TrendingUp size={18} /> Try Virtually
                                    </Link>
                                    <button className="col-span-1 bg-blue-50 text-blue-600 p-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-100 transition-all flex items-center justify-center gap-3">
                                        <Search size={18} /> Save Search
                                    </button>
                                    <button className="col-span-1 bg-purple-50 text-purple-600 p-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-100 transition-all flex items-center justify-center gap-3">
                                        <Share2 size={18} /> Challenge
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const FashionBingo = () => {
    const navigate = useNavigate();
    const { points, level, streak, bingoCard } = useGameStore();
    const { squares = [], theme = "Essentials", completedPatterns = [] } = bingoCard || {};

    const [selectedSquare, setSelectedSquare] = useState(null);
    const [timeLeft, setTimeLeft] = useState("14:32:15");

    const collectedCount = squares?.filter(s => s.marked)?.length || 0;
    const progressPercent = squares.length > 0 ? Math.round((collectedCount / squares.length) * 100) : 0;

    useEffect(() => {
        const timer = setInterval(() => {
            // Logic to decrement time could go here
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getSquareIcon = (type) => {
        const t = type.toLowerCase();
        if (t === 'free') return "⭐";
        if (t === 'target') return "🎯";
        if (t === 'bonus') return "🌟";
        if (t.includes('dress')) return "👗";
        if (t.includes('shoe')) return "👠";
        if (t.includes('bag')) return "👜";
        if (t.includes('hat')) return "👒";
        if (t.includes('summer')) return "☀️";
        if (t.includes('floral')) return "🌸";
        if (t.includes('jeans')) return "👖";
        if (t.includes('swim')) return "👙";
        if (t.includes('beach')) return "🏖️";
        return "✨";
    };

    return (
        <div className="min-h-screen bg-[#FFF5F7] font-outfit p-4 md:p-8 overflow-x-hidden">
            <Toaster position="bottom-right" />
            <SquareModal
                square={selectedSquare}
                isOpen={!!selectedSquare}
                onClose={() => setSelectedSquare(null)}
                squares={squares}
            />

            {/* Header / Nav */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <button
                    onClick={() => navigate('/game-zone')}
                    className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white hover:bg-white transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 text-rose-500 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black text-xs uppercase tracking-[0.2em] text-gray-800">Back to Lab</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-white flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Total XP</p>
                            <p className="text-sm font-black text-gray-800">{points}</p>
                        </div>
                    </div>
                    <div className="bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-rose-500/20 flex items-center gap-3">
                        <Timer className="w-5 h-5" />
                        <div>
                            <p className="text-[10px] font-black text-rose-100 uppercase leading-none mb-1">Resets In</p>
                            <p className="text-sm font-black">{timeLeft}</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

                {/* Left: The Board */}
                <div className="space-y-8">
                    <div className="bg-white/40 backdrop-blur-xl rounded-[60px] p-8 md:p-12 border border-white shadow-2xl relative overflow-hidden">
                        {/* Title Section */}
                        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-rose-100 px-4 py-2 rounded-xl mb-4">
                                    <LayoutGrid className="w-4 h-4 text-rose-500" />
                                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Day #47 Edition</span>
                                </div>
                                <h1 className="text-6xl font-black text-gray-900 tracking-tighter leading-[0.8] mb-2">FASHION <br /><span className="text-rose-500">BINGO</span></h1>
                                <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">Theme: "{theme}"</p>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Patterns Won</p>
                                <div className="flex gap-2">
                                    {completedPatterns.length > 0 ? (
                                        completedPatterns.map(p => (
                                            <div key={p} className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                                                {p.replace('_', ' ')}
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-gray-300 font-black text-xs uppercase italic tracking-widest">None yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bingo Grid */}
                        <div className="grid grid-cols-5 gap-3 md:gap-4 lg:gap-5 relative z-10">
                            {squares.map((sq) => (
                                <motion.div
                                    key={sq.id}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedSquare(sq)}
                                    className={`aspect-square rounded-[24px] md:rounded-[40px] border-2 flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer relative group ${sq.marked
                                        ? 'bg-gradient-to-br from-rose-500 to-pink-600 border-rose-400 text-white shadow-xl shadow-rose-500/20'
                                        : 'bg-white/70 border-white/50 text-gray-400 hover:border-rose-200 hover:bg-white'
                                        }`}
                                >
                                    {/* Icon/Emoji */}
                                    <span className="text-2xl md:text-3xl lg:text-4xl mb-1 md:mb-2 transform group-hover:scale-110 transition-transform">
                                        {getSquareIcon(sq.type)}
                                    </span>
                                    {/* Label */}
                                    <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-tighter leading-tight ${sq.marked ? 'text-rose-100' : 'text-gray-400'}`}>
                                        {sq.type}
                                    </span>

                                    {/* Checked Indicator */}
                                    {sq.marked && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-2 right-2 bg-white text-rose-500 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center shadow-lg"
                                        >
                                            <CheckCircle2 size={12} className="md:size-14" />
                                        </motion.div>
                                    )}

                                    {/* Tooltip for special squares */}
                                    {(sq.type === 'Target' || sq.type === 'Bonus') && !sq.marked && (
                                        <div className="absolute -top-1 -left-1 bg-amber-400 text-white p-1 rounded-lg shadow-lg">
                                            <Award size={12} />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats Bar */}
                        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-gray-100/50">
                            <div className="flex-1 w-full md:w-auto">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress: {collectedCount}/24</span>
                                    <span className="text-[10px] font-black text-rose-500">{progressPercent}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-white">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">XP Points</p>
                                    <p className="text-2xl font-black text-gray-800 tracking-tighter">+{collectedCount * 5}</p>
                                </div>
                                <div className="w-px h-10 bg-gray-200" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Patterns</p>
                                    <p className="text-2xl font-black text-rose-500 tracking-tighter">{completedPatterns.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How to Play Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/60 backdrop-blur-md rounded-[40px] p-8 border border-white shadow-xl">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-yellow-500" />
                                HOW TO COLLECT
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                        <TrendingUp size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">View products in specific categories</p>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <ShoppingBag size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Add trending items to your wishlist</p>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                        <Share2 size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Share your looks with the community</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden group">
                            <Sparkles className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-black uppercase tracking-tight mb-6">WINNING PERKS</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Any Line</span>
                                    <span className="text-sm font-black text-rose-400">+100 XP</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diagonal</span>
                                    <span className="text-sm font-black text-rose-400">+150 XP</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Four Corners</span>
                                    <span className="text-sm font-black text-rose-400">+200 XP</span>
                                </li>
                                <li className="flex items-center justify-between border-t border-white/10 pt-4">
                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Full House</span>
                                    <span className="text-sm font-black text-amber-400">+500 XP</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Side: Social & Targets */}
                <div className="space-y-8">
                    {/* Live Leaderboard */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[48px] p-8 border border-white shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-500" />
                                TOP STYLISTS
                            </h3>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { name: "FashionQueen", squares: 18, lines: 3, avatar: "F1" },
                                { name: "StyleIcon", squares: 16, lines: 2, avatar: "F2" },
                                { name: "You", squares: collectedCount, lines: completedPatterns.length, avatar: "F3", isMe: true },
                                { name: "DressLover", squares: 12, lines: 1, avatar: "F4" }
                            ].sort((a, b) => b.squares - a.squares).map((player, i) => (
                                <div key={player.name} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${player.isMe ? 'bg-rose-50 border border-rose-100' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden border-2 border-white shadow-sm shrink-0">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`} alt="Av" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-800">{player.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">{player.squares} Squares</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-black ${player.isMe ? 'text-rose-500' : 'text-gray-300'}`}>#{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Target Item Card */}
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden">
                        <Target className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                        <h4 className="text-[10px] font-black text-amber-200 uppercase tracking-[0.3em] mb-4">TARGET ITEM</h4>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center border border-white/30 text-3xl">
                                👒
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase leading-tight">Boho Straw <br />Beach Hat</h3>
                                <p className="text-[10px] font-black text-amber-100 uppercase">+50 BONUS PTS</p>
                            </div>
                        </div>
                        <Link to="/shop">
                            <button className="w-full bg-white text-orange-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
                                FIND ITEM NOW
                            </button>
                        </Link>
                    </div>

                    {/* Promo Section */}
                    <div className="bg-white/40 backdrop-blur-xl rounded-[48px] p-8 border border-white shadow-xl text-center">
                        <Sparkles className="w-8 h-8 text-rose-400 mx-auto mb-4" />
                        <h4 className="text-xl font-black text-gray-800 uppercase mb-2">BINGO STREAK</h4>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Play 7 days in a row for <br />a 500 XP Bonus!</p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                <div key={d} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${d <= streak ? 'bg-rose-500 text-white shadow-md' : 'bg-white/60 text-gray-300'}`}>
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Floating CTA */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]">
                <Link to="/shop">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-900 text-white px-10 py-5 rounded-[30px] font-black text-xs uppercase tracking-[0.4em] shadow-3xl hover:bg-black flex items-center gap-4 border border-white/10"
                    >
                        COLLECT SQUARES IN SHOP <Sparkles className="w-5 h-5 text-amber-400" />
                    </motion.button>
                </Link>
            </div>
        </div>
    );
};

export default FashionBingo;
