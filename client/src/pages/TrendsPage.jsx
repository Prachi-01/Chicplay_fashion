import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Search, Eye, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './TrendsPage.css';

const TrendsPage = () => {
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            // Sort by salesCount or reviewsCount to simulate "trending"
            const trending = res.data
                .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
                .slice(0, 8);
            setTrendingProducts(trending);
        } catch (err) {
            console.error("Error fetching trending products:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trends-page min-h-screen bg-cream pb-20">
            {/* Trend Banner */}
            <div className="trends-hero relative overflow-hidden h-[60vh] flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000"
                        alt="Fashion Trends"
                        className="w-full h-full object-cover grayscale opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent"></div>
                </div>

                <div className="relative z-10 text-center text-white px-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 bg-rosegold/90 backdrop-blur-md px-6 py-2 rounded-full mb-6 font-bold"
                    >
                        <Flame size={20} className="text-yellow-400" />
                        <span>LIVE STREAMING TRENDS</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-7xl font-black italic tracking-tighter mb-4"
                    >
                        MOST WANTED <br /> COLLECTIONS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-300 font-medium"
                    >
                        What the community is searching for right now.
                    </motion.p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-20 relative z-20">
                <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-blush/20">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-rosegold">
                                <TrendingUp size={24} />
                            </div>
                            <h2 className="text-4xl font-black text-mocha">Trending Now</h2>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search the trends..."
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rosegold transition-all"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 h-80 rounded-[2rem] mb-4"></div>
                                    <div className="bg-gray-200 h-6 w-3/4 rounded mb-2"></div>
                                    <div className="bg-gray-200 h-6 w-1/4 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {trendingProducts.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="trend-card relative group"
                                >
                                    <div className="trend-rank absolute -top-4 -left-4 w-12 h-12 bg-mocha text-white rounded-full flex items-center justify-center font-black italic text-xl z-20 shadow-lg border-4 border-white">
                                        #{index + 1}
                                    </div>
                                    <div className="trend-image-container h-[450px] rounded-[2.5rem] overflow-hidden relative shadow-md group-hover:shadow-2xl transition-all duration-500">
                                        <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                        <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform">
                                            <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold mb-2">
                                                <TrendingUp size={14} />
                                                <span>{Math.floor(Math.random() * 500) + 100}k clicks this week</span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-4 line-clamp-1">{product.name}</h3>
                                            <div className="flex gap-3">
                                                <Link
                                                    to={`/products/${product._id}`}
                                                    className="flex-1 bg-white text-mocha py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-rosegold hover:text-white transition-colors"
                                                >
                                                    <Eye size={16} /> Shop Now
                                                </Link>
                                                <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                                                    <ShoppingBag size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="mt-20 bg-mocha rounded-[3rem] p-12 text-white flex flex-col lg:flex-row items-center gap-10">
                        <div className="flex-1">
                            <h2 className="text-4xl font-black mb-6">DON'T MISS THE WAVE</h2>
                            <p className="text-xl text-gray-400 mb-8">Join the inner circle and get notified the moment a new trend drops. Be the first to wear it.</p>
                            <div className="flex gap-4">
                                <input type="email" placeholder="Enter your email" className="flex-1 bg-white/10 border-white/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-rosegold" />
                                <button className="bg-rosegold text-white px-8 py-4 rounded-2xl font-bold hover:bg-pink-700 transition-colors">JOIN NOW</button>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center hover:bg-white/10 transition-colors">
                                <span className="text-3xl font-black mb-2 text-rosegold">12k+</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">New arrivals</span>
                            </div>
                            <div className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center hover:bg-white/10 transition-colors">
                                <span className="text-3xl font-black mb-2 text-rosegold">85%</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Sell through</span>
                            </div>
                            <div className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center hover:bg-white/10 transition-colors">
                                <span className="text-3xl font-black mb-2 text-rosegold">24/7</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Trend update</span>
                            </div>
                            <div className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center hover:bg-white/10 transition-colors">
                                <span className="text-3xl font-black mb-2 text-rosegold">1.2M</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Community</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendsPage;
