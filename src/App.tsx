import { useState } from 'react';
import { Home } from './pages/home';
import { Search } from './pages/search'; // Added this
import { Orders } from './pages/orders';
import { Profile } from './pages/profile';
import { BottomNav } from './components/bottomNav'; // Matching your lowercase naming
import { useTelegram } from './hooks/useTelegram';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { user } = useTelegram();

  const renderPage = () => {
    switch (activeTab) {
      case 'home': 
        return <Home />;
      case 'search': 
        return <Search />;
      case 'orders': 
        return <Orders />;
      case 'profile': 
        return <Profile />;
      case 'favorites': 
        return <div className="p-10 text-center font-bold text-gray-400">Favorites Coming Soon...</div>;
      default: 
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      <main className="pb-32">
        {renderPage()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
    
