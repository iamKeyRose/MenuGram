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

  // 1. FETCH ALL DATA & ORGANIZE INTO CONTAINERS
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [catsRes, adsRes, resRes] = await Promise.all([
          supabase.from('menu_categories').select('*').order('display_order'),
          supabase.from('ads').select('*').eq('is_active', true),
          supabase.from('restaurants').select('*')
        ]);

        const allRestaurants = resRes.data || [];
        const cats = catsRes.data || [];
        
        const organized: Record<string, any[]> = {
          'featured': allRestaurants.filter(r => r.subscription_tier === 'premium').slice(0, 8),
          'high_rated': [...allRestaurants].sort((a, b) => b.rating - a.rating).slice(0, 8),
          'special_discount': allRestaurants.filter(r => r.has_discount).slice(0, 8),
        };

        // Map Database Categories to Containers
        cats.forEach(cat => {
          organized[cat.id] = allRestaurants
            .filter(r => r.category_id === cat.id || r.category_slug === cat.slug)
            // Priority Logic: Show verified/paying restaurants first in the carousel
            .sort((a, b) => (b.is_verified === a.is_verified ? 0 : b.is_verified ? 1 : -1));
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="pb-32 bg-[#FDFDFD] min-h-screen">
      {/* HEADER */}
      <header className="p-6 bg-white flex justify-between items-center sticky top-0 z-30 border-b border-slate-50">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Delivering To</span>
          <h1 className="text-sm font-black tracking-tight flex items-center gap-1 italic">
            Dubai Marina, UAE <ArrowRight size={12} className="text-slate-300" />
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-200">
          {user?.first_name?.[0] || 'U'}
        </div>
      </header>

      {/* TOP MAIN AD CAROUSEL (3s Auto-scroll) */}
      <MainAdCarousel ads={activeAds.filter(a => a.placement === 'home_top')} />

      {/* DYNAMIC CONTAINERS */}
      <div className="mt-8 space-y-12">
        
        {/* Priority Container: Featured */}
        <CategoryRow title="Featured Brands" restaurants={sectionData['featured']} icon={<Rocket size={16}/>} />

        {/* Dynamic Ad Break 1 */}
        <InlineAd ads={activeAds} index={0} />

        {/* High Rated Container */}
        <CategoryRow title="Top Rated" restaurants={sectionData['high_rated']} icon={<Trophy size={16}/>} />

        {/* Database Menu Categories with Ad Interleaving */}
        {categories.map((cat, idx) => (
          <React.Fragment key={cat.id}>
            <CategoryRow 
              title={cat.name} 
              restaurants={sectionData[cat.id]} 
              categorySlug={cat.slug} 
            />
            {/* Show an Ad after every 2 categories */}
            {idx % 2 === 1 && <InlineAd ads={activeAds} index={idx + 1} />}
          </React.Fragment>
        ))}
        
        {/* Special Discount Container */}
        <CategoryRow title="Special Discounts" restaurants={sectionData['special_discount']} icon={<Percent size={16}/>} />
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

// 1. HORIZONTAL SCROLL CONTAINER
const CategoryRow = ({ title, restaurants, icon, categorySlug }: any) => {
  if (!restaurants || restaurants.length === 0) return null;

  return (
    <section className="px-6">
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="text-blue-600">{icon}</div>}
          <h2 className="text-xl font-black tracking-tighter uppercase italic text-slate-900">{title}</h2>
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 hover:text-blue-600 transition-colors">
          More <ArrowRight size={12} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
        {restaurants.map((res: any) => (
          <div key={res.id} className="min-w-[180px] max-w-[180px] group cursor-pointer">
            <div className="relative h-56 w-full rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
              <img 
                src={res.cover_url} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={res.name} 
              />
              {/* Badge for Paid/Verified priority */}
              {res.is_verified && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                </div>
              )}
            </div>
            <h3 className="mt-3 text-sm font-black text-slate-800 truncate px-1">{res.name}</h3>
            <div className="flex items-center justify-between px-1">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">⭐ {res.rating}</p>
               <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">{res.city}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// 2. MAIN AD CAROUSEL
const MainAdCarousel = ({ ads }: any) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % ads.length), 3000);
    return () => clearInterval(timer);
  }, [ads]);

  if (ads.length === 0) return null;

  const current = ads[index];
  const isVideo = current.image_url?.match(/\.(mp4|webm|mov)$/i);

  return (
    <div className="px-6 mt-6">
      <div className="relative h-48 w-full rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl shadow-blue-100 border-4 border-white">
        {isVideo ? (
           <video src={current.image_url} autoPlay muted loop className="w-full h-full object-cover opacity-80" />
        ) : (
           <img src={current.image_url} className="w-full h-full object-cover opacity-80" alt="" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
           <span className="text-[8px] font-black uppercase text-blue-400 tracking-[0.2em] mb-2">Exclusive Partner</span>
           <h4 className="text-white font-black text-2xl tracking-tighter uppercase italic leading-none">{current.title}</h4>
        </div>
      </div>
    </div>
  );
};

// 3. INLINE AD BREAK
const InlineAd = ({ ads, index }: any) => {
  const ad = ads[index % ads.length];
  if (!ad) return null;

  return (
    <div className="px-6 py-2">
      <div className="bg-slate-900 h-28 rounded-[2.5rem] flex items-center justify-between px-10 overflow-hidden relative group cursor-pointer">
        <div className="relative z-10">
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Recommended</p>
          <h5 className="font-black text-white italic uppercase text-lg leading-tight group-hover:text-blue-400 transition-colors">{ad.title}</h5>
        </div>
        <div className="absolute right-0 w-1/2 h-full">
           <img src={ad.image_url} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000" alt="" />
           <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900" />
        </div>
      </div>
    </div>
  );
};
