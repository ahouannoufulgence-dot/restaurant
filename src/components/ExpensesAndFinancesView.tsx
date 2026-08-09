import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { Expense } from '../types';
import { Receipt, Plus, X, Search, Coins, TrendingUp } from 'lucide-react';

export const ExpensesAndFinancesView: React.FC = () => {
  const { expenses, addExpense, formatFcfa, orders, cashSession } = useResto();

  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<Expense['category']>('Achat nourriture');
  const [amountFcfa, setAmountFcfa] = useState<number>(5000);
  const [notes, setNotes] = useState<string>('');

  const expenseCategories: Expense['category'][] = [
    'Achat nourriture',
    'Boissons',
    'Transport',
    'Électricité',
    'Eau',
    'Internet',
    'Salaire',
    'Entretien',
    'Loyer',
    'Livraison',
    'Autre'
  ];

  // Financial totals
  const totalExpensesAllTime = expenses.reduce((sum, e) => sum + e.amountFcfa, 0);
  const totalRevenueAllTime = orders
    .filter(o => o.paymentStatus === 'Payé')
    .reduce((sum, o) => sum + o.totalFcfa, 0);

  const netProfit = totalRevenueAllTime - totalExpensesAllTime;

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addExpense({
      title,
      category,
      amountFcfa,
      date: new Date().toISOString(),
      recordedBy: 'Gérant RestoFlow',
      notes
    });

    setShowAddExpenseModal(false);
    setTitle('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-[#F59E0B]" />
            <span>Finances & Dépenses Opérationnelles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enregistrement des charges (Transport, Condiments, Électricité SBEE) et calcul du résultat net en FCFA.
          </p>
        </div>

        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="bg-[#0B1F33] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-md"
        >
          <Plus className="h-4 w-4 text-[#F59E0B]" />
          <span>Enregistrer une Dépense</span>
        </button>
      </div>

      {/* FINANCIAL METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Chiffre d'Affaires Encaissé</span>
          <p className="text-2xl font-black text-emerald-700 mt-2">{formatFcfa(totalRevenueAllTime)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total des ventes payées</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Dépenses Cumulées</span>
          <p className="text-2xl font-black text-red-700 mt-2">{formatFcfa(totalExpensesAllTime)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Matières premières & charges</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-300 bg-amber-50/50 shadow-sm">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">Bénéfice Net Estimé</span>
          <p className={`text-2xl font-black mt-2 ${netProfit >= 0 ? 'text-[#0B1F33]' : 'text-red-700'}`}>
            {formatFcfa(netProfit)}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">CA Encaissé - Dépenses</p>
        </div>

      </div>

      {/* EXPENSES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b font-extrabold text-slate-900 text-sm">
          Historique des Dépenses ({expenses.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#0B1F33] text-white text-[11px] uppercase font-bold">
              <tr>
                <th className="p-3.5">Motif / Intitulé</th>
                <th className="p-3.5">Catégorie</th>
                <th className="p-3.5">Montant FCFA</th>
                <th className="p-3.5">Date & Heure</th>
                <th className="p-3.5">Enregistré par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-slate-900">
                    {exp.title}
                    {exp.notes && <p className="text-[10px] text-slate-500 font-normal">{exp.notes}</p>}
                  </td>

                  <td className="p-3.5">
                    <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
                      {exp.category}
                    </span>
                  </td>

                  <td className="p-3.5 font-black text-red-600 text-sm">
                    -{formatFcfa(exp.amountFcfa)}
                  </td>

                  <td className="p-3.5 text-slate-500 font-medium">
                    {new Date(exp.date).toLocaleString('fr-BJ')}
                  </td>

                  <td className="p-3.5 font-semibold text-slate-800">
                    {exp.recordedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitExpense} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowAddExpenseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg border-b pb-2">
              Enregistrer une Dépense
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Motif de la Dépense</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Achat condiments au marché Dantokpa"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border rounded-xl px-2 py-2 font-bold"
                  >
                    {expenseCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Montant (FCFA)</label>
                  <input
                    type="number"
                    step={500}
                    required
                    value={amountFcfa}
                    onChange={e => setAmountFcfa(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-black text-slate-900 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Détails / Remarques</label>
                <textarea
                  rows={2}
                  placeholder="ex: Achat tomates, piments, oignons, gingembre..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] font-extrabold py-3 rounded-xl text-xs transition shadow-md"
            >
              Valider la Dépense de {formatFcfa(amountFcfa)}
            </button>

          </form>
        </div>
      )}

    </div>
  );
};
