import React, { useState, useEffect } from 'react';
import { useResto } from '../context/RestoContext';
import { EstablishmentType } from '../types';
import { 
  getSupabaseUrl, 
  getSupabaseAnonKey, 
  saveSupabaseCredentials, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA, 
  isSupabaseConfigured 
} from '../lib/supabase';
import { 
  Settings, 
  Store, 
  Phone, 
  MapPin, 
  Coins, 
  UserCheck, 
  Shield, 
  Check, 
  Plus, 
  Trash2, 
  History,
  RotateCcw,
  AlertTriangle,
  Receipt,
  Image as ImageIcon,
  CheckCircle2,
  Building2,
  Sparkles,
  Database,
  Key,
  Globe,
  Copy,
  ExternalLink,
  Server
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    activityLogs, 
    formatFcfa, 
    resetCounters, 
    resetAllDataToDefault,
    setIsRegisterModalOpen,
    registeredRestaurants,
    activeRestaurantId
  } = useResto();

  const [name, setName] = useState<string>(config.name);
  const [type, setType] = useState<EstablishmentType>(config.type);
  const [phone, setPhone] = useState<string>(config.phone);
  const [whatsappPhone, setWhatsappPhone] = useState<string>(config.whatsappPhone || config.phone);
  const [ifuNumber, setIfuNumber] = useState<string>(config.ifuNumber || '');
  const [logoUrl, setLogoUrl] = useState<string>(config.logoUrl || '');
  const [address, setAddress] = useState<string>(config.address);
  const [city, setCity] = useState<string>(config.city);
  const [neighborhood, setNeighborhood] = useState<string>(config.neighborhood);
  const [welcomeMessage, setWelcomeMessage] = useState<string>(config.welcomeMessage);
  const [ticketFooterMessage, setTicketFooterMessage] = useState<string>(config.ticketFooterMessage || 'Merci pour votre confiance ! À très bientôt.');

  const [deliveryZones, setDeliveryZones] = useState(config.deliveryZones);
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneFee, setNewZoneFee] = useState<number>(1000);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [resetModalType, setResetModalType] = useState<'counters' | 'full' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase Database State
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(getSupabaseUrl());
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>(getSupabaseAnonKey());
  const [dbTestResult, setDbTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [testingDb, setTestingDb] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
    setTestingDb(true);
    const res = await testSupabaseConnection();
    setDbTestResult(res);
    setTestingDb(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const establishmentTypes: EstablishmentType[] = [
    'Maquis',
    'Restaurant',
    'Bar-restaurant',
    'Fast-food',
    'Cafétéria',
    'Snack / Pâtisserie',
    'Service de livraison'
  ];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      name,
      type,
      phone,
      whatsappPhone,
      ifuNumber,
      logoUrl,
      address,
      city,
      neighborhood,
      welcomeMessage,
      ticketFooterMessage,
      deliveryZones
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) return;
    setDeliveryZones(prev => [...prev, { zone: newZoneName.trim(), defaultFeeFcfa: newZoneFee }]);
    setNewZoneName('');
  };

  const handleRemoveZone = (index: number) => {
    setDeliveryZones(prev => prev.filter((_, i) => i !== index));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmResetCounters = () => {
    resetCounters();
    setResetModalType(null);
    triggerToast("✓ Tous les compteurs de commandes, chiffre d'affaires et caisse ont été remis à zéro !");
  };

  const handleConfirmResetAll = () => {
    resetAllDataToDefault();
    setResetModalType(null);
    setName("Mon Nouveau Restaurant");
    setPhone("+229 00 00 00 00");
    setCity("Cotonou");
    setNeighborhood("Centre-Ville");
    triggerToast("✓ Réinitialisation complète SaaS effectuée. Vous pouvez personnaliser votre restaurant.");
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white font-black text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#F59E0B]" />
            <span>Paramètres SaaS & Établissement</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personnalisation complète du restaurant, numéros IFU/WhatsApp, tickets de caisse et inscription de nouveaux établissements.
          </p>
        </div>

        {/* Quick Reset Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setResetModalType('counters')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Remettre les compteurs à 0</span>
          </button>
        </div>
      </div>

      {/* Multi-Restaurant SaaS Banner */}
      <div className="bg-[#0B1F33] text-white p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#F59E0B] text-[#0B1F33] p-3 rounded-2xl font-black shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30">
                Multi-Tenant SaaS
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {registeredRestaurants.length} établissement(s) inscrit(s)
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              {config.name} <span className="text-amber-400 font-medium text-xs">({config.city})</span>
            </h2>
            <p className="text-xs text-slate-300">
              Chaque restaurant inscrit possède ses propres cartes, tables, caisses et données financières isolées.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-[#F59E0B] hover:bg-[#d98805] text-[#0B1F33] font-black text-xs px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-lg active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Inscrire / Changer de Restaurant</span>
        </button>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CONFIG FORM (2 Cols) */}
        <form onSubmit={handleSaveConfig} className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          
          <div className="border-b pb-3 flex justify-between items-center">
            <h2 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Store className="h-5 w-5 text-[#F59E0B]" />
              <span>Identité & Personnalisation du Restaurant</span>
            </h2>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Check className="h-4 w-4" /> Enregistré !
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nom de l'Établissement</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ex: Le Palais des Grillades Bénin"
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-[#0B1F33]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Type d'Établissement</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as EstablishmentType)}
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
              >
                {establishmentTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Téléphone Appel Client</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+229 97 00 00 00"
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Numéro WhatsApp Pro (Commandes)</label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={e => setWhatsappPhone(e.target.value)}
                placeholder="+229 97 00 00 00"
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Numéro IFU Fiscal (Bénin)</label>
              <input
                type="text"
                value={ifuNumber}
                onChange={e => setIfuNumber(e.target.value)}
                placeholder="ex: 3202112849012"
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Devise de l'Application</label>
              <input
                type="text"
                disabled
                value="FCFA (XOF)"
                className="w-full bg-slate-100 border rounded-xl px-3 py-2 font-black text-slate-800 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Adresse physique / Rue</label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="ex: Rue 108, face Pharmacie Cadjehoun"
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Ville</label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="ex: Cotonou, Porto-Novo, Parakou..."
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Quartier / Repère</label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                placeholder="ex: Cadjehoun, Haie-Vive, Tankpè..."
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">URL Logo / En-tête</label>
              <input
                type="text"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
              />
            </div>
          </div>

          {/* Ticket Messages */}
          <div className="pt-4 border-t space-y-3">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>Personnalisation du Ticket de Caisse & Reçus</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Message d'En-tête Ticket</label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pied de Page Ticket</label>
                <input
                  type="text"
                  value={ticketFooterMessage}
                  onChange={e => setTicketFooterMessage(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Delivery Zones */}
          <div className="pt-4 border-t space-y-3">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Zones de Livraison & Tarif de Base</h3>
            
            <div className="space-y-2">
              {deliveryZones.map((dz, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border text-xs">
                  <span className="font-bold text-slate-800">{dz.zone}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#0B1F33]">{formatFcfa(dz.defaultFeeFcfa)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveZone(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs pt-1">
              <input
                type="text"
                placeholder="Nouvelle zone (ex: Calavi Tankpè)"
                value={newZoneName}
                onChange={e => setNewZoneName(e.target.value)}
                className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 font-medium"
              />
              <input
                type="number"
                step={500}
                placeholder="Frais"
                value={newZoneFee}
                onChange={e => setNewZoneFee(Number(e.target.value))}
                className="w-24 bg-slate-50 border rounded-xl px-3 py-2 font-bold"
              />
              <button
                type="button"
                onClick={handleAddZone}
                className="bg-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-slate-900 transition"
              >
                + Zone
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] font-black py-3.5 rounded-2xl text-xs transition shadow-md"
          >
            Enregistrer les Paramètres du Restaurant
          </button>

        </form>

        {/* AUDIT LOG, SAAS RESET & PERMISSIONS GUIDE (1 Col) */}
        <div className="space-y-6">

          {/* Database & Cloud Sync Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" />
                <span>Base de Données & Synchro Supabase</span>
              </h3>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                isSupabaseConfigured() 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isSupabaseConfigured() ? 'Supabase Connecté' : 'Mode Local Active (IndexedDB)'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              L'application enregistre <strong>automatiquement</strong> toutes les données localement sur votre appareil. Vous pouvez également connecter un projet <strong>Supabase (PostgreSQL)</strong> gratuit pour la synchronisation multi-appareils en temps réel.
            </p>

            <form onSubmit={handleSaveSupabase} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  URL Supabase Project (ex: https://xyz.supabase.co)
                </label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrlInput}
                  onChange={e => setSupabaseUrlInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Key className="w-3 h-3 text-slate-400" />
                  API Anon Key (Clé publique)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                  value={supabaseKeyInput}
                  onChange={e => setSupabaseKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {dbTestResult && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  dbTestResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <p className="font-bold">{dbTestResult.message}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={testingDb}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>{testingDb ? 'Vérification...' : 'Connecter & Tester'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSqlModal(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2.5 rounded-xl text-xs transition flex items-center gap-1"
                  title="Voir le script SQL de création des tables"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Script SQL</span>
                </button>
              </div>
            </form>
          </div>

          {/* SaaS & Counter Reset Card */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5 rounded-2xl border border-amber-300/50 shadow-sm space-y-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-600" />
              <span>Remise à Zéro des Compteurs & SaaS</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Utile pour réinitialiser les ventes avant un nouveau service ou configurer un tout nouvel établissement.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setResetModalType('counters')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Remettre les Compteurs à 0</span>
              </button>

              <button
                type="button"
                onClick={() => setResetModalType('full')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Réinitialisation Totale de l'Établissement</span>
              </button>
            </div>
          </div>
          
          {/* Permissions breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#F59E0B]" />
              <span>Guide des 5 Rôles & Permissions</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2 bg-slate-50 rounded-lg border">
                <strong className="text-slate-900">1. Administrateur:</strong> Accès complet à tous les modules, finances, stocks et paramètres.
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border">
                <strong className="text-slate-900">2. Chef cuisinier:</strong> Accès privilégié au KDS Cuisine, stock matières premières et menu.
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border">
                <strong className="text-slate-900">3. Serveur:</strong> Saisie rapide de commande (POS Rapide), plan des tables et suivi client.
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border">
                <strong className="text-slate-900">4. Caissier:</strong> Encaissement Mobile Money/Espèces, gestion de caisse et clôture.
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border">
                <strong className="text-slate-900">5. Client:</strong> Consultation du menu et état des commandes.
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-blue-600" />
              <span>Journal d'Activité Récent</span>
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto text-xs pr-1">
              {activityLogs.map((log, index) => (
                <div key={`${log.id}-${index}`} className="p-2 bg-slate-50 rounded-lg border space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('fr-BJ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* CONFIRMATION MODALS */}
      {resetModalType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-black text-slate-900 text-lg">
                {resetModalType === 'counters' ? "Remise à zéro des compteurs" : "Réinitialisation Totale"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {resetModalType === 'counters' 
                  ? "Cette action va effacer l'historique des commandes en cours, remettre à zéro le chiffre d'affaires, les sessions de caisse et libérer toutes les tables. Votre carte de menu et vos produits seront conservés."
                  : "Attention : cette action va réinitialiser l'ensemble des données (menu, stocks, dépenses, commandes et paramètres) pour démarrer la configuration d'un tout nouveau restaurant."}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetModalType(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Annuler
              </button>
              
              {resetModalType === 'counters' ? (
                <button
                  type="button"
                  onClick={handleConfirmResetCounters}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition shadow-md"
                >
                  Confirmer (Compteurs à 0)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmResetAll}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs transition shadow-md"
                >
                  Tout Réinitialiser
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SQL SCHEMA MODAL */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-700 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">Script SQL Supabase pour RestoPOS Bénin</h3>
              </div>
              <button 
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Copiez ce script et collez-le dans l'Éditeur SQL de votre tableau de bord Supabase (<strong>SQL Editor &gt; New Query &gt; Run</strong>) pour créer les tables automatiquement.
            </p>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] leading-relaxed text-emerald-300 whitespace-pre">
              {SUPABASE_SQL_SCHEMA}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                {copiedSql ? '✓ Script copié dans le presse-papier !' : '11 tables avec règles RLS prêtes'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copié !' : 'Copier le script SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

