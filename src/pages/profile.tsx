import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';

// UPDATED: Added { dbUser, setActiveTab } props to handle role display and navigation
export const Profile = ({ dbUser, setActiveTab }: { dbUser: any, setActiveTab?: (tab: string) => void }) => {
  const { user } = useTelegram();
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      const { data } = await supabase.from('wallets').select('*').single();
      setWallet(data);
    };
    fetchWallet();
  }, []);

  // ADDED: Logic to upgrade to Promoter (Ad Partner)
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
    <div className="p-6">
      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Balance</p>
        <h2 className="text-4xl font-black tracking-tighter">{wallet?.balance || '0.00'} AED</h2>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 divide-y divide-slate-50 overflow-hidden mb-6">
        <div className="p-5 flex justify-between">
          <span className="font-bold text-slate-500">Name</span>
          <span className="font-black">{user?.first_name || 'Guest'}</span>
        </div>
        <div className="p-5 flex justify-between">
          <span className="font-bold text-slate-500">Role</span>
          {/* UPDATED: Now shows the dynamic role from the database */}
          <span className="font-black text-blue-600 uppercase text-xs">{dbUser?.role || 'Customer'}</span>
        </div>
      </div>

      {/* ADDED: Partnership Section (Only shows for Customers/Guests) */}
      {dbUser?.role === 'customer' && (
        <div className="space-y-3">
          <p className="px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Become a Partner</p>
          
          <button 
            onClick={() => setActiveTab && setActiveTab('owner-reg')}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <span className="font-black text-slate-900">Register Restaurant</span>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl text-[10px] font-black uppercase">Owner</div>
          </button>

          <button 
            onClick={upgradeToPromoter}
            className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <span className="font-black text-slate-900">Promote Products</span>
            <div className="bg-slate-50 text-slate-600 p-2 rounded-xl text-[10px] font-black uppercase">Ad Partner</div>
          </button>
        </div>
      )}
    </div>
  );
};
    
