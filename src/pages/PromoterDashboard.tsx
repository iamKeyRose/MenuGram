import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Megaphone, LayoutGrid, Rocket, Wallet, 
  BarChart3, MousePointer2, Eye, TrendingUp,
  Clock, Plus, ChevronLeft, Calendar, FileText
} from 'lucide-react';

export const PromoterDashboard = ({ dbUser, setActiveTab }: { dbUser: any, setActiveTab?: (tab: string) => void }) => {
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeAds: 0,
    totalImpressions: 0,
    totalClicks: 0,
    walletBalance: 0,
    totalSpend: 0
  });

  useEffect(() => {
    if (dbUser?.id) fetchPartnerData();
  }, [dbUser.id]);

  const fetchPartnerData = async () => {
    try {
      const [adsRes, walletRes] = await Promise.allSettled([
        supabase.from('ads').select('*').eq('created_by', dbUser.id).order('created_at', { ascending: false }),
        supabase.from('wallets').select('balance').eq('owner_id', dbUser.id).single()
      ]);

      const adData = adsRes.status === 'fulfilled' ? adsRes.value.data || [] : [];
      const walletData = walletRes.status === 'fulfilled' ? walletRes.value.data : { balance: 0 };
      
      setAds(adData);
      setStats({
        activeAds: adData.filter((a: any) => a.is_active).length,
        totalImpressions: adData.reduce((acc: number, curr: any) => acc + (curr.impressions_count || 0), 0),
        totalClicks: adData.reduce((acc: number, curr: any) => acc + (curr.clicks_count || 0), 0),
        walletBalance: walletData?.balance || 0,
        totalSpend: 0 
      });
    } catch (error) {
      console.error("Partner Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black text-xs uppercase tracking-widest text-slate-400">Loading Campaign Manager...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-1 text-slate-900">
            <Rocket className="text-blue-600" size={24} />
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Partner<span className="text-blue-600">Ads</span></h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand Manager ID: {dbUser.id.slice(0, 8)}</p>
        </div>

        <nav className="space-y-1 flex-1">
          <SideLink icon={<LayoutGrid size={18}/>} label="Ad Console" active />
          <SideLink 
             icon={<Plus size={18}/>} 
             label="Create New Ad" 
             onClick={() => setActiveTab?.('ad-creation')} 
          />
          <SideLink icon={<Megaphone size={18}/>} label="My Campaigns" badge={stats.activeAds} />
          <SideLink icon={<Wallet size={18}/>} label="Ad Credits" />
          <SideLink icon={<BarChart3 size={18}/>} label="ROI Reports" />
        </nav>

        {setActiveTab && (
          <button onClick={() => setActiveTab('profile')} className="mt-6 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors">
            <ChevronLeft size={16} /> Marketplace Home
          </button>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-1">Campaign Overview</h2>
            <p className="text-slate-500 font-medium tracking-tight text-sm">Real-time performance of your promoted products</p>
          </div>
          
          {/* FUNCTIONAL CREATE AD BUTTON */}
          <button 
            onClick={() => setActiveTab?.('ad-creation')}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center gap-3 active:scale-95"
          >
             <Plus size={16} /> Create Ad
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
           <KPICard title="Ad Balance" value={`${stats.walletBalance} AED`} trend="Prepaid" icon={<Wallet size={24}/>} color="text-emerald-600" bg="bg-emerald-50" />
           <KPICard title="Active Ads" value={stats.activeAds} trend="Live" icon={<Megaphone size={24}/>} color="text-blue-600" bg="bg-blue-50" />
           <KPICard title="Impressions" value={stats.totalImpressions.toLocaleString()} trend="+14%" icon={<Eye size={24}/>} color="text-purple-600" bg="bg-purple-50" />
           <KPICard title="Total Clicks" value={stats.totalClicks.toLocaleString()} trend="Engagement" icon={<MousePointer2 size={24}/>} color="text-orange-600" bg="bg-orange-50" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-black text-lg tracking-tight uppercase italic text-slate-800">Placement Performance</h3>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Live Monitor</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                         <th className="px-8 py-4">Ad Campaign</th>
                         <th className="px-8 py-4 text-center">Status</th>
                         <th className="px-8 py-4 text-center">CTR (%)</th>
                         <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {ads.length > 0 ? ads.map((ad) => (
                        <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6">
                              <p className="font-black text-slate-800">{ad.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{ad.placement}</p>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${ad.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {ad.is_active ? 'Active' : 'Expired'}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-center font-black text-slate-900 text-sm">
                              {ad.impressions_count > 0 ? ((ad.clicks_count / ad.impressions_count) * 100).toFixed(2) : 0}%
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button className="text-slate-400 hover:text-blue-600 p-2"><SettingsIcon size={18} /></button>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No campaigns found</p>
                            <button 
                              onClick={() => setActiveTab?.('ad-creation')}
                              className="mt-4 text-blue-600 font-black text-[10px] uppercase underline tracking-widest"
                            >
                              Launch your first ad
                            </button>
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
               <TrendingUp className="text-blue-500 mb-4" size={32} />
               <h3 className="font-black text-xl tracking-tight mb-2">Target Better</h3>
               <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">Your ads are currently performing well. Consider using specific category placements for higher conversion.</p>
               <button 
                onClick={() => setActiveTab?.('ad-creation')}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
               >
                 Boost Results
               </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
               <h3 className="font-black text-lg mb-6 flex items-center gap-2 text-slate-800">
                  <Calendar size={18} className="text-slate-400" /> Recent Activity
               </h3>
               <div className="space-y-4 text-sm font-medium text-slate-500">
                 No recent billing activity found.
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* REUSABLE UI COMPONENTS */

const SideLink = ({ icon, label, active = false, badge = 0, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </div>
    {badge > 0 && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">{badge}</span>}
  </div>
);

const KPICard = ({ title, value, icon, color, bg, trend }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
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

const SettingsIcon = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
