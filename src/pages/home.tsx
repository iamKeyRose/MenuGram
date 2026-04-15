import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';
import { ArrowRight, Star, Trophy, Percent, Rocket, LayoutGrid, MapPin, Search, Filter, X } from 'lucide-react';
import { ItemDetails } from '../components/ItemDetails';
import { RestaurantPage } from '../components/RestaurantPage';

// Global Placeholders for empty/broken data
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop";
const AD_PLACEHOLDER = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop";

export const Home = () => {
  const { user } = useTelegram();
  
  // VIEW TRACKING & SELECTION
  const [view, setView] = useState<'home' | 'categories' | 'nearby'>('home');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null); 
  const [searchQuery, setSearchQuery] = useState('');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [activeAds, setActiveAds] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]); 
  const [sectionData, setSectionData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [catsRes, adsRes, itemsRes, resRes] = await Promise.all([
          supabase.from('menu_categories').select('*').order('display_order'),
          supabase.from('ads').select('*').eq('is_active', true),
          supabase.from('menu_items').select(`
            *,
            restaurants!inner (name, is_verified, city, logo_url)
          `),
          supabase.from('restaurants').select('*')
        ]);

        const allItems = itemsRes.data || [];
        const cats = catsRes.data || [];
        
        const organized: Record<string, any[]> = {
          'featured': allItems.filter(i => i.is_featured),
          'special_discount': allItems.filter(i => i.price < (i.original_price || i.price)),
          'all': allItems 
        };

        cats.forEach(cat => {
          organized[cat.id] = allItems
            .filter(item => item.category_id === cat.id)
            .sort((a, b) => (b.restaurants?.is_verified ? 1 : -1));
        });

        setCategories(cats);
        setActiveAds(adsRes.data || []);
        setRestaurants(resRes.data || []);
        setSectionData(organized);
      } catch (err) {
        console.error("Home Load Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.city && r.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        <div onClick={() => setView('home')} className="cursor-pointer">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Delivering To</span>
          <h1 className="text-sm font-black tracking-tight italic text-slate-900 flex items-center gap-1">
            Dubai Marina, UAE <ArrowRight size={12} className="text-slate-300" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
           {view !== 'home' && (
             <button onClick={() => setView('home')} className="p-2 bg-slate-100 rounded-lg active:scale-90 transition-all">
               <X size={16} className="text-slate-900" />
             </button>
           )}
           <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-200">
            {user?.first_name?.[0] || 'U'}
           </div>
        </div>
      </header>

      {/* SEARCH BAR */}
      {view === 'nearby' && (
        <div className="px-6 py-4 bg-white border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search city, area, or restaurant..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-blue-600 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600" size={16} />
          </div>
        </div>
      )}

      {/* CATEGORY PILLS */}
      <div className="flex gap-2 overflow-x-auto px-6 py-4 no-scrollbar bg-white">
        {categories.map(cat => (
          <button key={cat.id} className="whitespace-nowrap px-5 py-1.5 rounded-lg bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 active:bg-blue-600 active:text-white transition-colors">
            {cat.name}
          </button>
        ))}
      </div>

      {/* DISCOVERY BUTTONS */}
      <div className="grid grid-cols-2 gap-3 px-6 mb-4">
        <button 
          onClick={() => setView('categories')}
          className={`flex items-center gap-3 border p-3 rounded-2xl active:scale-95 transition-all shadow-sm ${view === 'categories' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}
        >
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
            <LayoutGrid size={16} />
          </div>
          <p className="text-[10px] font-black uppercase italic text-slate-900 leading-none">All Categories</p>
        </button>

        <button 
          onClick={() => setView('nearby')}
          className={`flex items-center gap-3 border p-3 rounded-2xl active:scale-95 transition-all shadow-sm ${view === 'nearby' ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200'}`}
        >
          <div className="bg-slate-900 p-2 rounded-xl text-white shadow-md shadow-slate-200">
            <MapPin size={16} />
          </div>
          <p className="text-[10px] font-black uppercase italic text-slate-900 leading-none">Find Nearby</p>
        </button>
      </div>

      {/* VIEW SWITCHER */}
      {view === 'home' && (
        <>
          <MainAdCarousel ads={activeAds.filter(a => a.placement === 'home_top' || a.placement === 'home_screen')} />
          <div className="mt-8 space-y-12">
            <MenuGrid title="Featured Selection" items={sectionData['featured']} icon={<Rocket size={16}/>} onItemClick={setSelectedItem} />
            <div onClick={() => setSelectedRestaurant(restaurants[0])} className="cursor-pointer">
               <InlineAd ads={activeAds} index={0} />
            </div>
            {categories.map((cat, idx) => (
              <React.Fragment key={cat.id}>
                <MenuGrid title={cat.name} items={sectionData[cat.id]} onItemClick={setSelectedItem} />
                {idx % 2 === 1 && <InlineAd ads={activeAds} index={idx + 1} />}
              </React.Fragment>
            ))}
            <MenuGrid title="Massive Discounts" items={sectionData['special_discount']} icon={<Percent size={16}/>} onItemClick={setSelectedItem} />
          </div>
        </>
      )}

      {view === 'categories' && (
        <div className="mt-4">
          <MenuGrid title="Full Menu Catalog" items={sectionData['all']} onItemClick={setSelectedItem} />
        </div>
      )}

      {view === 'nearby' && (
        <div className="px-6 mt-4 space-y-4">
          <h2 className="text-lg font-black tracking-tighter uppercase italic text-slate-900">Nearby Restaurants</h2>
          {filteredRestaurants.length > 0 ? filteredRestaurants.map(res => (
            <div 
              key={res.id} 
              onClick={() => setSelectedRestaurant(res)} 
              className="bg-white border border-slate-100 p-4 rounded-2xl flex gap-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <img 
                src={res.logo_url || FALLBACK_IMAGE} 
                onError={(e: any) => { e.target.src = FALLBACK_IMAGE; }}
                className="w-16 h-16 rounded-xl object-cover bg-slate-50" 
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-slate-900 uppercase italic text-sm leading-tight">{res.name}</h3>
                  {res.is_verified && <Star size={10} className="text-blue-600 fill-blue-600" />}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">{res.city || 'Dubai'}</p>
                <div className="flex gap-2">
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">View Menu</span>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-center py-10 text-xs font-bold text-slate-400 uppercase italic">No restaurants found in this area</p>
          )}
        </div>
      )}

      {/* OVERLAYS */}
      {selectedRestaurant && (
        <RestaurantPage 
          restaurant={selectedRestaurant} 
          onBack={() => setSelectedRestaurant(null)} 
          onItemClick={(item) => setSelectedItem(item)} 
          // NEW FEATURE FUNCTION: Closes overlay and switches view
          onViewAll={() => {
            setSelectedRestaurant(null);
            setView('categories');
          }}
        />
      )}

      {selectedItem && (
        <ItemDetails 
          item={selectedItem} 
          onBack={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

// --- SUB COMPONENTS (RESTORED ORIGINAL) ---

const MenuGrid = ({ title, items, icon, onItemClick }: any) => {
  if (!items || items.length === 0) return null;
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
      </div>
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {pages.map((pageItems, pageIdx) => (
          <div key={pageIdx} className="min-w-full px-6 snap-start grid grid-cols-3 gap-x-3 gap-y-6">
            {pageItems.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => onItemClick(item)} 
                className="flex flex-col group cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-2 shadow-sm">
                  <img 
                    src={item.image_url || FALLBACK_IMAGE} 
                    onError={(e: any) => { e.target.src = FALLBACK_IMAGE; }}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">{item.restaurants?.name}</span>
                  <h3 className="text-[11px] font-black text-slate-800 truncate leading-tight my-0.5">{item.name}</h3>
                  <span className="text-[10px] font-black text-blue-600">{item.price} <span className="text-[8px]">AED</span></span>
                </div>
              </div>
            ))}
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
  return (
    <div className="px-6 mt-2">
      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
        <img key={current.id} src={current.image_url || AD_PLACEHOLDER} onError={(e: any) => { e.target.src = AD_PLACEHOLDER; }} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent flex flex-col justify-end p-6">
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
        <img src={ad.image_url || AD_PLACEHOLDER} onError={(e: any) => { e.target.src = AD_PLACEHOLDER; }} className="absolute right-0 w-32 h-full object-cover opacity-40" />
      </div>
    </div>
  );
};
