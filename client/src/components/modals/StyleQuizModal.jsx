import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Sparkles, ChevronRight, ChevronLeft,
    Check, Trophy, Share2, ShoppingBag,
    Heart, Palette, Star, Zap, Crown
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import SignatureStudioModal from './SignatureStudioModal';

const QUESTIONS = [
    {
        id: 1,
        text: "What's your go-to color palette?",
        options: [
            { label: "Neutrals & Classics", sub: "Black, White, Beige, Navy", emoji: "🔘", archetype: "Classic Elegance" },
            { label: "Bright & Bold", sub: "Red, Yellow, Electric Blue", emoji: "🔴", archetype: "Edgy Trendsetter" },
            { label: "Soft & Romantic", sub: "Blush, Lavender, Sage", emoji: "🌸", archetype: "Romantic Dreamer" },
            { label: "Earthy & Bohemian", sub: "Terracotta, Olive, Mustard", emoji: "🌿", archetype: "Boho Free Spirit" }
        ]
    },
    {
        id: 2,
        text: "When you walk into a room, you want to feel...",
        options: [
            { label: "Polished & Put-together", sub: "Professional & Sharp", archetype: "Sophisticated Workwear" },
            { label: "Comfortable & Effortless", sub: "The Cool Girl vibe", archetype: "Street Style Cool" },
            { label: "Dramatic & Eye-catching", sub: "The Trendsetter", archetype: "Glamour Goddess" },
            { label: "Creative & Unique", sub: "The Artist vibe", archetype: "Artistic Eclectic" }
        ]
    },
    {
        id: 3,
        text: "Where do you get your style inspiration?",
        options: [
            { label: "Instagram & TikTok", archetype: "Edgy Trendsetter" },
            { label: "Magazines & Runways", archetype: "Classic Elegance" },
            { label: "Vintage & Thrift Finds", archetype: "Boho Free Spirit" },
            { label: "Nature & Art Galleries", archetype: "Modern Minimalist" }
        ]
    },
    {
        id: 4,
        text: "You can't live without...",
        options: [
            { label: "Perfect pair of jeans", archetype: "Street Style Cool" },
            { label: "Little black dress", archetype: "Classic Elegance" },
            { label: "Statement accessories", archetype: "Edgy Trendsetter" },
            { label: "Comfortable sneakers", archetype: "Utility Chic" }
        ]
    },
    {
        id: 5,
        text: "Your ideal weekend activity is...",
        options: [
            { label: "Beach picnic with friends", archetype: "Coastal Girl" },
            { label: "Visiting a farmers market", archetype: "Cottagecore" },
            { label: "Attending a gallery opening", archetype: "Artistic Eclectic" },
            { label: "Hiking or city trekking", archetype: "Utility Chic" }
        ]
    },
    {
        id: 6,
        text: "How do you prefer to shop?",
        options: [
            { label: "Online, with filters", archetype: "Modern Minimalist" },
            { label: "In-store, trying on", archetype: "Romantic Dreamer" },
            { label: "Quick, know what I want", archetype: "Classic Elegance" },
            { label: "Browsing for hours", archetype: "Boho Free Spirit" }
        ]
    },
    {
        id: 7,
        text: "Your dream vacation spot is...",
        options: [
            { label: "Amalfi Coast, Italy", archetype: "Coastal Girl" },
            { label: "Paris Fashion Week", archetype: "Glamour Goddess" },
            { label: "Cotswolds countryside", archetype: "Cottagecore" },
            { label: "Berlin Art District", archetype: "Artistic Eclectic" }
        ]
    },
    {
        id: 8,
        text: "Getting ready for a special event is...",
        options: [
            { label: "Exciting! Plan weeks ahead", archetype: "Edgy Trendsetter" },
            { label: "Stressful, never know", archetype: "Modern Minimalist" },
            { label: "Fun, try different looks", archetype: "Romantic Dreamer" },
            { label: "Simple, have go-to outfits", archetype: "Classic Elegance" }
        ]
    },
    {
        id: 9,
        text: "You're most likely to splurge on...",
        options: [
            { label: "Designer handbag or shoes", archetype: "Classic Elegance" },
            { label: "High-quality basics", archetype: "Modern Minimalist" },
            { label: "Statement coat or jacket", archetype: "Edgy Trendsetter" },
            { label: "Unique vintage piece", archetype: "Boho Free Spirit" }
        ]
    },
    {
        id: 10,
        text: "Your workplace attire is usually...",
        options: [
            { label: "Power suit & sharp lines", archetype: "Sophisticated Workwear" },
            { label: "Smart casual & functional", archetype: "Utility Chic" },
            { label: "Breezy & professional", archetype: "Coastal Girl" },
            { label: "Creative & expressive", archetype: "Artistic Eclectic" }
        ]
    },
    {
        id: 11,
        text: "In your free time, you'd rather...",
        options: [
            { label: "Bake or garden", archetype: "Cottagecore" },
            { label: "Visit a rooftop lounge", archetype: "Glamour Goddess" },
            { label: "Go surfing or beach walking", archetype: "Coastal Girl" },
            { label: "Organize your life/closet", archetype: "Modern Minimalist" }
        ]
    },
    {
        id: 12,
        text: "Your style over the years has...",
        options: [
            { label: "Stayed consistent, classic", archetype: "Classic Elegance" },
            { label: "Changed with trends", archetype: "Edgy Trendsetter" },
            { label: "Evolved sophisticated", archetype: "Modern Minimalist" },
            { label: "Always been experimental", archetype: "Street Style Cool" }
        ]
    }
];

const ARCHETYPES = {
    'Classic Elegance': {
        icon: <Crown className="text-amber-500" />,
        color: '#8B5A2B',
        description: 'Timeless, sophisticated, loves quality basics',
        styleTips: ['Invest in tailoring', 'Stick to neutral palette'],
        celebrityMatch: ['Victoria Beckham', 'Meghan Markle'],
        palette: ['#000000', '#FFFFFF', '#F5F5DC', '#000080', '#A52A2A']
    },
    'Boho Free Spirit': {
        icon: <Palette className="text-pink-500" />,
        color: '#FF6B8B',
        description: 'Creative, loves patterns, vintage-inspired',
        styleTips: ['Layer textures', 'Mix patterns boldly'],
        celebrityMatch: ['Sienna Miller', 'Florence Welch'],
        palette: ['#800020', '#556B2F', '#CC7722', '#F4A460', '#E2725B']
    },
    'Modern Minimalist': {
        icon: <Zap className="text-blue-500" />,
        color: '#2C3E50',
        description: 'Clean lines, monochrome, functional fashion',
        styleTips: ['Focus on fit', 'Quality over quantity'],
        celebrityMatch: ['Phoebe Philo', 'Hailey Bieber'],
        palette: ['#F2F2F2', '#E0E0E0', '#BDBDBD', '#757575', '#212121']
    },
    'Edgy Trendsetter': {
        icon: <Star className="text-red-500" />,
        color: '#E74C3C',
        description: 'Always ahead, experimental, fashion-forward',
        styleTips: ['Take risks', 'Mix high & low'],
        celebrityMatch: ['Rihanna', 'Bella Hadid'],
        palette: ['#FF0000', '#FFFF00', '#0000FF', '#00FF00', '#FF00FF']
    },
    'Romantic Dreamer': {
        icon: <Heart className="text-rose-400" />,
        color: '#FFB6C1',
        description: 'Feminine, delicate fabrics, loves dresses',
        styleTips: ['Embrace florals', 'Add soft layers'],
        celebrityMatch: ['Taylor Swift', 'Zendaya'],
        palette: ['#FFC0CB', '#E6E6FA', '#F0FFF0', '#FFF0F5', '#DB7093']
    },
    'Street Style Cool': {
        icon: <ShoppingBag className="text-slate-600" />,
        color: '#34495E',
        description: 'Comfort-first, sneaker lover, urban edge',
        styleTips: ['Master athleisure', 'Accessorize boldly'],
        celebrityMatch: ['Kendall Jenner', 'Gigi Hadid'],
        palette: ['#2F4F4F', '#008B8B', '#B8860B', '#A9A9A9', '#000000']
    },
    'Coastal Girl': {
        icon: <Sparkles className="text-blue-400" />,
        color: '#4A90E2',
        description: 'Breezy, relaxed, inspired by the rhythm of the waves',
        styleTips: ['Opt for linen', 'Stick to breezy shapes'],
        celebrityMatch: ['Blake Lively', 'Margot Robbie'],
        palette: ['#F0F8FF', '#E0FFFF', '#B0E0E6', '#ADD8E6', '#87CEEB']
    },
    'Glamour Goddess': {
        icon: <Crown className="text-yellow-600" />,
        color: '#FFD700',
        description: 'Luxurious, dramatic, red-carpet ready',
        styleTips: ['Go for gold', 'Choose bold textures'],
        celebrityMatch: ['Beyoncé', 'Jennifer Lopez'],
        palette: ['#FFD700', '#DAA520', '#B8860B', '#EE82EE', '#9400D3']
    },
    'Cottagecore': {
        icon: <Palette className="text-green-600" />,
        color: '#2EC4B6',
        description: 'Vintage, pastoral, nostalgic charm',
        styleTips: ['Puff sleeves', 'Floral prints'],
        celebrityMatch: ['Elle Fanning', 'Taylor Swift'],
        palette: ['#F5F5DC', '#FFE4E1', '#E0EEE0', '#FFF5EE', '#F0E68C']
    },
    'Utility Chic': {
        icon: <Zap className="text-orange-600" />,
        color: '#5D445D',
        description: 'Functional, structured, practical elegance',
        styleTips: ['Cargo details', 'Sharp tailoring'],
        celebrityMatch: ['Rosie Huntington-Whiteley', 'Victoria Beckham'],
        palette: ['#556B2F', '#8B4513', '#2F4F4F', '#708090', '#000000']
    },
    'Artistic Eclectic': {
        icon: <Palette className="text-purple-600" />,
        color: '#A67B94',
        description: 'Creative, unique, mixed patterns',
        styleTips: ['Unconventional cuts', 'Pattern clashing'],
        celebrityMatch: ['Iris Apfel', 'Solange Knowles'],
        palette: ['#9932CC', '#FF1493', '#00CED1', '#FF8C00', '#ADFF2F']
    },
    'Sophisticated Workwear': {
        icon: <Crown className="text-slate-800" />,
        color: '#2C3E50',
        description: 'Professional, polished, boardroom-ready',
        styleTips: ['Sharp blazers', 'Pencil silhouettes'],
        celebrityMatch: ['Amal Clooney', 'Kate Middleton'],
        palette: ['#000080', '#2F4F4F', '#708090', '#F5F5F5', '#000000']
    }
};

const StyleQuizModal = ({ isOpen, onClose }) => {
    const { completeStyleQuiz } = useGameStore();
    const [step, setStep] = useState('intro'); // intro, quiz, analyzing, results
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [isCurating, setIsCurating] = useState(false);
    const [isStudioOpen, setIsStudioOpen] = useState(false);
    const [archetypeWinner, setArchetypeWinner] = useState('');

    const handleAnswer = (option) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = option;
        setAnswers(newAnswers);

        if (currentQuestion < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
        } else {
            setStep('analyzing');
            generateResult(newAnswers);
        }
    };

    const generateResult = (finalAnswers) => {
        // Simple tally
        const counts = {};
        finalAnswers.forEach(ans => {
            counts[ans.archetype] = (counts[ans.archetype] || 0) + 1;
        });

        // Find max
        let maxCount = 0;
        let winner = 'Modern Minimalist';
        Object.entries(counts).forEach(([arch, count]) => {
            if (count > maxCount) {
                maxCount = count;
                winner = arch;
            }
        });

        setTimeout(() => {
            setResult(ARCHETYPES[winner] || ARCHETYPES['Modern Minimalist']);
            setArchetypeWinner(winner);
            setStep('results');
            completeStyleQuiz(winner, { answers: finalAnswers, counts });
        }, 3000);
    };

    const handleShopSignature = () => {
        setIsCurating(true);
        // Simulate sparkle burst and curation logic
        setTimeout(() => {
            setIsCurating(false);
            setIsStudioOpen(true);
        }, 3500);
    };

    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-mocha/60 backdrop-blur-md"
                />

                <motion.div
                    layout
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white/95 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-mocha transition z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="p-8 md:p-12">
                        {step === 'intro' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 bg-rosegold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="text-rosegold" size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-mocha mb-4 uppercase tracking-tight">🎀 Discover Your Fashion DNA</h2>
                                <p className="text-gray-500 font-medium mb-8">
                                    Answer 8 quick questions to unlock your personal style archetype and earn exclusive rewards!
                                </p>
                                <ul className="text-left max-w-xs mx-auto space-y-3 mb-10">
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div>
                                        Personal Style Archetype
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div>
                                        Achievement Badge Unlocked
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div>
                                        Bonus 100 XP
                                    </li>
                                </ul>
                                <button
                                    onClick={() => setStep('quiz')}
                                    className="w-full bg-rosegold text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-pink-200 hover:bg-pink-600 transition flex items-center justify-center gap-3"
                                >
                                    Start Analysis
                                </button>
                            </motion.div>
                        )}

                        {step === 'quiz' && (
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                                        <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
                                        <span>{Math.round(progress)}% Complete</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-rosegold to-purple-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-mocha leading-tight">
                                    {QUESTIONS[currentQuestion].text}
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {QUESTIONS[currentQuestion].options.map((opt, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.02, backgroundColor: '#FFF5F7' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAnswer(opt)}
                                            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-rosegold transition-all text-left group"
                                        >
                                            <div className="text-2xl">{opt.emoji || "✨"}</div>
                                            <div className="flex-1">
                                                <div className="font-bold text-mocha group-hover:text-rosegold transition-colors">{opt.label}</div>
                                                {opt.sub && <div className="text-xs text-gray-400 font-medium">{opt.sub}</div>}
                                            </div>
                                            <ChevronRight className="text-gray-300 group-hover:text-rosegold transition-colors" size={20} />
                                        </motion.button>
                                    ))}
                                </div>

                                {currentQuestion > 0 && (
                                    <button
                                        onClick={() => setCurrentQuestion(currentQuestion - 1)}
                                        className="text-gray-400 font-bold text-sm flex items-center gap-1 hover:text-mocha transition"
                                    >
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {step === 'analyzing' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <div className="relative w-32 h-32 mx-auto mb-8">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-4 border-dashed border-rosegold/30"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-4 rounded-full border-4 border-dashed border-purple-500/30"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles className="text-rosegold animate-pulse" size={48} />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-mocha mb-2 italic">Analyzing your fashion DNA...</h3>
                                <p className="text-gray-400 font-medium animate-pulse">Consulting the trend archives...</p>
                            </motion.div>
                        )}

                        {step === 'results' && result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8"
                            >
                                <div>
                                    <div className="inline-block px-4 py-1 bg-rosegold/10 rounded-full text-xs font-black text-rosegold uppercase tracking-widest mb-4">
                                        🎉 Style Archetype Revealed!
                                    </div>
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white">
                                        <div className="text-5xl">{result.icon}</div>
                                    </div>
                                    <h2 className="text-4xl font-black text-mocha mb-2 leading-tight">The {result.description.split(',')[0]}</h2>
                                    <p className="text-gray-500 font-medium px-8">{result.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-cream/50 p-4 rounded-2xl text-left border border-mocha/5">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Style Tips</h4>
                                        <ul className="space-y-2">
                                            {result.styleTips.map((tip, i) => (
                                                <li key={i} className="text-sm font-bold text-mocha flex items-center gap-2">
                                                    <Check className="text-green-500" size={14} /> {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-cream/50 p-4 rounded-2xl text-left border border-mocha/5">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Celeb Match</h4>
                                        <ul className="space-y-2">
                                            {result.celebrityMatch.map((celeb, i) => (
                                                <li key={i} className="text-sm font-bold text-mocha flex items-center gap-2">
                                                    <Star className="text-yellow-500 fill-yellow-500" size={14} /> {celeb}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Signature Palette</h4>
                                    <div className="flex justify-center gap-3">
                                        {result.palette.map((color, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="w-10 h-10 rounded-full shadow-sm border-2 border-white"
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">🎀</div>
                                        <div className="text-left">
                                            <div className="text-xs font-black text-rose-400 uppercase tracking-widest">Victory!</div>
                                            <div className="text-base font-black text-mocha">"Style Discovered" Unlocked</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-rosegold">+100</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Bonus XP</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleShopSignature}
                                        className="w-full relative overflow-hidden bg-gradient-to-br from-[#9D4EDD] to-[#FF6B8B] text-white py-5 rounded-full font-extrabold text-xl shadow-[0_10px_40px_rgba(155,78,221,0.4)] flex items-center justify-center gap-3 border-2 border-white/20 group"
                                    >
                                        <motion.div
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                        />
                                        <Sparkles className="animate-pulse" size={24} />
                                        <span className="relative z-10">Shop Your Signature Look</span>
                                    </motion.button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="flex items-center justify-center gap-2 py-3 px-6 bg-white border-2 border-mocha/10 rounded-xl font-bold text-mocha hover:border-rosegold transition">
                                            <Share2 size={18} /> Share Results
                                        </button>
                                        <button className="flex items-center justify-center gap-2 py-3 px-6 bg-white border-2 border-mocha/10 rounded-xl font-bold text-mocha hover:border-rosegold transition underline decoration-rosegold decoration-2 underline-offset-4">
                                            Save My DNA
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Curation Overlay */}
            <AnimatePresence>
                {isCurating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center p-8 text-center"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-6xl mb-8"
                        >
                            ✨
                        </motion.div>
                        <h2 className="text-3xl font-black text-mocha mb-6 italic animate-pulse">
                            Curating your signature look...
                        </h2>
                        <div className="w-full max-w-sm h-3 bg-gray-100 rounded-full overflow-hidden mb-4 border border-mocha/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3 }}
                                className="h-full bg-gradient-to-r from-[#9D4EDD] to-[#FF6B8B]"
                            />
                        </div>
                        <div className="flex gap-4 text-2xl">
                            {['👗', '👠', '👜', '💍'].map((emoji, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.5, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    {emoji}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SignatureStudioModal
                isOpen={isStudioOpen}
                onClose={() => setIsStudioOpen(false)}
                archetype={archetypeWinner}
            />
        </AnimatePresence>
    );
};

export default StyleQuizModal;
