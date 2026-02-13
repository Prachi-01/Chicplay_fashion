import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Ruler, Calculator, Users, TrendingUp, Check,
    X, ChevronDown, ChevronUp, Star, Info,
    ArrowRight, Sparkles, Target, Award, User, Settings
} from 'lucide-react';
import './SizeVisualization.css';

// Size chart data
const SIZE_CHART = {
    XS: { bust: [76, 82], waist: [58, 64], hips: [82, 88] },
    S: { bust: [82, 88], waist: [64, 70], hips: [88, 94] },
    M: { bust: [88, 94], waist: [70, 76], hips: [94, 100] },
    L: { bust: [94, 100], waist: [76, 82], hips: [100, 106] },
    XL: { bust: [100, 108], waist: [82, 90], hips: [106, 114] }
};

// Sample fit reviews
const FIT_REVIEWS = [
    { id: 1, user: 'Sarah M.', height: 165, weight: 58, size: 'S', rating: 5, text: 'Perfect fit! True to size.', verified: true },
    { id: 2, user: 'Emily R.', height: 170, weight: 64, size: 'M', rating: 4, text: 'Slightly loose around waist, but length is great.', verified: true },
    { id: 3, user: 'Jessica L.', height: 160, weight: 52, size: 'XS', rating: 5, text: 'Amazing quality and fit perfectly!', verified: true },
    { id: 4, user: 'Michelle K.', height: 175, weight: 70, size: 'L', rating: 4, text: 'Great for tall frames.', verified: false },
    { id: 5, user: 'Amanda P.', height: 163, weight: 60, size: 'M', rating: 5, text: 'Exactly as described.', verified: true }
];

const SizeVisualization = ({ onClose, look, archetype }) => {
    const [measurements, setMeasurements] = useState({
        height: 165,
        bust: 86,
        waist: 71,
        hips: 91,
        weight: 60
    });

    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);

    // ESC key handler
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Calculate recommended size
    const recommendedSize = useMemo(() => {
        const { bust, waist, hips } = measurements;
        for (const [size, ranges] of Object.entries(SIZE_CHART)) {
            const bustMatch = bust >= ranges.bust[0] && bust <= ranges.bust[1];
            const waistMatch = waist >= ranges.waist[0] && waist <= ranges.waist[1];
            const hipsMatch = hips >= ranges.hips[0] && hips <= ranges.hips[1];
            if ([bustMatch, waistMatch, hipsMatch].filter(Boolean).length >= 2) {
                return size;
            }
        }
        return 'M';
    }, [measurements]);

    // Calculate confidence score
    const confidenceScore = useMemo(() => {
        const ranges = SIZE_CHART[recommendedSize];
        if (!ranges) return 85;
        const bustFit = measurements.bust >= ranges.bust[0] && measurements.bust <= ranges.bust[1];
        const waistFit = measurements.waist >= ranges.waist[0] && measurements.waist <= ranges.waist[1];
        const hipsFit = measurements.hips >= ranges.hips[0] && measurements.hips <= ranges.hips[1];
        return 70 + ([bustFit, waistFit, hipsFit].filter(Boolean).length * 10);
    }, [measurements, recommendedSize]);

    // Chart data
    const comparisonData = useMemo(() => {
        return Object.entries(SIZE_CHART).map(([size, ranges]) => ({
            size,
            bust: (ranges.bust[0] + ranges.bust[1]) / 2,
            waist: (ranges.waist[0] + ranges.waist[1]) / 2,
            hips: (ranges.hips[0] + ranges.hips[1]) / 2,
            isRecommended: size === recommendedSize
        }));
    }, [recommendedSize]);

    // Fit data
    const fitData = useMemo(() => {
        const ranges = SIZE_CHART[recommendedSize];
        if (!ranges) return [];
        return [
            { metric: 'Bust', value: measurements.bust, min: ranges.bust[0], max: ranges.bust[1], fits: measurements.bust >= ranges.bust[0] && measurements.bust <= ranges.bust[1] },
            { metric: 'Waist', value: measurements.waist, min: ranges.waist[0], max: ranges.waist[1], fits: measurements.waist >= ranges.waist[0] && measurements.waist <= ranges.waist[1] },
            { metric: 'Hips', value: measurements.hips, min: ranges.hips[0], max: ranges.hips[1], fits: measurements.hips >= ranges.hips[0] && measurements.hips <= ranges.hips[1] }
        ];
    }, [measurements, recommendedSize]);

    // Similar reviews
    const similarReviews = useMemo(() => {
        return FIT_REVIEWS.filter(r => Math.abs(r.height - measurements.height) <= 10 && Math.abs(r.weight - measurements.weight) <= 8);
    }, [measurements]);

    const handleChange = (key, value) => {
        setMeasurements(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="sz-fullframe">
            {/* ========== CLOSE BUTTON ========== */}
            <button onClick={onClose} className="sz-float-close" title="Close (ESC)">
                <X size={24} />
            </button>

            {/* ========== MAIN CONTENT ========== */}
            <div className="sz-main-content">
                {/* ===== CENTER: RECOMMENDATION DISPLAY ===== */}
                <div className="sz-center">
                    {/* Size Recommendation Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="sz-rec-card"
                    >
                        <div className="sz-rec-header">
                            <Sparkles size={28} />
                            <div>
                                <h2>Your Recommended Size</h2>
                                <p>Based on your measurements</p>
                            </div>
                        </div>

                        <div className="sz-rec-size-display">
                            <span className="sz-size-badge">{recommendedSize}</span>
                            <div className="sz-confidence">
                                <div className="sz-conf-bar">
                                    <motion.div
                                        className="sz-conf-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${confidenceScore}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                                <span>{confidenceScore}% confidence</span>
                            </div>
                        </div>

                        {/* Fit Details */}
                        <div className="sz-fit-details">
                            {fitData.map(item => (
                                <div key={item.metric} className="sz-fit-item">
                                    <span className="sz-fit-label">{item.metric}</span>
                                    <span className="sz-fit-value">
                                        {item.value}cm
                                        <span className={`sz-fit-status ${item.fits ? 'good' : 'close'}`}>
                                            {item.fits ? '✓ Perfect' : '~ Close'}
                                        </span>
                                    </span>
                                    <span className="sz-fit-range">Ideal: {item.min}-{item.max}cm</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Chart */}
                    <div className="sz-chart-card">
                        <h3>Size Comparison Chart</h3>
                        <div className="sz-chart">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="size" stroke="rgba(255,255,255,0.6)" />
                                    <YAxis stroke="rgba(255,255,255,0.6)" />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(0,0,0,0.9)',
                                            border: 'none',
                                            borderRadius: '12px'
                                        }}
                                    />
                                    <Bar dataKey="bust" fill="#ec4899" name="Bust" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="waist" fill="#8b5cf6" name="Waist" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="hips" fill="#06b6d4" name="Hips" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="sz-legend">
                            <span><span className="dot bust"></span> Bust</span>
                            <span><span className="dot waist"></span> Waist</span>
                            <span><span className="dot hips"></span> Hips</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="sz-actions">
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="sz-primary-btn">
                            <Award size={20} /> Confirm Size {recommendedSize}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="sz-secondary-btn">
                            View Full Size Chart <ArrowRight size={18} />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* ========== LEFT PANEL: MEASUREMENTS ========== */}
            <AnimatePresence>
                {showLeftPanel && (
                    <motion.div
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -200, opacity: 0 }}
                        className="sz-float-left"
                    >
                        <div className="sz-panel-head">
                            <h3><Calculator size={16} /> Your Measurements</h3>
                        </div>
                        <div className="sz-sliders">
                            {[
                                { key: 'height', label: 'Height', min: 140, max: 190, unit: 'cm', icon: '📏' },
                                { key: 'bust', label: 'Bust', min: 70, max: 120, unit: 'cm', icon: '👚' },
                                { key: 'waist', label: 'Waist', min: 55, max: 100, unit: 'cm', icon: '📍' },
                                { key: 'hips', label: 'Hips', min: 75, max: 125, unit: 'cm', icon: '🦋' },
                                { key: 'weight', label: 'Weight', min: 40, max: 100, unit: 'kg', icon: '⚖️' }
                            ].map(item => (
                                <div key={item.key} className="sz-slider-group">
                                    <div className="sz-slider-header">
                                        <span className="sz-slider-icon">{item.icon}</span>
                                        <span className="sz-slider-label">{item.label}</span>
                                        <span className="sz-slider-value">{measurements[item.key]}{item.unit}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={item.min}
                                        max={item.max}
                                        value={measurements[item.key]}
                                        onChange={e => handleChange(item.key, Number(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Quick Size Selector */}
                        <div className="sz-quick-sizes">
                            <h4>Quick Select</h4>
                            <div className="sz-size-btns">
                                {Object.keys(SIZE_CHART).map(size => (
                                    <button
                                        key={size}
                                        className={`sz-size-btn ${size === recommendedSize ? 'rec' : ''}`}
                                    >
                                        {size}
                                        {size === recommendedSize && <Star size={10} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== RIGHT PANEL: REVIEWS ========== */}
            <AnimatePresence>
                {showRightPanel && (
                    <motion.div
                        initial={{ x: 200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 200, opacity: 0 }}
                        className="sz-float-right"
                    >
                        <div className="sz-panel-head">
                            <h3><Users size={16} /> Similar Users</h3>
                        </div>
                        <div className="sz-reviews">
                            {(similarReviews.length > 0 ? similarReviews : FIT_REVIEWS.slice(0, 3)).map(review => (
                                <div key={review.id} className="sz-review">
                                    <div className="sz-review-top">
                                        <span className="sz-reviewer">{review.user}</span>
                                        {review.verified && <span className="sz-verified"><Check size={10} /></span>}
                                    </div>
                                    <div className="sz-review-stats">
                                        <span>{review.height}cm</span>
                                        <span>•</span>
                                        <span>{review.weight}kg</span>
                                        <span>•</span>
                                        <span className="sz-rev-size">{review.size}</span>
                                    </div>
                                    <p className="sz-review-text">"{review.text}"</p>
                                    <div className="sz-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} className={i < review.rating ? 'filled' : ''} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tips */}
                        <div className="sz-tips">
                            <h4><TrendingUp size={14} /> Pro Tips</h4>
                            <ul>
                                <li>If between sizes, size up</li>
                                <li>Check fabric stretch info</li>
                                <li>Review length for your height</li>
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== PANEL TOGGLES ========== */}
            <div className="sz-toggles">
                <button onClick={() => setShowLeftPanel(!showLeftPanel)} className={showLeftPanel ? 'active' : ''}>
                    <Calculator size={20} />
                </button>
                <button onClick={() => setShowRightPanel(!showRightPanel)} className={showRightPanel ? 'active' : ''}>
                    <Users size={20} />
                </button>
            </div>
        </div>
    );
};

export default SizeVisualization;
