import { useState } from 'react';
import { Home } from './pages/Home';
import { Orders } from './pages/Orders'; // You'll create this next
import { Profile } from './pages/Profile'; // You'll create this next
import { BottomNav } from './components/BottomNav';
import { useTelegram } from './hooks/useTelegram';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { user } = useTelegram();

  // This function decides which PAGE to render in the middle of the screen
  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'orders': return <Orders />;
      case 'profile': return <Profile />;
      case 'search': return <div className="p-10 text-center">Search Feature Coming...</div>;
      case 'favorites': return <div className="p-10 text-center">Favorites Coming...</div>;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* The Page Content */}
      <main className="pb-24">
        {renderPage()}
      </main>

      {/* The Reusable Component */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
