import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy, Flame, Users, Target, Puzzle, Gamepad2, Palette, Shirt,
    Play, Timer, Award, TrendingUp, Calendar, ArrowLeft,
    Sparkles, Bell, Search, Filter, Gift, Zap, Brain
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Toaster } from 'react-hot-toast';

// --- Components ---

const GameDashboard = ({ points, level, streak }) => {
    return (
        <div className="w-full bg-white/40 backdrop-blur-xl border-b border-white/20 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-12">
                <Link to="/shop" className="text-2xl font-black text-gray-800 tracking-tighter flex items-center gap-2">
                    <ArrowLeft className="w-6 h-6" />
                    CHICPLAY
                </Link>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-2xl shadow-sm border border-white/40">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                        <span className="text-sm font-black text-gray-800">{streak} DAYS</span>
                    </div>

                    <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-2xl shadow-sm border border-white/40">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-black text-gray-800">{points} PTS</span>
                    </div>

                    <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-2xl shadow-sm border border-white/40">
                        <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">{level}</div>
                        <span className="text-sm font-black text-gray-800 tracking-widest uppercase">ICON</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-3 bg-white/80 rounded-2xl hover:bg-white transition-all shadow-sm relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="User" />
                </div>
            </div>
        </div>
    );
};

const SkillProgress = ({ label, value, color, icon }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-${color}-100 text-${color}-600`}>{icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
            </div>
            <span className={`text-[10px] font-black text-${color}-600`}>{value}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden p-[2px]">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                className={`h-full bg-${color}-500 rounded-full`}
            />
        </div>
    </div>
);

const GameZone = () => {
    const navigate = useNavigate();
    const { points, level, streak } = useGameStore();

    const labGames = [
        {
            id: 'bingo',
            title: 'Fashion Bingo',
            subtitle: 'Collect Trends to Win',
            icon: <Puzzle className="w-8 h-8" />,
            reward: '500',
            color: 'from-rose-400 to-pink-600',
            path: '/game-zone/bingo'
        },
        {
            id: 'spin',
            title: 'Spin the Wheel',
            subtitle: 'Win Daily Prizes',
            icon: <Gift className="w-8 h-8" />,
            reward: '100+',
            color: 'from-indigo-400 to-purple-600',
            path: '/game-zone/spin'
        },
        {
            id: 'challenge',
            title: 'Style Challenge',
            subtitle: 'Weekly Performance',
            icon: <Target className="w-8 h-8" />,
            reward: '300',
            color: 'from-orange-400 to-rose-500',
            path: '/game-zone/challenge'
        }
    ];

    return (
        <div className="h-screen bg-[#FFF5F7] font-outfit overflow-hidden flex flex-col">
            <Toaster position="bottom-right" />

            <GameDashboard points={points} level={level} streak={streak} />

            <main className="max-w-[1700px] mx-auto px-12 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 relative z-10 overflow-hidden min-h-0 py-12">

                {/* Left Side: Games Hub */}
                <div className="flex flex-col h-full overflow-y-auto pr-4 scrollbar-hide space-y-16 pb-24">

                    <div>
                        <div className="max-w-xl mb-12">
                            <h1 className="text-7xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-6">
                                STYLE <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">LAB</span>
                            </h1>
                            <p className="text-gray-500 text-xl font-bold">Evolution is key. Master the meta-games to dominate the fashion world.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {labGames.map((game) => (
                                <motion.div
                                    key={game.id}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    onClick={() => navigate(game.path)}
                                    className="group relative bg-white/60 backdrop-blur-md rounded-[50px] p-8 border border-white shadow-xl cursor-pointer overflow-hidden h-[400px] flex flex-col"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 blur-3xl`} />

                                    <div className="mb-8">
                                        <div className={`w-20 h-20 rounded-[30px] bg-gradient-to-br ${game.color} text-white flex items-center justify-center shadow-lg`}>
                                            {game.icon}
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-none mb-4 group-hover:text-rose-500 transition-colors">
                                        {game.title}
                                    </h3>
                                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-10">
                                        {game.subtitle}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-amber-500" />
                                            <span className="text-sm font-black text-gray-800">{game.reward} PTS</span>
                                        </div>
                                        <div className="bg-gray-900 text-white p-4 rounded-2xl group-hover:bg-rose-500 transition-all">
                                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Classic Missions */}
                    <div>
                        <h3 className="text-3xl font-black text-gray-800 tracking-tight uppercase mb-8">MISSION ARCHIVE</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Fashion Quiz', icon: <Brain />, pts: 100 },
                                { title: 'Color Theory', icon: <Palette />, pts: 150 },
                                { title: 'Speed Dressing', icon: <Zap />, pts: 200 }
                            ].map((m, i) => (
                                <div key={i} className="bg-white/40 p-6 rounded-3xl border border-white flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                            {m.icon}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-600">{m.title}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-rose-500">+{m.pts} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Identity */}
                <div className="h-full space-y-10 overflow-hidden flex flex-col">
                    <div className="bg-white/40 backdrop-blur-xl rounded-[48px] p-8 border border-white shadow-2xl space-y-10 flex-1">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center shadow-xl shadow-rose-500/20">
                                <Award className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tighter leading-none mb-2">ICON STATUS</h3>
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Level {level} Master Stylist</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <SkillProgress label="Color Mastery" value={45} color="teal" icon={<Palette className="w-4 h-4" />} />
                            <SkillProgress label="Pattern Logic" value={22} color="amber" icon={<Shirt className="w-4 h-4" />} />
                            <SkillProgress label="Speed Dressing" value={68} color="rose" icon={<Zap className="w-4 h-4" />} />
                        </div>

                        <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden">
                            <Sparkles className="absolute top-0 right-0 w-32 h-32 opacity-10 animate-pulse" />
                            <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mb-4">ACTIVE SEASON</h4>
                            <h3 className="text-3xl font-black mb-2 tracking-tight">WINTER GALA</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Unlock the 'Ice Crown' by completing all Week 2 games.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GameZone;
