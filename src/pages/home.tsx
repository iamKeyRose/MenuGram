import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';
import { ArrowRight, Star, Flame, Trophy, Percent, Rocket } from 'lucide-react';

export const Home = () => {
  const { user } = useTelegram();
  const [categories, setCategories] = useState<any[]>([]);
  const [activeAds, setActiveAds] = useState<any[]>([]);
  const [sectionData, setSectionData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [catsRes, adsRes, itemsRes] = await Promise.all([
          supabase.from('menu_categories').select('*').order('display_order'),
          supabase.from('ads').select('*').eq('is_active', true),
          supabase.from('menu_items').select(`
            *,
            restaurants!inner (
              name,
              is_verified,
              subscription_tier
            )
          `)
        ]);

        const allItems = itemsRes.data || [];
        const cats = catsRes.data || [];
        
        const organized: Record<string, any[]> = {
          'featured': allItems.filter(i => i.restaurants?.subscription_tier === 'premium').slice(0, 10),
          'special_discount': allItems.filter(i => i.price < (i.original_price || i.price)).slice(0, 10),
        };

        cats.forEach(cat => {
          organized[cat.id] = allItems
            .filter(item => item.category_id === cat.id)
            .sort((a, b) => (b.restaurants?.is_verified === a.restaurants?.is_verified ? 0 : b.restaurants?.is_verified ? 1 : -1));
        });

        setCategories(cats);
        setActiveAds(adsRes.data || []);
        setSectionData(organized);
      } catch (err) {
        console.error("Home Load Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Marketplace...</p>
    </div>
  );

  return (
    <div className="pb-32 bg-[#FDFDFD] min-h-screen">
      {/* HEADER */}
      <header className="p-6 bg-white flex justify-between items-center sticky top-0 z-50 border-b border-slate-50">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Delivering To</span>
          <h1 className="text-sm font-black tracking-tight italic text-slate-900 flex items-center gap-1">
            Dubai Marina, UAE <ArrowRight size={12} className="text-slate-300" />
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-200">
          {user?.first_name?.[0] || 'U'}
        </div>
      </header>

      {/* QUICK CATEGORY PILLS */}
      <div className="flex gap-3 overflow-x-auto px-6 py-4 no-scrollbar bg-white">
        {categories.map(cat => (
          <button key={cat.id} className="whitespace-nowrap px-6 py-2 rounded-full bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
            {cat.name}
          </button>
        ))}
      </div>

      {/* TOP AD CAROUSEL */}
      <MainAdCarousel ads={activeAds.filter(a => a.placement === 'home_top')} />

      <div className="mt-8 space-y-12">
        <CategoryRow title="Featured Dishes" items={sectionData['featured']} icon={<Rocket size={16}/>} />
        
        <InlineAd ads={activeAds} index={0} />

        {/* Dynamic Database Categories */}
        {categories.map((cat, idx) => (
          <React.Fragment key={cat.id}>
            <CategoryRow title={cat.name} items={sectionData[cat.id]} />
            {idx % 2 === 1 && <InlineAd ads={activeAds} index={idx + 1} />}
          </React.Fragment>
        ))}
        
        <CategoryRow title="Massive Deals" items={sectionData['special_discount']} icon={<Percent size={16}/>} />
      </div>
    </div>
  );
};

/* --- SHARED COMPONENTS --- */

const CategoryRow = ({ title, items, icon }: any) => {
  if (!items || items.length === 0) return null;
  return (
    <section className="px-6">
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="text-blue-600">{icon}</div>}
          <h2 className="text-xl font-black tracking-tighter uppercase italic text-slate-900">{title}</h2>
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400">View All</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {items.map((item: any) => (
          <div key={item.id} className="min-w-[170px] max-w-[170px] group">
            <div className="relative h-44 rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
              <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
                <p className="text-[8px] font-black text-slate-800 truncate uppercase">{item.restaurants?.name}</p>
              </div>
            </div>
            <h3 className="mt-3 text-xs font-black text-slate-800 truncate px-1">{item.name}</h3>
            <p className="text-xs font-black text-blue-600 px-1 mt-0.5">{item.price} AED</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const MainAdCarousel = ({ ads }: any) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => setIndex(i => (i + 1) % ads.length), 4000);
    return () => clearInterval(t);
  }, [ads]);

  if (ads.length === 0) return null;
  const current = ads[index];
  const isVideo = current.image_url?.match(/\.(mp4|webm|mov)$/i);

  return (
    <div className="px-6 mt-4">
      <div className="relative h-52 w-full rounded-[3rem] overflow-hidden bg-slate-900 border-4 border-white shadow-xl shadow-slate-200">
        {isVideo ? (
           <video src={current.image_url} autoPlay muted loop className="w-full h-full object-cover opacity-70" />
        ) : (
           <img src={current.image_url} className="w-full h-full object-cover opacity-70" alt="" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-8">
           <h4 className="text-white font-black text-2xl tracking-tighter uppercase italic leading-none">{current.title}</h4>
        </div>
      </div>
    </div>
  );
};

const InlineAd = ({ ads, index }: any) => {
  const ad = ads[index % ads.length];
  if (!ad) return null;
  return (
    <div className="px-6 py-2">
      <div className="bg-slate-900 h-24 rounded-[2.5rem] flex items-center justify-between px-10 overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Recommended</p>
          <h5 className="font-black text-white italic uppercase text-lg">{ad.title}</h5>
        </div>
        <img src={ad.image_url} className="absolute right-0 w-40 h-full object-cover opacity-40" alt="" />
      </div>
    </div>
  );
};
