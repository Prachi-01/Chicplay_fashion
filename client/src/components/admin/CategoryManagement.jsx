import React, { useState, useEffect } from 'react';
import {
    Layout, PieChart, TrendingUp, Sparkles,
    MoreVertical, Edit2, Eye, Trash2, Plus,
    ChevronRight, ChevronDown, Save, X,
    Settings, Zap, BarChart2, Users, Search,
    Filter, Calendar, Package, ArrowRight,
    Target, Share2, Box, Info, AlertCircle, Check,
    Activity, Bell, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import AnalyticsDashboard from './AnalyticsDashboard';

// HELPERS (Defined before main component to avoid TDZ issues)

const SummaryCard = ({ title, value, icon, trend }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all duration-300">
        <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-3xl font-black text-gray-900">{value}</h4>
            <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] font-bold text-green-500">{trend}</span>
            </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
        </div>
    </div>
);

const ArchetypeGrid = ({ archetypes, onEdit, onAdd }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archetypes.map(archetype => (
            <div key={archetype._id || archetype.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all group relative flex flex-col">
                {/* Banner Preview or Fallback */}
                <div className="h-32 bg-gray-100 relative overflow-hidden">
                    {archetype.bannerImage || archetype.heroImage ? (
                        <img
                            src={archetype.bannerImage || archetype.heroImage}
                            alt={archetype.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 italic text-gray-300 text-xs font-bold">
                            No Banner Set
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-6 relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4 -mt-12 relative">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-4 border-white" style={{ backgroundColor: `${archetype.primaryColor}` }}>
                            {archetype.emoji}
                        </div>
                        <div className="flex gap-2 pt-12">
                            <button onClick={() => onEdit(archetype)} className="p-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-xl shadow-sm border transition text-gray-400 hover:text-gray-900"><Edit2 size={18} /></button>
                        </div>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">{archetype.name}</h3>
                    <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">{archetype.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Products</p>
                            <p className="font-black text-gray-900">{archetype.metrics?.totalProducts || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Conversions</p>
                            <p className="font-black text-green-600">{archetype.metrics?.conversionRate || 0}%</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4 border-t border-dashed">
                        <span className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${archetype.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            {archetype.status}
                        </span>
                        <span className="text-gray-300">{archetype.id}</span>
                    </div>
                </div>
            </div>
        ))}
        <button
            onClick={onAdd}
            className="bg-gray-50 rounded-[32px] p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-all hover:bg-pink-50/30 group"
        >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Plus size={32} />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">Add Archetype</span>
        </button>
    </div>
);

const TreeItem = ({ item, allCategories, onEdit, onAdd, depth }) => {
    const [isOpen, setIsOpen] = useState(true);
    const children = (allCategories || []).filter(c => c.parent?._id === item._id || c.parent === item._id);

    return (
        <div className="space-y-2">
            <div className={`group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100`} style={{ marginLeft: `${depth * 32}px` }}>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsOpen(!isOpen)} className={`p-1 transition-transform ${isOpen ? 'rotate-90' : ''} ${children.length === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
                        <ChevronRight size={16} />
                    </button>
                    <span className="text-lg">{item.visuals?.emoji || '📁'}</span>
                    <div>
                        <span className="font-black text-gray-900">{item.name}</span>
                        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase mt-0.5">
                            <span>{item.performance?.views || 0} Views</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span>{item.status}</span>
                        </div>
                    </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => onEdit(item)} className="p-2 bg-white rounded-xl shadow-sm border hover:border-blue-200 text-blue-500 transition"><Edit2 size={16} /></button>
                    <button onClick={() => onAdd(item)} className="p-2 bg-white rounded-xl shadow-sm border hover:border-pink-200 text-pink-500 transition"><Plus size={16} /></button>
                </div>
            </div>
            {isOpen && children.length > 0 && (
                <div className="space-y-2">
                    {children.map(child => (
                        <TreeItem key={child._id} item={child} allCategories={allCategories} onEdit={onEdit} onAdd={onAdd} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoryTree = ({ categories, onEdit, onAdd }) => (
    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-gray-900">Taxonomy Tree</h3>
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition">Expand All</button>
                <button onClick={() => onAdd(null)} className="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition">+ Root</button>
            </div>
        </div>

        <div className="space-y-4">
            {categories.filter(c => !c.parent).map(root => (
                <TreeItem key={root._id} item={root} allCategories={categories} onEdit={onEdit} onAdd={onAdd} depth={0} />
            ))}
        </div>
    </div>
);



const AutomationTool = () => (
    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                <Zap size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-gray-900">AI Automation Rules</h3>
                <p className="text-sm text-gray-400 font-medium">Auto-categorize products using smart logic</p>
            </div>
        </div>

        <div className="space-y-4">
            {[1, 2].map(i => (
                <div key={i} className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${i === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {i === 1 ? <Check size={20} /> : 'ii'}
                        </div>
                        <div>
                            <p className="font-black text-gray-900">Rule #{i}: Seasonal Tagging</p>
                            <p className="text-xs text-gray-400 font-bold uppercase mt-1">If tags contain "Lace" → Assign "Romantic"</p>
                        </div>
                    </div>
                    <button className="px-6 py-2 bg-white rounded-xl shadow-sm border text-xs font-black uppercase tracking-widest hover:border-gray-900 transition">Test Rule</button>
                </div>
            ))}
        </div>
    </div>
);

const EditModal = ({ item, onClose, onSave }) => {
    if (!item) return null;
    const isArchetype = item._type === 'archetype';
    const [formData, setFormData] = useState({
        ...item,
        content: item.content || { metaTitle: '', metaDescription: '' },
        automation: item.automation || { rules: { containsTags: [] } }
    });

    const handleSubmit = async () => {
        try {
            if (formData.isNew) {
                const url = isArchetype ? '/api/categories/archetypes' : '/api/categories';
                await axios.post(url, formData);
                toast.success(`${isArchetype ? 'Archetype' : 'Category'} created successfully!`);
            } else {
                const url = isArchetype ? `/api/categories/archetypes/${item.id}` : `/api/categories/${item._id}`;
                await axios.put(url, formData);
                toast.success("Changes saved successfully!");
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save changes");
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-4xl rounded-[50px] shadow-3xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-10 border-b flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-3xl shadow-sm flex items-center justify-center text-3xl">{formData.emoji || formData.visuals?.emoji}</div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Edit {isArchetype ? 'Archetype' : 'Category'}</h2>
                            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">{formData.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900 transition"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-10">
                            <section className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Info size={16} className="text-pink-500" /> Basic Information
                                </h3>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Display Name</label>
                                    <input
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-lg transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Emoji/Icon</label>
                                        <input
                                            value={formData.emoji || formData.visuals?.emoji || ''}
                                            onChange={e => {
                                                if (isArchetype) setFormData({ ...formData, emoji: e.target.value });
                                                else setFormData({ ...formData, visuals: { ...formData.visuals, emoji: e.target.value } });
                                            }}
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 text-center text-3xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Status</label>
                                        <select
                                            value={formData.status || 'Active'}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="Active">✅ Active</option>
                                            <option value="Paused">⏸️ Paused</option>
                                            <option value="Archived">🗑️ Archived</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Sparkles size={16} className="text-yellow-500" /> Hero Section (Banners)
                                </h3>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Hero Tagline</label>
                                    <input
                                        value={formData.tagline || ''}
                                        onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                                        placeholder="Whimsical & Feminine..."
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-bold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Hero Banner Image (Cloudinary or Unsplash URL)</label>
                                    <div className="space-y-4">
                                        <input
                                            value={formData.heroImage || ''}
                                            onChange={e => setFormData({ ...formData, heroImage: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-medium transition-all"
                                        />
                                        {formData.heroImage && (
                                            <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border-2 border-white relative group">
                                                <img src={formData.heroImage} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white font-black uppercase text-xs tracking-widest">Live Banner Preview</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Banner Image (Direct Upload to Cloudinary)</label>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    // Show loading toast
                                                    const uploadToast = toast.loading('Uploading banner to Cloudinary...');

                                                    try {
                                                        // Convert to base64
                                                        const reader = new FileReader();
                                                        reader.onloadend = async () => {
                                                            try {
                                                                const base64Data = reader.result;

                                                                // Upload to backend
                                                                const response = await axios.post(
                                                                    `/api/categories/archetypes/${formData.id}/banner`,
                                                                    { imageData: base64Data }
                                                                );

                                                                // Update form data with the Cloudinary URL
                                                                setFormData({
                                                                    ...formData,
                                                                    bannerImage: response.data.bannerUrl
                                                                });

                                                                toast.success('Banner uploaded successfully!', { id: uploadToast });
                                                            } catch (err) {
                                                                console.error('Upload error:', err);
                                                                toast.error('Failed to upload banner', { id: uploadToast });
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    } catch (err) {
                                                        console.error('File read error:', err);
                                                        toast.error('Failed to read file', { id: uploadToast });
                                                    }
                                                }}
                                                className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-pink-300 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 transition-all"
                                            />
                                        </div>
                                        {formData.bannerImage && (
                                            <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border-2 border-white relative group">
                                                <img src={formData.bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white font-black uppercase text-xs tracking-widest">Banner Preview</span>
                                                </div>
                                                <button
                                                    onClick={() => setFormData({ ...formData, bannerImage: '' })}
                                                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-all"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Theme Color</label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="color"
                                            value={formData.primaryColor || '#000000'}
                                            onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="w-16 h-16 rounded-2xl cursor-pointer border-2 border-white shadow-md p-1 bg-white"
                                        />
                                        <div className="flex-1">
                                            <input
                                                value={formData.primaryColor || '#000000'}
                                                onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Share2 size={16} className="text-blue-500" /> SEO & Content
                                </h3>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Meta Title</label>
                                    <input
                                        value={formData.content?.metaTitle || ''}
                                        onChange={e => setFormData({ ...formData, content: { ...formData.content, metaTitle: e.target.value } })}
                                        placeholder="SEO optimized title..."
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Meta Description</label>
                                    <textarea
                                        value={formData.content?.metaDescription || ''}
                                        onChange={e => setFormData({ ...formData, content: { ...formData.content, metaDescription: e.target.value } })}
                                        rows={3}
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-gray-600 leading-relaxed resize-none"
                                    />
                                </div>
                            </section>
                        </div>

                        <div className="space-y-10">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] p-8 text-white">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Sparkles className="text-pink-400" /> AI DNA Insights</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recommendation Weights</label>
                                        <div className="space-y-4 mt-4">
                                            {Object.entries(formData.recommendationWeights || { colorMatch: 40, silhouetteMatch: 30, fabricPreference: 20, priceSensitivity: 10 }).map(([key, val]) => (
                                                <div key={key}>
                                                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase text-gray-400">
                                                        <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                                                        <span className="text-white">{val}%</span>
                                                    </div>
                                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-pink-500" style={{ width: `${val}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Automation Rules</label>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {(formData.automation?.rules?.containsTags || ['floral', 'lace', 'pink']).map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold border border-white/5">#{tag}</span>
                                            ))}
                                            <button className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg text-xs font-bold border border-pink-500/30">+ Add</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-pink-50 rounded-[32px] p-8 border border-pink-100">
                                <h3 className="text-xl font-black text-pink-900 mb-6 flex items-center gap-3"><BarChart2 className="text-pink-500" /> Business Performance</h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                                        <p className="text-[10px] font-black text-pink-400 uppercase tracking-tighter mb-1">Conversion</p>
                                        <p className="text-3xl font-black text-pink-600">{formData.metrics?.conversionRate || 0.0}%</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                                        <p className="text-[10px] font-black text-pink-400 uppercase tracking-tighter mb-1">Avg Sale</p>
                                        <p className="text-3xl font-black text-pink-600">Rs {formData.metrics?.aov || 0}</p>
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-4 bg-pink-100 text-pink-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-pink-200 transition">View Detailed Analytics</button>
                            </div>
                        </div>
                    </div >
                </div >

                <div className="p-10 border-t bg-white flex justify-end gap-4">
                    <button onClick={onClose} className="px-10 py-5 bg-gray-100 rounded-3xl font-black text-sm uppercase tracking-widest text-gray-400 hover:bg-gray-200 transition-all">Cancel</button>
                    <button onClick={handleSubmit} className="px-12 py-5 bg-gray-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-gray-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                        <Save size={20} />
                        Save Configuration
                    </button>
                </div>
            </motion.div >
        </div >
    );
};

// MAIN COMPONENT

const CategoryManagement = () => {
    const [activeSection, setActiveSection] = useState('archetypes');
    const [archetypes, setArchetypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null); // For editing
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [archRes, catRes] = await Promise.all([
                axios.get('/api/categories/archetypes'),
                axios.get('/api/categories')
            ]);
            setArchetypes(Array.isArray(archRes.data) ? archRes.data : []);
            setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        } catch (err) {
            console.error("Failed to fetch categories data", err);
            toast.error("Failed to load management data");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item, type) => {
        setSelectedItem({ ...item, _type: type });
        setIsEditModalOpen(true);
    };

    const handleAddArchetype = () => {
        const newArchetype = {
            id: `new-archetype-${Date.now()}`,
            name: 'New Archetype',
            description: 'Enter description here...',
            emoji: '✨',
            primaryColor: '#F472B6',
            status: 'Active',
            metrics: { totalProducts: 0, conversionRate: 0, matchRate: 0 },
            content: { metaTitle: '', metaDescription: '' },
            automation: { rules: { containsTags: [] } },
            _type: 'archetype',
            isNew: true
        };
        setSelectedItem(newArchetype);
        setIsEditModalOpen(true);
    };

    const handleAddCategory = (parent = null) => {
        const newCategory = {
            name: 'New Category',
            slug: `new-category-${Date.now()}`,
            parent: parent ? parent._id : null,
            level: parent ? (parent.level || 1) + 1 : 1,
            status: 'Active',
            visuals: { emoji: '📁' },
            content: { metaTitle: '', metaDescription: '' },
            _type: 'category',
            isNew: true
        };
        setSelectedItem(newCategory);
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Syncing Taxonomy...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. DASHBOARD OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Categories"
                    value={categories.length + archetypes.length}
                    icon={<Layout className="text-blue-500" />}
                    trend="+5 new"
                />
                <SummaryCard
                    title="Active Styles"
                    value={archetypes.filter(a => a.status === 'Active').length}
                    icon={<Sparkles className="text-pink-500" />}
                    trend="92% Coverage"
                />
                <SummaryCard
                    title="Avg Products/Cat"
                    value="142"
                    icon={<Box className="text-orange-500" />}
                    trend="Steady"
                />
                <SummaryCard
                    title="Health Score"
                    value="92/100"
                    icon={<TrendingUp className="text-green-500" />}
                    trend="+2.4%"
                />
            </div>

            {/* Navigation Bar */}
            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 gap-2">
                {['archetypes', 'tree', 'analytics', 'automation'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSection(tab)}
                        className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${activeSection === tab ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence>
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeSection === 'archetypes' && <ArchetypeGrid archetypes={archetypes} onEdit={(a) => handleEdit(a, 'archetype')} onAdd={handleAddArchetype} />}
                    {activeSection === 'tree' && <CategoryTree categories={categories} onEdit={(c) => handleEdit(c, 'category')} onAdd={handleAddCategory} />}
                    {activeSection === 'analytics' && <AnalyticsDashboard />}
                    {activeSection === 'automation' && <AutomationTool />}
                </motion.div>
            </AnimatePresence>

            {/* EDIT MODAL */}
            <AnimatePresence>
                {isEditModalOpen && selectedItem && (
                    <EditModal
                        item={selectedItem}
                        onClose={() => setIsEditModalOpen(false)}
                        onSave={fetchData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryManagement;
