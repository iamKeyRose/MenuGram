import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';

export const Orders = () => {
  const { user } = useTelegram();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, restaurants(name, logo_url)')
        .order('created_at', { ascending: false });
      setOrders(data || []);
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6">Recent Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <img src={order.restaurants?.logo_url} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-black text-sm">{order.restaurants?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{order.status}</p>
              </div>
            </div>
            <p className="font-black text-blue-600 text-sm">{order.total} AED</p>
          </div>
        ))}
      </div>
    </div>
  );
};
