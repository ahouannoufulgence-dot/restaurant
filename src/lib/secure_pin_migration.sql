-- ====================================================================
-- MIGRATION SÉCURISÉE V2 : HACHAGE BCRYPT, TYPE UUID & MULTI-MEMBRES
-- ====================================================================

-- 1. Extension pgcrypto pour le hachage Bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Table des PINs hachés (user_id de type UUID pour auth.users(id))
CREATE TABLE IF NOT EXISTS staff_pin_credentials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE staff_pin_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny public staff_pin_credentials" ON staff_pin_credentials;
CREATE POLICY "Deny public staff_pin_credentials" ON staff_pin_credentials FOR ALL USING (false);

-- 3. Table de suivis des tentatives (Rate Limiting anti-brute-force)
CREATE TABLE IF NOT EXISTS pin_auth_attempts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL,
  ip_address TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT false
);

ALTER TABLE pin_auth_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny public pin_auth_attempts" ON pin_auth_attempts;
CREATE POLICY "Deny public pin_auth_attempts" ON pin_auth_attempts FOR ALL USING (false);

-- 4. Fonction Rate Limiting (Bloque après 5 échecs consécutifs en 15 min)
CREATE OR REPLACE FUNCTION check_pin_rate_limit(p_organization_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_failed_count INT;
BEGIN
  SELECT COUNT(*) INTO v_failed_count
  FROM pin_auth_attempts
  WHERE organization_id = p_organization_id
    AND success = false
    AND attempted_at > NOW() - INTERVAL '15 minutes';

  IF v_failed_count >= 5 THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- 5. Fonction de mise à jour du Hash du PIN
CREATE OR REPLACE FUNCTION set_staff_pin_hash(
  p_organization_id TEXT,
  p_user_id UUID,
  p_pin_code TEXT,
  p_role TEXT DEFAULT 'owner'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO staff_pin_credentials (organization_id, user_id, pin_hash, role)
  VALUES (p_organization_id, p_user_id, crypt(p_pin_code, gen_salt('bf')), p_role)
  ON CONFLICT (organization_id, user_id)
  DO UPDATE SET pin_hash = crypt(p_pin_code, gen_salt('bf')), role = EXCLUDED.role;
END;
$$;

-- 6. Fonction multi-membres : Parcourt TOUS les membres du restaurant pour valider le PIN
CREATE OR REPLACE FUNCTION verify_staff_pin(
  p_organization_id TEXT,
  p_pin_code TEXT
)
RETURNS TABLE (user_id UUID, role TEXT, is_valid BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
BEGIN
  -- Boucle sur tous les PINs configurés pour ce restaurant
  FOR r IN 
    SELECT c.user_id, c.role, c.pin_hash
    FROM staff_pin_credentials c
    WHERE c.organization_id = p_organization_id
  LOOP
    -- Comparaison Bcrypt sécurisée
    IF r.pin_hash = crypt(p_pin_code, r.pin_hash) THEN
      RETURN QUERY SELECT r.user_id, r.role, TRUE;
      RETURN; -- Arrêt dès qu'une correspondance est trouvée
    END IF;
  END LOOP;

  -- Aucune correspondance trouvée
  RETURN QUERY SELECT NULL::UUID, NULL::TEXT, FALSE;
END;
$$;
