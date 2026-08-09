import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useResto } from '../context/RestoContext';
import { TableZone, TableStatus, RestaurantTable } from '../types';
import { 
  Grid3X3, 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  X,
  QrCode,
  Printer,
  RefreshCw,
  Eye,
  Download,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface TableManagementProps {
  setActiveTab: (tab: string) => void;
}

export const TableManagement: React.FC<TableManagementProps> = ({ setActiveTab }) => {
  const { 
    tables, 
    updateTableStatus, 
    addTable, 
    orders, 
    formatFcfa,
    generateOrRegenerateQrCode,
    toggleQrCodeStatus,
    config,
    getOrdersForTable,
    getTableTotalFcfa
  } = useResto();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('');
  const [newSeats, setNewSeats] = useState<number>(4);
  const [newZone, setNewZone] = useState<TableZone>('Salle');

  // QR Modal States
  const [selectedQrTable, setSelectedQrTable] = useState<RestaurantTable | null>(null);
  const [showBatchPrintModal, setShowBatchPrintModal] = useState<boolean>(false);

  const zonesList: TableZone[] = ['Salle', 'Terrasse', 'Extérieur', 'Bar', 'VIP'];

  const filteredTables = tables.filter(t => selectedZone === 'all' || t.zone === selectedZone);

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    addTable(newCode, newSeats, newZone);
    setNewCode('');
    setShowAddModal(false);
  };

  // Real, scannable QR Code generator using standard QR code matrix
  const QRCodeDisplay: React.FC<{ value: string; tableCode: string; size?: number }> = ({ value, tableCode, size = 160 }) => {
    // Generate full URL so smartphone cameras (iPhone & Android) open the menu directly upon scan
    const targetUrl = value.startsWith('http') 
      ? value 
      : `${window.location.origin}/commande/table/${value}`;

    return (
      <div className="flex flex-col items-center bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-md">
        <div className="p-2 bg-white rounded-xl border border-slate-200">
          <QRCodeSVG
            value={targetUrl}
            size={size}
            level="H"
            marginSize={1}
            bgColor="#FFFFFF"
            fgColor="#0F172A"
          />
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs font-black tracking-widest text-slate-900 block uppercase">
            TABLE {tableCode}
          </span>
          <span className="text-[10px] text-amber-800 font-bold block mt-0.5">
            Scannez pour commander le menu
          </span>
        </div>
      </div>
    );
  };

  // Status style helpers
  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'Libre': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800';
      case 'Occupée': return 'bg-amber-500/10 border-amber-500/40 text-amber-900';
      case 'Réservée': return 'bg-blue-500/10 border-blue-500/30 text-blue-900';
      case 'Nettoyage': return 'bg-purple-500/10 border-purple-500/30 text-purple-900';
      case 'Indisponible': return 'bg-slate-200 border-slate-300 text-slate-600';
      default: return 'bg-slate-100 border-slate-200 text-slate-800';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-[#F59E0B]" />
            <span>Plan des Tables & QR Codes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les tables de votre restaurant et imprimez les QR codes pour les commandes directes des clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBatchPrintModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-md"
          >
            <Printer className="h-4 w-4 text-amber-200" />
            <span>Imprimer Tous les QR Codes</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0B1F33] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-md"
          >
            <Plus className="h-4 w-4 text-[#F59E0B]" />
            <span>Ajouter une Table</span>
          </button>
        </div>
      </div>

      {/* ZONE CHIPS FILTER */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setSelectedZone('all')}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
            selectedZone === 'all' 
              ? 'bg-[#0B1F33] text-[#F59E0B]' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Toutes les Zones ({tables.length})
        </button>
        {zonesList.map(z => {
          const count = tables.filter(t => t.zone === z).length;
          return (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                selectedZone === z 
                  ? 'bg-[#0B1F33] text-[#F59E0B]' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Zone {z} ({count})
            </button>
          );
        })}
      </div>

      {/* VISUAL TABLES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map(table => {
          const activeOrders = getOrdersForTable(table.id);
          const totalCumulFcfa = getTableTotalFcfa(table.id);

          return (
            <div
              key={table.id}
              className={`p-5 rounded-2xl border transition shadow-sm space-y-4 flex flex-col justify-between ${getStatusColor(table.status)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{table.code}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-white/80 rounded-md text-slate-700 border">
                      {table.zone}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-1 font-medium">
                    <Users className="h-3.5 w-3.5" />
                    <span>{table.seats} places</span>
                    {table.qrCodeStatus === 'Désactivé' && (
                      <span className="ml-1 text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                        QR Inactif
                      </span>
                    )}
                  </p>
                </div>

                {/* Status selector */}
                <select
                  value={table.status}
                  onChange={e => updateTableStatus(table.id, e.target.value as TableStatus)}
                  className="bg-white/90 border rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Libre">Libre</option>
                  <option value="Occupée">Occupée</option>
                  <option value="Réservée">Réservée</option>
                  <option value="Nettoyage">Nettoyage</option>
                  <option value="Indisponible">Indisponible</option>
                </select>
              </div>

              {/* Active Order Details */}
              {activeOrders.length > 0 ? (
                <div className="bg-white/90 p-3 rounded-xl border border-amber-300 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{activeOrders.length} commande(s) active(s)</span>
                    <span className="text-amber-900">{formatFcfa(totalCumulFcfa)}</span>
                  </div>
                  {activeOrders.map(o => (
                    <div key={o.id} className="text-[11px] text-slate-700 flex justify-between border-t border-amber-100 pt-1">
                      <span className="font-semibold">{o.code} ({o.sourceCommande || 'MANUELLE'})</span>
                      <span className="font-bold">{formatFcfa(o.totalFcfa)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Aucune commande active sur cette table.
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setSelectedQrTable(table)}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold py-2 px-2 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-xs"
                  title="Afficher et imprimer le QR code"
                >
                  <QrCode className="h-3.5 w-3.5 text-amber-600" />
                  <span>QR Code</span>
                </button>

                <button
                  onClick={() => setActiveTab('pos')}
                  className="bg-[#0B1F33] hover:bg-slate-800 text-white font-bold py-2 px-2 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <Smartphone className="h-3.5 w-3.5 text-[#F59E0B]" />
                  <span>Saisir POS</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* SINGLE TABLE QR CODE MODAL */}
      {selectedQrTable && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setSelectedQrTable(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-xs">
                {config.name} • Zone {selectedQrTable.zone}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Table {selectedQrTable.code}
              </h3>
              <p className="text-xs text-slate-500">
                Support officiel pour pose sur la table {selectedQrTable.code}
              </p>
            </div>

            {/* QR Visual Card */}
            <div className="flex justify-center my-2">
              <QRCodeDisplay 
                value={selectedQrTable.publicToken || selectedQrTable.code} 
                tableCode={selectedQrTable.code} 
                size={180}
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Lien public unique :</span>
                <span className="font-mono text-amber-900 font-bold truncate max-w-[200px]" title={`${window.location.origin}/commande/table/${selectedQrTable.publicToken || selectedQrTable.code}`}>
                  {`${window.location.origin}/commande/table/${selectedQrTable.publicToken || selectedQrTable.code}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Statut QR Code :</span>
                <span className={`font-bold ${selectedQrTable.qrCodeStatus === 'Désactivé' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {selectedQrTable.qrCodeStatus || 'Actif'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => generateOrRegenerateQrCode(selectedQrTable.id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
                  <span>Régénérer Token</span>
                </button>

                <button
                  onClick={() => toggleQrCodeStatus(selectedQrTable.id)}
                  className={`w-full font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    selectedQrTable.qrCodeStatus === 'Désactivé'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  <span>{selectedQrTable.qrCodeStatus === 'Désactivé' ? 'Réactiver QR' : 'Désactiver QR'}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedQrTable(null);
                  setActiveTab('client-menu');
                }}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5 text-amber-700" />
                <span>Tester la vue client pour cette table</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] font-extrabold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer la Fiche Table</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH PRINT ALL TABLES QR CODES MODAL */}
      {showBatchPrintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-8">
          <div className="bg-white rounded-3xl max-w-4xl mx-auto p-6 sm:p-10 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Printer className="h-5 w-5 text-amber-600" />
                  <span>Planche d'Impression QR Codes Tables (A4)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Prêt pour impression sur carton d'affichage pour les tables de {config.name}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimer Maintenant</span>
                </button>

                <button
                  onClick={() => setShowBatchPrintModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Print Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-2xl border print:bg-white print:p-0 print:border-none">
              {tables.map(tbl => (
                <div 
                  key={tbl.id} 
                  className="bg-white p-5 rounded-2xl border-2 border-slate-900 text-center space-y-3 shadow-md print:shadow-none print:break-inside-avoid"
                >
                  <div className="border-b pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">{config.name}</p>
                    <h4 className="text-xl font-black text-slate-900">TABLE {tbl.code}</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">{tbl.zone}</span>
                  </div>

                  <div className="flex justify-center py-1">
                    <QRCodeDisplay value={tbl.publicToken || tbl.code} tableCode={tbl.code} size={140} />
                  </div>

                  <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-[10px] font-bold text-amber-900">
                    Scannez avec votre téléphone pour commander directement !
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD TABLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddTable} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg border-b pb-2">
              Ajouter une Nouvelle Table
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Code Table (ex: T09, T10)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: T09"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de Places</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newSeats}
                  onChange={e => setNewSeats(Number(e.target.value))}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Zone de l'établissement</label>
                <select
                  value={newZone}
                  onChange={e => setNewZone(e.target.value as TableZone)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                >
                  {zonesList.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] font-extrabold py-3 rounded-xl text-xs transition shadow-md"
            >
              Créer la Table
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

