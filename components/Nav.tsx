
import React from 'react';
import { LayoutDashboard, ShoppingBag, Utensils, PieChart, Calculator, Wallet, TrendingUp, Sparkles, Settings } from 'lucide-react';

interface NavProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Nav: React.FC<NavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales_entry', label: 'Add Orders', icon: ShoppingBag },
    { id: 'menu', label: 'Master Menu', icon: Utensils },
    { id: 'receivables', label: 'Receivables', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'calculator', label: 'Cost Calc', icon: Calculator },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'ai', label: 'AI Coach', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-300 h-screen fixed left-0 top-0 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
            Vidya Kitchen
          </h1>
          <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Business Manager</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-orange-600/20 text-orange-500' 
                  : 'hover:bg-stone-800 text-stone-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 z-50 overflow-x-auto">
        <div className="flex justify-between items-center px-2 min-w-max">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center py-3 px-3 min-w-[70px] ${
                currentView === item.id ? 'text-orange-500' : 'text-stone-500'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
