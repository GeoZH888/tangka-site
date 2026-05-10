#!/usr/bin/env node
/**
 * Generate printable QR cards for the gallery walls.
 *
 * Reads all artworks from feiyi_artwork, makes one SVG per work
 * with a QR code pointing to https://david-zhongwen.net/feiyi/tangka/a/{slug}.
 *
 * Output: /qr-cards/{slug}.svg
 *
 * The cards have the trilingual title and "Scan to listen" instruction
 * in three languages — designed for printing at A6 / 105×148mm or
 * scaling up for wall-mounted info plaques.
 *
 * Usage:
 *   node scripts/generate-qr-cards.mjs
 *
 * Required env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SITE_BASE_URL
 */

import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Load .env.local
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
} catch (_) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;
const BASE = process.env.VITE_SITE_BASE_URL || 'https://david-zhongwen.net/feiyi/tangka';

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Missing env: need VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });

// --- Minimal QR code generator (Reed-Solomon, version-auto) -------------
// Using the well-known qrcode-generator library would mean adding a dep;
// instead we shell out to a tiny external utility OR use a CDN-hosted
// service for stable, well-tested codes. For build-time this is fine.
//
// Strategy: use api.qrserver.com — generates SVG QR images server-side.
// (For production sets, replace with offline lib if you want zero net dep.)

async function fetchQrSvg(text) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=svg&margin=0&data=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`QR fetch ${res.status}`);
  return await res.text();
}

function extractQrPaths(svgString) {
  // Extract just the inner content of the QR SVG (paths/rects) so we can
  // embed them in our card SVG with our own viewBox + styling.
  const match = svgString.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  return match ? match[1] : '';
}

function escapeXml(s) {
  return String(s || '').replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));
}

function buildCard({ work, qrInner }) {
  const title_zh = escapeXml(work.title_zh || '');
  const title_en = escapeXml(work.title_en || '');
  const title_it = escapeXml(work.title_it || '');
  const url = `${BASE}/a/${work.slug}`;
  const dimensions = escapeXml(work.dimensions || '');
  const year = work.year || '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 600" width="420" height="600" font-family="'Cormorant Garamond', 'Noto Serif SC', serif">
  <!-- Card background — parchment -->
  <rect width="420" height="600" fill="#f5ede0"/>

  <!-- Subtle border -->
  <rect x="12" y="12" width="396" height="576" fill="none" stroke="#b8862c" stroke-width="0.7" opacity="0.6"/>
  <rect x="20" y="20" width="380" height="560" fill="none" stroke="#b8862c" stroke-width="0.3" opacity="0.4"/>

  <!-- Top: exhibition wordmark -->
  <text x="210" y="58" text-anchor="middle" font-size="14" letter-spacing="3" font-style="italic" fill="#8a6418">SACRED MEASURES</text>
  <text x="210" y="80" text-anchor="middle" font-family="'Noto Serif SC', serif" font-size="18" letter-spacing="6" fill="#1a1410">度 量 之 间</text>

  <!-- Gold rule -->
  <line x1="120" y1="100" x2="180" y2="100" stroke="#b8862c" stroke-width="0.7"/>
  <line x1="240" y1="100" x2="300" y2="100" stroke="#b8862c" stroke-width="0.7"/>
  <path d="M 200 95 L 210 100 L 220 105 L 210 100 Z M 200 105 L 210 100 L 220 95 L 210 100 Z" fill="#b8862c"/>
  <circle cx="210" cy="100" r="2" fill="#b8862c"/>

  <!-- Year -->
  <text x="210" y="138" text-anchor="middle" font-size="13" letter-spacing="3" font-style="italic" fill="#8a6418">${year}</text>

  <!-- Title — Chinese, English, Italian -->
  <text x="210" y="168" text-anchor="middle" font-family="'Noto Serif SC', serif" font-size="22" letter-spacing="2" fill="#1a1410">${title_zh}</text>
  <text x="210" y="198" text-anchor="middle" font-size="17" font-style="italic" fill="#1a1410">${title_en}</text>
  <text x="210" y="222" text-anchor="middle" font-size="14" font-style="italic" fill="#9c1e2e">${title_it}</text>

  <!-- Dimensions -->
  <text x="210" y="252" text-anchor="middle" font-size="11" letter-spacing="2" fill="#8a6418">${dimensions}</text>

  <!-- QR code — embedded -->
  <g transform="translate(110 285)">
    <rect width="200" height="200" fill="#f5ede0" stroke="#b8862c" stroke-width="0.5" opacity="0.4"/>
    <svg x="10" y="10" width="180" height="180" viewBox="0 0 300 300">${qrInner}</svg>
  </g>

  <!-- Scan instruction — three languages -->
  <text x="210" y="520" text-anchor="middle" font-family="'Noto Serif SC', serif" font-size="13" letter-spacing="3" fill="#1a1410">扫码聆听讲解</text>
  <text x="210" y="540" text-anchor="middle" font-size="12" font-style="italic" letter-spacing="2" fill="#1a1410">Scan to listen to the audio guide</text>
  <text x="210" y="558" text-anchor="middle" font-size="11" font-style="italic" letter-spacing="1.5" fill="#9c1e2e">Inquadra per ascoltare l’audioguida</text>

  <!-- URL -->
  <text x="210" y="582" text-anchor="middle" font-size="8" letter-spacing="1" fill="#8a6418" opacity="0.7">${escapeXml(url)}</text>
</svg>`;
}

async function main() {
  console.log('=== Generating QR cards ===\n');

  const { data: works, error } = await supabase
    .from('feiyi_artwork_public')
    .select('id, slug, title_zh, title_en, title_it, year, dimensions');
  if (error) {
    console.error(error);
    process.exit(1);
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(here, '..', 'qr-cards');
  mkdirSync(outDir, { recursive: true });

  for (const work of works) {
    const url = `${BASE}/a/${work.slug}`;
    console.log(`• ${work.slug} → ${url}`);
    try {
      const qrSvg = await fetchQrSvg(url);
      const qrInner = extractQrPaths(qrSvg);
      const card = buildCard({ work, qrInner });
      const path = resolve(outDir, `${work.slug}.svg`);
      writeFileSync(path, card, 'utf8');
      console.log(`  → ${path}`);
    } catch (e) {
      console.error(`  ✗ ${e.message}`);
    }
  }

  console.log(`\n✓ Done. Cards written to ${outDir}/`);
  console.log('Open them in any browser or vector tool to print at A6 (105×148mm).');
}

main().catch((e) => { console.error(e); process.exit(1); });
