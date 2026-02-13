import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, LogOut, Package, ShoppingBag, CreditCard, User, TrendingUp, Plus, Edit, Trash2, PieChart, Info, Home } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import VendorProductModal from '../components/modals/VendorProductModal';

const VendorDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, productsRes, ordersRes] = await Promise.all([
                api.get('/vendors/me'),
                api.get('/vendors/products'),
                api.get('/vendors/orders')
            ]);

            setVendor(profileRes.data);
            setProducts(productsRes.data);
            setOrders(ordersRes.data);

            if (profileRes.data.status !== 'Active') {
                navigate('/vendor/status');
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure? This will remove the product from the shop.")) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Product deleted");
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const openAddModal = () => {
        setSelectedProduct(null);
        setIsProductModalOpen(true);
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <Layout size={20} /> },
        { id: 'products', label: 'My Products', icon: <Package size={20} /> },
        { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
        { id: 'earnings', label: 'Earnings', icon: <CreditCard size={20} /> },
        { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    ];

    const [activeTab, setActiveTab] = useState('dashboard');

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Loading Store Console...</p>
        </div>
    );

    if (!vendor) return null;

    const totalEarnings = orders.reduce((acc, order) => acc + parseFloat((order.price || 0) * (order.quantity || 1)), 0);
    const totalOrders = orders.length;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 fixed h-full z-10 hidden md:block">
                <div className="p-8">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
                        Seller<span className="text-pink-500">Hub</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Console v2.0</p>
                </div>
                <nav className="px-4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === tab.id
                                ? 'bg-black text-white shadow-xl shadow-gray-200 translate-x-1'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}

                    <div className="pt-4 border-t border-gray-100 mt-4 px-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all"
                        >
                            <Home size={20} />
                            Back to Home
                        </button>
                    </div>

                    <div className="pt-8 px-4">
                        <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100">
                            <p className="text-[10px] font-black text-pink-500 uppercase mb-1">Support</p>
                            <p className="text-xs font-bold text-gray-600">Need help with your listings?</p>
                            <button className="mt-3 text-xs font-black text-pink-500 flex items-center gap-1 hover:gap-2 transition-all">
                                CONTACT US <Plus size={12} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-12"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 min-h-screen">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-black uppercase tracking-widest">Store Online</span>
                            <span className="text-xs text-gray-400 font-bold">• Refreshed just now</span>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Welcome, {vendor.ownerName}</h2>
                        <p className="text-gray-500 font-bold">{vendor.storeName} Dashboard</p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-pink-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-pink-100 hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> ADD NEW ITEM
                    </button>
                </header>

                <div className="max-w-6xl">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 group hover:border-green-200 transition-colors">
                                    <div className="bg-green-50 text-green-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><TrendingUp size={24} /></div>
                                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-2">Total Earnings</h3>
                                    <p className="text-4xl font-black text-gray-900">₹{totalEarnings.toLocaleString()}</p>
                                    <p className="text-xs text-green-600 font-bold mt-2">↑ 12% from last month</p>
                                </div>
                                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 group hover:border-blue-200 transition-colors">
                                    <div className="bg-blue-50 text-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><ShoppingBag size={24} /></div>
                                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-2">Total Orders</h3>
                                    <p className="text-4xl font-black text-gray-900">{totalOrders}</p>
                                    <p className="text-xs text-blue-600 font-bold mt-2">4 orders pending</p>
                                </div>
                                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 group hover:border-purple-200 transition-colors">
                                    <div className="bg-purple-50 text-purple-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Package size={24} /></div>
                                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-2">Active Products</h3>
                                    <p className="text-4xl font-black text-gray-900">{products.length}</p>
                                    <p className="text-xs text-purple-600 font-bold mt-2">2 out of stock</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <PieChart size={20} className="text-pink-500" /> Sales Analytics
                                    </h3>
                                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
                                        <p className="text-gray-400 font-bold text-sm">Visual analytics loading...</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-black text-gray-900 mb-6">Recent Activity</h3>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><Info size={16} /></div>
                                                <div>
                                                    <p className="font-bold text-sm">New order received for Midnight Dress</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">2 hours ago</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Catalogue Management</h3>
                                    <p className="text-sm font-bold text-gray-400">{products.length} Items total</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-100 transition">Filter</button>
                                    <button className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-100 transition">Sort</button>
                                </div>
                            </div>

                            {products.length === 0 ? (
                                <div className="bg-white rounded-[40px] p-20 shadow-sm text-center border-2 border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><Package size={40} className="text-gray-200" /></div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">No items listed yet</h3>
                                    <p className="text-gray-400 font-medium mb-8">Start selling your designs to the ChicPlay community.</p>
                                    <button onClick={openAddModal} className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl">List My First Item</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {products.map(product => (
                                        <div key={product._id} className="bg-white rounded-[32px] p-4 shadow-sm border border-gray-100 group">
                                            <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] mb-4">
                                                <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    <button onClick={() => openEditModal(product)} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-lg hover:bg-black hover:text-white transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-75"><Trash2 size={18} /></button>
                                                </div>
                                                {!product.isPublished && (
                                                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px]">
                                                        <span className="px-4 py-2 bg-black text-white font-black text-xs rounded-full">DRAFT MODE</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex flex-col">
                                                        <h4 className="font-black text-gray-900 line-clamp-1">{product.name}</h4>
                                                        <div className="flex gap-1 mt-0.5">
                                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${product.status === 'approved' ? 'bg-green-100 text-green-600' :
                                                                product.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                                    'bg-blue-100 text-blue-600'
                                                                }`}>
                                                                {product.status || 'pending'}
                                                            </span>
                                                        </div>
                                                        {product.status === 'rejected' && product.approvalComments && (
                                                            <div className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 p-1 rounded leading-tight">
                                                                Rejection: {product.approvalComments}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="font-black text-pink-500">₹{product.price}</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category}</p>
                                                    <div className="flex items-center gap-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <span className="text-[10px] font-bold text-gray-500">{product.stock} in stock</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex justify-between items-center">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Purchase Orders</h3>
                                <div className="p-2 bg-gray-50 rounded-xl flex gap-2">
                                    <button className="px-3 py-1.5 bg-white shadow-sm rounded-lg text-xs font-black">ALL</button>
                                    <button className="px-3 py-1.5 text-xs font-bold text-gray-400">PENDING</button>
                                    <button className="px-3 py-1.5 text-xs font-bold text-gray-400">SHIPPED</button>
                                </div>
                            </div>

                            {orders.length === 0 ? (
                                <div className="bg-white rounded-[40px] p-20 shadow-sm text-center border-2 border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingBag size={40} className="text-gray-200" /></div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">No orders here yet</h3>
                                    <p className="text-gray-400 font-medium">As soon as customers buy your items, they'll appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-6">
                                                <img src={order.imageUrl} alt="" className="w-16 h-20 object-cover rounded-xl" />
                                                <div>
                                                    <p className="font-black text-gray-900 text-lg mb-1">{order.productName}</p>
                                                    <div className="flex items-center gap-2 flex-wrap text-sm font-bold text-gray-500">
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded">SIZE {order.size}</span>
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded">{order.color}</span>
                                                        <span>Qty: {order.quantity}</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-300 uppercase mt-4 tracking-wider">Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-center md:text-right flex-shrink-0">
                                                <p className="text-2xl font-black text-gray-900 mb-2">₹{(order.price * order.quantity).toLocaleString()}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black tracking-widest uppercase border border-green-100">
                                                        {order.Order?.status || 'Processing'}
                                                    </span>
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"><Edit size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'earnings' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-black text-white p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Available Payout</h3>
                                    <p className="text-6xl font-black mb-2">₹{totalEarnings.toLocaleString()}</p>
                                    <p className="text-gray-400 font-bold mb-8">Next payout scheduled for Monday, 12th Feb</p>
                                    <button className="bg-pink-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-pink-600 transition-all shadow-lg shadow-pink-900/20">WITHDRAW NOW</button>
                                </div>
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <CreditCard size={200} />
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Payment History</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                                        <div>
                                            <p className="font-bold text-gray-900">Payout to Bank Account •••• 1234</p>
                                            <p className="text-xs font-bold text-gray-400">Feb 1, 2026</p>
                                        </div>
                                        <p className="font-black text-green-600">+ ₹12,500</p>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                                        <div>
                                            <p className="font-bold text-gray-900">Payout to Bank Account •••• 1234</p>
                                            <p className="text-xs font-bold text-gray-400">Jan 25, 2026</p>
                                        </div>
                                        <p className="font-black text-green-600">+ ₹8,200</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="h-40 bg-gradient-to-r from-pink-400 to-mocha relative">
                                    <div className="absolute -bottom-12 left-12 w-24 h-24 bg-white rounded-3xl p-1 shadow-xl">
                                        <div className="w-full h-full bg-gray-100 rounded-[20px] flex items-center justify-center text-gray-300 font-black text-3xl">
                                            {vendor.storeName[0]}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-16 pb-12 px-12">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 mb-1">{vendor.storeName}</h3>
                                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                                                <Store size={12} className="text-pink-500" /> {vendor.businessType} Verified Vendor
                                            </p>
                                        </div>
                                        <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-lg">EDIT PROFILE</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Store Owner</label>
                                            <p className="font-bold text-gray-900 flex items-center gap-2 text-lg"><User size={18} className="text-gray-300" /> {vendor.ownerName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Email Address</label>
                                            <p className="font-bold text-gray-900 text-lg underline decoration-pink-200">{vendor.User?.email || vendor.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Support Phone</label>
                                            <p className="font-bold text-gray-900 text-lg">{vendor.phone}</p>
                                        </div>
                                        <div className="col-span-1 lg:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Pickup Address</label>
                                            <p className="font-bold text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">{vendor.pickupAddress}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Status</label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="font-black text-gray-900 uppercase text-xs tracking-widest">Active Partner</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] p-12 shadow-sm border border-gray-100">
                                <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Bank Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div className="bg-gray-50 p-6 rounded-3xl">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bank Name</label>
                                        <p className="font-black text-gray-900">{vendor.bankDetails?.bankName || 'HDFC Bank'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-3xl">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Account Number</label>
                                        <p className="font-black text-gray-900">•••• •••• {vendor.bankDetails?.accountNumber?.slice(-4) || '1234'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-3xl">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">IFSC Code</label>
                                        <p className="font-black text-gray-900">{vendor.bankDetails?.ifsc || 'HDFC0001234'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-pink-200 transition-colors group">
                                        <button className="font-black text-[10px] text-gray-400 uppercase tracking-widest group-hover:text-pink-500 transition-colors">Change Account</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main >

            <VendorProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={selectedProduct}
                onProductSaved={fetchData}
            />
        </div >
    );
};

export default VendorDashboard;
