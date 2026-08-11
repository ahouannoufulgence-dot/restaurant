export type MvpUserRole = 'PROPRIETAIRE' | 'EMPLOYE' | 'CUISINE';

export interface RolePermissions {
  canViewDashboard: boolean;
  canManageMenu: boolean; // Add/edit/delete menu items and prices
  canViewMenu: boolean; // View available dishes
  canCreateOrder: boolean;
  canConfirmQrOrder: boolean;
  canViewKitchen: boolean;
  canUpdateKitchenStatus: boolean;
  canTakePayment: boolean;
  canViewReports: boolean;
  canManageStaff: boolean;
  canManageSettings: boolean;
  canManageSubscription: boolean;
  canRefund: boolean;
  canDeleteOrder: boolean;
  canManageTables: boolean;
}

export const ROLE_PERMISSIONS: Record<MvpUserRole, RolePermissions> = {
  PROPRIETAIRE: {
    canViewDashboard: true,
    canManageMenu: true,
    canViewMenu: true,
    canCreateOrder: true,
    canConfirmQrOrder: true,
    canViewKitchen: true,
    canUpdateKitchenStatus: true,
    canTakePayment: true,
    canViewReports: true,
    canManageStaff: true,
    canManageSettings: true,
    canManageSubscription: true,
    canRefund: true,
    canDeleteOrder: true,
    canManageTables: true,
  },
  EMPLOYE: {
    canViewDashboard: false,
    canManageMenu: false, // Cannot edit prices or products
    canViewMenu: true, // Can view available menu dishes
    canCreateOrder: true, // Serveur + Caissier: create manual order, table, takeout, delivery, confirm QR
    canConfirmQrOrder: true,
    canViewKitchen: true, // Can view kitchen preparation
    canUpdateKitchenStatus: true, // Can mark served
    canTakePayment: true, // Caissier: record cash, MTN, Moov payments
    canViewReports: false, // Cannot view owner's detailed financial reports
    canManageStaff: false,
    canManageSettings: false,
    canManageSubscription: false,
    canRefund: false, // Only PROPRIETAIRE can authorize refund
    canDeleteOrder: false, // Only PROPRIETAIRE can delete/cancel order
    canManageTables: true, // Select & view tables
  },
  CUISINE: {
    canViewDashboard: false,
    canManageMenu: false,
    canViewMenu: false,
    canCreateOrder: false,
    canConfirmQrOrder: false,
    canViewKitchen: true, // Preparation screen ONLY
    canUpdateKitchenStatus: true, // Only update prep status (Nouvelle -> En préparation -> Prête)
    canTakePayment: false, // CANNOT see prices, payments, caisse
    canViewReports: false,
    canManageStaff: false,
    canManageSettings: false,
    canManageSubscription: false,
    canRefund: false,
    canDeleteOrder: false,
    canManageTables: false,
  },
};

export function getPermissionsForRole(role: MvpUserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.EMPLOYE;
}

export function getDefaultHomeTabForRole(role: MvpUserRole): string {
  switch (role) {
    case 'PROPRIETAIRE':
      return 'dashboard';
    case 'EMPLOYE':
      return 'commandes';
    case 'CUISINE':
      return 'cuisine';
    default:
      return 'commandes';
  }
}

export function isTabAllowedForRole(tab: string, role: MvpUserRole): boolean {
  const p = getPermissionsForRole(role);
  switch (tab) {
    case 'dashboard':
      return p.canViewDashboard;
    case 'pos':
    case 'commandes':
      return p.canCreateOrder;
    case 'cuisine':
      return p.canViewKitchen;
    case 'caisse':
    case 'paiements':
      return p.canTakePayment;
    case 'menu':
      return p.canViewMenu || p.canManageMenu;
    case 'tables':
      return p.canManageTables || role === 'EMPLOYE';
    case 'statistiques':
    case 'finances':
    case 'stock':
      return p.canViewReports;
    case 'livraisons':
      return p.canCreateOrder || p.canTakePayment;
    case 'personnel':
      return p.canManageStaff;
    case 'parametres':
    case 'abonnement':
      return p.canManageSettings;
    case 'client-menu':
      return true;
    default:
      return role === 'PROPRIETAIRE';
  }
}

export const ROLE_LABELS: Record<MvpUserRole, { title: string; badgeColor: string; description: string }> = {
  PROPRIETAIRE: {
    title: 'Propriétaire',
    badgeColor: 'bg-amber-500 text-[#0B1F33]',
    description: 'Accès complet : Dashboard, Menu, Prix, Tables, Cuisine, Caisse, Finances, Rapports & Personnel',
  },
  EMPLOYE: {
    title: 'Employé (Serveur & Caissier)',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Opérations quotidiennes : Commandes, Tables, Validation QR, Cuisine & Encaissements (Espèces, Mobile Money)',
  },
  CUISINE: {
    title: 'Cuisine / Chef',
    badgeColor: 'bg-orange-600 text-white',
    description: 'Écran de préparation direct : Numéro, Table, Plats & Statuts (Nouveau, En cours, Prêt). Sans prix ni caisse.',
  },
};

