import React from 'react';
import { useResto } from '../context/RestoContext';
import { Truck, PhoneCall, Share2, MapPin, CheckCircle2 } from 'lucide-react';

export const DeliveriesView: React.FC = () => {
  const { orders, updateDeliveryStatus, formatFcfa, generateWhatsAppLink } = useResto();

  const deliveryOrders = orders.filter(o => o.type === 'Livraison');

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Truck className="h-6 w-6 text-[#F59E0B]" />
            <span>Gestion des Livraisons & WhatsApp</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Suivi des commandes à livrer par zones (Cotonou, Calavi, Porto-Novo) et repères locaux.
          </p>
        </div>

        <div className="text-xs font-bold bg-white px-4 py-2 rounded-xl border shadow-sm text-slate-700">
          Total Livraisons: <span className="text-[#0B1F33] text-sm font-black">{deliveryOrders.length}</span>
        </div>
      </div>

      {/* DELIVERIES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveryOrders.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border text-center text-slate-400 space-y-2">
            <Truck className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">Aucune commande en livraison</h3>
            <p className="text-xs text-slate-500">Les nouvelles commandes avec option 'Livraison' s'afficheront automatiquement ici.</p>
          </div>
        ) : (
          deliveryOrders.map(order => {
            const del = order.delivery;
            if (!del) return null;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">{order.code}</span>
                      <p className="text-xs text-slate-600 font-bold">{del.customerName}</p>
                    </div>
                    <span className="font-black text-[#0B1F33] text-sm bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      {formatFcfa(order.totalFcfa)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="flex items-center gap-1 font-bold text-slate-800">
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span>{del.neighborhood} ({del.city})</span>
                    </p>
                    <p className="text-slate-600 bg-slate-50 p-2 rounded-lg border text-[11px] italic">
                      Indication: "{del.landmark}"
                    </p>
                  </div>

                  <div className="text-xs text-slate-700 font-medium space-y-0.5 pt-1">
                    <p>📞 Téléphone: <strong>{del.phone}</strong></p>
                    <p>🛵 Frais livraison: <strong>{formatFcfa(del.deliveryFeeFcfa)}</strong></p>
                    {del.driverName && <p>👤 Livreur assigné: <strong>{del.driverName}</strong></p>}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">Statut:</span>
                    <select
                      value={del.status}
                      onChange={e => updateDeliveryStatus(order.id, e.target.value as any)}
                      className="bg-slate-100 border rounded-lg px-2 py-1 text-xs font-bold text-slate-900"
                    >
                      <option value="En attente">En attente</option>
                      <option value="En cours de livraison">En cours de livraison</option>
                      <option value="Livrée">Livrée</option>
                      <option value="Annulée">Annulée</option>
                    </select>
                  </div>

                  <a
                    href={generateWhatsAppLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Envoyer Reçu WhatsApp</span>
                  </a>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
