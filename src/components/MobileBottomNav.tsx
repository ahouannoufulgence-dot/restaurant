import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { 
  LayoutDashboard, 
  Smartphone, 
  ShoppingBag, 
  UtensilsCrossed, 
  ChefHat,
  Coins,
  Menu as MenuIcon,
  Zap,
  SlidersHorizontal
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
  const { orders, mvpRole, permissions } = useResto();

  // Mode Compact state (default true on mobile for simplicity)
  const [isCompactMode, setIsCompactMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('resto_compact_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleCompactMode = () => {
    const next = !isCompactMode;
    setIsCompactMode(next);
    localStorage.setItem('resto_compact_mode', String(next));
  };

  // Active orders count for badges
  const activeOrdersCount = orders.filter(o => o.status !== 'Terminée' && o.status !== 'Annulée').length;
  const kitchenOrdersCount = orders.filter(o => o.status === 'Nouvelle' || o.status === 'Confirmée' || o.status === 'En préparation').length;

  // 4 Essential Daily Items for Compact Mode
  const compactTabs = [
    { id: 'commandes', label: 'Commandes', icon: ShoppingBag, badge: activeOrdersCount, color: 'text-amber-400' },
    { id: 'cuisine', label: 'Cuisine', icon: ChefHat, badge: kitchenOrdersCount, badgeColor: 'bg-red-500', color: 'text-orange-400' },
    { id: 'caisse', label: 'Caisse', icon: Coins, color: 'text-emerald-400' },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, color: 'text-blue-400' },
  ];

  // Role-customized main bottom tabs for Standard Mode
  const getRoleBottomTabs = () => {
    if (isCompactMode) {
      return compactTabs;
    }

    switch (mvpRole) {
      case 'EMPLOYE':
        return [
          { id: 'commandes', label: 'Commandes', icon: ShoppingBag, badge: activeOrdersCount, highlight: true },
          { id: 'pos', label: 'POS Vente', icon: Smartphone },
          { id: 'caisse', label: 'Caisse', icon: Coins },
          { id: 'cuisine', label: 'Cuisine', icon: ChefHat, badge: kitchenOrdersCount },
        ];
      case 'CUISINE':
        return [
          { id: 'cuisine', label: 'Cuisine KDS', icon: ChefHat, highlight: true, badge: kitchenOrdersCount },
        ];
      case 'PROPRIETAIRE':
      default:
        return [
          { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
          { id: 'pos', label: 'POS Vente', icon: Smartphone, highlight: true },
          { id: 'commandes', label: 'Commandes', icon: ShoppingBag, badge: activeOrdersCount },
          { id: 'caisse', label: 'Caisse', icon: Coins },
        ];
    }
  };

  const mainTabs = getRoleBottomTabs();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Compact Mode Switcher Header */}
      <div className="bg-[#071320] border-t border-slate-800/80 px-3 py-1 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <Zap className={`w-3.5 h-3.5 ${isCompactMode ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="font-bold text-slate-300">
            {isCompactMode ? 'Vue Compacte (4 Essentiels Journée)' : 'Vue Standard Rôle'}
          </span>
        </div>
        <button
          onClick={toggleCompactMode}
          className="text-amber-400 hover:text-amber-300 font-extrabold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-full transition border border-amber-500/30"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>{isCompactMode ? 'Mode Standard' : 'Mode Compact'}</span>
        </button>
      </div>

      <nav className="bg-[#0B1F33] text-slate-300 shadow-2xl px-2 py-1.5 pb-safe flex items-center justify-around">
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
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition relative min-w-[64px] ${
                isActive 
                  ? 'text-[#F59E0B] font-extrabold scale-105' 
                  : tab.highlight 
                    ? 'text-amber-400 font-bold' 
                    : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-[#F59E0B]/20 ring-1 ring-[#F59E0B]/40' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-1 font-bold">{tab.label}</span>

              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`absolute top-0 right-2 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md ${tab.badgeColor || 'bg-red-500'}`}>
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
          <span className="text-[10px] tracking-tight leading-none mt-1 font-bold">Plus</span>
        </button>
      </nav>
    </div>
  );
};

