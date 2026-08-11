import React from 'react';
import { useResto } from '../context/RestoContext';
import { isTabAllowedForRole, ROLE_LABELS } from '../lib/permissions';
import { 
  LayoutDashboard, 
  Smartphone, 
  ShoppingBag, 
  Grid3X3, 
  ChefHat, 
  UtensilsCrossed, 
  Coins, 
  Boxes, 
  Truck, 
  Receipt, 
  BarChart3, 
  Settings,
  AlertCircle,
  QrCode,
  Building2,
  Plus,
  Store,
  Users
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}) => {
  const { 
    currentRole, 
    mvpRole,
    permissions,
    orders, 
    stockItems, 
    suppliers, 
    config, 
    setIsRegisterModalOpen, 
    registeredRestaurants 
  } = useResto();

  // Badge counters
  const activeOrdersCount = orders.filter(o => o.status !== 'Terminée' && o.status !== 'Annulée').length;
  const kitchenOrdersCount = orders.filter(o => o.status === 'Nouvelle' || o.status === 'Confirmée' || o.status === 'En préparation').length;
  const lowStockCount = stockItems.filter(s => s.currentQuantity <= s.minQuantity).length;
  const totalSupplierDebtCount = suppliers.filter(s => s.totalDebtFcfa > 0).length;

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, allow: permissions.canViewDashboard },
    { id: 'pos', label: 'Commande Rapide (POS)', icon: Smartphone, highlight: true, allow: permissions.canCreateOrder },
    { id: 'client-menu', label: 'Commande QR Table', icon: QrCode, allow: permissions.canCreateOrder },
    { id: 'commandes', label: 'Commandes', icon: ShoppingBag, badge: activeOrdersCount, allow: permissions.canCreateOrder || permissions.canTakePayment },
    { id: 'tables', label: 'Tables & Zones', icon: Grid3X3, allow: permissions.canManageTables || mvpRole === 'EMPLOYE' },
    { id: 'cuisine', label: 'Cuisine (KDS)', icon: ChefHat, badge: kitchenOrdersCount, badgeColor: 'bg-red-500', allow: permissions.canViewKitchen },
    { id: 'menu', label: 'Menu & Plats', icon: UtensilsCrossed, allow: permissions.canViewMenu || permissions.canManageMenu },
    { id: 'caisse', label: 'Caisse Journalière', icon: Coins, allow: permissions.canTakePayment },
    { id: 'stock', label: 'Stocks & Dettes', icon: Boxes, badge: lowStockCount + totalSupplierDebtCount, badgeColor: 'bg-amber-500', allow: permissions.canViewReports },
    { id: 'livraisons', label: 'Livraisons & WhatsApp', icon: Truck, allow: permissions.canCreateOrder || permissions.canTakePayment },
    { id: 'finances', label: 'Dépenses & Finances', icon: Receipt, allow: permissions.canViewReports },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3, allow: permissions.canViewReports },
    { id: 'personnel', label: 'Personnel & Rôles', icon: Users, allow: permissions.canManageStaff },
    { id: 'parametres', label: 'Paramètres', icon: Settings, allow: permissions.canManageSettings }
  ];

  // Filter items allowed for active role
  const filteredNavItems = navItems.filter(item => item.allow);

  const handleSelect = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#0B1F33] border-r border-slate-800 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="py-4 px-3 space-y-1">
          <div className="px-3 pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Navigation RestoFlow
          </div>

          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive 
                    ? 'bg-[#F59E0B] text-[#0B1F33] font-bold shadow-lg' 
                    : item.highlight 
                      ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30' 
                      : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#0B1F33]' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#0B1F33] text-white' : item.badgeColor || 'bg-slate-700 text-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SaaS Multi-Restaurant Card */}
        <div className="p-3 mx-2 my-2 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#F59E0B]" />
              <span>SaaS Multi-Resto</span>
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
              {registeredRestaurants.length} inscrit(s)
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-medium truncate">
            Resto actif: <strong className="text-white">{config.name}</strong>
          </p>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="w-full bg-[#F59E0B] hover:bg-[#d98805] text-[#0B1F33] font-black py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Inscrire un Restaurant</span>
          </button>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-900/50">
          <p className="font-semibold text-slate-300">RestoFlow Benin v2.0</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Adapté aux FCFA & Mobile Money</p>
          {lowStockCount > 0 && (
            <div className="mt-2 text-amber-400 text-[11px] flex items-center gap-1 font-medium bg-amber-950/40 p-1.5 rounded border border-amber-800/50">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{lowStockCount} alerte(s) stock bas</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
