import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useTelegram } from './hooks/useTelegram';
import { ServiceMode } from './components/ServiceMode';
import { RestaurantCard } from './components/RestaurantCard';

function App() {
  const { tg, user, expand, ready } = useTelegram();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [showModeSelector, setShowModeSelector] = useState(true);

  useEffect(() => {
    expand();
    ready();
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .order('is_open', { ascending: false });
    setRestaurants(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="p-4 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-blue-600">MenuGram</h1>
        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
          {user?.username || 'Guest'}
        </div>
      </header>

      <main className="p-4 space-y-4">
        {restaurants.map(res => (
          <RestaurantCard key={res.id} restaurant={res} />
        ))}
      </main>

      {showModeSelector && (
        <ServiceMode onConfirm={(mode, table) => {
          console.log(`Mode: ${mode}, Table: ${table}`);
          setShowModeSelector(false);
        }} />
      )}
    </div>
  );
}

export default App;

