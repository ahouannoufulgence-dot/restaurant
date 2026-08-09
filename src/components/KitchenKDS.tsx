import React, { useState, useEffect } from 'react';
import { useResto } from '../context/RestoContext';
import { Order, OrderStatus } from '../types';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Bell, 
  AlertTriangle,
  Printer
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const KitchenKDS: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderItemStatus } = useResto();

  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Filter kitchen active orders
  const kitchenOrders = orders.filter(o => 
    o.status === 'Nouvelle' || 
    o.status === 'Confirmée' || 
    o.status === 'En préparation' || 
    o.status === 'Prête'
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* KDS Header */}
      <div className="bg-[#0B1F33] text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse">
              <Flame className="h-3.5 w-3.5" />
              Direct Cuisine
            </span>
            <span className="text-xs text-slate-400">Temps Réel</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Kitchen Display System (KDS)
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Écran de cuisine pour le Chef. Suivez la préparation des bons et gérez les remarques clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">En Cuisine</p>
            <p className="text-xl font-black text-[#F59E0B]">{kitchenOrders.length} bon(s)</p>
          </div>
        </div>
      </div>

      {/* ORDERS CARDS GRID */}
      {kitchenOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-slate-400 space-y-3">
          <ChefHat className="h-12 w-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">Aucun bon de commande en attente</h3>
          <p className="text-xs text-slate-500">Toutes les commandes en cuisine ont été préparées et servies !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenOrders.map(order => {
            const minutesElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60));
            const isLate = minutesElapsed > 20;

            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-2xl border-2 shadow-lg flex flex-col justify-between overflow-hidden transition ${
                  isLate ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div className={`p-4 text-white flex items-center justify-between ${
                  order.status === 'En préparation' ? 'bg-[#0B1F33]' : 'bg-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-[#F59E0B]">{order.code}</span>
                      <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded">
                        {order.tableCode ? `Table ${order.tableCode}` : order.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Pris par {order.createdByName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      isLate ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-700 text-amber-300'
                    }`}>
                      <Clock className="h-3 w-3" />
                      {minutesElapsed} min
                    </span>
                    <button
                      onClick={() => setReceiptOrder(order)}
                      className="text-[10px] text-slate-300 hover:text-white underline block mt-1"
                    >
                      Imprimer Bon
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-80">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                        <span className="text-sm font-black text-[#0B1F33]">
                          {item.quantity} × {item.menuItemName}
                        </span>
                      </div>

                      {/* Supplements */}
                      {item.selectedSupplements.length > 0 && (
                        <div className="text-[11px] text-slate-600 font-medium pl-2">
                          {item.selectedSupplements.map(s => `+ ${s.name}`).join(', ')}
                        </div>
                      )}

                      {/* Kitchen Note Alert */}
                      {item.kitchenNote && (
                        <div className="text-xs font-extrabold text-red-700 bg-red-100 p-1.5 rounded-lg border border-red-300 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                          <span>NOTE: "{item.kitchenNote}"</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* General order note */}
                  {order.generalNote && (
                    <div className="text-xs bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200 font-bold">
                      Consigne générale: {order.generalNote}
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="p-4 bg-slate-50 border-t space-y-2">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-slate-600">Statut actuel:</span>
                    <span className="font-black text-[#0B1F33] bg-amber-100 px-2 py-0.5 rounded">
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {order.status !== 'En préparation' && order.status !== 'Prête' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'En préparation')}
                        className="col-span-2 bg-[#0B1F33] hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Flame className="h-4 w-4 text-[#F59E0B]" />
                        <span>Lancer la Préparation</span>
                      </button>
                    )}

                    {order.status === 'En préparation' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Prête')}
                        className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Marquer PLATS PRÊTS !</span>
                      </button>
                    )}

                    {order.status === 'Prête' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Servie')}
                        className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Servi au Client</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* RECEIPT / KITCHEN BON MODAL */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
          type="cuisine"
        />
      )}

    </div>
  );
};
