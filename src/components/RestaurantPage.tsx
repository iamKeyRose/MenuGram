import React from 'react';
import { ChevronLeft, MapPin, Star, ShieldCheck, Clock, Phone, Globe } from 'lucide-react';

interface RestaurantPageProps {
  restaurant: any;
  onBack: () => void;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop";

export const RestaurantPage = ({ restaurant, onBack }: RestaurantPageProps) => {
  if (!restaurant) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
      {/* COVER IMAGE */}
      <div className="relative h-64 w-full bg-slate-100">
        <img 
          src={restaurant.logo_url || FALLBACK_IMAGE} 
          className="w-full h-full object-cover" 
          alt={restaurant.name} 
        />
        <div className="absolute inset-0 bg-black/20" />
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl active:scale-90 transition-all"
        >
          <ChevronLeft size={20} className="text-slate-900" />
        </button>
      </div>

      {/* RESTAURANT INFO */}
      <div className="p-8 -mt-10 bg-white rounded-t-[40px] relative z-10 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                {restaurant.name}
              </h1>
              {restaurant.is_verified && <ShieldCheck size={18} className="text-blue-600" />}
            </div>
            <p className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <MapPin size={10} /> {restaurant.city || 'Dubai, UAE'}
            </p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-2xl flex flex-col items-center">
             <div className="flex items-center gap-1 text-blue-600">
                <Star size={14} className="fill-blue-600" />
                <span className="text-sm font-black text-slate-900">4.8</span>
             </div>
             <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">Reviews</span>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 gap-3 my-8">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Clock size={16} className="text-slate-400 mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
            <p className="text-xs font-black text-green-600 uppercase italic">Open Now</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Phone size={16} className="text-slate-400 mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Contact</p>
            <p className="text-xs font-black text-slate-900 uppercase italic">Support Chat</p>
          </div>
        </div>

        {/* ABOUT SECTION */}
        <div className="space-y-4 mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">About the Merchant</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Discover a unique culinary experience at {restaurant.name}. Known for high-quality standards and rapid delivery, this merchant is one of our top-rated partners in {restaurant.city || 'the area'}.
          </p>
        </div>

        {/* ACTION BUTTON */}
        <button className="w-full bg-slate-900 text-white h-16 rounded-[20px] font-black uppercase italic tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all mb-4">
          Explore Menu
        </button>
        
        <button className="w-full bg-slate-100 text-slate-500 h-16 rounded-[20px] font-black uppercase italic tracking-widest active:scale-95 transition-all">
          View Photos
        </button>
      </div>
    </div>
  );
};
