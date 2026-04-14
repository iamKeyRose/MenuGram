import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';

export const Home = () => {
  const { user } = useTelegram();
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeAds, setActiveAds] = useState<any[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentAd, setCurrentAd] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 1. ADS CAROUSEL
  useEffect(() => {
    if (activeAds.length > 0) {
      const timer = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % activeAds.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [activeAds]);

  // 2. INITIAL FETCH
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [cats, adsData] = await Promise.all([
          supabase.from('menu_categories').select('*').order('display_order'),
          supabase.from('ads').select('*').eq('is_active', true)
        ]);
        setCategories(cats.data || []);
        setActiveAds(adsData.data || []);
      } catch (err) {
        console.error("Initial fetch failed", err);
      }
    };
    fetchInitial();
  }, []);

  // 3. RESTAURANTS FETCH
  const fetchRestaurants = useCallback(async (pageNum: number, catSlug: string) => {
    setLoading(true);
    const start = pageNum * 5;
    const end = start + 4;

    let query = supabase.from('restaurants').select('*').range(start, end);
    if (catSlug !== 'all') query = query.eq('category_slug', catSlug);

    const { data } = await query;
    if (data) {
      setRestaurants(prev => pageNum === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === 5);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRestaurants(page, selectedCategory);
  }, [page, selectedCategory, fetchRestaurants]);

  // 4. OBSERVER FOR INFINITE SCROLL
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLElement | null) => {
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
    <div className="pb-20">
      {/* HEADER */}
      <header className="p-6 bg-white flex justify-between items-center sticky top-0 z-30 border-b border-gray-100">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase">Delivering To</span>
          <h1 className="text-sm font-bold">Dubai Marina, UAE</h1>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
          {user?.first_name?.[0] || 'U'}
        </div>
      </header>

      {/* ADS */}
      {activeAds.length > 0 && (
        <section className="mt-4 px-6">
          <div className="relative h-40 w-full overflow-hidden rounded-3xl bg-slate-100">
            {activeAds.map((ad, i) => (
              <div key={ad.id} className={`absolute inset-0 transition-opacity duration-700 ${i === currentAd ? 'opacity-100' : 'opacity-0'}`}>
                <img src={ad.image_url} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FEED */}
      <main className="mt-6 px-6 space-y-8">
        {restaurants.map((res, index) => (
          <div 
            key={res.id} 
            ref={index === restaurants.length - 1 ? lastElementRef : null}
            className="block"
          >
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-gray-100">
              <img src={res.cover_url} className="w-full h-full object-cover" alt="" />
            </div>
            <h3 className="mt-3 text-lg font-black">{res.name}</h3>
            <p className="text-xs text-gray-400 uppercase font-bold">{res.city} • ⭐ {res.rating}</p>
          </div>
        ))}
        {loading && <div className="text-center p-4">Loading...</div>}
      </main>
    </div>
  );
};
