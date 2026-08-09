import React from 'react';
import { useResto } from '../context/RestoContext';
import { Order } from '../types';
import { Printer, X, Share2, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  type?: 'client' | 'cuisine';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose, type = 'client' }) => {
  const { config, formatFcfa, generateWhatsAppLink } = useResto();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const link = generateWhatsAppLink(order);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6 border-b pb-4 pr-8">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#0B1F33] hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Printer className="h-4 w-4 text-[#F59E0B]" />
            <span>Imprimer Ticket</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* THERMAL TICKET PRINT AREA */}
        <div id="receipt-print-area" className="font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
          
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
            <h2 className="font-bold text-base uppercase tracking-tight text-slate-900">{config.name}</h2>
            <p className="text-[11px] text-slate-600">{config.type} - {config.neighborhood}, {config.city}</p>
            <p className="text-[11px] text-slate-600">Tél: {config.phone}</p>
            {type === 'cuisine' && (
              <div className="mt-2 bg-amber-500 text-slate-900 font-black py-1 px-2 rounded uppercase text-sm">
                *** BON DE CUISINE ***
              </div>
            )}
          </div>

          {/* Ticket Metadata */}
          <div className="py-2 border-b border-dashed border-slate-300 space-y-0.5 text-[11px]">
            <div className="flex justify-between font-bold">
              <span>TICKET: {order.code}</span>
              <span>{order.type}</span>
            </div>
            {order.tableCode && (
              <div className="flex justify-between">
                <span>TABLE: {order.tableCode} ({order.tableZone || 'Salle'})</span>
                <span>Serveur: {order.createdByName}</span>
              </div>
            )}
            {order.customer && (
              <div>Client: {order.customer.name} ({order.customer.phone})</div>
            )}
            {order.delivery && (
              <div className="bg-amber-100 text-amber-900 p-1 rounded mt-1 font-semibold">
                Livraison: {order.delivery.neighborhood} - {order.delivery.landmark}
              </div>
            )}
            <div className="text-slate-500">Date: {new Date(order.createdAt).toLocaleString('fr-BJ')}</div>
          </div>

          {/* Items */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
            <div className="flex justify-between font-bold text-[11px] uppercase border-b pb-1">
              <span>QTE × PRODUIT</span>
              <span>TOTAL</span>
            </div>

            {order.items.map((item, idx) => {
              const supplementsTotal = item.selectedSupplements.reduce((sum, s) => sum + s.priceFcfa, 0);
              const lineTotal = (item.unitPriceFcfa + supplementsTotal) * item.quantity;

              return (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>{item.quantity} × {item.menuItemName}</span>
                    <span>{formatFcfa(lineTotal)}</span>
                  </div>
                  
                  {item.selectedSupplements.length > 0 && (
                    <div className="pl-3 text-[10px] text-slate-500 italic">
                      {item.selectedSupplements.map(s => `+ ${s.name} (${formatFcfa(s.priceFcfa)})`).join(', ')}
                    </div>
                  )}

                  {item.kitchenNote && (
                    <div className="pl-3 text-[10px] font-bold text-red-600 bg-red-50 p-1 rounded border border-red-200">
                      Note: "{item.kitchenNote}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totals */}
          {type === 'client' && (
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{formatFcfa(order.subtotalFcfa)}</span>
              </div>

              {order.deliveryFeeFcfa > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Frais de livraison:</span>
                  <span>{formatFcfa(order.deliveryFeeFcfa)}</span>
                </div>
              )}

              {order.discountFcfa > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Remise:</span>
                  <span>-{formatFcfa(order.discountFcfa)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold pt-2 border-t text-slate-900">
                <span>NET À PAYER:</span>
                <span>{formatFcfa(order.totalFcfa)}</span>
              </div>
            </div>
          )}

          {/* Payment info */}
          {type === 'client' && (
            <div className="py-2 text-[11px] space-y-1">
              <div className="flex justify-between font-bold">
                <span>Statut Paiement:</span>
                <span className={order.paymentStatus === 'Payé' ? 'text-emerald-700' : 'text-amber-700'}>
                  {order.paymentStatus}
                </span>
              </div>

              {order.payments.map((p, idx) => (
                <div key={idx} className="bg-slate-100 p-1.5 rounded text-[10px] space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>Mode: {p.method}</span>
                    <span>{formatFcfa(p.amountFcfa)}</span>
                  </div>
                  {p.transactionReference && (
                    <div className="text-slate-500">Réf TXN: {p.transactionReference}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer message */}
          <div className="text-center pt-3 text-[10px] text-slate-500 space-y-0.5">
            <p className="font-semibold">{config.welcomeMessage}</p>
            <p>Merci pour votre visite et bon appétit !</p>
            <p className="text-[9px] text-slate-400">Logiciel RestoFlow Benin • +229 97 00 11 22</p>
          </div>

        </div>

      </div>
    </div>
  );
};
