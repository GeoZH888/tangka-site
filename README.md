# 度量之间 · Sacred Measures · Tra le Misure Sacre

**Sangji Cairang Thangka Exhibition · Florence 2026**

A trilingual (中文 / English / Italiano) exhibition site with:
- 19-artwork digital catalogue
- QR-coded audio guide (one URL per artwork)
- Knowledge articles on thangka history, technique, iconography, lineage
- **David** — an AI-powered art apprentice guide using RAG over the exhibition's own knowledge base
- Admin panel (Phase 2) for content management

Live at `https://david-zhongwen.net/feiyi/tangka` (proxied to `tangka.netlify.app`).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  david-zhongwen.net  (existing site, Netlify)                   │
│    └── /feiyi/tangka/*  →  proxy to tangka.netlify.app          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  tangka.netlify.app  (this repo)                                 │
│    ├── Vite + React 18 + React Router                           │
│    ├── Public pages: home, gallery, /work/:slug, /a/:slug       │
│    │                  knowledge, artist, visit                  │
│    ├── Admin (Phase 2): /admin/*                                │
│    └── Netlify Function: /api/david  (RAG → Claude Haiku)       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase (CLF project: yqcojudvvjntaajnrilr)                    │
│    ├── feiyi_exhibition / artist / artwork  (v1)                │
│    ├── feiyi_knowledge + embeddings (pgvector)                  │
│    ├── feiyi_organizer / event_photo                            │
│    ├── feiyi_david_persona / conversation                       │
│    ├── feiyi_audio_guide_view  (analytics)                      │
│    └── Storage: feiyi-images / audio / portraits / ...          │
└─────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼                             ▼
        ┌───────────────┐             ┌───────────────┐
        │ OpenAI         │             │ Anthropic     │
        │ embeddings     │             │ Claude Haiku  │
        │ (1536-dim)     │             │ 4.5           │
        └───────────────┘             └───────────────┘
```

---

## Tech stack

| Layer        | Tech |
|--------------|------|
| Frontend     | Vite 5, React 18, React Router 6 |
| Styling      | CSS modules (no framework — manuscript-style hand-written) |
| Backend      | Supabase (Postgres + pgvector + RLS + Storage + Auth) |
| AI           | Anthropic Claude Haiku 4.5 (chat) + OpenAI text-embedding-3-small (RAG) |
| Hosting      | Netlify (this site) + Netlify (proxy on david-zhongwen.net) |
| QR codes     | qrcode.react (in-page) + api.qrserver.com (build-time print cards) |

---

## Files

| Path                                       | Purpose |
|--------------------------------------------|---------|
| `schema.sql`                               | v1 schema — exhibition, artist, artwork tables. Run once. |
| `schema_v2.sql`                            | v2 schema — knowledge, embeddings, David persona, RLS. Run once after v1. |
| `package.json`                             | npm deps |
| `vite.config.js`                           | base path `/feiyi/tangka/` for the proxy |
| `netlify.toml`                             | SPA fallback + functions config |
| `index.html`                               | Vite entry, font preload |
| `src/main.jsx`                             | React entry with router |
| `src/App.jsx`                              | Routes |
| `src/lib/supabase.js`                      | Supabase client + fetch helpers |
| `src/lib/i18n.jsx`                         | Trilingual context, language detection, UI strings |
| `src/lib/design.js`                        | Mineral palette tokens |
| `src/styles/global.css`                    | Design tokens, manuscript-page styles |
| `src/components/Nav.{jsx,css}`             | Top navigation |
| `src/components/LangSwitcher.jsx`          | 中 / EN / IT pill |
| `src/components/Footer.{jsx,css}`          | Site footer |
| `src/components/ManuscriptMark.jsx`        | The illuminated emblem (mandala + golden ratio) |
| `src/components/Ornaments.jsx`             | Corner ornaments, horizontal rules, drop caps |
| `src/components/DavidSvg.jsx`              | David character SVG (4 poses) |
| `src/components/David.{jsx,css}`           | Floating button + chat panel |
| `src/pages/public/HomePage.{jsx,css}`      | Manuscript-style hero |
| `src/pages/public/GalleryPage.{jsx,css}`   | All works grid |
| `src/pages/public/ArtworkPage.{jsx,css}`   | /work/:slug — full detail + QR + audio |
| `src/pages/public/AudioGuidePage.{jsx,css}` | /a/:slug — minimal QR-target |
| `src/pages/public/KnowledgePage.{jsx,css}` | Article index |
| `src/pages/public/KnowledgeArticlePage.{jsx,css}` | Markdown rendering |
| `src/pages/public/ArtistPage.{jsx,css}`    | Sangji Cairang bio + lineage |
| `src/pages/public/VisitPage.{jsx,css}`     | Dates, venue, organizers |
| `src/pages/public/NotFoundPage.jsx`        | 404 |
| `src/pages/admin/AdminLogin.jsx`           | Placeholder (Phase 2) |
| `src/pages/admin/AdminLayout.jsx`          | Placeholder (Phase 2) |
| `netlify/functions/david.js`               | RAG pipeline → Claude |
| `scripts/generate-embeddings.mjs`          | Populate pgvector embeddings |
| `scripts/generate-qr-cards.mjs`            | Generate printable QR card SVGs |

---

## Deployment

### One-time setup

#### 1. Supabase (already done — verify)

In the CLF Supabase project (yqcojudvvjntaajnrilr):

1. **SQL Editor** → run `schema.sql` (v1) — creates exhibition + 6 seed artworks
2. **SQL Editor** → run `schema_v2.sql` — adds knowledge, RAG, David persona
3. **Storage** → create three buckets, all **public**:
   - `feiyi-images`
   - `feiyi-audio`
   - `feiyi-portraits`
   *(v2 also creates `feiyi-organizers`, `feiyi-knowledge`, `feiyi-events` automatically)*
4. **Authentication → Users**: find your user, edit `raw_app_meta_data`, set:
   ```json
   { "role": "admin" }
   ```
   This unlocks admin-write RLS policies for the future Phase 2 admin panel.

#### 2. Local development

```bash
cd tangka-site
cp .env.example .env.local
# Fill in:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
#   ANTHROPIC_API_KEY
#   OPENAI_API_KEY
#   SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

For local dev, set `VITE_BASE_PATH=/` in `.env.local` (so URLs work without the `/feiyi/tangka/` prefix).

#### 3. Generate embeddings (once, after every knowledge edit)

```bash
npm run embed
```

This populates `feiyi_knowledge_embedding` from your knowledge articles, artwork descriptions, and artist bio. Run again whenever you edit content.

#### 4. Deploy this site to Netlify

```bash
git init
git add .
git commit -m "Initial Phase 1"
git remote add origin <your-repo-url>
git push -u origin main
```

Then in Netlify dashboard:

1. **Create new site from Git** → connect repo
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (already in `netlify.toml`)
3. **Environment variables** (Site config → Environment variables):
   ```
   VITE_SUPABASE_URL=https://yqcojudvvjntaajnrilr.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   VITE_EXHIBITION_SLUG=sacred-measures-2026
   VITE_SITE_BASE_URL=https://david-zhongwen.net/feiyi/tangka
   VITE_BASE_PATH=/feiyi/tangka/
   SUPABASE_SERVICE_ROLE_KEY=...
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-...
   ```
4. **Deploy** → wait for first build to succeed
5. **Site settings → Domain management**: rename to `tangka.netlify.app` (or keep the random subdomain)

#### 5. Wire the proxy on `david-zhongwen.net`

In your `david-zhongwen.net` repo's `netlify.toml`, add at the top of `[[redirects]]`:

```toml
# /feiyi/tangka/ proxy to tangka.netlify.app
[[redirects]]
  from = "/feiyi/tangka/*"
  to = "https://tangka.netlify.app/feiyi/tangka/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/feiyi/tangka"
  to = "https://tangka.netlify.app/feiyi/tangka/"
  status = 200
  force = true
```

Commit + push. Netlify rebuilds david-zhongwen.net with the new proxy rule.

#### 6. Verify

```bash
curl -sI https://david-zhongwen.net/feiyi/tangka/
# Expect: HTTP/2 200
```

Open `https://david-zhongwen.net/feiyi/tangka/` in a browser. You should see the manuscript-style hero.

#### 7. Generate QR cards

```bash
npm run qr
```

Outputs to `qr-cards/{slug}.svg` — one printable card per artwork. Print at A6 (105×148mm) or scale up for wall plaques.

---

## Operating

### Adding artwork content

Until the admin panel is built (Phase 2), use the Supabase dashboard:

1. **Table Editor → feiyi_artwork** → insert rows. Required fields: `slug`, `title_{zh,en,it}`, `description_{zh,en,it}`, `materials_{zh,en,it}`, `dimensions`, `year`, `display_order`.
2. **Storage → feiyi-images → sacred-measures-2026/** → upload high-res JPGs named `{slug}.jpg`. Get the public URL and paste it as `image_url` on the artwork row.
3. After editing knowledge or artwork descriptions: **`npm run embed`** to refresh David's RAG.

### Adding organizers/sponsors

**Table Editor → feiyi_organizer** → insert rows with `type` set to one of:
`host`, `organizer`, `co_organizer`, `supporter`, `sponsor`, `media`.

Upload logos to `feiyi-organizers` bucket. Set `exhibition_id` to your exhibition's UUID.

### Editing David's voice

**Table Editor → feiyi_david_persona** → edit the `system_prompt`, greetings, refusals.
The frontend re-fetches on every page load, so changes take effect immediately.

### Monitoring David

```sql
-- Recent conversations
SELECT created_at, language, user_message, assistant_reply, outcome, latency_ms, input_tokens, output_tokens
FROM feiyi_david_conversation
ORDER BY created_at DESC
LIMIT 50;

-- Cost rollup
SELECT
  date_trunc('day', created_at) as day,
  count(*) as conversations,
  sum(input_tokens) as input_tokens,
  sum(output_tokens) as output_tokens,
  -- Haiku 4.5 pricing (approximate; check current rates):
  --   $1.00 per 1M input, $5.00 per 1M output
  round((sum(input_tokens) * 1.0 + sum(output_tokens) * 5.0) / 1000000.0, 4) as approx_usd
FROM feiyi_david_conversation
WHERE outcome = 'success'
GROUP BY 1 ORDER BY 1 DESC;

-- Audio guide scans
SELECT artwork_slug, language, count(*)
FROM feiyi_audio_guide_view
GROUP BY 1, 2 ORDER BY 3 DESC;
```

### David is misbehaving

If David starts answering off-topic or making things up:
1. Edit his `system_prompt` in `feiyi_david_persona` (Supabase Table Editor).
2. Add more grounding chunks: write more knowledge articles, or insert manual chunks into `feiyi_knowledge_embedding` with `source_type = 'manual'`.
3. Worst case: set `feiyi_david_persona.is_active = false` to take David offline (the chat panel's fetch will fail and show the fallback message).

---

## Roadmap

### Phase 1 — Done ✓
- Schema, public site, David character + RAG, audio guide, QR codes

### Phase 2 — Admin panel
- Magic-link auth (Supabase)
- AdminExhibition (edit dates, venue, opening hours)
- AdminArtworks (upload images/audio with progress, edit descriptions)
- AdminKnowledge (markdown editor, re-embed on save)
- AdminOrganizers (logos, types)
- AdminMedia (event photos)

### Phase 3 — Polish + analytics
- AdminDashboard (David usage charts, scan heatmap)
- SEO + sitemap
- Real audio recordings (replace Web Speech)
- 桑吉才让 cultural review of David character before public launch

---

## Credits

- Artist: 桑吉才让 / Sangji Cairang
- Curatorial / development: Geo (Università di Firenze)
- Supported by: Confucius Institute, University of Florence
- Platform: 大卫学中文 / 飞酷吧 ecosystem

---

## License

Site code © 2026. Artwork images © Sangji Cairang — used under exhibition agreement.
