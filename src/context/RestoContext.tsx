import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { 
  UserRole, 
  EstablishmentConfig, 
  MenuItem, 
  Category, 
  RestaurantTable, 
  Order, 
  OrderStatus,
  CashRegisterSession, 
  StockItem, 
  Supplier, 
  DebtPayment,
  Expense, 
  ActivityLog,
  PaymentMethod,
  OrderItem,
  PaymentInfo,
  TableStatus,
  DeliveryDetails,
  RegisteredRestaurant
} from '../types';
import { 
  initialEstablishmentConfig, 
  initialCategories, 
  initialMenuItems, 
  initialTables, 
  initialOrders, 
  initialCashRegisterSession, 
  initialStockItems, 
  initialSuppliers, 
  initialExpenses, 
  initialLogs 
} from '../data/initialData';

interface RestoContextType {
  // Current session & role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  config: EstablishmentConfig;
  updateConfig: (newConfig: Partial<EstablishmentConfig>) => void;

  // Categories & Menu Items
  categories: Category[];
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  toggleMenuItemAvailability: (id: string) => void;
  deleteMenuItem: (id: string) => void;
  duplicateMenuItem: (id: string) => void;
  reorderMenuItems: (reorderedItemsOrId: MenuItem[] | string, targetId?: string) => void;
  addCategory: (name: string) => void;

  // Tables
  tables: RestaurantTable[];
  updateTableStatus: (tableId: string, status: TableStatus, currentOrderId?: string) => void;
  addTable: (code: string, seats: number, zone: RestaurantTable['zone']) => void;

  // Orders & POS Rapide
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  addPaymentToOrder: (orderId: string, payment: Omit<PaymentInfo, 'id' | 'orderId'>) => void;
  cancelOrder: (orderId: string) => void;

  // Cash Register
  cashSession: CashRegisterSession;
  openCashRegister: (initialAmountFcfa: number, notes?: string) => void;
  closeCashRegister: (actualCashFcfa: number, notes?: string) => void;

  // Stock
  stockItems: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockQuantity: (id: string, delta: number) => void;

  // Suppliers & Debts
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalDebtFcfa'>) => void;
  recordSupplierDebtPayment: (payment: Omit<DebtPayment, 'id'>) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  // Deliveries
  updateDeliveryStatus: (orderId: string, status: DeliveryDetails['status'], driverName?: string) => void;

  // QR Code & Public Table Ordering
  getQrTableByToken: (token: string) => RestaurantTable | undefined;
  createQrOrder: (tableToken: string, items: Omit<OrderItem, 'id'>[], generalNote?: string, customerName?: string, customerPhone?: string) => Order;
  confirmQrOrder: (orderId: string) => void;
  refuseQrOrder: (orderId: string) => void;
  generateOrRegenerateQrCode: (tableId: string) => void;
  toggleQrCodeStatus: (tableId: string) => void;
  getOrdersForTable: (tableCodeOrId: string) => Order[];
  getTableTotalFcfa: (tableCodeOrId: string) => number;

  // Logs
  activityLogs: ActivityLog[];
  addLog: (action: string, details: string) => void;

  // Reset Data & SaaS Setup
  resetCounters: () => void;
  resetAllDataToDefault: () => void;

  // Multi-Restaurant SaaS Registration
  registeredRestaurants: RegisteredRestaurant[];
  activeRestaurantId: string;
  registerRestaurant: (restoData: Omit<RegisteredRestaurant, 'id' | 'createdAt'>, startWithTemplate?: boolean) => RegisteredRestaurant;
  switchActiveRestaurant: (restaurantId: string) => void;
  deleteRegisteredRestaurant: (restaurantId: string) => void;
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;

  // Utilities
  formatFcfa: (amount: number) => string;
  generateWhatsAppLink: (order: Order) => string;
}

const RestoContext = createContext<RestoContextType | undefined>(undefined);

const defaultInitialRegisteredRestaurants: RegisteredRestaurant[] = [
  {
    id: 'rest_pirogue',
    name: "Maquis & Grill La Pirogue",
    type: "Maquis",
    ownerName: "Fulgence A.",
    phone: "+229 97 00 11 22",
    whatsappPhone: "+229 97 00 11 22",
    ifuNumber: "3202112849012",
    city: "Cotonou",
    neighborhood: "Cadjehoun",
    address: "Carrefour Cadjehoun, face Pharmacie",
    createdAt: "2026-01-01T00:00:00.000Z",
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80"
  }
];

export const RestoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Active Restaurant ID and Registered Restaurants List
  const [registeredRestaurants, setRegisteredRestaurants] = useState<RegisteredRestaurant[]>(() => {
    try {
      const stored = localStorage.getItem('restoflow_registered_restaurants');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultInitialRegisteredRestaurants;
  });

  const [activeRestaurantId, setActiveRestaurantId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('restoflow_active_restaurant_id');
      if (stored) return stored;
    } catch (e) {}
    return 'rest_pirogue';
  });

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // LocalStorage Helpers (Scoped per restaurant ID)
  const getStored = <T,>(key: string, fallback: T, targetRestoId?: string): T => {
    try {
      const currentId = targetRestoId || activeRestaurantId || 'rest_pirogue';
      const scopedKey = `restoflow_benin_${currentId}_${key}`;
      const legacyKey = `restoflow_benin_${key}`;
      
      const storedScoped = localStorage.getItem(scopedKey);
      if (storedScoped) return JSON.parse(storedScoped);
      
      const storedLegacy = localStorage.getItem(legacyKey);
      if (storedLegacy && currentId === 'rest_pirogue') return JSON.parse(storedLegacy);

      return fallback;
    } catch {
      return fallback;
    }
  };

  const setStored = <T,>(key: string, value: T, targetRestoId?: string) => {
    try {
      const currentId = targetRestoId || activeRestaurantId || 'rest_pirogue';
      localStorage.setItem(`restoflow_benin_${currentId}_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  };

  // State initialization for active restaurant
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => getStored('role', 'Administrateur'));
  const [config, setConfig] = useState<EstablishmentConfig>(() => getStored('config', initialEstablishmentConfig));
  const [categories, setCategories] = useState<Category[]>(() => getStored('categories', initialCategories));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStored('menuItems', initialMenuItems));
  const [tables, setTables] = useState<RestaurantTable[]>(() => getStored('tables', initialTables));
  const [orders, setOrders] = useState<Order[]>(() => getStored('orders', initialOrders));
  const [cashSession, setCashSession] = useState<CashRegisterSession>(() => getStored('cashSession', initialCashRegisterSession));
  const [stockItems, setStockItems] = useState<StockItem[]>(() => getStored('stockItems', initialStockItems));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored('suppliers', initialSuppliers));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStored('expenses', initialExpenses));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => getStored('activityLogs', initialLogs));

  // Sync state changes to scoped localStorage
  useEffect(() => setStored('role', currentRole), [currentRole, activeRestaurantId]);
  useEffect(() => setStored('config', config), [config, activeRestaurantId]);
  useEffect(() => setStored('categories', categories), [categories, activeRestaurantId]);
  useEffect(() => setStored('menuItems', menuItems), [menuItems, activeRestaurantId]);
  useEffect(() => setStored('tables', tables), [tables, activeRestaurantId]);
  useEffect(() => setStored('orders', orders), [orders, activeRestaurantId]);
  useEffect(() => setStored('cashSession', cashSession), [cashSession, activeRestaurantId]);
  useEffect(() => setStored('stockItems', stockItems), [stockItems, activeRestaurantId]);
  useEffect(() => setStored('suppliers', suppliers), [suppliers, activeRestaurantId]);
  useEffect(() => setStored('expenses', expenses), [expenses, activeRestaurantId]);
  useEffect(() => setStored('activityLogs', activityLogs), [activityLogs, activeRestaurantId]);

  // BroadcastChannel & Storage Event Sync for multi-tab and live client updates
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('restoflow_sync_channel');
        
        channel.onmessage = (event) => {
          const { type, data, restoId } = event.data || {};
          if (type === 'SYNC_RESTOS' && Array.isArray(data)) {
            setRegisteredRestaurants(data);
          } else if (type === 'SYNC_MENU' && Array.isArray(data) && (!restoId || restoId === activeRestaurantId)) {
            setMenuItems(data);
          } else if (type === 'SYNC_ORDERS' && Array.isArray(data) && (!restoId || restoId === activeRestaurantId)) {
            setOrders(data);
          }
        };
      }
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'restoflow_registered_restaurants' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setRegisteredRestaurants(parsed);
        } catch (err) {}
      } else if (e.key === `restoflow_benin_${activeRestaurantId}_menuItems` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setMenuItems(parsed);
        } catch (err) {}
      } else if (e.key === `restoflow_benin_${activeRestaurantId}_orders` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setOrders(parsed);
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeRestaurantId]);

  // Sync registered list and active ID
  useEffect(() => {
    try {
      localStorage.setItem('restoflow_registered_restaurants', JSON.stringify(registeredRestaurants));
      
      // Broadcast to other tabs/windows
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('restoflow_sync_channel');
          bc.postMessage({ type: 'SYNC_RESTOS', data: registeredRestaurants });
          bc.close();
        } catch (e) {}
      }

      // Async background push to Supabase if client exists
      const supabase = getSupabase();
      if (supabase && registeredRestaurants.length > 0) {
        const rows = registeredRestaurants.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type,
          owner_name: r.ownerName,
          phone: r.phone,
          whatsapp_phone: r.whatsappPhone,
          city: r.city,
          neighborhood: r.neighborhood,
          address: r.address,
          ifu_number: r.ifuNumber,
          pin_code: r.pinCode,
          logo_url: r.logoUrl,
          created_at: r.createdAt
        }));
        supabase.from('registered_restaurants').upsert(rows).then(({ error }) => {
          if (error) console.warn('Supabase sync warning (restaurants):', error.message);
        });
      }
    } catch (e) {}
  }, [registeredRestaurants]);

  // Async background push menuItems to Supabase & broadcast
  useEffect(() => {
    try {
      // Broadcast to other tabs/windows
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('restoflow_sync_channel');
          bc.postMessage({ type: 'SYNC_MENU', data: menuItems, restoId: activeRestaurantId });
          bc.close();
        } catch (e) {}
      }

      const supabase = getSupabase();
      if (supabase && menuItems.length > 0 && activeRestaurantId) {
        const rows = menuItems.map(item => ({
          id: item.id,
          restaurant_id: activeRestaurantId,
          name: item.name,
          category_id: item.category,
          price_fcfa: item.priceFcfa,
          cost_price_fcfa: item.costPriceFcfa || 0,
          description: item.description || '',
          unit: item.unit || 'portion',
          is_available: item.available ?? true,
          image_url: item.image || '',
          is_popular: item.isPopular ?? false,
          is_new: item.isNew ?? false
        }));
        supabase.from('menu_items').upsert(rows).then(({ error }) => {
          if (error) console.warn('Supabase sync warning (menu_items):', error.message);
        });
      }
    } catch (e) {}
  }, [menuItems, activeRestaurantId]);

  // Pull from Supabase on activeRestaurantId change if configured
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !activeRestaurantId) return;

    let isMounted = true;
    
    const fetchRemoteData = async () => {
      try {
        // Fetch registered restaurants
        const { data: remoteRestos } = await supabase.from('registered_restaurants').select('*');
        if (remoteRestos && remoteRestos.length > 0 && isMounted) {
          const formatted = remoteRestos.map((r: any) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            ownerName: r.owner_name,
            phone: r.phone,
            whatsappPhone: r.whatsapp_phone,
            city: r.city,
            neighborhood: r.neighborhood,
            address: r.address,
            ifuNumber: r.ifu_number,
            pinCode: r.pin_code,
            logoUrl: r.logo_url,
            createdAt: r.created_at
          }));
          setRegisteredRestaurants(prev => {
            const merged = [...formatted];
            prev.forEach(localItem => {
              if (!merged.find(m => m.id === localItem.id)) {
                merged.push(localItem);
              }
            });
            return merged;
          });
        }

        // Fetch menu items for active restaurant
        const { data: remoteMenu } = await supabase.from('menu_items').select('*').eq('restaurant_id', activeRestaurantId);
        if (remoteMenu && remoteMenu.length > 0 && isMounted) {
          const formattedMenu: MenuItem[] = remoteMenu.map((m: any) => ({
            id: m.id,
            name: m.name,
            category: m.category_id,
            priceFcfa: Number(m.price_fcfa),
            costPriceFcfa: Number(m.cost_price_fcfa || 0),
            description: m.description || '',
            unit: m.unit || 'portion',
            available: m.is_available ?? true,
            image: m.image_url || '',
            isPopular: m.is_popular ?? false,
            isNew: m.is_new ?? false
          }));
          setMenuItems(formattedMenu);
        }
      } catch (err) {
        console.warn('Background Supabase pull skipped:', err);
      }
    };

    fetchRemoteData();

    return () => { isMounted = false; };
  }, [activeRestaurantId]);

  useEffect(() => {
    try {
      localStorage.setItem('restoflow_active_restaurant_id', activeRestaurantId);
    } catch (e) {}
  }, [activeRestaurantId]);

  // MULTI-TENANT SaaS REGISTRATION & SWITCHING
  const registerRestaurant = (
    restoData: Omit<RegisteredRestaurant, 'id' | 'createdAt'>,
    startWithTemplate: boolean = true
  ): RegisteredRestaurant => {
    const newId = `rest_${Date.now()}`;
    const newRegistered: RegisteredRestaurant = {
      ...restoData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const updatedList = [newRegistered, ...registeredRestaurants];
    setRegisteredRestaurants(updatedList);

    const newConfig: EstablishmentConfig = {
      name: restoData.name,
      type: restoData.type,
      phone: restoData.phone,
      whatsappPhone: restoData.whatsappPhone || restoData.phone,
      ifuNumber: restoData.ifuNumber || '',
      logoUrl: restoData.logoUrl || '',
      address: restoData.address || `Avenue Principale, Quartier ${restoData.neighborhood}`,
      city: restoData.city,
      neighborhood: restoData.neighborhood,
      currency: "FCFA",
      taxRatePercent: 0,
      welcomeMessage: `Bienvenue à ${restoData.name} (${restoData.type})`,
      ticketFooterMessage: "Merci pour votre confiance ! À très bientôt.",
      deliveryZones: [
        { zone: `${restoData.neighborhood} / Centre`, defaultFeeFcfa: 500 },
        { zone: `Périphérie ${restoData.city}`, defaultFeeFcfa: 1000 }
      ]
    };

    const newCategories = startWithTemplate ? initialCategories : [
      { id: 'cat-1', name: 'Plats Principaux' },
      { id: 'cat-2', name: 'Boissons & Rafraîchissements' }
    ];

    const newMenuItems = startWithTemplate ? initialMenuItems : [];
    const newTables = initialTables.map(t => ({ ...t, status: 'Libre' as TableStatus, currentOrderId: undefined }));

    // Persist new restaurant data
    setStored('config', newConfig, newId);
    setStored('categories', newCategories, newId);
    setStored('menuItems', newMenuItems, newId);
    setStored('tables', newTables, newId);
    setStored('orders', [], newId);
    setStored('cashSession', { ...initialCashRegisterSession, status: 'Fermée' }, newId);
    setStored('stockItems', startWithTemplate ? initialStockItems : [], newId);
    setStored('suppliers', startWithTemplate ? initialSuppliers : [], newId);
    setStored('expenses', [], newId);
    setStored('activityLogs', [{
      id: `log-${Date.now()}-1-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      userName: `${currentRole} RestoFlow`,
      userRole: currentRole,
      action: "Inscription Établissement",
      details: `Création du compte restaurant SaaS pour ${restoData.name} (${restoData.city}) par ${restoData.ownerName}`
    }], newId);

    // Switch active state to the newly registered restaurant
    setActiveRestaurantId(newId);
    setConfig(newConfig);
    setCategories(newCategories);
    setMenuItems(newMenuItems);
    setTables(newTables);
    setOrders([]);
    setCashSession({ ...initialCashRegisterSession, status: 'Fermée' });
    setStockItems(startWithTemplate ? initialStockItems : []);
    setSuppliers(startWithTemplate ? initialSuppliers : []);
    setExpenses([]);
    setActivityLogs([{
      id: `log-${Date.now()}-2-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      userName: `${currentRole} RestoFlow`,
      userRole: currentRole,
      action: "Inscription Établissement",
      details: `Inscrit avec succès ! Bienvenue dans ${restoData.name}`
    }]);

    setIsRegisterModalOpen(false);
    return newRegistered;
  };

  const switchActiveRestaurant = (targetId: string) => {
    if (targetId === activeRestaurantId) return;

    const targetResto = registeredRestaurants.find(r => r.id === targetId);
    if (!targetResto) return;

    // Save current active state before switching
    setStored('config', config, activeRestaurantId);
    setStored('categories', categories, activeRestaurantId);
    setStored('menuItems', menuItems, activeRestaurantId);
    setStored('tables', tables, activeRestaurantId);
    setStored('orders', orders, activeRestaurantId);
    setStored('cashSession', cashSession, activeRestaurantId);
    setStored('stockItems', stockItems, activeRestaurantId);
    setStored('suppliers', suppliers, activeRestaurantId);
    setStored('expenses', expenses, activeRestaurantId);
    setStored('activityLogs', activityLogs, activeRestaurantId);

    // Switch ID
    setActiveRestaurantId(targetId);

    // Load target data into active state
    const loadedConfig = getStored('config', {
      name: targetResto.name,
      type: targetResto.type,
      phone: targetResto.phone,
      whatsappPhone: targetResto.whatsappPhone || targetResto.phone,
      ifuNumber: targetResto.ifuNumber || '',
      logoUrl: targetResto.logoUrl || '',
      address: targetResto.address || `Quartier ${targetResto.neighborhood}`,
      city: targetResto.city,
      neighborhood: targetResto.neighborhood,
      currency: "FCFA",
      taxRatePercent: 0,
      welcomeMessage: `Bienvenue à ${targetResto.name}`,
      ticketFooterMessage: "Merci pour votre confiance ! À très bientôt.",
      deliveryZones: [{ zone: "Centre-Ville", defaultFeeFcfa: 500 }]
    }, targetId);

    setConfig(loadedConfig);
    setCategories(getStored('categories', initialCategories, targetId));
    setMenuItems(getStored('menuItems', initialMenuItems, targetId));
    setTables(getStored('tables', initialTables, targetId));
    setOrders(getStored('orders', [], targetId));
    setCashSession(getStored('cashSession', initialCashRegisterSession, targetId));
    setStockItems(getStored('stockItems', [], targetId));
    setSuppliers(getStored('suppliers', [], targetId));
    setExpenses(getStored('expenses', [], targetId));
    setActivityLogs(getStored('activityLogs', [], targetId));

    setIsRegisterModalOpen(false);
  };

  const deleteRegisteredRestaurant = (idToDelete: string) => {
    if (registeredRestaurants.length <= 1) return;
    const filtered = registeredRestaurants.filter(r => r.id !== idToDelete);
    setRegisteredRestaurants(filtered);

    if (idToDelete === activeRestaurantId) {
      switchActiveRestaurant(filtered[0].id);
    }
  };

  // Utility to format currency in FCFA cleanly (e.g. 2 500 FCFA)
  const formatFcfa = (amount: number): string => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  const addLog = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userName: `${currentRole} RestoFlow`,
      userRole: currentRole,
      action,
      details
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    addLog("Changement de rôle", `Bascule vers le rôle ${role}`);
  };

  const updateConfig = (newConfig: Partial<EstablishmentConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    addLog("Mise à jour paramètres", "Informations de l'établissement modifiées.");
  };

  // Menu Management
  const addMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    setMenuItems(prev => [...prev, newItem]);
    addLog("Nouveau produit", `Ajout de ${newItem.name} (${formatFcfa(newItem.priceFcfa)})`);
  };

  const updateMenuItem = (id: string, itemData: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...itemData } : item));
    addLog("Modification produit", `Produit ${id} mis à jour.`);
  };

  const toggleMenuItemAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.available;
        addLog("Disponibilité produit", `${item.name} marqué comme ${nextState ? 'Disponible' : 'Indisponible'}`);
        return { ...item, available: nextState };
      }
      return item;
    }));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    addLog("Suppression produit", `Produit ${id} supprimé.`);
  };

  const duplicateMenuItem = (id: string) => {
    const list = Array.isArray(menuItems) ? menuItems : [];
    const existing = list.find(item => item.id === id);
    if (!existing) return;
    const duplicated: MenuItem = {
      ...existing,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${existing.name} (Copie)`,
      isPopular: false,
      isNew: true
    };
    setMenuItems(prev => Array.isArray(prev) ? [...prev, duplicated] : [duplicated]);
    addLog("Duplication produit", `Produit ${existing.name} dupliqué.`);
  };

  const reorderMenuItems = (reorderedItemsOrId: MenuItem[] | string, targetId?: string) => {
    if (Array.isArray(reorderedItemsOrId)) {
      setMenuItems(reorderedItemsOrId);
      addLog("Réorganisation du menu", "L'ordre des plats du menu a été mis à jour.");
      return;
    }

    if (typeof reorderedItemsOrId === 'string' && targetId) {
      setMenuItems(prev => {
        const list = Array.isArray(prev) ? [...prev] : [...initialMenuItems];
        const fromIndex = list.findIndex(i => i.id === reorderedItemsOrId);
        const toIndex = list.findIndex(i => i.id === targetId);
        if (fromIndex === -1 || toIndex === -1) return list;
        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);
        return list;
      });
      addLog("Réorganisation du menu", "L'ordre des plats du menu a été mis à jour.");
    }
  };

  const addCategory = (name: string) => {
    if (!name.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      icon: "Utensils"
    };
    setCategories(prev => [...prev, newCat]);
    addLog("Nouvelle catégorie", `Catégorie ${name} ajoutée.`);
  };

  // Tables Management
  const updateTableStatus = (tableId: string, status: TableStatus, currentOrderId?: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId || t.code === tableId) {
        return { ...t, status, currentOrderId: status === 'Libre' ? undefined : (currentOrderId || t.currentOrderId) };
      }
      return t;
    }));
  };

  const addTable = (code: string, seats: number, zone: RestaurantTable['zone']) => {
    const newTbl: RestaurantTable = {
      id: `tbl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: code.trim().toUpperCase(),
      seats,
      zone,
      status: 'Libre'
    };
    setTables(prev => [...prev, newTbl]);
    addLog("Ajout Table", `Nouvelle table ${newTbl.code} (${zone}) créée.`);
  };

  // Orders Management
  const createOrder = (orderData: Partial<Order>): Order => {
    const orderCount = orders.length + 101;
    const code = `CMD-${orderCount}`;
    const now = new Date().toISOString();

    const subtotalFcfa = (orderData.items || []).reduce((acc, item) => {
      const itemSupplements = (item.selectedSupplements || []).reduce((sAcc, s) => sAcc + s.priceFcfa, 0);
      return acc + (item.unitPriceFcfa + itemSupplements) * item.quantity;
    }, 0);

    const deliveryFeeFcfa = orderData.deliveryFeeFcfa || 0;
    const totalFcfa = subtotalFcfa + deliveryFeeFcfa - (orderData.discountFcfa || 0);

    const newOrder: Order = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code,
      type: orderData.type || 'Sur place',
      tableCode: orderData.tableCode,
      tableZone: orderData.tableZone,
      customer: orderData.customer,
      delivery: orderData.delivery,
      items: orderData.items || [],
      subtotalFcfa,
      deliveryFeeFcfa,
      discountFcfa: orderData.discountFcfa || 0,
      totalFcfa,
      status: 'Nouvelle',
      createdAt: now,
      updatedAt: now,
      createdByRole: currentRole,
      createdByName: `${currentRole}`,
      paymentStatus: orderData.paymentStatus || 'En attente',
      payments: orderData.payments || [],
      generalNote: orderData.generalNote
    };

    setOrders(prev => [newOrder, ...prev]);

    // If order linked to table, update table status to 'Occupée'
    if (orderData.tableCode) {
      updateTableStatus(orderData.tableCode, 'Occupée', newOrder.id);
    }

    addLog("Nouvelle Commande", `${code} (${orderData.type}) de ${formatFcfa(totalFcfa)} créée.`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const updated = { ...ord, status, updatedAt: new Date().toISOString() };
        
        // If order finished or cancelled, free table
        if ((status === 'Terminée' || status === 'Annulée') && ord.tableCode) {
          updateTableStatus(ord.tableCode, 'Libre');
        }

        addLog("Statut commande", `Commande ${ord.code} passée à: ${status}`);
        return updated;
      }
      return ord;
    }));
  };

  const updateOrderItemStatus = (orderId: string, itemId: string, status: OrderItem['status']) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const updatedItems = ord.items.map(it => it.id === itemId ? { ...it, status } : it);
        return { ...ord, items: updatedItems, updatedAt: new Date().toISOString() };
      }
      return ord;
    }));
  };

  const addPaymentToOrder = (orderId: string, paymentData: Omit<PaymentInfo, 'id' | 'orderId'>) => {
    const newPayment: PaymentInfo = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      orderId
    };

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const newPayments = [...ord.payments, newPayment];
        const totalPaid = newPayments.reduce((acc, p) => p.status === 'Payé' ? acc + p.amountFcfa : acc, 0);
        const isFullyPaid = totalPaid >= ord.totalFcfa;

        return {
          ...ord,
          payments: newPayments,
          paymentStatus: isFullyPaid ? 'Payé' : 'En attente',
          status: isFullyPaid && ord.status === 'Servie' ? 'Terminée' : ord.status
        };
      }
      return ord;
    }));

    // Update Cash Register totals
    if (paymentData.status === 'Payé' && cashSession.status === 'Ouverte') {
      setCashSession(prev => {
        let totalCash = prev.totalCashSalesFcfa;
        let totalMtn = prev.totalMtnSalesFcfa;
        let totalMoov = prev.totalMoovSalesFcfa;
        let totalCard = prev.totalCardSalesFcfa;

        if (paymentData.method === 'Espèces') totalCash += paymentData.amountFcfa;
        else if (paymentData.method === 'MTN Mobile Money') totalMtn += paymentData.amountFcfa;
        else if (paymentData.method === 'Moov Money') totalMoov += paymentData.amountFcfa;
        else if (paymentData.method === 'Carte bancaire') totalCard += paymentData.amountFcfa;

        const theoretical = prev.initialCashFcfa + totalCash - prev.totalExpensesFcfa;

        return {
          ...prev,
          totalCashSalesFcfa: totalCash,
          totalMtnSalesFcfa: totalMtn,
          totalMoovSalesFcfa: totalMoov,
          totalCardSalesFcfa: totalCard,
          theoreticalCashFcfa: theoretical
        };
      });
    }

    addLog("Paiement reçu", `Paiement ${paymentData.method} de ${formatFcfa(paymentData.amountFcfa)} enregistré.`);
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Annulée');
  };

  // Cash Register Management
  const openCashRegister = (initialAmountFcfa: number, notes?: string) => {
    const newSession: CashRegisterSession = {
      id: `cash-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy: `${currentRole}`,
      initialCashFcfa: initialAmountFcfa,
      totalCashSalesFcfa: 0,
      totalMtnSalesFcfa: 0,
      totalMoovSalesFcfa: 0,
      totalCardSalesFcfa: 0,
      totalExpensesFcfa: 0,
      theoreticalCashFcfa: initialAmountFcfa,
      status: 'Ouverte',
      notes
    };
    setCashSession(newSession);
    addLog("Ouverture Caisse", `Caisse ouverte avec un fonds de ${formatFcfa(initialAmountFcfa)}`);
  };

  const closeCashRegister = (actualCashFcfa: number, notes?: string) => {
    const discrepancy = actualCashFcfa - cashSession.theoreticalCashFcfa;
    setCashSession(prev => ({
      ...prev,
      closedAt: new Date().toISOString(),
      closedBy: `${currentRole}`,
      actualCashFcfa,
      discrepancyFcfa: discrepancy,
      status: 'Fermée',
      notes: notes || prev.notes
    }));
    addLog("Clôture Caisse", `Caisse fermée. Solde réel: ${formatFcfa(actualCashFcfa)}, Écart: ${formatFcfa(discrepancy)}`);
  };

  // Stock Management
  const addStockItem = (itemData: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = {
      ...itemData,
      id: `stk-${Date.now()}`
    };
    setStockItems(prev => [...prev, newItem]);
    addLog("Ajout Stock", `Matière première ${newItem.name} ajoutée.`);
  };

  const updateStockQuantity = (id: string, delta: number) => {
    setStockItems(prev => prev.map(stk => {
      if (stk.id === id) {
        const nextQty = Math.max(0, stk.currentQuantity + delta);
        return { 
          ...stk, 
          currentQuantity: nextQty,
          lastRestockedDate: delta > 0 ? new Date().toISOString().split('T')[0] : stk.lastRestockedDate 
        };
      }
      return stk;
    }));
  };

  // Suppliers Management
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'totalDebtFcfa'>) => {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      totalDebtFcfa: 0
    };
    setSuppliers(prev => [...prev, newSup]);
    addLog("Ajout Fournisseur", `Fournisseur ${newSup.name} enregistré.`);
  };

  const recordSupplierDebtPayment = (paymentData: Omit<DebtPayment, 'id'>) => {
    setSuppliers(prev => prev.map(sup => {
      if (sup.id === paymentData.supplierId) {
        const remainingDebt = Math.max(0, sup.totalDebtFcfa - paymentData.amountFcfa);
        return { ...sup, totalDebtFcfa: remainingDebt };
      }
      return sup;
    }));

    // Record as expense if paid from cash
    if (paymentData.paymentMethod === 'Espèces') {
      addExpense({
        category: 'Achat nourriture',
        title: `Règlement dette fournisseur: ${paymentData.supplierName}`,
        amountFcfa: paymentData.amountFcfa,
        date: new Date().toISOString(),
        recordedBy: paymentData.recordedBy,
        supplierName: paymentData.supplierName,
        notes: paymentData.notes
      });
    }

    addLog("Règlement Dette", `Règlement de ${formatFcfa(paymentData.amountFcfa)} à ${paymentData.supplierName}`);
  };

  // Expenses Management
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExpense, ...prev]);

    // Update cash session expenses if open
    if (cashSession.status === 'Ouverte') {
      setCashSession(prev => {
        const nextExpenses = prev.totalExpensesFcfa + expenseData.amountFcfa;
        const theoretical = prev.initialCashFcfa + prev.totalCashSalesFcfa - nextExpenses;
        return { ...prev, totalExpensesFcfa: nextExpenses, theoreticalCashFcfa: theoretical };
      });
    }

    addLog("Nouvelle Dépense", `${expenseData.title} (${formatFcfa(expenseData.amountFcfa)}) enregistrée.`);
  };

  // Deliveries Management
  const updateDeliveryStatus = (orderId: string, status: DeliveryDetails['status'], driverName?: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId && ord.delivery) {
        const updatedDelivery = {
          ...ord.delivery,
          status,
          driverName: driverName || ord.delivery.driverName
        };
        addLog("Suivi Livraison", `Livraison ${ord.code} passée à: ${status}`);
        return { ...ord, delivery: updatedDelivery };
      }
      return ord;
    }));
  };

  // QR Code & Public Table Ordering Helpers
  const getQrTableByToken = (token: string): RestaurantTable | undefined => {
    if (!token) return undefined;
    return tables.find(t => t.publicToken === token || t.code.toLowerCase() === token.toLowerCase() || t.id === token);
  };

  const generateOrRegenerateQrCode = (tableId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId || t.code === tableId) {
        const randStr = Math.random().toString(36).substring(2, 8);
        const publicToken = `tbl_tok_${t.code.toLowerCase()}_${randStr}`;
        const qrCodeUrl = `/commande/table/${publicToken}`;
        addLog("QR Code Table", `QR Code généré pour la table ${t.code}`);
        return {
          ...t,
          publicToken,
          qrCodeUrl,
          qrCodeStatus: 'Actif',
          qrGeneratedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const toggleQrCodeStatus = (tableId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId || t.code === tableId) {
        const nextStatus = t.qrCodeStatus === 'Désactivé' ? 'Actif' : 'Désactivé';
        addLog("Statut QR Code", `QR Code de la table ${t.code} ${nextStatus.toLowerCase()}`);
        return { ...t, qrCodeStatus: nextStatus };
      }
      return t;
    }));
  };

  const createQrOrder = (
    tableToken: string,
    items: Omit<OrderItem, 'id'>[],
    generalNote?: string,
    customerName?: string,
    customerPhone?: string
  ): Order => {
    const table = getQrTableByToken(tableToken);
    if (!table) {
      throw new Error("Table non trouvée ou invalide.");
    }

    if (table.qrCodeStatus === 'Désactivé') {
      throw new Error("Le QR code de cette table est temporairement désactivé.");
    }

    const orderCount = orders.length + 101;
    const code = `CMD-${orderCount}`;
    const now = new Date().toISOString();

    const fullItems: OrderItem[] = items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
      status: 'En attente'
    }));

    const subtotalFcfa = fullItems.reduce((acc, item) => {
      const itemSupplements = (item.selectedSupplements || []).reduce((sAcc, s) => sAcc + s.priceFcfa, 0);
      return acc + (item.unitPriceFcfa + itemSupplements) * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: `cmd-${Date.now()}`,
      code,
      type: 'Sur place',
      sourceCommande: 'QR_TABLE',
      statutConfirmation: 'En attente de confirmation',
      tableId: table.id,
      tableCode: table.code,
      tableZone: table.zone,
      customer: customerName || customerPhone ? {
        name: customerName || 'Client QR',
        phone: customerPhone || ''
      } : undefined,
      items: fullItems,
      subtotalFcfa,
      deliveryFeeFcfa: 0,
      discountFcfa: 0,
      totalFcfa: subtotalFcfa,
      status: 'Nouvelle',
      createdAt: now,
      updatedAt: now,
      createdByRole: 'Client',
      createdByName: customerName ? `${customerName} (QR Table ${table.code})` : `Client QR (Table ${table.code})`,
      paymentStatus: 'En attente',
      payments: [],
      generalNote
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update table status to Occupée
    updateTableStatus(table.id, 'Occupée', newOrder.id);

    addLog("Commande QR Reçue", `${code} envoyée depuis QR Table ${table.code} (${formatFcfa(subtotalFcfa)})`);
    return newOrder;
  };

  const confirmQrOrder = (orderId: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const updatedItems = ord.items.map(it => ({ ...it, status: 'En préparation' as const }));
        addLog("Confirmation Commande QR", `Commande ${ord.code} de la table ${ord.tableCode} confirmée et envoyée en cuisine.`);
        return {
          ...ord,
          statutConfirmation: 'Confirmée',
          status: 'En préparation',
          items: updatedItems,
          updatedAt: new Date().toISOString()
        };
      }
      return ord;
    }));
  };

  const refuseQrOrder = (orderId: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        addLog("Refus Commande QR", `Commande ${ord.code} de la table ${ord.tableCode} refusée.`);
        return {
          ...ord,
          statutConfirmation: 'Refusée',
          status: 'Annulée',
          updatedAt: new Date().toISOString()
        };
      }
      return ord;
    }));
  };

  const getOrdersForTable = (tableCodeOrId: string): Order[] => {
    return orders.filter(o => 
      (o.tableCode === tableCodeOrId || o.tableId === tableCodeOrId) && 
      o.status !== 'Annulée' && 
      o.paymentStatus !== 'Payé'
    );
  };

  const getTableTotalFcfa = (tableCodeOrId: string): number => {
    const activeOrders = getOrdersForTable(tableCodeOrId);
    return activeOrders.reduce((sum, o) => sum + o.totalFcfa, 0);
  };

  // WhatsApp link generator prefilled
  const generateWhatsAppLink = (order: Order): string => {
    const phoneClean = (order.customer?.phone || order.delivery?.phone || '').replace(/[^0-9]/g, '');
    const itemsList = order.items
      .map(i => `• ${i.quantity}x ${i.menuItemName} (${formatFcfa(i.unitPriceFcfa)})`)
      .join('\n');

    const message = `Bonjour ${order.customer?.name || 'cher client'},\n\n` +
      `Merci pour votre commande chez *${config.name}* !\n` +
      `📋 *N° Commande:* ${order.code}\n` +
      `📌 *Type:* ${order.type}\n` +
      `--------------------------------\n` +
      `${itemsList}\n` +
      `--------------------------------\n` +
      `💰 *Total à payer:* *${formatFcfa(order.totalFcfa)}*\n` +
      `💳 *Statut paiement:* ${order.paymentStatus}\n` +
      (order.delivery ? `🛵 *Livraison:* ${order.delivery.neighborhood} (${order.delivery.landmark})\n` : '') +
      `\nBonne dégustation et à très bientôt !`;

    const encoded = encodeURIComponent(message);
    const countryPhone = phoneClean.length === 8 ? `229${phoneClean}` : phoneClean;
    return `https://wa.me/${countryPhone}?text=${encoded}`;
  };

  const resetCounters = () => {
    setOrders([]);
    setExpenses([]);
    setTables(prev => (Array.isArray(prev) ? prev : []).map(t => ({ ...t, status: 'Libre', currentOrderId: undefined })));
    setCashSession({
      id: `session-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy: `${currentRole} RestoFlow`,
      initialCashFcfa: 0,
      totalCashSalesFcfa: 0,
      totalMtnSalesFcfa: 0,
      totalMoovSalesFcfa: 0,
      totalCardSalesFcfa: 0,
      totalExpensesFcfa: 0,
      theoreticalCashFcfa: 0,
      status: 'Fermée'
    });
    addLog("Remise à zéro des compteurs", "Tous les compteurs de ventes, commandes, dépenses et statistiques ont été réinitialisés à 0.");
  };

  const resetAllDataToDefault = () => {
    setOrders([]);
    setExpenses([]);
    setMenuItems([]);
    setCategories(initialCategories);
    setStockItems([]);
    setSuppliers([]);
    setTables(initialTables.map(t => ({ ...t, status: 'Libre', currentOrderId: undefined })));
    setCashSession({
      id: `session-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy: `${currentRole} RestoFlow`,
      initialCashFcfa: 0,
      totalCashSalesFcfa: 0,
      totalMtnSalesFcfa: 0,
      totalMoovSalesFcfa: 0,
      totalCardSalesFcfa: 0,
      totalExpensesFcfa: 0,
      theoreticalCashFcfa: 0,
      status: 'Fermée'
    });
    setConfig({
      name: "Mon Nouveau Restaurant",
      type: "Restaurant",
      phone: "+229 00 00 00 00",
      whatsappPhone: "+229 00 00 00 00",
      address: "Avenue Principale",
      city: "Cotonou",
      neighborhood: "Centre-Ville",
      currency: "FCFA",
      taxRatePercent: 0,
      welcomeMessage: "Bienvenue dans notre établissement",
      ticketFooterMessage: "Merci pour votre visite ! À très bientôt.",
      deliveryZones: [
        { zone: "Cotonou Centre", defaultFeeFcfa: 500 },
        { zone: "Périphérie / Calavi", defaultFeeFcfa: 1000 }
      ]
    });
    addLog("Réinitialisation complète SaaS", "Toutes les données de l'établissement ont été réinitialisées pour une nouvelle configuration SaaS.");
  };

  return (
    <RestoContext.Provider value={{
      currentRole,
      setCurrentRole,
      config,
      updateConfig,
      categories,
      menuItems,
      addMenuItem,
      updateMenuItem,
      toggleMenuItemAvailability,
      deleteMenuItem,
      duplicateMenuItem,
      reorderMenuItems,
      addCategory,
      tables,
      updateTableStatus,
      addTable,
      orders,
      createOrder,
      updateOrderStatus,
      updateOrderItemStatus,
      addPaymentToOrder,
      cancelOrder,
      cashSession,
      openCashRegister,
      closeCashRegister,
      stockItems,
      addStockItem,
      updateStockQuantity,
      suppliers,
      addSupplier,
      recordSupplierDebtPayment,
      expenses,
      addExpense,
      updateDeliveryStatus,
      getQrTableByToken,
      createQrOrder,
      confirmQrOrder,
      refuseQrOrder,
      generateOrRegenerateQrCode,
      toggleQrCodeStatus,
      getOrdersForTable,
      getTableTotalFcfa,
      activityLogs,
      addLog,
      resetCounters,
      resetAllDataToDefault,
      registeredRestaurants,
      activeRestaurantId,
      registerRestaurant,
      switchActiveRestaurant,
      deleteRegisteredRestaurant,
      isRegisterModalOpen,
      setIsRegisterModalOpen,
      formatFcfa,
      generateWhatsAppLink
    }}>
      {children}
    </RestoContext.Provider>
  );
};

export const useResto = () => {
  const context = useContext(RestoContext);
  if (!context) {
    throw new Error('useResto must be used within a RestoProvider');
  }
  return context;
};
