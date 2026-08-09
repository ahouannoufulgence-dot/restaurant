import React from 'react';
import { useResto } from '../context/RestoContext';
import { UserRole } from '../types';
import { 
  Store, 
  UserCheck, 
  Menu as MenuIcon, 
  X, 
  Coins, 
  BellRing,
  Smartphone,
  ChevronDown,
  Building2,
  Plus
} from 'lucide-react';

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen,
  setActiveTab
}) => {
  const { 
    config, 
    currentRole, 
    setCurrentRole, 
    cashSession, 
    formatFcfa, 
    orders, 
    setIsRegisterModalOpen, 
    registeredRestaurants,
    stockItems
  } = useResto();

  const rolesList: UserRole[] = ['Administrateur', 'Chef', 'Serveur', 'Caissier', 'Client'];

  // Calculate quick notifications
  const pendingKitchenOrders = orders.filter(o => o.status === 'Nouvelle' || o.status === 'Confirmée' || o.status === 'En préparation').length;
  const lowStockCount = stockItems.filter(s => s.currentQuantity <= s.minQuantity).length;

  return (
    <header className="bg-[#0B1F33] text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>

            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="bg-[#F59E0B] text-[#0B1F33] p-2 rounded-xl font-black text-xl flex items-center justify-center shadow-lg">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg sm:text-xl tracking-tight leading-none text-white flex items-center gap-2">
                  {config.name}
                  <span className="hidden sm:inline-block bg-[#F59E0B]/20 text-[#F59E0B] text-xs px-2 py-0.5 rounded-full font-medium border border-[#F59E0B]/30">
                    {config.type}
                  </span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {config.neighborhood}, {config.city} • <span className="text-[#F59E0B] font-semibold">{config.currency}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Badges & Active Cash Status */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            {/* Cash Session Status */}
            <div 
              onClick={() => setActiveTab('caisse')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${
                cashSession.status === 'Ouverte' 
                  ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60' 
                  : 'bg-amber-950/60 border-amber-600/50 text-amber-300 hover:bg-amber-900/60'
              }`}
            >
              <Coins className="h-4 w-4" />
              <div>
                <p className="font-semibold leading-tight">
                  Caisse: {cashSession.status}
                </p>
                {cashSession.status === 'Ouverte' && (
                  <p className="text-[10px] opacity-80">
                    Théorique: {formatFcfa(cashSession.theoreticalCashFcfa)}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Multi-Restaurant SaaS registration trigger */}
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold px-3 py-1.5 rounded-xl border border-amber-500/30 transition flex items-center gap-1.5 text-xs shadow-sm"
              title="Inscrire un nouvel établissement ou changer de restaurant"
            >
              <Building2 className="h-4 w-4 text-[#F59E0B]" />
              <span className="hidden xl:inline">Mes Établissements</span>
              <span className="bg-[#F59E0B] text-[#0B1F33] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {registeredRestaurants.length}
              </span>
            </button>

            {/* Quick POS Rapide button */}
            <button
              onClick={() => setActiveTab('pos')}
              className="bg-[#F59E0B] hover:bg-[#d98805] text-[#0B1F33] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Smartphone className="h-4 w-4" />
              <span>Commande Rapide</span>
            </button>
          </div>

          {/* Role Switcher Selector */}
          <div className="flex items-center gap-3">
            {/* Notifications badge */}
            <div className="relative flex items-center gap-2">
              {pendingKitchenOrders > 0 && (
                <button 
                  onClick={() => setActiveTab('cuisine')}
                  className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 relative"
                  title={`${pendingKitchenOrders} commandes en cuisine`}
                >
                  <BellRing className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {pendingKitchenOrders}
                  </span>
                </button>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative group">
              <div className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 cursor-pointer transition">
                <UserCheck className="h-4 w-4 text-[#F59E0B]" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Rôle Actif</p>
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    {currentRole}
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </p>
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="absolute right-0 mt-1 w-48 bg-[#0B1F33] border border-slate-700 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
                <p className="px-3 py-1 text-[11px] text-slate-400 font-semibold border-b border-slate-800 mb-1">
                  Changer de profil d'utilisation :
                </p>
                {rolesList.map(r => (
                  <button
                    key={r}
                    onClick={() => setCurrentRole(r)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-800 transition ${
                      currentRole === r ? 'text-[#F59E0B] font-bold bg-slate-800/50' : 'text-slate-200'
                    }`}
                  >
                    <span>{r}</span>
                    {currentRole === r && <span className="text-xs">•</span>}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
