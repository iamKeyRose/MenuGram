import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, Store, ShoppingBag, Wallet, 
  BarChart3, AlertCircle, ShieldCheck, TrendingUp,
  Clock, Search, MessageSquare, ChevronLeft
} from 'lucide-react';

export const AdminDashboard = ({ setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
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
      const results = await Promise.allSettled([
        supabase.from('app_users').select('*', { count: 'exact', head: true }),
        supabase.from('restaurants').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount').gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        supabase.from('payouts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('is_verified', false)
      ]);

      const getValue = (res: any) => res.status === 'fulfilled' ? res.value : { count: 0, data: [] };

      setStats({
        users: getValue(results[0]).count || 0,
        restaurants: getValue(results[1]).count || 0,
        pendingPayouts: getValue(results[3]).count || 0,
        dailyRevenue: getValue(results[2]).data?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0,
        activeOrders: 0,
        unverifiedVendors: getValue(results[4]).count || 0
      });
    } catch (error) {
      console.error("Admin Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black text-xs uppercase tracking-widest text-slate-400">Booting System OS...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-1 text-slate-900">
            <ShieldCheck className="text-blue-600" size={24} />
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Control<span className="text-blue-600">Center</span></h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Superuser Access</p>
        </div>

        <nav className="space-y-1 flex-1">
          <AdminLink icon={<BarChart3 size={18}/>} label="Marketplace Info" active />
          <AdminLink icon={<Store size={18}/>} label="Vendors" badge={stats.unverifiedVendors} />
          <AdminLink icon={<Users size={18}/>} label="User Base" />
          <AdminLink icon={<Wallet size={18}/>} label="Finance" badge={stats.pendingPayouts} />
          <AdminLink icon={<Search size={18}/>} label="Analytics" />
          <AdminLink icon={<MessageSquare size={18}/>} label="Support" />
        </nav>

        {setActiveTab && (
          <button onClick={() => setActiveTab('profile')} className="mt-6 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors">
            <ChevronLeft size={16} /> Exit Admin
          </button>
        )}
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-1">System Overview</h2>
            <p className="text-slate-500 font-medium">Aggregated platform intelligence</p>
          </div>
          <button onClick={() => window.location.reload()} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3">
             <Clock size={14} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
           <KPICard title="Daily Revenue" value={`${stats.dailyRevenue} AED`} trend="+12%" icon={<TrendingUp size={24}/>} color="text-emerald-600" bg="bg-emerald-50" />
           <KPICard title="Total Users" value={stats.users} trend="+54" icon={<Users size={24}/>} color="text-blue-600" bg="bg-blue-50" />
           <KPICard title="Restaurants" value={stats.restaurants} trend="Live" icon={<Store size={24}/>} color="text-purple-600" bg="bg-purple-50" />
           <KPICard title="Payouts" value={stats.pendingPayouts} trend="Action" icon={<AlertCircle size={24}/>} color="text-rose-600" bg="bg-rose-50" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-black text-lg tracking-tight uppercase italic text-slate-800">Verification Queue</h3>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">{stats.unverifiedVendors} Pending</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                         <th className="px-8 py-4">Restaurant</th>
                         <th className="px-8 py-4 text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6">
                            <p className="font-black text-slate-800">New Registration</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Awaiting review</p>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <button className="bg-slate-900 text-white text-[10px] font-black uppercase px-5 py-2 rounded-xl hover:bg-blue-600 transition-all">Verify</button>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
             <h3 className="font-black text-lg mb-6 flex items-center gap-2 text-slate-800">
                <Search size={18} className="text-slate-400" /> Market Demand
             </h3>
             <div className="space-y-4">
                <TrendItem label="Spicy Tibs" count={452} percentage={85} />
                <TrendItem label="Vegan Options" count={281} percentage={60} />
                <TrendItem label="Fast Delivery" count={198} percentage={40} />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

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
      <div className={`p-4 rounded-2xl ${bg} ${color}`}>{icon}</div>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
        {trend}
      </span>
    </div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{title}</p>
    <h4 className="text-3xl font-black tracking-tighter text-slate-900">{value}</h4>
  </div>
);

const TrendItem = ({ label, count, percentage }: any) => (
  <div>
     <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-black text-slate-700">{label}</span>
        <span className="text-[10px] font-bold text-slate-400">{count}</span>
     </div>
     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }}></div>
     </div>
  </div>
);
