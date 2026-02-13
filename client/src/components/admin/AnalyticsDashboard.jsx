import React, { useState } from 'react';
import {
    Zap, Activity, TrendingUp, Package, Target,
    FileText, ChevronRight, Bell, AlertCircle, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AnalyticsDashboard = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [orderNotification, setOrderNotification] = useState(true);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* STEP 1: ENABLE BASIC TRACKING */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-inner ${isTracking ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-gray-400 border border-white/10'}`}>
                            <Zap size={32} className={isTracking ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tight mb-2">Data Collection</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-600'}`} />
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">{isTracking ? 'Active & Tracking' : 'Paused'}</span>
                                </div>
                                <span className="text-gray-600">|</span>
                                <div className="flex gap-3">
                                    {['Sales', 'Visitors', 'Conversion'].map(tag => (
                                        <div key={tag} className="flex items-center gap-1.5">
                                            <Check size={12} className={isTracking ? 'text-green-500' : 'text-gray-600'} />
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isTracking ? 'text-gray-200' : 'text-gray-600'}`}>{tag}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsTracking(!isTracking);
                            if (!isTracking) toast.success("Analytics Tracking Enabled!");
                        }}
                        className={`px-12 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-2xl ${isTracking ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/20'}`}
                    >
                        {isTracking ? 'Turn OFF Collection' : 'Turn ON Data Collection'}
                    </button>
                </div>
            </div>

            {/* STEP 2: DASHBOARD WIDGETS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Widget 1: TODAY'S PERFORMANCE */}
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Activity size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Today's Performance</h3>
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: 'Sales Today', value: 'Rs. 0', icon: '💰' },
                            { label: 'Visitors Today', value: '0', icon: '👥' },
                            { label: 'Orders Today', value: '0', icon: '📦' }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{stat.icon}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <span className="text-xl font-black text-gray-900">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Widget 2: DAILY SALES CHART */}
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Daily Sales Chart</h3>
                    </div>
                    <div className="h-44 flex flex-col items-center justify-center text-gray-300 relative">
                        <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} className="w-4 bg-gray-50 rounded-t-lg h-4" />
                            ))}
                        </div>
                        <div className="z-10 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last 7 Days</p>
                            <p className="text-xs font-bold text-gray-500 italic">No data available yet</p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-between text-[10px] font-black text-gray-300 uppercase px-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Widget 3: TOP PRODUCTS */}
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                            <Package size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Top Products</h3>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl opacity-50">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-300 text-xs">#{i}</div>
                                <div className="flex-1">
                                    <div className="h-3 w-24 bg-gray-100 rounded-full mb-2" />
                                    <div className="h-2 w-16 bg-gray-50 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting sales data...</p>
                </div>
            </div>

            {/* KEY METRIC TO WATCH */}
            <div className="bg-pink-50/50 border border-pink-100 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-pink-500">
                        <Target size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-gray-900 tracking-tight">Main Goal: Conversion Rate</h4>
                        <p className="text-sm text-gray-500 font-medium">(Orders ÷ Visitors) × 100</p>
                    </div>
                </div>
                <div className="flex items-baseline gap-4 bg-white px-10 py-6 rounded-3xl shadow-sm border border-pink-50">
                    <span className="text-5xl font-black text-pink-500 tracking-tighter">0%</span>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Month 1 Target: &gt;0%</span>
                </div>
            </div>

            {/* STEP 3 & 4: REPORTS & ALERTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Basic Reports</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-pink-200 transition-all cursor-pointer">
                            <div>
                                <h4 className="font-black text-gray-900">Weekly Sales Summary</h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Check every Monday</p>
                            </div>
                            <button className="p-2 rounded-xl text-gray-400 group-hover:text-pink-500 group-hover:bg-pink-50 transition-all"><ChevronRight size={20} /></button>
                        </div>
                        <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-pink-200 transition-all cursor-pointer">
                            <div>
                                <h4 className="font-black text-gray-900">Product Performance</h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Check bi-weekly</p>
                            </div>
                            <button className="p-2 rounded-xl text-gray-400 group-hover:text-pink-500 group-hover:bg-pink-50 transition-all"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                            <Bell size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">System Alerts</h3>
                    </div>
                    <div className="p-8 rounded-[32px] bg-gray-900 text-white relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px]" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${orderNotification ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'bg-white/10 text-white/50'}`}>
                                    <Bell size={20} className={orderNotification ? 'animate-bounce' : ''} />
                                </div>
                                <div>
                                    <p className="font-black">New Order Alerts</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Via Email & SMS</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setOrderNotification(!orderNotification);
                                    toast.success(orderNotification ? "Order alerts disabled" : "Order alerts enabled!");
                                }}
                                className={`w-14 h-8 rounded-full flex items-center px-1 transition-all ${orderNotification ? 'bg-orange-500' : 'bg-gray-700'}`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-white transition-all transform ${orderNotification ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
                            </button>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-3 p-4 border border-dashed border-gray-200 rounded-2xl">
                        <AlertCircle size={16} className="text-gray-400" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">No other alerts active. Keeping it simple for Day 1.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
