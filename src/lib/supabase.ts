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
export const SUPABASE_SQL_SCHEMA = `-- SQL Schema for RestoFlow Benin (Supabase)
-- Exécutez ce script dans le "SQL Editor" de votre projet Supabase

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

-- 3. Table des Commandes
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  table_number TEXT,
  order_type TEXT NOT NULL,
  status TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des Menus
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES registered_restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  price_fcfa NUMERIC NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer le RLS ou autoriser la lecture/écriture publique temporairement pour la démo
ALTER TABLE registered_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select/insert" ON registered_restaurants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public select/insert" ON restaurant_configs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public select/insert" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public select/insert" ON menu_items FOR ALL USING (true) WITH CHECK (true);
`;
