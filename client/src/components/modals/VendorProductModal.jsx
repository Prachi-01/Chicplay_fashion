import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2, Check, Sliders, Image as ImageIcon, Users, Sparkles, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import ColorVariationEditor from '../admin/ColorVariationEditor';
import SpecificationsEditor from '../admin/SpecificationsEditor';

const MOODS = [
    { id: 'romantic', name: 'Romantic', icon: '💖', style: 'bg-rose-500 text-white' },
    { id: 'powerful', name: 'Powerful', icon: '⚡', style: 'bg-amber-500 text-white' },
    { id: 'creative', name: 'Creative', icon: '🎨', style: 'bg-purple-500 text-white' },
    { id: 'casual', name: 'Casual', icon: '☕', style: 'bg-blue-500 text-white' }
];

const OCCASIONS = [
    { name: 'Beach', icon: '🏝️' },
    { name: 'Wedding Guest', icon: '⛪' },
    { name: 'Work', icon: '💼' },
    { name: 'Date Night', icon: '🕯️' },
    { name: 'Everyday', icon: '👕' }
];

const VendorProductModal = ({ isOpen, onClose, product, onProductSaved }) => {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isImageUploading, setIsImageUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'dresses',
        description: '',
        archetype: 'Romantic Dreamer',
        mood: '',
        occasion: '',
        sizeStock: [
            { size: 'S', quantity: 0 },
            { size: 'M', quantity: 0 },
            { size: 'L', quantity: 0 }
        ],
        isPublished: true,
        colorVariations: [],
        specifications: [],
        vendorDetails: {
            soldBy: '',
            manufacturerName: '',
            manufacturerAddress: ''
        }
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price || '',
                category: product.category || 'dresses',
                description: product.description || '',
                archetype: product.archetype || 'Romantic Dreamer',
                mood: product.mood || '',
                occasion: product.occasion || '',
                sizeStock: product.sizeStock || [
                    { size: 'S', quantity: 0 },
                    { size: 'M', quantity: 0 },
                    { size: 'L', quantity: 0 }
                ],
                isPublished: product.isPublished !== undefined ? product.isPublished : true,
                colorVariations: product.colorVariations || [],
                specifications: product.specifications || [],
                vendorDetails: product.vendorDetails || {
                    soldBy: '',
                    manufacturerName: '',
                    manufacturerAddress: ''
                }
            });
            setPreviewImage(product.images?.[0] || null);
        } else {
            setFormData({
                name: '',
                price: '',
                category: 'dresses',
                description: '',
                archetype: 'Romantic Dreamer',
                mood: '',
                occasion: '',
                sizeStock: [
                    { size: 'S', quantity: 0 },
                    { size: 'M', quantity: 0 },
                    { size: 'L', quantity: 0 }
                ],
                isPublished: true,
                colorVariations: [],
                specifications: [],
                vendorDetails: {
                    soldBy: '',
                    manufacturerName: '',
                    manufacturerAddress: ''
                }
            });
            setPreviewImage(null);
        }
    }, [product, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleStockChange = (size, qty) => {
        setFormData(prev => ({
            ...prev,
            sizeStock: prev.sizeStock.map(s => s.size === size ? { ...s, quantity: parseInt(qty) || 0 } : s)
        }));
    };

    const slugify = (text) => {
        if (!text || typeof text !== 'string') return 'unnamed';
        return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isImageUploading) {
            toast.error("Please wait for all images to finish uploading");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();

            // Meta info for Multer/Cloudinary organization
            data.append('category', formData.category);
            data.append('productSlug', slugify(formData.name));
            data.append('colorSlug', 'main');
            data.append('imageType', 'front');

            Object.keys(formData).forEach(key => {
                if (['sizeStock', 'vendorDetails', 'colorVariations', 'specifications'].includes(key)) {
                    data.append(key, JSON.stringify(formData[key]));
                } else if (key !== 'category') { // Avoid double-appending category
                    data.append(key, formData[key]);
                }
            });

            if (fileInputRef.current?.files[0]) {
                data.append('image', fileInputRef.current.files[0]);
            }

            if (product) {
                await api.put(`/products/${product._id}`, formData);
                toast.success("Product updated! Admin will review changes.");
            } else {
                if (!fileInputRef.current?.files[0] && formData.colorVariations.length === 0) {
                    toast.error("Please upload at least one image");
                    setLoading(false);
                    return;
                }
                await api.post('/products/upload', data);
                toast.success("Listing submitted! Waiting for Admin approval.");
            }

            onProductSaved();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[32px] shadow-2xl p-8"
            >
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            {product ? 'Edit Product' : 'Add New Product'}
                            {!product && <span className="bg-amber-100 text-amber-600 text-[10px] uppercase px-3 py-1 rounded-full font-black tracking-widest">Awaiting Approval</span>}
                        </h2>
                        <p className="text-gray-400 font-medium text-sm mt-1">Fill in the details for your fashion masterpiece.</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-all group">
                        <X size={24} className="text-gray-400 group-hover:text-gray-900" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Media & Primary Info */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-gray-50 rounded-3xl p-6 border-2 border-dashed border-gray-200">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Main Product Image</h3>
                            <div
                                className="aspect-[16/9] bg-white rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-300 transition relative overflow-hidden shadow-inner group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <ImageIcon size={32} />
                                        </div>
                                        <p className="font-bold text-gray-400 text-sm">Drop your main product shot here</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Product Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-gray-900 shadow-sm"
                                    placeholder="e.g. Midnight Silk Dress"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-gray-900 shadow-sm appearance-none"
                                >
                                    <option value="dresses">👗 Dresses</option>
                                    <option value="tops">👚 Tops</option>
                                    <option value="bottoms">👖 Bottoms</option>
                                    <option value="shoes">👠 Shoes</option>
                                    <option value="accessories">👜 Accessories</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-gray-900 shadow-sm h-32 resize-none"
                                placeholder="Tell the story of your creation..."
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <ColorVariationEditor
                                variations={formData.colorVariations}
                                setVariations={(v) => {
                                    setFormData(prev => {
                                        const currentVariations = prev.colorVariations;
                                        const newVariations = typeof v === 'function' ? v(currentVariations) : v;
                                        return { ...prev, colorVariations: newVariations };
                                    });
                                }}
                                onUploadingChange={setIsImageUploading}
                                productName={formData.name}
                                category={formData.category}
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <SpecificationsEditor
                                specifications={formData.specifications}
                                onChange={(specs) => setFormData(p => ({ ...p, specifications: specs }))}
                            />
                        </div>
                    </div>

                    {/* Right Column: Numbers & Metadata */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Sliders size={20} className="text-pink-500" />
                                Inventory & Pricing
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">₹</span>
                                        <input
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full pl-10 pr-5 py-4 bg-white rounded-2xl border-2 border-transparent focus:border-pink-200 outline-none font-black text-xl text-gray-900 shadow-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Stock by Size</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {formData.sizeStock.map((s) => (
                                            <div key={s.size} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.size}</label>
                                                <input
                                                    type="number"
                                                    value={s.quantity}
                                                    onChange={(e) => handleStockChange(s.size, e.target.value)}
                                                    className="w-full bg-transparent font-black text-lg outline-none text-gray-900"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Style Archetype</label>
                                    <select
                                        value={formData.archetype}
                                        onChange={(e) => setFormData({ ...formData, archetype: e.target.value })}
                                        className="w-full px-5 py-4 bg-white rounded-2xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-gray-900 shadow-sm appearance-none"
                                    >
                                        <option>Romantic Dreamer</option>
                                        <option>Boho Free Spirit</option>
                                        <option>Modern Minimalist</option>
                                        <option>Classic Elegance</option>
                                        <option>Edgy Trendsetter</option>
                                    </select>
                                </div>

                                {/* Mood Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                                        <Sparkles size={14} className="text-pink-500" />
                                        Mood
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, mood: '' })}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${!formData.mood
                                                ? 'bg-gray-200 text-gray-700 border-gray-300'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            None
                                        </button>
                                        {MOODS.map(mood => (
                                            <button
                                                key={mood.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, mood: mood.id })}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${formData.mood === mood.id
                                                    ? `${mood.style} border-transparent shadow-lg scale-105`
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span>{mood.icon}</span>
                                                <span>{mood.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Occasion Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                                        <Calendar size={14} className="text-pink-500" />
                                        Occasion
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, occasion: '' })}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${!formData.occasion
                                                ? 'bg-gray-200 text-gray-700 border-gray-300'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            None
                                        </button>
                                        {OCCASIONS.map(occasion => (
                                            <button
                                                key={occasion.name}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, occasion: occasion.name })}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${formData.occasion === occasion.name
                                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg scale-105'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span>{occasion.icon}</span>
                                                <span>{occasion.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Users size={20} className="text-pink-500" />
                                Brand Identity
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sold By</label>
                                    <input
                                        type="text"
                                        value={formData.vendorDetails.soldBy}
                                        onChange={(e) => setFormData({ ...formData, vendorDetails: { ...formData.vendorDetails, soldBy: e.target.value } })}
                                        placeholder="Your Brand Name"
                                        className="w-full px-4 py-3 bg-white rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manufacturer Name</label>
                                    <input
                                        type="text"
                                        value={formData.vendorDetails.manufacturerName}
                                        onChange={(e) => setFormData({ ...formData, vendorDetails: { ...formData.vendorDetails, manufacturerName: e.target.value } })}
                                        placeholder="Factory Name"
                                        className="w-full px-4 py-3 bg-white rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manufacturer Address</label>
                                    <textarea
                                        value={formData.vendorDetails.manufacturerAddress}
                                        onChange={(e) => setFormData({ ...formData, vendorDetails: { ...formData.vendorDetails, manufacturerAddress: e.target.value } })}
                                        placeholder="Factory Location"
                                        className="w-full px-4 py-3 bg-white rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-sm shadow-sm h-24 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-green-50 rounded-[32px] border border-green-100">
                            <div>
                                <p className="font-black text-green-900">Push to Store</p>
                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-1">Visible after approval</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, isPublished: !p.isPublished }))}
                                className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner ${formData.isPublished ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${formData.isPublished ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 rounded-[32px] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${loading
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-black text-white hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                product ? 'Update My Product' : 'Publish My Product'
                            )}
                        </button>
                        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            {product ? 'Changes will be reviewed' : 'Submission requires admin audit'}
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default VendorProductModal;
