import { useState } from 'react';
import { Home } from './pages/home';
import { Search } from './pages/search'; 
import { Orders } from './pages/orders';
import { Profile } from './pages/profile';
import { OwnerRegistration } from './pages/OwnerRegistration';
import { MenuManagement } from './pages/MenuManagement'; 
import { BottomNav } from './components/bottomNav'; 
import { useAuth } from './hooks/useAuth';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PromoterDashboard } from './pages/PromoterDashboard';
import { CreateAdForm } from './pages/CreateAdForm'; // Added Import

function App() {
  const { dbUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [newResId, setNewResId] = useState<string | null>(null); 

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center">
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="fixed top-0 left-0 z-[9999] bg-red-600 text-white p-2 text-[10px] font-black"
        >
          FORCE DATA SYNC
        </button>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading System...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'search': return <Search />;
      case 'orders': return <Orders />;
      case 'profile': return <Profile dbUser={dbUser} setActiveTab={setActiveTab} />;
      
      // --- NEW AD PARTNER CONSOLE LOGIC ---
      case 'ad-partner-console':
        if (dbUser?.role !== 'promoter') {
          setActiveTab('profile');
          return <Profile dbUser={dbUser} setActiveTab={setActiveTab} />;
        }
        return <PromoterDashboard dbUser={dbUser} setActiveTab={setActiveTab} />;

      // --- NEW AD CREATION WIRING ---
      case 'ad-creation':
        if (dbUser?.role !== 'promoter') {
          setActiveTab('profile');
          return <Profile dbUser={dbUser} setActiveTab={setActiveTab} />;
        }
        return (
          <CreateAdForm 
            dbUser={dbUser} 
            onComplete={() => setActiveTab('ad-partner-console')} 
          />
        );

      case 'system-admin':
        if (dbUser?.role !== 'admin') {
          setActiveTab('profile');
          return <Profile dbUser={dbUser} setActiveTab={setActiveTab} />;
        }
        return <AdminDashboard setActiveTab={setActiveTab} />;

      case 'owner-reg': 
        return <OwnerRegistration dbUser={dbUser} onComplete={(id: string) => { 
          if (id) { setNewResId(id); setActiveTab('menu-setup'); } else { setActiveTab('profile'); }
        }} />;

      case 'menu-setup': 
        return <MenuManagement restaurantId={newResId!} onComplete={() => window.location.reload()} />;

      case 'owner-dashboard':
        return <OwnerDashboard dbUser={dbUser} />;
        
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-blue-100">
      {/* Added 'ad-creation' to the padding check to ensure 
          the form looks clean without bottom spacing.
      */}
      <main className={`${(
        activeTab === 'system-admin' || 
        activeTab === 'ad-partner-console' || 
        activeTab === 'ad-creation'
      ) ? '' : 'pb-32'}`}>
        {renderPage()}
      </main>

      {/* Hide BottomNav for 'ad-creation' as well 
          since the form provides its own 'Back' button.
      */}
      {activeTab !== 'system-admin' && 
       activeTab !== 'ad-partner-console' && 
       activeTab !== 'ad-creation' && 
       activeTab !== 'menu-setup' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} dbUser={dbUser} />
      )}
    </div>
  );
}

export default App;
