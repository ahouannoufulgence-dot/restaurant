import React from 'react';
import { useResto } from '../context/RestoContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Receipt, 
  Coins, 
  Smartphone, 
  AlertTriangle, 
  ChefHat, 
  Truck, 
  ArrowUpRight,
  PlusCircle,
  PhoneCall,
  Clock
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onSelectOrderForReceipt?: (order: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { 
    orders, 
    cashSession, 
    expenses, 
    stockItems, 
    suppliers, 
    formatFcfa, 
    updateOrderStatus,
    generateWhatsAppLink,
    config
  } = useResto();

  // Calculate today's metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr) && o.status !== 'Annulée');
  const todayRevenue = todayOrders.reduce((sum, o) => o.paymentStatus === 'Payé' ? sum + o.totalFcfa : sum, 0);
  
  const todayExpenses = expenses
    .filter(e => e.date.startsWith(todayStr))
    .reduce((sum, e) => sum + e.amountFcfa, 0);

  const estimatedProfit = todayRevenue - todayExpenses;

  // Breakdown by payment methods today
  let cashTotal = 0;
  let mtnTotal = 0;
  let moovTotal = 0;

  todayOrders.forEach(ord => {
    ord.payments.forEach(p => {
      if (p.status === 'Payé') {
        if (p.method === 'Espèces') cashTotal += p.amountFcfa;
        else if (p.method === 'MTN Mobile Money') mtnTotal += p.amountFcfa;
        else if (p.method === 'Moov Money') moovTotal += p.amountFcfa;
      }
    });
  });

  // Active kitchen orders
  const kitchenOrders = orders.filter(o => o.status === 'Nouvelle' || o.status === 'Confirmée' || o.status === 'En préparation');
  const readyOrders = orders.filter(o => o.status === 'Prête');
  const deliveryOrders = orders.filter(o => o.type === 'Livraison' && o.status !== 'Terminée' && o.status !== 'Annulée');

  // Alerts
  const lowStock = stockItems.filter(s => s.currentQuantity <= s.minQuantity);
  const totalDebt = suppliers.reduce((sum, s) => sum + s.totalDebtFcfa, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#0B1F33] to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#F59E0B] text-[#0B1F33] font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wide">
              {config.type} Béninois
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Synchro Cloud Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2">
            Tableau de Bord - {config.name}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Application simplifiée pour la gestion rapide de votre établissement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="bg-[#F59E0B] hover:bg-[#d98805] text-[#0B1F33] font-extrabold px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-lg active:scale-95 text-sm"
          >
            <Smartphone className="h-5 w-5" />
            <span>Commande Rapide (POS)</span>
          </button>
        </div>
      </div>

      {/* QUICK SIMPLIFIED ACTION CARDS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>⚡ Actions Rapides (Accès Direct 1-Clic)</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Toutes les opérations essentielles réunies</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('pos')}
            className="p-3.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl text-left transition flex flex-col items-start gap-2 group active:scale-98"
          >
            <div className="p-2 bg-amber-500 text-slate-900 rounded-lg font-black group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-950">1. Prendre Commande</p>
              <p className="text-[10px] text-amber-800 leading-tight">Caisse POS & Vente rapide</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('client-menu')}
            className="p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl text-left transition flex flex-col items-start gap-2 group active:scale-98"
          >
            <div className="p-2 bg-emerald-600 text-white rounded-lg font-black group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950">2. QR Code Client</p>
              <p className="text-[10px] text-emerald-800 leading-tight">Commander depuis la table</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className="p-3.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl text-left transition flex flex-col items-start gap-2 group active:scale-98"
          >
            <div className="p-2 bg-blue-600 text-white rounded-lg font-black group-hover:scale-110 transition-transform">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-blue-950">3. Menu & Plats</p>
              <p className="text-[10px] text-blue-800 leading-tight">Modifier plats & tarifs</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('commandes')}
            className="p-3.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 rounded-xl text-left transition flex flex-col items-start gap-2 group active:scale-98"
          >
            <div className="p-2 bg-purple-600 text-white rounded-lg font-black group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-purple-950">4. Suivi Commandes</p>
              <p className="text-[10px] text-purple-800 leading-tight">Valider & encaisser</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('caisse')}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-left transition flex flex-col items-start gap-2 group active:scale-98"
          >
            <div className="p-2 bg-slate-800 text-amber-400 rounded-lg font-black group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">5. Caisse du Jour</p>
              <p className="text-[10px] text-slate-600 leading-tight">Session & Clôture</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('statistiques')}
            className="p-3.5 bg-[#0B1F33] hover:bg-slate-800 text-white border border-slate-800 rounded-xl text-left transition flex flex-col items-start gap-2 group active:scale-98"
          >
            <div className="p-2 bg-[#F59E0B] text-[#0B1F33] rounded-lg font-black group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">6. Chiffres & Bilan</p>
              <p className="text-[10px] text-slate-300 leading-tight">Rapports de ventes</p>
            </div>
          </button>
        </div>
      </div>

      {/* KEY METRICS GRID IN FCFA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Chiffre d'affaires */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chiffre d'affaires (Aujourd'hui)</span>
            <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{formatFcfa(todayRevenue)}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>{todayOrders.filter(o => o.paymentStatus === 'Payé').length} commande(s) payées</span>
          </p>
        </div>

        {/* Commandes aujourd'hui */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commandes du Jour</span>
            <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{todayOrders.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Sur place: {todayOrders.filter(o => o.type === 'Sur place').length} • Livraisons: {todayOrders.filter(o => o.type === 'Livraison').length}
          </p>
        </div>

        {/* Dépenses du Jour */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dépenses du Jour</span>
            <div className="bg-red-100 text-red-700 p-2.5 rounded-xl">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{formatFcfa(todayExpenses)}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Achats condiments & frais
          </p>
        </div>

        {/* Bénéfice Estimé */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bénéfice Estimé</span>
            <div className="bg-amber-100 text-amber-700 p-2.5 rounded-xl">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-3 ${estimatedProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatFcfa(estimatedProfit)}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            CA - Dépenses directes
          </p>
        </div>

      </div>

      {/* PAYMENT METHODS & CASH REGISTER RECONCILIATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Répartition des encaissements du jour</span>
            <button 
              onClick={() => setActiveTab('statistiques')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>Voir statistiques</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Espèces */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Espèces en Caisse</span>
                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full text-[10px]">Cash</span>
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">{formatFcfa(cashTotal)}</p>
            </div>

            {/* MTN MoMo */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>MTN Mobile Money</span>
                <span className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black">MTN MoMo</span>
              </div>
              <p className="text-xl font-black text-amber-900 mt-2">{formatFcfa(mtnTotal)}</p>
            </div>

            {/* Moov Money */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Moov Money</span>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">Moov</span>
              </div>
              <p className="text-xl font-black text-blue-900 mt-2">{formatFcfa(moovTotal)}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Caisse du jour: <strong className="text-slate-800">{cashSession.openedBy}</strong></span>
            <span>Statut Caisse: <strong className={cashSession.status === 'Ouverte' ? 'text-emerald-600' : 'text-amber-600'}>{cashSession.status}</strong></span>
          </div>
        </div>

        {/* ALERTS & DEBT WARNINGS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Alertes & Dettes</span>
          </h2>

          {/* Low Stock Items */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stocks bas ({lowStock.length})</p>
            {lowStock.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucune alerte de stock.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {lowStock.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                    <span className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                      {item.currentQuantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supplier Debts */}
          <div className="pt-2 border-t space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dettes Fournisseurs</p>
              <button 
                onClick={() => setActiveTab('stock')}
                className="text-[11px] font-bold text-amber-600 hover:underline"
              >
                Gérer
              </button>
            </div>
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-red-800 font-medium">Total dû aux grossistes</p>
                <p className="text-lg font-black text-red-900">{formatFcfa(totalDebt)}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RECENT ORDERS & KITCHEN STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* En cuisine (KDS Quick view) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-red-600" />
              <span>En Cuisine ({kitchenOrders.length})</span>
            </h2>
            <button 
              onClick={() => setActiveTab('cuisine')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              Écran Cuisine →
            </button>
          </div>

          {kitchenOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <ChefHat className="h-10 w-10 mx-auto mb-2 opacity-30 text-slate-400" />
              Toutes les commandes en cuisine sont servies !
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {kitchenOrders.map(ord => (
                <div key={ord.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ord.code}</span>
                      <span className="bg-slate-200 text-slate-800 font-semibold text-[10px] px-2 py-0.5 rounded">
                        {ord.tableCode ? `Table ${ord.tableCode}` : ord.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {ord.items.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full block mb-1">
                      {ord.status}
                    </span>
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'Prête')}
                      className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition"
                    >
                      Marquer Prête
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Livraisons en cours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span>Livraisons Actives ({deliveryOrders.length})</span>
            </h2>
            <button 
              onClick={() => setActiveTab('livraisons')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              Module Livraisons →
            </button>
          </div>

          {deliveryOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Truck className="h-10 w-10 mx-auto mb-2 opacity-30 text-slate-400" />
              Aucune livraison en attente pour le moment.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {deliveryOrders.map(ord => (
                <div key={ord.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{ord.code} • {ord.delivery?.customerName}</span>
                    <span className="font-extrabold text-slate-900">{formatFcfa(ord.totalFcfa)}</span>
                  </div>

                  <p className="text-xs text-slate-600">
                    📍 {ord.delivery?.neighborhood} ({ord.delivery?.landmark})
                  </p>

                  <div className="flex justify-between items-center pt-1 border-t text-[11px]">
                    <span className="text-slate-500">Tél: {ord.delivery?.phone}</span>
                    <a
                      href={generateWhatsAppLink(ord)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded transition flex items-center gap-1"
                    >
                      <PhoneCall className="h-3 w-3" />
                      <span>WhatsApp Client</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
