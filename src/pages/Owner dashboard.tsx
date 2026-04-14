import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Utensils, Settings, Wallet, ChevronRight, Clock } from 'lucide-react';

export const OwnerDashboard = ({ dbUser }: { dbUser: any }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'wallet'>('orders');
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    const fetchStore = async () => {
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', dbUser.auth_id)
        .single();
      setRestaurant(data);
    };
    fetchStore();
  }, [dbUser.auth_id]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Area */}
      <div className="bg-white p-6 pb-10 rounded-b-[3rem] shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">Dashboard</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{restaurant?.name || 'Loading...'}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${restaurant?.is_open ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {restaurant?.is_open ? '● Accepting Orders' : '○ Kitchen Closed'}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Orders" value="12" color="blue" />
          <StatCard label="Revenue" value="450" unit="AED" color="emerald" />
          <StatCard label="Rating" value={restaurant?.rating || '5.0'} color="orange" />
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex gap-2 p-6 overflow-x-auto no-scrollbar">
        <TabBtn active={activeTab === 'orders'} label="Live Orders" icon={<Package size={16}/>} onClick={() => setActiveTab('orders')} />
        <TabBtn active={activeTab === 'menu'} label="Menu" icon={<Utensils size={16}/>} onClick={() => setActiveTab('menu')} />
        <TabBtn active={activeTab === 'wallet'} label="Earnings" icon={<Wallet size={16}/>} onClick={() => setActiveTab('wallet')} />
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-black text-lg tracking-tight">Active Tasks</h3>
              <button className="text-blue-600 text-[10px] font-black uppercase">History</button>
            </div>
            
            {/* Example Order Card */}
            <OrderCard id="#8821" time="5m ago" items="2x Special Tibs, 1x Coke" total="85.00" status="Preparing" />
            <OrderCard id="#8822" time="12m ago" items="1x Kitfo" total="120.00" status="Pending" />
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="bg-white p-8 rounded-[2rem] text-center border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-sm">Menu Management Module</p>
            <button className="mt-4 bg-black text-white px-6 py-2 rounded-full text-xs font-black uppercase">Edit Menu</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components for clean code
const StatCard = ({ label, value, unit, color }: any) => (
  <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">{label}</p>
    <p className={`text-xl font-black text-${color}-600`}>{value}<span className="text-[10px] ml-1">{unit}</span></p>
  </div>
);

const TabBtn = ({ active, label, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs whitespace-nowrap transition-all ${active ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
  >
    {icon} {label}
  </button>
);

const OrderCard = ({ id, time, items, total, status }: any) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600">
        <Clock size={20} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-black text-sm">{id}</span>
          <span className="text-[10px] text-slate-400 font-bold">{time}</span>
        </div>
        <p className="text-xs text-slate-500 font-medium line-clamp-1">{items}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-black text-sm">{total} <span className="text-[8px]">AED</span></p>
      <p className={`text-[9px] font-black uppercase ${status === 'Pending' ? 'text-orange-500' : 'text-blue-500'}`}>{status}</p>
    </div>
  </div>
);
