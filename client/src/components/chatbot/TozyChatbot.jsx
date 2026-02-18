import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Search, Truck, HelpCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import './TozyChatbot.css';

const TozyChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'tozy', text: "Hey Style Seeker! 💅 I'm Tozy, your personal AI fashion bestie. Want to find something fire, track an order, or just need some styling tea? I got you! ✨", actions: ['Styling Tips', 'Track Order', 'Return Process', 'Trending Now'] }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [userOrders, setUserOrders] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            fetchUserOrders();
        }

        const handleOpenTozy = () => setIsOpen(true);
        window.addEventListener('openTozy', handleOpenTozy);
        return () => window.removeEventListener('openTozy', handleOpenTozy);
    }, [messages, isOpen]);

    const fetchUserOrders = async () => {
        try {
            const res = await api.get('/orders');
            setUserOrders(res.data);
        } catch (err) {
            console.error("Couldn't fetch orders for Tozy:", err);
        }
    };

    const handleSend = async (text) => {
        if (!text.trim()) return;

        const newUserMessage = { id: Date.now(), type: 'user', text };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulation of AI processing
        setTimeout(() => {
            processMessage(text.toLowerCase());
            setIsTyping(false);
        }, 1000);
    };

    const processMessage = async (query) => {
        let response = { id: Date.now(), type: 'tozy', text: '' };

        // 1. Order Tracking / Delivery Logic (Priority)
        if (query.includes('track') || query.includes('order status') || query.includes('where is my') || query.includes('delivered') || query.includes('when') || query.includes('bought') || query.includes('history')) {
            if (userOrders.length > 0) {
                const latestOrder = userOrders[0];
                const estDate = new Date(latestOrder.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
                const itemNames = latestOrder.OrderItems?.map(i => i.productName).join(', ');

                if (query.includes('delivered') || query.includes('when')) {
                    response.text = `Your latest order (#${latestOrder.id.split('-')[0]}) is currently ${latestOrder.status.toUpperCase()}! 🚚 It's estimated to arrive by ${estDate}. Excited for you!`;
                } else if (query.includes('bought') || query.includes('history') || query.includes('what')) {
                    response.text = `In your last haul, you grabbed: ${itemNames}. Total was ₹${latestOrder.totalAmount}. The status is ${latestOrder.status.toUpperCase()} right now! ✨`;
                } else {
                    response.text = `I found your latest haul! Order #${latestOrder.id.split('-')[0]} is ${latestOrder.status}. It's heading to ${latestOrder.shippingAddress.split(',')[0]} and should be there by ${estDate}.`;
                }

                response.actions = ['Return Process', 'View All Orders'];
            } else {
                response.text = "I don't see any orders in your history yet! 🛍️ Maybe it's time for a little retail therapy? Want to see what's trending?";
                response.actions = ['Trending Now', 'Shop All'];
            }
        }

        // 2. Search / Product Logic
        else if (query.includes('dress') || query.includes('top') || query.includes('under') || query.includes('find') || query.includes('show me')) {
            try {
                const res = await api.get('/products');
                const products = res.data.filter(p => p.isPublished);

                // Simple keyword matching for demo
                let filtered = products;
                if (query.includes('black')) filtered = filtered.filter(p => p.color?.toLowerCase() === 'black');
                if (query.includes('under')) {
                    const priceMatch = query.match(/under (\d+)/);
                    if (priceMatch) filtered = filtered.filter(p => p.price <= parseInt(priceMatch[1]));
                }

                if (filtered.length > 0) {
                    response.text = `Found some absolute gems for you! Check these out:`;
                    response.products = filtered.slice(0, 3);
                } else {
                    response.text = "I couldn't find exactly that, but our new collection just dropped and it's 10/10! Want to see the overall trending items?";
                    response.actions = ['Trending Now', 'New Arrivals'];
                }
            } catch (err) {
                response.text = "My style sensors are a bit glitchy right now, but you can explore our full collection in the Shop! 🛍️";
            }
        }

        // 3. Return / Policy Logic
        else if (query.includes('return') || query.includes('refund') || query.includes('exchange')) {
            response.text = "Returns are easy-peasy! ☁️ You have 30 days to return any unworn items. Just head to your profile -> orders and click 'Initiate Return'. Need me to explain the steps?";
            response.actions = ['Return Steps', 'Refund Policy'];
        }

        // 4. Trending / Styling Tips
        else if (query.includes('trend') || query.includes('style') || query.includes('tips') || query.includes('wear')) {
            response.text = "The vibe right now is 'Quiet Luxury' meets 'Eclectic Grandpa'. 🧥 Think oversized blazers with baggy denims. Want to see some curated looks?";
            response.actions = ['Show Outfits', 'Color Guide'];
        }

        // 5. Vendor Support
        else if (query.includes('vendor') || query.includes('sell') || query.includes('upload')) {
            response.text = "Love that boss energy! 💅 For vendors, make sure your photos are high-res and you've added the size stock. Your products go to 'Pending' first for our admin to approve. Anything specific you need help with?";
            response.actions = ['Upload Guide', 'Check Status'];
        }

        // Fallback
        else {
            response.text = "I'm still learning the fashion ropes! 🧵 Could you try asking about 'Order Tracking', 'Returns', or show me some 'Style Tips'?";
            response.actions = ['Help Menu', 'Talk to Human'];
        }

        setMessages(prev => [...prev, response]);
    };

    const handleAction = (action) => {
        handleSend(action);
    };

    return (
        <div className="tozy-container">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="tozy-window"
                    >
                        <div className="tozy-header">
                            <div className="tozy-header-profile">
                                <div className="tozy-avatar">💁‍♀️</div>
                                <div className="tozy-header-info">
                                    <h3>Tozy AI</h3>
                                    <p>Online & Stylish</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="tozy-close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="tozy-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className="message-wrapper">
                                    <div className={`message ${msg.type}`}>
                                        {msg.text}
                                        {msg.products && (
                                            <div className="chat-products mt-3 space-y-3">
                                                {msg.products.map(p => (
                                                    <div key={p._id} className="chat-product-card">
                                                        <img src={p.images?.[0]} className="chat-product-img" alt={p.name} />
                                                        <div className="chat-product-info">
                                                            <h5>{p.name}</h5>
                                                            <p>₹{p.price}</p>
                                                            <a href={`/products/${p._id}`} className="chat-product-link">
                                                                View <ArrowRight size={10} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {msg.actions && (
                                        <div className="tozy-actions">
                                            {msg.actions.map(action => (
                                                <button
                                                    key={action}
                                                    className="action-btn"
                                                    onClick={() => handleAction(action)}
                                                >
                                                    {action}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message tozy text-xs italic animate-pulse">
                                    Tozy is thinking... ✨
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form
                            className="tozy-input-area"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend(inputValue);
                            }}
                        >
                            <div className="tozy-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Ask about trends, orders, or tips..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                <button type="submit" className="tozy-send-btn" disabled={!inputValue.trim()}>
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="tozy-fab"
                        onClick={() => setIsOpen(true)}
                    >
                        <div className="tozy-fab-pulse" />
                        <MessageSquare size={28} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TozyChatbot;
