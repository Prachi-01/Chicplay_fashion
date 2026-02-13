import React, { useState } from 'react';
import { Plus, X, Trash2, Image as ImageIcon, Check, Copy, Upload, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import ColorAutocomplete from './ColorAutocomplete';

const ColorVariationEditor = ({ variations, setVariations, onUploadingChange, productName, category }) => {
    const [expandedIndex, setExpandedIndex] = useState(0);
    const [uploading, setUploading] = useState({}); // { 'idx-type': true }

    // Helper to create slugs
    const slugify = (text) => {
        if (!text || typeof text !== 'string') return 'unnamed';
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')  // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -
    };

    // Notify parent if any images are currently uploading to prevent premature saving
    useEffect(() => {
        const isCurrentlyUploading = Object.values(uploading).some(val => val === true);
        if (onUploadingChange) onUploadingChange(isCurrentlyUploading);
    }, [uploading, onUploadingChange]);

    const addVariation = () => {
        const newVariation = {
            colorName: 'New Color',
            hexCode: '#000000',
            images: {
                front: '',
                back: '',
                side: '',
                fabric: '',
                lifestyle: ''
            },
            sizeStock: [
                { size: 'XS', quantity: 0 },
                { size: 'S', quantity: 0 },
                { size: 'M', quantity: 0 },
                { size: 'L', quantity: 0 },
                { size: 'XL', quantity: 0 }
            ],
            available: true
        };
        setVariations([...variations, newVariation]);
        setExpandedIndex(variations.length);
    };

    const removeVariation = (index) => {
        const newVariations = variations.filter((_, i) => i !== index);
        setVariations(newVariations);
        if (expandedIndex >= newVariations.length) {
            setExpandedIndex(Math.max(0, newVariations.length - 1));
        }
    };

    const updateVariation = (index, field, value) => {
        const newVariations = [...variations];
        newVariations[index] = { ...newVariations[index], [field]: value };
        setVariations(newVariations);
    };

    const updateImage = (index, type, url) => {
        setVariations(prevVariations => {
            const newVariations = JSON.parse(JSON.stringify(prevVariations)); // Deep clone to be safe
            if (newVariations[index]) {
                newVariations[index].images = { ...newVariations[index].images, [type]: url };
            }
            return newVariations;
        });
    };

    const handleFileUpload = async (index, type, file) => {
        if (!file) return;

        const uploadKey = `${index}-${type}`;
        setUploading(prev => ({ ...prev, [uploadKey]: true }));

        const formData = new FormData();

        // IMPORTANT: Add organization metadata BEFORE the file for Multer/Cloudinary to see them
        formData.append('category', category || 'dresses');
        formData.append('productSlug', slugify(productName || 'new-product'));
        formData.append('colorSlug', slugify(variations[index]?.colorName || 'default-color'));
        formData.append('imageType', type); // front, back, etc.
        formData.append('image', file);

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("⚠️ Not logged in! Please login as admin first.");
            setUploading(prev => ({ ...prev, [uploadKey]: false }));
            return;
        }

        console.log('🔑 Auth token found:', token.substring(0, 20) + '...');

        try {
            console.log(`📤 Starting image upload: type=${type}, color=${variations[index]?.colorName}`);
            const response = await api.post('/products/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('📥 Upload response received:', response.data);

            if (response.data?.url) {
                updateImage(index, type, response.data.url);
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`);
            } else {
                console.error('❌ Upload success but no URL in response:', response.data);
                throw new Error("No URL returned from server");
            }
        } catch (error) {
            console.error('❌ Upload error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 401) {
                toast.error('🔒 Session expired or not admin. Please login again.');
            } else {
                toast.error(`Upload error: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setUploading(prev => ({ ...prev, [uploadKey]: false }));
        }
    };

    const updateStock = (variationIndex, size, quantity) => {
        const newVariations = [...variations];
        const newSizeStock = [...newVariations[variationIndex].sizeStock];
        const sizeIndex = newSizeStock.findIndex(s => s.size === size);
        if (sizeIndex > -1) {
            newSizeStock[sizeIndex] = { ...newSizeStock[sizeIndex], quantity: parseInt(quantity) || 0 };
        } else {
            newSizeStock.push({ size, quantity: parseInt(quantity) || 0 });
        }
        newVariations[variationIndex].sizeStock = newSizeStock;
        setVariations(newVariations);
    };

    const copyStockToAll = (fromIndex) => {
        const sourceStock = variations[fromIndex].sizeStock;
        const newVariations = variations.map((v, i) => {
            if (i === fromIndex) return v;
            return { ...v, sizeStock: JSON.parse(JSON.stringify(sourceStock)) };
        });
        setVariations(newVariations);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-pink-100 text-pink-500 rounded-lg flex items-center justify-center">🎨</div>
                    Color Variations
                </h3>
                <button
                    type="button"
                    onClick={addVariation}
                    className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
                >
                    <Plus size={18} /> Add Color
                </button>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {variations.map((variation, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`border-2 rounded-3xl overflow-hidden transition-all ${expandedIndex === idx ? 'border-pink-300 bg-white shadow-xl' : 'border-gray-100 bg-gray-50'}`}
                        >
                            {/* Header */}
                            <div
                                className="p-5 flex items-center justify-between cursor-pointer"
                                onClick={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                                        style={{ backgroundColor: variation.hexCode }}
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900">{variation.colorName || 'Unnamed Color'}</h4>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{variation.hexCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeVariation(idx); }}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className={`transform transition-transform ${expandedIndex === idx ? 'rotate-180' : ''}`}>
                                        <Plus size={18} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <AnimatePresence>
                                {expandedIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden border-t border-gray-100"
                                    >
                                        <div className="p-6 space-y-6">
                                            {/* Color Selection with Autocomplete */}
                                            <ColorAutocomplete
                                                value={variation.hexCode}
                                                onChange={(hexCode) => {
                                                    updateVariation(idx, 'hexCode', hexCode);
                                                }}
                                                onSelect={(color) => {
                                                    // Auto-fill both name and hex when selecting from database
                                                    updateVariation(idx, 'colorName', color.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
                                                    updateVariation(idx, 'hexCode', color.hexCode);
                                                }}
                                                placeholder="Type color name (e.g., burgundy, navy, blush)"
                                            />

                                            {/* Images Section */}
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-4">📸 Images (Cloudinary or Direct URLs)</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                                    {['front', 'back', 'side', 'fabric', 'lifestyle'].map(type => {
                                                        const uploadKey = `${idx}-${type}`;
                                                        const isUploading = uploading[uploadKey];

                                                        return (
                                                            <div key={type} className="space-y-2">
                                                                <div className="aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 group relative">
                                                                    {isUploading ? (
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                                                                            <span className="text-[10px] font-black text-pink-500 uppercase">Uploading...</span>
                                                                        </div>
                                                                    ) : variation.images[type] ? (
                                                                        <>
                                                                            <img src={variation.images[type]} alt={type} className="w-full h-full object-cover" />
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => updateImage(idx, type, '')}
                                                                                    className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <label
                                                                            htmlFor={`upload-${idx}-${type}`}
                                                                            className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-gray-100 transition-all group relative active:scale-95"
                                                                        >
                                                                            <input
                                                                                id={`upload-${idx}-${type}`}
                                                                                type="file"
                                                                                className="hidden"
                                                                                accept="image/*"
                                                                                onChange={(e) => {
                                                                                    handleFileUpload(idx, type, e.target.files[0]);
                                                                                    e.target.value = ''; // Reset to allow same file re-upload
                                                                                }}
                                                                            />
                                                                            <div className="flex flex-col items-center justify-center pointer-events-none">
                                                                                <Upload size={24} className="text-pink-300 group-hover:text-pink-500 transition-colors mb-2" />
                                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{type}</span>
                                                                            </div>
                                                                        </label>
                                                                    )}
                                                                </div>
                                                                <div className="relative group">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Or paste URL"
                                                                        value={variation.images[type]}
                                                                        onChange={(e) => updateImage(idx, type, e.target.value)}
                                                                        className="w-full px-2 py-1.5 text-[10px] bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-pink-300 font-medium truncate pr-6"
                                                                    />
                                                                    {variation.images[type] && (
                                                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-emerald-500">
                                                                            <Check size={10} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Stock Section */}
                                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📦 Stock Management</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyStockToAll(idx)}
                                                        className="text-[10px] font-black text-pink-500 hover:text-pink-600 flex items-center gap-1 uppercase"
                                                    >
                                                        <Copy size={12} /> Copy to all colors
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-5 gap-3">
                                                    {variation.sizeStock.map(s => (
                                                        <div key={s.size} className="text-center">
                                                            <span className="text-[10px] font-black text-gray-400 block mb-1">{s.size}</span>
                                                            <input
                                                                type="number"
                                                                value={s.quantity}
                                                                onChange={(e) => updateStock(idx, s.size, e.target.value)}
                                                                className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-center font-bold text-sm focus:border-pink-300 outline-none"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {variations.length === 0 && (
                    <div className="py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Plus size={24} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-bold">No color variations added yet.</p>
                        <button
                            type="button"
                            onClick={addVariation}
                            className="mt-4 text-pink-500 font-black text-sm uppercase hover:underline"
                        >
                            Add your first color
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColorVariationEditor;
