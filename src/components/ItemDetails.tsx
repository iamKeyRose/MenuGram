import React from 'react';
// Added Percent to the imports here
import { ChevronLeft, ShoppingCart, Star, Clock, ShieldCheck, Percent } from 'lucide-react';

interface ItemDetailsProps {
  item: any;
  onBack: () => void;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop";

export const ItemDetails = ({ item, onBack }: ItemDetailsProps) => {
  if (!item) return null;

  return (
    /* UPDATED z-index to 120 and changed animation to slide-in-from-bottom for a more premium feel */
    <div className="fixed inset-0 z-[120] bg-white overflow-y-auto pb-32 animate-in slide-in-from-bottom duration-300">
      {/* HERO IMAGE SECTION */}
      <div className="relative h-[45vh] w-full">
        <img 
          src={item.image_url || FALLBACK_IMAGE} 
          className="w-full h-full object-cover" 
          alt={item.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl active:scale-90 transition-all"
        >
          <ChevronLeft size={20} className="text-slate-900" />
        </button>
      </div>
      
      {/* CONTENT SECTION */}
      <div className="p-8 -mt-10 bg-white rounded-t-[40px] relative z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-start mb-6">
          <div className="max-w-[70%]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                {/* Optional chaining added here for safety */}
                {item.restaurants?.name || 'Exclusive'}
              </span>
              {item.restaurants?.is_verified && (
                <ShieldCheck size={12} className="text-blue-500" />
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 italic uppercase leading-none">
              {item.name}
            </h2>
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-2xl shadow-lg shadow-slate-200">
            <p className="text-xl font-black text-white leading-none">
              {item.price}<span className="text-[10px] ml-1 uppercase">AED</span>
            </p>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
          <div className="flex flex-col items-center gap-1 flex-1 border-r border-slate-200">
            <div className="flex items-center gap-1 text-blue-600">
              <Star size={14} className="fill-blue-600" />
              <span className="text-xs font-black text-slate-900">4.9</span>
            </div>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Rating</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 border-r border-slate-200">
            <div className="flex items-center gap-1 text-slate-900">
              <Clock size={14} />
              <span className="text-xs font-black text-slate-900">25 min</span>
            </div>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="flex items-center gap-1 text-green-600">
              <Percent size={14} />
              <span className="text-xs font-black text-slate-900">Best Price</span>
            </div>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Guaranteed</span>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-4 mb-10">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">About this dish</h4>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {item.description || "Crafted with premium ingredients, this signature dish brings a balance of textures and flavors."}
          </p>
        </div>

        {/* ACTION BUTTON */}
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
          <button className="w-full bg-slate-900 text-white h-20 rounded-[24px] flex items-center justify-between px-8 shadow-2xl shadow-slate-300 active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <ShoppingCart size={24} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Total Price</span>
                <span className="text-lg font-black uppercase italic tracking-tight leading-none">Add to Basket</span>
              </div>
            </div>
            <span className="text-xl font-black">{item.price} AED</span>
          </button>
        </div>
      </div>
    </div>
  );
};
