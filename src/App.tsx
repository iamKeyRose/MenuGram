import { useState } from 'react';
import { Home } from './pages/home';
import { Search } from './pages/search'; 
import { Orders } from './pages/orders';
import { Profile } from './pages/profile';
import { OwnerRegistration } from './pages/OwnerRegistration';
import { MenuManagement } from './pages/MenuManagement'; 
import { BottomNav } from './components/bottomNav'; 
import { useTelegram } from './hooks/useTelegram';
import { useAuth } from './hooks/useAuth';
import { OwnerDashboard } from './pages/OwnerDashboard';

function App() {
  const { dbUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [newResId, setNewResId] = useState<string | null>(null); 
  const { user } = useTelegram();

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
        return (
          <OwnerRegistration 
            dbUser={dbUser} 
            onComplete={(id: string) => { 
              if (id) {
                setNewResId(id); 
                setActiveTab('menu-setup'); 
              } else {
                setActiveTab('profile');
              }
            }} 
          />
        );

      case 'menu-setup': 
        return (
          <MenuManagement 
            restaurantId={newResId!} 
            onComplete={() => window.location.reload()} 
          />
        );
case 'owner-dashboard':
  return <OwnerDashboard dbUser={dbUser} />;
        
      case 'profile': 
        return <Profile dbUser={dbUser} setActiveTab={setActiveTab} />;
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
