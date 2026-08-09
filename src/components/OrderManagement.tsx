import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { Order, OrderStatus, OrderType, PaymentMethod } from '../types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronRight, 
  Coins, 
  PhoneCall,
  User,
  MapPin,
  X
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const OrderManagement: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    addPaymentToOrder, 
    formatFcfa, 
    generateWhatsAppLink,
    confirmQrOrder,
    refuseQrOrder
  } = useResto();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected order modal for detail / payment
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Payment popup state
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN Mobile Money');
  const [momoPhone, setMomoPhone] = useState<string>('');
  const [momoTxnRef, setMomoTxnRef] = useState<string>('');

  // Unconfirmed QR orders
  const pendingQrOrders = orders.filter(
    o => o.sourceCommande === 'QR_TABLE' && o.statutConfirmation === 'En attente de confirmation'
  );

  // Filter logic
  const filteredOrders = orders.filter(ord => {
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    const matchesType = typeFilter === 'all' || ord.type === typeFilter;
    const matchesSource = sourceFilter === 'all' || (sourceFilter === 'QR_TABLE' ? ord.sourceCommande === 'QR_TABLE' : ord.sourceCommande !== 'QR_TABLE');
    const matchesSearch = ord.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ord.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ord.customer?.phone || '').includes(searchQuery) ||
                          (ord.tableCode || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSource && matchesSearch;
  });

  const handlePayOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowPayModal(true);
  };

  const confirmPayment = () => {
    if (!selectedOrder) return;

    addPaymentToOrder(selectedOrder.id, {
      method: paymentMethod,
      amountFcfa: selectedOrder.totalFcfa,
      operator: paymentMethod === 'MTN Mobile Money' ? 'MTN' : paymentMethod === 'Moov Money' ? 'Moov' : undefined,
      phoneNumber: momoPhone || selectedOrder.customer?.phone,
      transactionReference: momoTxnRef || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      cashierName: 'Caissier RestoFlow',
      date: new Date().toISOString(),
      status: 'Payé'
    });

    setShowPayModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-[#F59E0B]" />
            <span>Gestion des Commandes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Suivi complet du cycle de commande, encaissements et tickets clients en FCFA.
          </p>
        </div>

        <div className="text-xs text-slate-600 font-bold bg-white px-4 py-2 rounded-xl border shadow-sm">
          Total: <span className="text-[#0B1F33] text-sm font-black">{orders.length} commande(s)</span>
        </div>
      </div>

      {/* Pending QR Orders Notification Banner */}
      {pendingQrOrders.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl shadow-md space-y-3 animate-in slide-in-from-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
              <h3 className="font-black text-amber-900 text-sm">
                🔔 {pendingQrOrders.length} Commande(s) QR Table en attente de confirmation !
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2.5 py-1 rounded-full">
              Action Serveur Requise
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingQrOrders.map(pOrd => (
              <div key={pOrd.id} className="bg-white p-3 rounded-xl border border-amber-300 shadow-xs space-y-2 text-xs">
                <div className="flex justify-between items-start font-bold">
                  <div>
                    <span className="text-slate-900">{pOrd.code}</span>
                    <span className="ml-2 text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                      Table {pOrd.tableCode}
                    </span>
                  </div>
                  <span className="text-amber-900 font-extrabold">{formatFcfa(pOrd.totalFcfa)}</span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {pOrd.items.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
                </p>

                {pOrd.generalNote && (
                  <p className="text-[10px] bg-slate-50 text-slate-700 italic px-1.5 py-0.5 rounded">
                    Note: "{pOrd.generalNote}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => confirmQrOrder(pOrd.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs transition flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmer (Cuisine)</span>
                  </button>

                  <button
                    onClick={() => refuseQrOrder(pOrd.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-1.5 rounded-lg text-xs transition flex items-center justify-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Refuser</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Code (CMD-101) ou Table (T01)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl font-medium focus:outline-none"
            />
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 shrink-0">Origine:</span>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800"
            >
              <option value="all">Toutes les origines</option>
              <option value="QR_TABLE">Commandes QR Table</option>
              <option value="CAISSE">Commandes Caisse / Staff</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 shrink-0">Statut:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800"
            >
              <option value="all">Tous les statuts</option>
              <option value="Nouvelle">Nouvelle</option>
              <option value="Confirmée">Confirmée</option>
              <option value="En préparation">En préparation</option>
              <option value="Prête">Prête</option>
              <option value="Servie">Servie</option>
              <option value="Terminée">Terminée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 shrink-0">Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800"
            >
              <option value="all">Tous les types</option>
              <option value="Sur place">Sur place</option>
              <option value="À emporter">À emporter</option>
              <option value="Livraison">Livraison</option>
              <option value="Téléphone">Téléphone</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>

        </div>
      </div>

      {/* ORDERS LIST TABLE / CARDS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#0B1F33] text-white text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Code & Type</th>
                <th className="p-3.5">Client / Table</th>
                <th className="p-3.5">Plats Commandés</th>
                <th className="p-3.5">Total FCFA</th>
                <th className="p-3.5">Paiement</th>
                <th className="p-3.5">Statut Commande</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Aucune commande ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isPaid = order.paymentStatus === 'Payé';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      
                      {/* Code & Type */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 text-sm">{order.code}</div>
                        <span className="inline-block bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5">
                          {order.type}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString('fr-BJ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Client / Table */}
                      <td className="p-3.5">
                        {order.tableCode ? (
                          <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            Table {order.tableCode} ({order.tableZone})
                          </span>
                        ) : order.customer ? (
                          <div>
                            <p className="font-bold text-slate-800">{order.customer.name}</p>
                            <p className="text-[10px] text-slate-500">{order.customer.phone}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Client Anonyme</span>
                        )}

                        {order.delivery && (
                          <p className="text-[10px] text-blue-700 font-semibold mt-1">
                            📍 {order.delivery.neighborhood}
                          </p>
                        )}
                      </td>

                      {/* Plats Commandés */}
                      <td className="p-3.5 max-w-xs">
                        <p className="line-clamp-2 text-slate-800 font-medium">
                          {order.items.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
                        </p>
                      </td>

                      {/* Total FCFA */}
                      <td className="p-3.5 font-black text-slate-900 text-sm">
                        {formatFcfa(order.totalFcfa)}
                      </td>

                      {/* Paiement */}
                      <td className="p-3.5">
                        <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus}
                        </span>

                        {!isPaid && (
                          <button
                            onClick={() => handlePayOrder(order)}
                            className="block mt-1 text-[10px] font-bold text-emerald-600 hover:underline"
                          >
                            + Encaisser
                          </button>
                        )}
                      </td>

                      {/* Statut Commande */}
                      <td className="p-3.5">
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-slate-100 border rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none"
                        >
                          <option value="Nouvelle">Nouvelle</option>
                          <option value="Confirmée">Confirmée</option>
                          <option value="En préparation">En préparation</option>
                          <option value="Prête">Prête</option>
                          <option value="Servie">Servie</option>
                          <option value="Terminée">Terminée</option>
                          <option value="Annulée">Annulée</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setReceiptOrder(order)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                          title="Imprimer Ticket"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        <a
                          href={generateWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg inline-block transition"
                          title="Envoyer sur WhatsApp"
                        >
                          <Share2 className="h-4 w-4" />
                        </a>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPayModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            
            <button 
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg border-b pb-2">
              Encaisser la Commande {selectedOrder.code}
            </h3>

            <p className="text-sm font-black text-slate-900">
              Montant à payer : <span className="text-[#0B1F33]">{formatFcfa(selectedOrder.totalFcfa)}</span>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Mode de Règlement</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  onClick={() => setPaymentMethod('Espèces')}
                  className={`py-2 px-2 rounded-xl border transition ${
                    paymentMethod === 'Espèces' ? 'bg-[#0B1F33] text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Espèces
                </button>
                <button
                  onClick={() => setPaymentMethod('MTN Mobile Money')}
                  className={`py-2 px-2 rounded-xl border transition ${
                    paymentMethod === 'MTN Mobile Money' ? 'bg-amber-500 text-slate-900 font-extrabold' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  MTN MoMo
                </button>
                <button
                  onClick={() => setPaymentMethod('Moov Money')}
                  className={`py-2 px-2 rounded-xl border transition ${
                    paymentMethod === 'Moov Money' ? 'bg-blue-600 text-white font-extrabold' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Moov Money
                </button>
              </div>
            </div>

            {(paymentMethod === 'MTN Mobile Money' || paymentMethod === 'Moov Money') && (
              <div className="bg-slate-50 p-3 rounded-xl border space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Numéro de téléphone</label>
                  <input
                    type="text"
                    placeholder="ex: 97 00 00 00"
                    value={momoPhone}
                    onChange={e => setMomoPhone(e.target.value)}
                    className="w-full bg-white border rounded-lg px-3 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Référence Transaction TXN</label>
                  <input
                    type="text"
                    placeholder="ex: TXN-54321"
                    value={momoTxnRef}
                    onChange={e => setMomoTxnRef(e.target.value)}
                    className="w-full bg-white border rounded-lg px-3 py-1.5 font-bold"
                  />
                </div>
              </div>
            )}

            <button
              onClick={confirmPayment}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm transition shadow-lg"
            >
              Valider le paiement de {formatFcfa(selectedOrder.totalFcfa)}
            </button>

          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}

    </div>
  );
};
