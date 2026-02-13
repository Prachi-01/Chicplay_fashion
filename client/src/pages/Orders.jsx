import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Truck, CheckCircle, Clock, ChevronRight,
    ChevronDown, MapPin, Receipt, Calendar, ShoppingBag,
    Star, ArrowRight, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import './Dresses.css'; // Reuse some themes

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            toast.error('Failed to load your order history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status) => {
        const steps = ['pending', 'processing', 'shipped', 'delivered'];
        return steps.indexOf(status);
    };

    const OrderStatusTracker = ({ status }) => {
        const currentStep = getStatusStep(status);
        const steps = [
            { id: 'pending', label: 'Order Placed', icon: Clock },
            { id: 'processing', label: 'Processing', icon: Package },
            { id: 'shipped', label: 'On the Way', icon: Truck },
            { id: 'delivered', label: 'Delivered', icon: CheckCircle },
        ];

        return (
            <div className="py-8 px-4">
                <div className="relative flex justify-between">
                    {/* Progress Bar Background */}
                    <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-10" />
                    {/* Active Progress Bar */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-rosegold to-mocha -z-10"
                    />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index <= currentStep;
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: isActive ? '#8B735B' : '#F3F4F6',
                                        color: isActive ? '#FFFFFF' : '#9CA3AF',
                                        scale: index === currentStep ? 1.2 : 1
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <Icon size={20} />
                                </motion.div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-mocha' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream/30">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-12 h-12 border-4 border-rosegold border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-cream/20 to-white py-20 px-[5%]">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-mocha mb-2 italic">My Fashion Odyssey</h1>
                    <p className="text-mocha/60 font-medium">Tracking your style acquisitions and rewards.</p>
                </header>

                {orders.length === 0 ? (
                    <div className="text-center py-32 bg-white/50 backdrop-blur-xl rounded-[40px] border-2 border-dashed border-mocha/10">
                        <ShoppingBag className="mx-auto mb-6 text-mocha/20" size={64} />
                        <h2 className="text-2xl font-black text-mocha mb-4">Your Wardrobe Awaits</h2>
                        <p className="text-mocha/50 mb-8 max-w-md mx-auto">You haven't placed any orders yet. Start your journey by exploring our latest collection.</p>
                        <Link to="/shop" className="bg-mocha text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-mocha/20 inline-flex items-center gap-2 hover:bg-black transition-all">
                            SHOP NOW <ArrowRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                layout
                                className="bg-white rounded-[32px] shadow-sm border border-mocha/5 overflow-hidden"
                            >
                                {/* Order Header */}
                                <div
                                    className="p-8 cursor-pointer hover:bg-cream/10 transition-colors"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center text-mocha">
                                                <Receipt size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-mocha">Order #{order.id.split('-')[0].toUpperCase()}</h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-mocha/40 uppercase tracking-widest mt-1">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                    <span>•</span>
                                                    <span className="text-rosegold">₹{order.totalAmount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-amber-100 text-amber-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={18} className="text-mocha" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedOrder === order.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-mocha/5"
                                        >
                                            <div className="p-8 space-y-8">
                                                {/* Tracking Section */}
                                                <div className="bg-cream/20 rounded-[24px] p-6 border border-mocha/5">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h4 className="text-xs font-black text-mocha uppercase tracking-widest flex items-center gap-2">
                                                            <Truck size={14} className="text-rosegold" /> Delivery Journey
                                                        </h4>
                                                        {order.trackingNumber && (
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-mocha/40">
                                                                TRACKING: <span className="text-mocha select-all">{order.trackingNumber}</span>
                                                                <button onClick={() => {
                                                                    navigator.clipboard.writeText(order.trackingNumber);
                                                                    toast.success('Tracking number copied!');
                                                                }}>
                                                                    <ExternalLink size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <OrderStatusTracker status={order.status} />

                                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping To</p>
                                                            <div className="flex items-start gap-2 font-medium text-mocha">
                                                                <MapPin size={16} className="mt-0.5 text-rosegold" />
                                                                <p>{order.shippingAddress}</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Arrival</p>
                                                            <div className="flex items-start gap-2 font-medium text-mocha">
                                                                <Clock size={16} className="mt-0.5 text-rosegold" />
                                                                <p>{new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Items List */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-black text-mocha uppercase tracking-widest px-1">Items in this Package</h4>
                                                    <div className="space-y-3">
                                                        {order.OrderItems?.map((item) => (
                                                            <div key={item.id} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl group hover:bg-gray-50 transition-colors">
                                                                <div className="w-20 h-24 rounded-lg overflow-hidden bg-white border border-mocha/5">
                                                                    <img
                                                                        src={item.imageUrl}
                                                                        alt={item.productName}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => e.target.src = '/placeholder-dress.jpg'}
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Link to={`/products/${item.productId}`} className="text-sm font-black text-mocha hover:text-rosegold transition-colors">
                                                                        {item.productName}
                                                                    </Link>
                                                                    <p className="text-[10px] font-bold text-mocha/40 uppercase mt-1">
                                                                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                                                    </p>
                                                                    <p className="text-xs font-black text-mocha mt-2">₹{item.price}</p>
                                                                </div>
                                                                {order.status === 'delivered' && (
                                                                    <Link
                                                                        to={`/products/${item.productId}`}
                                                                        className="opacity-0 group-hover:opacity-100 bg-white text-mocha text-[10px] font-black px-4 py-2 rounded-xl border border-mocha/10 shadow-sm transition-all"
                                                                    >
                                                                        WRITE REVIEW
                                                                    </Link>
                                                                )}
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
