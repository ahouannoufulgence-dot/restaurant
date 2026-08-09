import React, { useState, useMemo } from 'react';
import { useResto } from '../context/RestoContext';
import { 
  Utensils, 
  ShoppingBag, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Sparkles, 
  ChevronRight, 
  X,
  Phone,
  MapPin,
  QrCode,
  Flame,
  Leaf,
  Info,
  Star,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { MenuItem, SupplementOption, OrderItem, Order } from '../types';

interface ClientTableOrderViewProps {
  tableToken?: string;
  onBackToApp?: () => void;
}

export const ClientTableOrderView: React.FC<ClientTableOrderViewProps> = ({ 
  tableToken: initialToken,
  onBackToApp 
}) => {
  const { 
    config, 
    categories, 
    menuItems, 
    getQrTableByToken, 
    createQrOrder, 
    formatFcfa,
    tables,
    orders
  } = useResto();

  // Selected table token state
  const [activeToken, setActiveToken] = useState<string>(initialToken || 'tbl_tok_t01_8f9a2b');
  
  const currentTable = useMemo(() => {
    return getQrTableByToken(activeToken);
  }, [activeToken, getQrTableByToken, tables]);

  // Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart
  interface CartEntry {
    menuItem: MenuItem;
    quantity: number;
    selectedSupplements: SupplementOption[];
    kitchenNote: string;
  }
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Customer optional details
  const [generalNote, setGeneralNote] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Modal for customizing item (detail page)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalSupplements, setModalSupplements] = useState<SupplementOption[]>([]);
  const [modalNote, setModalNote] = useState<string>('');

  // Image load error tracking for fallback
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  // Submitted orders feedback
  const [submittedOrders, setSubmittedOrders] = useState<Order[]>([]);
  const [isOrderSuccess, setIsOrderSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    const list = Array.isArray(menuItems) ? menuItems : [];
    return list.filter(item => {
      const matchesCat = selectedCategory === 'Toutes' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch && item.available;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart math
  const cartSubtotalFcfa = useMemo(() => {
    return cart.reduce((acc, entry) => {
      const suppTotal = entry.selectedSupplements.reduce((sAcc, s) => sAcc + s.priceFcfa, 0);
      return acc + (entry.menuItem.priceFcfa + suppTotal) * entry.quantity;
    }, 0);
  }, [cart]);

  const totalCartItemsCount = useMemo(() => {
    return cart.reduce((acc, entry) => acc + entry.quantity, 0);
  }, [cart]);

  // Handlers
  const handleOpenCustomizer = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setModalQuantity(1);
    setModalSupplements([]);
    setModalNote('');
  };

  const handleToggleSupplement = (supp: SupplementOption) => {
    setModalSupplements(prev => {
      const exists = prev.some(s => s.id === supp.id);
      if (exists) return prev.filter(s => s.id !== supp.id);
      return [...prev, supp];
    });
  };

  const handleAddToCart = () => {
    if (!selectedMenuItem) return;

    const newEntry: CartEntry = {
      menuItem: selectedMenuItem,
      quantity: modalQuantity,
      selectedSupplements: modalSupplements,
      kitchenNote: modalNote.trim()
    };

    setCart(prev => [...prev, newEntry]);
    setSelectedMenuItem(null);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCartQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((entry, i) => {
      if (i === index) {
        const nextQ = entry.quantity + delta;
        return nextQ > 0 ? { ...entry, quantity: nextQ } : entry;
      }
      return entry;
    }));
  };

  const handleSendOrder = () => {
    if (!currentTable) {
      setErrorMessage("Table introuvable. Veuillez vérifier le QR Code.");
      return;
    }
    if (cart.length === 0) {
      setErrorMessage("Votre panier est vide.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderItems: Omit<OrderItem, 'id'>[] = cart.map(entry => ({
        menuItemId: entry.menuItem.id,
        menuItemName: entry.menuItem.name,
        unitPriceFcfa: entry.menuItem.priceFcfa,
        quantity: entry.quantity,
        selectedSupplements: entry.selectedSupplements,
        kitchenNote: entry.kitchenNote,
        status: 'En attente'
      }));

      const newOrder = createQrOrder(
        currentTable.publicToken || currentTable.code,
        orderItems,
        generalNote,
        customerName,
        customerPhone
      );

      setSubmittedOrders(prev => [newOrder, ...prev]);
      setCart([]);
      setIsCartOpen(false);
      setIsOrderSuccess(true);
      setGeneralNote('');
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'envoi de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick preset notes
  const presetNotes = [
    "Sans piment",
    "Peu de sel",
    "Sauce à part",
    "Bien cuit",
    "Sans oignon",
    "Beaucoup de sauce"
  ];

  // Current table active live orders status
  const currentTableLiveOrders = useMemo(() => {
    if (!currentTable) return [];
    return orders.filter(o => o.tableCode === currentTable.code && o.status !== 'Annulée' && o.paymentStatus !== 'Payé');
  }, [orders, currentTable]);

  if (!currentTable) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Table ou QR Code Invalide</h1>
        <p className="text-sm text-slate-600 mb-6 max-w-sm">
          Le lien scanné ne correspond à aucune table active dans le système du restaurant.
        </p>

        {/* Demo Token Selector */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm w-full max-w-xs text-left mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Tester avec une table active :
          </p>
          <div className="space-y-1.5">
            {tables.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveToken(t.publicToken || t.code)}
                className="w-full text-left px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-sm font-medium flex items-center justify-between"
              >
                <span>Table {t.code} ({t.zone})</span>
                <ChevronRight className="w-4 h-4 text-amber-600" />
              </button>
            ))}
          </div>
        </div>

        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-medium shadow hover:bg-amber-700 text-sm"
          >
            Retour au Logiciel de Caisse
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-32 font-sans">
      
      {/* RESTAURANT HEADER CARD */}
      <header className="bg-gradient-to-br from-[#0B1F33] via-[#102a45] to-[#1c3d61] text-white sticky top-0 z-30 shadow-lg border-b border-amber-500/30">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 font-black shadow-inner shrink-0">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black leading-tight text-white tracking-tight">{config.name}</h1>
                <div className="flex items-center space-x-2 text-xs text-amber-200/90 mt-0.5">
                  <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wide">
                    Table {currentTable.code}
                  </span>
                  <span>• {currentTable.zone}</span>
                </div>
              </div>
            </div>

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="text-xs bg-white/10 hover:bg-white/20 text-amber-200 px-3 py-1.5 rounded-xl border border-white/10 font-bold transition shrink-0"
              >
                Caisse Admin
              </button>
            )}
          </div>

          {/* Restaurant Details Strip */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-xs text-slate-200 space-y-1.5 border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-amber-200 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{config.address}, {config.city}</span>
              </span>
              <span className="flex items-center gap-1 font-bold">
                <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{config.phone}</span>
              </span>
            </div>
            {config.welcomeMessage && (
              <p className="text-[11px] text-slate-300 italic border-t border-white/10 pt-1 leading-snug">
                "{config.welcomeMessage}"
              </p>
            )}
          </div>

        </div>
      </header>

      {/* Demo Selector Strip for easy testing in preview */}
      <div className="bg-amber-100/80 border-b border-amber-300 px-4 py-2 text-xs text-amber-950 flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center space-x-1 font-bold">
          <QrCode className="w-3.5 h-3.5 text-amber-800" />
          <span>Bascule Table :</span>
        </div>
        <select
          value={activeToken}
          onChange={e => setActiveToken(e.target.value)}
          className="bg-white border border-amber-400 rounded-lg px-2 py-1 text-xs font-extrabold text-amber-950 shadow-xs"
        >
          {tables.map(t => (
            <option key={t.id} value={t.publicToken || t.code}>
              Table {t.code} - {t.zone} ({t.qrCodeStatus || 'Actif'})
            </option>
          ))}
        </select>
      </div>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* Live Active Orders Notice for this Table */}
        {currentTableLiveOrders.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Suivi Commandes en cours sur Table {currentTable.code}</span>
              </span>
              <span className="text-xs bg-amber-200 text-amber-950 font-black px-2.5 py-0.5 rounded-full">
                {currentTableLiveOrders.length}
              </span>
            </div>

            <div className="space-y-2">
              {currentTableLiveOrders.map(o => (
                <div key={o.id} className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs shadow-xs">
                  <div>
                    <span className="font-black text-slate-900">{o.code}</span>
                    <span className="text-slate-500 ml-2">({o.items.length} articles)</span>
                    <p className="text-amber-800 font-extrabold">{formatFcfa(o.totalFcfa)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    o.statutConfirmation === 'En attente de confirmation' 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse' 
                      : o.status === 'En préparation' 
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : o.status === 'Prête'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-green-100 text-green-900 border border-green-300'
                  }`}>
                    {o.statutConfirmation === 'En attente de confirmation' 
                      ? '⏳ En attente validation' 
                      : o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher Riz, Poulet, Capitaine, Bissap..."
            className="w-full bg-white pl-10 pr-4 py-3 rounded-2xl border border-slate-200 shadow-sm text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1F33]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter Horizontal Scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('Toutes')}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition shadow-xs ${
              selectedCategory === 'Toutes'
                ? 'bg-[#0B1F33] text-[#F59E0B]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Toutes ({(Array.isArray(menuItems) ? menuItems : []).filter(i => i.available).length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition shadow-xs ${
                selectedCategory === cat.name
                  ? 'bg-[#0B1F33] text-[#F59E0B]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* PRODUCT CARDS GRID (1 Col on mobile, 2 Col on sm) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredItems.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 text-xs font-medium">Aucun plat disponible dans cette catégorie.</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const imageFailed = failedImageIds[item.id] || !item.image;

              return (
                <div 
                  key={item.id}
                  onClick={() => handleOpenCustomizer(item)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-400 transition cursor-pointer group active:scale-[0.99]"
                >
                  {/* Top Image Container */}
                  <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
                    {!imageFailed ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() => setFailedImageIds(prev => ({ ...prev, [item.id]: true }))}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center text-amber-800 p-4 text-center">
                        <Utensils className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">{item.category}</span>
                      </div>
                    )}

                    {/* Top Right Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      {item.isPopular && (
                        <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wide">
                          <Star className="w-2.5 h-2.5 fill-slate-950" /> Populaire
                        </span>
                      )}
                      {item.isNew && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wide">
                          <Sparkles className="w-2.5 h-2.5" /> Nouveau
                        </span>
                      )}
                      {item.isTodaySpecial && (
                        <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wide">
                          <Zap className="w-2.5 h-2.5" /> Spécial Jour
                        </span>
                      )}
                    </div>

                    {/* Top Left Badges (Spicy/Veggie) */}
                    <div className="absolute top-2 left-2 flex gap-1 items-center">
                      {item.spicyLevel && item.spicyLevel !== 'Aucun' && (
                        <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-white" /> {item.spicyLevel}
                        </span>
                      )}
                      {item.isVegetarian && (
                        <span className="bg-green-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                          <Leaf className="w-2.5 h-2.5" /> Végé
                        </span>
                      )}
                    </div>

                    {/* Price Tag Badge */}
                    <div className="absolute bottom-2 left-2 bg-[#0B1F33]/90 text-[#F59E0B] font-black text-xs px-2.5 py-1 rounded-xl shadow-md border border-amber-500/30">
                      {formatFcfa(item.priceFcfa)} <span className="text-[10px] text-slate-300 font-semibold">/ {item.unit}</span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 leading-snug group-hover:text-amber-700 transition">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {item.isIllustrativeImage && !imageFailed && (
                      <p className="text-[9px] text-slate-400 italic flex items-center gap-1">
                        <Info className="w-2.5 h-2.5 text-slate-400" /> Image illustrative
                      </p>
                    )}

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCustomizer(item);
                      }}
                      className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] py-2.5 rounded-xl text-xs font-black shadow-xs flex items-center justify-center space-x-1.5 active:scale-95 transition min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* FLOATING CART BUTTON */}
      {totalCartItemsCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 max-w-lg mx-auto px-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-[#0B1F33] to-[#16385a] text-white py-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-between font-black text-xs active:scale-[0.99] transition border-2 border-amber-500/50"
          >
            <div className="flex items-center space-x-2.5">
              <div className="bg-[#F59E0B] text-slate-950 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-md">
                {totalCartItemsCount}
              </div>
              <span className="text-white text-xs">Voir ma commande (Table {currentTable.code})</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-[#F59E0B]">{formatFcfa(cartSubtotalFcfa)}</span>
              <ChevronRight className="w-5 h-5 text-amber-400" />
            </div>
          </button>
        </div>
      )}

      {/* DISH DETAIL & CUSTOMIZATION MODAL (Requirement 30) */}
      {selectedMenuItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl animate-in slide-in-from-bottom relative space-y-4">
            
            <button 
              onClick={() => setSelectedMenuItem(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full p-2 z-10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Large Modal Image */}
            <div className="relative w-full aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
              {selectedMenuItem.image && !failedImageIds[selectedMenuItem.id] ? (
                <img
                  src={selectedMenuItem.image}
                  alt={selectedMenuItem.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex flex-col items-center justify-center text-amber-900 p-4 text-center">
                  <Utensils className="w-12 h-12 opacity-50 mb-2" />
                  <span className="text-xs font-black uppercase tracking-wider opacity-70">{selectedMenuItem.category}</span>
                </div>
              )}

              <div className="absolute top-2 left-2 flex gap-1">
                {selectedMenuItem.isPopular && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                    ★ Populaire
                  </span>
                )}
                {selectedMenuItem.spicyLevel && selectedMenuItem.spicyLevel !== 'Aucun' && (
                  <span className="bg-red-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                    🔥 {selectedMenuItem.spicyLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Price */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {selectedMenuItem.category}
                </span>
                <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ En Stock
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 mt-1.5">{selectedMenuItem.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedMenuItem.description}</p>
              
              <div className="mt-2 text-sm font-black text-[#0B1F33]">
                {formatFcfa(selectedMenuItem.priceFcfa)} <span className="text-xs font-semibold text-slate-500">/ {selectedMenuItem.unit}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                Quantité :
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 text-slate-800 border flex items-center justify-center font-bold text-lg shadow-xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-black text-slate-900 w-6 text-center">{modalQuantity}</span>
                <button
                  onClick={() => setModalQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-xl bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] flex items-center justify-center font-bold text-lg shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Supplements List if available */}
            {selectedMenuItem.supplements && selectedMenuItem.supplements.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                  Suppléments éventuels
                </label>
                <div className="space-y-2">
                  {selectedMenuItem.supplements.map(supp => {
                    const isSelected = modalSupplements.some(s => s.id === supp.id);
                    return (
                      <button
                        key={supp.id}
                        type="button"
                        onClick={() => handleToggleSupplement(supp)}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition ${
                          isSelected 
                            ? 'bg-amber-50 border-amber-500 text-amber-950' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span>{supp.name}</span>
                        </div>
                        <span className="font-extrabold text-amber-900">
                          {supp.priceFcfa > 0 ? `+${formatFcfa(supp.priceFcfa)}` : 'Inclus'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kitchen Note Preset Pills */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                Note ou instructions spéciales
              </label>
              <div className="flex flex-wrap gap-1.5">
                {presetNotes.map(pNote => (
                  <button
                    key={pNote}
                    type="button"
                    onClick={() => setModalNote(prev => prev ? `${prev}, ${pNote}` : pNote)}
                    className="text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 px-2.5 py-1 rounded-full font-bold transition border border-slate-200"
                  >
                    + {pNote}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={modalNote}
                onChange={e => setModalNote(e.target.value)}
                placeholder="Ex: Sans piment, sauce à part..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#0B1F33] focus:outline-none"
              />
            </div>

            {/* Total item calc */}
            <div className="bg-amber-50 p-3.5 rounded-2xl flex items-center justify-between border border-amber-300">
              <span className="text-xs text-amber-950 font-bold">Total calculé :</span>
              <span className="text-base font-black text-amber-950">
                {formatFcfa(
                  (selectedMenuItem.priceFcfa + modalSupplements.reduce((s, a) => s + a.priceFcfa, 0)) * modalQuantity
                )}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] py-3.5 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center space-x-2 active:scale-98 transition min-h-[48px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ajouter au panier</span>
            </button>
          </div>
        </div>
      )}

      {/* CART DRAWER / BOTTOM SHEET */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-y-auto p-5 shadow-2xl animate-in slide-in-from-bottom space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h2 className="text-sm font-black text-slate-900">
                  Votre Commande Table {currentTable.code}
                </h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs">Votre panier est vide.</p>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="divide-y divide-slate-100 border-b pb-3 space-y-2">
                  {cart.map((entry, idx) => {
                    const entrySuppTotal = entry.selectedSupplements.reduce((s, a) => s + a.priceFcfa, 0);
                    const entryTotal = (entry.menuItem.priceFcfa + entrySuppTotal) * entry.quantity;

                    return (
                      <div key={idx} className="pt-2 flex items-start justify-between space-x-2">
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-slate-900">{entry.menuItem.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{formatFcfa(entry.menuItem.priceFcfa)} / {entry.menuItem.unit}</p>

                          {entry.selectedSupplements.length > 0 && (
                            <div className="text-[10px] text-amber-800 font-bold mt-0.5">
                              + {entry.selectedSupplements.map(s => s.name).join(', ')}
                            </div>
                          )}

                          {entry.kitchenNote && (
                            <div className="text-[10px] bg-slate-100 text-slate-700 italic px-1.5 py-0.5 rounded mt-1 inline-block">
                              Note: "{entry.kitchenNote}"
                            </div>
                          )}

                          <p className="text-xs font-black text-amber-900 mt-1">
                            {formatFcfa(entryTotal)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleUpdateCartQuantity(idx, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">{entry.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQuantity(idx, 1)}
                            className="w-7 h-7 rounded-lg bg-[#0B1F33] text-[#F59E0B] flex items-center justify-center font-bold text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="text-red-500 hover:text-red-700 p-1 text-xs ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional Customer Name/Phone */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wide block">
                    Informations facultatives (Identité)
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Votre nom</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Ex: M. Biodun"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="Ex: 97 00 00 00"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Note générale pour la table</label>
                    <input
                      type="text"
                      value={generalNote}
                      onChange={e => setGeneralNote(e.target.value)}
                      placeholder="Ex: Nous sommes pressés..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Total Summary */}
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-300 flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950">Total de la commande :</span>
                  <span className="text-base font-black text-amber-950">{formatFcfa(cartSubtotalFcfa)}</span>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 text-red-800 text-xs p-2.5 rounded-xl border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <button
                  onClick={handleSendOrder}
                  disabled={isSubmitting}
                  className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] py-3.5 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center space-x-2 active:scale-98 transition disabled:opacity-50 min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Transmission en cours...' : `Envoyer la commande (Table ${currentTable.code})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORDER SUCCESS FEEDBACK POPUP */}
      {isOrderSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-base font-black text-slate-900">Commande Transmise !</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Votre commande pour la <span className="font-black text-amber-900">Table {currentTable.code}</span> a été reçue en caisse. Le serveur va la valider pour envoi immédiat en cuisine.
            </p>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-300 text-left text-xs space-y-1">
              <p className="font-black text-amber-950 border-b border-amber-200 pb-1">Récapitulatif envoyé :</p>
              {submittedOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between text-[11px] py-1 border-b border-amber-100 last:border-0 font-bold">
                  <span className="text-slate-800">{o.code}</span>
                  <span className="text-amber-900">{formatFcfa(o.totalFcfa)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsOrderSuccess(false)}
              className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] py-3 rounded-2xl font-black text-xs shadow-md transition"
            >
              Retour au Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

