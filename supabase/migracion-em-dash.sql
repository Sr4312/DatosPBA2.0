-- ============================================================
-- Em dash (U+2014) fuera de la BASE VIVA
-- ============================================================
-- El repo ya quedo limpio (JSX, index.html, postbuild-seo, schema.sql).
-- Falta el contenido que vive en Supabase: titulos, bajadas, insights,
-- cuerpos, fuentes y titulos de visualizacion se renderizan desde la tabla,
-- no desde el codigo, asi que hay que reemplazarlos aca.
--
-- Correr en el SQL editor de Supabase. Es idempotente: se puede repetir.
--
-- PASO 1 (opcional): ver que se va a tocar antes de escribir.
-- PASO 2: el DO block que hace el reemplazo.
-- PASO 3: verificacion, tiene que devolver 0 filas.
-- ============================================================


-- ── PASO 1 · inventario (solo lectura) ───────────────────────
DO $$
DECLARE
  r      RECORD;
  n      bigint;
  total  bigint := 0;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name, c.data_type
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.data_type IN ('text', 'character varying', 'json', 'jsonb')
    ORDER BY c.table_name, c.column_name
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM public.%I WHERE %I::text LIKE %L',
      r.table_name, r.column_name, '%' || chr(8212) || '%'
    ) INTO n;
    IF n > 0 THEN
      RAISE NOTICE '% . % (%): % filas', r.table_name, r.column_name, r.data_type, n;
      total := total + n;
    END IF;
  END LOOP;
  RAISE NOTICE 'TOTAL filas a tocar: %', total;
END $$;


-- ── PASO 2 · reemplazo ───────────────────────────────────────
-- Recorre todas las columnas de texto y json de public y cambia — por -.
-- En json/jsonb se castea a text, se reemplaza y se vuelve a castear: el
-- em dash no es caracter de escape JSON y el guion tampoco, asi que la
-- estructura del documento no se toca.
DO $$
DECLARE
  r    RECORD;
  em   text := chr(8212);
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name, c.data_type
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.data_type IN ('text', 'character varying', 'json', 'jsonb')
      AND c.is_generated = 'NEVER'
      AND c.is_updatable = 'YES'
  LOOP
    IF r.data_type IN ('json', 'jsonb') THEN
      EXECUTE format(
        'UPDATE public.%I SET %I = replace(%I::text, %L, %L)::%s WHERE %I::text LIKE %L',
        r.table_name, r.column_name, r.column_name, em, '-', r.data_type,
        r.column_name, '%' || em || '%'
      );
    ELSE
      EXECUTE format(
        'UPDATE public.%I SET %I = replace(%I, %L, %L) WHERE %I LIKE %L',
        r.table_name, r.column_name, r.column_name, em, '-',
        r.column_name, '%' || em || '%'
      );
    END IF;
  END LOOP;
END $$;


-- ── PASO 3 · verificacion, debe devolver 0 filas ─────────────
DO $$
DECLARE
  r      RECORD;
  n      bigint;
  total  bigint := 0;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.data_type IN ('text', 'character varying', 'json', 'jsonb')
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM public.%I WHERE %I::text LIKE %L',
      r.table_name, r.column_name, '%' || chr(8212) || '%'
    ) INTO n;
    total := total + n;
    IF n > 0 THEN
      RAISE NOTICE 'QUEDA: % . % -> % filas', r.table_name, r.column_name, n;
    END IF;
  END LOOP;
  IF total = 0 THEN
    RAISE NOTICE 'OK: no queda ningun em dash en public.';
  END IF;
END $$;
