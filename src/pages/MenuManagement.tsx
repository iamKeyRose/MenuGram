import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const MenuManagement = ({ restaurantId, onComplete }: { restaurantId: string, onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeStep, setActiveStep] = useState<'category' | 'item'>('item');

  const [itemData, setItemData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_fasting_compatible: false,
    is_todays_special: false
  });

  // Load categories defined in Table 5
  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('menu_categories').select('*').order('display_order');
      if (data) setCategories(data);
    };
    fetchCats();
  }, []);

  const handleSaveItem = async () => {
    if (!itemData.name || !itemData.price || !itemData.category_id) {
      return alert("Please fill in Name, Price, and Category.");
    }

    setLoading(true);
    const { error } = await supabase.from('menu_items').insert([{
      restaurant_id: restaurantId,
      category_id: itemData.category_id,
      name: itemData.name,
      description: itemData.description,
      price: parseFloat(itemData.price),
      is_available: true,
      is_fasting_compatible: itemData.is_fasting_compatible,
      is_todays_special: itemData.is_todays_special
    }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Item added!");
      setItemData({ ...itemData, name: '', description: '', price: '' });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter">Build Menu</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
          Adding items to your digital kitchen
        </p>
      </header>

      <div className="space-y-4">
        {/* Item Name */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
          <input 
            className="w-full p-4 bg-transparent font-black outline-none text-sm"
            placeholder="Item Name (e.g. Special Tibs)"
            value={itemData.name}
            onChange={e => setItemData({...itemData, name: e.target.value})}
          />
        </div>

        {/* Category Selection (Required for Table 6 FK) */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
          <select 
            className="w-full p-4 bg-transparent font-bold outline-none text-sm text-slate-500"
            value={itemData.category_id}
            onChange={e => setItemData({...itemData, category_id: e.target.value})}
          >
            <option value="">Select Category...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
            <input 
              type="number"
              className="w-full p-4 bg-transparent font-black outline-none text-sm"
              placeholder="Price (AED)"
              value={itemData.price}
              onChange={e => setItemData({...itemData, price: e.target.value})}
            />
          </div>
          <div className="flex items-center justify-around bg-slate-50 rounded-[1.5rem] px-2">
             <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                <input 
                  type="checkbox" 
                  checked={itemData.is_fasting_compatible}
                  onChange={e => setItemData({...itemData, is_fasting_compatible: e.target.checked})}
                /> Fasting
             </label>
             <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                <input 
                  type="checkbox" 
                  checked={itemData.is_todays_special}
                  onChange={e => setItemData({...itemData, is_todays_special: e.target.checked})}
                /> Special
             </label>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm">
          <textarea 
            className="w-full p-4 bg-transparent font-medium outline-none text-sm h-24"
            placeholder="Description (ingredients, spicy level, etc.)"
            value={itemData.description}
            onChange={e => setItemData({...itemData, description: e.target.value})}
          />
        </div>

        <button 
          onClick={handleSaveItem}
          disabled={loading}
          className="w-full bg-black text-white p-5 rounded-[2rem] font-black shadow-lg active:scale-95 transition-all mt-4"
        >
          {loading ? "SAVING..." : "ADD ITEM TO MENU"}
        </button>

        <button 
          onClick={onComplete}
          className="w-full p-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
        >
          Finished Building Menu
        </button>
      </div>
    </div>
  );
};
