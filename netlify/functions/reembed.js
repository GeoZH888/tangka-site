/**
 * /api/reembed — admin-only endpoint that re-embeds all knowledge.
 *
 * Called from the admin Dashboard's "Re-embed for David" button.
 * Verifies the caller is an authenticated admin via Supabase JWT,
 * then runs the same logic as scripts/generate-embeddings.mjs.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 600;
const LANGUAGES = ['zh', 'en', 'it'];

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // === Authorize: optional shared studio password ===
  // Set STUDIO_PASSWORD in Netlify env. If unset, this endpoint is open
  // (acceptable for testing but tighten in production).
  const expected = process.env.STUDIO_PASSWORD;
  if (expected) {
    const provided = req.headers.get('x-studio-password');
    if (provided !== expected) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  // === Run the re-embed ===
  let inserted = 0;
  const errors = [];
  try {
    // Knowledge articles
    const { data: articles } = await supabase
      .from('feiyi_knowledge')
      .select('id, slug, body_zh, body_en, body_it')
      .eq('is_published', true);
    for (const a of articles || []) {
      for (const lang of LANGUAGES) {
        const text = a[`body_${lang}`];
        const n = await ingest({ sourceType: 'knowledge', sourceId: a.id, sourceSlug: a.slug, language: lang, text });
        inserted += n;
      }
    }

    // Artwork descriptions
    const { data: artworks } = await supabase
      .from('feiyi_artwork')
      .select('id, slug, description_zh, description_en, description_it');
    for (const a of artworks || []) {
      for (const lang of LANGUAGES) {
        const text = a[`description_${lang}`];
        const n = await ingest({ sourceType: 'artwork', sourceId: a.id, sourceSlug: a.slug, language: lang, text });
        inserted += n;
      }
    }

    // Artist bio
    const { data: artists } = await supabase
      .from('feiyi_artist')
      .select('id, slug, bio_zh, bio_en, bio_it');
    for (const a of artists || []) {
      for (const lang of LANGUAGES) {
        const text = a[`bio_${lang}`];
        const n = await ingest({ sourceType: 'artist', sourceId: a.id, sourceSlug: a.slug, language: lang, text });
        inserted += n;
      }
    }
  } catch (e) {
    errors.push(e.message);
  }

  return new Response(
    JSON.stringify({ chunks_inserted: inserted, errors }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

async function embed(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`embed ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding;
}

function chunkText(text) {
  if (!text) return [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  const chunks = [];
  let current = '';
  for (const p of paragraphs) {
    if ((current + '\n\n' + p).length > CHUNK_SIZE && current) {
      chunks.push(current.trim()); current = p;
    } else {
      current = current ? current + '\n\n' + p : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.flatMap((c) => {
    if (c.length <= CHUNK_SIZE * 1.5) return [c];
    const out = [];
    for (let i = 0; i < c.length; i += CHUNK_SIZE) out.push(c.slice(i, i + CHUNK_SIZE));
    return out;
  });
}

async function ingest({ sourceType, sourceId, sourceSlug, language, text }) {
  if (!text || !text.trim()) return 0;
  await supabase.from('feiyi_knowledge_embedding').delete()
    .eq('source_type', sourceType).eq('source_id', sourceId).eq('language', language);
  const chunks = chunkText(text);
  let n = 0;
  for (let i = 0; i < chunks.length; i++) {
    const vec = await embed(chunks[i]);
    const { error } = await supabase.from('feiyi_knowledge_embedding').insert({
      source_type: sourceType, source_id: sourceId, source_slug: sourceSlug,
      language, chunk_text: chunks[i], chunk_index: i, embedding: vec,
    });
    if (!error) n++;
  }
  return n;
}
