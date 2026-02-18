import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Sparkles, Award } from 'lucide-react';
import './SizeCalculator.css';

const SizeCalculator = ({ onClose }) => {
    const [measurements, setMeasurements] = useState({
        bust: '',
        waist: '',
        hips: '',
        height: ''
    });
    const [unit, setUnit] = useState('in'); // 'in' or 'cm'
    const [country, setCountry] = useState('US');
    const [result, setResult] = useState(null);

    // Size chart data (in inches)
    const sizeChartInches = {
        XS: { bust: 32, waist: 25, hips: 35 },
        S: { bust: 34, waist: 27, hips: 37 },
        M: { bust: 36, waist: 29, hips: 39 },
        L: { bust: 38, waist: 31, hips: 41 },
        XL: { bust: 40, waist: 33, hips: 43 }
    };

    // International size conversions
    const sizeConversions = {
        US: { XS: 'XS', S: 'S', M: 'M', L: 'L', XL: 'XL' },
        UK: { XS: '6', S: '8', M: '10', L: '12', XL: '14' },
        EU: { XS: '34', S: '36', M: '38', L: '40', XL: '42' },
        Japan: { XS: '7', S: '9', M: '11', L: '13', XL: '15' },
        India: { XS: '28', S: '30', M: '32', L: '34', XL: '36' }
    };

    const handleInputChange = (field, value) => {
        setMeasurements(prev => ({ ...prev, [field]: value }));
    };

    const convertToInches = (value) => {
        if (unit === 'cm') {
            return value / 2.54;
        }
        return value;
    };

    const calculateSize = () => {
        const bust = convertToInches(parseFloat(measurements.bust));
        const waist = convertToInches(parseFloat(measurements.waist));
        const hips = convertToInches(parseFloat(measurements.hips));

        if (!bust || !waist || !hips) {
            alert('Please enter all measurements');
            return;
        }

        let bestSize = null;
        let minDifference = Infinity;
        let scores = {};

        // Calculate difference for each size
        Object.keys(sizeChartInches).forEach(size => {
            const chart = sizeChartInches[size];
            const bustDiff = Math.abs(bust - chart.bust);
            const waistDiff = Math.abs(waist - chart.waist);
            const hipsDiff = Math.abs(hips - chart.hips);

            const totalDiff = bustDiff + waistDiff + hipsDiff;
            scores[size] = {
                difference: totalDiff,
                bustFit: bustDiff < 2,
                waistFit: waistDiff < 2,
                hipsFit: hipsDiff < 2
            };

            if (totalDiff < minDifference) {
                minDifference = totalDiff;
                bestSize = size;
            }
        });

        // Calculate confidence score
        const maxDiff = 15; // Maximum expected difference
        const confidence = Math.max(0, Math.min(100, 100 - (minDifference / maxDiff) * 100));

        // Get size in selected country format
        const sizeInCountry = sizeConversions[country][bestSize];

        setResult({
            size: bestSize,
            sizeInCountry,
            confidence: Math.round(confidence),
            scores: scores[bestSize],
            country
        });
    };

    return (
        <div className="size-calculator-overlay">
            <motion.div
                className="size-calculator-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <button onClick={onClose} className="calc-close-btn">
                    <X size={24} />
                </button>

                <div className="calc-header">
                    <div className="calc-icon">
                        <Ruler size={32} />
                    </div>
                    <h2>Size Calculator</h2>
                    <p>Enter your measurements to find your perfect size</p>
                </div>

                <div className="calc-content">
                    {/* Unit Toggle */}
                    <div className="calc-unit-toggle">
                        <button
                            className={unit === 'in' ? 'active' : ''}
                            onClick={() => setUnit('in')}
                        >
                            Inches
                        </button>
                        <button
                            className={unit === 'cm' ? 'active' : ''}
                            onClick={() => setUnit('cm')}
                        >
                            Centimeters
                        </button>
                    </div>

                    {/* Country Selection */}
                    <div className="calc-field">
                        <label>Size System</label>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="calc-select"
                        >
                            <option value="US">United States (US)</option>
                            <option value="UK">United Kingdom (UK)</option>
                            <option value="EU">European Union (EU)</option>
                            <option value="Japan">Japan</option>
                            <option value="India">India</option>
                        </select>
                    </div>

                    {/* Measurement Inputs */}
                    <div className="calc-measurements">
                        <div className="calc-field">
                            <label>Bust ({unit})</label>
                            <input
                                type="number"
                                value={measurements.bust}
                                onChange={(e) => handleInputChange('bust', e.target.value)}
                                placeholder={unit === 'in' ? '34' : '86'}
                            />
                        </div>

                        <div className="calc-field">
                            <label>Waist ({unit})</label>
                            <input
                                type="number"
                                value={measurements.waist}
                                onChange={(e) => handleInputChange('waist', e.target.value)}
                                placeholder={unit === 'in' ? '27' : '68'}
                            />
                        </div>

                        <div className="calc-field">
                            <label>Hips ({unit})</label>
                            <input
                                type="number"
                                value={measurements.hips}
                                onChange={(e) => handleInputChange('hips', e.target.value)}
                                placeholder={unit === 'in' ? '37' : '94'}
                            />
                        </div>

                        <div className="calc-field">
                            <label>Height ({unit})</label>
                            <input
                                type="number"
                                value={measurements.height}
                                onChange={(e) => handleInputChange('height', e.target.value)}
                                placeholder={unit === 'in' ? '65' : '165'}
                            />
                        </div>
                    </div>

                    <button onClick={calculateSize} className="calc-submit-btn">
                        <Sparkles size={20} />
                        Calculate My Size
                    </button>

                    {/* Result Display */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                className="calc-result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="result-header">
                                    <Award size={32} />
                                    <h3>Your Recommended Size</h3>
                                </div>

                                <div className="result-size">
                                    <div className="size-badge">
                                        <span className="size-label">{result.country} Size</span>
                                        <span className="size-value">{result.sizeInCountry}</span>
                                        <span className="size-us">(US {result.size})</span>
                                    </div>
                                </div>

                                <div className="result-confidence">
                                    <div className="confidence-bar">
                                        <motion.div
                                            className="confidence-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.confidence}%` }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                        />
                                    </div>
                                    <span>{result.confidence}% Confidence Match</span>
                                </div>

                                <div className="result-details">
                                    <div className={`fit-item ${result.scores.bustFit ? 'good' : 'close'}`}>
                                        <span>Bust Fit</span>
                                        <span>{result.scores.bustFit ? '✓ Perfect' : '~ Close'}</span>
                                    </div>
                                    <div className={`fit-item ${result.scores.waistFit ? 'good' : 'close'}`}>
                                        <span>Waist Fit</span>
                                        <span>{result.scores.waistFit ? '✓ Perfect' : '~ Close'}</span>
                                    </div>
                                    <div className={`fit-item ${result.scores.hipsFit ? 'good' : 'close'}`}>
                                        <span>Hips Fit</span>
                                        <span>{result.scores.hipsFit ? '✓ Perfect' : '~ Close'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default SizeCalculator;
