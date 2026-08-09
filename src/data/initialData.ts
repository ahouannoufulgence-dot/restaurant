import { 
  Category, 
  MenuItem, 
  RestaurantTable, 
  Order, 
  CashRegisterSession, 
  StockItem, 
  Supplier, 
  Expense, 
  EstablishmentConfig,
  ActivityLog
} from '../types';

export const initialEstablishmentConfig: EstablishmentConfig = {
  name: "Maquis & Grill La Pirogue",
  type: "Maquis",
  phone: "+229 97 00 11 22",
  whatsappPhone: "+229 97 00 11 22",
  ifuNumber: "3202112849012",
  logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80",
  address: "Carrefour Cadjehoun, face Pharmacie",
  city: "Cotonou",
  neighborhood: "Cadjehoun",
  currency: "FCFA",
  taxRatePercent: 0,
  welcomeMessage: "Bienvenue au Maquis La Pirogue - Spécialités Béninoises & Grillades",
  ticketFooterMessage: "Merci pour votre confiance ! À très bientôt.",
  deliveryZones: [
    { zone: "Cadjehoun / Haie Vive / Fidjrossè", defaultFeeFcfa: 500 },
    { zone: "Akpakpa / Cotonou Centre", defaultFeeFcfa: 1000 },
    { zone: "Abomey-Calavi / Tankpè", defaultFeeFcfa: 1500 },
    { zone: "Porto-Novo", defaultFeeFcfa: 2500 },
  ]
};

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Plats Chauds & Spécialités", icon: "Utensils" },
  { id: "cat-2", name: "Grillades & Poissons", icon: "Flame" },
  { id: "cat-3", name: "Accompagnements", icon: "BowlFood" },
  { id: "cat-4", name: "Boissons & Jus Locaux", icon: "CupSoda" },
  { id: "cat-5", name: "Bières & Cocktails", icon: "Beer" },
  { id: "cat-6", name: "Desserts & Snacks", icon: "Cookie" },
];

export const initialMenuItems: MenuItem[] = [
  {
    id: "prod-1",
    name: "Riz au Gras + Poulet Braisé",
    category: "Plats Chauds & Spécialités",
    priceFcfa: 2500,
    unit: "portion",
    description: "Riz rouge épicé mijoté avec sauce tomate, légumes et quart de poulet braisé croustillant.",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: true,
    isNew: false,
    spicyLevel: "Épicé",
    isVegetarian: false,
    isTodaySpecial: true,
    isIllustrativeImage: true,
    supplements: [
      { id: "sup-1", name: "Supplément Plantain Frit (Aloko)", priceFcfa: 500 },
      { id: "sup-2", name: "Supplément Oeuf Bouilli", priceFcfa: 300 },
      { id: "sup-3", name: "Double Sauce Tomato", priceFcfa: 200 }
    ]
  },
  {
    id: "prod-2",
    name: "Atassi Spécial + Viande de Mouton",
    category: "Plats Chauds & Spécialités",
    priceFcfa: 3000,
    unit: "plat",
    description: "Mélange traditionnel de riz et haricots rouges servi avec friture Dja pimentée, oeuf dur et viande de mouton tendre.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: true,
    isNew: false,
    spicyLevel: "Très épicé",
    isVegetarian: false,
    isTodaySpecial: false,
    isIllustrativeImage: true,
    supplements: [
      { id: "sup-4", name: "Supplément Wagassi Frit", priceFcfa: 500 },
      { id: "sup-5", name: "Moutarde / Piment fort à part", priceFcfa: 0 }
    ]
  },
  {
    id: "prod-3",
    name: "Amiwo Poulet Fermier (Pâte Rouge)",
    category: "Plats Chauds & Spécialités",
    priceFcfa: 2800,
    unit: "portion",
    description: "Pâte de maïs rouge préparée au bouillon de poulet et purée de tomates, servie avec morceau de poulet pimenté.",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: false,
    isNew: true,
    spicyLevel: "Épicé",
    isVegetarian: false,
    isTodaySpecial: true,
    isIllustrativeImage: true,
    supplements: [
      { id: "sup-6", name: "Piment vert concassé", priceFcfa: 100 }
    ]
  },
  {
    id: "prod-4",
    name: "Poisson Capitaine Braisé (Grand)",
    category: "Grillades & Poissons",
    priceFcfa: 6000,
    unit: "pièce",
    description: "Gros poisson Capitaine frais mariné aux condiments locaux, braisé à la perfection au charbon de bois.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: true,
    isNew: false,
    spicyLevel: "Épicé",
    isVegetarian: false,
    isTodaySpecial: true,
    isIllustrativeImage: true,
    supplements: [
      { id: "sup-7", name: "Portion Frites d'Igname", priceFcfa: 1000 },
      { id: "sup-8", name: "Portion Ablo (3 pièces)", priceFcfa: 500 },
      { id: "sup-9", name: "Sauce Piment Poyo Extra", priceFcfa: 300 }
    ]
  },
  {
    id: "prod-5",
    name: "Brochettes de Boeuf (Kebab Local) - 5 sticks",
    category: "Grillades & Poissons",
    priceFcfa: 2500,
    unit: "portion",
    description: "Brochettes de boeuf tendres assaisonnées au suya/piment sec et oignons frais coupés.",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: true,
    isNew: false,
    spicyLevel: "Très épicé",
    isVegetarian: false,
    isTodaySpecial: false,
    isIllustrativeImage: true,
    supplements: [
      { id: "sup-10", name: "Oignons & Piments marinés extra", priceFcfa: 200 }
    ]
  },
  {
    id: "prod-6",
    name: "Wagassi Frit au Piment (Fromage Peulh)",
    category: "Grillades & Poissons",
    priceFcfa: 2000,
    unit: "portion",
    description: "Assiette de fromage traditionnel béninois frit servi chaud avec friture de tomate pimentée.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: false,
    isNew: false,
    spicyLevel: "Épicé",
    isVegetarian: true,
    isTodaySpecial: false,
    isIllustrativeImage: true
  },
  {
    id: "prod-7",
    name: "Frites d'Igname Fraîche",
    category: "Accompagnements",
    priceFcfa: 1000,
    unit: "assiette",
    description: "Igname du Nord Bénin découpée et frite à la demande, dorée et croustillante.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: false,
    isNew: false,
    spicyLevel: "Aucun",
    isVegetarian: true,
    isTodaySpecial: false,
    isIllustrativeImage: true
  },
  {
    id: "prod-8",
    name: "Portion Ablo Moelleux (4 pièces)",
    category: "Accompagnements",
    priceFcfa: 600,
    unit: "portion",
    description: "Galettes de maïs et riz cuites à la vapeur, légèrement sucrées et aérées.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: false,
    isNew: false,
    spicyLevel: "Aucun",
    isVegetarian: true,
    isTodaySpecial: false,
    isIllustrativeImage: true
  },
  {
    id: "prod-9",
    name: "Jus de Bissap Maison (50ml)",
    category: "Boissons & Jus Locaux",
    priceFcfa: 500,
    unit: "bouteille",
    description: "Infusion artisanale d'hibiscus rouge parfumée à la menthe fraîche et jus d'ananas.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: true,
    isNew: false,
    spicyLevel: "Aucun",
    isVegetarian: true,
    isTodaySpecial: false,
    isIllustrativeImage: true
  },
  {
    id: "prod-10",
    name: "Jus de Gingembre (Gnamakoudji)",
    category: "Boissons & Jus Locaux",
    priceFcfa: 500,
    unit: "bouteille",
    description: "Jus de gingembre pur pressé à froid, relevé avec une pointe de citron vert.",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: false,
    isNew: false,
    spicyLevel: "Épicé",
    isVegetarian: true,
    isTodaySpecial: false,
    isIllustrativeImage: true
  },
  {
    id: "prod-11",
    name: "Bière Flag Spéciale (65cl)",
    category: "Bières & Cocktails",
    priceFcfa: 1000,
    unit: "bouteille",
    description: "Bière blonde fraîche Sobebra 65cl servie glacée.",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: true,
    isNew: false,
    spicyLevel: "Aucun",
    isVegetarian: true,
    isTodaySpecial: false,
    isIllustrativeImage: true
  },
  {
    id: "prod-12",
    name: "Bière Castel Beer (65cl)",
    category: "Bières & Cocktails",
    priceFcfa: 1000,
    unit: "bouteille",
    description: "Bière blonde de tradition Sobebra 65cl glacée.",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: false,
    isNew: false,
    spicyLevel: "Aucun",
    isVegetarian: true,
    isTodaySpecial: false,
    isIllustrativeImage: true
  },
  {
    id: "prod-13",
    name: "Sucrerie Sobebra (Youki/Coca 30cl)",
    category: "Boissons & Jus Locaux",
    priceFcfa: 500,
    unit: "bouteille",
    description: "Boisson gazeuse rafraîchissante au choix (Youki Pamplemousse, Cocktail, Coca).",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: false,
    isNew: false,
    spicyLevel: "Aucun",
    isVegetarian: true,
    isTodaySpecial: false,
    isIllustrativeImage: true
  },
  {
    id: "prod-14",
    name: "Eau Minérale Possotomé 1.5L",
    category: "Boissons & Jus Locaux",
    priceFcfa: 500,
    unit: "bouteille",
    description: "Bouteille d'eau minérale naturelle Possotomé fraîche.",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
    available: true,
    isPopular: false,
    isNew: false,
    spicyLevel: "Aucun",
    isVegetarian: true,
    isTodaySpecial: false,
    isIllustrativeImage: true
  }
];

export const initialTables: RestaurantTable[] = [
  { id: "tbl-1", code: "T01", seats: 4, zone: "Salle", status: "Occupée", currentOrderId: "cmd-101", publicToken: "tbl_tok_t01_8f9a2b", qrCodeUrl: "/commande/table/tbl_tok_t01_8f9a2b", qrCodeStatus: "Actif", qrGeneratedAt: "2026-08-01T10:00:00.000Z" },
  { id: "tbl-2", code: "T02", seats: 2, zone: "Salle", status: "Libre", publicToken: "tbl_tok_t02_1c3d4e", qrCodeUrl: "/commande/table/tbl_tok_t02_1c3d4e", qrCodeStatus: "Actif", qrGeneratedAt: "2026-08-01T10:00:00.000Z" },
  { id: "tbl-3", code: "T03", seats: 6, zone: "Terrasse", status: "Occupée", currentOrderId: "cmd-102", publicToken: "tbl_tok_t03_5f6g7h", qrCodeUrl: "/commande/table/tbl_tok_t03_5f6g7h", qrCodeStatus: "Actif", qrGeneratedAt: "2026-08-01T10:00:00.000Z" },
  { id: "tbl-4", code: "T04", seats: 4, zone: "Terrasse", status: "Libre", publicToken: "tbl_tok_t04_9i0j1k", qrCodeUrl: "/commande/table/tbl_tok_t04_9i0j1k", qrCodeStatus: "Actif", qrGeneratedAt: "2026-08-01T10:00:00.000Z" },
  { id: "tbl-5", code: "T05", seats: 8, zone: "Extérieur", status: "Réservée", publicToken: "tbl_tok_t05_2l3m4n", qrCodeUrl: "/commande/table/tbl_tok_t05_2l3m4n", qrCodeStatus: "Actif", qrGeneratedAt: "2026-08-01T10:00:00.000Z" },
  { id: "tbl-6", code: "T06", seats: 2, zone: "Bar", status: "Occupée", currentOrderId: "cmd-103", publicToken: "tbl_tok_t06_5o6p7q", qrCodeUrl: "/commande/table/tbl_tok_t06_5o6p7q", qrCodeStatus: "Actif", qrGeneratedAt: "2026-08-01T10:00:00.000Z" },
  { id: "tbl-7", code: "T07", seats: 4, zone: "VIP", status: "Libre", publicToken: "tbl_tok_t07_8r9s0t", qrCodeUrl: "/commande/table/tbl_tok_t07_8r9s0t", qrCodeStatus: "Actif", qrGeneratedAt: "2026-08-01T10:00:00.000Z" },
  { id: "tbl-8", code: "T08", seats: 6, zone: "VIP", status: "Libre", publicToken: "tbl_tok_t08_1u2v3w", qrCodeUrl: "/commande/table/tbl_tok_t08_1u2v3w", qrCodeStatus: "Actif", qrGeneratedAt: "2026-08-01T10:00:00.000Z" }
];

const today = new Date().toISOString().split('T')[0];

export const initialOrders: Order[] = [
  {
    id: "cmd-101",
    code: "CMD-101",
    type: "Sur place",
    tableCode: "T01",
    tableZone: "Salle",
    customer: { name: "M. Kpogan", phone: "97 12 34 56" },
    items: [
      {
        id: "item-1",
        menuItemId: "prod-1",
        menuItemName: "Riz au Gras + Poulet Braisé",
        unitPriceFcfa: 2500,
        quantity: 2,
        selectedSupplements: [{ id: "sup-1", name: "Supplément Plantain Frit (Aloko)", priceFcfa: 500 }],
        kitchenNote: "Sans piment trop fort dans la sauce",
        status: "En préparation"
      },
      {
        id: "item-2",
        menuItemId: "prod-9",
        menuItemName: "Jus de Bissap Maison (50ml)",
        unitPriceFcfa: 500,
        quantity: 2,
        selectedSupplements: [],
        status: "Servi"
      }
    ],
    subtotalFcfa: 6000,
    deliveryFeeFcfa: 0,
    discountFcfa: 0,
    totalFcfa: 6000,
    status: "En préparation",
    createdAt: `${today}T12:15:00.000Z`,
    updatedAt: `${today}T12:20:00.000Z`,
    createdByRole: "Serveur",
    createdByName: "Jean-Baptiste (Serveur)",
    paymentStatus: "En attente",
    payments: [],
    generalNote: "Client régulier - Servi rapidement"
  },
  {
    id: "cmd-102",
    code: "CMD-102",
    type: "Sur place",
    tableCode: "T03",
    tableZone: "Terrasse",
    customer: { name: "Mme Bio", phone: "96 45 88 99" },
    items: [
      {
        id: "item-3",
        menuItemId: "prod-4",
        menuItemName: "Poisson Capitaine Braisé (Grand)",
        unitPriceFcfa: 6000,
        quantity: 1,
        selectedSupplements: [{ id: "sup-7", name: "Portion Frites d'Igname", priceFcfa: 1000 }],
        kitchenNote: "Bien braisé, peau croustillante",
        status: "Prêt"
      },
      {
        id: "item-4",
        menuItemId: "prod-11",
        menuItemName: "Bière Flag Spéciale (65cl)",
        unitPriceFcfa: 1000,
        quantity: 3,
        selectedSupplements: [],
        status: "Servi"
      }
    ],
    subtotalFcfa: 10000,
    deliveryFeeFcfa: 0,
    discountFcfa: 0,
    totalFcfa: 10000,
    status: "Prête",
    createdAt: `${today}T12:00:00.000Z`,
    updatedAt: `${today}T12:25:00.000Z`,
    createdByRole: "Serveur",
    createdByName: "Sylvie (Serveuse)",
    paymentStatus: "En attente",
    payments: []
  },
  {
    id: "cmd-103",
    code: "CMD-103",
    type: "Livraison",
    customer: { name: "Dr. Lawson", phone: "95 22 11 44", neighborhood: "Haie Vive" },
    delivery: {
      customerName: "Dr. Lawson",
      phone: "95 22 11 44",
      city: "Cotonou",
      neighborhood: "Haie Vive",
      landmark: "Près de l'Ambassade de France, villa portail bleu",
      deliveryFeeFcfa: 500,
      driverName: "Codjo (Livreur Express)",
      status: "En cours de livraison"
    },
    items: [
      {
        id: "item-5",
        menuItemId: "prod-2",
        menuItemName: "Atassi Spécial + Viande de Mouton",
        unitPriceFcfa: 3000,
        quantity: 2,
        selectedSupplements: [],
        status: "Servi"
      },
      {
        id: "item-6",
        menuItemId: "prod-10",
        menuItemName: "Jus de Gingembre (Gnamakoudji)",
        unitPriceFcfa: 500,
        quantity: 2,
        selectedSupplements: [],
        status: "Servi"
      }
    ],
    subtotalFcfa: 7000,
    deliveryFeeFcfa: 500,
    discountFcfa: 0,
    totalFcfa: 7500,
    status: "Servie",
    createdAt: `${today}T11:30:00.000Z`,
    updatedAt: `${today}T12:05:00.000Z`,
    createdByRole: "Caissier",
    createdByName: "Marc (Caissier)",
    paymentStatus: "Payé",
    payments: [
      {
        id: "pay-1",
        orderId: "cmd-103",
        method: "MTN Mobile Money",
        amountFcfa: 7500,
        operator: "MTN",
        phoneNumber: "95221144",
        transactionReference: "TXN-MTN-98421",
        cashierName: "Marc",
        date: `${today}T11:32:00.000Z`,
        status: "Payé"
      }
    ]
  },
  {
    id: "cmd-104",
    code: "CMD-104",
    type: "À emporter",
    customer: { name: "Anicet", phone: "61 88 77 66" },
    items: [
      {
        id: "item-7",
        menuItemId: "prod-3",
        menuItemName: "Amiwo Poulet Fermier (Pâte Rouge)",
        unitPriceFcfa: 2800,
        quantity: 1,
        selectedSupplements: [],
        status: "Servi"
      }
    ],
    subtotalFcfa: 2800,
    deliveryFeeFcfa: 0,
    discountFcfa: 0,
    totalFcfa: 2800,
    status: "Terminée",
    createdAt: `${today}T10:45:00.000Z`,
    updatedAt: `${today}T11:00:00.000Z`,
    createdByRole: "Serveur",
    createdByName: "Sylvie (Serveuse)",
    paymentStatus: "Payé",
    payments: [
      {
        id: "pay-2",
        orderId: "cmd-104",
        method: "Espèces",
        amountFcfa: 2800,
        cashierName: "Marc",
        date: `${today}T10:58:00.000Z`,
        status: "Payé"
      }
    ]
  }
];

export const initialCashRegisterSession: CashRegisterSession = {
  id: "cash-20260808",
  openedAt: `${today}T08:00:00.000Z`,
  openedBy: "Marc (Caissier Principal)",
  initialCashFcfa: 50000,
  totalCashSalesFcfa: 35800,
  totalMtnSalesFcfa: 42500,
  totalMoovSalesFcfa: 18500,
  totalCardSalesFcfa: 0,
  totalExpensesFcfa: 15000,
  theoreticalCashFcfa: 70800, // 50000 + 35800 - 15000
  status: "Ouverte",
  notes: "Fonds de caisse initial 50 000 FCFA vérifié ce matin."
};

export const initialStockItems: StockItem[] = [
  {
    id: "stk-1",
    name: "Riz Parfumé (Sac de 50 kg)",
    category: "Céréales & Pâtes",
    currentQuantity: 3.5,
    minQuantity: 1,
    unit: "sac",
    costPriceFcfa: 28000,
    supplierName: "Grossiste Marché Dantokpa (M. Dossou)",
    lastRestockedDate: `${today}`
  },
  {
    id: "stk-2",
    name: "Huile de Palme / Huile Végétale (Bidon 25L)",
    category: "Huiles & Condiments",
    currentQuantity: 1.2,
    minQuantity: 1,
    unit: "bidon",
    costPriceFcfa: 22000,
    supplierName: "Ets Houessou & Fils",
    lastRestockedDate: `${today}`
  },
  {
    id: "stk-3",
    name: "Poulet Fermier Découpé (Carton 10kg)",
    category: "Viandes & Volailles",
    currentQuantity: 4,
    minQuantity: 2,
    unit: "carton",
    costPriceFcfa: 18500,
    supplierName: "Ferme Avicole d'Allada",
    lastRestockedDate: `${today}`
  },
  {
    id: "stk-4",
    name: "Poisson Capitaine Frais",
    category: "Poissons & Fruits de Mer",
    currentQuantity: 12,
    minQuantity: 5,
    unit: "kg",
    costPriceFcfa: 3500,
    supplierName: "Pêcherie Cotonou Port",
    lastRestockedDate: `${today}`
  },
  {
    id: "stk-5",
    name: "Bière Flag 65cl (Casier 12 bouteilles)",
    category: "Boissons",
    currentQuantity: 8,
    minQuantity: 3,
    unit: "casier",
    costPriceFcfa: 9600,
    supplierName: "Dépôt Sobebra Akpakpa",
    lastRestockedDate: `${today}`
  },
  {
    id: "stk-6",
    name: "Fleurs d'Hibiscus (Bissap)",
    category: "Condiments",
    currentQuantity: 2,
    minQuantity: 5, // Alert stock bas !
    unit: "kg",
    costPriceFcfa: 2500,
    supplierName: "Grossiste Marché Dantokpa",
    lastRestockedDate: "2026-08-01"
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Grossiste Marché Dantokpa (M. Dossou)",
    phone: "+229 97 44 55 66",
    address: "Marché Dantokpa, Allée Céréales",
    productsSupplied: "Riz, Haricots, Sucre, Épices, Bissap",
    totalDebtFcfa: 85000,
    notes: "Achat de 2 sacs de riz à crédit le 05 août. Échéance dans 10 jours."
  },
  {
    id: "sup-2",
    name: "Dépôt Sobebra Akpakpa",
    phone: "+229 21 33 12 00",
    address: "Route d'Akpakpa, près du pont",
    productsSupplied: "Bières Flag, Castel, Sucreries, Possotomé",
    totalDebtFcfa: 0,
    notes: "Paiement comptant à la livraison."
  },
  {
    id: "sup-3",
    name: "Ferme Avicole d'Allada",
    phone: "+229 96 11 22 33",
    address: "Route d'Allada",
    productsSupplied: "Poulet fermier, Oeufs de table",
    totalDebtFcfa: 37000,
    notes: "Acompte versé 20 000 FCFA, reste 37 000 FCFA à régler."
  }
];

export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    category: "Transport",
    title: "Achat condiments frais au marché Dantokpa",
    amountFcfa: 15000,
    date: `${today}T09:30:00.000Z`,
    recordedBy: "Chef Germain",
    notes: "Achat tomates, piments, oignons, gingembre frais."
  },
  {
    id: "exp-2",
    category: "Électricité",
    title: "Facture SBEE Rechargement Compteur Sbee",
    amountFcfa: 25000,
    date: "2026-08-05T14:00:00.000Z",
    recordedBy: "Gérant",
    notes: "Recharge carte SBEE restaurant."
  }
];

export const initialLogs: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: `${today}T08:00:00.000Z`,
    userName: "Marc",
    userRole: "Caissier",
    action: "Ouverture Caisse",
    details: "Caisse ouverte avec 50 000 FCFA en espèces."
  },
  {
    id: "log-2",
    timestamp: `${today}T12:15:00.000Z`,
    userName: "Jean-Baptiste",
    userRole: "Serveur",
    action: "Création Commande",
    details: "Commande CMD-101 créée pour Table T01 (6 000 FCFA)."
  }
];
