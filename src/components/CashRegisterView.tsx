import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { Coins, Lock, Unlock, Printer, TrendingUp, Receipt, Smartphone } from 'lucide-react';

export const CashRegisterView: React.FC = () => {
  const { cashSession, openCashRegister, closeCashRegister, formatFcfa, config, expenses, orders } = useResto();

  const [initialAmount, setInitialAmount] = useState<number>(50000);
  const [actualCashAmount, setActualCashAmount] = useState<number>(cashSession.theoreticalCashFcfa || 0);
  const [closeNotes, setCloseNotes] = useState<string>('');

  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  // Today's stats summary
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr) && o.status !== 'Annulée');
  const todayExpensesList = expenses.filter(e => e.date.startsWith(todayStr));

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    openCashRegister(initialAmount, `Ouverture de caisse avec ${formatFcfa(initialAmount)}.`);
  };

  const handleCloseRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashRegister(actualCashAmount, closeNotes);
    setShowCloseModal(false);
  };

  const handlePrintDailyReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Coins className="h-6 w-6 text-[#F59E0B]" />
            <span>Gestion de Caisse Journalière</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ouverture / Clôture de caisse, suivi des encaissements Espèces, Mobile Money et réconciliation.
          </p>
        </div>

        <button
          onClick={handlePrintDailyReport}
          className="bg-[#0B1F33] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-md"
        >
          <Printer className="h-4 w-4 text-[#F59E0B]" />
          <span>Imprimer Rapport Journalier</span>
        </button>
      </div>

      {/* CASH REGISTER STATUS BANNER */}
      <div className={`p-6 rounded-2xl border shadow-lg transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        cashSession.status === 'Ouverte' 
          ? 'bg-emerald-950 text-white border-emerald-800' 
          : 'bg-amber-950 text-white border-amber-800'
      }`}>
        
        <div>
          <span className={`inline-block text-xs font-black px-3 py-1 rounded-full uppercase mb-2 ${
            cashSession.status === 'Ouverte' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
          }`}>
            Caisse {cashSession.status}
          </span>
          <h2 className="text-xl font-black">
            Caisse de {config.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Ouverte par <strong>{cashSession.openedBy}</strong> le {new Date(cashSession.openedAt).toLocaleString('fr-BJ')}
          </p>
        </div>

        <div>
          {cashSession.status === 'Ouverte' ? (
            <button
              onClick={() => {
                setActualCashAmount(cashSession.theoreticalCashFcfa);
                setShowCloseModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3 rounded-xl transition flex items-center gap-2 text-xs shadow-md"
            >
              <Lock className="h-4 w-4" />
              <span>Clôturer la Caisse</span>
            </button>
          ) : (
            <form onSubmit={handleOpenRegister} className="flex items-center gap-2">
              <input
                type="number"
                step={1000}
                value={initialAmount}
                onChange={e => setInitialAmount(Number(e.target.value))}
                className="bg-slate-800 text-white border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold w-36"
                placeholder="Fonds initial"
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2 rounded-xl transition text-xs whitespace-nowrap"
              >
                Ouvrir la Caisse
              </button>
            </form>
          )}
        </div>

      </div>

      {/* CASH FLOW BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Fonds initial */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Fonds de Caisse Initial</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatFcfa(cashSession.initialCashFcfa)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Espèces vérifiées à l'ouverture</p>
        </div>

        {/* Ventes Espèces */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Encaissements Espèces</span>
          <p className="text-2xl font-black text-emerald-700 mt-2">+{formatFcfa(cashSession.totalCashSalesFcfa)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ventes payées en cash</p>
        </div>

        {/* Total Dépenses Cash */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sorties de Caisse / Dépenses</span>
          <p className="text-2xl font-black text-red-700 mt-2">-{formatFcfa(cashSession.totalExpensesFcfa)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Achats condiments & transports</p>
        </div>

        {/* Solde Théorique Caisse */}
        <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-sm bg-amber-50/50">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">Solde Théorique en Caisse</span>
          <p className="text-2xl font-black text-[#0B1F33] mt-2">{formatFcfa(cashSession.theoreticalCashFcfa)}</p>
          <p className="text-[11px] text-slate-600 mt-1">Fonds initial + Cash - Dépenses</p>
        </div>

      </div>

      {/* MOBILE MONEY ENCAISSEMENTS SUMMARY */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
          <span>Encaissements Mobile Money (Hors tiroir caisse)</span>
          <span className="text-xs text-slate-400">Directement vers compte marchand</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <div className="flex justify-between text-xs font-bold text-amber-900">
              <span>MTN Mobile Money</span>
              <span>MTN MoMo</span>
            </div>
            <p className="text-2xl font-black text-amber-900 mt-2">
              {formatFcfa(cashSession.totalMtnSalesFcfa)}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex justify-between text-xs font-bold text-blue-900">
              <span>Moov Money</span>
              <span>Moov</span>
            </div>
            <p className="text-2xl font-black text-blue-900 mt-2">
              {formatFcfa(cashSession.totalMoovSalesFcfa)}
            </p>
          </div>

        </div>
      </div>

      {/* DAILY CLOSING REPORT DETAILS (PRINTABLE) */}
      <div id="daily-report-print" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b pb-3">
          <h3 className="text-lg font-extrabold text-slate-900">RAPPORT CONSOLIDÉ DE CAISSE DU {new Date().toLocaleDateString('fr-BJ')}</h3>
          <p className="text-xs text-slate-500">{config.name} • {config.neighborhood}, {config.city}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 border-b pb-1">RÉSUMÉ DES VENTES DU JOUR</h4>
            <div className="flex justify-between">
              <span>Nombre total de commandes :</span>
              <span className="font-bold text-slate-900">{todayOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Ventes en Espèces :</span>
              <span className="font-bold text-slate-900">{formatFcfa(cashSession.totalCashSalesFcfa)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ventes MTN MoMo :</span>
              <span className="font-bold text-slate-900">{formatFcfa(cashSession.totalMtnSalesFcfa)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ventes Moov Money :</span>
              <span className="font-bold text-slate-900">{formatFcfa(cashSession.totalMoovSalesFcfa)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t">
              <span>CHIFFRE D'AFFAIRES TOTAL :</span>
              <span className="text-emerald-700">
                {formatFcfa(cashSession.totalCashSalesFcfa + cashSession.totalMtnSalesFcfa + cashSession.totalMoovSalesFcfa)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 border-b pb-1">MOUVEMENTS DE CAISSE & ÉCARTS</h4>
            <div className="flex justify-between">
              <span>Fonds initial :</span>
              <span className="font-bold text-slate-900">{formatFcfa(cashSession.initialCashFcfa)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Moins Dépenses sorties :</span>
              <span className="font-bold">-{formatFcfa(cashSession.totalExpensesFcfa)}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 pt-1 border-t">
              <span>Solde Théorique Caisse :</span>
              <span>{formatFcfa(cashSession.theoreticalCashFcfa)}</span>
            </div>
            {cashSession.actualCashFcfa !== undefined && (
              <>
                <div className="flex justify-between font-black text-slate-900">
                  <span>Solde Réel Compté :</span>
                  <span>{formatFcfa(cashSession.actualCashFcfa)}</span>
                </div>
                <div className={`flex justify-between font-black ${
                  (cashSession.discrepancyFcfa || 0) === 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  <span>ÉCART DE CAISSE :</span>
                  <span>{formatFcfa(cashSession.discrepancyFcfa || 0)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CLOSE CASH REGISTER MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCloseRegisterSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            
            <h3 className="font-extrabold text-slate-900 text-lg border-b pb-2">
              Clôturer la Caisse de la Journée
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-slate-500 block">Solde théorique attendu en caisse :</span>
                <span className="text-xl font-black text-slate-900">{formatFcfa(cashSession.theoreticalCashFcfa)}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Montant Espèces Réellement Compté (FCFA)</label>
                <input
                  type="number"
                  required
                  step={100}
                  value={actualCashAmount}
                  onChange={e => setActualCashAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-base font-black text-slate-900"
                />
              </div>

              {actualCashAmount !== cashSession.theoreticalCashFcfa && (
                <div className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  Écart détecté: {formatFcfa(actualCashAmount - cashSession.theoreticalCashFcfa)}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Remarques / Explication de clôture</label>
                <textarea
                  rows={2}
                  placeholder="ex: Billets de 10 000 FCFA comptés, pas de manque."
                  value={closeNotes}
                  onChange={e => setCloseNotes(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-md"
              >
                Valider Clôture
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
