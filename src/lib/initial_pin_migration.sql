-- ====================================================================
-- SCRIPT DE MIGRATION INITIALE UNIQUE DES PINS POUR RESTAURANTS EXISTANTS
-- ====================================================================
-- Exécutez ce script UNE SEULE FOIS dans le SQL Editor de Supabase pour
-- migrer tous les établissements de `registered_restaurants` vers le nouveau
-- système d'authentification PIN sécurisé avec comptes Supabase Auth.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  r RECORD;
  v_user_id UUID;
  v_email TEXT;
  v_resto_id TEXT;
  v_pin TEXT;
BEGIN
  -- Boucle sur tous les restaurants enregistrés dans l'ancien système
  FOR r IN 
    SELECT 
      id, 
      name, 
      COALESCE(pin_code, '1234') as pin_code 
    FROM registered_restaurants
  LOOP
    v_resto_id := r.id;
    v_pin := r.pin_code;
    v_email := 'staff_' || v_resto_id || '@restoflow.internal';

    -- 1. S'assurer que le restaurant existe dans la table canonique `restaurants`
    INSERT INTO public.restaurants (id, name, is_active)
    VALUES (v_resto_id, r.name, true)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    -- 2. Vérifier si un compte auth.users existe déjà pour cet email
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

    -- 3. Si l'utilisateur n'existe pas encore dans auth.users, le créer en SQL (Exécution avec rôle postgres)
    IF v_user_id IS NULL THEN
      v_user_id := gen_random_uuid();
      
      INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        v_email,
        crypt(crypto.randomUUID()::text, gen_salt('bf')), -- Mot de passe aléatoire inutilisable
        NOW(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        jsonb_build_object('restaurant_id', v_resto_id, 'role', 'owner'),
        NOW(),
        NOW()
      );
    END IF;

    -- 4. Associer la qualité de membre dans `organization_members`
    INSERT INTO public.organization_members (organization_id, user_id, role, is_active)
    VALUES (v_resto_id, v_user_id::text, 'owner', true)
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- 5. Insérer ou mettre à jour le Hash Bcrypt du PIN dans `staff_pin_credentials`
    INSERT INTO public.staff_pin_credentials (organization_id, user_id, pin_hash, role)
    VALUES (v_resto_id, v_user_id, crypt(v_pin, gen_salt('bf')), 'owner')
    ON CONFLICT (organization_id, user_id) 
    DO UPDATE SET pin_hash = crypt(v_pin, gen_salt('bf')), role = 'owner';

    RAISE NOTICE 'Restaurant % (%) migré avec succès avec user_id = %', r.name, v_resto_id, v_user_id;
  END LOOP;
END;
$$;
