#!/usr/bin/env node
/**
 * Generate vector embeddings for David's RAG.
 *
 * Reads:
 *   - feiyi_knowledge.body_{zh|en|it}
 *   - feiyi_artwork.description_{zh|en|it}
 *   - feiyi_artist.bio_{zh|en|it}
 *
 * For each, splits into ~600-character chunks (paragraph-aware),
 * embeds each chunk via OpenAI text-embedding-3-small (1536 dim),
 * and inserts into feiyi_knowledge_embedding.
 *
 * Idempotent: deletes existing embeddings for each source_id+language pair
 * before re-inserting. Re-run after editing knowledge content.
 *
 * Usage:
 *   1. Copy .env.example → .env.local with real keys
 *   2. node scripts/generate-embeddings.mjs
 *
 * Required env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

// Load .env.local manually
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
} catch (_) {
  // .env.local not present — assume env is already exported
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error('Missing env: need VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const LANGUAGES = ['zh', 'en', 'it'];
const CHUNK_SIZE = 600; // characters
const EMBEDDING_MODEL = 'text-embedding-3-small';

async function embed(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`embed ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

/**
 * Split text into ~600-char chunks, breaking on paragraph boundaries.
 */
function chunkText(text) {
  if (!text) return [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  const chunks = [];
  let current = '';
  for (const p of paragraphs) {
    if ((current + '\n\n' + p).length > CHUNK_SIZE && current) {
      chunks.push(current.trim());
      current = p;
    } else {
      current = current ? current + '\n\n' + p : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // Further split any chunk still too long
  return chunks.flatMap((c) => {
    if (c.length <= CHUNK_SIZE * 1.5) return [c];
    const out = [];
    for (let i = 0; i < c.length; i += CHUNK_SIZE) {
      out.push(c.slice(i, i + CHUNK_SIZE));
    }
    return out;
  });
}

async function ingestSource({ sourceType, sourceId, sourceSlug, language, text }) {
  if (!text || !text.trim()) return 0;

  // Delete existing embeddings for this source+language
  await supabase
    .from('feiyi_knowledge_embedding')
    .delete()
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)
    .eq('language', language);

  const chunks = chunkText(text);
  let inserted = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vec = await embed(chunk);
    const { error } = await supabase.from('feiyi_knowledge_embedding').insert({
      source_type: sourceType,
      source_id: sourceId,
      source_slug: sourceSlug,
      language,
      chunk_text: chunk,
      chunk_index: i,
      embedding: vec,
    });
    if (error) {
      console.error(`  ✗ ${sourceSlug}/${language}#${i}:`, error.message);
    } else {
      inserted++;
    }
    process.stdout.write('.');
  }
  return inserted;
}

async function main() {
  console.log('=== Generating embeddings for David ===\n');

  // Knowledge articles
  console.log('• Knowledge articles');
  const { data: articles } = await supabase
    .from('feiyi_knowledge')
    .select('id, slug, body_zh, body_en, body_it')
    .eq('is_published', true);
  for (const a of articles || []) {
    for (const lang of LANGUAGES) {
      const text = a[`body_${lang}`];
      const n = await ingestSource({
        sourceType: 'knowledge',
        sourceId: a.id,
        sourceSlug: a.slug,
        language: lang,
        text,
      });
      console.log(` ${a.slug}/${lang}: ${n} chunks`);
    }
  }

  // Artworks (description)
  console.log('\n• Artwork descriptions');
  const { data: artworks } = await supabase
    .from('feiyi_artwork')
    .select('id, slug, description_zh, description_en, description_it');
  for (const a of artworks || []) {
    for (const lang of LANGUAGES) {
      const text = a[`description_${lang}`];
      const n = await ingestSource({
        sourceType: 'artwork',
        sourceId: a.id,
        sourceSlug: a.slug,
        language: lang,
        text,
      });
      console.log(` ${a.slug}/${lang}: ${n} chunks`);
    }
  }

  // Artist bio
  console.log('\n• Artist bio');
  const { data: artists } = await supabase
    .from('feiyi_artist')
    .select('id, slug, bio_zh, bio_en, bio_it');
  for (const a of artists || []) {
    for (const lang of LANGUAGES) {
      const text = a[`bio_${lang}`];
      const n = await ingestSource({
        sourceType: 'artist',
        sourceId: a.id,
        sourceSlug: a.slug,
        language: lang,
        text,
      });
      console.log(` ${a.slug}/${lang}: ${n} chunks`);
    }
  }

  console.log('\n✓ Done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
