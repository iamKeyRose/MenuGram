import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';

export const Home = () => {
  const { user } = useTelegram();
  
  // Data States
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeAds, setActiveAds] = useState<any[]>([]);
  
  // Filter & Pagination States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentAd, setCurrentAd] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 1. ADS CAROUSEL LOGIC (3s Loop)
  useEffect(() => {
    if (activeAds.length > 0) {
      const timer = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % activeAds.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [activeAds]);

  // 2. INITIAL FETCH (Ads & Categories)
  useEffect(() => {
    const fetchInitial = async () => {
      const [cats, adsData] = await Promise.all([
        supabase.from('menu_categories').select('*').order('display_order'),
        supabase.from('ads').select('*').eq('is_active', true).gt('ends_at', new Date().toISOString())
      ]);
      setCategories(cats.data || []);
      setActiveAds(adsData.data || []);
    };
    fetchInitial();
  }, []);

  // 3. INFINITE SCROLL FETCH (Restaurants)
  const fetchRestaurants = useCallback(async (pageNum: number, catSlug: string) => {
    setLoading(true);
    const pageSize = 5;
    const start = pageNum * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('is_open', true)
      .range(start, end);

    if (catSlug !== 'all') {
      // Filter logic: This assumes a relationship exists or you filter by a category field
      query = query.eq('category_slug', catSlug); 
    }

    const { data } = await query;
    if (data) {
      setRestaurants(prev => pageNum === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === pageSize);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRestaurants(page, selectedCategory);
  }, [page, selectedCategory, fetchRestaurants]);

  // 4. INTERSECTION OBSERVER (Detect Bottom)
  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback((node: any) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="animate-in fade-in duration-700">
      {/* HEADER */}
      <header className="p-6 bg-white/90 backdrop-blur-md flex justify-between items-center rounded-b-[2.5rem] sticky top-0 z-30 border-b border-gray-50">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Delivering To</span>
          <h1 className="text-sm font-bold flex items-center gap-1">Dubai Marina, UAE <span className="text-[8px]">▼</span></h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
          {user?.first_name?.[0] || 'G'}
        </div>
      </header>

      {/* INFINITY AD CAROUSEL */}
      <section className="mt-6 px-6">
        <div className="relative h-48 w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-blue-50 bg-slate-900">
          {activeAds.map((ad, i) => (
            <div key={ad.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentAd ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={ad.image_url} className="w-full h-full object-cover opacity-60 scale-110" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent p-8 flex flex-col justify-end">
                <h3 className="text-white text-2xl font-black italic uppercase leading-none">{ad.title}</h3>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 right-8 z-20 flex gap-1">
            {activeAds.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === currentAd ? 'w-6 bg-blue-500' : 'w-2 bg-white/20'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC CATEGORIES */}
      <section className="mt-8 px-6">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => { setSelectedCategory('all'); setPage(0); }}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] transition-all ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            ALL
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.slug); setPage(0); }}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] whitespace-nowrap transition-all ${selectedCategory === cat.slug ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white text-slate-400 border border-slate-100'}`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* INFINITE RESTAURANT FEED */}
      <main className="mt-8 px-6 space-y-10 pb-12">
        {restaurants.map((res, index) => (
          <div 
            key={res.id} 
            ref={index === restaurants.length - 1 ? lastElementRef : null}
            className="group active:scale-[0.98] transition-all"
          >
            <div className="relative h-64 w-full rounded-[3rem] overflow-hidden shadow-xl shadow-slate-200">
              <img src={res.cover_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">⭐ {res.rating}</span>
                {res.is_verified && <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Verified</span>}
              </div>
            </div>
            <div className="mt-5 flex justify-between items-start px-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{res.name}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">{res.city} • {res.description?.slice(0, 40)}...</p>
              </div>
              <button className="bg-blue-50 p-3 rounded-2xl text-blue-600 font-bold">→</button>
            </div>
          </div>
        ))}
        {loading && <div className="text-center py-10 font-black text-blue-600 animate-pulse tracking-widest uppercase text-xs">Loading More...</div>}
      </main>
    </div>
  );
};
        
