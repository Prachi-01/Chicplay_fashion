import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Timer, Trophy, Play, CheckCircle2, Star, Sparkles, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { toast, Toaster } from 'react-hot-toast';

const StyleChallenge = () => {
    const navigate = useNavigate();
    const { points, level, activeChallenge } = useGameStore();
    const { score = 0, theme = "Bohemian Beach Party" } = activeChallenge || {};

    const handleStart = () => {
        toast.success("Syncing wardrobe for challenge...");
        setTimeout(() => navigate('/dressing-room'), 1500);
    };

    return (
        <div className="min-h-screen bg-[#FFFBF5] font-outfit p-8 overflow-hidden">
            <Toaster position="bottom-right" />

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-12 flex items-center justify-between">
                <button onClick={() => navigate('/game-zone')} className="flex items-center gap-2 text-mocha/60 hover:text-mocha font-black uppercase text-[10px] tracking-widest group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Lab
                </button>
                <div className="flex gap-4">
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-black text-gray-800">{score}/100 TOP SCORE</span>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-2xl mb-6">
                                <Sparkles className="w-4 h-4 text-orange-600" />
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Active Tournament</span>
                            </div>
                            <h1 className="text-7xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-6">STYLE <br /><span className="text-orange-500">CHALLENGE</span></h1>
                            <p className="text-gray-500 font-bold text-xl">Showcase your instincts. Assemble the perfect look for the weekly theme and get scored by the AI stylist.</p>
                        </div>

                        <div className="bg-white rounded-[48px] p-10 border border-orange-50 shadow-2xl space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Theme</p>
                                    <h3 className="text-3xl font-black text-gray-800">{theme}</h3>
                                </div>
                                <div className="bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-rose-500" />
                                    <span className="text-xs font-black text-rose-500 uppercase">14:22:05</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100">
                                    <p className="text-[10px] font-black text-orange-500 uppercase mb-4">Must Include</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> 1 Floral Pattern
                                        </li>
                                        <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Beach Accessory
                                        </li>
                                        <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Summer Tones
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4">Prize Pool</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-gray-900">300</span>
                                        <span className="text-sm font-black text-orange-500">XP</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 mt-2">Plus: 'Boho Guru' Medal</p>
                                </div>
                            </div>

                            <button
                                onClick={handleStart}
                                className="w-full bg-gray-900 text-white py-8 rounded-[32px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 group"
                            >
                                ENTER STUDIO <Play className="w-6 h-6 fill-current group-hover:scale-125 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/5] bg-gray-100 rounded-[60px] overflow-hidden shadow-inner relative group">
                            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Reference" />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                            <div className="absolute bottom-10 left-10 text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-orange-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Inspiration</span>
                                </div>
                                <h4 className="text-3xl font-black uppercase tracking-tighter">Mediterranean <br />Summer Night</h4>
                            </div>
                        </div>
                        {/* Interactive Elements Floating */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-[#FFFBF5]">
                            <Star className="w-8 h-8 text-amber-500 fill-amber-500 mb-1" />
                            <span className="text-xs font-black text-gray-800">ELITE</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StyleChallenge;
