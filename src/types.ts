export type UserRole = 'Administrateur' | 'Chef' | 'Serveur' | 'Caissier' | 'Client';

export type EstablishmentType = 
  | 'Restaurant' 
  | 'Maquis' 
  | 'Bar-restaurant' 
  | 'Fast-food' 
  | 'Cafétéria' 
  | 'Snack / Pâtisserie' 
  | 'Service de livraison';

export type OrderType = 'Sur place' | 'À emporter' | 'Livraison' | 'Téléphone' | 'WhatsApp';

export type OrderSource = 'MANUELLE' | 'QR_TABLE' | 'COMPTOIR' | 'TELEPHONE' | 'WHATSAPP';

export type OrderConfirmationStatus = 'Confirmée' | 'En attente de confirmation' | 'Refusée';

export type OrderStatus = 'Nouvelle' | 'Confirmée' | 'En préparation' | 'Prête' | 'Servie' | 'Terminée' | 'Annulée';

export type TableStatus = 'Libre' | 'Occupée' | 'Réservée' | 'Nettoyage' | 'Indisponible';

export type TableZone = 'Salle' | 'Terrasse' | 'Extérieur' | 'Bar' | 'VIP';

export type PaymentMethod = 'Espèces' | 'MTN Mobile Money' | 'Moov Money' | 'Carte bancaire' | 'Autre';

export type PaymentStatus = 'En attente' | 'Payé' | 'Remboursé' | 'Échoué';

export type SellingUnit = 
  | 'portion' 
  | 'assiette' 
  | 'plat' 
  | 'bouteille' 
  | 'verre' 
  | 'sachet' 
  | 'kg' 
  | 'L' 
  | 'pièce' 
  | 'casier';

export interface SupplementOption {
  id: string;
  name: string;
  priceFcfa: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  priceFcfa: number;
  unit: SellingUnit;
  description: string;
  image?: string;
  available: boolean;
  supplements?: SupplementOption[];
  ingredientIds?: string[];
  isPopular?: boolean;
  isNew?: boolean;
  spicyLevel?: 'Aucun' | 'Épicé' | 'Très épicé';
  isVegetarian?: boolean;
  isTodaySpecial?: boolean;
  isIllustrativeImage?: boolean;
  orderIndex?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface RestaurantTable {
  id: string;
  code: string; // e.g. T01, T02
  seats: number;
  zone: TableZone;
  status: TableStatus;
  currentOrderId?: string;
  publicToken?: string;
  qrCodeUrl?: string;
  qrCodeStatus?: 'Actif' | 'Désactivé';
  qrGeneratedAt?: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  tableCode: string;
  status: 'Ouverte' | 'Payée' | 'Clôturée';
  openedAt: string;
  closedAt?: string;
  totalAmountFcfa: number;
  orderIds: string[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  unitPriceFcfa: number;
  quantity: number;
  selectedSupplements: SupplementOption[];
  kitchenNote?: string;
  status?: 'En attente' | 'En préparation' | 'Prêt' | 'Servi';
}

export interface CustomerInfo {
  name: string;
  phone: string;
  neighborhood?: string;
  city?: string;
  notes?: string;
}

export interface DeliveryDetails {
  customerName: string;
  phone: string;
  city: string; // Cotonou, Calavi, Porto-Novo...
  neighborhood: string;
  landmark: string; // e.g. "près de la pharmacie Akpakpa"
  deliveryFeeFcfa: number;
  driverName?: string;
  status: 'En attente' | 'En cours de livraison' | 'Livrée' | 'Annulée';
}

export interface PaymentInfo {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amountFcfa: number;
  operator?: 'MTN' | 'Moov' | 'Autre';
  phoneNumber?: string;
  transactionReference?: string; // e.g. TXN-8942
  cashierName: string;
  date: string; // ISO String
  status: PaymentStatus;
}

export interface Order {
  id: string;
  code: string; // e.g. CMD-104
  type: OrderType;
  sourceCommande?: OrderSource;
  statutConfirmation?: OrderConfirmationStatus;
  tableId?: string;
  tableCode?: string;
  tableZone?: TableZone;
  tableSessionId?: string;
  customer?: CustomerInfo;
  delivery?: DeliveryDetails;
  items: OrderItem[];
  subtotalFcfa: number;
  deliveryFeeFcfa: number;
  discountFcfa: number;
  totalFcfa: number;
  status: OrderStatus;
  createdAt: string; // ISO String
  updatedAt: string;
  createdByRole: UserRole;
  createdByName: string;
  paymentStatus: PaymentStatus;
  payments: PaymentInfo[];
  generalNote?: string;
}

export interface CashRegisterSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  initialCashFcfa: number;
  totalCashSalesFcfa: number;
  totalMtnSalesFcfa: number;
  totalMoovSalesFcfa: number;
  totalCardSalesFcfa: number;
  totalExpensesFcfa: number;
  theoreticalCashFcfa: number;
  actualCashFcfa?: number;
  discrepancyFcfa?: number;
  status: 'Ouverte' | 'Fermée';
  notes?: string;
}

export interface Expense {
  id: string;
  category: 'Achat nourriture' | 'Boissons' | 'Transport' | 'Électricité' | 'Eau' | 'Internet' | 'Salaire' | 'Entretien' | 'Loyer' | 'Livraison' | 'Autre';
  title: string;
  amountFcfa: number;
  date: string;
  recordedBy: string;
  supplierName?: string;
  notes?: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentQuantity: number;
  minQuantity: number;
  unit: string; // kg, L, sac, bidon, carton, casier, pièce
  costPriceFcfa: number;
  supplierName?: string;
  lastRestockedDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  productsSupplied: string;
  totalDebtFcfa: number;
  notes?: string;
}

export interface DebtPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  amountFcfa: number;
  date: string;
  paymentMethod: PaymentMethod;
  recordedBy: string;
  notes?: string;
}

export interface SupplierPurchase {
  id: string;
  supplierId: string;
  supplierName: string;
  productName: string;
  quantity: number;
  unit: string;
  totalAmountFcfa: number;
  paidAmountFcfa: number;
  remainingDebtFcfa: number;
  date: string;
  notes?: string;
}

export interface EstablishmentConfig {
  name: string;
  type: EstablishmentType;
  phone: string;
  whatsappPhone?: string;
  ifuNumber?: string;
  logoUrl?: string;
  address: string;
  city: string;
  neighborhood: string;
  currency: string; // FCFA
  taxRatePercent: number;
  welcomeMessage: string;
  ticketFooterMessage?: string;
  deliveryZones: { zone: string; defaultFeeFcfa: number }[];
}

export interface RegisteredRestaurant {
  id: string;
  name: string;
  type: EstablishmentType;
  ownerName: string;
  phone: string;
  whatsappPhone?: string;
  ifuNumber?: string;
  email?: string;
  city: string;
  neighborhood: string;
  address?: string;
  pinCode?: string;
  createdAt: string;
  logoUrl?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}
