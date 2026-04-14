import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, Store, ShoppingBag, Wallet, 
  BarChart3, AlertCircle, ShieldCheck, TrendingUp,
  CheckCircle, Clock, Search, MessageSquare
} from 'lucide-react';

export const SystemAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    pendingPayouts: 0,
    dailyRevenue: 0,
    activeOrders: 0,
    unverifiedVendors: 0
  });

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      // Parallel data fetching for performance
      const [
        { count: userCount },
        { count: resCount },
        { data: transData },
        { count: pendingPayouts },
        { count: unverified }
      ] = await Promise.all([
        supabase.from('app_users').select('*', { count: 'exact', head: true }),
        supabase.from('restaurants').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount').gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        supabase.from('payouts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('is_verified', false)
      ]);

      setStats({
        users: userCount || 0,
        restaurants: resCount || 0,
        pendingPayouts: pendingPayouts || 0,
        dailyRevenue: transData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
        activeOrders: 0, // Would pull from orders table where status != 'delivered'
        unverifiedVendors: unverified || 0
      });
    } catch (error) {
      console.error("Admin Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse">BOOTING SYSTEM OS...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col hidden lg:flex">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Control<span className="text-blue-600">Center</span></h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5">Superuser Access</p>
        </div>

        <nav className="space-y-1 flex-1">
          <AdminLink icon={<BarChart3 size={18}/>} label="Marketplace Info" active />
          <AdminLink icon={<Store size={18}/>} label="Vendors" badge={stats.unverifiedVendors} />
          <AdminLink icon={<Users size={18}/>} label="User Base" />
          <AdminLink icon={<Wallet size={18}/>} label="Finance & Payouts" badge={stats.pendingPayouts} />
          <AdminLink icon={<ShoppingBag size={18}/>} label="Live Logs" />
          <AdminLink icon={<Search size={18}/>} label="Search Analytics" />
          <AdminLink icon={<MessageSquare size={18}/>} label="Support" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">System Health</p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600">
                 <CheckCircle size={12} /> Database: Online
              </div>
           </div>
        </div>
      </aside>

      {/* --- MAIN STAGE --- */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-1">System Overview</h2>
            <p className="text-slate-500 font-medium">Aggregated data from all 25 tables</p>
          </div>
          <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3">
             <Clock size={14} /> Refreshing Live
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
           <KPICard title="Today's GMV" value={`${stats.dailyRevenue} AED`} trend="+12%" icon={<TrendingUp size={24}/>} color="text-emerald-600" bg="bg-emerald-50" />
           <KPICard title="Platform Users" value={stats.users} trend="+54" icon={<Users size={24}/>} color="text-blue-600" bg="bg-blue-50" />
           <KPICard title="Active Vendors" value={stats.restaurants} trend="0" icon={<Store size={24}/>} color="text-purple-600" bg="bg-purple-50" />
           <KPICard title="Payouts Pending" value={stats.pendingPayouts} trend="High" icon={<AlertCircle size={24}/>} color="text-rose-600" bg="bg-rose-50" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* VERIFICATION QUEUE */}
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-black text-lg tracking-tight uppercase italic">Vendor Approval Queue</h3>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full">{stats.unverifiedVendors} PENDING</span>
             </div>
             <div className="p-0">
                <table className="w-full text-left">
                   <thead className="bg-slate-50">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                         <th className="px-8 py-4">Restaurant Name</th>
                         <th className="px-8 py-4">City</th>
                         <th className="px-8 py-4">Tier</th>
                         <th className="px-8 py-4 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {/* This would be a map over unverified restaurants */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6 font-black text-slate-800">Habesha Grill</td>
                         <td className="px-8 py-6 text-sm font-bold text-slate-500">Dubai</td>
                         <td className="px-8 py-6">
                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase">Professional</span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <button className="bg-slate-900 text-white text-[10px] font-black uppercase px-5 py-2 rounded-xl hover:bg-blue-600">Verify</button>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>

          {/* SEARCH TRENDS */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
             <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                <Search size={18} className="text-slate-400" /> Market Demand
             </h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Top Search Analytics</p>
             <div className="space-y-4">
                <TrendItem label="Spicy Tibs" count={452} percentage={85} />
                <TrendItem label="Vegan Platter" count={281} percentage={60} />
                <TrendItem label="Delivery to JLT" count={198} percentage={40} />
             </div>
             <button className="w-full mt-10 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase hover:border-blue-400 hover:text-blue-500 transition-all">
                Download Analytics CSV
             </button>
          </div>

        </div>
      </main>
    </div>
  );
};

/* --- MINI COMPONENTS --- */

const AdminLink = ({ icon, label, active = false, badge = 0 }: any) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
    {badge > 0 && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">{badge}</span>}
  </div>
);

const KPICard = ({ title, value, icon, color, bg, trend }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-4 rounded-2xl ${bg} ${color}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
        {trend}
      </div>
    </div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
    <h4 className="text-3xl font-black tracking-tighter">{value}</h4>
  </div>
);

const TrendItem = ({ label, count, percentage }: any) => (
  <div>
     <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-black text-slate-700">{label}</span>
        <span className="text-[10px] font-bold text-slate-400">{count} hits</span>
     </div>
     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }}></div>
     </div>
  </div>
);
