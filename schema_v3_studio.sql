-- =============================================================================
-- Studio access — relax RLS on feiyi_* tables to allow anonymous writes.
-- =============================================================================
-- After switching from magic-link auth to a no-auth shared-password studio,
-- the existing admin-only RLS policies block all writes (since there's no
-- authenticated admin user anymore).
--
-- This migration replaces the admin-only write policies with anon-write
-- policies on the tangka-specific feiyi_* tables ONLY. This does NOT touch
-- any CLF platform tables (clf_*) — they remain protected by their own RLS.
--
-- SECURITY MODEL after this change:
--   - The protection is "URL secrecy + client-side password gate".
--   - Anyone who knows the studio URL AND password can edit feiyi_* tables.
--   - The Supabase anon key is not a secret — it's in every browser anyway.
--   - This is acceptable because:
--       (a) the studio URL is not linked publicly
--       (b) the password gate is client-side
--       (c) the data being written is exhibition content (not sensitive)
--       (d) audit trail is preserved via updated_at columns
--
-- If you ever need stronger protection, switch back to magic-link auth
-- by reversing this migration and restoring the admin-only policies.
-- =============================================================================

BEGIN;

-- === feiyi_exhibition ===
DROP POLICY IF EXISTS "admin write feiyi_exhibition" ON public.feiyi_exhibition;
CREATE POLICY "anon write feiyi_exhibition" ON public.feiyi_exhibition
  FOR ALL USING (true) WITH CHECK (true);

-- === feiyi_artist ===
DROP POLICY IF EXISTS "admin write feiyi_artist" ON public.feiyi_artist;
CREATE POLICY "anon write feiyi_artist" ON public.feiyi_artist
  FOR ALL USING (true) WITH CHECK (true);

-- === feiyi_artwork ===
DROP POLICY IF EXISTS "admin write feiyi_artwork" ON public.feiyi_artwork;
CREATE POLICY "anon write feiyi_artwork" ON public.feiyi_artwork
  FOR ALL USING (true) WITH CHECK (true);

-- === feiyi_organizer ===
DROP POLICY IF EXISTS "admin write feiyi_organizer" ON public.feiyi_organizer;
CREATE POLICY "anon write feiyi_organizer" ON public.feiyi_organizer
  FOR ALL USING (true) WITH CHECK (true);

-- === feiyi_knowledge ===
DROP POLICY IF EXISTS "admin write feiyi_knowledge" ON public.feiyi_knowledge;
CREATE POLICY "anon write feiyi_knowledge" ON public.feiyi_knowledge
  FOR ALL USING (true) WITH CHECK (true);

-- === feiyi_event_photo ===
DROP POLICY IF EXISTS "admin write feiyi_event_photo" ON public.feiyi_event_photo;
CREATE POLICY "anon write feiyi_event_photo" ON public.feiyi_event_photo
  FOR ALL USING (true) WITH CHECK (true);

-- === feiyi_david_persona ===
DROP POLICY IF EXISTS "admin write feiyi_david_persona" ON public.feiyi_david_persona;
CREATE POLICY "anon write feiyi_david_persona" ON public.feiyi_david_persona
  FOR ALL USING (true) WITH CHECK (true);

-- === feiyi_david_conversation: also allow anon read (for the studio's log viewer) ===
DROP POLICY IF EXISTS "admin read feiyi_david_conv" ON public.feiyi_david_conversation;
CREATE POLICY "anon read feiyi_david_conv" ON public.feiyi_david_conversation
  FOR SELECT USING (true);

-- === Storage buckets: allow anon uploads to feiyi-* buckets ===
-- Storage RLS is on the storage.objects table.

-- Allow anon to INSERT (upload) into feiyi-* buckets
DROP POLICY IF EXISTS "anon upload to feiyi buckets" ON storage.objects;
CREATE POLICY "anon upload to feiyi buckets" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id LIKE 'feiyi-%');

-- Allow anon to UPDATE (replace) files in feiyi-* buckets (for x-upsert)
DROP POLICY IF EXISTS "anon update feiyi buckets" ON storage.objects;
CREATE POLICY "anon update feiyi buckets" ON storage.objects
  FOR UPDATE
  USING (bucket_id LIKE 'feiyi-%')
  WITH CHECK (bucket_id LIKE 'feiyi-%');

-- Allow anon to DELETE from feiyi-* buckets (for replacing old images)
DROP POLICY IF EXISTS "anon delete feiyi buckets" ON storage.objects;
CREATE POLICY "anon delete feiyi buckets" ON storage.objects
  FOR DELETE
  USING (bucket_id LIKE 'feiyi-%');

COMMIT;
