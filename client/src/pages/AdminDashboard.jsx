import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Plus, X, Tag, Sliders, Image as ImageIcon,
    Check, Sparkles, Layout, Shirt, Scissors, Users,
    Calendar, Save, Trash2, PieChart, TrendingUp, RefreshCw, ChevronDown, Edit
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CategoryManagement from '../components/admin/CategoryManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import ColorVariationEditor from '../components/admin/ColorVariationEditor';
import SpecificationsEditor from '../components/admin/SpecificationsEditor';
import VendorManagement from '../components/admin/VendorManagement';

// Mock Data for Categories/Styles
const STYLES = [
    { id: 'romantic', label: 'Romantic Dreamer', color: '#FECDD3', icon: '🎀' },
    { id: 'boho', label: 'Boho Free Spirit', color: '#FDE68A', icon: '🌸' },
    { id: 'minimalist', label: 'Modern Minimalist', color: '#E5E7EB', icon: '⚫' },
    { id: 'classic', label: 'Classic Elegance', color: '#BAE6FD', icon: '👑' },
    { id: 'edgy', label: 'Edgy Trendsetter', color: '#DDD6FE', icon: '🔥' }
];

const CLOTHING_TYPES = [
    { id: 'dresses', label: 'Dress', icon: '👗' },
    { id: 'tops', label: 'Top', icon: '👚' },
    { id: 'bottoms', label: 'Bottom', icon: '👖' },
    { id: 'outerwear', label: 'Outerwear', icon: '🧥' },
    { id: 'shoes', label: 'Shoes', icon: '👠' },
    { id: 'accessories', label: 'Accessory', icon: '👜' }
];

const FOOTWEAR_SIZES_NUMERIC = [
    { size: '35', quantity: 0 },
    { size: '36', quantity: 0 },
    { size: '37', quantity: 0 },
    { size: '38', quantity: 0 },
    { size: '39', quantity: 0 },
    { size: '40', quantity: 0 },
    { size: '41', quantity: 0 }
];

const CLOTHING_SIZES_DEFAULT = [
    { size: 'XS', quantity: 0 },
    { size: 'S', quantity: 0 },
    { size: 'M', quantity: 0 },
    { size: 'L', quantity: 0 },
    { size: 'XL', quantity: 0 }
];

const SEASONS = [
    { id: 'spring', label: 'Spring', icon: '🌱' },
    { id: 'summer', label: 'Summer', icon: '☀️' },
    { id: 'fall', label: 'Fall', icon: '🍂' },
    { id: 'winter', label: 'Winter', icon: '❄️' }
];

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

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('upload');
    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [inventory, setInventory] = useState([]);

    const slugify = (text) => {
        if (!text || typeof text !== 'string') return 'unnamed';
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    };

    // Strict admin check is handled by AdminRoute, so we only need to log or perform admin-specific initialization here if needed.
    useEffect(() => {
        if (user) {
            console.log('✅ Admin Dashboard loaded for:', user.email);
        }
    }, [user]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'dresses', // Maps to 'type' in schema logic
        styleTags: [],
        colors: ['#000000'],
        seasons: [],
        description: '',
        archetype: [], // Multi-select archetypes
        mood: [], // Multi-select moods
        occasion: [], // Multi-select occasions
        sizeStock: CLOTHING_SIZES_DEFAULT,
        colorVariations: [],
        specifications: [],
        vendorDetails: {
            soldBy: 'ChicPlay Fashion',
            manufacturerName: '',
            manufacturerAddress: ''
        },
        isPublished: true
    });

    const [editingProduct, setEditingProduct] = useState(null);
    const [inventoryCategory, setInventoryCategory] = useState('all');
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [lastPublishedProduct, setLastPublishedProduct] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [dbArchetypes, setDbArchetypes] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [reviewingProduct, setReviewingProduct] = useState(null);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Category change sync for new product (formData)
    useEffect(() => {
        const cat = formData.category.toLowerCase();
        const isShoes = cat === 'shoes';
        const isAccessory = cat === 'accessories' || cat === 'accessory';

        let expectedSizes = CLOTHING_SIZES_DEFAULT;
        if (isShoes) expectedSizes = FOOTWEAR_SIZES_NUMERIC;
        if (isAccessory) expectedSizes = [{ size: 'Free Size', quantity: 0 }];

        const currentSizes = formData.sizeStock.map(s => s.size);
        const needsSync = currentSizes.length !== expectedSizes.length || !currentSizes.every(s => expectedSizes.some(e => e.size === s));

        if (needsSync) {
            setFormData(prev => ({
                ...prev,
                sizeStock: expectedSizes.map(target => {
                    const existing = prev.sizeStock.find(s => s.size === target.size);
                    return existing || { ...target };
                })
            }));
        }
    }, [formData.category]);

    // Category change sync for editing product
    useEffect(() => {
        if (!editingProduct) return;
        const cat = editingProduct.category?.toLowerCase();
        const isShoes = cat === 'shoes';
        const isAccessory = cat === 'accessories' || cat === 'accessory';

        let expectedSizes = CLOTHING_SIZES_DEFAULT;
        if (isShoes) expectedSizes = FOOTWEAR_SIZES_NUMERIC;
        if (isAccessory) expectedSizes = [{ size: 'Free Size', quantity: 0 }];

        const currentSizes = (editingProduct.sizeStock || []).map(s => s.size);
        const needsSync = currentSizes.length !== expectedSizes.length || !currentSizes.every(s => expectedSizes.some(e => e.size === s));

        if (needsSync) {
            setEditingProduct(prev => ({
                ...prev,
                sizeStock: expectedSizes.map(target => {
                    const existing = (prev.sizeStock || []).find(s => s.size === target.size);
                    return existing || { ...target };
                })
            }));
        }
    }, [editingProduct?.category]);

    const handleApproveProduct = async (id, status, comments = "") => {
        try {
            // If we made changes while reviewing, save them first
            if (isEditingReview && reviewingProduct) {
                await api.put(`/products/${id}`, reviewingProduct);
            }

            await api.patch(`/products/${id}/approve`, { status, comments });
            toast.success(`Product ${status}!`);
            setReviewingProduct(null);
            setIsEditingReview(false);
            fetchPendingProducts();
            fetchInventory(); // Refresh main inventory too if approved
        } catch (error) {
            console.error("Approval error:", error);
            toast.error("Action failed");
        }
    };

    useEffect(() => {
        if (activeTab === 'inventory' || activeTab === 'upload') {
            fetchInventory();
            fetchCategories();
            fetchArchetypes();
        }
        if (activeTab === 'approvals') {
            fetchPendingProducts();
        }
    }, [activeTab]);

    const fetchArchetypes = async () => {
        try {
            const response = await api.get('/categories/archetypes');
            setDbArchetypes(response.data);
        } catch (error) {
            console.error('Failed to fetch archetypes:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setDbCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleAddNewCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const response = await api.post('/categories', { name: newCategoryName.trim() });
            toast.success(`Category "${response.data.name}" added!`);
            setDbCategories(prev => [...prev, response.data]);
            setFormData(prev => ({ ...prev, category: response.data.name.toLowerCase() }));
            setIsAddingNewCategory(false);
            setNewCategoryName('');
        } catch (error) {
            toast.error("Failed to add category");
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await api.get('/products');
            setInventory(response.data);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
            toast.error("Failed to load inventory");
        }
    };

    const fetchPendingProducts = async () => {
        try {
            const response = await api.get('/products/admin/pending');
            setPendingProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch pending products:", error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image too large (max 5MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleSelection = (field, value) => {
        setFormData(prev => {
            const current = prev[field];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleStockChange = (size, qty) => {
        setFormData(prev => ({
            ...prev,
            sizeStock: prev.sizeStock.map(s => s.size === size ? { ...s, quantity: parseInt(qty) || 0 } : s)
        }));
    };

    const handlePublish = async () => {
        if (!formData.name || !previewImage) {
            toast.error("Please provide name and image");
            return;
        }

        if (isImageUploading) {
            toast.error("Please wait for all images to finish uploading");
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            // IMPORTANT: Add organization metadata BEFORE the file for Multer/Cloudinary to see them
            // This metadata is used by the server to organize files in Cloudinary folders
            formDataToSend.append('category', formData.category);
            formDataToSend.append('productSlug', slugify(formData.name));
            formDataToSend.append('colorSlug', 'main');
            formDataToSend.append('imageType', 'front');
            formDataToSend.append('image', fileInputRef.current.files[0]);

            formDataToSend.append('name', formData.name);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('styleTags', JSON.stringify(formData.styleTags));
            formDataToSend.append('seasons', JSON.stringify(formData.seasons));
            formDataToSend.append('colors', JSON.stringify(formData.colors));
            formDataToSend.append('sizeStock', JSON.stringify(formData.sizeStock));
            formDataToSend.append('colorVariations', JSON.stringify(formData.colorVariations));
            formDataToSend.append('specifications', JSON.stringify(formData.specifications));
            formDataToSend.append('vendorDetails', JSON.stringify(formData.vendorDetails));
            formDataToSend.append('isPublished', formData.isPublished);
            formDataToSend.append('archetype', JSON.stringify(formData.archetype));
            formDataToSend.append('mood', JSON.stringify(formData.mood));
            formDataToSend.append('occasion', JSON.stringify(formData.occasion));

            const response = await api.post('/products/upload', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Published Item:", response.data);

            // Show success message based on publish status
            if (formData.isPublished) {
                toast.success(`✅ ${formData.name} published successfully and is now visible in the shop!`, {
                    duration: 5000,
                    icon: '🎉',
                });
            } else {
                toast.success(`💾 ${formData.name} saved as draft (hidden from shop)`, {
                    duration: 4000,
                });
            }

            // Show success banner
            setLastPublishedProduct({
                name: formData.name,
                isPublished: formData.isPublished,
                category: formData.category
            });
            setShowSuccessBanner(true);

            // Auto-hide banner after 6 seconds
            setTimeout(() => {
                setShowSuccessBanner(false);
            }, 6000);


            // Reset form
            setFormData({
                name: '',
                price: '',
                category: 'dresses',
                styleTags: [],
                colors: ['#000000'],
                seasons: [],
                description: '',
                archetype: [],
                mood: [],
                occasion: [],
                sizeStock: CLOTHING_SIZES_DEFAULT,
                colorVariations: [],
                specifications: [],
                vendorDetails: {
                    soldBy: 'ChicPlay Fashion',
                    manufacturerName: '',
                    manufacturerAddress: ''
                },
                isPublished: true
            });
            setPreviewImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to publish");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        if (isImageUploading) {
            toast.error("Please wait for all images to finish uploading");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.put(`/products/${editingProduct._id}`, editingProduct);
            toast.success("Product updated successfully!");
            setEditingProduct(null);
            fetchInventory();
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.message || "Failed to update product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this dress?")) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Product deleted successfully!");
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            fetchInventory();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(error.response?.data?.message || "Failed to delete product");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items? This action cannot be undone.`)) return;

        setIsSubmitting(true);
        try {
            const response = await api.post('/products/bulk-delete', { ids: selectedIds });
            toast.success(`✅ Successfully deleted ${response.data.deletedCount} items`);
            setSelectedIds([]);
            fetchInventory();
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error(error.response?.data?.message || "Failed to delete selected items");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSelectAll = () => {
        const filteredInventory = inventory.filter(item => inventoryCategory === 'all' || item.category?.toLowerCase() === inventoryCategory);
        if (selectedIds.length === filteredInventory.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredInventory.map(item => item._id));
        }
    };

    const toggleSelectProduct = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/30 pt-8 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 rounded-[2.5rem] p-8 mb-8 shadow-2xl border border-white/20">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <Sparkles className="text-white" size={24} />
                                </div>
                                <h1 className="text-4xl font-black text-white tracking-tight">
                                    Admin Dashboard
                                </h1>
                            </div>
                            <p className="text-white/90 font-medium ml-16">Manage your virtual closet and store inventory.</p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <Layout size={18} />
                            Back to Home
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-100 overflow-x-auto no-scrollbar">
                    <div className="flex gap-3 min-w-max">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 min-w-[120px] px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold text-sm ${activeTab === 'upload' ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-xl scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:shadow-md'}`}
                        >
                            <Upload size={20} />
                            Upload
                        </button>

                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`flex-1 min-w-[120px] px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold text-sm ${activeTab === 'inventory' ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-xl scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:shadow-md'}`}
                        >
                            <Shirt size={20} />
                            Inventory
                        </button>

                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`flex-1 min-w-[120px] px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold text-sm ${activeTab === 'categories' ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-xl scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:shadow-md'}`}
                        >
                            <Tag size={20} />
                            Categories
                        </button>

                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex-1 min-w-[120px] px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold text-sm ${activeTab === 'analytics' ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-xl scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:shadow-md'}`}
                        >
                            <PieChart size={20} />
                            Analytics
                        </button>

                        <button
                            onClick={() => setActiveTab('vendors')}
                            className={`flex-1 min-w-[120px] px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold text-sm ${activeTab === 'vendors' ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-xl scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:shadow-md'}`}
                        >
                            <Users size={20} />
                            Vendors
                        </button>

                        <button
                            onClick={() => setActiveTab('approvals')}
                            className={`relative flex-1 min-w-[120px] px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold text-sm ${activeTab === 'approvals' ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-xl scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:shadow-md'}`}
                        >
                            <Check size={20} />
                            Approvals
                            {pendingProducts.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                                    {pendingProducts.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                {activeTab === 'vendors' && <VendorManagement />}

                {activeTab === 'approvals' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-mocha">Pending Approvals ({pendingProducts.length})</h3>
                            <button onClick={fetchPendingProducts} className="p-2 bg-white rounded-xl shadow-sm text-pink-500 hover:rotate-180 transition-transform duration-500 flex items-center gap-2 font-bold px-4">
                                <RefreshCw size={20} />
                                <span className="text-xs">Refresh List</span>
                            </button>
                        </div>

                        {pendingProducts.length === 0 ? (
                            <div className="bg-white rounded-[40px] p-20 text-center shadow-sm border border-gray-100">
                                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check size={48} />
                                </div>
                                <h4 className="text-2xl font-black text-gray-900 mb-2">Queue is Empty!</h4>
                                <p className="text-gray-400 font-medium">All vendor products have been reviewed.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence>
                                    {pendingProducts.map((p) => (
                                        <motion.div
                                            key={p._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group"
                                        >
                                            <div className="aspect-[4/5] relative overflow-hidden bg-gray-50">
                                                <img
                                                    src={p.images?.[0] || 'https://via.placeholder.com/400'}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-pink-500 shadow-sm border border-pink-100">
                                                        {p.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h4 className="text-lg font-black text-gray-900 mb-1 truncate">{p.name}</h4>
                                                <p className="text-pink-500 font-black mb-4">₹{p.price}</p>

                                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => setReviewingProduct(p)}
                                                            className="col-span-2 bg-gray-900 text-white py-3 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Shirt size={18} /> Review Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveProduct(p._id, 'approved')}
                                                            className="bg-green-500 text-white py-3 rounded-2xl font-black text-sm shadow-lg shadow-green-100 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Check size={18} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveProduct(p._id, 'rejected')}
                                                            className="bg-rose-50 text-rose-500 py-3 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <X size={18} /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}

                {/* Detailed Review Modal */}
                <AnimatePresence>
                    {reviewingProduct && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setReviewingProduct(null)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                            >
                                {/* Header */}
                                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-pink-100 text-pink-600 rounded text-[10px] font-black uppercase tracking-widest">Pending Review</span>
                                            <span className="text-xs text-gray-400 font-bold">• Submitted {new Date(reviewingProduct.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                            {isEditingReview ? (
                                                <input
                                                    type="text"
                                                    value={reviewingProduct.name}
                                                    onChange={(e) => setReviewingProduct({ ...reviewingProduct, name: e.target.value })}
                                                    className="bg-gray-50 px-4 py-2 rounded-2xl border-2 border-pink-100 outline-none focus:border-pink-300 w-full"
                                                />
                                            ) : reviewingProduct.name}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsEditingReview(!isEditingReview)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${isEditingReview
                                                ? 'bg-pink-500 text-white shadow-lg shadow-pink-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Edit size={18} /> {isEditingReview ? 'Finish Editing' : 'Edit Details'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReviewingProduct(null);
                                                setIsEditingReview(false);
                                            }}
                                            className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-gray-900 transition-all"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Left: Media & Variations */}
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                    <ImageIcon size={20} className="text-pink-500" />
                                                    Product Visuals
                                                </h3>
                                                <div className="space-y-6">
                                                    {reviewingProduct.colorVariations?.map((variant, idx) => (
                                                        <div key={idx} className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: variant.color }} />
                                                                <span className="font-bold text-gray-700 capitalize text-sm">{variant.colorName}</span>
                                                            </div>
                                                            <div className="grid grid-cols-5 gap-2">
                                                                {['front', 'back', 'side', 'fabric', 'lifestyle'].map(type => (
                                                                    <div key={type} className="aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden group relative">
                                                                        {variant.images?.[type] ? (
                                                                            <img src={variant.images[type]} alt={type} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex flex-col items-center justify-center text-[8px] font-black uppercase text-gray-300">
                                                                                <span>No</span>
                                                                                <span>{type}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <span className="text-[8px] font-black text-white uppercase">{type}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!reviewingProduct.colorVariations || reviewingProduct.colorVariations.length === 0) && (
                                                        <div className="aspect-[4/5] bg-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
                                                            <img src={reviewingProduct.images?.[0]} alt="Primary" className="max-h-full object-contain p-8" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Details & Specs */}
                                        <div className="space-y-8">
                                            {/* Details Overview */}
                                            <div className="bg-pink-50 rounded-[32px] p-8 border border-pink-100/50">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] mb-1">Pricing & Category</p>
                                                        {isEditingReview ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl font-black text-gray-400">₹</span>
                                                                <input
                                                                    type="number"
                                                                    value={reviewingProduct.price}
                                                                    onChange={(e) => setReviewingProduct({ ...reviewingProduct, price: e.target.value })}
                                                                    className="bg-white px-4 py-2 rounded-xl border-2 border-pink-200 outline-none focus:border-pink-400 font-black text-xl w-32"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p className="text-3xl font-black text-gray-900">₹{reviewingProduct.price}</p>
                                                        )}
                                                    </div>
                                                    <span className="bg-white px-4 py-2 rounded-2xl text-xs font-black text-pink-500 shadow-sm border border-pink-100 lowercase">
                                                        #{reviewingProduct.category}
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Sparkles size={16} className="text-pink-400" />
                                                        <span className="text-sm font-bold text-gray-600">Archetype:
                                                            {isEditingReview ? (
                                                                <select
                                                                    value={reviewingProduct.archetype}
                                                                    onChange={(e) => setReviewingProduct({ ...reviewingProduct, archetype: e.target.value })}
                                                                    className="ml-2 bg-white px-3 py-1.5 rounded-xl border border-pink-200 outline-none font-bold text-gray-900 shadow-sm"
                                                                >
                                                                    <option>Romantic Dreamer</option>
                                                                    <option>Boho Free Spirit</option>
                                                                    <option>Modern Minimalist</option>
                                                                    <option>Classic Elegance</option>
                                                                    <option>Edgy Trendsetter</option>
                                                                </select>
                                                            ) : (
                                                                <span className="text-gray-900 ml-1">{reviewingProduct.archetype}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    {isEditingReview ? (
                                                        <textarea
                                                            value={reviewingProduct.description}
                                                            onChange={(e) => setReviewingProduct({ ...reviewingProduct, description: e.target.value })}
                                                            className="w-full mt-2 bg-white px-4 py-3 rounded-2xl border border-pink-200 outline-none text-sm font-medium text-gray-700 h-24 resize-none"
                                                            placeholder="Edit description..."
                                                        />
                                                    ) : reviewingProduct.description && (
                                                        <p className="text-sm font-medium text-gray-500 leading-relaxed italic border-l-2 border-pink-200 pl-4 py-1">
                                                            "{reviewingProduct.description}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Specifications */}
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                    <Sliders size={20} className="text-pink-500" />
                                                    Technical Traits
                                                </h3>
                                                {isEditingReview ? (
                                                    <SpecificationsEditor
                                                        specifications={reviewingProduct.specifications || []}
                                                        onChange={(specs) => setReviewingProduct(prev => ({ ...prev, specifications: specs }))}
                                                    />
                                                ) : (
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {reviewingProduct.specifications?.map((spec, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xl">{spec.icon || '▫️'}</span>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{spec.key}</p>
                                                                        <p className="text-sm font-bold text-gray-900 leading-none">{spec.value}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!reviewingProduct.specifications || reviewingProduct.specifications.length === 0) && (
                                                            <p className="text-sm font-bold text-gray-300 italic px-4">No specific traits provided</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Vendor Details */}
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                    <Users size={20} className="text-pink-500" />
                                                    Vendor Metadata
                                                </h3>
                                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Sold By</span>
                                                        {isEditingReview ? (
                                                            <input
                                                                type="text"
                                                                value={reviewingProduct.vendorDetails?.soldBy || ''}
                                                                onChange={(e) => setReviewingProduct({
                                                                    ...reviewingProduct,
                                                                    vendorDetails: { ...reviewingProduct.vendorDetails, soldBy: e.target.value }
                                                                })}
                                                                className="bg-white px-3 py-1.5 rounded-xl border border-pink-100 outline-none text-right font-black"
                                                            />
                                                        ) : (
                                                            <span className="font-black text-gray-900">{reviewingProduct.vendorDetails?.soldBy || 'N/A'}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Manufacturer</span>
                                                        {isEditingReview ? (
                                                            <input
                                                                type="text"
                                                                value={reviewingProduct.vendorDetails?.manufacturerName || ''}
                                                                onChange={(e) => setReviewingProduct({
                                                                    ...reviewingProduct,
                                                                    vendorDetails: { ...reviewingProduct.vendorDetails, manufacturerName: e.target.value }
                                                                })}
                                                                className="bg-white px-3 py-1.5 rounded-xl border border-pink-100 outline-none text-right font-black"
                                                            />
                                                        ) : (
                                                            <span className="font-black text-gray-900">{reviewingProduct.vendorDetails?.manufacturerName || 'N/A'}</span>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Address</span>
                                                        {isEditingReview ? (
                                                            <textarea
                                                                value={reviewingProduct.vendorDetails?.manufacturerAddress || ''}
                                                                onChange={(e) => setReviewingProduct({
                                                                    ...reviewingProduct,
                                                                    vendorDetails: { ...reviewingProduct.vendorDetails, manufacturerAddress: e.target.value }
                                                                })}
                                                                className="w-full bg-white px-3 py-2 rounded-xl border border-pink-100 outline-none font-bold text-xs resize-none h-16"
                                                            />
                                                        ) : (
                                                            <p className="text-xs font-bold text-gray-600 leading-relaxed">{reviewingProduct.vendorDetails?.manufacturerAddress || 'N/A'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-8 border-t border-gray-100 flex gap-4 bg-white sticky bottom-0 z-20">
                                    <button
                                        onClick={() => handleApproveProduct(reviewingProduct._id, 'approved')}
                                        className="flex-1 bg-green-500 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-green-100 hover:bg-green-600 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Check size={24} /> {isEditingReview ? 'Save and Approve' : 'Confirm & Approve'}
                                    </button>
                                    {!isEditingReview && (
                                        <button
                                            onClick={() => handleApproveProduct(reviewingProduct._id, 'rejected')}
                                            className="px-12 bg-rose-50 text-rose-500 py-5 rounded-[24px] font-black text-lg hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
                                        >
                                            <X size={24} /> Reject
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {activeTab === 'upload' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Success Banner */}
                        <AnimatePresence>
                            {showSuccessBanner && lastPublishedProduct && (
                                <motion.div
                                    initial={{ opacity: 0, y: -50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -50 }}
                                    className="lg:col-span-12 mb-4"
                                >
                                    <div className={`rounded-2xl p-6 shadow-lg border-2 ${lastPublishedProduct.isPublished
                                        ? 'bg-green-50 border-green-300'
                                        : 'bg-blue-50 border-blue-300'
                                        }`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${lastPublishedProduct.isPublished
                                                ? 'bg-green-500'
                                                : 'bg-blue-500'
                                                }`}>
                                                {lastPublishedProduct.isPublished ? (
                                                    <Check size={24} className="text-white" />
                                                ) : (
                                                    <Save size={24} className="text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-lg font-black mb-1 ${lastPublishedProduct.isPublished
                                                    ? 'text-green-900'
                                                    : 'text-blue-900'
                                                    }`}>
                                                    {lastPublishedProduct.isPublished
                                                        ? '🎉 Product Published Successfully!'
                                                        : '💾 Product Saved as Draft'}
                                                </h3>
                                                <p className={`text-sm font-medium ${lastPublishedProduct.isPublished
                                                    ? 'text-green-700'
                                                    : 'text-blue-700'
                                                    }`}>
                                                    <strong>{lastPublishedProduct.name}</strong> ({lastPublishedProduct.category})
                                                    {lastPublishedProduct.isPublished
                                                        ? ' is now visible in the shop and customers can purchase it!'
                                                        : ' has been saved but is hidden from customers. Toggle publish status to make it visible.'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowSuccessBanner(false)}
                                                className="text-gray-400 hover:text-gray-600 transition"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-dashed border-gray-200 hover:border-pink-300 transition-colors text-center cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                {previewImage ? (
                                    <div className="relative inline-block">
                                        <img src={previewImage} alt="Preview" className="h-64 object-contain rounded-lg shadow-lg" />
                                        <button onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }} className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-lg text-red-500 hover:scale-110">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-12">
                                        <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"><ImageIcon size={40} /></div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Dress Image</h3>
                                        <p className="text-gray-400">Click to browse or drag and drop</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-sm">
                                <h3 className="text-xl font-bold text-mocha mb-6 flex items-center gap-2"><Sliders size={20} className="text-pink-500" /> Item Details</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Item Name</label>
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pink Floral Summer Dress" className="w-full px-5 py-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-gray-900" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Write a beautiful description for this item..."
                                            rows="3"
                                            className="w-full px-5 py-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-gray-900 resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Price (₹)</label>
                                            <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" className="w-full px-5 py-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Category</label>
                                            <div className="space-y-3">
                                                {!isAddingNewCategory ? (
                                                    <div className="relative">
                                                        <select
                                                            value={formData.category}
                                                            onChange={(e) => {
                                                                if (e.target.value === 'add-new') {
                                                                    setIsAddingNewCategory(true);
                                                                } else {
                                                                    setFormData({ ...formData, category: e.target.value });
                                                                }
                                                            }}
                                                            className="w-full px-5 py-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-gray-900 appearance-none cursor-pointer"
                                                        >
                                                            {/* Combine static defaults with DB categories */}
                                                            {CLOTHING_TYPES.map(type => <option key={type.id} value={type.id}>{type.icon} {type.label}</option>)}
                                                            {dbCategories.filter(dbCat => !CLOTHING_TYPES.find(t => t.id === dbCat.name.toLowerCase())).map(dbCat => (
                                                                <option key={dbCat._id} value={dbCat.name.toLowerCase()}>📦 {dbCat.name}</option>
                                                            ))}
                                                            <option value="add-new">+ Add New Category...</option>
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                            <ChevronDown size={20} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                            placeholder="New category name..."
                                                            className="flex-1 px-5 py-4 bg-white border-2 border-pink-200 rounded-xl outline-none font-bold"
                                                        />
                                                        <button
                                                            onClick={handleAddNewCategory}
                                                            className="px-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
                                                        >
                                                            <Check size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => setIsAddingNewCategory(false)}
                                                            className="px-4 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition"
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                                            {formData.category === 'accessories' ? 'Stock Quantity (Free Size)' : 'Stock by Size'}
                                        </label>
                                        <div className={formData.category === 'accessories' ? 'w-full' : 'grid grid-cols-3 gap-4'}>
                                            {formData.sizeStock.map((s, idx) => (
                                                <div key={idx} className={`bg-gray-50 p-4 rounded-xl border-2 border-transparent transition-all focus-within:border-pink-200 focus-within:bg-white shadow-sm ${formData.category === 'accessories' ? 'flex items-center justify-between' : ''}`}>
                                                    <span className="text-xs font-black text-gray-400 block mb-1 uppercase tracking-widest">
                                                        {formData.category === 'accessories' ? 'Free Size' : `Size ${s.size}`}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={s.quantity}
                                                        onChange={(e) => handleStockChange(s.size, e.target.value)}
                                                        className={`bg-transparent outline-none font-bold text-gray-900 ${formData.category === 'accessories' ? 'text-2xl text-right w-32' : 'w-full text-lg'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase flex items-center gap-2">
                                                <Sparkles size={16} className="text-pink-500" />
                                                Style Archetypes (Select Multiple)
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {(dbArchetypes.length > 0 ? dbArchetypes : STYLES.map(s => ({ _id: s.id, name: s.label, emoji: s.icon }))).map(archetype => {
                                                    const isSelected = (formData.archetype || []).includes(archetype.name);
                                                    return (
                                                        <button
                                                            key={archetype._id}
                                                            type="button"
                                                            onClick={() => {
                                                                const currentArchetypes = formData.archetype || [];
                                                                const newArchetypes = isSelected
                                                                    ? currentArchetypes.filter(a => a !== archetype.name)
                                                                    : [...currentArchetypes, archetype.name];
                                                                setFormData({ ...formData, archetype: newArchetypes });
                                                            }}
                                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${isSelected
                                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}>
                                                                {isSelected && <Check size={14} className="text-purple-500" />}
                                                            </div>
                                                            <span>{archetype.emoji || '✨'}</span>
                                                            <span className="flex-1 text-left">{archetype.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Publish Status</label>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent h-[60px]">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium">{formData.isPublished ? 'Visible in store' : 'Hidden'}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                                                    className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${formData.isPublished ? 'bg-green-500' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${formData.isPublished ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mood Selector */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2">
                                                <Sparkles size={16} className="text-pink-500" />
                                                Moods (Select Multiple)
                                            </label>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {MOODS.map(mood => {
                                                const isSelected = (formData.mood || []).includes(mood.id);
                                                return (
                                                    <button
                                                        key={mood.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentMoods = formData.mood || [];
                                                            const newMoods = isSelected
                                                                ? currentMoods.filter(m => m !== mood.id)
                                                                : [...currentMoods, mood.id];
                                                            setFormData({ ...formData, mood: newMoods });
                                                        }}
                                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${isSelected
                                                            ? `${mood.style} border-transparent shadow-lg scale-105`
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}>
                                                            {isSelected && <Check size={12} className="text-gray-700" />}
                                                        </div>
                                                        <span>{mood.icon}</span>
                                                        <span>{mood.name}</span>
                                                    </button>
                                                );
                                            })}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Add custom mood..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = e.target.value.trim().toLowerCase();
                                                            if (val && !formData.mood.includes(val)) {
                                                                setFormData(prev => ({ ...prev, mood: [...prev.mood, val] }));
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                    className="px-4 py-2.5 rounded-xl border-2 border-dashed border-pink-200 text-sm font-bold bg-pink-50/30 focus:border-pink-400 focus:bg-white focus:border-solid outline-none transition-all placeholder:text-pink-300 w-56 shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        {/* Display selected custom moods that aren't in the default list */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.mood.filter(m => !MOODS.find(def => def.id === m)).map(m => (
                                                <span key={m} className="px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 rounded-xl text-xs font-black flex items-center gap-2 border border-pink-100 shadow-sm hover:shadow-md transition-all group">
                                                    <Sparkles size={10} className="text-pink-400" />
                                                    {m}
                                                    <X
                                                        size={14}
                                                        className="cursor-pointer hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                                                        onClick={() => setFormData(prev => ({ ...prev, mood: prev.mood.filter(item => item !== m) }))}
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Occasion Selector */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2">
                                                <Calendar size={16} className="text-pink-500" />
                                                Occasions (Select Multiple)
                                            </label>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {OCCASIONS.map(occasion => {
                                                const isSelected = (formData.occasion || []).includes(occasion.name);
                                                return (
                                                    <button
                                                        key={occasion.name}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentOccasions = formData.occasion || [];
                                                            const newOccasions = isSelected
                                                                ? currentOccasions.filter(o => o !== occasion.name)
                                                                : [...currentOccasions, occasion.name];
                                                            setFormData({ ...formData, occasion: newOccasions });
                                                        }}
                                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${isSelected
                                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg scale-105'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}>
                                                            {isSelected && <Check size={12} className="text-pink-500" />}
                                                        </div>
                                                        <span>{occasion.icon}</span>
                                                        <span>{occasion.name}</span>
                                                    </button>
                                                );
                                            })}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Add custom occasion..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = e.target.value.trim();
                                                            if (val && !formData.occasion.includes(val)) {
                                                                setFormData(prev => ({ ...prev, occasion: [...prev.occasion, val] }));
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                    className="px-4 py-2.5 rounded-xl border-2 border-dashed border-pink-200 text-sm font-bold bg-pink-50/30 focus:border-pink-400 focus:bg-white focus:border-solid outline-none transition-all placeholder:text-pink-300 w-56 shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        {/* Display selected custom occasions that aren't in the default list */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.occasion.filter(o => !OCCASIONS.find(def => def.name === o)).map(o => (
                                                <span key={o} className="px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 rounded-xl text-xs font-black flex items-center gap-2 border border-pink-100 shadow-sm hover:shadow-md transition-all group">
                                                    <Calendar size={10} className="text-pink-400" />
                                                    {o}
                                                    <X
                                                        size={14}
                                                        className="cursor-pointer hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                                                        onClick={() => setFormData(prev => ({ ...prev, occasion: prev.occasion.filter(item => item !== o) }))}
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                        {/* Display selected custom occasions that aren't in the default list */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.occasion.filter(o => !OCCASIONS.find(def => def.name === o)).map(o => (
                                                <span key={o} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-gray-200">
                                                    {o}
                                                    <X size={12} className="cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, occasion: prev.occasion.filter(item => item !== o) }))} />
                                                </span>
                                            ))}
                                        </div>
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
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                                <Users size={20} className="text-pink-500" />
                                                Vendor Details
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sold By</label>
                                                    <input
                                                        type="text"
                                                        value={formData.vendorDetails?.soldBy || ''}
                                                        onChange={(e) => setFormData({ ...formData, vendorDetails: { ...formData.vendorDetails, soldBy: e.target.value } })}
                                                        placeholder="ChicPlay Fashion"
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manufacturer Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.vendorDetails?.manufacturerName || ''}
                                                        onChange={(e) => setFormData({ ...formData, vendorDetails: { ...formData.vendorDetails, manufacturerName: e.target.value } })}
                                                        placeholder="Enter manufacturer"
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manufacturer Address</label>
                                                    <textarea
                                                        value={formData.vendorDetails?.manufacturerAddress || ''}
                                                        onChange={(e) => setFormData({ ...formData, vendorDetails: { ...formData.vendorDetails, manufacturerAddress: e.target.value } })}
                                                        placeholder="Enter full address"
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-sm h-24 resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <SpecificationsEditor
                                            specifications={formData.specifications || []}
                                            onChange={(specs) => setFormData(prev => ({ ...prev, specifications: specs }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="sticky top-24">
                                <div className="bg-white rounded-[40px] p-2 shadow-2xl border border-gray-100">
                                    <div className="bg-gradient-to-b from-pink-50 to-white rounded-[32px] p-6 relative min-h-[500px] flex items-center justify-center overflow-hidden">
                                        <h3 className="absolute top-6 left-0 right-0 text-center text-sm font-black text-gray-300 uppercase tracking-widest z-20">Live Preview</h3>
                                        {previewImage && <motion.img initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-64 h-auto object-contain z-10 drop-shadow-2xl" src={previewImage} />}
                                        {!previewImage && <div className="text-gray-300 font-black text-4xl opacity-20 rotate-[-20deg]">NO PREVIEW</div>}
                                    </div>
                                </div>
                                <button onClick={handlePublish} disabled={isSubmitting} className="w-full mt-6 bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Publishing...' : 'Save & Publish Dress'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {
                    activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-2xl font-black text-mocha">Inventory ({inventory.filter(item => inventoryCategory === 'all' || item.category?.toLowerCase() === inventoryCategory).length})</h3>
                                    {selectedIds.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-3 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100"
                                        >
                                            <span className="text-rose-600 font-bold text-sm">{selectedIds.length} selected</span>
                                            <button
                                                onClick={handleBulkDelete}
                                                disabled={isSubmitting}
                                                className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-rose-200 flex items-center gap-2 hover:bg-rose-600 transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 size={14} />
                                                {isSubmitting ? 'Deleting...' : 'Delete Selected'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedIds([])}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                                <button onClick={fetchInventory} className="p-2 bg-white rounded-xl shadow-sm text-pink-500 hover:rotate-180 transition-transform duration-500 flex items-center gap-2 font-bold px-4">
                                    <RefreshCw size={20} />
                                    <span className="text-xs">Refresh</span>
                                </button>
                            </div>

                            {/* Category Filter Tabs */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <button
                                    onClick={() => setInventoryCategory('all')}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${inventoryCategory === 'all'
                                        ? 'bg-gray-900 text-white shadow-lg'
                                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    All ({inventory.length})
                                </button>
                                {CLOTHING_TYPES.map(type => {
                                    const count = inventory.filter(item => {
                                        const itemCat = item.category?.toLowerCase() || '';
                                        const filterCat = type.id.toLowerCase();
                                        const normalizedFilter = filterCat.endsWith('es') ? filterCat.slice(0, -2) : (filterCat.endsWith('s') ? filterCat.slice(0, -1) : filterCat);

                                        return itemCat.includes(normalizedFilter);
                                    }).length;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                setInventoryCategory(type.id);
                                                setSelectedIds([]); // Clear selection when category changes for safety
                                            }}
                                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${inventoryCategory === type.id
                                                ? 'bg-pink-500 text-white shadow-lg'
                                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-pink-300'
                                                }`}
                                        >
                                            <span>{type.icon}</span>
                                            {type.label} ({count})
                                        </button>
                                    );
                                })}

                                {inventory.length > 0 && (
                                    <button
                                        onClick={toggleSelectAll}
                                        className="ml-auto px-6 py-3 rounded-xl font-bold text-sm bg-white text-gray-600 border-2 border-dashed border-gray-200 hover:border-pink-300 transition-all flex items-center gap-2"
                                    >
                                        {selectedIds.length === inventory.filter(item => inventoryCategory === 'all' || item.category?.toLowerCase() === inventoryCategory).length
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {inventory
                                    .filter(item => {
                                        if (inventoryCategory === 'all') return true;
                                        const itemCat = item.category?.toLowerCase() || '';
                                        const filterCat = inventoryCategory.toLowerCase();
                                        const normalizedFilter = filterCat.endsWith('es') ? filterCat.slice(0, -2) : (filterCat.endsWith('s') ? filterCat.slice(0, -1) : filterCat);

                                        return itemCat.includes(normalizedFilter);
                                    })
                                    .map(item => (
                                        <div key={item._id} className={`bg-white rounded-3xl p-5 shadow-sm border group hover:shadow-xl transition-all relative ${selectedIds.includes(item._id) ? 'border-pink-500 ring-2 ring-pink-100' : 'border-gray-100'}`}>
                                            <div className="aspect-[3/4] rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden mb-4 p-4 relative">
                                                {/* Selection Checkbox */}
                                                <div
                                                    className={`absolute top-3 left-3 z-20 w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${selectedIds.includes(item._id) ? 'bg-pink-500 border-pink-500 shadow-md scale-110' : 'bg-white/80 border-gray-300 backdrop-blur-sm opacity-0 group-hover:opacity-100'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelectProduct(item._id);
                                                    }}
                                                >
                                                    {selectedIds.includes(item._id) && <Check size={14} className="text-white" />}
                                                </div>

                                                <img src={item.images[0]} alt={item.name} className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                                {item.stock === 0 && (
                                                    <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center">
                                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-gray-900 truncate max-w-[150px]">{item.name}</h4>
                                                        {item.isPublished ? (
                                                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Published" />
                                                        ) : (
                                                            <span className="w-2 h-2 rounded-full bg-gray-300" title="Draft (Hidden)" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                                                </div>
                                                <span className="font-black text-pink-500 text-lg">₹{item.price}</span>
                                            </div>

                                            {/* Stock Summary */}
                                            <div className="bg-gray-50 rounded-2xl p-3 mb-4 flex justify-between gap-1 overflow-x-auto">
                                                {(item.sizeStock || []).map(s => (
                                                    <div key={s.size} className="text-center min-w-[40px]">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">{s.size}</p>
                                                        <p className={`text-sm font-black ${s.quantity === 0 ? 'text-red-500' : 'text-gray-800'}`}>{s.quantity}</p>
                                                    </div>
                                                ))}
                                                {(!item.sizeStock || item.sizeStock.length === 0) && (
                                                    <p className="text-[10px] font-bold text-gray-300 uppercase italic">No size data</p>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-gray-50 flex gap-2">
                                                <button
                                                    onClick={() => setEditingProduct({
                                                        ...item,
                                                        vendorDetails: item.vendorDetails || {
                                                            soldBy: 'ChicPlay Fashion',
                                                            manufacturerName: '',
                                                            manufacturerAddress: ''
                                                        }
                                                    })}
                                                    className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-xs font-black hover:bg-black transition shadow-md shadow-gray-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(item._id)}
                                                    className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition flex items-center justify-center"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {/* Empty State */}
                            {inventory.filter(item => inventoryCategory === 'all' || item.category?.toLowerCase() === inventoryCategory).length === 0 && (
                                <div className="bg-white rounded-3xl p-12 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shirt size={40} className="text-gray-300" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-400 mb-2">No products in this category</h4>
                                    <p className="text-gray-400 text-sm">
                                        {inventoryCategory === 'all'
                                            ? 'Start by uploading your first product!'
                                            : `No ${CLOTHING_TYPES.find(t => t.id === inventoryCategory)?.label || 'items'} found. Upload one to get started!`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                }

                {activeTab === 'categories' && <CategoryManagement />}
                {activeTab === 'analytics' && <AnalyticsDashboard />}
            </div >

            {/* Edit Modal */}
            <AnimatePresence>
                {editingProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                            <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-mocha transition"><X size={24} /></button>

                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <Sliders className="text-pink-500" />
                                Edit Product: {editingProduct.name}
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Product Name</label>
                                    <input
                                        type="text"
                                        value={editingProduct.name}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-lg"
                                    />
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Description</label>
                                    <textarea
                                        value={editingProduct.description || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                        placeholder="Write a beautiful description for this item..."
                                        rows="3"
                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-gray-900 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={editingProduct.price}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Category</label>
                                        <select
                                            value={editingProduct.category || 'dresses'}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-pink-300 outline-none font-bold text-lg appearance-none cursor-pointer"
                                        >
                                            {CLOTHING_TYPES.map(type => (
                                                <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">
                                        {editingProduct.category === 'accessories' ? 'Stock Quantity (Free Size)' : 'Stock by Size'}
                                    </label>
                                    <div className={editingProduct.category === 'accessories' ? 'w-full' : 'grid grid-cols-3 gap-4'}>
                                        {(editingProduct.sizeStock || CLOTHING_SIZES_DEFAULT).map((s, idx) => (
                                            <div key={idx} className={`bg-gray-50 p-4 rounded-xl border-2 border-transparent transition-all focus-within:border-pink-200 focus-within:bg-white shadow-sm ${editingProduct.category === 'accessories' ? 'flex items-center justify-between' : ''}`}>
                                                <span className="text-xs font-black text-gray-400 block mb-1 uppercase tracking-widest">
                                                    {editingProduct.category === 'accessories' ? 'Free Size' : `Size ${s.size}`}
                                                </span>
                                                <input
                                                    type="number"
                                                    value={s.quantity}
                                                    onChange={(e) => {
                                                        const newSizeStock = [...(editingProduct.sizeStock || [])];
                                                        newSizeStock[idx] = { ...s, quantity: parseInt(e.target.value) || 0 };
                                                        setEditingProduct({ ...editingProduct, sizeStock: newSizeStock });
                                                    }}
                                                    className={`bg-transparent outline-none font-bold text-gray-900 ${editingProduct.category === 'accessories' ? 'text-2xl text-right w-32' : 'w-full text-lg'}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Multi-Archetype Selector */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                                        <Sparkles size={16} className="text-pink-500" />
                                        Style Archetypes (Select Multiple)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(dbArchetypes.length > 0 ? dbArchetypes : STYLES.map(s => ({ _id: s.id, name: s.label, emoji: s.icon }))).map(archetype => {
                                            const isSelected = (editingProduct.archetype || []).includes(archetype.name);
                                            return (
                                                <button
                                                    key={archetype._id}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentArchetypes = editingProduct.archetype || [];
                                                        const newArchetypes = isSelected
                                                            ? currentArchetypes.filter(a => a !== archetype.name)
                                                            : [...currentArchetypes, archetype.name];
                                                        setEditingProduct({ ...editingProduct, archetype: newArchetypes });
                                                    }}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${isSelected
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-gray-300'
                                                        }`}>
                                                        {isSelected && <Check size={14} className="text-purple-500" />}
                                                    </div>
                                                    <span>{archetype.emoji || '✨'}</span>
                                                    <span className="flex-1 text-left">{archetype.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Multi-Mood Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase flex items-center gap-2">
                                        <Sparkles size={16} className="text-pink-500" />
                                        Moods (Select Multiple)
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {MOODS.map(mood => {
                                            const isSelected = (editingProduct.mood || []).includes(mood.id);
                                            return (
                                                <button
                                                    key={mood.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentMoods = editingProduct.mood || [];
                                                        const newMoods = isSelected
                                                            ? currentMoods.filter(m => m !== mood.id)
                                                            : [...currentMoods, mood.id];
                                                        setEditingProduct({ ...editingProduct, mood: newMoods });
                                                    }}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${isSelected
                                                        ? `${mood.style} border-transparent shadow-lg scale-105`
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}>
                                                        {isSelected && <Check size={12} className="text-gray-700" />}
                                                    </div>
                                                    <span>{mood.icon}</span>
                                                    <span>{mood.name}</span>
                                                </button>
                                            );
                                        })}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add custom mood..."
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = e.target.value.trim().toLowerCase();
                                                        if (val && !(editingProduct.mood || []).includes(val)) {
                                                            setEditingProduct(prev => ({ ...prev, mood: [...(prev.mood || []), val] }));
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                                className="px-4 py-2.5 rounded-xl border-2 border-dashed border-pink-200 text-sm font-bold bg-pink-50/30 focus:border-pink-400 focus:bg-white focus:border-solid outline-none transition-all placeholder:text-pink-300 w-56 shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    {/* Display selected custom moods in Edit */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {(editingProduct.mood || []).filter(m => !MOODS.find(def => def.id === m)).map(m => (
                                            <span key={m} className="px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 rounded-xl text-xs font-black flex items-center gap-2 border border-pink-100 shadow-sm hover:shadow-md transition-all group">
                                                <Sparkles size={10} className="text-pink-400" />
                                                {m}
                                                <X
                                                    size={14}
                                                    className="cursor-pointer hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                                                    onClick={() => setEditingProduct(prev => ({ ...prev, mood: prev.mood.filter(item => item !== m) }))}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Multi-Occasion Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase flex items-center gap-2">
                                        <Calendar size={16} className="text-pink-500" />
                                        Occasions (Select Multiple)
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {OCCASIONS.map(occasion => {
                                            const isSelected = (editingProduct.occasion || []).includes(occasion.name);
                                            return (
                                                <button
                                                    key={occasion.name}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentOccasions = editingProduct.occasion || [];
                                                        const newOccasions = isSelected
                                                            ? currentOccasions.filter(o => o !== occasion.name)
                                                            : [...currentOccasions, occasion.name];
                                                        setEditingProduct({ ...editingProduct, occasion: newOccasions });
                                                    }}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${isSelected
                                                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg scale-105'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}>
                                                        {isSelected && <Check size={12} className="text-pink-500" />}
                                                    </div>
                                                    <span>{occasion.icon}</span>
                                                    <span>{occasion.name}</span>
                                                </button>
                                            );
                                        })}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add custom occasion..."
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = e.target.value.trim();
                                                        if (val && !(editingProduct.occasion || []).includes(val)) {
                                                            setEditingProduct(prev => ({ ...prev, occasion: [...(prev.occasion || []), val] }));
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                                className="px-4 py-2.5 rounded-xl border-2 border-dashed border-pink-200 text-sm font-bold bg-pink-50/30 focus:border-pink-400 focus:bg-white focus:border-solid outline-none transition-all placeholder:text-pink-300 w-56 shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    {/* Display selected custom occasions in Edit */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {(editingProduct.occasion || []).filter(o => !OCCASIONS.find(def => def.name === o)).map(o => (
                                            <span key={o} className="px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 rounded-xl text-xs font-black flex items-center gap-2 border border-pink-100 shadow-sm hover:shadow-md transition-all group">
                                                <Calendar size={10} className="text-pink-400" />
                                                {o}
                                                <X
                                                    size={14}
                                                    className="cursor-pointer hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                                                    onClick={() => setEditingProduct(prev => ({ ...prev, occasion: prev.occasion.filter(item => item !== o) }))}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Enhanced Publish Status Toggle */}
                                <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl p-6 border-2 border-green-200 shadow-lg overflow-hidden">
                                    {/* Animated background effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-r transition-opacity duration-500 ${editingProduct.isPublished ? 'from-green-400/10 to-emerald-400/10 opacity-100' : 'opacity-0'}`}></div>

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="font-black text-gray-900 text-xl">Publish Status</p>
                                                {editingProduct.isPublished ? (
                                                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-black rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                                                        <Check size={12} /> Live
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-black rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                                                        <X size={12} /> Draft
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 font-semibold flex items-center gap-2">
                                                {editingProduct.isPublished ? (
                                                    <>
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                        Visible to customers in the store
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                        Hidden from customers (draft mode)
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        {/* Enhanced Toggle Button */}
                                        <button
                                            type="button"
                                            onClick={() => setEditingProduct(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                                            className={`relative w-20 h-10 rounded-full transition-all duration-500 shadow-xl transform hover:scale-105 ${editingProduct.isPublished
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-300'
                                                : 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-gray-300'
                                                }`}
                                        >
                                            {/* Glow effect */}
                                            <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-500 ${editingProduct.isPublished ? 'bg-green-400 opacity-50' : 'opacity-0'
                                                }`}></div>

                                            {/* Toggle knob */}
                                            <div className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center transform ${editingProduct.isPublished ? 'left-11 rotate-180' : 'left-1 rotate-0'
                                                }`}>
                                                {editingProduct.isPublished ? (
                                                    <Check size={16} className="text-green-600 font-bold" strokeWidth={3} />
                                                ) : (
                                                    <X size={16} className="text-gray-500" strokeWidth={3} />
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <ColorVariationEditor
                                        variations={editingProduct.colorVariations || []}
                                        setVariations={(v) => {
                                            setEditingProduct(prev => {
                                                const currentVariations = prev.colorVariations || [];
                                                const newVariations = typeof v === 'function' ? v(currentVariations) : v;
                                                return { ...prev, colorVariations: newVariations };
                                            });
                                        }}
                                        onUploadingChange={setIsImageUploading}
                                        productName={editingProduct.name}
                                        category={editingProduct.category}
                                    />
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                            <Users size={20} className="text-pink-500" />
                                            Vendor Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sold By</label>
                                                <input
                                                    type="text"
                                                    value={editingProduct.vendorDetails?.soldBy || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, vendorDetails: { ...editingProduct.vendorDetails, soldBy: e.target.value } })}
                                                    placeholder="ChicPlay Fashion"
                                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manufacturer Name</label>
                                                <input
                                                    type="text"
                                                    value={editingProduct.vendorDetails?.manufacturerName || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, vendorDetails: { ...editingProduct.vendorDetails, manufacturerName: e.target.value } })}
                                                    placeholder="Enter manufacturer"
                                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manufacturer Address</label>
                                                <textarea
                                                    value={editingProduct.vendorDetails?.manufacturerAddress || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, vendorDetails: { ...editingProduct.vendorDetails, manufacturerAddress: e.target.value } })}
                                                    placeholder="Enter full address"
                                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-bold text-sm h-24 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <SpecificationsEditor
                                        specifications={editingProduct.specifications || []}
                                        onChange={(specs) => setEditingProduct(prev => ({ ...prev, specifications: specs }))}
                                    />
                                </div>

                                <button
                                    onClick={handleUpdateProduct}
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
                                    {isSubmitting ? "Updating..." : "Save Product Changes"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >
        </div >
    );
};

export default AdminDashboard;
