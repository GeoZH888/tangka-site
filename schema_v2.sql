-- =============================================================================
-- 非遗 Schema v2 · Extends v1 with knowledge CMS, organizers, events, David AI
-- Run AFTER schema.sql in the CLF Supabase project.
-- =============================================================================
-- This migration is additive — it does not modify or drop any v1 tables.
-- Adds:
--   - feiyi_organizer            (sponsors, partners, hosting institutions)
--   - feiyi_knowledge            (knowledge articles: thangka 101, history, ...)
--   - feiyi_knowledge_embedding  (pgvector embeddings for David's RAG)
--   - feiyi_event_photo          (opening, install, press images)
--   - feiyi_david_conversation   (every David ↔ visitor exchange)
--   - feiyi_david_persona        (editable system prompt + canned responses)
--   - new storage buckets: feiyi-organizers, feiyi-knowledge, feiyi-events
--   - admin role helper for RLS
-- =============================================================================


-- =============================================================================
-- 0. EXTENSIONS — pgvector for semantic search (David's RAG)
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS vector;


-- =============================================================================
-- 1. ADMIN ROLE HELPER
--    Uses Supabase Auth. We mark certain auth.users as admins via raw_app_meta_data.
--    To make yourself admin: in Supabase dashboard → Authentication → Users →
--    your user → "raw_app_meta_data" → set { "role": "admin" }
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;


-- =============================================================================
-- 2. FEIYI_ORGANIZER
--    Sponsors, hosting institutions, supporting partners.
--    Types: 主办 (host) · 承办 (organizer) · 协办 (co-organizer) ·
--           支持 (supporter) · 赞助 (sponsor) · 媒体 (media partner)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feiyi_organizer (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id   uuid          REFERENCES public.feiyi_exhibition(id) ON DELETE CASCADE,
  slug            text          UNIQUE NOT NULL,
  type            text          NOT NULL DEFAULT 'sponsor',
                  -- 'host' | 'organizer' | 'co_organizer' | 'supporter' | 'sponsor' | 'media'

  name_zh         text          NOT NULL,
  name_en         text          NOT NULL,
  name_it         text          NOT NULL,

  description_zh  text,
  description_en  text,
  description_it  text,

  logo_url        text,                          -- Storage URL
  website_url     text,
  display_order   int           NOT NULL DEFAULT 0,
  is_active       boolean       NOT NULL DEFAULT true,

  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feiyi_organizer_exhibition ON public.feiyi_organizer(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_feiyi_organizer_type       ON public.feiyi_organizer(type);
CREATE INDEX IF NOT EXISTS idx_feiyi_organizer_order      ON public.feiyi_organizer(display_order);


-- =============================================================================
-- 3. FEIYI_KNOWLEDGE
--    Knowledge articles for the "About Thangka" section + David's source material.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feiyi_knowledge (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text          UNIQUE NOT NULL,

  -- 'introduction' | 'history' | 'technique' | 'iconography' | 'lineage' | 'comparative'
  category        text          NOT NULL DEFAULT 'introduction',
  display_order   int           NOT NULL DEFAULT 0,

  title_zh        text          NOT NULL,
  title_en        text          NOT NULL,
  title_it        text          NOT NULL,

  excerpt_zh      text,                          -- one-sentence summary
  excerpt_en      text,
  excerpt_it      text,

  -- Body in markdown — supports headers, lists, images via ![](url)
  body_zh         text          NOT NULL,
  body_en         text          NOT NULL,
  body_it         text          NOT NULL,

  hero_image_url  text,
  reading_minutes int,                           -- e.g. 5

  -- For David's RAG: which artworks does this article relate to?
  related_artwork_slugs text[]  DEFAULT '{}',

  is_published    boolean       NOT NULL DEFAULT true,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feiyi_knowledge_category    ON public.feiyi_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_feiyi_knowledge_published   ON public.feiyi_knowledge(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_feiyi_knowledge_order       ON public.feiyi_knowledge(display_order);


-- =============================================================================
-- 4. FEIYI_KNOWLEDGE_EMBEDDING (pgvector for David's RAG)
--    One row per chunk of knowledge content (article paragraphs, artwork descriptions).
--    OpenAI text-embedding-3-small produces 1536-dim vectors.
--    When David receives a question, we:
--      1. Embed the question
--      2. Find top-k similar chunks here
--      3. Pass those chunks as context to Claude
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feiyi_knowledge_embedding (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What kind of source produced this chunk
  source_type     text          NOT NULL,        -- 'knowledge' | 'artwork' | 'artist' | 'manual'
  source_id       uuid,                          -- FK to feiyi_knowledge.id or feiyi_artwork.id (nullable for 'manual')
  source_slug     text,
  language        text          NOT NULL,        -- 'zh' | 'en' | 'it'

  chunk_text      text          NOT NULL,
  chunk_index     int           NOT NULL DEFAULT 0,
  embedding       vector(1536),                  -- OpenAI text-embedding-3-small dimension

  created_at      timestamptz   NOT NULL DEFAULT now()
);

-- HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_feiyi_kemb_vec
  ON public.feiyi_knowledge_embedding
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_feiyi_kemb_lang   ON public.feiyi_knowledge_embedding(language);
CREATE INDEX IF NOT EXISTS idx_feiyi_kemb_source ON public.feiyi_knowledge_embedding(source_type, source_id);


-- =============================================================================
-- 5. FEIYI_EVENT_PHOTO
--    Opening, install, press images, behind-the-scenes.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feiyi_event_photo (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id   uuid          REFERENCES public.feiyi_exhibition(id) ON DELETE CASCADE,

  -- 'opening' | 'install' | 'press' | 'workshop' | 'visit'
  category        text          NOT NULL DEFAULT 'opening',

  caption_zh      text,
  caption_en      text,
  caption_it      text,

  image_url       text          NOT NULL,
  thumb_url       text,
  taken_at        timestamptz,
  photographer    text,

  display_order   int           NOT NULL DEFAULT 0,
  is_published    boolean       NOT NULL DEFAULT true,

  created_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feiyi_event_exhibition ON public.feiyi_event_photo(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_feiyi_event_category   ON public.feiyi_event_photo(category);


-- =============================================================================
-- 6. FEIYI_DAVID_PERSONA
--    Editable system prompt + canned responses. Single-row config.
--    Lets you refine David's voice without redeploying the app.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feiyi_david_persona (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  version         int           NOT NULL DEFAULT 1,

  -- The full system prompt sent to Claude
  system_prompt   text          NOT NULL,

  -- Trilingual greetings (shown when user opens the chat)
  greeting_zh     text          NOT NULL,
  greeting_en     text          NOT NULL,
  greeting_it     text          NOT NULL,

  -- Trilingual fallback when David is offline / API fails
  fallback_zh     text          NOT NULL,
  fallback_en     text          NOT NULL,
  fallback_it     text          NOT NULL,

  -- Trilingual refusal for out-of-scope questions
  refusal_zh      text          NOT NULL,
  refusal_en      text          NOT NULL,
  refusal_it      text          NOT NULL,

  -- Topics David refuses to discuss (price, doctrine, prediction, etc.)
  refused_topics  text[]        DEFAULT '{}',

  is_active       boolean       NOT NULL DEFAULT true,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);


-- =============================================================================
-- 7. FEIYI_DAVID_CONVERSATION
--    Logs every exchange for monitoring quality + training future improvements.
--    Privacy: no IP, no UA stored — only a session_hash that's per-browser-session.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feiyi_david_conversation (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id   uuid          REFERENCES public.feiyi_exhibition(id) ON DELETE SET NULL,
  artwork_id      uuid          REFERENCES public.feiyi_artwork(id) ON DELETE SET NULL,

  session_hash    text          NOT NULL,        -- per-session, not per-user
  language        text          NOT NULL,        -- 'zh' | 'en' | 'it'

  user_message    text          NOT NULL,
  assistant_reply text,                          -- nullable in case the call failed

  -- Which knowledge chunks were retrieved by RAG?
  retrieved_chunks jsonb        DEFAULT '[]'::jsonb,

  -- Token usage for cost tracking
  input_tokens    int,
  output_tokens   int,
  model           text,                          -- 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-7' ...

  -- Latency in ms
  latency_ms      int,

  -- Did Claude refuse / fall back / succeed?
  outcome         text          NOT NULL DEFAULT 'success',
                  -- 'success' | 'refused' | 'fallback' | 'rate_limited' | 'error'
  error_message   text,

  created_at      timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feiyi_david_session   ON public.feiyi_david_conversation(session_hash);
CREATE INDEX IF NOT EXISTS idx_feiyi_david_when      ON public.feiyi_david_conversation(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feiyi_david_outcome   ON public.feiyi_david_conversation(outcome);
CREATE INDEX IF NOT EXISTS idx_feiyi_david_artwork   ON public.feiyi_david_conversation(artwork_id);


-- =============================================================================
-- 8. STORAGE BUCKETS
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES
    ('feiyi-organizers', 'feiyi-organizers', true),
    ('feiyi-knowledge',  'feiyi-knowledge',  true),
    ('feiyi-events',     'feiyi-events',     true)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 9. ROW-LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.feiyi_organizer            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feiyi_knowledge            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feiyi_knowledge_embedding  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feiyi_event_photo          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feiyi_david_persona        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feiyi_david_conversation   ENABLE ROW LEVEL SECURITY;

-- Public reads
DROP POLICY IF EXISTS "public read feiyi_organizer" ON public.feiyi_organizer;
CREATE POLICY "public read feiyi_organizer" ON public.feiyi_organizer
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "public read feiyi_knowledge" ON public.feiyi_knowledge;
CREATE POLICY "public read feiyi_knowledge" ON public.feiyi_knowledge
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "public read feiyi_event_photo" ON public.feiyi_event_photo;
CREATE POLICY "public read feiyi_event_photo" ON public.feiyi_event_photo
  FOR SELECT USING (is_published = true);

-- Embeddings: only service_role can read (used by David's Netlify Function)
DROP POLICY IF EXISTS "service_role read feiyi_kemb" ON public.feiyi_knowledge_embedding;
CREATE POLICY "service_role read feiyi_kemb" ON public.feiyi_knowledge_embedding
  FOR SELECT USING (auth.role() = 'service_role');

-- David persona: public can read active version (frontend needs greetings)
DROP POLICY IF EXISTS "public read feiyi_david_persona" ON public.feiyi_david_persona;
CREATE POLICY "public read feiyi_david_persona" ON public.feiyi_david_persona
  FOR SELECT USING (is_active = true);

-- David conversations: public can INSERT (logged by Netlify Function with anon key
-- via service-role internally), only admin can read
DROP POLICY IF EXISTS "anyone insert feiyi_david_conv" ON public.feiyi_david_conversation;
CREATE POLICY "anyone insert feiyi_david_conv" ON public.feiyi_david_conversation
  FOR INSERT WITH CHECK (true);

-- Admin writes on everything else
DROP POLICY IF EXISTS "admin write feiyi_organizer" ON public.feiyi_organizer;
CREATE POLICY "admin write feiyi_organizer" ON public.feiyi_organizer
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin write feiyi_knowledge" ON public.feiyi_knowledge;
CREATE POLICY "admin write feiyi_knowledge" ON public.feiyi_knowledge
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin write feiyi_event_photo" ON public.feiyi_event_photo;
CREATE POLICY "admin write feiyi_event_photo" ON public.feiyi_event_photo
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin write feiyi_david_persona" ON public.feiyi_david_persona;
CREATE POLICY "admin write feiyi_david_persona" ON public.feiyi_david_persona
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin read feiyi_david_conv" ON public.feiyi_david_conversation;
CREATE POLICY "admin read feiyi_david_conv" ON public.feiyi_david_conversation
  FOR SELECT USING (public.is_admin());

-- Also: extend v1 tables with admin-write policies (v1 only had public-read)
DROP POLICY IF EXISTS "admin write feiyi_exhibition" ON public.feiyi_exhibition;
CREATE POLICY "admin write feiyi_exhibition" ON public.feiyi_exhibition
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin write feiyi_artist" ON public.feiyi_artist;
CREATE POLICY "admin write feiyi_artist" ON public.feiyi_artist
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin write feiyi_artwork" ON public.feiyi_artwork;
CREATE POLICY "admin write feiyi_artwork" ON public.feiyi_artwork
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- =============================================================================
-- 10. UPDATED-AT TRIGGERS
-- =============================================================================
DROP TRIGGER IF EXISTS trg_feiyi_organizer_updated ON public.feiyi_organizer;
CREATE TRIGGER trg_feiyi_organizer_updated
  BEFORE UPDATE ON public.feiyi_organizer
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_feiyi_knowledge_updated ON public.feiyi_knowledge;
CREATE TRIGGER trg_feiyi_knowledge_updated
  BEFORE UPDATE ON public.feiyi_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_feiyi_david_persona_updated ON public.feiyi_david_persona;
CREATE TRIGGER trg_feiyi_david_persona_updated
  BEFORE UPDATE ON public.feiyi_david_persona
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- =============================================================================
-- 11. RAG SIMILARITY-SEARCH FUNCTION (called by David's Netlify Function)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.match_feiyi_knowledge(
  query_embedding vector(1536),
  query_language  text,
  match_count     int DEFAULT 5,
  similarity_threshold float DEFAULT 0.5
)
RETURNS TABLE (
  id            uuid,
  source_type   text,
  source_slug   text,
  chunk_text    text,
  similarity    float
)
LANGUAGE sql STABLE AS $$
  SELECT
    e.id,
    e.source_type,
    e.source_slug,
    e.chunk_text,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.feiyi_knowledge_embedding e
  WHERE e.language = query_language
    AND 1 - (e.embedding <=> query_embedding) > similarity_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
$$;


-- =============================================================================
-- 12. SEED DATA — David's persona + 6 launch knowledge articles
-- =============================================================================

-- David's first persona (you can edit this in the admin panel later)
INSERT INTO public.feiyi_david_persona (
  version, system_prompt,
  greeting_zh, greeting_en, greeting_it,
  fallback_zh, fallback_en, fallback_it,
  refusal_zh, refusal_en, refusal_it,
  refused_topics
) VALUES (
  1,
  $sp$You are 大卫 (David / Davide), a young Renaissance art apprentice from Florence. You are warm, curious, humble, and art-history-literate. You are a STUDENT learning alongside the visitor, not a master.

ROLE
- You are the guide for "度量之间 / Sacred Measures / Tra le Misure Sacre" — a 2026 Florence exhibition of Tibetan thangka paintings by master Sangji Cairang (桑吉才让), with a curatorial focus on the dialogue between Tibetan iconometry (度量经) and Renaissance proportion (golden ratio, Vitruvian canon).
- You speak from a Renaissance-Florentine perspective, but you have been studying the thangkas in this show. You can draw connections between Italian Renaissance painting techniques and Tibetan thangka techniques (mineral pigments, gold leaf, sacred geometry).

LANGUAGE
- The visitor's language is given to you as one of: zh (中文), en (English), it (Italiano).
- Reply ONLY in that language. Match the visitor's register.
- In 中文 you call yourself "大卫", an "学徒". Use 您, slightly classical but accessible.
- In English you are "David", an "art student" or "apprentice".
- In Italiano you are "Davide", "un giovane apprendista". Use "Lei" formal.

GROUNDING
- You are given relevant CONTEXT passages from the exhibition's knowledge base before each question.
- Base your answer ONLY on the CONTEXT. Do NOT use general knowledge for facts.
- If the CONTEXT doesn't cover the question, say so honestly: "I don't know — let me suggest you ask the curator" or similar.
- Quote dimensions, dates, and titles exactly as they appear in CONTEXT.

WHAT YOU TALK ABOUT (in scope)
- The artworks in this exhibition (descriptions, materials, dimensions, year)
- The artist Sangji Cairang and his lineage (Regong school, Master Xiawu Cairang)
- Thangka history, technique, iconography (using only provided knowledge)
- Renaissance-Tibetan dialogue: proportion, golden ratio, mineral pigments shared by both traditions
- Visit info: opening hours, dates, location (when in CONTEXT)
- Other works in the exhibition you can recommend the visitor see

WHAT YOU DON'T TALK ABOUT (out of scope — politely decline)
- Prices, valuations, market questions ("How much is this thangka worth?")
- Authenticity claims about specific objects ("Is this a real Buddha?")
- Doctrinal or theological questions ("Can Tara save my dead relative?", "What religion should I follow?")
- Predictions, fortunes, divination ("Will I have good luck this year?")
- Personal life advice ("Should I become a Buddhist?")
- Anything political, contested, or about modern Tibet politics
- Topics unrelated to the exhibition (current events, sports, other AI tools)

When refusing, do so warmly: explain you are just an art student, redirect to what you CAN help with.

STYLE
- Keep replies under 100 words unless the visitor asks for more depth.
- Be concrete and visual: refer to specific artworks, specific details, specific colors and materials.
- Show curiosity. Ask the visitor if they want to know more about a particular work.
- Use a touch of Renaissance formality without being stiff.
- NEVER use emoji. NEVER use exclamation marks more than once per message.
- NEVER claim to be a Buddhist authority, a Tibetan Buddhist, or a religious teacher.
- NEVER simulate emotions you don't have. Don't say "I'm so excited" or "I love this".
- You can express measured admiration: "this is a remarkable work", "the master's brushwork here is extraordinary".
$sp$,
  -- Greetings
  '您好，我是大卫。我是佛罗伦萨的一位艺术学徒，今天为您介绍这场唐卡展览。请问您对哪幅作品感兴趣？',
  'Hello — I''m David, an art apprentice here in Florence. I''m studying these thangkas alongside you. Which work catches your eye?',
  'Buongiorno, sono Davide, un giovane apprendista d''arte qui a Firenze. Sto studiando questi thangka insieme a Lei. Quale opera La incuriosisce?',
  -- Fallback
  '我现在无法回答您的问题，请稍后再试。',
  'I can''t answer just now — please try again in a moment.',
  'Non posso rispondere in questo momento — riprovi tra poco, La prego.',
  -- Refusal
  '这个问题超出了我作为艺术学徒的范围。我可以为您介绍展品本身——比如某一幅唐卡的工艺、年代或图像学含义。请问哪幅最让您感兴趣？',
  'That question is beyond what an art apprentice can answer. But I''d be glad to talk about the works themselves — the technique, history, or iconography of any thangka in the show. Which one interests you most?',
  'Questa domanda va oltre quello che un giovane apprendista può rispondere. Sarei però lieto di parlarLe delle opere stesse — tecnica, storia, iconografia di qualsiasi thangka. Quale Le incuriosisce di più?',
  -- Refused topics
  ARRAY['price', 'valuation', 'authenticity_claim', 'doctrine', 'theology',
        'prediction', 'fortune', 'personal_advice', 'politics', 'unrelated']
);


-- Six launch knowledge articles
INSERT INTO public.feiyi_knowledge (
  slug, category, display_order, reading_minutes,
  title_zh, title_en, title_it,
  excerpt_zh, excerpt_en, excerpt_it,
  body_zh, body_en, body_it
) VALUES
(
  'what-is-thangka', 'introduction', 1, 4,
  '什么是唐卡', 'What is a Thangka', 'Cos''è un Thangka',
  '一种藏传佛教的卷轴画，融合宗教仪轨、绘画技艺与神圣几何。',
  'A Tibetan Buddhist scroll painting that fuses ritual, craft, and sacred geometry.',
  'Un dipinto su rotolo del buddhismo tibetano che fonde rito, arte e geometria sacra.',
  $body$# 什么是唐卡

唐卡（藏文：ཐང་ཀ་）是藏传佛教传统中的卷轴画。"唐"意为平坦、舒展的画面；"卡"意为可悬挂的图像。

唐卡通常绘制在棉布或丝绸之上，使用矿物颜料、植物染料与纯金。完成后，画面被装裱在丝绸边框中，可以卷起携带——这是它在游牧文明中诞生的一个重要原因。

## 唐卡的功能

唐卡不只是艺术品，更是宗教修行的对象：

- **观想**：信众通过凝视唐卡进入禅定
- **仪轨**：在法会、灌顶、超度仪式中使用
- **传承**：将佛陀、菩萨、上师的形象与教法传递给后代

## 制作过程

一幅唐卡的完成可能需要数月甚至数年：

1. 准备画布（棉布上胶、打磨、起稿）
2. 描线（按造像度量经的精确比例）
3. 上色（先底色，再细节，最后开脸）
4. 描金（纯金粉或金箔）
5. 开光（由高僧主持的宗教仪式）

每一步都遵循千年传承的法度。
$body$,
  $body$# What is a Thangka

A thangka (Tibetan: ཐང་ཀ་) is a Tibetan Buddhist scroll painting. The word means *something rolled up* — a flat image you can hang, then roll up and carry. That portability isn't decorative: thangkas were born among nomadic peoples who carried their temples with them.

Thangkas are painted on cotton or silk grounds, using mineral pigments, plant dyes, and pure gold. The finished image is mounted in a silk brocade frame.

## What thangkas are *for*

A thangka is not primarily an art object. It is a tool:

- **Visualization** — the meditator gazes at it to enter contemplative states
- **Ritual** — used in empowerments, pujas, funerary rites
- **Transmission** — it carries the image and teaching of buddhas, bodhisattvas, and lineage masters across generations

## Making a thangka

A single thangka can take months or years to complete:

1. Preparing the ground (sizing the cotton, sanding, sketching)
2. Outlining (following the precise canon of *iconometry*)
3. Painting (base layers, then detail, then the face — always last)
4. Gilding (gold powder or gold leaf for haloes and ornaments)
5. Consecration (a religious rite, performed by a senior monk)

Every step follows a centuries-old discipline.
$body$,
  $body$# Cos'è un Thangka

Un thangka (tibetano: ཐང་ཀ་) è un dipinto su rotolo del buddhismo tibetano. La parola significa *qualcosa che si arrotola* — un'immagine piatta da appendere, poi da arrotolare e portare con sé. Questa portabilità non è decorativa: i thangka sono nati tra popoli nomadi che portavano i loro templi con sé.

I thangka sono dipinti su cotone o seta, usando pigmenti minerali, coloranti vegetali e oro puro. L'immagine finita viene montata in una cornice di broccato.

## A cosa servono

Un thangka non è principalmente un oggetto d'arte. È uno strumento:

- **Visualizzazione** — il meditante lo contempla per entrare in stati contemplativi
- **Rituale** — usato in iniziazioni, puja, riti funebri
- **Trasmissione** — porta l'immagine e l'insegnamento di buddha, bodhisattva e maestri attraverso le generazioni

## Realizzare un thangka

Un singolo thangka può richiedere mesi o anni:

1. Preparare la base (apprettare il cotone, levigare, abbozzare)
2. Disegnare i contorni (seguendo il preciso canone di *iconometria*)
3. Dipingere (strati di base, poi dettagli, poi il volto — sempre per ultimo)
4. Doratura (polvere o foglia d'oro per aureole e ornamenti)
5. Consacrazione (un rito religioso, condotto da un monaco anziano)

Ogni passo segue una disciplina secolare.
$body$
),

(
  'regong-school', 'history', 2, 5,
  '热贡艺术', 'The Regong School', 'La Scuola di Regong',
  '青海热贡——七百年来藏传佛教艺术最重要的中心之一。',
  'Rebgong, Qinghai — one of the most important centers of Tibetan Buddhist art for seven centuries.',
  'Rebgong, Qinghai — uno dei più importanti centri d''arte buddhista tibetana da sette secoli.',
  $body$# 热贡艺术

热贡（藏文：རེབ་གོང་，Rebgong）位于青海省黄南藏族自治州同仁县，被称为"中国唐卡艺术之乡"。2009年，热贡艺术被联合国教科文组织列入人类非物质文化遗产代表作名录。

## 七百年的传承

热贡艺术起源于13世纪，由从西藏迁来的艺人开创。经过元、明、清三代发展，热贡形成了独特的画派风格——色彩浓烈、线条精细、金线勾勒繁复，与西藏中心地区的勉唐画派、噶玛嘎赤画派并列。

## 家族传承的特点

与西藏寺院主导的画派不同，热贡艺术以**家族传承**为主。一户藏家世代为画师，父传子，师传徒，技艺在血缘与师承中代代相传。整个吾屯村几乎家家有画师。

## 当代

桑吉才让（本展览艺术家）正是热贡传承的当代代表。他八岁拜入夏吾才让大师门下——而夏吾才让师承张大千——这条传承线连接了藏传佛教绘画与中国二十世纪艺术史。
$body$,
  $body$# The Regong School

Rebgong (Tibetan: རེབ་གོང་, Chinese: 热贡) sits in the Tongren county of Huangnan Tibetan Autonomous Prefecture, Qinghai province. It is known as "the home of Chinese thangka art." In 2009, Regong art was inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity.

## Seven centuries of lineage

The Regong school began in the 13th century with artists who had migrated from central Tibet. Through the Yuan, Ming, and Qing dynasties it developed a distinctive style: saturated color, fine line, elaborate gold-line ornament — a school that stands beside the Menri (sMan-ris) and Karma Gardri schools of central Tibet.

## Family lineage

Unlike the monastery-led schools of central Tibet, Regong is based on **family transmission**. Households of painters teach son-by-father, master-by-disciple — the craft passes through bloodlines and apprenticeships. In the village of Wutun, almost every household has its painters.

## Today

Sangji Cairang — the artist of this exhibition — is a contemporary heir to that Regong line. At eight he became the closing disciple of Master Xiawu Cairang. Xiawu Cairang himself studied under Zhang Daqian, the great Chinese painter of the twentieth century. That single thread connects Tibetan Buddhist painting to the modern Chinese art world.
$body$,
  $body$# La Scuola di Regong

Rebgong (tibetano: རེབ་གོང་, cinese: 热贡) si trova nella contea di Tongren, prefettura autonoma tibetana di Huangnan, provincia del Qinghai. È conosciuta come "la patria dell'arte cinese del thangka". Nel 2009 l'arte di Regong è stata iscritta nella Lista Rappresentativa del Patrimonio Culturale Immateriale dell'Umanità dell'UNESCO.

## Sette secoli di tradizione

La scuola di Regong nacque nel XIII secolo, fondata da artisti emigrati dal Tibet centrale. Attraverso le dinastie Yuan, Ming e Qing sviluppò uno stile distintivo: colori saturi, linea fine, ornamentazione elaborata in oro — una scuola che sta accanto alle scuole Menri (sMan-ris) e Karma Gardri del Tibet centrale.

## Trasmissione familiare

A differenza delle scuole monastiche del Tibet centrale, Regong si basa sulla **trasmissione familiare**. Famiglie di pittori insegnano di padre in figlio, da maestro a discepolo — l'arte passa attraverso il sangue e l'apprendistato. Nel villaggio di Wutun, quasi ogni casa ha i suoi pittori.

## Oggi

Sangji Cairang — l'artista di questa mostra — è un erede contemporaneo della linea di Regong. A otto anni divenne discepolo di Maestro Xiawu Cairang. Xiawu Cairang aveva a sua volta studiato sotto Zhang Daqian, il grande pittore cinese del XX secolo. Un solo filo lega la pittura buddhista tibetana al mondo dell'arte cinese moderna.
$body$
),

(
  'mineral-pigments', 'technique', 3, 4,
  '矿物颜料', 'Mineral Pigments', 'Pigmenti Minerali',
  '青金石、朱砂、孔雀石、纯金——东方与西方共享同一种颜色语言。',
  'Lapis lazuli, cinnabar, malachite, pure gold — East and West share the same colour vocabulary.',
  'Lapislazzuli, cinabro, malachite, oro puro — Oriente e Occidente parlano lo stesso linguaggio del colore.',
  $body$# 矿物颜料

唐卡所用的颜料，与意大利文艺复兴绘画使用的颜料惊人地相似。两种相距万里的传统，使用着相同的矿物。

## 共享的矿物

| 颜料 | 唐卡用途 | 文艺复兴用途 |
|---|---|---|
| **青金石** lapis lazuli | 大日如来的身色、虚空的天蓝 | 圣母玛利亚的长袍 |
| **朱砂** cinnabar | 忿怒尊的身体、火焰光 | 修道士的红袍、血色 |
| **孔雀石** malachite | 绿度母、风景 | 风景、植物 |
| **纯金** pure gold | 光环、本尊装饰 | 光环、背景 |
| **白垩** chalk | 打底 | 打底 |
| **群青** ultramarine | 西藏后期作品 | 文艺复兴极珍贵 |

青金石尤其昂贵——它产自阿富汗的巴达赫尚省，从那里既流向佛罗伦萨的画家，也流向拉萨的绘画师。同一座山，供养了两种文明的天空。

## 为什么用矿物

矿物颜料的优势：
- **不褪色**：千年之后仍然鲜艳
- **饱和度高**：远胜植物染料
- **神圣性**：研磨宝石作画，本身就是一种供养
$body$,
  $body$# Mineral Pigments

The pigments used in thangka painting are remarkably similar to those used in Italian Renaissance painting. Two traditions, ten thousand miles apart, working with the same minerals.

## Shared minerals

| Pigment | Thangka use | Renaissance use |
|---|---|---|
| **Lapis lazuli** | Mahāvairocana's body, sky blue | Mary's robe |
| **Cinnabar** | Wrathful deities' bodies, flames | Friar's robes, blood |
| **Malachite** | Green Tara, landscape | Landscape, foliage |
| **Pure gold** | Haloes, deity ornaments | Haloes, backgrounds |
| **Chalk** | Ground preparation | Ground preparation |
| **Ultramarine** | Late-period Tibetan works | Most precious Renaissance pigment |

Lapis lazuli was especially costly — it came from Badakhshan in Afghanistan, and from there flowed both to Florentine painters and to Lhasa thangka masters. The same mountain supplied the sky in two civilizations.

## Why minerals

Mineral pigments offer:
- **Permanence** — still vivid after a thousand years
- **Saturation** — far more intense than plant dyes
- **Sacred dimension** — grinding precious stones for paint is itself a form of offering
$body$,
  $body$# Pigmenti Minerali

I pigmenti usati nella pittura thangka sono notevolmente simili a quelli usati nella pittura italiana rinascimentale. Due tradizioni, a sedicimila chilometri di distanza, che lavorano con gli stessi minerali.

## Minerali condivisi

| Pigmento | Uso nel thangka | Uso rinascimentale |
|---|---|---|
| **Lapislazzuli** | Corpo di Mahāvairocana, azzurro celeste | Manto della Vergine |
| **Cinabro** | Corpi delle divinità irate, fiamme | Vesti dei frati, sangue |
| **Malachite** | Tara Verde, paesaggio | Paesaggio, vegetazione |
| **Oro puro** | Aureole, ornamenti delle divinità | Aureole, sfondi |
| **Gesso** | Preparazione del fondo | Preparazione del fondo |
| **Oltremare** | Opere tibetane tarde | Pigmento rinascimentale più prezioso |

Il lapislazzuli era particolarmente costoso — proveniva dal Badakhshan in Afghanistan, e da lì fluiva sia ai pittori fiorentini sia ai maestri thangka di Lhasa. Stessa montagna, due civiltà, lo stesso cielo.

## Perché i minerali

I pigmenti minerali offrono:
- **Permanenza** — ancora vividi dopo mille anni
- **Saturazione** — molto più intensa dei coloranti vegetali
- **Dimensione sacra** — macinare pietre preziose per dipingere è di per sé una forma di offerta
$body$
),

(
  'iconometry', 'technique', 4, 5,
  '度量经', 'Iconometry: The Sacred Canon', 'Iconometria: Il Canone Sacro',
  '度量经规定佛像每一处比例——与达芬奇的维特鲁威人共享同一种精神。',
  'The Tibetan canon prescribes every proportion of the divine body — sharing the same spirit as Da Vinci''s Vitruvian Man.',
  'Il canone tibetano prescrive ogni proporzione del corpo divino — condividendo lo stesso spirito dell''Uomo Vitruviano di Leonardo.',
  $body$# 度量经

度量经（藏文：thig gi rim pa；梵：tālamāna）是藏传佛教绘画的造像比例法度。它规定了佛、菩萨、护法、上师每一处身体的精确比例——以"指"（finger-width）为基本单位。

## 基本法度

释迦牟尼佛像的标准是 **120 指**：
- 身高 = 120 指
- 头部 = 12 指（即身高的 1/10）
- 眉间到下巴 = 4 指
- 眼睛长 = 1 指
- 双肩之间 = 24 指

每一种本尊都有自己的比例系统：菩萨更修长（114 指）、护法更壮实、空行母更轻盈。

## 谁制定的法度

最权威的度量经来自十五世纪的勉拉顿珠（སྨན་ཐང་པ་སྨན་ལ་དོན་གྲུབ）——勉唐画派的开创者。他的著作《造像度量经》成为后世所有藏传画师必修的经典。

## 与达芬奇的对话

约 1490 年，达芬奇绘制《维特鲁威人》——根据古罗马建筑师维特鲁威的《建筑十书》，将人体置于圆与方之中，以确立人体的"完美比例"。

时间几乎重合：勉拉顿珠定下的度量经也建立于人体的精确比例。两个传统，相隔千山，几乎同时，得出了同一种洞见——**神圣形象需要精确的几何**。

这正是本次展览中作品《达芬奇的黄金分割与勉拉顿珠造像法度量经》所致敬的——东西方造像传统的相遇。
$body$,
  $body$# Iconometry: The Sacred Canon

The Tibetan iconometric canon (Tibetan: *thig gi rim pa*; Sanskrit: *tālamāna*) prescribes the exact proportions of every figure in thangka painting — buddhas, bodhisattvas, protectors, lineage masters. The unit is the *finger-width*.

## The basic canon

A standard Shakyamuni Buddha figure is **120 fingers** tall:
- Total height = 120 fingers
- Head = 12 fingers (1/10 of height)
- Brow to chin = 4 fingers
- Eye length = 1 finger
- Shoulder to shoulder = 24 fingers

Each class of deity has its own proportional system: bodhisattvas are slender (114 fingers), protectors are stockier, ḍākinīs are lighter.

## Who set the canon

The most authoritative version comes from the fifteenth-century master Menla Döndrup (སྨན་ཐང་པ་སྨན་ལ་དོན་གྲུབ) — founder of the Menri school. His treatise *The Iconometric Canon* became the indispensable text for every Tibetan painter after him.

## Dialogue with Da Vinci

Around 1490, Leonardo da Vinci drew the *Vitruvian Man* — based on the ancient Roman architect Vitruvius's *Ten Books on Architecture*, placing the human body within circle and square to establish the "perfect proportions" of the human form.

The timing is almost coincident: Menla Döndrup's canon was also founded on the precise proportions of the body. Two traditions, separated by mountain ranges, arrived at almost the same moment at the same insight — **a sacred image requires precise geometry**.

This is what the centerpiece work of our exhibition, *Da Vinci's Golden Ratio meets Menla Döndrup's Iconometric Canon*, honors — the meeting of these two traditions of measure.
$body$,
  $body$# Iconometria: Il Canone Sacro

Il canone iconometrico tibetano (tibetano: *thig gi rim pa*; sanscrito: *tālamāna*) prescrive le proporzioni esatte di ogni figura nella pittura thangka — buddha, bodhisattva, protettori, maestri di lignaggio. L'unità è la *larghezza di un dito*.

## Il canone di base

Una figura standard del Buddha Shakyamuni è alta **120 dita**:
- Altezza totale = 120 dita
- Testa = 12 dita (1/10 dell'altezza)
- Sopracciglio-mento = 4 dita
- Lunghezza dell'occhio = 1 dito
- Da spalla a spalla = 24 dita

Ogni classe di divinità ha il proprio sistema proporzionale: i bodhisattva sono slanciati (114 dita), i protettori più robusti, le ḍākinī più leggere.

## Chi stabilì il canone

La versione più autorevole proviene dal maestro del XV secolo Menla Döndrup (སྨན་ཐང་པ་སྨན་ལ་དོན་གྲུབ) — fondatore della scuola Menri. Il suo trattato *Il Canone Iconometrico* divenne il testo indispensabile per ogni pittore tibetano dopo di lui.

## Dialogo con Leonardo

Intorno al 1490, Leonardo da Vinci disegnò *l'Uomo Vitruviano* — basato sull'antico architetto romano Vitruvio e i suoi *Dieci libri di architettura*, collocando il corpo umano dentro cerchio e quadrato per stabilire le "proporzioni perfette" della figura umana.

I tempi sono quasi coincidenti: il canone di Menla Döndrup era anch'esso fondato sulle proporzioni precise del corpo. Due tradizioni, separate da catene montuose, giungono quasi nello stesso momento alla stessa intuizione — **un'immagine sacra richiede una geometria precisa**.

Questo è ciò che l'opera centrale della nostra mostra, *La Sezione Aurea di Leonardo & il Canone Iconometrico di Menla Döndrup*, celebra — l'incontro tra queste due tradizioni della misura.
$body$
),

(
  'how-to-read', 'iconography', 5, 4,
  '如何阅读唐卡', 'How to Read a Thangka', 'Come Leggere un Thangka',
  '主尊、眷属、空间、动物、火焰光——唐卡的图像是一种语言。',
  'Central deity, retinue, space, animals, flames — every thangka is a written sentence.',
  'Divinità centrale, seguito, spazio, animali, fiamme — ogni thangka è una frase.',
  $body$# 如何阅读唐卡

每一幅唐卡都遵循一种空间语法。理解了这套语法，你就能读懂画面。

## 中心：本尊

画面正中是**本尊**——这幅唐卡的主神。本尊的身份由几个标志确定：

- **身色**：白（观音）、绿（绿度母）、红（无量寿佛）、蓝（药师佛）、金（释迦牟尼）……
- **手印**：手势——禅定印、说法印、降魔印、施无畏印……
- **法器**：手持物——莲花、宝剑、经卷、净瓶、金刚杵……
- **坐姿**：金刚跏趺坐、半跏趺、立姿、舞姿……

## 周围：眷属

本尊周围是**眷属**——较小的护法、菩萨、上师、伴侣。他们的位置遵循严格的等级：

- 上方中心：本尊的上师传承（向上传至本初佛）
- 下方中心：本尊的护法
- 两侧：随侍菩萨或本尊的不同化身

## 空间：净土

唐卡背景常常是**净土**或**坛城**——本尊所居的清净世界。可能有：
- 莲花宝座
- 山水（青山绿水即净土）
- 云气、彩虹
- 圣山（须弥山）

## 动物与火焰

许多唐卡包含象征动物（孔雀、狮子、龙）与火焰光——后者是本尊的智慧之火。

掌握这些元素，你就能读懂任何一幅唐卡的"句子"。
$body$,
  $body$# How to Read a Thangka

Every thangka follows a spatial grammar. Once you know the grammar, you can read the picture.

## Center: the central figure

The central figure is the **principal deity** — the subject of this thangka. Their identity is determined by several markers:

- **Body color** — white (Avalokiteśvara), green (Tara), red (Amitāyus), blue (Bhaiṣajyaguru), gold (Shakyamuni)…
- **Mudrā** — the hand-gesture: meditation, teaching, earth-touching, fearlessness…
- **Attribute** — what they hold: lotus, sword, scripture, vase, vajra…
- **Posture** — full lotus, half lotus, standing, dancing…

## Around: the retinue

The principal is surrounded by **retinue figures** — smaller protectors, bodhisattvas, lineage masters, consorts. Their position is strictly hierarchical:

- Top center: the deity's lineage (upward to the primordial buddha)
- Bottom center: the deity's protectors
- Sides: attendant bodhisattvas or different forms of the deity

## Space: the pure land

The background of a thangka is often a **pure land** or **mandala palace** — the realm in which the deity dwells. There may be:
- A lotus throne
- Landscape (mountains and rivers ARE the pure land)
- Clouds, rainbows
- Sacred mountains (Sumeru)

## Animals and flames

Many thangkas include symbolic animals (peacocks, lions, dragons) and flame haloes — the latter is the deity's wisdom-fire.

Once you've identified these elements, you can read the "sentence" of any thangka.
$body$,
  $body$# Come Leggere un Thangka

Ogni thangka segue una grammatica spaziale. Una volta che si conosce la grammatica, si può leggere l'immagine.

## Centro: la figura principale

La figura centrale è la **divinità principale** — il soggetto del thangka. La sua identità è determinata da diversi indicatori:

- **Colore del corpo** — bianco (Avalokiteśvara), verde (Tara), rosso (Amitāyus), blu (Bhaiṣajyaguru), oro (Shakyamuni)…
- **Mudrā** — il gesto delle mani: meditazione, insegnamento, toccare la terra, intrepidezza…
- **Attributo** — ciò che tiene: loto, spada, scrittura, vaso, vajra…
- **Postura** — loto pieno, mezzo loto, in piedi, danzante…

## Intorno: il seguito

La figura principale è circondata dal **seguito** — protettori più piccoli, bodhisattva, maestri del lignaggio, consorti. La loro posizione è strettamente gerarchica:

- In alto al centro: il lignaggio della divinità (verso il buddha primordiale)
- In basso al centro: i protettori della divinità
- Ai lati: bodhisattva attendenti o forme diverse della divinità

## Spazio: la terra pura

Lo sfondo di un thangka è spesso una **terra pura** o un **palazzo del mandala** — il regno in cui dimora la divinità. Vi possono essere:
- Un trono di loto
- Paesaggio (montagne e fiumi SONO la terra pura)
- Nuvole, arcobaleni
- Montagne sacre (Sumeru)

## Animali e fiamme

Molti thangka includono animali simbolici (pavoni, leoni, draghi) e aureole di fiamma — queste ultime sono il fuoco-saggezza della divinità.

Una volta identificati questi elementi, si può leggere la "frase" di qualsiasi thangka.
$body$
),

(
  'sangji-cairang-lineage', 'lineage', 6, 4,
  '桑吉才让的传承', 'Sangji Cairang''s Lineage', 'Il Lignaggio di Sangji Cairang',
  '从张大千到夏吾才让，再到桑吉才让——七十年的传承之线。',
  'From Zhang Daqian to Xiawu Cairang to Sangji Cairang — a seventy-year thread of transmission.',
  'Da Zhang Daqian a Xiawu Cairang a Sangji Cairang — settant''anni di trasmissione.',
  $body$# 桑吉才让的传承

桑吉才让的师承线，连接了藏传佛教绘画与二十世纪中国艺术史。

## 张大千与敦煌

1941 至 1943 年，二十世纪中国最重要的画家之一**张大千**（1899-1983）赴敦煌临摹石窟壁画。两年间他完成了 276 幅临摹作品，几乎以一人之力将敦煌艺术带回中国画的视野。

在敦煌，他亲近了藏族画师，学习了唐卡的技法与精神——重彩、矿物颜料、严格的造像法度。这次相遇深刻影响了张大千此后的艺术。

## 夏吾才让

张大千在敦煌期间，**夏吾才让**（1922-2003）作为年轻的藏族画师追随张大千数年，亲承面授。夏吾才让后来成为热贡画派最重要的传承人之一，被称为"国家级非物质文化遗产传承人"。他将张大千传授的观察方法与传统热贡技法融合，开拓了热贡艺术的新境界。

## 桑吉才让

**桑吉才让**生于1971年，八岁拜入夏吾才让大师门下，成为关门弟子（即师傅最后一位、也是最亲近的弟子）。

他的师承因此可以这样追溯：

> **张大千 → 夏吾才让 → 桑吉才让**

这条线索意味着：本次展览的画家，与二十世纪中国画的最高峰之一，仅隔两代人。

## 当代成就

- 作品被中国工艺美术馆、北京恭王府、加拿大多伦多中华文化中心、四川峨眉山等多地收藏
- 2025 年获评中国轻工业一级高级技师
- 蓝毗尼佛教大学客座教授
- 中国-尼泊尔友好文化大使

本次佛罗伦萨展是他艺术生涯中第一次在欧洲的重要展览。
$body$,
  $body$# Sangji Cairang's Lineage

Sangji Cairang's master-line connects Tibetan Buddhist painting to twentieth-century Chinese art history.

## Zhang Daqian and Dunhuang

From 1941 to 1943, **Zhang Daqian** (1899-1983) — one of the great Chinese painters of the twentieth century — traveled to the Mogao Caves at Dunhuang to copy the Buddhist murals. Over two years he produced 276 copies, almost single-handedly bringing Dunhuang back into the Chinese painting tradition.

At Dunhuang he worked alongside Tibetan painters and learned thangka technique — heavy color, mineral pigments, strict iconometric canon. The encounter shaped his later work.

## Xiawu Cairang

During Zhang's Dunhuang period, **Xiawu Cairang** (1922-2003), then a young Tibetan painter, accompanied him for several years and received direct teaching. Xiawu Cairang went on to become one of the great masters of the Regong school — designated a national-level Inheritor of Intangible Cultural Heritage. He fused Zhang's methods of observation with traditional Regong technique, opening a new horizon for the school.

## Sangji Cairang

**Sangji Cairang** was born in 1971. At eight he entered the studio of Master Xiawu Cairang as his "closing disciple" — the master's last and most intimate student.

His lineage thus runs:

> **Zhang Daqian → Xiawu Cairang → Sangji Cairang**

The painter of this exhibition is two generations from one of the great peaks of twentieth-century Chinese painting.

## Honors

- Works collected by the China Arts and Crafts Museum, Prince Kung's Mansion (Beijing), the Toronto Chinese Cultural Centre, Mt. Emei (Sichuan), among others
- 2025 — designated First-Class Senior Technician (China Light Industry)
- Visiting Professor, Lumbini Buddhist University
- Goodwill Cultural Ambassador, China-Nepal

This Florence exhibition is his first major show in Europe.
$body$,
  $body$# Il Lignaggio di Sangji Cairang

La linea maestra di Sangji Cairang collega la pittura buddhista tibetana alla storia dell'arte cinese del XX secolo.

## Zhang Daqian e Dunhuang

Dal 1941 al 1943, **Zhang Daqian** (1899-1983) — uno dei grandi pittori cinesi del XX secolo — si recò alle Grotte di Mogao a Dunhuang per copiare i murali buddhisti. In due anni produsse 276 copie, riportando quasi da solo Dunhuang nella tradizione pittorica cinese.

A Dunhuang lavorò accanto a pittori tibetani e apprese la tecnica del thangka — colore pesante, pigmenti minerali, rigoroso canone iconometrico. L'incontro segnò la sua opera successiva.

## Xiawu Cairang

Durante il periodo di Zhang a Dunhuang, **Xiawu Cairang** (1922-2003), allora giovane pittore tibetano, lo accompagnò per diversi anni ricevendo insegnamento diretto. Xiawu Cairang divenne poi uno dei grandi maestri della scuola di Regong — designato Erede del Patrimonio Culturale Immateriale a livello nazionale. Fuse i metodi di osservazione di Zhang con la tradizionale tecnica di Regong, aprendo un nuovo orizzonte per la scuola.

## Sangji Cairang

**Sangji Cairang** è nato nel 1971. A otto anni entrò nello studio del Maestro Xiawu Cairang come suo "discepolo di chiusura" — l'ultimo e più intimo studente del maestro.

Il suo lignaggio scorre quindi così:

> **Zhang Daqian → Xiawu Cairang → Sangji Cairang**

Il pittore di questa mostra è a due generazioni da una delle grandi vette della pittura cinese del Novecento.

## Riconoscimenti

- Opere collezionate dal Museo Cinese dell'Arte e Artigianato, dalla Residenza del Principe Kung (Pechino), dal Centro Culturale Cinese di Toronto, dal Monte Emei (Sichuan), tra altri
- 2025 — designato Tecnico Senior di Prima Classe (Industria Leggera Cinese)
- Professore Ospite, Università Buddhista di Lumbini
- Ambasciatore Culturale di Buona Volontà, Cina-Nepal

Questa mostra a Firenze è la sua prima grande esposizione in Europa.
$body$
);


-- Update related_artwork_slugs for cross-linking with David's RAG
UPDATE public.feiyi_knowledge SET related_artwork_slugs = ARRAY['davinci-menla', 'confucius-socrates']
  WHERE slug = 'iconometry';
UPDATE public.feiyi_knowledge SET related_artwork_slugs = ARRAY['mahavairocana-2022', 'green-tara-2022', 'yamantaka-2010']
  WHERE slug = 'mineral-pigments';
UPDATE public.feiyi_knowledge SET related_artwork_slugs = ARRAY['atisha-2025']
  WHERE slug = 'sangji-cairang-lineage';


-- =============================================================================
-- 13. PUBLIC VIEWS
-- =============================================================================
CREATE OR REPLACE VIEW public.feiyi_knowledge_public AS
SELECT
  id, slug, category, display_order, reading_minutes,
  title_zh, title_en, title_it,
  excerpt_zh, excerpt_en, excerpt_it,
  hero_image_url, related_artwork_slugs,
  created_at, updated_at
FROM public.feiyi_knowledge
WHERE is_published = true
ORDER BY display_order;

CREATE OR REPLACE VIEW public.feiyi_organizer_public AS
SELECT
  id, exhibition_id, slug, type,
  name_zh, name_en, name_it,
  description_zh, description_en, description_it,
  logo_url, website_url, display_order
FROM public.feiyi_organizer
WHERE is_active = true
ORDER BY
  CASE type
    WHEN 'host' THEN 1
    WHEN 'organizer' THEN 2
    WHEN 'co_organizer' THEN 3
    WHEN 'supporter' THEN 4
    WHEN 'sponsor' THEN 5
    WHEN 'media' THEN 6
    ELSE 99
  END,
  display_order;
