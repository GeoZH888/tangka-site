import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Don't throw — let the UI gracefully fall back. But warn in dev.
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Copy .env.example to .env.local and fill in the CLF project credentials.'
  );
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key',
  {
    auth: {
      // Persist session in localStorage (admin login)
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Convenience helper: the slug of the exhibition this site is showing
export const EXHIBITION_SLUG =
  import.meta.env.VITE_EXHIBITION_SLUG || 'sacred-measures-2026';

// Canonical site URL — used for QR codes, sharing, etc.
export const SITE_BASE_URL =
  import.meta.env.VITE_SITE_BASE_URL ||
  'https://david-zhongwen.net/feiyi/tangka';

/**
 * Fetch the active exhibition row.
 */
export async function fetchExhibition() {
  const { data, error } = await supabase
    .from('feiyi_exhibition')
    .select('*')
    .eq('slug', EXHIBITION_SLUG)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Fetch all artworks for this exhibition, joined with artist info.
 */
export async function fetchArtworks() {
  const { data, error } = await supabase
    .from('feiyi_artwork_public')
    .select('*')
    .eq('exhibition_slug', EXHIBITION_SLUG)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single artwork by slug.
 */
export async function fetchArtwork(slug) {
  const { data, error } = await supabase
    .from('feiyi_artwork_public')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Fetch the artist for this exhibition.
 */
export async function fetchArtist() {
  const { data, error } = await supabase
    .from('feiyi_artist')
    .select('*')
    .eq('slug', 'sangji-cairang')
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Fetch published knowledge articles (the "About Thangka" section).
 */
export async function fetchKnowledgeList() {
  const { data, error } = await supabase
    .from('feiyi_knowledge_public')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single knowledge article by slug — full body, all languages.
 */
export async function fetchKnowledgeArticle(slug) {
  const { data, error } = await supabase
    .from('feiyi_knowledge')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Fetch organizers / sponsors for this exhibition.
 */
export async function fetchOrganizers(exhibitionId) {
  if (!exhibitionId) return [];
  const { data, error } = await supabase
    .from('feiyi_organizer_public')
    .select('*')
    .eq('exhibition_id', exhibitionId);
  if (error) throw error;
  return data || [];
}

/**
 * Fetch David's persona (greetings, fallback, refusal text).
 */
export async function fetchDavidPersona() {
  const { data, error } = await supabase
    .from('feiyi_david_persona')
    .select('greeting_zh, greeting_en, greeting_it, fallback_zh, fallback_en, fallback_it')
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Log a QR scan / audio play for analytics.
 */
export async function logAudioGuideView({
  artworkId,
  artworkSlug,
  exhibitionId,
  language,
  source = 'qr',
}) {
  // Hash the user agent privately — never store raw UA
  const ua = navigator.userAgent || '';
  const buf = new TextEncoder().encode(ua);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  const hash = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const { error } = await supabase.from('feiyi_audio_guide_view').insert({
    artwork_id: artworkId,
    artwork_slug: artworkSlug,
    exhibition_id: exhibitionId,
    language,
    source,
    user_agent_hash: hash,
  });
  // Best-effort logging — never throw to UI
  if (error) console.warn('[analytics]', error.message);
}
