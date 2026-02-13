import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import {
    Sparkles, Trophy, ShoppingBag, Flame,
    Gamepad2, Star, Heart, TrendingUp,
    Gift, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginRequiredModal from '../components/auth/LoginRequiredModal';
import StyleQuizModal from '../components/modals/StyleQuizModal';
import GamificationHeader from '../components/gamification/GamificationHeader';

// --- Mock Data ---
const DAILY_CHALLENGE = {
    title: "Bohemian Beach Party",
    countdown: "04:23:15",
    reward: "500 XP"
};



const GAMES = [
    { id: 'dress', title: "Virtual Dressing Room", subtitle: "Create Your Look", icon: <User size={24} />, color: "bg-pink-100", path: "/dressing-room" },
    { id: 'bingo', title: "Fashion Bingo", subtitle: "Collect Trends", icon: <Gamepad2 size={24} />, color: "bg-purple-100", path: "/game-zone/bingo" },
    { id: 'quiz', title: "Style Challenge", subtitle: "Theme: " + DAILY_CHALLENGE.title, icon: <Trophy size={24} />, color: "bg-orange-100", path: "/game-zone/challenge" },
    { id: 'spin', title: "Spin the Wheel", subtitle: "Win Discounts", icon: <Gift size={24} />, color: "bg-blue-100", path: "/game-zone/spin" },
];

const TRENDING_OUTFITS = [
    { id: 1, user: "Sophie_X", likes: 124, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop" },
    { id: 2, user: "FashionNova", likes: 89, img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop" },
    { id: 3, user: "LuxeLife", likes: 256, img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=400&fit=crop" },
];

import { toast } from 'react-hot-toast';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showConfetti, setShowConfetti] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [loginAction, setLoginAction] = useState("");

    // Live points are now handled by gameStore

    // Trigger confetti on load and clear persistent toasts
    useEffect(() => {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 5000);

        // Clear any persistent "Admin Access Denied" toasts since we are now on Home
        toast.dismiss('admin-access-denied');

        return () => clearTimeout(timer);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const handleAction = (action, label) => {
        if (!user) {
            setLoginAction(label);
            setIsLoginModalOpen(true);
            return;
        }
        navigate(action);
    };

    return (
        <div className="min-h-screen bg-cream font-sans overflow-x-hidden relative">
            <LoginRequiredModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                actionName={loginAction}
            />
            <StyleQuizModal
                isOpen={isQuizModalOpen}
                onClose={() => setIsQuizModalOpen(false)}
            />
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} colors={['#E6B7C8', '#B76E79', '#6F4E37']} />}

            {/* --- Hero Section --- */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-blush/20 via-cream to-cream">

                {/* Floating Background Elements */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-[10%] opacity-20"
                >
                    <ShoppingBag size={120} className="text-rosegold" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-40 right-[10%] opacity-20"
                >
                    <Star size={100} className="text-mocha" />
                </motion.div>

                <div className="container mx-auto px-6 z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold text-mocha mb-6 leading-tight tracking-tight">
                            Where Fashion <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rosegold to-pink-600">
                                Becomes a Game
                            </span>
                        </h1>
                        <p className="text-xl text-mocha/70 mb-10 max-w-2xl mx-auto">
                            Level up your wardrobe. Compete in daily style challenges. Earn rewards for every look.
                        </p>

                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: '0 0 30px rgba(255, 107, 139, 0.8), 0 8px 40px rgba(157, 78, 221, 0.4)'
                                }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ boxShadow: '0 8px 32px rgba(255, 107, 139, 0.4)' }}
                                onClick={() => setIsQuizModalOpen(true)}
                                className="relative group overflow-hidden bg-gradient-to-r from-[#FF6B8B] to-[#9D4EDD] text-white px-10 py-5 rounded-full font-black text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 border-2 border-white/20"
                            >
                                {/* Animated Shine Effect */}
                                <motion.div
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                                />

                                <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                                <span className="relative z-10 filter drop-shadow-md">Discover Your Style Personality</span>

                                {/* Pulse Glow */}
                                <div className="absolute inset-0 rounded-full animate-pulse-slow bg-white/10 group-hover:bg-white/20 transition-colors" />
                            </motion.button>

                            <Link to="/shop">
                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: '#FFFFFF' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white/80 backdrop-blur-sm text-mocha border-2 border-mocha/10 px-10 py-5 rounded-full font-black text-xl shadow-xl hover:border-rosegold hover:text-rosegold transition-all duration-300"
                                >
                                    Shop Collection
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Daily Challenge Banner */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-blush/30 w-full max-w-4xl"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-rosegold/10 p-3 rounded-full">
                                    <Flame className="text-rosegold" size={32} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Daily Challenge</h3>
                                    <p className="text-2xl font-black text-mocha">{DAILY_CHALLENGE.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-gray-400">ENDS IN</p>
                                    <p className="font-mono text-xl font-bold text-rosegold">{DAILY_CHALLENGE.countdown}</p>
                                </div>
                                <button
                                    onClick={() => handleAction('/game-zone', 'join fashion challenges')}
                                    className="bg-mocha text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition"
                                >
                                    Join Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- Gamification Dashboard --- */}
            <section className="py-12 bg-white relative">
                <div className="container mx-auto px-6">
                    <GamificationHeader />
                </div>
            </section>

            {/* --- Featured Games --- */}
            <section className="py-20 px-6 container mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold text-mocha mb-2">Play & Earn</h2>
                        <p className="text-lg text-gray-500">Complete challenges to unlock exclusive items.</p>
                    </div>
                    <button
                        onClick={() => handleAction('/game-zone', 'play and earn rewards')}
                        className="text-rosegold font-bold hover:text-pink-700 transition flex items-center gap-1"
                    >
                        View All Games <TrendingUp size={16} />
                    </button>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {GAMES.map((game) => (
                        <motion.div
                            key={game.id}
                            variants={itemVariants}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => handleAction(game.path, `play ${game.title}`)}
                            className={`p-6 rounded-3xl ${game.color} bg-opacity-40 border-2 border-transparent hover:border-white shadow-sm hover:shadow-xl transition cursor-pointer relative overflow-hidden group`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50 bg-white/50 rounded-bl-3xl">
                                {game.icon}
                            </div>
                            <h3 className="text-xl font-bold text-mocha mb-1">{game.title}</h3>
                            <p className="text-sm text-mocha/70 mb-4">{game.subtitle}</p>
                            <button className="bg-white text-mocha text-xs font-bold px-4 py-2 rounded-full shadow-sm group-hover:bg-rosegold group-hover:text-white transition">
                                {game.id === 'dress' ? 'Enter Studio' : 'Play Now'}
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* --- Community & Social --- */}
            <section className="py-20 bg-mocha text-cream relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-rosegold font-bold tracking-widest uppercase mb-2 block">Community</span>
                        <h2 className="text-4xl font-extrabold text-white mb-4">Trending Looks</h2>
                        <p className="text-white/60">See how others are styling this season's drops.</p>
                    </div>

                    <div className="flex gap-8 overflow-x-auto pb-8 snap-x">
                        {TRENDING_OUTFITS.map((outfit) => (
                            <div key={outfit.id} className="min-w-[300px] snap-center relative group rounded-2xl overflow-hidden aspect-[3/4]">
                                <img src={outfit.img} alt="OOTD" className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-white font-bold text-lg">@{outfit.user}</p>
                                            <p className="text-white/70 text-sm">Wearing: Silk Slip Dress</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-pink-400">
                                            <Heart fill="currentColor" size={20} />
                                            <span className="font-bold">{outfit.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Coming Soon Events --- */}
            <section className="py-20 container mx-auto px-6">
                <div className="bg-rosegold/10 rounded-[3rem] p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-rosegold/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>

                    <span className="bg-white/50 backdrop-blur px-4 py-1 rounded-full text-xs font-bold text-mocha uppercase tracking-wider mb-6 inline-block">
                        Live Event
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-mocha mb-6">Virtual Runway Show</h2>
                    <p className="text-xl text-mocha/60 max-w-2xl mx-auto mb-10">
                        Join us this Friday for the unveiling of the "Cyber Chic" collection.
                        Users who attend will receive an exclusive **Digital T-Shirt**.
                    </p>

                    <div className="flex justify-center gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-lg min-w-[100px]">
                            <div className="text-3xl font-black text-rosegold">02</div>
                            <div className="text-xs font-bold text-gray-400 uppercase">Days</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-lg min-w-[100px]">
                            <div className="text-3xl font-black text-rosegold">14</div>
                            <div className="text-xs font-bold text-gray-400 uppercase">Hours</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-lg min-w-[100px]">
                            <div className="text-3xl font-black text-rosegold">45</div>
                            <div className="text-xs font-bold text-gray-400 uppercase">Mins</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Floating Elements --- */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="relative group cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-tr from-rosegold to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white animate-bounce-slow hover:animate-none hover:scale-110 transition">
                        <Sparkles strokeWidth={2.5} />
                    </div>
                    {/* Assistant Bubble */}
                    <div className="absolute bottom-full right-0 mb-4 w-64 bg-white p-4 rounded-2xl rounded-br-none shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                        <p className="text-sm text-mocha font-bold mb-1">Psst! Need style advice?</p>
                        <p className="text-xs text-gray-500">I can help you find the perfect outfit for the Beach Party challenge!</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Home;
