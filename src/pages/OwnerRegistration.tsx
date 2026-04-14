import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';

export const OwnerRegistration = ({ dbUser, onComplete }: { dbUser: any, onComplete: (id: string) => void }) => {
  const { user } = useTelegram(); // Kept original dependency
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  // Focus only on columns that are NOT data-driven
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    address: '',
    phone: '',
    whatsapp: '',
  });

  useEffect(() => {
    const checkLimit = async () => {
      if (!dbUser?.auth_id) return;
      const { count: resCount } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', dbUser.auth_id);
      setCount(resCount || 0);
    };
    checkLimit();
  }, [dbUser.auth_id]);

  const handleRegister = async () => {
    if (count >= 10) return alert("Maximum limit of 10 restaurants reached.");
    if (!formData.name.trim()) return alert("Restaurant Name is required.");

    setLoading(true);

    // Only insert columns that require manual input
    // The DB handles id, created_at, rating, is_open, etc. automatically
    const { data, error: resError } = await supabase
      .from('restaurants')
      .insert([{ 
        owner_id: dbUser.auth_id,
        name: formData.name,
        description: formData.description,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        whatsapp: formData.whatsapp
      }])
      .select()
      .single(); // Added to capture the ID for Menu Creation

    if (resError) {
      alert("Error: " + resError.message);
    } else {
      // Upgrade role from Customer/Promoter to Owner
      if (dbUser.role !== 'owner') {
        await supabase
          .from('app_users')
          .update({ role: 'owner' })
          .eq('id', dbUser.id);
      }
      
      alert("Registration Successful!");
      
      // Pass the new restaurant ID to the complete function
      if (data) {
        onComplete(data.id); 
      }
      
      // Removed window.location.reload() to allow the MenuSetup component to load
    }
    setLoading(false);
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter">Register</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">
          Location {count + 1} of 10
        </p>
      </header>

      <div className="space-y-4">
        {/* Name - Database 'NOT NULL' */}
        <div className="space-y-1">
          <label className="px-5 text-[10px] font-black uppercase text-blue-600">Name *</label>
          <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
            <input 
              className="w-full p-4 bg-transparent font-black outline-none text-sm"
              placeholder="Restaurant Name"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        {/* Description - Optional */}
        <div className="space-y-1">
          <label className="px-5 text-[10px] font-black uppercase text-slate-400">Bio</label>
          <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
            <textarea 
              className="w-full p-4 bg-transparent font-bold outline-none text-sm h-20"
              placeholder="Brief description..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {/* Location - Optional */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="px-5 text-[10px] font-black uppercase text-slate-400">City</label>
            <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
              <input 
                className="w-full p-4 bg-transparent font-black outline-none text-sm"
                placeholder="City"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="px-5 text-[10px] font-black uppercase text-slate-400">Address</label>
            <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
              <input 
                className="w-full p-4 bg-transparent font-black outline-none text-sm"
                placeholder="Address"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Contact - Optional */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="px-5 text-[10px] font-black uppercase text-slate-400">Phone</label>
            <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
              <input 
                className="w-full p-4 bg-transparent font-black outline-none text-sm"
                placeholder="Phone"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="px-5 text-[10px] font-black uppercase text-slate-400">WhatsApp</label>
            <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
              <input 
                className="w-full p-4 bg-transparent font-black outline-none text-sm"
                placeholder="WhatsApp"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleRegister} 
          disabled={loading || count >= 10}
          className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black shadow-xl active:scale-95 transition-all disabled:bg-slate-200 mt-6"
        >
          {loading ? "PROCESSING..." : "ACTIVATE ACCOUNT"}
        </button>

        <button 
          onClick={() => onComplete('')}
          className="w-full p-3 text-slate-400 font-bold text-[10px] uppercase
