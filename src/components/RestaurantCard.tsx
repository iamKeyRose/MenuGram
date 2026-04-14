export const RestaurantCard = ({ restaurant }: { restaurant: any }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative h-40">
        <img src={restaurant.cover_url} className="w-full h-full object-cover" alt={restaurant.name} />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
          ⭐ {restaurant.rating} ({restaurant.review_count})
        </div>
        {!restaurant.is_open && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
            CLOSED
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <img src={restaurant.logo_url} className="w-10 h-10 rounded-full border shadow-sm" />
          <div>
            <h3 className="font-bold text-gray-900">{restaurant.name}</h3>
            <p className="text-xs text-gray-500">{restaurant.city} • {restaurant.subscription_tier}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
