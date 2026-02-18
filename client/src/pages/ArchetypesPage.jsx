import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './ArchetypesPage.css';

const archetypesList = [
    {
        id: 'minimalist',
        name: 'The Minimalist',
        description: 'Clean lines, neutral colors, and timeless silhouettes. Less is always more.',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
        color: '#f3f4f6',
        textColor: '#1f2937'
    },
    {
        id: 'bohemian',
        name: 'The Bohemian',
        description: 'Free-spirited, artistic, and effortless. Think flowy fabrics and earthy textures.',
        image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=800',
        color: '#fdf2f2',
        textColor: '#9b1c1c'
    },
    {
        id: 'streetwear',
        name: 'The Street Stylist',
        description: 'Bold, urban, and always on trend. Graphic tees, sneakers, and attitude.',
        image: 'https://images.unsplash.com/photo-1523398363246-239656375ca0?auto=format&fit=crop&q=80&w=800',
        color: '#eff6ff',
        textColor: '#1e40af'
    },
    {
        id: 'aesthetic',
        name: 'The Aesthetic',
        description: 'Uniquely you. A mix of retro vibes, pastel colors, and artistic expression.',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
        color: '#f5f3ff',
        textColor: '#5b21b6'
    },
    {
        id: 'formal',
        name: 'The Professional',
        description: 'Sharp, polished, and powerful. Tailored suits and sophisticated elegance.',
        image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&q=80&w=800',
        color: '#f9fafb',
        textColor: '#111827'
    },
    {
        id: 'grunge',
        name: 'The Grunge',
        description: 'Edgy, rebellious, and raw. Flannels, leather, and a touch of rock n roll.',
        image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800',
        color: '#111827',
        textColor: '#ffffff'
    }
];

const ArchetypesPage = () => {
    const [selectedArchetype, setSelectedArchetype] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedArchetype) {
            fetchArchetypeProducts();
        }
    }, [selectedArchetype]);

    const fetchArchetypeProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            // Mock filtering: in a real app, you'd filter by archetype field in DB
            const filtered = res.data.filter(p =>
                p.archetype?.toLowerCase() === selectedArchetype.id ||
                p.category?.toLowerCase().includes(selectedArchetype.id) ||
                p.name?.toLowerCase().includes(selectedArchetype.id) ||
                p.tags?.some(tag => tag.toLowerCase() === selectedArchetype.id)
            );
            setProducts(filtered.length > 0 ? filtered : res.data.slice(0, 4));
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="archetypes-page min-h-screen bg-cream pb-20">
            {/* Header */}
            <div className="archetypes-hero bg-mocha text-white py-20 px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-black mb-4"
                >
                    Find Your Fashion Identity
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-300 max-w-2xl mx-auto"
                >
                    Explore our curated fashion archetypes and discover the styles that resonate with your soul.
                </motion.p>
            </div>

            <div className="container mx-auto px-6 mt-12">
                {!selectedArchetype ? (
                    <div className="archetype-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {archetypesList.map((archetype, index) => (
                            <motion.div
                                key={archetype.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                onClick={() => setSelectedArchetype(archetype)}
                                className="archetype-card cursor-pointer group bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-blush/20"
                            >
                                <div className="archetype-image-h w-full h-80 overflow-hidden relative">
                                    <img src={archetype.image} alt={archetype.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <h3 className="text-3xl font-black">{archetype.name}</h3>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <p className="text-mocha/70 leading-relaxed mb-6">{archetype.description}</p>
                                    <button className="text-rosegold font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                        Explore Collection <Sparkles size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="archetype-details-view"
                    >
                        <button
                            onClick={() => setSelectedArchetype(null)}
                            className="mb-8 flex items-center gap-2 text-mocha hover:text-rosegold font-bold transition-colors"
                        >
                            <X size={20} /> Back to Archetypes
                        </button>

                        <div
                            className="archetype-banner p-12 rounded-[3rem] mb-12 flex flex-col md:flex-row items-center gap-8 shadow-xl"
                            style={{ backgroundColor: selectedArchetype.color, color: selectedArchetype.textColor }}
                        >
                            <div className="banner-text flex-1">
                                <h2 className="text-5xl font-black mb-4">{selectedArchetype.name}</h2>
                                <p className="text-xl max-w-xl opacity-80">{selectedArchetype.description}</p>
                            </div>
                            <div className="banner-image w-64 h-64 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                                <img src={selectedArchetype.image} alt={selectedArchetype.name} className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div className="products-section">
                            <h3 className="text-3xl font-bold text-mocha mb-8">Curated for you</h3>
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                        <Sparkles className="text-rosegold" size={48} />
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {products.map((product, index) => (
                                        <motion.div
                                            key={product._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="product-card-premium bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-blush/20 group"
                                        >
                                            <div className="h-80 relative overflow-hidden bg-gray-50">
                                                <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform">
                                                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-pink-500 shadow-md">
                                                        <Heart size={20} />
                                                    </button>
                                                    <Link to={`/products/${product._id}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 shadow-md">
                                                        <Eye size={20} />
                                                    </Link>
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    <button className="w-full bg-rosegold text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                                        <ShoppingBag size={18} /> Add to Bag
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h4 className="font-bold text-mocha text-lg truncate mb-1">{product.name}</h4>
                                                <p className="text-rosegold font-black text-xl">₹{product.price}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ArchetypesPage;
