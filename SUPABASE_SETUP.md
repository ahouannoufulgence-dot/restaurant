# Guide de Configuration Supabase - Caisse Restaurant Bénin

Ce document fournit toutes les instructions et les scripts SQL nécessaires pour configurer et vérifier le backend Supabase multi-tenant pour la **Caisse SaaS Restaurant Bénin**.

---

## 1. Variables d'Environnement Nécessaires

Dans votre projet (fichier `.env` ou dans l'interface de gestion de l'application), configurez les clés publiques Supabase suivantes :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

> ⚠️ **Sécurité :** Ne mettez **jamais** la clé `service_role` ou des clés secrètes dans le code côté client (navigateur). Seule la clé `anon` (publique) est utilisée.

---

## 2. Fichier d'Initialisation du Client

Le client Supabase est initialisé de manière sécurisée et paresseuse (lazy initialization) dans `src/lib/supabase.ts` :

- Récupère l'URL et la clé `anon` depuis les variables d'environnement (`import.meta.env.VITE_SUPABASE_URL`) ou le localStorage de secours (`restoflow_supabase_url`).
- Exporte les fonctions `getSupabase()`, `isSupabaseConfigured()`, et `saveSupabaseCredentials()`.

---

## 3. Schéma des Tables Utilisées (PostgreSQL)

Voici les 7 tables principales multi-tenant liées par `restaurant_id` / `organization_id` :

1. **`registered_restaurants`** : Établissements / Tenante principal (nom, type, téléphone, ville, quartier, devise FCFA).
2. **`categories`** : Catégories du menu (Plats principaux, Boissons, Entrées, etc.).
3. **`menu_items`** : Produits / Plats (nom, prix en FCFA, unité, catégorie, image, disponibilité, suppléments).
4. **`restaurant_tables`** : Tables & QR codes (nom/code table, capacité, zone, statut, QR token).
5. **`orders`** : Commandes (type, table, statut, articles, sous-total FCFA, livraison, total, client).
6. **`deliveries`** : Livraisons d'ordres (nom client, téléphone, quartier, adresse, frais FCFA, statut).
7. **`mobile_payments`** : Historique des encaissements (MTN Mobile Money, Moov Money, Espèces, référence).

---

## 4. Script SQL de Création & Politiques RLS (Row Level Security)

Copiez-collez l'ensemble du script ci-dessous directement dans l'**Éditeur SQL de Supabase** (`SQL Editor` -> `New Query` -> `Run`) :

```sql
-- =======================================================
-- CAISSE RESTAURANT BÉNIN - SCHÉMA DE BASE DE DONNÉES SAAS
-- =======================================================

-- 1. Table des Établissements (Restaurants SaaS Multi-Tenant)
CREATE TABLE IF NOT EXISTS registered_restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL DEFAULT 'Cotonou',
  neighborhood TEXT,
  currency TEXT DEFAULT 'FCFA',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Catégories de Menu
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des Plats & Produits (Menu)
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_fcfa NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Portion',
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  popular BOOLEAN DEFAULT false,
  supplements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des Tables du Restaurant & QR Codes
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  seats INT DEFAULT 4,
  zone TEXT DEFAULT 'Main',
  status TEXT DEFAULT 'Libre',
  qr_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table des Commandes
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Sur place',
  table_code TEXT,
  status TEXT NOT NULL DEFAULT 'En attente',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_amount NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'En attente',
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table des Livraisons
CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address_details TEXT,
  delivery_fee_fcfa NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Nouvelle',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table des Paiements Mobile Money & Espèces
CREATE TABLE IF NOT EXISTS mobile_payments (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  operator TEXT NOT NULL, -- 'MTN Mobile Money', 'Moov Money', 'Espèces'
  phone_number TEXT,
  amount_fcfa NUMERIC NOT NULL,
  reference TEXT,
  status TEXT DEFAULT 'Validé',
  cashier_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- POLITIQUES DE SÉCURITÉ RLS (Row Level Security)
-- -------------------------------------------------------

ALTER TABLE registered_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_payments ENABLE ROW LEVEL SECURITY;

-- Politiques Publiques/Anonymes Permissives (Pour Caisse POS & Commandes QR)
CREATE POLICY "Allow public read registered_restaurants" ON registered_restaurants FOR SELECT USING (true);
CREATE POLICY "Allow public insert registered_restaurants" ON registered_restaurants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update registered_restaurants" ON registered_restaurants FOR UPDATE USING (true);

CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public write categories" ON categories FOR ALL USING (true);

CREATE POLICY "Allow public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public write menu_items" ON menu_items FOR ALL USING (true);

CREATE POLICY "Allow public read restaurant_tables" ON restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Allow public write restaurant_tables" ON restaurant_tables FOR ALL USING (true);

CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public write orders" ON orders FOR ALL USING (true);

CREATE POLICY "Allow public read deliveries" ON deliveries FOR SELECT USING (true);
CREATE POLICY "Allow public write deliveries" ON deliveries FOR ALL USING (true);

CREATE POLICY "Allow public read mobile_payments" ON mobile_payments FOR SELECT USING (true);
CREATE POLICY "Allow public write mobile_payments" ON mobile_payments FOR ALL USING (true);
```

---

## 5. Procédure de Test de Connexion

1. Ouvrez l'application web Caisse Restaurant Bénin.
2. Accédez au menu **Configuration** ou **Supabase Backend** dans le panneau d'administration.
3. Entrez l'**URL du projet** et la **Clé Anon** si elles ne sont pas chargées via le `.env`.
4. Cliquez sur **Tester la Connexion**. L'application effectuera un test de lecture/écriture sur `registered_restaurants`.
5. Un badge vert **"Synchro Cloud Active (Supabase)"** s'affichera sur le Tableau de bord et dans la barre de navigation.
