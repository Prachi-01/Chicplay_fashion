import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCcw, ShoppingBag, ChevronLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './StyleQuiz.css';

const StyleQuiz = () => {
    const [step, setStep] = useState(0); // 0: Start, 1-12: Questions, 13: Results
    const [answers, setAnswers] = useState({});
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);

    const questions = [
        {
            id: 1,
            question: "How would you describe your everyday fashion sense?",
            options: [
                { text: "Minimalist & Clean", value: "Minimalist" },
                { text: "Bold & Experimental", value: "Aesthetic" },
                { text: "Comfortable & Casual", value: "Casual" },
                { text: "Elegant & Sophisticated", value: "Formal" }
            ]
        },
        {
            id: 2,
            question: "Which color palette speaks to you the most?",
            options: [
                { text: "Earth tones & Neutrals", value: "Boho" },
                { text: "Vibrant & Bright colors", value: "Streetwear" },
                { text: "Monochrome (Black & White)", value: "Minimalist" },
                { text: "Pastels & Soft hues", value: "Preppy" }
            ]
        },
        {
            id: 3,
            question: "What's your go-to outfit for a weekend outing?",
            options: [
                { text: "Oversized tee & Cargo pants", value: "Streetwear" },
                { text: "A floral sundress", value: "Boho" },
                { text: "Jeans & a crisp white shirt", value: "Minimalist" },
                { text: "A tailored blazer & trousers", value: "Formal" }
            ]
        },
        {
            id: 4,
            question: "Choose a footwear style that you can't live without:",
            options: [
                { text: "Classic Sneakers", value: "Streetwear" },
                { text: "Strappy Sandals", value: "Boho" },
                { text: "Sleek Loafers", value: "Formal" },
                { text: "Sturdy Boots", value: "Grunge" }
            ]
        },
        {
            id: 5,
            question: "What's your preferred accessory?",
            options: [
                { text: "Statement Jewelry", value: "Aesthetic" },
                { text: "A classic leather watch", value: "Formal" },
                { text: "A quirky bucket hat", value: "Streetwear" },
                { text: "No accessories, keep it simple", value: "Minimalist" }
            ]
        },
        {
            id: 6,
            question: "How do you feel about patterns and prints?",
            options: [
                { text: "Love them! The louder, the better.", value: "Aesthetic" },
                { text: "I prefer subtle, classic prints like stripes.", value: "Preppy" },
                { text: "I stick to solid colors only.", value: "Minimalist" },
                { text: "Bohemian prints are my favorite.", value: "Boho" }
            ]
        },
        {
            id: 7,
            question: "What's your ideal fabric?",
            options: [
                { text: "Natural linen and cotton", value: "Minimalist" },
                { text: "Rich silk and satin", value: "Formal" },
                { text: "Durable denim", value: "Casual" },
                { text: "Distressed leather", value: "Grunge" }
            ]
        },
        {
            id: 8,
            question: "Which fashion era inspires you most?",
            options: [
                { text: "The 70s Flare", value: "Boho" },
                { text: "90s Grunge", value: "Grunge" },
                { text: "Modern Streetwear", value: "Streetwear" },
                { text: "Old Money / Classic 50s", value: "Formal" }
            ]
        },
        {
            id: 9,
            question: "Where do you get your style inspiration?",
            options: [
                { text: "High-fashion runways", value: "Formal" },
                { text: "Street style & Social media", value: "Streetwear" },
                { text: "Vintage movies & thrift stores", value: "Retro" },
                { text: "Art & Nature", value: "Aesthetic" }
            ]
        },
        {
            id: 10,
            question: "What's your vibe for a first date?",
            options: [
                { text: "Effortlessly cool", value: "Streetwear" },
                { text: "Dreamy and romantic", value: "Boho" },
                { text: "Sharp and polished", value: "Formal" },
                { text: "Trendy and cute", value: "Preppy" }
            ]
        },
        {
            id: 11,
            question: "How much time do you spend planning an outfit?",
            options: [
                { text: "Seconds - I grab what's on top", value: "Casual" },
                { text: "Minutes - I have a few go-to combos", value: "Minimalist" },
                { text: "I plan it the night before", value: "Preppy" },
                { text: "Hours - Fashion is my art form", value: "Aesthetic" }
            ]
        },
        {
            id: 12,
            question: "What's your ultimate fashion goal?",
            options: [
                { text: "To be the most comfortable person in the room", value: "Casual" },
                { text: "To turn heads with my unique look", value: "Aesthetic" },
                { text: " To always look organized and professional", value: "Formal" },
                { text: "To have a timeless capsule wardrobe", value: "Minimalist" }
            ]
        }
    ];

    const handleAnswer = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
        if (step < questions.length) {
            setStep(step + 1);
        } else {
            calculateResults();
        }
    };

    const calculateResults = async () => {
        setLoading(true);
        setStep(questions.length + 1);

        // Calculate the most frequent style choice
        const styleCounts = {};
        Object.values(answers).forEach(val => {
            styleCounts[val] = (styleCounts[val] || 0) + 1;
        });

        const topStyle = Object.keys(styleCounts).reduce((a, b) => styleCounts[a] > styleCounts[b] ? a : b);

        try {
            const res = await api.get('/products');
            // Filter products based on the top style archetypes or tags
            const suggested = res.data.filter(p =>
                p.archetype === topStyle ||
                p.tags?.some(tag => tag.toLowerCase() === topStyle.toLowerCase()) ||
                p.category?.toLowerCase() === topStyle.toLowerCase()
            ).slice(0, 4);

            setRecommendedProducts(suggested.length > 0 ? suggested : res.data.slice(0, 4));
        } catch (err) {
            console.error("Error fetching recommendations:", err);
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setStep(0);
        setAnswers({});
        setRecommendedProducts([]);
        setQuizStarted(false);
    };

    return (
        <div className="style-quiz-container">
            <div className="quiz-card-wrapper max-w-4xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="quiz-start-screen bg-white rounded-[3rem] p-12 shadow-2xl text-center border border-blush/20"
                        >
                            <div className="quiz-icon-large text-rosegold mb-6">
                                <Sparkles size={64} className="mx-auto animate-pulse" />
                            </div>
                            <h1 className="quiz-title text-4xl font-black text-mocha mb-4">Discover Your Style Persona</h1>
                            <p className="quiz-subtitle text-lg text-gray-500 mb-8 max-w-md mx-auto">
                                Answer 12 quick questions about your fashion preferences and we'll curate a personalized collection just for you.
                            </p>
                            <button
                                onClick={() => { setQuizStarted(true); setStep(1); }}
                                className="start-btn bg-rosegold text-white px-10 py-4 rounded-full font-bold text-xl shadow-lg hover:bg-pink-700 transition-all flex items-center gap-3 mx-auto"
                            >
                                Start Quiz <ArrowRight size={24} />
                            </button>
                        </motion.div>
                    )}

                    {step > 0 && step <= questions.length && (
                        <motion.div
                            key={`question-${step}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="quiz-question-screen bg-white rounded-[3rem] p-12 shadow-2xl border border-blush/20 relative"
                        >
                            <div className="quiz-progress-bar absolute top-0 left-0 h-2 bg-rosegold rounded-full transition-all duration-500" style={{ width: `${(step / questions.length) * 100}%` }}></div>

                            <div className="flex justify-between items-center mb-10">
                                <span className="quiz-step-indicator bg-pink-50 text-rosegold px-4 py-2 rounded-full font-bold text-sm">
                                    Question {step} of {questions.length}
                                </span>
                                {step > 1 && (
                                    <button onClick={() => setStep(step - 1)} className="back-btn text-gray-400 hover:text-mocha flex items-center gap-2 transition-colors">
                                        <ChevronLeft size={20} /> Back
                                    </button>
                                )}
                            </div>

                            <h2 className="question-text text-3xl font-bold text-mocha mb-8">{questions[step - 1].question}</h2>

                            <div className="options-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                                {questions[step - 1].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(questions[step - 1].id, option.value)}
                                        className={`option-btn p-6 rounded-2xl border-2 text-left font-bold transition-all duration-300 ${answers[questions[step - 1].id] === option.value ? 'bg-rosegold text-white border-rosegold shadow-lg scale-105' : 'bg-white text-mocha border-gray-100 hover:border-rosegold/30 hover:bg-pink-50'}`}
                                    >
                                        {option.text}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step > questions.length && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="quiz-results-screen bg-white rounded-[3rem] p-12 shadow-2xl border border-blush/20"
                        >
                            {loading ? (
                                <div className="loading-results text-center py-20">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="mb-6 inline-block"
                                    >
                                        <RefreshCcw size={48} className="text-rosegold" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-mocha">Analyzing your style...</h3>
                                    <p className="text-gray-400">Our stylists are picking the perfect items for you!</p>
                                </div>
                            ) : (
                                <div className="results-content text-center">
                                    <div className="results-header mb-12">
                                        <div className="inline-block bg-pink-50 p-4 rounded-full mb-4">
                                            <Sparkles size={40} className="text-rosegold" />
                                        </div>
                                        <h2 className="text-4xl font-black text-mocha">Your Style Matches!</h2>
                                        <p className="text-gray-500 mt-2">Based on your choices, we think you'll love these pieces:</p>
                                    </div>

                                    <div className="recommended-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                        {recommendedProducts.map(product => (
                                            <motion.div
                                                key={product._id}
                                                whileHover={{ y: -10 }}
                                                className="recommendation-card group bg-gray-50 rounded-2xl overflow-hidden border border-transparent hover:border-rosegold/20 hover:shadow-xl transition-all"
                                            >
                                                <div className="recommendation-image-wrapper h-64 relative overflow-hidden">
                                                    <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute top-3 right-3">
                                                        <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-gray-400 hover:text-pink-500">
                                                            <Heart size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4 text-left">
                                                    <h4 className="font-bold text-mocha text-sm truncate">{product.name}</h4>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-rosegold font-bold">₹{product.price}</span>
                                                        <Link to={`/products/${product._id}`} className="text-xs font-bold text-mocha hover:text-rosegold flex items-center gap-1">
                                                            View Details <ArrowRight size={12} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="results-footer flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={resetQuiz}
                                            className="reset-quiz-btn px-8 py-3 rounded-full border-2 border-rosegold text-rosegold font-bold hover:bg-rosegold hover:text-white transition-all flex items-center gap-2 justify-center"
                                        >
                                            <RefreshCcw size={18} /> Take Quiz Again
                                        </button>
                                        <Link
                                            to="/shop"
                                            className="go-to-shop-btn px-8 py-3 rounded-full bg-mocha text-white font-bold hover:bg-black transition-all flex items-center gap-2 justify-center"
                                        >
                                            <ShoppingBag size={18} /> Explore Full Shop
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StyleQuiz;
