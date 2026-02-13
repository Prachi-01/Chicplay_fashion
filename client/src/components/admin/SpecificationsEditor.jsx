import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Scissors, Tag, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_ICONS = [
    { emoji: '🧵', label: 'Fabric' },
    { emoji: '👗', label: 'Care' },
    { emoji: '🇮🇹', label: 'Italy' },
    { emoji: '🌿', label: 'Sustainability' },
    { emoji: '🏭', label: 'Factory' },
    { emoji: '🔗', label: 'Closure' },
    { emoji: '✨', label: 'Details' },
    { emoji: '⚖️', label: 'Weight' },
    { emoji: '📅', label: 'Season' },
    { emoji: '🎉', label: 'Occasion' },
    { emoji: '🧼', label: 'Washing' },
    { emoji: '📏', label: 'Length' },
    { emoji: '🧥', label: 'Lining' },
    { emoji: '🎨', label: 'Print/Pattern' },
    { emoji: '👜', label: 'Pockets' }
];

const TEMPLATES = {
    'Dress': [
        { key: 'Fabric', value: '100% Pure Silk', icon: '🧵', order: 1 },
        { key: 'Lining', value: 'Silk Charmeuse', icon: '🧥', order: 2 },
        { key: 'Closure', value: 'Hidden Back Zipper', icon: '🔗', order: 3 },
        { key: 'Care', value: 'Dry Clean Only', icon: '👗', order: 4 },
        { key: 'Length', value: 'Midi (45")', icon: '📏', order: 5 },
        { key: 'Season', value: 'Year-round', icon: '📅', order: 6 }
    ],
    'Summer': [
        { key: 'Fabric', value: '100% Organic Cotton', icon: '🧵', order: 1 },
        { key: 'Weight', value: 'Lightweight (120gsm)', icon: '⚖️', order: 2 },
        { key: 'Care', value: 'Machine Wash Cold', icon: '🧼', order: 3 },
        { key: 'Breathability', value: 'High', icon: '🌿', order: 4 },
        { key: 'Sun Protection', value: 'UPF 50+', icon: '☀️', order: 5 }
    ],
    'Sustainability': [
        { key: 'Material', value: 'Recycled Polyester', icon: '♻️', order: 1 },
        { key: 'Certification', value: 'OEKO-TEX Standard 100', icon: '🌿', order: 2 },
        { key: 'Origin', value: 'Ethically Made in Portugal', icon: '🏭', order: 3 },
        { key: 'Packaging', value: 'Plastic-free', icon: '📦', order: 4 }
    ]
};

const SpecificationsEditor = ({ specifications = [], onChange }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newSpec, setNewSpec] = useState({ key: '', value: '', icon: '✨', order: specifications.length + 1 });

    const applyTemplate = (templateName) => {
        if (window.confirm(`Apply ${templateName} template? This will replace current specifications.`)) {
            onChange(TEMPLATES[templateName]);
        }
    };

    const handleAdd = () => {
        if (!newSpec.key || !newSpec.value) return;
        const updated = [...specifications, { ...newSpec, id: Date.now() }];
        onChange(updated);
        setNewSpec({ key: '', value: '', icon: '✨', order: updated.length + 1 });
        setIsAdding(false);
    };

    const handleUpdate = (index, field, value) => {
        const updated = specifications.map((spec, i) =>
            i === index ? { ...spec, [field]: value } : spec
        );
        onChange(updated);
    };

    const handleRemove = (index) => {
        const updated = specifications.filter((_, i) => i !== index);
        onChange(updated);
    };

    const moveSpec = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === specifications.length - 1) return;

        const updated = [...specifications];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = updated[index];
        updated[index] = updated[newIndex];
        updated[newIndex] = temp;

        // Update order field based on new positions
        const finalized = updated.map((spec, idx) => ({ ...spec, order: idx + 1 }));
        onChange(finalized);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Scissors size={20} className="text-pink-500" />
                        Product Specifications
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Quick Templates:</span>
                        {Object.keys(TEMPLATES).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => applyTemplate(t)}
                                className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md hover:bg-pink-50 hover:text-pink-500 transition uppercase"
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-pink-50 text-pink-500 px-4 py-2 rounded-xl font-bold text-sm hover:bg-pink-100 transition"
                >
                    <Plus size={16} />
                    Add Specification
                </button>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {specifications.map((spec, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-50 p-4 rounded-2xl border-2 border-transparent hover:border-gray-200 transition-all group"
                        >
                            <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm min-w-[80px]">
                                    <select
                                        value={spec.icon}
                                        onChange={(e) => handleUpdate(index, 'icon', e.target.value)}
                                        className="bg-transparent outline-none cursor-pointer text-lg"
                                    >
                                        {COMMON_ICONS.map(i => (
                                            <option key={i.emoji} value={i.emoji}>{i.emoji}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1 min-w-[150px]">
                                    <input
                                        type="text"
                                        placeholder="Label (e.g. Fabric)"
                                        value={spec.key}
                                        onChange={(e) => handleUpdate(index, 'key', e.target.value)}
                                        className="w-full bg-white px-4 py-2 rounded-xl border-none outline-none font-bold text-gray-900 shadow-sm"
                                    />
                                </div>

                                <div className="flex-[2] min-w-[200px]">
                                    <input
                                        type="text"
                                        placeholder="Value (e.g. 100% Pure Silk)"
                                        value={spec.value}
                                        onChange={(e) => handleUpdate(index, 'value', e.target.value)}
                                        className="w-full bg-white px-4 py-2 rounded-xl border-none outline-none font-medium text-gray-700 shadow-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => moveSpec(index, 'up')}
                                        disabled={index === 0}
                                        className="p-2 text-gray-400 hover:text-pink-500 disabled:opacity-20"
                                    >
                                        <ArrowUp size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveSpec(index, 'down')}
                                        disabled={index === specifications.length - 1}
                                        className="p-2 text-gray-400 hover:text-pink-500 disabled:opacity-20"
                                    >
                                        <ArrowDown size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="p-2 text-gray-400 hover:text-rose-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {isAdding && (
                <div className="bg-pink-50 p-6 rounded-2xl border-2 border-pink-200">
                    <h4 className="text-sm font-black text-pink-600 mb-4 uppercase tracking-widest">Add New Specification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-pink-400 block mb-1">ICON</label>
                            <select
                                value={newSpec.icon}
                                onChange={(e) => setNewSpec({ ...newSpec, icon: e.target.value })}
                                className="w-full p-3 bg-white rounded-xl border-none outline-none font-bold shadow-sm"
                            >
                                {COMMON_ICONS.map(i => (
                                    <option key={i.emoji} value={i.emoji}>{i.emoji} {i.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-4">
                            <label className="text-[10px] font-black text-pink-400 block mb-1">LABEL</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. Fabric"
                                value={newSpec.key}
                                onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                                className="w-full p-3 bg-white rounded-xl border-none outline-none font-bold shadow-sm"
                            />
                        </div>
                        <div className="md:col-span-6 flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-[10px] font-black text-pink-400 block mb-1">VALUE</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 100% Pure Silk"
                                    value={newSpec.value}
                                    onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                                    className="w-full p-3 bg-white rounded-xl border-none outline-none font-bold shadow-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAdd}
                                className="p-3 bg-pink-500 text-white rounded-xl shadow-lg hover:bg-pink-600 transition"
                            >
                                <Check size={24} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="p-3 bg-white text-gray-400 rounded-xl shadow-sm hover:text-gray-600 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {specifications.length === 0 && !isAdding && (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-3xl">
                    <Tag className="mx-auto text-gray-200 mb-2" size={32} />
                    <p className="text-gray-400 font-medium">No custom specifications added yet.</p>
                </div>
            )}
        </div>
    );
};

export default SpecificationsEditor;
