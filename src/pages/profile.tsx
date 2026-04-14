import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';
// ADDED 'Settings' to the import list below
import { LayoutDashboard, ArrowRight, Store, User, Megaphone, Settings } from 'lucide-react';

export const Profile = ({ dbUser, setActiveTab }: { dbUser: any, setActiveTab?: (tab: string) => void }) => {
  const { user } = useTelegram();
  const [wallet, setWallet] = useState<any>(null);

  // SAFETY CHECK: If dbUser is still loading from useAuth, prevent the crash
  if (!dbUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 font-black animate-pulse uppercase text-xs tracking-widest">
          Loading Profile...
        </div>
      </div>
    );
  }

  const isOwner = dbUser?.role === 'owner';

  useEffect(() => {
    const fetchWallet = async () => {
      if (!dbUser?.id) return;
      const { data } = await supabase
        .from('wallets')
        .select('*')
        .eq('owner_id', dbUser.id)
        .single();
      setWallet(data);
    };
    fetchWallet();
  }, [dbUser?.id]);

  const upgradeToPromoter = async () => {
    const { error } = await supabase
      .from('app_users')
      .update({ role: 'promoter' })
      .eq('telegram_id', user?.id);

    if (!error) {
      alert("Welcome! You are now an Ad Partner.");
      window.location.reload();
    }
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- BUSINESS DASHBOARD LINK (Owner Only) --- */}
      {isOwner && (
        <div className="mb-8">
          <p className="px-5 mb-2 text-[10px] font-black uppercase tracking-widest text-blue-600">Business Mode</p>
          <button 
            onClick={() => setActiveTab && setActiveTab('owner-dashboard')}
            className="w-full flex items-center justify-between p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-xl active:scale-[0.97] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl">
                <LayoutDashboard size={20} />
              </div>
              <div className="text-left">
                <p className="font-black text-lg tracking-tight">Open Dashboard</p>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Manage Orders & Menu</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-600" />
          </button>
        </div>
      )}

      {/* --- WALLET CARD --- */}
      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Personal Balance</p>
          <h2 className="text-4xl font-black tracking-tighter">{wallet?.balance || '0.00'} <span className="text-lg">AED</span></h2>
        </div>
        {/* Decorative Circle */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* --- ACCOUNT INFO --- */}
      <div className="bg-white rounded-[2rem] border border-slate-100 divide-y divide-slate-50 overflow-hidden mb-6 shadow-sm">
        <div className="p-5 flex justify-between items-center">
          <div className="flex items-center gap-3 text-slate-500">
            <User size={16} />
            <span className="font-bold text-sm">Name</span>
          </div>
          <span className="font-black text-sm">{user?.first_name || dbUser?.display_name || 'Guest'}</span>
        </div>
        <div className="p-5 flex justify-between items-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Settings size={16} />
            <span className="font-bold text-sm">Role</span>
          </div>
          <span className="font-black text-blue-600 uppercase text-[10px] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {dbUser?.role || 'Customer'}
          </span>
        </div>
      </div>

      {/* --- PARTNERSHIP SECTION --- */}
      <div className="space-y-3">
        <p className="px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Partnership</p>
        
        {/* Owner Registration Link */}
        {(dbUser?.role === 'customer' || dbUser?.role === 'owner' || dbUser?.role === 'promoter') && (
          <button 
            onClick={() => setActiveTab && setActiveTab('owner-reg')}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all shadow-sm"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-600">
                <Store size={20} />
              </div>
              <div>
                <span className="font-black text-slate-900 block text-sm">
                  {isOwner ? 'Add Another Restaurant' : 'I am a Restaurant Owner'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Up to 10 Locations</span>
              </div>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2 px-3 rounded-xl text-[9px] font-black uppercase">Apply</div>
          </button>
        )}

        {/* Promoter Button */}
        {dbUser?.role === 'customer' && (
          <button 
            onClick={upgradeToPromoter}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all shadow-sm"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-600">
                <Megaphone size={20} />
              </div>
              <div>
                <span className="font-black text-slate-900 block text-sm">Become a Promoter</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Earn commission</span>
              </div>
            </div>
            <div className="bg-slate-50 text-slate-600 p-2 px-3 rounded-xl text-[9px] font-black uppercase">Join</div>
          </button>
        )}
      </div>

      {/* --- FOOTER --- */}
      <div className="mt-8 text-center px-6">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Version 2.0.4 • 2026</p>
      </div>
    </div>
  );
};
