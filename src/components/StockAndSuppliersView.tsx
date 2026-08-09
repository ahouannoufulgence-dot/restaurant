import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { StockItem, Supplier } from '../types';
import { 
  Boxes, 
  Plus, 
  AlertTriangle, 
  Truck, 
  Coins, 
  CheckCircle2, 
  X, 
  Search,
  Minus
} from 'lucide-react';

export const StockAndSuppliersView: React.FC = () => {
  const { 
    stockItems, 
    addStockItem, 
    updateStockQuantity, 
    suppliers, 
    addSupplier, 
    recordSupplierDebtPayment, 
    formatFcfa 
  } = useResto();

  const [activeTab, setActiveTab] = useState<'stock' | 'suppliers'>('stock');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add stock modal
  const [showAddStockModal, setShowAddStockModal] = useState<boolean>(false);
  const [stkName, setStkName] = useState<string>('');
  const [stkCategory, setStkCategory] = useState<string>('Céréales & Pâtes');
  const [stkQty, setStkQty] = useState<number>(5);
  const [stkMinQty, setStkMinQty] = useState<number>(2);
  const [stkUnit, setStkUnit] = useState<string>('sac');
  const [stkCost, setStkCost] = useState<number>(25000);
  const [stkSupplier, setStkSupplier] = useState<string>('Grossiste Marché Dantokpa');

  // Add supplier modal
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [supName, setSupName] = useState<string>('');
  const [supPhone, setSupPhone] = useState<string>('');
  const [supAddress, setSupAddress] = useState<string>('');
  const [supProducts, setSupProducts] = useState<string>('');

  // Debt payment modal
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(10000);

  const filteredStock = stockItems.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stkName.trim()) return;
    addStockItem({
      name: stkName,
      category: stkCategory,
      currentQuantity: stkQty,
      minQuantity: stkMinQty,
      unit: stkUnit,
      costPriceFcfa: stkCost,
      supplierName: stkSupplier
    });
    setShowAddStockModal(false);
    setStkName('');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    addSupplier({
      name: supName,
      phone: supPhone,
      address: supAddress,
      productsSupplied: supProducts
    });
    setShowAddSupplierModal(false);
    setSupName('');
  };

  const handleDebtPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment) return;

    recordSupplierDebtPayment({
      supplierId: selectedSupplierForPayment.id,
      supplierName: selectedSupplierForPayment.name,
      amountFcfa: paymentAmount,
      date: new Date().toISOString(),
      paymentMethod: 'Espèces',
      recordedBy: 'Gérant RestoFlow'
    });

    setSelectedSupplierForPayment(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Boxes className="h-6 w-6 text-[#F59E0B]" />
            <span>Gestion des Stocks & Fournisseurs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Matières premières (Sacs de riz, bidons d'huile, casiers de bière) et suivi des dettes fournisseurs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'stock' ? (
            <button
              onClick={() => setShowAddStockModal(true)}
              className="bg-[#0B1F33] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-md"
            >
              <Plus className="h-4 w-4 text-[#F59E0B]" />
              <span>Nouveau Produit Stock</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddSupplierModal(true)}
              className="bg-[#0B1F33] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-md"
            >
              <Plus className="h-4 w-4 text-[#F59E0B]" />
              <span>Nouveau Fournisseur</span>
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 py-2.5 rounded-xl transition text-center ${
            activeTab === 'stock' ? 'bg-[#0B1F33] text-[#F59E0B]' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Inventaire & Stocks ({stockItems.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex-1 py-2.5 rounded-xl transition text-center ${
            activeTab === 'suppliers' ? 'bg-[#0B1F33] text-[#F59E0B]' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Fournisseurs & Dettes ({suppliers.length})
        </button>
      </div>

      {/* TAB 1: STOCK INVENTORY */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm relative max-w-md">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher stock (Riz, Huile, Poulet, Bière...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#0B1F33] text-white text-[11px] uppercase font-bold">
                  <tr>
                    <th className="p-3.5">Matière Première</th>
                    <th className="p-3.5">Catégorie</th>
                    <th className="p-3.5">Quantité Actuelle</th>
                    <th className="p-3.5">Seuil Minimum</th>
                    <th className="p-3.5">Coût Unitaire (FCFA)</th>
                    <th className="p-3.5">Ajustement Quantité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStock.map(item => {
                    const isLow = item.currentQuantity <= item.minQuantity;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-bold text-slate-900">
                          {item.name}
                          {isLow && (
                            <span className="block text-[10px] text-amber-600 font-extrabold flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="h-3 w-3" />
                              Alerte Stock Bas !
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
                            {item.category}
                          </span>
                        </td>

                        <td className="p-3.5 font-black text-sm">
                          <span className={isLow ? 'text-amber-600' : 'text-slate-900'}>
                            {item.currentQuantity} {item.unit}
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-500 font-medium">
                          {item.minQuantity} {item.unit}
                        </td>

                        <td className="p-3.5 font-bold text-slate-900">
                          {formatFcfa(item.costPriceFcfa)} / {item.unit}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateStockQuantity(item.id, -1)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                              title="Retirer 1"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => updateStockQuantity(item.id, 1)}
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold"
                              title="Ajouter 1"
                            >
                              +1
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SUPPLIERS & DEBTS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-slate-900 text-sm">{sup.name}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded">
                      Grossiste
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">📞 {sup.phone}</p>
                  <p className="text-xs text-slate-600 mt-1 font-medium">📦 Produits: {sup.productsSupplied}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">Dette due:</span>
                    <span className={`font-black text-sm ${sup.totalDebtFcfa > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatFcfa(sup.totalDebtFcfa)}
                    </span>
                  </div>

                  {sup.totalDebtFcfa > 0 && (
                    <button
                      onClick={() => {
                        setSelectedSupplierForPayment(sup);
                        setPaymentAmount(Math.min(10000, sup.totalDebtFcfa));
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs transition"
                    >
                      Regler une Dette
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD STOCK MODAL */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateStock} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowAddStockModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg border-b pb-2">
              Ajouter une Matière Première au Stock
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Désignation (ex: Riz Parfumé 50kg)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Sac de Riz 50kg"
                  value={stkName}
                  onChange={e => setStkName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={stkCategory}
                    onChange={e => setStkCategory(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unité (sac, bidon, kg, casier)</label>
                  <input
                    type="text"
                    value={stkUnit}
                    onChange={e => setStkUnit(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantité Initiale</label>
                  <input
                    type="number"
                    value={stkQty}
                    onChange={e => setStkQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seuil Alerte Minimum</label>
                  <input
                    type="number"
                    value={stkMinQty}
                    onChange={e => setStkMinQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Coût d'Achat Unitaire (FCFA)</label>
                <input
                  type="number"
                  step={500}
                  value={stkCost}
                  onChange={e => setStkCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] font-extrabold py-3 rounded-xl text-xs transition shadow-md"
            >
              Enregistrer l'Article
            </button>
          </form>
        </div>
      )}

      {/* PAY DEBT MODAL */}
      {selectedSupplierForPayment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDebtPaymentSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setSelectedSupplierForPayment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg border-b pb-2">
              Régler la Dette Fournisseur
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
              <p className="font-bold text-slate-900">{selectedSupplierForPayment.name}</p>
              <p className="text-slate-600">Dette totale actuelle: <strong className="text-red-600">{formatFcfa(selectedSupplierForPayment.totalDebtFcfa)}</strong></p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Montant à verser en espèces (FCFA)</label>
              <input
                type="number"
                step={1000}
                required
                max={selectedSupplierForPayment.totalDebtFcfa}
                value={paymentAmount}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-black text-slate-900 text-base"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs transition shadow-md"
            >
              Valider le Règlement de {formatFcfa(paymentAmount)}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
