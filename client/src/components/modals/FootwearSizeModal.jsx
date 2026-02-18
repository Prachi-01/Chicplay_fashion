import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Ruler } from 'lucide-react';

const FOOTWEAR_SIZES = [
    { euro: 35, us: 4, uk: 2, lengthInches: 9 },
    { euro: 36, us: 5, uk: 3, lengthInches: 9.2 },
    { euro: 37, us: 6, uk: 4, lengthInches: 9.4 },
    { euro: 38, us: 7, uk: 5, lengthInches: 9.7 },
    { euro: 39, us: 8, uk: 6, lengthInches: 9.9 },
    { euro: 40, us: 9, uk: 7, lengthInches: 10.2 },
    { euro: 41, us: 10, uk: 8, lengthInches: 10.4 },
];

const FootwearSizeModal = ({ isOpen, onClose, productName }) => {
    const [region, setRegion] = useState('US'); // 'US' or 'UK'
    const [unit, setUnit] = useState('IN'); // 'IN' or 'CM'

    if (!isOpen) return null;

    const convertLength = (inches) => {
        if (unit === 'CM') {
            return (inches * 2.54).toFixed(1);
        }
        return inches;
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-all rounded-full hover:bg-gray-100"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 text-center px-8">
                        {productName || 'Footwear'}
                    </h2>
                    <p className="text-sm font-bold text-gray-400 text-center mt-1 uppercase tracking-widest">
                        Size Charts
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Unit Toggle */}
                    <div className="flex justify-center items-center gap-4 mb-8">
                        <button
                            onClick={() => setUnit('IN')}
                            className={`text-xs font-black tracking-widest transition-all ${unit === 'IN' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                            INCHES
                        </button>
                        <span className="text-gray-200">|</span>
                        <button
                            onClick={() => setUnit('CM')}
                            className={`text-xs font-black tracking-widest transition-all ${unit === 'CM' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                            CM
                        </button>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="p-4 md:p-6 text-sm font-black text-gray-900 text-center uppercase border-b border-r border-gray-100">
                                        EURO
                                    </th>
                                    <th className="p-4 md:p-6 text-sm font-black text-gray-900 border-b border-r border-gray-100">
                                        <div className="relative group min-w-[80px]">
                                            <select
                                                value={region}
                                                onChange={(e) => setRegion(e.target.value)}
                                                className="bg-transparent outline-none appearance-none pr-6 cursor-pointer w-full text-center"
                                            >
                                                <option value="US">US</option>
                                                <option value="UK">UK</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </th>
                                    <th className="p-4 md:p-6 text-sm font-black text-gray-900 border-b border-gray-100 text-center">
                                        To Fit Foot Length
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {FOOTWEAR_SIZES.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="p-4 md:p-6 font-black text-gray-900 text-center border-b border-r border-gray-100 bg-gray-50/30">
                                            {item.euro}
                                        </td>
                                        <td className="p-4 md:p-6 font-bold text-gray-600 text-center border-b border-r border-gray-100">
                                            {region === 'US' ? item.us : item.uk}
                                        </td>
                                        <td className="p-4 md:p-6 font-bold text-gray-600 text-center border-b border-gray-100">
                                            {convertLength(item.lengthInches)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Tip */}
                    <div className="mt-8 flex items-center gap-3 bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50">
                        <Ruler size={18} className="text-teal-600" />
                        <p className="text-[11px] font-bold text-teal-800 leading-relaxed">
                            <strong>PRO TIP:</strong> For the most accurate fit, measure your foot length from heel to toe and compare with the "To Fit Foot Length" column above.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FootwearSizeModal;
