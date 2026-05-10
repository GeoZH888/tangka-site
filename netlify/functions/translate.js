/**
 * /api/translate — Chinese → English + Italian translation.
 *
 * Specialized for the Sacred Measures exhibition: thangka iconography,
 * Buddhist terminology, Tibetan/Sanskrit names, Renaissance art context.
 *
 * Input:
 *   { zh: "中文文本", kind: "title" | "materials" | "description" | "category" | "name" | "bio" | "generic" }
 * Output:
 *   { en: "...", it: "..." }
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-haiku-4-5-20251001';

// Authorize: optional shared studio password (same one the studio uses)
function checkAuth(req) {
  const expected = process.env.STUDIO_PASSWORD;
  if (!expected) return true; // No password configured = open
  return req.headers.get('x-studio-password') === expected;
}

// Glossary — proper Sanskrit/Tibetan transliteration for common iconographic names
const GLOSSARY = `
GLOSSARY (use these established forms exactly):

Buddhas / deities:
  大日如来 → Mahāvairocana
  阿弥陀佛 → Amitābha
  无量寿佛 / 长寿佛 → Amitāyus
  释迦牟尼 / 释迦牟尼佛 → Shakyamuni Buddha
  药师佛 → Bhaiṣajyaguru (Medicine Buddha)
  毗卢遮那 → Vairocana
  弥勒 → Maitreya

Bodhisattvas:
  观世音 / 观音 / 四臂观音 → Avalokiteśvara / Four-Armed Avalokiteśvara
  绿度母 → Green Tara
  白度母 → White Tara
  度母 → Tara
  文殊 / 文殊菩萨 → Mañjuśrī
  普贤 / 普贤菩萨 → Samantabhadra
  地藏 → Kṣitigarbha
  狮子吼菩萨 / 狮吼观音 → Siṃhanāda

Wrathful / yidam:
  大威德金刚 → Yamāntaka
  密集金刚 → Guhyasamāja
  金刚手 → Vajrapāṇi

Masters / lineage:
  莲花生大师 → Padmasambhava (Guru Rinpoche)
  阿底峡 / 阿底峡尊者 → Atiśa
  宗喀巴 → Tsongkhapa
  桑吉才让 → Sangji Cairang
  夏吾才让 / 夏吾才郎 → Xiawu Cairang
  张大千 → Zhang Daqian
  勉拉顿珠 → Menla Döndrup
  仲敦巴 → Dromtönpa
  更登达吉 → Gendun Dargye

Schools / lineages:
  热贡 / 热贡画派 → Regong school
  勉唐 / 勉唐派 → Menri school
  噶玛嘎赤 → Karma Gardri
  格鲁派 → Gelug school
  噶当派 → Kadam school

Categories:
  彩唐 → polychrome thangka / thangka policromo
  红唐 → red thangka / thangka rosso
  墨唐 → monochrome ink thangka / thangka monocromo a inchiostro
  金唐 → gold thangka / thangka in oro

Materials:
  纯金 矿物颜料 → pure gold and mineral pigments / oro puro e pigmenti minerali
  矿物颜料 → mineral pigments / pigmenti minerali
  棉布 → cotton ground / fondo di cotone
  绢本 → silk ground / fondo di seta

Concepts:
  度量经 → iconometric canon / canone iconometrico
  造像度量 → iconometry / iconometria
  曼荼罗 → maṇḍala
  唐卡 → thangka
  非物质文化遗产 → intangible cultural heritage / patrimonio culturale immateriale

Places:
  敦煌 → Dunhuang
  夏鲁寺 → Shalu Monastery / Monastero di Shalu
  白居寺 → Pelkhor Chode (Pelkor Chöde) / Pelkhor Chode
  扎唐寺 → Drathang Monastery / Monastero di Drathang
  古格 → Guge (kingdom)
  拉萨 → Lhasa
  日喀则 → Shigatse / Shigatse
`;

const PROMPTS = {
  title: `Translate this thangka artwork title from Chinese into English and Italian.
- Keep it concise (suitable for a museum label).
- Use standard Sanskrit/Tibetan transliteration with diacritics where appropriate.
- For deity names, use the established Sanskrit form (e.g. "Mahāvairocana" not "Great Sun Buddha").
- Do not translate the title literally if a standard iconographic name exists.`,
  materials: `Translate this list of artwork materials from Chinese into English and Italian.
- Use the conventional museum-catalog phrasing (e.g. "Mineral pigments and pure gold on cotton").
- Brief; no extra explanation.`,
  category: `Translate this thangka category designation from Chinese into English and Italian.
- Use the conventional translation (彩唐 = "polychrome thangka", 红唐 = "red thangka", 墨唐 = "monochrome ink thangka", etc.)`,
  name: `Translate this person's name or institution name from Chinese into English and Italian.
- For Tibetan/Sanskrit names, use the established Latin transliteration with diacritics.
- For modern Chinese names, use pinyin.
- For Italian, names typically don't change but adjust if conventional Italian form exists.`,
  bio: `Translate this artist biography from Chinese into English and Italian.
- Tone: museum-grade, art-historical, slightly formal but readable.
- Preserve all proper names using the glossary forms.
- Preserve paragraph structure and bullet lists.
- Do not abbreviate; render the full content.`,
  description: `Translate this thangka artwork description from Chinese into English and Italian.
- Tone: museum wall label / catalog. Educated readers, accurate but accessible.
- Use the glossary's transliterations for all deity names, lineage names, places, schools.
- Preserve paragraph breaks. Do not abbreviate.
- Render Buddhist concepts using established Western Buddhological vocabulary
  (e.g. "Dharmakāya" not "Body of Truth"; "lotus throne" not "lotus seat platform").
- For Italian, use vocaboli buddhologici standard.`,
  generic: `Translate this Chinese text into English and Italian, preserving meaning, tone, and structure.`,
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!checkAuth(req)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  if (!ANTHROPIC_API_KEY) {
    return json({ error: 'ANTHROPIC_API_KEY not configured on server' }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const zh = (body.zh || '').trim();
  const kind = body.kind || 'generic';

  if (!zh) {
    return json({ en: '', it: '' });
  }
  if (zh.length > 6000) {
    return json({ error: 'Text too long (max 6000 chars)' }, 400);
  }

  const instruction = PROMPTS[kind] || PROMPTS.generic;

  const systemPrompt = `You are a professional translator specializing in Tibetan Buddhist art for an exhibition in Florence, Italy bridging Tibetan thangka and Italian Renaissance traditions.

${instruction}

${GLOSSARY}

OUTPUT FORMAT — ONLY valid JSON, no commentary, no markdown fences:
{"en": "English translation here", "it": "Italian translation here"}

Rules:
- Output ONLY the JSON object, nothing else.
- Use double-quoted strings; escape internal quotes and newlines properly.
- Do not include the original Chinese in the output.
- If the input is already in English or Italian, translate to whatever is missing and detect the source language; otherwise translate from Chinese.`;

  try {
    const result = await callAnthropic({
      system: systemPrompt,
      messages: [{ role: 'user', content: `Chinese:\n\n${zh}` }],
      max_tokens: 4000,
    });

    // Parse the JSON response — Claude sometimes wraps in markdown despite instructions
    let parsed;
    try {
      const cleaned = result.text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Try to extract JSON object from anywhere in response
      const match = result.text.match(/\{[\s\S]*"en"[\s\S]*"it"[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return json({
          error: 'Translation parse failed',
          raw: result.text.slice(0, 400),
        }, 500);
      }
    }

    return json({
      en: parsed.en || '',
      it: parsed.it || '',
      input_tokens: result.input_tokens,
      output_tokens: result.output_tokens,
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// === helpers ===

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function callAnthropic({ system, messages, max_tokens }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, system, messages, max_tokens }),
  });
  if (!res.ok) {
    const e = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${e.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = (data.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');
  return {
    text,
    input_tokens: data.usage?.input_tokens,
    output_tokens: data.usage?.output_tokens,
  };
}
