# How to Add Your Images and Text

Until the admin panel exists (Phase 2), you edit content directly in **Supabase Dashboard**.

Open: https://supabase.com → log in → CLF project (`yqcojudvvjntaajnrilr`).

---

## Quick map

| What you want to change      | Where to go in Supabase                              |
|------------------------------|------------------------------------------------------|
| Show title, dates, venue     | Table Editor → `feiyi_exhibition`                    |
| Artist name, bio, portrait   | Table Editor → `feiyi_artist` + Storage → portraits  |
| Add/edit an artwork          | Table Editor → `feiyi_artwork` + Storage → images    |
| Knowledge article            | Table Editor → `feiyi_knowledge`                     |
| Sponsors / hosts / partners  | Table Editor → `feiyi_organizer` + Storage → org logos |
| Audio narration files        | Storage → `feiyi-audio` + paste URL into artwork row |
| David's voice / system prompt| Table Editor → `feiyi_david_persona`                 |

---

## 1. Adding the show's basic info

**Table Editor → `feiyi_exhibition`** → click the existing `sacred-measures-2026` row.

Edit these fields:

| Field             | Example                                          |
|-------------------|--------------------------------------------------|
| `title_zh`        | 度量之间                                         |
| `title_en`        | Sacred Measures                                  |
| `title_it`        | Tra le Misure Sacre                              |
| `subtitle_zh/en/it` | Optional poetic subtitle                       |
| `start_date`      | `2026-09-15` (YYYY-MM-DD)                        |
| `end_date`        | `2026-12-15`                                     |
| `venue_zh`        | 帕拉佐 美第奇 · 里卡迪宫                         |
| `venue_en`        | Palazzo Medici Riccardi                          |
| `venue_it`        | Palazzo Medici Riccardi                          |
| `address`         | Via Cavour, 3, 50129 Firenze FI                  |
| `opening_hours`   | Tue–Sun · 10:00–18:00                            |

Click the green checkmark → **Save**.

---

## 2. Adding an artwork

You'll do this 13 more times to get to the full 19.

### A. Upload the image

1. **Storage** (left sidebar) → click `feiyi-images` bucket.
2. Click **Upload file** → pick `your-photo.jpg`.
3. **Important**: name it after the artwork's slug. Example: `mahavairocana-2022.jpg`.
4. Drop into the folder `sacred-measures-2026/` (create the folder if it doesn't exist).
5. After upload: **right-click the file → Get URL → Copy public URL**. Looks like:
   ```
   https://yqcojudvvjntaajnrilr.supabase.co/storage/v1/object/public/feiyi-images/sacred-measures-2026/mahavairocana-2022.jpg
   ```

### B. Insert the artwork row

1. **Table Editor → `feiyi_artwork`** → **Insert row**.
2. Fill in:

| Field | Notes |
|-------|-------|
| `slug` | URL-safe name, lowercase, hyphens. e.g. `mahavairocana-2022` |
| `exhibition_id` | Click the dropdown → pick `sacred-measures-2026` |
| `artist_id` | Click → pick `sangji-cairang` |
| `display_order` | Integer; controls grid position (1, 2, 3, …) |
| `title_zh` / `title_en` / `title_it` | Title in 3 languages |
| `description_zh` / `description_en` / `description_it` | Long-form description, can be multiple paragraphs (use blank line between paragraphs) |
| `materials_zh` / `materials_en` / `materials_it` | e.g. `天然矿物颜料、纯金、棉布` / `Mineral pigment, pure gold on cotton` |
| `dimensions` | e.g. `120 × 90 cm` |
| `year` | Integer, e.g. `2022` |
| `image_url` | **paste the storage URL from step A** |
| `color_theme` | Pick one: `lapis`, `cinnabar`, `gold`, `malachite`, `ink`, `bone` (controls placeholder + tinting) |
| `is_active` | `true` |

3. Save.
4. The artwork appears immediately on `/gallery` and gets its own page at `/work/{slug}`.

### C. Re-run embeddings (so David knows about it)

```bash
npm run embed
```

Without this, David won't be able to discuss the new artwork.

---

## 3. Adding the artist portrait

1. **Storage → `feiyi-portraits`** → upload `sangji-cairang.jpg`.
2. Copy the public URL.
3. **Table Editor → `feiyi_artist`** → edit the `sangji-cairang` row.
4. Paste URL into `portrait_url`.
5. Optionally edit `bio_zh` / `bio_en` / `bio_it`.

---

## 4. Adding sponsors / organizers

1. **Storage → `feiyi-organizers`** → upload logos (PNG with transparent background ideal).
2. **Table Editor → `feiyi_organizer`** → Insert row for each:

| Field | Value |
|-------|-------|
| `slug` | e.g. `confucius-institute-unifi` |
| `exhibition_id` | dropdown → pick exhibition |
| `type` | `host`, `organizer`, `co_organizer`, `supporter`, `sponsor`, or `media` |
| `name_zh/en/it` | Trilingual name |
| `logo_url` | The storage URL |
| `website_url` | Their site (optional) |
| `display_order` | 1, 2, 3 within their type |
| `is_active` | `true` |

They appear automatically on `/visit`, grouped by type, in the order: host → organizer → co_organizer → supporter → sponsor → media.

---

## 5. Audio narrations (replace TTS)

If you record real voice narrations for each artwork:

1. **Storage → `feiyi-audio`** → upload `mahavairocana-2022-zh.mp3`, `mahavairocana-2022-en.mp3`, `mahavairocana-2022-it.mp3`.
2. Copy each public URL.
3. **Table Editor → `feiyi_artwork`** → edit that artwork's row.
4. Paste the URLs into `audio_url_zh`, `audio_url_en`, `audio_url_it`.

The site auto-prefers recorded MP3s over the Web Speech API fallback.

---

## 6. Editing knowledge articles

**Table Editor → `feiyi_knowledge`** — six articles seeded already.

Edit `body_zh` / `body_en` / `body_it`. They're written in **Markdown**:

```markdown
# Heading
## Subheading

A paragraph.

- Bullet
- Bullet

| Col 1 | Col 2 |
|-------|-------|
| data  | data  |
```

After editing: **`npm run embed`** to refresh David's knowledge.

---

## 7. Editing David's voice

**Table Editor → `feiyi_david_persona`** → edit the active row.

- `system_prompt` — the master instructions to Claude. Edit carefully; this controls everything David says.
- `greeting_zh/en/it` — what David says when the chat opens.
- `fallback_zh/en/it` — what David says when the API fails.
- `refusal_zh/en/it` — example refusal language for out-of-scope questions.

Save → reload the site → David picks up the new persona on next page load.

---

## 8. After every content change

```bash
# If you edited a description, knowledge article, or artist bio:
cd tangka-site
npm run embed

# Otherwise no rebuild needed — Supabase queries are live.
```

---

## Common gotchas

- **`is_active = false` or `is_published = false`** hides a row from the public site. Use this to draft.
- **Public URLs** require the bucket to be marked **Public** in Storage settings. (Already done for the four buckets.)
- **Image too big?** Compress before upload. 1500–2500px on the long side, JPEG quality 85%, is plenty for thangka images.
- **Colors look off in placeholder?** Set `color_theme` to match the dominant pigment in the actual image (`lapis`, `cinnabar`, `gold`, `malachite`, `ink`, `bone`).
- **Forgot to run `npm run embed`?** David will answer with stale info or refuse. Run it after any text edit.

---

## When you're ready for the admin panel

Phase 2 replaces all of the above with a friendly UI:

- Magic-link login (no passwords)
- Drag-drop image uploads with progress bars
- Markdown editor with live preview
- Auto-re-embedding on save
- Conversation log viewer for David

Tell me when you want to build it.
