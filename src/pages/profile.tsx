import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';
import { 
  LayoutDashboard, 
  ArrowRight, 
  Store, 
  User, 
  Megaphone, 
  Settings, 
  ShieldCheck 
} from 'lucide-react';

export const Profile = ({ dbUser, setActiveTab }: { dbUser: any, setActiveTab?: (tab: string) => void }) => {
  const { user } = useTelegram();
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!dbUser?.id) return;
      const { data } = await supabase.from('wallets').select('*').eq('owner_id', dbUser.id).single();
      setWallet(data);
    };
    fetchWallet();
  }, [dbUser?.id]);

  if (!dbUser) return (
    <div className="p-10 text-center text-slate-400 uppercase font-black tracking-widest animate-pulse">
      Loading Profile...
    </div>
  );

  return (
    <div className="p-6 pb-24 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SYSTEM ADMIN ACCESS - ORIGINAL CODE */}
      {dbUser?.role === 'admin' && (
        <div className="mb-8">
          <p className="px-5 mb-2 text-[10px] font-black uppercase tracking-widest text-rose-500">Infrastructure</p>
          <button 
            onClick={() => setActiveTab && setActiveTab('system-admin')}
            className="w-full flex items-center justify-between p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-xl active:scale-[0.97] transition-all border-b-4 border-slate-700"
          >
            <div className="flex items-center gap-4">
              <div className="bg-rose-600 p-3 rounded-2xl shadow-lg shadow-rose-600/20">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <p className="font-black text-lg tracking-tight">System Admin</p>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Manage Platform & Vendors</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-600" />
          </button>
        </div>
      )}

      {/* AD PARTNER / PROMOTER ACCESS - NEW ADDITION */}
      {dbUser?.role === 'promoter' && (
        <div className="mb-8">
          <p className="px-5 mb-2 text-[10px] font-black uppercase tracking-widest text-blue-500">Ad Management</p>
          <button 
            onClick={() => setActiveTab && setActiveTab('ad-partner-console')}
            className="w-full flex items-center justify-between p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm active:scale-[0.97] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20 text-white">
                <Megaphone size={20} />
              </div>
              <div className="text-left">
                <p className="font-black text-lg tracking-tight text-slate-900">Ad Manager</p>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Campaigns & Ad Credits</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-300" />
          </button>
        </div>
      )}

      {/* WALLET CARD - UPDATED WITH DYNAMIC LABEL */}
      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 mb-8 relative overflow-hidden">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
          {dbUser?.role === 'promoter' ? 'Ad Credit Balance' : 'Personal Balance'}
        </p>
        <h2 className="text-4xl font-black tracking-tighter">
          {wallet?.balance || '0.00'} <span className="text-lg">AED</span>
        </h2>
        {/* Decorative background element */}
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
      </div>

      {/* ACCOUNT INFO - ORIGINAL CODE */}
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

      {/* Optional: Add a logout or sync button if needed */}
      <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-4">
        User ID: {dbUser?.id}
      </p>
    </div>
  );
};
