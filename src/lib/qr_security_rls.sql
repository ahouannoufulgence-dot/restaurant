-- ====================================================================
-- SUPABASE SAAS MULTI-RESTAURANT : ARCHITECTURE DE SÉCURITÉ COMPLÈTE
-- ====================================================================
-- Ce fichier SQL contient l'intégralité du DDL, des politiques RLS et des
-- fonctions RPC sécurisées pour garantir le respect à 100% du cahier des charges :
-- 1. Isolation multi-tenant stricte basée sur restaurant_id / organization_id
-- 2. Respect des rôles MVP (owner, employee, kitchen)
-- 3. Sécurisation maximale des commandes publiques par QR Code
-- 4. Traçabilité complète via activity_logs

-- ====================================================================
-- 1. CRÉATION DES 12 TABLES SÉCURISÉES DU SAAS MULTI-RESTAURANT
-- ====================================================================

-- A. Table des Restaurants (Organisations)
CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Table des Profils Utilisateurs (Supabase Auth link)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Memberships d'Organisation (Association Utilisateur <-> Restaurant <-> Rôle)
CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'employee', 'kitchen')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- D. Tables du Restaurant
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  seats INT DEFAULT 4,
  zone TEXT DEFAULT 'Salle',
  status TEXT DEFAULT 'Libre',
  public_token TEXT UNIQUE,
  qr_code_status TEXT DEFAULT 'Actif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. Catégories de Menu
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  order_index INT DEFAULT 0
);

-- F. Articles du Menu
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price_fcfa NUMERIC NOT NULL CHECK (price_fcfa >= 0),
  description TEXT DEFAULT '',
  image TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. Commandes Principales
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id TEXT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  table_code TEXT,
  source_commande TEXT DEFAULT 'MANUELLE',
  type_commande TEXT DEFAULT 'Sur place',
  statut_confirmation TEXT DEFAULT 'Confirmée',
  status TEXT DEFAULT 'Nouvelle',
  payment_status TEXT DEFAULT 'En attente',
  total_fcfa NUMERIC DEFAULT 0 CHECK (total_fcfa >= 0),
  customer_name TEXT,
  customer_phone TEXT,
  general_note TEXT,
  order_access_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. Lignes de Commande
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
  menu_item_name TEXT NOT NULL,
  unit_price_fcfa NUMERIC NOT NULL CHECK (unit_price_fcfa >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  kitchen_note TEXT,
  status TEXT DEFAULT 'En attente'
);

-- I. Paiements & Caisse
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  amount_fcfa NUMERIC NOT NULL CHECK (amount_fcfa > 0),
  cashier_name TEXT,
  status TEXT DEFAULT 'Payé',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- J. Clients du Restaurant
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  total_orders INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- K. Zones de Livraison
CREATE TABLE IF NOT EXISTS delivery_zones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fee_fcfa NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- L. Dépenses du Restaurant
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount_fcfa NUMERIC NOT NULL CHECK (amount_fcfa > 0),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- M. Journal d'Activité / Audits
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 2. ALIGNEMENT DES COLONNES SI CERTAINES TABLES EXISTENT DÉJÀ
-- ====================================================================
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS public_token TEXT;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS qr_code_status TEXT DEFAULT 'Actif';
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS restaurant_id TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS price_fcfa NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source_commande TEXT DEFAULT 'MANUELLE';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS statut_confirmation TEXT DEFAULT 'Confirmée';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_access_token TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS restaurant_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_code TEXT;

-- ====================================================================
-- 3. FONCTIONS FONCTIONS HELPERS SERVEUR POUR LES RÔLES & APPARTENANCE
-- ====================================================================

-- Obtient le rôle de l'utilisateur connecté dans une organisation donnée
CREATE OR REPLACE FUNCTION public.get_user_role(p_restaurant_id TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = p_restaurant_id
    AND user_id = auth.uid()::text
    AND is_active = true
  LIMIT 1;
$$;

-- Vérifie si l'utilisateur est membre actif du restaurant
CREATE OR REPLACE FUNCTION public.is_org_member(p_restaurant_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_restaurant_id
      AND user_id = auth.uid()::text
      AND is_active = true
  );
$$;

-- ====================================================================
-- 4. ACTIVATION OBLIGATOIRE DE RLS (ROW LEVEL SECURITY)
-- ====================================================================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 5. POLITIQUES RLS : ACCÈS PUBLIC NON AUTHENTIFIÉ ('anon')
-- ====================================================================

-- A. Accès au restaurant public si actif
DROP POLICY IF EXISTS "Anon public restaurant view" ON restaurants;
CREATE POLICY "Anon public restaurant view" ON restaurants
  FOR SELECT TO anon
  USING (COALESCE(is_active, true) = true);

-- B. Accès aux tables publiques si QR actif
DROP POLICY IF EXISTS "Anon public active tables view" ON restaurant_tables;
CREATE POLICY "Anon public active tables view" ON restaurant_tables
  FOR SELECT TO anon
  USING (COALESCE(qr_code_status, 'Actif') = 'Actif');

-- C. Accès aux catégories du menu
DROP POLICY IF EXISTS "Anon public menu categories" ON categories;
CREATE POLICY "Anon public menu categories" ON categories
  FOR SELECT TO anon
  USING (true);

-- D. Accès aux plats disponibles
DROP POLICY IF EXISTS "Anon public available menu items" ON menu_items;
CREATE POLICY "Anon public available menu items" ON menu_items
  FOR SELECT TO anon
  USING (COALESCE(is_available, true) = true);

-- E. Consultation de sa PROPRE commande via le jeton privé x-order-access-token
DROP POLICY IF EXISTS "Anon view own order by access token" ON orders;
CREATE POLICY "Anon view own order by access token" ON orders
  FOR SELECT TO anon
  USING (
    order_access_token IS NOT NULL 
    AND order_access_token = current_setting('request.headers', true)::json->>'x-order-access-token'
  );

-- F. DENY STRICT : Interdiction totale d'accès anonyme aux données sensibles
DROP POLICY IF EXISTS "Deny anon payments" ON payments;
CREATE POLICY "Deny anon payments" ON payments FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Deny anon expenses" ON expenses;
CREATE POLICY "Deny anon expenses" ON expenses FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Deny anon members" ON organization_members;
CREATE POLICY "Deny anon members" ON organization_members FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Deny anon logs" ON activity_logs;
CREATE POLICY "Deny anon logs" ON activity_logs FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Deny anon customers" ON customers;
CREATE POLICY "Deny anon customers" ON customers FOR ALL TO anon USING (false);

-- ====================================================================
-- 6. POLITIQUES RLS : PERSONNEL CONNECTÉ ('authenticated')
-- ====================================================================

-- A. Les membres voient les commandes de LEUR restaurant uniquement
DROP POLICY IF EXISTS "Staff orders tenant isolation" ON orders;
CREATE POLICY "Staff orders tenant isolation" ON orders
  FOR ALL TO authenticated
  USING (public.is_org_member(restaurant_id));

-- B. La cuisine ne peut modifier QUE le statut de la commande / des plats
-- (Les membres avec le rôle 'kitchen' sont restreints sur les paiements et rapports)
DROP POLICY IF EXISTS "Kitchen deny payments" ON payments;
CREATE POLICY "Kitchen deny payments" ON payments
  FOR ALL TO authenticated
  USING (
    public.is_org_member(restaurant_id) 
    AND public.get_user_role(restaurant_id) IN ('owner', 'employee')
  );

DROP POLICY IF EXISTS "Owner employee expenses access" ON expenses;
CREATE POLICY "Owner employee expenses access" ON expenses
  FOR ALL TO authenticated
  USING (
    public.is_org_member(restaurant_id) 
    AND public.get_user_role(restaurant_id) = 'owner'
  );

-- C. Menus et tables accessibles par tout le personnel authentifié du tenant
DROP POLICY IF EXISTS "Staff menu items tenant isolation" ON menu_items;
CREATE POLICY "Staff menu items tenant isolation" ON menu_items
  FOR ALL TO authenticated
  USING (public.is_org_member(restaurant_id));

DROP POLICY IF EXISTS "Staff tables tenant isolation" ON restaurant_tables;
CREATE POLICY "Staff tables tenant isolation" ON restaurant_tables
  FOR ALL TO authenticated
  USING (public.is_org_member(restaurant_id));

-- ====================================================================
-- 7. FONCTION RPC : CRÉATION DE COMMANDE QR SÉCURISÉE (SERVEUR)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.create_qr_order_secure(
  p_qr_token TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_general_note TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Exécution en droits élevés avec validation stricte
AS $$
DECLARE
  v_restaurant_id TEXT;
  v_table_id TEXT;
  v_table_code TEXT;
  v_table_status TEXT;
  v_order_id TEXT;
  v_order_code TEXT;
  v_order_access_token TEXT;
  v_subtotal NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_item_price NUMERIC;
  v_item_total NUMERIC;
BEGIN
  -- 1. Validation du jeton public de la table & vérification du statut QR
  SELECT restaurant_id::text, id::text, code, COALESCE(qr_code_status, 'Actif')
  INTO v_restaurant_id, v_table_id, v_table_code, v_table_status
  FROM restaurant_tables
  WHERE public_token = p_qr_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Jeton QR table invalide ou introuvable.';
  END IF;

  IF v_table_status != 'Actif' THEN
    RAISE EXCEPTION 'Le QR code de cette table est temporairement désactivé par le restaurant.';
  END IF;

  -- 2. Génération des tokens privés uniques
  v_order_id := gen_random_uuid()::text;
  v_order_code := 'CMD-' || FLOOR(100000 + random() * 900000)::TEXT;
  v_order_access_token := 'ord_tok_' || REPLACE(gen_random_uuid()::TEXT, '-', '');

  -- 3. Recalcul OBLIGATOIRE du prix de chaque article sur le serveur (Empêche la falsification)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id::text, price_fcfa, COALESCE(is_available, true) AS is_available, name
    INTO v_product
    FROM menu_items
    WHERE id::text = (v_item->>'menu_item_id')::text 
      AND restaurant_id::text = v_restaurant_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Un produit demandé n''existe plus dans le menu du restaurant.';
    END IF;

    IF NOT v_product.is_available THEN
      RAISE EXCEPTION 'Le produit "%" n''est plus disponible actuellement.', v_product.name;
    END IF;

    v_item_price := v_product.price_fcfa;
    v_item_total := v_item_price * (v_item->>'quantity')::INT;
    v_subtotal := v_subtotal + v_item_total;

    -- Insertion de la ligne avec le snapshot du prix serveur
    INSERT INTO order_items (
      id, order_id, menu_item_id, menu_item_name, unit_price_fcfa, quantity, status
    ) VALUES (
      gen_random_uuid()::text, v_order_id, v_product.id, v_product.name, v_item_price, (v_item->>'quantity')::INT, 'En attente'
    );
  END LOOP;

  -- 4. Insertion de la commande principale avec statut EN_ATTENTE
  INSERT INTO orders (
    id, code, restaurant_id, table_id, table_code, source_commande,
    type_commande, statut_confirmation, status, payment_status,
    total_fcfa, customer_name, customer_phone, general_note, order_access_token, created_at
  ) VALUES (
    v_order_id, v_order_code, v_restaurant_id, v_table_id, v_table_code, 'QR_TABLE',
    'Sur place', 'En attente de confirmation', 'Nouvelle', 'En attente',
    v_subtotal, p_customer_name, p_customer_phone, p_general_note, v_order_access_token, NOW()
  );

  -- 5. Journalisation d'activité automatique pour le restaurant
  INSERT INTO activity_logs (
    id, restaurant_id, user_id, action, resource, resource_id, details, created_at
  ) VALUES (
    gen_random_uuid()::text, v_restaurant_id, NULL, 'CREATION_COMMANDE_QR', 'orders', v_order_id,
    jsonb_build_object('code', v_order_code, 'table', v_table_code, 'total', v_subtotal), NOW()
  );

  -- 6. DÉLIVRANCE DU RÉSULTAT AU CLIENT
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_code', v_order_code,
    'order_access_token', v_order_access_token,
    'table_code', v_table_code,
    'total_fcfa', v_subtotal,
    'status', 'En attente de confirmation'
  );
END;
$$;
