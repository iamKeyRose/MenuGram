import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, MapPin, ShieldCheck, Rocket, ArrowRight } from 'lucide-react';

interface RestaurantPageProps {
  restaurant: any;
  onBack: () => void;
  onItemClick: (item: any) => void;
  onViewAll: () => void; // Essential fix for navigation
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop";

export const RestaurantPage = ({ restaurant, onBack, onItemClick, onViewAll }: RestaurantPageProps) => {
  const [menuData, setMenuData] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantMenu = async () => {
      setLoading(true);
      try {
        const [catsRes, itemsRes] = await Promise.all([
          supabase.from('menu_categories').select('*').order('display_order'),
          supabase.from('menu_items')
            .select(`
              *,
              restaurants (name, is_verified, city, logo_url)
            `)
            .eq('restaurant_id', restaurant.id)
        ]);

        const allItems = itemsRes.data || [];
        const cats = catsRes.data || [];
        
        const organized: Record<string, any[]> = {};
        cats.forEach(cat => {
          const catItems = allItems.filter(item => item.category_id === cat.id);
          if (catItems.length > 0) {
            organized[cat.id] = catItems;
          }
        });

        setCategories(cats.filter(c => organized[c.id])); 
        setMenuData(organized);
      } catch (err) {
        console.error("Error fetching restaurant menu:", err);
      } finally {
        setLoading(false);
      }
    };

    if (restaurant?.id) fetchRestaurantMenu();
  }, [restaurant]);

  if (!restaurant) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-[#FDFDFD] overflow-y-auto pb-20 animate-in slide-in-from-bottom duration-300">
      {/* HEADER / COVER */}
      <div className="relative h-60 w-full">
        <img src={restaurant.logo_url || FALLBACK_IMAGE} className="w-full h-full object-cover" alt={restaurant.name} />
        <div className="absolute inset-0 bg-black/40" />
        <button onClick={onBack} className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl active:scale-90 transition-all">
          <ChevronLeft size={20} className="text-slate-900" />
        </button>
      </div>

      {/* RESTAURANT CONTENT */}
      <div className="p-6 -mt-10 bg-[#FDFDFD] rounded-t-[40px] relative z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{restaurant.name}</h1>
              {restaurant.is_verified && <ShieldCheck size={18} className="text-blue-600" />}
            </div>
            <p className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <MapPin size={10} /> {restaurant.city || 'Dubai'}
            </p>
          </div>
          <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black italic uppercase">
            {restaurant.rating || '4.8'} ★
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] font-black uppercase text-slate-400">Loading Menu...</p>
          </div>
        ) : (
          <div className="space-y-12 mt-8">
            {categories.map((cat, idx) => {
              const items = menuData[cat.id] || [];
              const shouldSwipe = items.length > 4;

              return (
                <React.Fragment key={cat.id}>
                  <section>
                    <div className="flex justify-between items-end mb-4 px-1">
                      <h2 className="text-lg font-black tracking-tighter uppercase italic text-slate-900 border-l-4 border-blue-600 pl-3 leading-none">
                        {cat.name}
                      </h2>
                      {/* FIXED: onClick added back to the original button style */}
                      <button 
                        onClick={onViewAll}
                        className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 tracking-tighter active:opacity-50 transition-opacity"
                      >
                        View All <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className={
                      shouldSwipe 
                      ? "flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 px-1" 
                      : "grid grid-cols-2 gap-4 px-1"
                    }>
                      {items.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => onItemClick(item)}
                          className={`bg-white border border-slate-100 p-3 rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer flex-shrink-0 ${
                            shouldSwipe ? "w-[160px] snap-start" : "w-full"
                          }`}
                        >
                          <img 
                            src={item.image_url || FALLBACK_IMAGE} 
                            className="w-full aspect-square object-cover rounded-xl mb-2" 
                            alt={item.name}
                          />
                          <h3 className="text-[11px] font-black text-slate-800 truncate uppercase leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-[10px] font-black text-blue-600 mt-1">
                            {item.price} AED
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* RESTORED: Chef's Choice Banner (The missing 150+ line content) */}
                  {idx < categories.length - 1 && (
                    <div className="py-2">
                      <div className="bg-slate-900 h-24 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden border border-slate-800">
                        <div className="relative z-10">
                          <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">Chef's Choice</p>
                          <h4 className="text-white font-black italic uppercase text-sm leading-none">Top Rated in {cat.name}</h4>
                        </div>
                        <Rocket size={40} className="text-white/10 absolute -right-2 -bottom-2 rotate-12" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
