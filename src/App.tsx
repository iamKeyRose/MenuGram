import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabase';
import { useTelegram } from './hooks/useTelegram';
import { ServiceMode } from './components/ServiceMode';
import { RestaurantCard } from './components/RestaurantCard';

function App() {
  const { user, expand, ready } = useTelegram();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    expand();
    ready();
    if (user?.id) {
      checkUser();
    } else {
      setCheckingUser(false);
    }
  }, [user]);

  async function checkUser() {
    try {
      const { data, error } = await supabase
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
    } catch (err) {
      console.error("User check failed", err);
    } finally {
      setCheckingUser(false);
    }
  }

  async function fetchRestaurants() {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .order('is_open', { ascending: false });
    setRestaurants(data || []);
  }

  // 1. Loading State
  if (checkingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-blue-600 font-bold">Connecting to MenuGram...</p>
      </div>
    );
  }

  // 2. Registration State (If user is not in 'customers' table)
  if (!isRegistered) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-2xl font-black text-blue-600">Welcome!</h1>
        <p className="text-gray-600">Please register your details to view the menu.</p>
        {/* We will insert the RegistrationForm component here next */}
        <button 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
          onClick={() => alert("Registration form coming in the next step!")}
        >
          Start Registration
        </button>
      </div>
    );
  }

  // 3. Main App Content (Shown only if registered)
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
          <p className="text-center text-gray-500 mt-10">No restaurants found.</p>
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

// 4. MOUNTING LOGIC (The Glue)
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;


