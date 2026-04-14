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
import { AdminDashboard } from './pages/AdminDashboard';

/**
 * Main Application Component
 * Handles global state for navigation and authentication-based routing.
 */
function App() {
  const { dbUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [newResId, setNewResId] = useState<string | null>(null); 
  const { user } = useTelegram();

  // Show a clean loading state while useAuth fetches the user from Supabase
  if (loading) {
    
<button 
  onClick={() => { localStorage.clear(); window.location.reload(); }}
  className="fixed top-0 left-0 z-[9999] bg-red-600 text-white p-2 text-[10px] font-black"
>
  FORCE DATA SYNC
</button>

    
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading System...</p>
      </div>
    );
  }

  /**
   * Page Router
   * Decides which component to render based on the activeTab state.
   */
  const renderPage = () => {
    switch (activeTab) {
      case 'home': 
        return <Home />;
      case 'search': 
        return <Search />;
      case 'orders': 
        return <Orders />;
      
      // --- SYSTEM ADMIN ACCESS ---
      case 'system-admin':
        // Double-check role for security before rendering the admin suite
        if (dbUser?.role !== 'admin') {
          setActiveTab('profile');
          return <Profile dbUser={dbUser} setActiveTab={setActiveTab} />;
        }
        return <AdminDashboard setActiveTab={setActiveTab} />;

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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100">
      {/* Main Content Area */}
      <main className={`${activeTab === 'system-admin' ? '' : 'pb-32'}`}>
        {renderPage()}
      </main>

      {/* Hide Bottom Navigation when in Admin or Setup modes 
          to provide more screen real estate and prevent mis-clicks.
      */}
      {activeTab !== 'system-admin' && activeTab !== 'menu-setup' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;
