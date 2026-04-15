import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Rocket, Store, Calendar, 
  Image as ImageIcon, Info, AlertCircle 
} from 'lucide-react';

export const CreateAdForm = ({ dbUser, onComplete }: { dbUser: any, onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    restaurant_id: '',
    title: '',
    image_url: '',
    placement: 'home_screen',
    tier: 'basic',
    durationDays: 2 // We will use this to calculate ends_at
  });

  // Fetch restaurants so the promoter can link the ad to one
  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data } = await supabase.from('restaurants').select('id, name');
      if (data) setRestaurants(data);
    };
    fetchRestaurants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Calculate ends_at based on current time + duration
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + formData.durationDays);

    try {
      const { error } = await supabase.from('ads').insert([{
        restaurant_id: formData.restaurant_id,
        created_by: dbUser.id,
        title: formData.title,
        image_url: formData.image_url,
        placement: formData.placement,
        tier: formData.tier,
        starts_at: new Date().toISOString(),
        ends_at: endsAt.toISOString(),
        is_active: true // Or false if you want admin approval first
      }]);

      if (error) throw error;
      onComplete();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 pb-32">
      {/* Header */}
      <div className="max-w-xl mx-auto mb-8 flex items-center gap-4">
        <button onClick={onComplete} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">Create <span className="text-blue-600">Ad</span></h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Marketing Campaign</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
        
        {/* Restaurant Selection */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            <Store size={14} /> Select Restaurant
          </label>
          <select 
            required
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-blue-600 transition-all"
            value={formData.restaurant_id}
            onChange={(e) => setFormData({...formData, restaurant_id: e.target.value})}
          >
            <option value="">Choose a partner...</option>
            {restaurants.map(res => (
              <option key={res.id} value={res.id}>{res.name}</option>
            ))}
          </select>
        </div>

        {/* Ad Content */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            <ImageIcon size={14} /> Ad Visuals
          </label>
          <input 
            type="text"
            required
            placeholder="Campaign Title (e.g. 20% Off Weekend)"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <input 
            type="url"
            required
            placeholder="Banner Image URL"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm"
            value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          />
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Placement</label>
            <select 
              className="w-full bg-transparent font-bold text-sm outline-none"
              value={formData.placement}
              onChange={(e) => setFormData({...formData, placement: e.target.value})}
            >
              <option value="home_screen">Home Screen</option>
              <option value="search_page">Search Page</option>
              <option value="category_top">Category Top</option>
            </select>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Duration</label>
            <select 
              className="w-full bg-transparent font-bold text-sm outline-none"
              value={formData.durationDays}
              onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value)})}
            >
              <option value={2}>2 Days</option>
              <option value={7}>1 Week</option>
              <option value={30}>1 Month</option>
            </select>
          </div>
        </div>

        {/* Campaign Cost Callout (Using your 345 AED campaign reference) */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Estimated Cost</p>
              <h3 className="text-3xl font-black italic tracking-tighter">345.00 <span className="text-sm uppercase tracking-normal text-slate-500">AED</span></h3>
            </div>
            <div className="bg-blue-600/20 p-4 rounded-2xl border border-blue-600/30">
              <Info size={20} className="text-blue-400" />
            </div>
          </div>
          <div className="absolute top-[-50%] right-[-10%] w-40 h-40 bg-blue-600/20 blur-[60px] rounded-full"></div>
        </div>

        {/* Action Button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Rocket size={20} /> Launch Campaign
            </>
          )}
        </button>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-2">
          <AlertCircle size={12} /> Credits will be deducted upon approval
        </p>

      </form>
    </div>
  );
};
