import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ruler, Sparkles, ChevronLeft, MessageSquare,
    TrendingUp, Award, Users, ArrowRight, X, Globe, Info
} from 'lucide-react';
import { createPortal } from 'react-dom';
import SizeCalculator from '../components/SizeCalculator';
import './SizeGuide.css';

const SizeGuide = () => {
    const navigate = useNavigate();
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState('in'); // 'in' or 'cm'
    const [selectedCategory, setSelectedCategory] = useState('dresses'); // 'dresses', 'tops', 'bottoms'

    // Function to open Tozy chatbot
    const openTozy = () => {
        window.dispatchEvent(new CustomEvent('openTozy'));
    };

    // Size chart data
    const sizeCharts = {
        dresses: [
            { size: 'XS', bust: { in: 32, cm: 81 }, waist: { in: 25, cm: 63.5 }, hips: { in: 35, cm: 89 }, length: { in: 35, cm: 89 } },
            { size: 'S', bust: { in: 34, cm: 86 }, waist: { in: 27, cm: 68.5 }, hips: { in: 37, cm: 94 }, length: { in: 36, cm: 91 } },
            { size: 'M', bust: { in: 36, cm: 91 }, waist: { in: 29, cm: 74 }, hips: { in: 39, cm: 99 }, length: { in: 37, cm: 94 } },
            { size: 'L', bust: { in: 38, cm: 96.5 }, waist: { in: 31, cm: 79 }, hips: { in: 41, cm: 104 }, length: { in: 38, cm: 96.5 } },
            { size: 'XL', bust: { in: 40, cm: 101.5 }, waist: { in: 33, cm: 84 }, hips: { in: 43, cm: 109 }, length: { in: 39, cm: 99 } },
        ],
        tops: [
            { size: 'XS', bust: { in: 32, cm: 81 }, waist: { in: 25, cm: 63.5 }, shoulder: { in: 14, cm: 35.5 }, sleeve: { in: 23, cm: 58.5 } },
            { size: 'S', bust: { in: 34, cm: 86 }, waist: { in: 27, cm: 68.5 }, shoulder: { in: 15, cm: 38 }, sleeve: { in: 24, cm: 61 } },
            { size: 'M', bust: { in: 36, cm: 91 }, waist: { in: 29, cm: 74 }, shoulder: { in: 16, cm: 40.5 }, sleeve: { in: 25, cm: 63.5 } },
            { size: 'L', bust: { in: 38, cm: 96.5 }, waist: { in: 31, cm: 79 }, shoulder: { in: 17, cm: 43 }, sleeve: { in: 26, cm: 66 } },
            { size: 'XL', bust: { in: 40, cm: 101.5 }, waist: { in: 33, cm: 84 }, shoulder: { in: 18, cm: 45.5 }, sleeve: { in: 27, cm: 68.5 } },
        ],
        bottoms: [
            { size: 'XS', waist: { in: 25, cm: 63.5 }, hips: { in: 35, cm: 89 }, inseam: { in: 30, cm: 76 }, rise: { in: 9, cm: 23 } },
            { size: 'S', waist: { in: 27, cm: 68.5 }, hips: { in: 37, cm: 94 }, inseam: { in: 30, cm: 76 }, rise: { in: 9.5, cm: 24 } },
            { size: 'M', waist: { in: 29, cm: 74 }, hips: { in: 39, cm: 99 }, inseam: { in: 30, cm: 76 }, rise: { in: 10, cm: 25.5 } },
            { size: 'L', waist: { in: 31, cm: 79 }, hips: { in: 41, cm: 104 }, inseam: { in: 30, cm: 76 }, rise: { in: 10.5, cm: 26.5 } },
            { size: 'XL', waist: { in: 33, cm: 84 }, hips: { in: 43, cm: 109 }, inseam: { in: 30, cm: 76 }, rise: { in: 11, cm: 28 } },
        ]
    };

    const internationalSizes = [
        { us: 'XS', uk: 6, eu: 34, jp: 7, in: 28 },
        { us: 'S', uk: 8, eu: 36, jp: 9, in: 30 },
        { us: 'M', uk: 10, eu: 38, jp: 11, in: 32 },
        { us: 'L', uk: 12, eu: 40, jp: 13, in: 34 },
        { us: 'XL', uk: 14, eu: 42, jp: 15, in: 36 },
    ];

    return (
        <div className="size-guide-page">
            {/* Hero Section */}
            <div className="size-guide-hero">
                <button
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    <ChevronLeft size={20} />
                    <span>Back</span>
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hero-content"
                >
                    <div className="hero-icon">
                        <Ruler size={48} />
                    </div>
                    <h1 className="hero-title">Perfect Fit Guide</h1>
                    <p className="hero-subtitle">Find your ideal size with our AI-powered styling assistant</p>
                </motion.div>

                <div className="hero-decoration">
                    <Sparkles className="sparkle-1" size={24} />
                    <Sparkles className="sparkle-2" size={16} />
                    <Sparkles className="sparkle-3" size={20} />
                </div>
            </div>

            {/* Main Content */}
            <div className="size-guide-container">
                {/* Virtual Stylist Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stylist-card"
                >
                    <div className="card-glow"></div>
                    <div className="card-content">
                        <div className="card-header">
                            <div className="header-icon">
                                <MessageSquare size={32} />
                            </div>
                            <div>
                                <h2 className="card-title">Virtual Stylist</h2>
                                <p className="card-subtitle">Get personalized size recommendations</p>
                            </div>
                        </div>

                        <p className="card-description">
                            Not sure what size to order? Send us your measurements, and our AI stylist
                            will recommend your perfect size instantly!
                        </p>

                        <div className="card-actions">
                            <button onClick={openTozy} className="primary-action-btn">
                                <MessageSquare size={20} />
                                <span>Chat with Stylist</span>
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => setShowSizeModal(true)}
                                className="secondary-action-btn"
                            >
                                <Ruler size={20} />
                                <span>Size Calculator</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* How to Measure Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="measurement-guide"
                >
                    <h2 className="section-title">📏 How to Measure Yourself</h2>
                    <div className="measurement-grid">
                        <div className="measurement-item">
                            <div className="measurement-icon">1</div>
                            <h4>Bust</h4>
                            <p>Measure around the fullest part of your bust, keeping the tape parallel to the floor</p>
                        </div>
                        <div className="measurement-item">
                            <div className="measurement-icon">2</div>
                            <h4>Waist</h4>
                            <p>Measure around your natural waistline (bend to one side to find the crease)</p>
                        </div>
                        <div className="measurement-item">
                            <div className="measurement-icon">3</div>
                            <h4>Hips</h4>
                            <p>Measure around the fullest part of your hips, about 7-9 inches below your waist</p>
                        </div>
                        <div className="measurement-item">
                            <div className="measurement-icon">4</div>
                            <h4>Height</h4>
                            <p>Stand straight against a wall and measure from the top of your head to the floor</p>
                        </div>
                    </div>
                    <div className="measurement-tip">
                        <Info size={20} />
                        <p><strong>Pro Tip:</strong> Use a flexible measuring tape and don't pull it too tight. Wear fitted clothing or measure directly on skin for best accuracy.</p>
                    </div>
                </motion.div>

                {/* Size Charts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="size-charts-section"
                >
                    <h2 className="section-title">📊 Size Charts</h2>

                    {/* Category Tabs */}
                    <div className="category-tabs">
                        <button
                            className={`tab ${selectedCategory === 'dresses' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('dresses')}
                        >
                            Dresses
                        </button>
                        <button
                            className={`tab ${selectedCategory === 'tops' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('tops')}
                        >
                            Tops
                        </button>
                        <button
                            className={`tab ${selectedCategory === 'bottoms' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('bottoms')}
                        >
                            Bottoms
                        </button>
                    </div>

                    {/* Unit Toggle */}
                    <div className="unit-toggle">
                        <button
                            className={selectedUnit === 'in' ? 'active' : ''}
                            onClick={() => setSelectedUnit('in')}
                        >
                            Inches
                        </button>
                        <button
                            className={selectedUnit === 'cm' ? 'active' : ''}
                            onClick={() => setSelectedUnit('cm')}
                        >
                            Centimeters
                        </button>
                    </div>

                    {/* Size Table */}
                    <div className="size-table-container">
                        <table className="size-table">
                            <thead>
                                <tr>
                                    <th>Size</th>
                                    {selectedCategory === 'dresses' && (
                                        <>
                                            <th>Bust</th>
                                            <th>Waist</th>
                                            <th>Hips</th>
                                            <th>Length</th>
                                        </>
                                    )}
                                    {selectedCategory === 'tops' && (
                                        <>
                                            <th>Bust</th>
                                            <th>Waist</th>
                                            <th>Shoulder</th>
                                            <th>Sleeve</th>
                                        </>
                                    )}
                                    {selectedCategory === 'bottoms' && (
                                        <>
                                            <th>Waist</th>
                                            <th>Hips</th>
                                            <th>Inseam</th>
                                            <th>Rise</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {sizeCharts[selectedCategory].map((row, idx) => (
                                    <motion.tr
                                        key={row.size}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <td className="size-cell">{row.size}</td>
                                        {Object.keys(row).filter(k => k !== 'size').map(key => (
                                            <td key={key}>{row[key][selectedUnit]}"</td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* International Size Conversion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="international-sizes"
                >
                    <h2 className="section-title"><Globe size={24} /> International Size Conversion</h2>
                    <div className="conversion-table-container">
                        <table className="conversion-table">
                            <thead>
                                <tr>
                                    <th>US</th>
                                    <th>UK</th>
                                    <th>EU</th>
                                    <th>Japan</th>
                                    <th>India</th>
                                </tr>
                            </thead>
                            <tbody>
                                {internationalSizes.map((row, idx) => (
                                    <motion.tr
                                        key={row.us}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + idx * 0.05 }}
                                    >
                                        <td>{row.us}</td>
                                        <td>{row.uk}</td>
                                        <td>{row.eu}</td>
                                        <td>{row.jp}</td>
                                        <td>{row.in}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="features-grid">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="feature-card"
                    >
                        <div className="feature-icon">
                            <TrendingUp size={28} />
                        </div>
                        <h3>AI-Powered</h3>
                        <p>Advanced algorithms analyze your measurements for perfect fit predictions</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="feature-card"
                    >
                        <div className="feature-icon">
                            <Award size={28} />
                        </div>
                        <h3>Expert Verified</h3>
                        <p>Recommendations backed by fashion stylists and fit specialists</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="feature-card"
                    >
                        <div className="feature-icon">
                            <Users size={28} />
                        </div>
                        <h3>Community Insights</h3>
                        <p>Learn from thousands of verified customer fit reviews</p>
                    </motion.div>
                </div>

                {/* How It Works */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="how-it-works"
                >
                    <h2 className="section-title">How It Works</h2>
                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h4>Enter Measurements</h4>
                            <p>Provide your bust, waist, hip, and height measurements</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h4>AI Analysis</h4>
                            <p>Our system compares your data with our size charts</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h4>Get Recommendation</h4>
                            <p>Receive your perfect size with confidence score</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Size Calculator Modal */}
            <AnimatePresence>
                {showSizeModal && createPortal(
                    <SizeCalculator
                        onClose={() => setShowSizeModal(false)}
                    />,
                    document.body
                )}
            </AnimatePresence>
        </div>
    );
};

export default SizeGuide;
