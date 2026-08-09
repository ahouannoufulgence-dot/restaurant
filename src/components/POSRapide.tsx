import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { 
  MenuItem, 
  OrderType, 
  TableZone, 
  SupplementOption, 
  PaymentMethod 
} from '../types';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Search, 
  Smartphone, 
  Coins, 
  FileText, 
  User, 
  MapPin, 
  Share2,
  X
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const POSRapide: React.FC = () => {
  const { 
    menuItems, 
    categories, 
    tables, 
    createOrder, 
    addPaymentToOrder, 
    formatFcfa,
    config
  } = useResto();

  // Active Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Order state
  const [orderType, setOrderType] = useState<OrderType>('Sur place');
  const [selectedTableCode, setSelectedTableCode] = useState<string>('T01');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  
  // Delivery details
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState<string>('Cadjehoun');
  const [deliveryLandmark, setDeliveryLandmark] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<number>(500);

  // Cart items
  interface CartItem {
    id: string;
    menuItem: MenuItem;
    quantity: number;
    selectedSupplements: SupplementOption[];
    kitchenNote: string;
  }
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [momoPhone, setMomoPhone] = useState<string>('');
  const [momoTxnRef, setMomoTxnRef] = useState<string>('');

  // Receipt modal
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Filtered menu items
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const filteredProducts = safeMenuItems.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Cart helper functions
  const addToCart = (product: MenuItem) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(ci => ci.menuItem.id === product.id && ci.selectedSupplements.length === 0 && !ci.kitchenNote);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${Math.random()}`,
            menuItem: product,
            quantity: 1,
            selectedSupplements: [],
            kitchenNote: ''
          }
        ];
      }
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(ci => {
      if (ci.id === cartItemId) {
        const nextQty = ci.quantity + delta;
        return nextQty > 0 ? { ...ci, quantity: nextQty } : ci;
      }
      return ci;
    }).filter(ci => ci.quantity > 0));
  };

  const removeCartItem = (cartItemId: string) => {
    setCart(prev => prev.filter(ci => ci.id !== cartItemId));
  };

  const toggleSupplement = (cartItemId: string, supplement: SupplementOption) => {
    setCart(prev => prev.map(ci => {
      if (ci.id === cartItemId) {
        const exists = ci.selectedSupplements.some(s => s.id === supplement.id);
        const nextSupplements = exists 
          ? ci.selectedSupplements.filter(s => s.id !== supplement.id)
          : [...ci.selectedSupplements, supplement];
        return { ...ci, selectedSupplements: nextSupplements };
      }
      return ci;
    }));
  };

  const updateKitchenNote = (cartItemId: string, note: string) => {
    setCart(prev => prev.map(ci => ci.id === cartItemId ? { ...ci, kitchenNote: note } : ci));
  };

  // Subtotal calculations
  const cartSubtotal = cart.reduce((sum, ci) => {
    const supps = ci.selectedSupplements.reduce((sSum, s) => sSum + s.priceFcfa, 0);
    return sum + (ci.menuItem.priceFcfa + supps) * ci.quantity;
  }, 0);

  const totalFcfa = cartSubtotal + (orderType === 'Livraison' ? deliveryFee : 0);

  // Submit order to kitchen or checkout
  const handleSendToKitchen = () => {
    if (cart.length === 0) return;

    const orderPayload = {
      type: orderType,
      tableCode: orderType === 'Sur place' ? selectedTableCode : undefined,
      tableZone: orderType === 'Sur place' ? (tables.find(t => t.code === selectedTableCode)?.zone || 'Salle') as TableZone : undefined,
      customer: (customerName || customerPhone) ? { name: customerName || 'Client', phone: customerPhone } : undefined,
      delivery: orderType === 'Livraison' ? {
        customerName: customerName || 'Client Livraison',
        phone: customerPhone || '90000000',
        city: config.city,
        neighborhood: deliveryNeighborhood,
        landmark: deliveryLandmark || 'Repère à préciser',
        deliveryFeeFcfa: deliveryFee,
        status: 'En attente' as const
      } : undefined,
      items: cart.map(ci => ({
        id: `item-${Date.now()}-${Math.random()}`,
        menuItemId: ci.menuItem.id,
        menuItemName: ci.menuItem.name,
        unitPriceFcfa: ci.menuItem.priceFcfa,
        quantity: ci.quantity,
        selectedSupplements: ci.selectedSupplements,
        kitchenNote: ci.kitchenNote,
        status: 'En attente' as const
      })),
      deliveryFeeFcfa: orderType === 'Livraison' ? deliveryFee : 0,
      paymentStatus: 'En attente' as const
    };

    const newOrder = createOrder(orderPayload);
    setCompletedOrder(newOrder);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryLandmark('');
  };

  const handleInstantPay = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
  };

  const confirmCheckout = () => {
    if (cart.length === 0) return;

    const orderPayload = {
      type: orderType,
      tableCode: orderType === 'Sur place' ? selectedTableCode : undefined,
      tableZone: orderType === 'Sur place' ? (tables.find(t => t.code === selectedTableCode)?.zone || 'Salle') as TableZone : undefined,
      customer: (customerName || customerPhone) ? { name: customerName || 'Client', phone: customerPhone } : undefined,
      delivery: orderType === 'Livraison' ? {
        customerName: customerName || 'Client Livraison',
        phone: customerPhone || '90000000',
        city: config.city,
        neighborhood: deliveryNeighborhood,
        landmark: deliveryLandmark || 'Repère à préciser',
        deliveryFeeFcfa: deliveryFee,
        status: 'En attente' as const
      } : undefined,
      items: cart.map(ci => ({
        id: `item-${Date.now()}-${Math.random()}`,
        menuItemId: ci.menuItem.id,
        menuItemName: ci.menuItem.name,
        unitPriceFcfa: ci.menuItem.priceFcfa,
        quantity: ci.quantity,
        selectedSupplements: ci.selectedSupplements,
        kitchenNote: ci.kitchenNote,
        status: 'En préparation' as const
      })),
      deliveryFeeFcfa: orderType === 'Livraison' ? deliveryFee : 0,
      paymentStatus: 'Payé' as const
    };

    const newOrder = createOrder(orderPayload);

    // Add payment
    addPaymentToOrder(newOrder.id, {
      method: paymentMethod,
      amountFcfa: totalFcfa,
      operator: paymentMethod === 'MTN Mobile Money' ? 'MTN' : paymentMethod === 'Moov Money' ? 'Moov' : undefined,
      phoneNumber: momoPhone || customerPhone,
      transactionReference: momoTxnRef || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      cashierName: 'Caissier Express',
      date: new Date().toISOString(),
      status: 'Payé'
    });

    setCompletedOrder({ ...newOrder, paymentStatus: 'Payé' });
    setShowCheckoutModal(false);
    setCart([]);
    setMomoPhone('');
    setMomoTxnRef('');
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* LEFT COLUMN: MENU CATALOG & DISH SELECTION (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Search & Categories Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un plat (Riz, Atassi, Poulet braisé, Bissap...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedCategory === 'all' 
                  ? 'bg-[#0B1F33] text-[#F59E0B]' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous les Plats ({safeMenuItems.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.name 
                    ? 'bg-[#0B1F33] text-[#F59E0B]' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => product.available && addToCart(product)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                product.available 
                  ? 'bg-white border-slate-200 hover:border-[#F59E0B] hover:shadow-md active:scale-98' 
                  : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex gap-2 items-start">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug truncate">
                      {product.name}
                    </h3>
                    <span className="font-black text-[#0B1F33] text-xs shrink-0 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200">
                      {formatFcfa(product.priceFcfa)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px]">
                <span className="text-slate-400 font-medium">Unité: {product.unit}</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${
                  product.available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.available ? '+ Ajouter' : 'Épuisé'}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT COLUMN: ACTIVE ORDER CART & CONFIGURATION (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-lg space-y-4 flex flex-col justify-between min-h-[550px]">
        
        {/* Order Header & Type Selection */}
        <div className="space-y-3">
          
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#F59E0B]" />
              <span>Saisie de Commande</span>
            </h2>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} article(s)
            </span>
          </div>

          {/* Type Selector Chips */}
          <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
            {(['Sur place', 'À emporter', 'Livraison'] as OrderType[]).map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  orderType === type 
                    ? 'bg-[#0B1F33] text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Conditional Table or Delivery Fields */}
          {orderType === 'Sur place' && (
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border">
              <span className="text-xs font-bold text-slate-700">Table:</span>
              <select
                value={selectedTableCode}
                onChange={e => setSelectedTableCode(e.target.value)}
                className="bg-white border rounded-lg px-3 py-1 text-xs font-bold text-slate-900 focus:outline-none"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.code}>
                    {t.code} ({t.zone}) - {t.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {orderType === 'Livraison' && (
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Quartier / Zone</label>
                  <select
                    value={deliveryNeighborhood}
                    onChange={e => {
                      setDeliveryNeighborhood(e.target.value);
                      const zoneObj = config.deliveryZones.find(z => z.zone.includes(e.target.value));
                      if (zoneObj) setDeliveryFee(zoneObj.defaultFeeFcfa);
                    }}
                    className="w-full bg-white border rounded-lg px-2 py-1 text-xs font-bold"
                  >
                    {config.deliveryZones.map(z => (
                      <option key={z.zone} value={z.zone}>{z.zone} ({formatFcfa(z.defaultFeeFcfa)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Frais Livraison (FCFA)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={e => setDeliveryFee(Number(e.target.value))}
                    className="w-full bg-white border rounded-lg px-2 py-1 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Indication / Repère local</label>
                <input
                  type="text"
                  placeholder="Ex: Akpakpa, derrière la pharmacie, portail vert"
                  value={deliveryLandmark}
                  onChange={e => setDeliveryLandmark(e.target.value)}
                  className="w-full bg-white border rounded-lg px-2 py-1 text-xs"
                />
              </div>
            </div>
          )}

          {/* Customer Info (Optional) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="Nom du Client (optionnel)"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="bg-slate-50 border rounded-xl px-3 py-1.5 font-medium"
            />
            <input
              type="text"
              placeholder="Téléphone (ex: 97000000)"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="bg-slate-50 border rounded-xl px-3 py-1.5 font-medium"
            />
          </div>

        </div>

        {/* CART ITEMS LIST */}
        <div className="flex-1 max-h-64 overflow-y-auto space-y-2 pr-1 my-2">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Séléctionnez des plats dans le menu à gauche pour démarrer la commande.
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{item.menuItem.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">
                      {formatFcfa(item.menuItem.priceFcfa * item.quantity)}
                    </span>
                    <button 
                      onClick={() => removeCartItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quantity Controls & Supplements Toggle */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 bg-white border rounded-lg p-0.5">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-700"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-bold px-2 text-xs">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-700"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Kitchen Note Trigger */}
                  <input
                    type="text"
                    placeholder="Remarque (ex: Sans piment)"
                    value={item.kitchenNote}
                    onChange={e => updateKitchenNote(item.id, e.target.value)}
                    className="text-[11px] bg-white border rounded px-2 py-0.5 w-36"
                  />
                </div>

                {/* Available Supplements Chips */}
                {item.menuItem.supplements && item.menuItem.supplements.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.menuItem.supplements.map(sup => {
                      const isSelected = item.selectedSupplements.some(s => s.id === sup.id);
                      return (
                        <button
                          key={sup.id}
                          onClick={() => toggleSupplement(item.id, sup)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                            isSelected 
                              ? 'bg-amber-500 text-slate-900 font-bold border-amber-600' 
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          + {sup.name} ({formatFcfa(sup.priceFcfa)})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* CART TOTALS & ACTIONS */}
        <div className="border-t pt-3 space-y-3">
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total plats:</span>
              <span className="font-semibold">{formatFcfa(cartSubtotal)}</span>
            </div>
            {orderType === 'Livraison' && (
              <div className="flex justify-between text-amber-700">
                <span>Frais de livraison:</span>
                <span className="font-semibold">{formatFcfa(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t">
              <span>TOTAL FCFA:</span>
              <span className="text-[#0B1F33]">{formatFcfa(totalFcfa)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              disabled={cart.length === 0}
              onClick={handleSendToKitchen}
              className="w-full bg-[#0B1F33] hover:bg-slate-800 disabled:opacity-40 text-white font-bold py-3 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-md"
            >
              <Send className="h-4 w-4 text-[#F59E0B]" />
              <span>Envoyer Cuisine</span>
            </button>

            <button
              disabled={cart.length === 0}
              onClick={handleInstantPay}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black py-3 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-md"
            >
              <Coins className="h-4 w-4" />
              <span>Encaisser Direct</span>
            </button>
          </div>

        </div>

      </div>

      {/* CHECKOUT MODAL (FCFA + Mobile Money) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            
            <button 
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg border-b pb-2">
              Encaisser la commande ({formatFcfa(totalFcfa)})
            </h3>

            {/* Mode selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Moyen de paiement</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  onClick={() => setPaymentMethod('Espèces')}
                  className={`py-2 px-2 rounded-xl border transition ${
                    paymentMethod === 'Espèces' ? 'bg-[#0B1F33] text-white' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Espèces
                </button>
                <button
                  onClick={() => setPaymentMethod('MTN Mobile Money')}
                  className={`py-2 px-2 rounded-xl border transition ${
                    paymentMethod === 'MTN Mobile Money' ? 'bg-amber-500 text-slate-900 font-extrabold' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  MTN MoMo
                </button>
                <button
                  onClick={() => setPaymentMethod('Moov Money')}
                  className={`py-2 px-2 rounded-xl border transition ${
                    paymentMethod === 'Moov Money' ? 'bg-blue-600 text-white font-extrabold' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  Moov Money
                </button>
              </div>
            </div>

            {/* Mobile Money inputs */}
            {(paymentMethod === 'MTN Mobile Money' || paymentMethod === 'Moov Money') && (
              <div className="bg-slate-50 p-3 rounded-xl border space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Numéro client {paymentMethod}</label>
                  <input
                    type="text"
                    placeholder="ex: 97 12 34 56"
                    value={momoPhone}
                    onChange={e => setMomoPhone(e.target.value)}
                    className="w-full bg-white border rounded-lg px-3 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Référence Transaction (TXN)</label>
                  <input
                    type="text"
                    placeholder="ex: TXN-98410"
                    value={momoTxnRef}
                    onChange={e => setMomoTxnRef(e.target.value)}
                    className="w-full bg-white border rounded-lg px-3 py-1.5 font-bold"
                  />
                </div>
              </div>
            )}

            <button
              onClick={confirmCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm transition shadow-lg"
            >
              Confirmer l'encaissement de {formatFcfa(totalFcfa)}
            </button>

          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}

    </div>
  );
};
