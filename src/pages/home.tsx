import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';
import { ArrowRight, Star, Trophy, Percent, Rocket } from 'lucide-react';

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
              is_verified
            )
          `)
        ]);

        const allItems = itemsRes.data || [];
        const cats = catsRes.data || [];
        
        const organized: Record<string, any[]> = {
          'featured': allItems.filter(i => i.is_featured),
          'special_discount': allItems.filter(i => i.price < (i.original_price || i.price)),
        };

        cats.forEach(cat => {
          organized[cat.id] = allItems
            .filter(item => item.category_id === cat.id)
            .sort((a, b) => (b.restaurants?.is_verified ? 1 : -1));
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
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Menu...</p>
    </div>
  );

  return (
    <div className="pb-32 bg-[#FDFDFD] min-h-screen font-sans">
      {/* HEADER */}
      <header className="p-6 bg-white flex justify-between items-center sticky top-0 z-50 border-b border-slate-50">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Delivering To</span>
          <h1 className="text-sm font-black tracking-tight italic text-slate-900 flex items-center gap-1">
            Dubai Marina, UAE <ArrowRight size={12} className="text-slate-300" />
          </h1>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-200">
          {user?.first_name?.[0] || 'U'}
        </div>
      </header>

      {/* CATEGORY PILLS */}
      <div className="flex gap-2 overflow-x-auto px-6 py-4 no-scrollbar bg-white">
        {categories.map(cat => (
          <button key={cat.id} className="whitespace-nowrap px-5 py-1.5 rounded-lg bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 active:bg-blue-600 active:text-white transition-colors">
            {cat.name}
          </button>
        ))}
      </div>

      {/* TOP AD CAROUSEL */}
      <MainAdCarousel ads={activeAds.filter(a => a.placement === 'home_top')} />

      {/* DYNAMIC 3x3 CONTAINERS */}
      <div className="mt-8 space-y-12">
        <MenuGrid title="Featured Selection" items={sectionData['featured']} icon={<Rocket size={16}/>} />
        
        <InlineAd ads={activeAds} index={0} />

        {categories.map((cat, idx) => (
          <React.Fragment key={cat.id}>
            <MenuGrid title={cat.name} items={sectionData[cat.id]} />
            {idx % 2 === 1 && <InlineAd ads={activeAds} index={idx + 1} />}
          </React.Fragment>
        ))}
        
        <MenuGrid title="Massive Discounts" items={sectionData['special_discount']} icon={<Percent size={16}/>} />
      </div>
    </div>
  );
};

/* --- 3x3 PAGINATED GRID COMPONENT --- */

const MenuGrid = ({ title, items, icon }: any) => {
  if (!items || items.length === 0) return null;

  // Split items into pages of 9
  const pages: any[][] = [];
  for (let i = 0; i < items.length; i += 9) {
    pages.push(items.slice(i, i + 9));
  }

  return (
    <section className="w-full">
      <div className="flex justify-between items-center mb-5 px-6">
        <div className="flex items-center gap-2">
          {icon && <div className="text-blue-600">{icon}</div>}
          <h2 className="text-lg font-black tracking-tighter uppercase italic text-slate-900">{title}</h2>
        </div>
        <button 
          onClick={() => console.log("Viewing All:", title)}
          className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-90 transition-all"
        >
          View All
        </button>
      </div>

      {/* Horizontal Page Scroller */}
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {pages.map((pageItems, pageIdx) => (
          <div key={pageIdx} className="min-w-full px-6 snap-start grid grid-cols-3 gap-x-3 gap-y-6">
            {pageItems.map((item: any) => (
              <div key={item.id} className="flex flex-col group cursor-pointer active:scale-95 transition-transform">
                {/* Image Icon */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-2 shadow-sm">
                  <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />
                  {item.restaurants?.is_verified && (
                    <div className="absolute top-1.5 right-1.5 bg-blue-600 p-1 rounded-lg shadow-md">
                      <Star size={8} className="text-white fill-white" />
                    </div>
                  )}
                </div>
                
                {/* Metadata */}
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">
                    {item.restaurants?.name}
                  </span>
                  <h3 className="text-[11px] font-black text-slate-800 truncate leading-tight my-0.5">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-black text-blue-600">
                    {item.price} <span className="text-[8px]">AED</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

/* --- AD SUB-COMPONENTS --- */

const MainAdCarousel = ({ ads }: any) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => setIndex(i => (i + 1) % ads.length), 4000);
    return () => clearInterval(t);
  }, [ads]);

  if (ads.length === 0) return null;
  const current = ads[index];

  return (
    <div className="px-6 mt-2">
      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
        <img src={current.image_url} className="w-full h-full object-cover opacity-70" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6">
           <h4 className="text-white font-black text-lg tracking-tight uppercase italic leading-none">{current.title}</h4>
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
      <div className="bg-slate-900 h-20 rounded-2xl flex items-center justify-between px-8 overflow-hidden relative border border-slate-800">
        <div className="relative z-10">
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">Recommended</p>
          <h5 className="font-black text-white italic uppercase text-sm">{ad.title}</h5>
        </div>
        <img src={ad.image_url} className="absolute right-0 w-32 h-full object-cover opacity-40" alt="" />
      </div>
    </div>
  );
};
