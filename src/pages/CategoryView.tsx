import React from 'react';
import { ArrowLeft, Play } from 'lucide-react';

export const CategoryView = ({ title, restaurants, ads, onBack }: any) => {
  // Filter ads specifically for this category to show in the 4x4 priority boxes
  const featuredAds = ads.slice(0, 4); 

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black uppercase italic tracking-tighter">{title}</h2>
      </div>

      {/* 4x4 PRIORITY CAROUSEL GRID (The "Ad Priority" zone) */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-8">
        {featuredAds.map((ad: any) => (
          <div key={ad.id} className="relative h-32 rounded-3xl overflow-hidden bg-blue-600 shadow-lg group">
            {ad.image_url.includes('.mp4') ? (
              <video src={ad.image_url} autoPlay muted loop className="w-full h-full object-cover opacity-80" />
            ) : (
              <img src={ad.image_url} className="w-full h-full object-cover opacity-80" alt="" />
            )}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 text-center">
              <p className="text-white text-[10px] font-black uppercase tracking-widest leading-tight">{ad.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* REMAINING RESTAURANTS GRID */}
      <div className="px-6 grid grid-cols-2 gap-6">
        {restaurants.map((res: any) => (
          <div key={res.id} className="space-y-2">
            <div className="relative h-40 rounded-[2rem] overflow-hidden border border-slate-50">
              <img src={res.cover_url} className="w-full h-full object-cover" alt="" />
            </div>
            <p className="font-black text-sm text-slate-800 px-1">{res.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
