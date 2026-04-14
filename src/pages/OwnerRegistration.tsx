import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const OwnerRegistration = ({ user, onComplete }: { user: any, onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update the user role to 'owner' first
      await supabase
        .from('app_users')
        .update({ role: 'owner' })
        .eq('id', user.id);

      // 2. Insert the restaurant linked to this user's ID
      const { error } = await supabase
        .from('restaurants')
        .insert([{
          owner_id: user.auth_id, // Links to auth.users per your schema
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          is_open: true
        }]);

      if (error) throw error;
      alert("Restaurant Registered Successfully!");
      onComplete();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-3xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Register Your Restaurant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          placeholder="Restaurant Name" 
          className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-blue-500"
          required
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        <textarea 
          placeholder="Short Description" 
          className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-blue-500"
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
        <input 
          placeholder="City" 
          className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-blue-500"
          required
          onChange={e => setFormData({...formData, city: e.target.value})}
        />
        <input 
          placeholder="Phone Number" 
          className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-blue-500"
          required
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold active:scale-95 transition-all"
        >
          {loading ? "Registering..." : "Complete Registration"}
        </button>
      </form>
    </div>
  );
};
