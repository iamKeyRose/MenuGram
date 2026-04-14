import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useTelegram } from './hooks/useTelegram';
import { ServiceMode } from './components/ServiceMode';
import { RestaurantCard } from './components/RestaurantCard';
import { createRoot } from 'react-dom/client'; // Import this

function App() {
  const { user, expand, ready } = useTelegram();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    expand();
    ready();
    checkUser();
  }, [user]);

  async function checkUser() {
    if (!user?.id) return;
    
    // Check if user exists in your 'customers' table
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('telegram_id', user.id)
      .single();

    if (data) {
      setIsRegistered(true);
      fetchRestaurants();
    } else {
      setIsRegistered(false);
    }
  }

  async function fetchRestaurants() {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .order('is_open', { ascending: false });
    setRestaurants(data || []);
  }

  // 1. Show Loading if we don't have user info yet
  if (!user) return <div className="p-10 text-center">Connecting to Telegram...</div>;

  // 2. Show Registration Form if not registered
  if (!isRegistered) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Registration Required</h1>
        <p className="mt-4">Please register to view the menu.</p>
        {/* We will add your registration form component here next */}
      </div>
    );
  }

  // 3. Main App Content
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="p-4 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-blue-600">MenuGram</h1>
        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
          {user?.username || 'Guest'}
        </div>
      </header>

      <main className="p-4 space-y-4">
        {restaurants.length > 0 ? (
          restaurants.map(res => (
            <RestaurantCard key={res.id} restaurant={res} />
          ))
        ) : (
          <p className="text-center text-gray-500">No restaurants available.</p>
        )}
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

// 4. THE CRITICAL MOUNT LOGIC
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
}

export default App;
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

