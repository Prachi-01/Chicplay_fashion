import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, HelpCircle, ChevronRight, ChevronDown,
    Truck, RefreshCw, Ruler, CreditCard, ShieldCheck,
    MessageSquare, Sparkles, X
} from 'lucide-react';
import './FAQ.css';

const FAQ = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeId, setActiveId] = useState(null);

    const faqData = [
        {
            id: 1,
            category: 'Orders',
            question: 'How do I track my order?',
            answer: 'Once your order is shipped, you will receive an email with a tracking number and a link to track your package. You can also track it directly in your ChicPlay account under the "Orders" section.',
            icon: <Truck size={18} />
        },
        {
            id: 2,
            category: 'Returns',
            question: 'What is your return policy?',
            answer: 'We offer a 30-day "no questions asked" return policy. Items must be unworn, with tags attached, and in their original packaging. Return shipping is free for all domestic orders!',
            icon: <RefreshCw size={18} />
        },
        {
            id: 3,
            category: 'Shipping',
            question: 'Do you ship internationally?',
            answer: 'Yes! We ship to over 50 countries worldwide. International shipping times vary between 7-14 business days depending on your location and chosen shipping method.',
            icon: <HelpCircle size={18} />
        },
        {
            id: 4,
            category: 'Size & Fit',
            question: 'How do I know my size?',
            answer: 'Our "Size Guide" linked on every product page provides detailed measurements for each item. Still unsure? You can chat with our Virtual Stylist for a personalized recommendation!',
            icon: <Ruler size={18} />
        },
        {
            id: 5,
            category: 'Orders',
            question: 'Can I cancel or change my order?',
            answer: 'Orders can be cancelled within 1 hour of placement. After that, we begin processing your items immediately. To request a change, please contact our support team ASAP.',
            icon: <X size={18} />
        },
        {
            id: 6,
            category: 'Payments',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, AMEX), PayPal, Apple Pay, Google Pay, and also offer "Shop Now, Pay Later" via Klarna and Afterpay.',
            icon: <CreditCard size={18} />
        },
        {
            id: 7,
            category: 'Security',
            question: 'Is my payment information secure?',
            answer: 'Absolutely. We use 256-bit SSL encryption to protect your data. We never store your full credit card details on our servers.',
            icon: <ShieldCheck size={18} />
        }
    ];

    const filteredFaqs = useMemo(() => {
        return faqData.filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const toggleFaq = (id) => {
        setActiveId(activeId === id ? null : id);
    };

    return (
        <div className="faq-page">
            {/* HERO SECTION */}
            <section className="faq-hero">
                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="hero-badge">Help Center</span>
                        <h1>How can we help you today?</h1>
                        <p>Search our knowledge base or browse common questions below.</p>

                        <div className="search-container">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search for questions (e.g. shipping, returns, sizes)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="clear-search" onClick={() => setSearchQuery('')}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="faq-container">
                {/* FAQ LIST */}
                <div className="faq-results">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <motion.div
                                key={faq.id}
                                className={`faq-item ${activeId === faq.id ? 'active' : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <button className="faq-question" onClick={() => toggleFaq(faq.id)}>
                                    <div className="question-text">
                                        <span className="faq-category-tag">{faq.category}</span>
                                        <h3>{faq.question}</h3>
                                    </div>
                                    <div className="faq-toggle-icon">
                                        {activeId === faq.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {activeId === faq.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="faq-answer-container"
                                        >
                                            <div className="faq-answer">
                                                <p>{faq.answer}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <div className="no-results">
                            <HelpCircle size={48} className="text-gray-300 mb-4" />
                            <h3>No matching questions found</h3>
                            <p>Try searching for different keywords or contact our support team.</p>
                            <button className="contact-btn" onClick={() => window.location.href = '/contact'}>
                                Contact Support
                            </button>
                        </div>
                    )}
                </div>

                {/* SIDEBAR / HELP TILES */}
                <aside className="faq-sidebar">
                    <div className="help-card need-help">
                        <MessageSquare className="card-icon" />
                        <h4>Still Need Help?</h4>
                        <p>Our style advisors are online and ready to assist you in real-time.</p>
                        <button onClick={() => window.dispatchEvent(new CustomEvent('openTozy'))}>
                            Open Live Chat
                        </button>
                    </div>

                    <div className="help-card style-bonus">
                        <Sparkles className="card-icon" />
                        <h4>Earn XP!</h4>
                        <p>Get +20 XP for reading through our help guides and resolving issues.</p>
                        <div className="xp-badge">+20 XP Available</div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default FAQ;
