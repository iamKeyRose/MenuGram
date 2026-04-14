import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasActiveOrder?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, hasActiveOrder }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'favorites', label: 'Saved', icon: '❤️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-8 pt-3 px-6 z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-1 flex-1 transition-all duration-300 active:scale-90"
            >
              {/* Icon Container */}
              <div className={`text-xl transition-all duration-300 ${
                isActive ? '-translate-y-1 scale-110' : 'opacity-30 grayscale'
              }`}>
                {tab.icon}
              </div>

              {/* Label */}
              <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>

              {/* Active Dot Indicator */}
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
              )}

              {/* Order Badge (From Orders Table) */}
              {tab.id === 'orders' && hasActiveOrder && (
                <div className="absolute top-0 right-1/4 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
