import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';

export const Profile = () => {
  const { user } = useTelegram();
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      const { data } = await supabase.from('wallets').select('*').single();
      setWallet(data);
    };
    fetchWallet();
  }, []);

  return (
    <div className="p-6">
      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Balance</p>
        <h2 className="text-4xl font-black tracking-tighter">{wallet?.balance || '0.00'} AED</h2>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 divide-y divide-slate-50 overflow-hidden">
        <div className="p-5 flex justify-between">
          <span className="font-bold text-slate-500">Name</span>
          <span className="font-black">{user?.first_name || 'Guest'}</span>
        </div>
        <div className="p-5 flex justify-between">
          <span className="font-bold text-slate-500">Role</span>
          <span className="font-black text-blue-600 uppercase text-xs">Customer</span>
        </div>
      </div>
    </div>
  );
};
