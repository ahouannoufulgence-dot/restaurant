import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { EstablishmentType } from '../types';
import { 
  Building2, 
  Store, 
  User, 
  Phone, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Receipt, 
  Utensils, 
  Layers
} from 'lucide-react';

export const RestaurantRegistrationModal: React.FC = () => {
  const { 
    isRegisterModalOpen, 
    setIsRegisterModalOpen, 
    registeredRestaurants, 
    activeRestaurantId, 
    registerRestaurant, 
    switchActiveRestaurant, 
    deleteRegisteredRestaurant 
  } = useResto();

  const [activeTab, setActiveTab] = useState<'register' | 'switch'>('register');

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<EstablishmentType>('Restaurant');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [ifuNumber, setIfuNumber] = useState('');
  const [pinCode, setPinCode] = useState('1234');
  const [startWithTemplate, setStartWithTemplate] = useState(true);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isRegisterModalOpen) return null;

  const establishmentTypes: EstablishmentType[] = [
    'Restaurant',
    'Maquis',
    'Bar-restaurant',
    'Fast-food',
    'Cafétéria',
    'Snack / Pâtisserie',
    'Service de livraison'
  ];

  const citiesList = [
    'Cotonou',
    'Abomey-Calavi',
    'Porto-Novo',
    'Parakou',
    'Bohicon',
    'Abomey',
    'Natitingou',
    'Ouidah',
    'Kandi',
    'Dassa-Zoumé',
    'Lossa / Djougou'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !ownerName.trim()) return;

    const registered = registerRestaurant({
      name: name.trim(),
      type,
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      whatsappPhone: whatsappPhone.trim() || phone.trim(),
      city: city.trim() || 'Cotonou',
      neighborhood: neighborhood.trim() || 'Centre-Ville',
      address: address.trim() || `Quartier ${neighborhood || 'Centre'}`,
      ifuNumber: ifuNumber.trim(),
      pinCode: pinCode.trim() || '1234'
    }, startWithTemplate);

    setSuccessMsg(`Félicitations ! L'établissement "${registered.name}" a été inscrit avec succès !`);
    
    // Reset form
    setName('');
    setOwnerName('');
    setPhone('');
    setWhatsappPhone('');
    setNeighborhood('');
    setAddress('');
    setIfuNumber('');

    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="bg-[#0B1F33] text-white p-6 relative">
          <button
            onClick={() => setIsRegisterModalOpen(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-[#F59E0B] text-[#0B1F33] p-3 rounded-2xl shadow-lg">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30">
                  Plateforme SaaS Multi-Restaurants Bénin
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Inscription & Espace Restaurant
              </h2>
              <p className="text-xs text-slate-300">
                Inscrivez un nouvel établissement ou basculez entre vos restaurants enregistrés.
              </p>
            </div>
          </div>

          {/* Navigation Tabs inside Header */}
          <div className="flex gap-2 mt-5 border-t border-slate-800 pt-4">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition ${
                activeTab === 'register'
                  ? 'bg-[#F59E0B] text-[#0B1F33] shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>S'inscrire (Nouveau Restaurant)</span>
            </button>

            <button
              onClick={() => setActiveTab('switch')}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition ${
                activeTab === 'switch'
                  ? 'bg-[#F59E0B] text-[#0B1F33] shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Mes Établissements ({registeredRestaurants.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">

          {successMsg && (
            <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: REGISTRATION FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Inscription SaaS :</strong> Chaque restaurant possède son propre espace sécurisé, son menu, ses tables QR Code, ses caisses et son historique de commandes totalement isolés.
                </p>
              </div>

              {/* Grid Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Restaurant Name */}
                <div className="sm:col-span-2">
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Nom de l'Établissement <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="ex: Le Palais des Grillades Bénin, Maquis Chez Tata"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-bold focus:ring-2 focus:ring-[#0B1F33]"
                    />
                  </div>
                </div>

                {/* Establishment Type */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Type d'Établissement
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as EstablishmentType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold focus:ring-2 focus:ring-[#0B1F33]"
                  >
                    {establishmentTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Owner Name */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Nom du Gérant / Propriétaire <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      placeholder="ex: Pascaline Houénou"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-bold focus:ring-2 focus:ring-[#0B1F33]"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Téléphone Principal <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="ex: +229 97 00 11 22"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-bold focus:ring-2 focus:ring-[#0B1F33]"
                    />
                  </div>
                </div>

                {/* WhatsApp Pro */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    WhatsApp Pro Commandes
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-emerald-600" />
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={e => setWhatsappPhone(e.target.value)}
                      placeholder="ex: +229 97 00 11 22"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-bold focus:ring-2 focus:ring-[#0B1F33]"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Ville (Bénin)
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold focus:ring-2 focus:ring-[#0B1F33]"
                  >
                    {citiesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Neighborhood */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Quartier / Emplacement
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={e => setNeighborhood(e.target.value)}
                      placeholder="ex: Haie Vive, Fidjrossè, Tankpè..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-bold focus:ring-2 focus:ring-[#0B1F33]"
                    />
                  </div>
                </div>

                {/* IFU Number */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Numéro IFU Fiscal (Bénin) <span className="text-slate-400 font-normal">(Optionnel)</span>
                  </label>
                  <div className="relative">
                    <Receipt className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={ifuNumber}
                      onChange={e => setIfuNumber(e.target.value)}
                      placeholder="ex: 3202112849012"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-bold focus:ring-2 focus:ring-[#0B1F33]"
                    />
                  </div>
                </div>

                {/* PIN Code */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">
                    Code PIN Caisse (4 chiffres)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                    <input
                      type="text"
                      maxLength={4}
                      value={pinCode}
                      onChange={e => setPinCode(e.target.value)}
                      placeholder="1234"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-mono font-bold focus:ring-2 focus:ring-[#0B1F33]"
                    />
                  </div>
                </div>

              </div>

              {/* Template Choice */}
              <div className="pt-2">
                <label className="font-extrabold text-slate-800 text-xs block mb-2">
                  Configuration initiale de la carte & des données :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  
                  <div 
                    onClick={() => setStartWithTemplate(true)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                      startWithTemplate 
                        ? 'border-[#0B1F33] bg-slate-50 ring-2 ring-[#0B1F33]/20' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Utensils className="w-4 h-4 text-amber-600" />
                      <span className="font-black text-slate-900">Modèle Clé en main Bénin</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Inclut une carte démo avec spécialités béninoises (Atassi, Igname pilonnée, Grillades, SOBEBRA) et 10 tables QR Code préconfigurées.
                    </p>
                  </div>

                  <div 
                    onClick={() => setStartWithTemplate(false)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                      !startWithTemplate 
                        ? 'border-[#0B1F33] bg-slate-50 ring-2 ring-[#0B1F33]/20' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-slate-700" />
                      <span className="font-black text-slate-900">Carte Vierge (Propre)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Démarre avec un menu totalement vierge. Vous pourrez ajouter vos propres plats, boissons et catégories au fur et à mesure.
                    </p>
                  </div>

                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] font-black py-4 rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 active:scale-98"
                >
                  <Building2 className="w-5 h-5" />
                  <span>S'INSCRIRE ET LANCER L'ÉTABLISSEMENT</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: SWITCH BETWEEN REGISTERED RESTAURANTS */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Voici la liste des établissements enregistrés sur cet appareil. Cliquez sur un restaurant pour accéder immédiatement à sa caisse, son menu et ses commandes.
              </p>

              <div className="space-y-3">
                {registeredRestaurants.map(resto => {
                  const isActive = resto.id === activeRestaurantId;
                  
                  return (
                    <div 
                      key={resto.id}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isActive 
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <Store className="w-6 h-6" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 text-base">
                              {resto.name}
                            </h3>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border">
                              {resto.type}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                ACTIF
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-0.5">
                            Gérant: <strong>{resto.ownerName}</strong> • {resto.city} ({resto.neighborhood}) • Tel: {resto.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && (
                          <button
                            onClick={() => switchActiveRestaurant(resto.id)}
                            className="bg-[#0B1F33] hover:bg-slate-800 text-white font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                          >
                            <span>Se Connecter</span>
                            <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
                          </button>
                        )}

                        {registeredRestaurants.length > 1 && !isActive && (
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer l'établissement "${resto.name}" de la liste ?`)) {
                                deleteRegisteredRestaurant(resto.id);
                              }
                            }}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Supprimer cet établissement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t text-center">
                <button
                  onClick={() => setActiveTab('register')}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Inscrire un Autre Restaurant SaaS</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
