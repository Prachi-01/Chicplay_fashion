import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, User, ArrowRight, Share2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BlogPage.css';

const blogPosts = [
    {
        id: 1,
        title: "The Future of Fashion: Where Gaming Meets Glamour",
        excerpt: "Discover how ChicPlay is rewriting the rules of retail by blending immersive gaming experiences with high-end fashion. Shopping is no longer just a transaction; it's an adventure.",
        author: "Prachi Sharma",
        date: "Feb 15, 2026",
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800",
        tag: "Innovation"
    },
    {
        id: 2,
        title: "5 Must-Have Archetypes for Your 2026 Capsule Wardrobe",
        excerpt: "From the refined Minimalist to the edgy Street Stylist, we break down the key looks that will define the upcoming season. Which one are you?",
        author: "Sneha Kapoor",
        date: "Feb 12, 2026",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
        tag: "Style Guide"
    },
    {
        id: 3,
        title: "Sustainable Chic: Look Good while Doing Good",
        excerpt: "At ChicPlay, we believe fashion should be beautiful for the planet too. Explore our latest eco-friendly collection and learn how to shop consciously without sacrificing style.",
        author: "Rahul Varma",
        date: "Feb 10, 2026",
        image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800",
        tag: "Sustainability"
    }
];

const BlogPage = () => {
    return (
        <div className="blog-page min-h-screen bg-cream pb-20">
            {/* Blog Hero */}
            <header className="blog-header bg-white py-24 border-b border-blush/20">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 text-rosegold font-bold mb-6 bg-pink-50 px-6 py-2 rounded-full"
                    >
                        <BookOpen size={18} />
                        <span>CHICPLAY JOURNAL</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl font-black text-mocha mb-6 leading-tight"
                    >
                        Fashion, Community, <br /> & Future-Ready Style
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-500 max-w-3xl mx-auto"
                    >
                        Welcome to the ChicPlay Blog. Here, we dive deep into the trends, the technology, and the people behind the most exciting fashion destination in the digital age.
                    </motion.p>
                </div>
            </header>

            <div className="container mx-auto px-6 mt-16">
                {/* Featured Post */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="featured-post-card bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row mb-20 border border-blush/20"
                >
                    <div className="featured-image flex-1 h-[500px]">
                        <img
                            src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200"
                            alt="Featured Post"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="featured-content flex-1 p-16 flex flex-col justify-center">
                        <span className="text-rosegold font-black uppercase tracking-widest text-sm mb-4">Must Read</span>
                        <h2 className="text-4xl font-black text-mocha mb-6 leading-tight hover:text-rosegold transition-colors cursor-pointer">
                            Beyond Shopping: How ChicPlay is Revolutionizing the Fashion Industry
                        </h2>
                        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                            ChicPlay Fashion is more than just a store—it's a community where gaming and fashion collide. We're proud to offer an immersive shopping experience that rewards your creativity and style. In this article, we explore how our 3D mannequin technology and interactive style challenges are setting a new standard for online shopping.
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-mocha rounded-full flex items-center justify-center text-white font-bold">CP</div>
                                <div>
                                    <p className="font-bold text-mocha">ChicPlay Editorial</p>
                                    <p className="text-xs text-gray-400">Feb 18, 2026 • 10 min read</p>
                                </div>
                            </div>
                            <button className="bg-mocha text-white px-8 py-3 rounded-full font-bold hover:bg-rosegold transition-all">Read More</button>
                        </div>
                    </div>
                </motion.div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {blogPosts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="blog-card bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-blush/20 group cursor-pointer"
                        >
                            <div className="blog-image h-64 overflow-hidden relative">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-6 left-6">
                                    <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-black text-mocha">
                                        {post.tag}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 font-bold">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                                    <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                                </div>
                                <h3 className="text-2xl font-black text-mocha mb-4 group-hover:text-rosegold transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-500 mb-8 line-clamp-3 leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-dashed border-gray-100">
                                    <div className="flex gap-4">
                                        <Share2 size={18} className="text-gray-300 hover:text-rosegold transition-colors" />
                                        <MessageCircle size={18} className="text-gray-300 hover:text-rosegold transition-colors" />
                                    </div>
                                    <button className="text-mocha font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                                        Read Now <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* Newsletter Box */}
                <div className="mt-32 bg-rosegold rounded-[4rem] p-20 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 animate-pulse"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-5xl font-black mb-8">Ready to evolve your style?</h2>
                        <p className="text-xl opacity-90 mb-12">Subscribe to our weekly newsletter for exclusive early access to drops, trend reports, and special gaming rewards.</p>
                        <div className="flex flex-col sm:flex-row gap-4 bg-white/10 p-2 rounded-[2rem] backdrop-blur-md">
                            <input
                                type="email"
                                placeholder="style.seeker@chicplay.com"
                                className="flex-1 bg-transparent border-none px-6 py-4 text-white placeholder-white/50 outline-none font-bold"
                            />
                            <button className="bg-white text-rosegold px-10 py-4 rounded-[1.5rem] font-black hover:bg-mocha hover:text-white transition-all transform hover:scale-105">
                                SUBSCRIBE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
