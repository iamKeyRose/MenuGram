import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const OwnerRegistration = ({ dbUser, onComplete }: { dbUser: any, onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [count, setCount] = useState(0);

  useEffect(() => {
    const checkLimit = async () => {
      // We check based on auth_id as per your schema
      const { count } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', dbUser.auth_id);
      setCount(count || 0);
    };
    checkLimit();
  }, [dbUser.auth_id]);

  const handleRegister = async () => {
    if (count >= 10) return alert("You've reached the maximum limit of 10 restaurants.");
    if (!name || !city || !phone) return alert("Please fill in the Name, City, and Phone.");

    setLoading(true);

    // 1. Insert the Restaurant using the auth_id from your schema
    const { error: resError } = await supabase
      .from('restaurants')
      .insert([{ 
        name, 
        city, 
        phone,
        owner_id: dbUser.auth_id, 
        is_open: true,
        subscription_tier: 'basic'
      }]);

    if (resError) {
      alert("Error: " + resError.message);
    } else {
      // 2. Only upgrade role to 'owner' if they are currently a 'customer'
      if (dbUser.role === 'customer') {
        await supabase
          .from('app_users')
          .update({ role: 'owner' })
          .eq('id', dbUser.id);
      }
      
      alert("Registration Successful!");
      onComplete();
      window.location.reload(); 
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-black tracking-tighter mb-2">Register Restaurant</h2>
      <p className="text-slate-400 text-sm font-bold mb-8 italic">{count}/10 Locations registered</p>

      <div className="space-y-4">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Restaurant Name" className="w-full p-5 bg-transparent font-black outline-none" />
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 p-2">
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full p-5 bg-transparent font-black outline-none" />
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 p-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Business Phone" className="w-full p-5 bg-transparent font-black outline-none" />
        </div>

        <button 
          onClick={handleRegister} 
          disabled={loading || count >= 10}
          className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-black shadow-xl active:scale-95 transition-all disabled:bg-slate-300"
        >
          {loading ? "PROCESSING..." : count >= 10 ? "LIMIT REACHED" : "REGISTER & ACTIVATE OWNER"}
        </button>
      </div>
    </div>
  );
};
