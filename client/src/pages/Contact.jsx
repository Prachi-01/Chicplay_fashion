import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare, Mail, Phone, Instagram, Send, Truck,
    HelpCircle, Handshake, Briefcase, MapPin,
    Clock, ShieldCheck, ChevronRight, Globe, Sparkles,
    CheckCircle2, Plus, Info
} from 'lucide-react';
import api from '../services/api'; // API client for backend communication
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        orderNumber: '',
        subject: 'General Question',
        message: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/contact', formData);
            if (res.status === 200) {
                setIsSubmitted(true);
                setFormData({
                    name: '',
                    email: '',
                    orderNumber: '',
                    subject: 'General Question',
                    message: ''
                });
                setTimeout(() => setIsSubmitted(false), 5000);
            }
        } catch (error) {
            console.error("Form Submission Error:", error);
            alert("Something went wrong. Please try again later.");
        }
    };

    const openTozy = () => {
        // Dispatch custom event to open Tozy chatbot
        window.dispatchEvent(new CustomEvent('openTozy'));
    };

    return (
        <div className="contact-page">
            {/* 1. HERO SECTION */}
            <section className="contact-hero">
                <div className="hero-glow" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                >
                    <p className="text-pink-400 font-black uppercase tracking-[0.3em] mb-4">Support Center</p>
                    <h1>WE'RE HERE <br /> TO HELP!</h1>
                    <p>Got questions? Need style advice? Having issues? Our fashion support team is ready to assist you. ✨</p>
                    <div className="hero-actions">
                        <button onClick={openTozy} className="hero-btn primary">
                            <MessageSquare className="w-5 h-5" /> Live Chat
                        </button>
                        <a href="#contact-form" className="hero-btn outline">
                            <Mail className="w-5 h-5" /> Send Email
                        </a>
                        <a href={`tel:${import.meta.env.VITE_CONTACT_PHONE}`} className="hero-btn outline">
                            <Phone className="w-5 h-5" /> Call Us
                        </a>
                    </div>
                </motion.div>
            </section>

            <div className="contact-grid">
                {/* 2. CONTACT METHODS */}
                <section className="contact-card card-methods">
                    <div className="methods-grid">
                        {/* Option A: Live Chat */}
                        <div className="method-item chat">
                            <div className="method-icon"><MessageSquare className="text-green-500" /></div>
                            <div className="status-badge">
                                <span className="status-dot" /> 5 style advisors online
                            </div>
                            <h3>LIVE CHAT</h3>
                            <p>Talk to our style assistants in real-time. Under 2 min response.</p>
                            <button onClick={openTozy} className="method-btn bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-100 uppercase font-black text-[10px] tracking-widest">
                                Start Chat Now
                            </button>
                        </div>

                        {/* Option B: Email Support */}
                        <div className="method-item email">
                            <div className="method-icon"><Mail className="text-rose-500" /></div>
                            <h3>EMAIL US</h3>
                            <p>Detailed questions or order issues. Within 4 hour response.</p>
                            <div className="space-y-2 mt-4">
                                <p className="text-[10px] font-black uppercase text-gray-400 m-0">Direct Channels</p>
                                <div className="text-[11px] font-bold text-rose-500">{import.meta.env.VITE_CONTACT_EMAIL}</div>
                                <div className="text-[11px] font-bold text-rose-500">stylist@chicplay.com</div>
                            </div>
                        </div>

                        {/* Option C: Phone Support */}
                        <div className="method-item phone">
                            <div className="method-icon"><Phone className="text-blue-500" /></div>
                            <h3>CALL US</h3>
                            <p>Toll-free: {import.meta.env.VITE_CONTACT_PHONE}. Mon-Fri, 9AM-9PM EST.</p>
                            <button className="method-btn bg-blue-500 text-white mt-4 uppercase font-black text-[10px] tracking-widest">
                                Request Call Back
                            </button>
                        </div>

                        {/* Option D: Social Media */}
                        <div className="method-item social">
                            <div className="method-icon"><Instagram className="text-pink-500" /></div>
                            <h3>CONNECT</h3>
                            <p>Message us on your favorite platform. @ChicPlayStyle</p>
                            <div className="flex gap-3 mt-4">
                                <a href={import.meta.env.VITE_CONTACT_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white rounded-full text-[10px] font-black hover:bg-pink-50 transition-colors">INSTAGRAM</a>
                                <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black">TIKTOK</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. CONTACT FORM */}
                <section id="contact-form" className="contact-card card-form">
                    <div className="section-header">
                        <div className="section-title">
                            <div className="section-icon"><Send size={20} /></div>
                            <h2>SEND US A MESSAGE</h2>
                        </div>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Jane Doe"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="jane@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Order Number (Optional)</label>
                            <input
                                type="text"
                                name="orderNumber"
                                placeholder="#CHIC-12345"
                                value={formData.orderNumber}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Subject</label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                            >
                                <option>General Question</option>
                                <option>Order Status</option>
                                <option>Return/Exchange</option>
                                <option>Product Question</option>
                                <option>Style Advice</option>
                            </select>
                        </div>
                        <div className="form-group full">
                            <label>Message *</label>
                            <textarea
                                name="message"
                                rows="5"
                                required
                                placeholder="How can we help?"
                                value={formData.message}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button type="submit" className="submit-btn">
                            {isSubmitted ? (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 size={18} /> MESSAGE SENT!
                                </span>
                            ) : "SEND MESSAGE"}
                        </button>
                    </form>
                </section>

                {/* 10. TRUST & HOURS */}
                <section className="contact-card card-hours">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="text-rose-500" size={24} />
                                <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Support Hours</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold">Live Chat</span>
                                    <span className="font-black text-green-500 uppercase">24/7 Available</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold">Email</span>
                                    <span className="font-black text-rose-500 uppercase">&lt; 4 Hours</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold">Phone Support</span>
                                    <span className="text-gray-500">9AM - 9PM EST</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="text-emerald-500" size={24} />
                                <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Our Guarantees</h3>
                            </div>
                            <ul className="space-y-3 text-[11px] font-bold text-gray-500">
                                <li className="flex items-center gap-2 italic">✓ 30-Day Returns – No questions asked</li>
                                <li className="flex items-center gap-2 italic">✓ Price Match Guarantee</li>
                                <li className="flex items-center gap-2 italic">✓ Secure 256-bit SSL Checkout</li>
                                <li className="flex items-center gap-2 italic">✓ Climate Neutral Shipping</li>
                            </ul>
                        </div>
                    </div>
                </section>


                {/* 11. SELF-SERVICE HUB */}
                <section className="contact-card card-service">
                    <div className="section-header">
                        <div className="section-title">
                            <div className="section-icon"><Plus size={20} /></div>
                            <h2>SELF-SERVICE HUB</h2>
                        </div>
                    </div>
                    <div className="service-hub-grid">
                        <div className="service-item"><i>🔍</i> <span>Track Order</span></div>
                        <div className="service-item"><i>↩️</i> <span>Start Return</span></div>
                        <div className="service-item"><i>📏</i> <span>Find Size</span></div>
                        <div className="service-item"><i>🎁</i> <span>Gift Cards</span></div>
                        <div className="service-item"><i>🔄</i> <span>Cancel Order</span></div>
                        <div className="service-item"><i>📄</i> <span>Invoices</span></div>
                    </div>
                </section>

                {/* 6. BUSINESS & PARTNERSHIP */}
                <section className="contact-card card-business">
                    <div className="section-header">
                        <div className="section-title">
                            <div className="section-icon"><Handshake size={20} /></div>
                            <h2>FOR BUSINESSES & CREATORS</h2>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-3xl">
                            <Briefcase className="text-gray-400 mt-1" size={20} />
                            <div>
                                <h4 className="font-black text-sm mb-1 uppercase tracking-tight">Become a Partner</h4>
                                <p className="text-[11px] font-bold text-gray-500">Wholesale, Affiliate program, Influencer partnerships.</p>
                            </div>
                        </div>
                        <div className="text-[11px] font-black text-rose-500 flex items-center justify-between">
                            <span>{import.meta.env.VITE_CONTACT_EMAIL}</span>
                            <button className="px-4 py-2 bg-rose-500 text-white rounded-xl uppercase tracking-widest">Apply Now</button>
                        </div>
                    </div>
                </section>

                {/* 8. PHYSICAL ADDRESS */}
                <section className="contact-card card-address">
                    <div className="section-header">
                        <div className="section-title">
                            <div className="section-icon"><MapPin size={20} /></div>
                            <h2>FLAGSHIP STORE</h2>
                        </div>
                    </div>
                    <div className="flex gap-6 items-center">
                        <div className="flex-1 space-y-4">
                            <p className="font-black text-sm uppercase">Fashion House NY</p>
                            <p className="text-xs font-bold text-gray-500 leading-relaxed">
                                123 Fashion Avenue, Suite 400<br />
                                New York, NY 10001
                            </p>
                            <button className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2 hover:underline">
                                <Globe size={14} /> Get Directions
                            </button>
                        </div>
                        <div className="w-32 h-32 bg-gray-100 rounded-[24px] overflow-hidden flex items-center justify-center text-gray-400 text-[10px] font-black italic">
                            Map Preview
                        </div>
                    </div>
                </section>

                {/* 12. FEEDBACK SECTION */}
                <section className="contact-card card-trust">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[22px] bg-yellow-400 flex items-center justify-center text-3xl">💡</div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">HELP US IMPROVE</h3>
                                <p className="text-sm font-bold text-gray-500">Love ChicPlay? Have ideas? We'd love to hear from you!</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-gray-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Share Feedback</button>
                            <button className="px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">Rate Us ⭐</button>
                        </div>
                    </div>
                </section>
            </div>

            {/* GAMIFICATION ELEMENT */}
            <div className="max-w-7xl mx-auto px-6 mt-12">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[40px] p-8 text-white flex items-center justify-between shadow-2xl overflow-hidden relative">
                    <Sparkles className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[22px] flex items-center justify-center text-3xl">🏆</div>
                        <div>
                            <h4 className="text-xl font-black uppercase tracking-tight">Support Achievement: Problem Solver</h4>
                            <p className="text-sm font-bold text-indigo-100 opacity-80">Get your issue resolved & earn +50 XP and an exclusive badge!</p>
                        </div>
                    </div>
                    <button className="relative z-10 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">View Goals</button>
                </div>
            </div>
        </div>
    );
};

export default Contact;
