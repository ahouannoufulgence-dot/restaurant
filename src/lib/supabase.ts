import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client to avoid crash if keys are missing
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseUrl = (): string => {
  return import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('restoflow_supabase_url') || '';
};

export const getSupabaseAnonKey = (): string => {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('restoflow_supabase_anon_key') || '';
};

export const getSupabase = (): SupabaseClient | null => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: { persistSession: true }
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (url) localStorage.setItem('restoflow_supabase_url', url.trim());
  else localStorage.removeItem('restoflow_supabase_url');

  if (key) localStorage.setItem('restoflow_supabase_anon_key', key.trim());
  else localStorage.removeItem('restoflow_supabase_anon_key');

  supabaseInstance = null; // reset instance
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
};

// SQL Schema for Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- =======================================================
-- SCRIPT SQL DE CRÉATION DES TABLES RESTOFLOW BENIN
-- Copiez-collez ce script dans l'Éditeur SQL de Supabase (SQL Editor -> New Query -> Run)
-- =======================================================

-- 1. Table des Établissements (Restaurants SaaS)
CREATE TABLE IF NOT EXISTS registered_restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_phone TEXT,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT,
  ifu_number TEXT,
  pin_code TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Configurations
CREATE TABLE IF NOT EXISTS restaurant_configs (
  restaurant_id TEXT PRIMARY KEY REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  config_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des Catégories de Menu
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table du Menu (Produits)
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  price_fcfa NUMERIC NOT NULL,
  cost_price_fcfa NUMERIC DEFAULT 0,
  description TEXT,
  unit TEXT DEFAULT 'portion',
  is_available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table des Tables & Salles
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  seats INT DEFAULT 4,
  zone TEXT DEFAULT 'Salle principale',
  status TEXT DEFAULT 'Disponible',
  public_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table des Commandes
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  table_code TEXT,
  status TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal_amount NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'En attente',
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table des Stocks
CREATE TABLE IF NOT EXISTS stock_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  min_alert_threshold NUMERIC DEFAULT 5,
  unit_cost_fcfa NUMERIC DEFAULT 0,
  supplier_id TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table des Fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  category TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table des Dépenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_fcfa NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Table des Sessions de Caisse
CREATE TABLE IF NOT EXISTS cash_sessions (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  cashier_name TEXT NOT NULL,
  opening_time TIMESTAMPTZ NOT NULL,
  closing_time TIMESTAMPTZ,
  initial_cash_fcfa NUMERIC NOT NULL,
  final_cash_fcfa NUMERIC,
  expected_cash_fcfa NUMERIC,
  status TEXT DEFAULT 'Ouverte'
);

-- 11. Table des Journaux d'Activité
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVATION DU RLS & RÈGLES D'ACCÈS PUBLIQUES POUR LA DÉMO
ALTER TABLE registered_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all" ON registered_restaurants;
CREATE POLICY "Allow public all" ON registered_restaurants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON restaurant_configs;
CREATE POLICY "Allow public all" ON restaurant_configs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON categories;
CREATE POLICY "Allow public all" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON menu_items;
CREATE POLICY "Allow public all" ON menu_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON restaurant_tables;
CREATE POLICY "Allow public all" ON restaurant_tables FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON orders;
CREATE POLICY "Allow public all" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON stock_items;
CREATE POLICY "Allow public all" ON stock_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON suppliers;
CREATE POLICY "Allow public all" ON suppliers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON expenses;
CREATE POLICY "Allow public all" ON expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON cash_sessions;
CREATE POLICY "Allow public all" ON cash_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all" ON activity_logs;
CREATE POLICY "Allow public all" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
`;

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Supabase non configuré (URL et API Key requises).' };
  }

  try {
    const { data, error } = await supabase.from('registered_restaurants').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: false, 
          message: 'Connecté à Supabase mais la table "registered_restaurants" n\'existe pas encore. Exécutez le script SQL ci-dessous dans votre SQL Editor Supabase.' 
        };
      }
      return { success: false, message: `Erreur Supabase: ${error.message}` };
    }

    return { success: true, message: `Connexion réussie à Supabase ! (${data?.length ?? 0} établissement(s) détecté(s))` };
  } catch (e: any) {
    return { success: false, message: `Erreur de connexion: ${e.message || e}` };
  }
};

