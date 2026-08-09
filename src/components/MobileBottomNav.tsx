import React from 'react';
import { useResto } from '../context/RestoContext';
import { 
  LayoutDashboard, 
  Smartphone, 
  ShoppingBag, 
  UtensilsCrossed, 
  Menu as MenuIcon 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const { orders } = useResto();

  // Active orders count for badge
  const activeOrdersCount = orders.filter(o => o.status !== 'Terminée' && o.status !== 'Annulée').length;

  const mainTabs = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Vente', icon: Smartphone, highlight: true },
    { id: 'commandes', label: 'Commandes', icon: ShoppingBag, badge: activeOrdersCount },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1F33] text-slate-300 border-t border-slate-800 shadow-2xl px-2 py-1.5 pb-safe flex items-center justify-around">
      {mainTabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition relative min-w-[60px] ${
              isActive 
                ? 'text-[#F59E0B] font-extrabold scale-105' 
                : tab.highlight 
                  ? 'text-amber-400 font-bold' 
                  : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-[#F59E0B]/20' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight leading-none mt-0.5">{tab.label}</span>

            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute top-0 right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* "Plus" Button to toggle full drawer */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[60px] ${
          mobileMenuOpen ? 'text-[#F59E0B] font-extrabold' : 'text-slate-400 hover:text-white font-medium'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${mobileMenuOpen ? 'bg-[#F59E0B]/20' : ''}`}>
          <MenuIcon className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight leading-none mt-0.5">Plus</span>
      </button>
    </nav>
  );
};
