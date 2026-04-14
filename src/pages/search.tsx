import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from '../hooks/useTelegram';

export const Search = () => {
  const { user } = useTelegram(); // Get the user info
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    
    // 1. Search restaurants
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error("Search error:", error);
    } else {
      setResults(data || []);
      
      // 2. Log to analytics (Silently, so it doesn't crash the UI)
      try {
        await supabase.from('search_analytics').insert({
          query: query,
          results_count: data?.length || 0,
          // user_id: user?.id // Only uncomment this if your user.id matches the UUID format in DB
        });
      } catch (logError) {
        console.warn("Analytics failed to log", logError);
      }
    }

    setLoading(false);
  };

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <form onSubmit={handleSearch} className="relative mb-8">
        <input 
          type="text"
          placeholder="Search food or restaurants..."
          className="w-full bg-white border border-slate-100 p-4 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="absolute right-4 top-4 text-blue-600 font-black">
          GO
        </button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length > 0 ? (
          results.map(res => (
            <div key={res.id} className="flex gap-4 items-center bg-white p-4 rounded-[1.5rem] border border-slate-50 shadow-sm active:scale-95 transition-transform">
              <img 
                src={res.logo_url || 'https://via.placeholder.com/150'} 
                className="w-12 h-12 rounded-xl object-cover bg-slate-100" 
                alt={res.name}
              />
              <div>
                <h4 className="font-black text-slate-800">{res.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {res.city} • ⭐ {res.rating || 'N/A'}
                </p>
              </div>
            </div>
          ))
        ) : query && !loading ? (
          <p className="text-center text-slate-400 font-bold mt-10">No restaurants found for "{query}"</p>
        ) : null}
      </div>
    </div>
  );
};
