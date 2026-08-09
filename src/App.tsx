import React, { useState } from 'react';
import { RestoProvider, useResto } from './context/RestoContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Dashboard } from './components/Dashboard';
import { POSRapide } from './components/POSRapide';
import { OrderManagement } from './components/OrderManagement';
import { TableManagement } from './components/TableManagement';
import { KitchenKDS } from './components/KitchenKDS';
import { MenuManagement } from './components/MenuManagement';
import { CashRegisterView } from './components/CashRegisterView';
import { StockAndSuppliersView } from './components/StockAndSuppliersView';
import { DeliveriesView } from './components/DeliveriesView';
import { ExpensesAndFinancesView } from './components/ExpensesAndFinancesView';
import { StatisticsView } from './components/StatisticsView';
import { SettingsView } from './components/SettingsView';
import { ClientTableOrderView } from './components/ClientTableOrderView';
import { RestaurantRegistrationModal } from './components/RestaurantRegistrationModal';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Detect public table URL if present
    if (window.location.pathname.startsWith('/commande/table/')) {
      return 'client-menu';
    }
    return 'dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Extract public table token if in URL
  const urlToken = window.location.pathname.startsWith('/commande/table/') 
    ? window.location.pathname.replace('/commande/table/', '') 
    : undefined;

  if (activeTab === 'client-menu') {
    return (
      <ClientTableOrderView 
        tableToken={urlToken} 
        onBackToApp={() => setActiveTab('dashboard')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col antialiased">
      
      {/* Top Bar Navigation */}
      <Navbar 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 transition-all duration-200">
          
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'pos' && <POSRapide />}
          {activeTab === 'commandes' && <OrderManagement />}
          {activeTab === 'tables' && <TableManagement setActiveTab={setActiveTab} />}
          {activeTab === 'cuisine' && <KitchenKDS />}
          {activeTab === 'menu' && <MenuManagement />}
          {activeTab === 'caisse' && <CashRegisterView />}
          {activeTab === 'stock' && <StockAndSuppliersView />}
          {activeTab === 'livraisons' && <DeliveriesView />}
          {activeTab === 'finances' && <ExpensesAndFinancesView />}
          {activeTab === 'statistiques' && <StatisticsView />}
          {activeTab === 'parametres' && <SettingsView />}

        </main>

      </div>

      {/* SaaS Registration & Tenant Switcher Modal */}
      <RestaurantRegistrationModal />

    </div>
  );
};

export default function App() {
  return (
    <RestoProvider>
      <MainAppContent />
    </RestoProvider>
  );
}
