import { useState } from 'react';
import { Home } from './pages/home';
import { Search } from './pages/search'; 
import { Orders } from './pages/orders';
import { Profile } from './pages/profile';
import { BottomNav } from './components/bottomNav'; 
import { useTelegram } from './hooks/useTelegram';
import { useAuth } from './hooks/useAuth'; // ADDED: New hook for database sync

function App() {
  const { dbUser, loading } = useAuth(); // ADDED: Gets user data from your app_users table
  const [activeTab, setActiveTab] = useState('home');
  const { user } = useTelegram();

  // ADDED: Simple check to ensure we have the user role before showing the profile
  if (loading) {
    return <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">Loading...</div>;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home': 
        return <Home />;
      case 'search': 
        return <Search />;
      case 'orders': 
        return <Orders />;
           case 'owner-reg': 
  return <OwnerRegistration dbUser={dbUser} onComplete={() => setActiveTab('profile')} />;

      case 'profile': 
  return <Profile dbUser={dbUser} setActiveTab={setActiveTab} />;
 // UPDATED: Now passes dbUser to the Profile page
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
