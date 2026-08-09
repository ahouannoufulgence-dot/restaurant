# BENIN_ADAPTATION_AUDIT.md - Audit Complet d'Adaptation Caisse Bénin (RestoFlow XOF)

---

## 1. Résumé Technique du Projet
- **Framework & Runtime** : React 19 + TypeScript + Vite 6 + Tailwind CSS v4.
- **Iconographie & UI** : Lucide-react, Motion (Framer Motion).
- **Architecture de Données** : React Context (`RestoContext.tsx`) couplé avec `localStorage` (`restoflow_benin_*`), garantissant une utilisation 100% hors-ligne/résiliente en environnement réseau instable.
- **Positionnement Produit** : Solution de caisse POS rapide, légère et mobile-first, spécialement adaptée aux restaurants, maquis, fast-foods, snacks, bars et cafétérias au Bénin.
- **Devise officielle** : Franc CFA (FCFA / XOF) avec formatage d'affichage fr-BJ (ex: `1 500 FCFA`).
- **Langue** : Français intégral.

---

## 2. Structure Actuelle de l'Application
```
/
├── metadata.json
├── package.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts (Modèle de données TypeScript complet)
│   ├── context/
│   │   └── RestoContext.tsx (Gestionnaire d'état global + Persistance LocalStorage)
│   ├── data/
│   │   └── initialData.ts (Jeu de données initiales pour le Bénin)
│   └── components/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── Dashboard.tsx
│       ├── POSRapide.tsx
│       ├── OrderManagement.tsx
│       ├── TableManagement.tsx
│       ├── KitchenKDS.tsx
│       ├── MenuManagement.tsx
│       ├── CashRegisterView.tsx
│       ├── StockAndSuppliersView.tsx
│       ├── DeliveriesView.tsx
│       ├── ExpensesAndFinancesView.tsx
│       ├── StatisticsView.tsx
│       ├── SettingsView.tsx
│       └── ReceiptModal.tsx
```

---

## 3. Pages / Vues Existantes
1. **Tableau de bord (`dashboard`)** : Vitesse globale, chiffre d'affaires du jour en FCFA, commandes en cours, flux caisse, alertes stock.
2. **Prise de Commande Rapide (`pos`)** : POS tactile pour commande sur place, à emporter, livraison ou WhatsApp, choix de table, recherche de plats du terroir, suppléments express.
3. **Gestion des Commandes (`commandes`)** : Suivi des commandes, filtre par statut/paiement, modal de détail, impression de ticket 80mm et partage WhatsApp.
4. **Gestion des Tables (`tables`)** : Vue par zones (Salle, Terrasse, Extérieur, Bar, VIP), statuts des tables (Libre, Occupée, Réservée), ouverture de commande en 1 clic.
5. **Cuisine KDS (`cuisine`)** : Écran pour les cuisiniers avec grosses cartes, minuteries, consignes spécifiques ("Sans piment") et changement de statut d'article.
6. **Menu & Produits (`menu`)** : Gestion du catalogue de plats/boissons, prix en FCFA, unités locales (portion, assiette, casier, bouteille...), suppléments et disponibilité.
7. **Caisse Journalière (`caisse`)** : Ouverture/fermeture de session de caisse, fond de caisse initial, répartition Espèces / MTN MoMo / Moov Money, calcul des écarts et rapport journalier.
8. **Stock & Fournisseurs (`stock`)** : Inventaire des matières premières (sacs de riz, bidons d'huile, casiers), seuils d'alerte, enregistrement des achats à crédit et règlements de dettes fournisseurs.
9. **Livraisons locales (`livraisons`)** : Suivi des livraisons par quartiers béninois (Cotonou, Calavi, Porto-Novo), repères textuels ("près de la pharmacie"), attribution de livreur.
10. **Dépenses & Finances (`finances`)** : Saisie rapide des dépenses quotidiennes (nourriture, électricité, transport) pour un calcul net de la caisse.
11. **Statistiques (`statistiques`)** : Analyse de la rentabilité, ventilation par canal de paiement et plats les plus vendus.
12. **Paramètres (`parametres`)** : Configuration du nom de l'établissement, type (Maquis, Fast-Food, Restaurant...), rôles, tarifs de livraison et réinitialisation des données.

---

## 4. Composants Existants
- `Navbar` : Barre supérieure avec sélection rapide du rôle, état de la caisse et menu mobile.
- `Sidebar` : Navigation latérale responsive.
- `ReceiptModal` : Modal d'impression du bon de caisse format ticket thermique 80mm.
- `POSRapide` : Composant maître de prise de commande tactile.
- `KitchenKDS` : Composant d'affichage écran cuisine.
- `TableManagement` : Composant de disposition et gestion des tables.
- `CashRegisterView` : Gestion des mouvements de caisse et réconciliation.
- `StockAndSuppliersView` : Module de gestion stock et dettes.
- `DeliveriesView` : Module de gestion des courses et livraisons.
- `ExpensesAndFinancesView` : Enregistrement des charges.
- `StatisticsView` : Graphiques et indicateurs de performance.
- `SettingsView` : Configuration d'établissement.

---

## 5. Tables et Schéma de Base de Données (Interfaces TypeScript)
- `EstablishmentConfig` : Nom, type d'établissement, téléphone, ville, quartier, devise (`FCFA`), zones de livraison.
- `Category` : Categories du menu (Plats locaux, Braisés, Accompagnements, Boissons, Desserts).
- `MenuItem` : Plats/boissons, catégorie, prix FCFA, unité de vente (`portion`, `assiette`, `bouteille`...), suppléments, disponibilité.
- `RestaurantTable` : Code (`T01`, `T02`...), capacité, zone (`Salle`, `Terrasse`, `Bar`, `VIP`), statut, commande active.
- `Order` & `OrderItem` : Code commande (`CMD-101`), type (`Sur place`, `À emporter`, `Livraison`), table, client, articles, suppléments, note de cuisine, totaux en FCFA, statut commande & paiement.
- `PaymentInfo` : Mode (`Espèces`, `MTN Mobile Money`, `Moov Money`, `Carte`), montant FCFA, opérateur, numéro, référence TXN, caissier, horodatage.
- `CashRegisterSession` : Date ouverture/fermeture, fond initial FCFA, cumul espèces, MTN MoMo, Moov Money, dépenses, solde théorique vs réel, écart.
- `StockItem` : Nom de l'ingrédient/fourniture, quantité, unité (`kg`, `sac`, `bidon`, `carton`, `casier`), prix unitaire, alerte stock min.
- `Supplier`, `SupplierPurchase` & `DebtPayment` : Registre des fournisseurs, achats à crédit, montants versés et solde dû en FCFA.
- `Expense` : Motif, catégorie, montant FCFA, enregistré par, date.
- `DeliveryDetails` : Nom client, téléphone, ville, quartier, repère d'adresse, frais de livraison FCFA, statut.
- `ActivityLog` : Traçabilité des actions utilisateurs.

---

## 6. Fonctionnalités Fonctionnelles à CONSERVER
1. **[CONSERVER] Formattage système des montants en FCFA** : Garantie de la devise `FCFA` sur l'ensemble des modules sans exception.
2. **[CONSERVER] Système de rôles utilisateur** : Administrateur, Chef, Serveur, Caissier pour simuler ou adapter les autorisations.
3. **[CONSERVER] Prise de commande rapide tactile (POS)** : Sélection en grille avec catégories, recherche directe et sélection d'accompagnements.
4. **[CONSERVER] Écran Cuisine KDS** : Affichage clair avec minuteries, consignes de cuisson et boutons d'avancement du statut.
5. **[CONSERVER] Gestion des sessions de Caisse** : Ouverture/Fermeture avec comptage d'espèces, ventilation Mobile Money MTN/Moov et calcul d'écart.
6. **[CONSERVER] Modal de Ticket de Caisse Thermal 80mm** : Impression physique et lien de partage WhatsApp pré-rempli.
7. **[CONSERVER] Persistance LocalStorage résiliente** : Fonctionne sans aucune dépendance serveur externe en cas de coupure de réseau internet.

---

## 7. Fonctionnalités à SIMPLIFIER
1. **[SIMPLIFIER] Gestion des livraisons** : Ne pas exiger de coordonnées GPS, privilégier le champ texte de repère ("Près de la pharmacie...").
2. **[SIMPLIFIER] Gestion des Mobile Money** : Enregistrement manuel simplifié de l'opérateur (MTN / Moov), numéro de téléphone client et référence TXN (pas de simulation d'API fictive).
3. **[SIMPLIFIER] Gestion des tables** : Passage rapide d'état Libre <-> Occupée <-> Réservée, création de commande directe sans réservation obligatoire.
4. **[SIMPLIFIER] Gestion de stock** : Inventaire direct en unités réelles (sacs, bidons, casiers, kg, pièces) sans recettes complexes dépendantes d'unités infinitésimales.

---

## 8. Fonctionnalités à REPORTER
1. **[REPORTER] Intégration API directe MTN MoMo / Moov Money** : Reporté tant qu'aucune clé d'API officielle n'est configurée par le client.
2. **[REPORTER] Multi-Etablissements / Franchises** : Le MVP se concentre sur la gestion parfaite d'un établissement unique au Bénin.
3. **[REPORTER] Recettes dynamiques automatisées (fiches techniques)** : Déduction automatique au gramme près de la farine/huile lors de la vente d'un plat.

---

## 9. Bugs Décelés & Corrections Réalisées
- **Typage TypeScript dans `initialData.ts`** : Correction de la valeur de statut de commande `"Prête"` vs `"Prêt"` pour `OrderItem` dans le jeu de données initial (déjà corrigé et validé par le linter `tsc --noEmit`).

---

## 10. Incohérences UX / Améliorations Ergonomiques
- **Lisibilité sur Smartphone Android** : S'assurer que tous les boutons de saisie rapide (POS, Caisse, Cuisine) mesurent au moins 44px de hauteur pour un usage tactile fluide avec les pouces.
- **Saisie des Notes de Cuisine** : Rendre les raccourcis de consignes de cuisine ("Sans piment", "Sauce à part", "Bien braisé") sélectionnables en 1 clic au lieu d'une frappe clavier sur téléphone.

---

## 11. Problèmes d'Adaptation au Bénin Réglés / À Surveiller
- **Devise** : Doit impérativement rester `FCFA` / `XOF` (jamais de `$`, `€` ou `£`).
- **Nommage des types d'établissements** : Présence explicite des termes *Maquis*, *Snack / Pâtisserie*, *Bar-restaurant*, *Cafétéria*.
- **Accompagnements locaux** : Présence des suppléments typiques (Riz au gras, Frites d'igname, Alloco, Akassa, Amiwo, Wagassi).
- **Opérateurs Mobile Money** : Intégration spécifique de MTN Mobile Money et Moov Money.

---

## 12. Modifications Nécessaires de la Base de Données (Schéma & Types TypeScript)
- **Table `RestaurantTable` (Adaptation)** :
  - `publicToken`: Token unique sécurisé (ex: `tbl_tok_8f9a2b`) pour l'URL du QR Code sans exposer d'ID interne.
  - `qrCodeUrl`: URL publique de commande (ex: `/commande/table/tbl_tok_8f9a2b`).
  - `qrCodeStatus`: `'Actif'` | `'Désactivé'`.
  - `qrGeneratedAt`: Horodatage de génération du QR Code.
- **Table `Order` (Adaptation)** :
  - `sourceCommande`: `'MANUELLE'` | `'QR_TABLE'` | `'COMPTOIR'` | `'TELEPHONE'` | `'WHATSAPP'`.
  - `statutConfirmation`: `'Confirmée'` | `'En attente de confirmation'` | `'Refusée'`.
  - `tableId`: Identifiant unique de la table associée.
  - `tableSessionId`: Identifiant de la session en cours de la table (permettant le cumul de plusieurs commandes pour une même table avant fermeture/encaissement).
- **Table `TableSession` (Nouveau concept)** :
  - `id`: Identifiant unique de session de table.
  - `tableId`: Table concernée.
  - `status`: `'Ouverte'` | `'Payée'` | `'Clôturée'`.
  - `openedAt` & `closedAt`: Horodatages.
  - `totalAmountFcfa`: Montant cumulé des commandes validées de la table (ex: Commande 1 + Commande 2 = 10 000 FCFA).

---

## 13. Modules & Pages à Créer / Modifier pour la Fonctionnalité QR Code
- **Nouvelle Vue Publique Client (`ClientTableOrderView.tsx`)** :
  - Accessible directement par URL (`/commande/table/:token` ou via paramètre URL `?table_token=...`).
  - Sans téléchargement d'application, sans création de compte, sans login, sans email obligatoire.
  - Affichage mobile-first ultra-rapide (faible bande passante béninoise) : Nom du restaurant, Numéro de table reconnu (ex: `Table T01`), catalogue structuré par catégories avec prix en FCFA, sélection de suppléments, note facultative ("Sans piment", "Sauce à part"), envoi direct de la commande.
- **Composant de Gestion Admin des QR Codes (`TableManagement.tsx`) ** :
  - Affichage et impression de QR code pour chaque table.
  - Option d'impression individuelle ou groupée (A4 avec header "TABLE T01 - Scannez pour commander le menu").
  - Génération de fichier PNG / PDF / impression thermique.
  - Régénération et désactivation temporaire d'un QR code.
- **Composant de Validation des Commandes Client (`OrderManagement.tsx` & `POSRapide.tsx`)** :
  - Badge et notification pour les commandes arrivant du canal `QR_TABLE` avec le statut `'En attente de confirmation'`.
  - Le serveur ou le caissier peut valider la commande en 1 clic (ce qui l'envoie automatiquement en cuisine KDS) ou la refuser/annuler si suspecte.
  - Regroupement des commandes multiples d'une même table pour un règlement unique.

---

## 14. Priorités de Développement
1. **Priorité 1** : Mettre à jour `types.ts` et `initialData.ts` avec la structure QR Code (`publicToken`, `sourceCommande`, `statutConfirmation`, `TableSession`).
2. **Priorité 2** : Créer la page publique de commande client mobile-first pour les QR codes (`/commande/table/:token`).
3. **Priorité 3** : Adapter la gestion des tables avec génération, affichage, impression et gestion des QR codes.
4. **Priorité 4** : Intégrer la validation des commandes QR côté serveur/POS et le cumul des additions par table.
5. **Priorité 5** : Vérifier la conformité FCFA, les performances mobile-first et lancer l'ensemble des contrôles du projet.

---

## 15. Risques de Régression
- **Régression sur le calcul des totaux** : Veiller à ce que l'ajout des suppléments et des frais de livraison n'altère pas le calcul du sous-total et du total FCFA.
- **Régression sur l'état de la caisse** : S'assurer que les ventes annulées ne sont pas comptabilisées dans le solde de caisse fermée.

---

## 16. Plan de Migration Progressif
- **Étape 1** : Présentation et validation de l'audit complet (Phase actuelle).
- **Étape 2** : Présentation de la proposition de base de données / structure de types.
- **Étape 3** : Attente de validation de l'utilisateur.
- **Étape 4** : Réglages fins progressifs par module sans casser la compilation.
