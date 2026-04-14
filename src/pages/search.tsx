import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    // 1. Search restaurants by name or city
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(10);

    setResults(data || []);
    
    // 2. Log to search_analytics table
    await supabase.from('search_analytics').insert({
      query: query,
      results_count: data?.length || 0
    });

    setLoading(false);
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSearch} className="relative mb-8">
        <input 
          type="text"
          placeholder="Search food or restaurants..."
          className="w-full bg-white border border-slate-100 p-4 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="absolute right-4 top-4 text-blue-600 font-black">GO</button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center animate-pulse font-black text-blue-600">SEARCHING...</p>
        ) : results.map(res => (
          <div key={res.id} className="flex gap-4 items-center bg-white p-4 rounded-[1.5rem] border border-slate-50">
            <img src={res.logo_url} className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <h4 className="font-black text-slate-800">{res.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{res.city} • ⭐ {res.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
