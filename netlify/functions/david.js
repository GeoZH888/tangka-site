/**
 * /api/david — David the AI guide.
 *
 * Pipeline:
 *   1. Receive { message, language, artworkSlug, sessionHash, history }
 *   2. Embed the message via OpenAI text-embedding-3-small (1536 dims)
 *   3. Call match_feiyi_knowledge() RPC for top-5 similar chunks (same language)
 *   4. Compose a system prompt from feiyi_david_persona + retrieved context
 *   5. Send to Anthropic (claude-haiku-4-5 default)
 *   6. Log the exchange to feiyi_david_conversation
 *   7. Return { reply, retrieved_chunks_count, model }
 *
 * All errors fail closed → return persona fallback message.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
const EMBEDDING_MODEL = 'text-embedding-3-small';

// Service-role client (full DB access — never expose this client-side)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req) {
  const startTime = Date.now();

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const {
    message = '',
    language = 'en',
    artworkSlug = null,
    sessionHash = 'anon',
    history = [],
  } = body;

  // Basic validation
  const msg = (message || '').trim();
  if (!msg) return json({ error: 'Empty message' }, 400);
  if (msg.length > 600) return json({ error: 'Message too long' }, 400);
  if (!['zh', 'en', 'it'].includes(language)) {
    return json({ error: 'Unsupported language' }, 400);
  }

  // Look up exhibition + artwork ID for logging
  let exhibitionId = null;
  let artworkId = null;
  try {
    const { data: ex } = await supabase
      .from('feiyi_exhibition')
      .select('id')
      .eq('slug', process.env.VITE_EXHIBITION_SLUG || 'sacred-measures-2026')
      .maybeSingle();
    exhibitionId = ex?.id || null;
    if (artworkSlug) {
      const { data: aw } = await supabase
        .from('feiyi_artwork')
        .select('id')
        .eq('slug', artworkSlug)
        .maybeSingle();
      artworkId = aw?.id || null;
    }
  } catch (_) {}

  // Load persona
  let persona = null;
  try {
    const { data } = await supabase
      .from('feiyi_david_persona')
      .select('system_prompt, fallback_zh, fallback_en, fallback_it, refusal_zh, refusal_en, refusal_it')
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    persona = data;
  } catch (e) {
    return logAndFallback({
      sessionHash, language, message: msg,
      exhibitionId, artworkId, latency: Date.now() - startTime,
      outcome: 'error', error: 'persona_load_failed',
      fallback: defaultFallback(language),
    });
  }

  if (!persona) {
    return logAndFallback({
      sessionHash, language, message: msg,
      exhibitionId, artworkId, latency: Date.now() - startTime,
      outcome: 'error', error: 'no_persona',
      fallback: defaultFallback(language),
    });
  }

  // 1. Embed the message
  let embedding;
  try {
    embedding = await embedText(msg);
  } catch (e) {
    return logAndFallback({
      sessionHash, language, message: msg,
      exhibitionId, artworkId, latency: Date.now() - startTime,
      outcome: 'error', error: `embed_failed: ${e.message}`,
      fallback: persona[`fallback_${language}`] || defaultFallback(language),
    });
  }

  // 2. Retrieve top-k similar chunks
  let chunks = [];
  try {
    const { data, error } = await supabase.rpc('match_feiyi_knowledge', {
      query_embedding: embedding,
      query_language: language,
      match_count: 5,
      similarity_threshold: 0.4,
    });
    if (error) throw error;
    chunks = data || [];
  } catch (e) {
    // RAG miss is non-fatal — fall through with empty context.
    console.warn('[david] RAG search failed:', e.message);
  }

  // 3. Compose context block
  const contextBlock = chunks.length
    ? chunks
        .map((c, i) => `[${i + 1}] (${c.source_type}/${c.source_slug || '—'})\n${c.chunk_text}`)
        .join('\n\n---\n\n')
    : '(No specific context retrieved. Be honest if you don\'t know.)';

  // Adjust system prompt with current artwork hint if present
  let systemPrompt = persona.system_prompt;
  if (artworkSlug) {
    systemPrompt += `\n\nThe visitor is currently looking at the artwork with slug "${artworkSlug}". If your answer relates to that work, refer to it directly.`;
  }
  systemPrompt += `\n\nCONTEXT (passages from the exhibition's knowledge base — base your answer ONLY on these):\n\n${contextBlock}\n\nVisitor's language is "${language}". Reply ONLY in that language.`;

  // 4. Build messages history for Anthropic
  const messages = [];
  for (const h of history) {
    if (!h?.text || !h?.role) continue;
    messages.push({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.text,
    });
  }
  messages.push({ role: 'user', content: msg });

  // 5. Call Anthropic
  let reply, inTok = null, outTok = null, outcome = 'success';
  try {
    const result = await callAnthropic({
      model: ANTHROPIC_MODEL,
      system: systemPrompt,
      messages,
      max_tokens: 400,
    });
    reply = result.text;
    inTok = result.input_tokens;
    outTok = result.output_tokens;
  } catch (e) {
    return logAndFallback({
      sessionHash, language, message: msg,
      exhibitionId, artworkId, latency: Date.now() - startTime,
      outcome: 'error', error: `anthropic_failed: ${e.message}`,
      fallback: persona[`fallback_${language}`] || defaultFallback(language),
      retrievedChunks: chunks,
    });
  }

  if (!reply) {
    return logAndFallback({
      sessionHash, language, message: msg,
      exhibitionId, artworkId, latency: Date.now() - startTime,
      outcome: 'error', error: 'empty_reply',
      fallback: persona[`fallback_${language}`] || defaultFallback(language),
    });
  }

  // 6. Log success
  const latency = Date.now() - startTime;
  try {
    await supabase.from('feiyi_david_conversation').insert({
      exhibition_id: exhibitionId,
      artwork_id: artworkId,
      session_hash: sessionHash,
      language,
      user_message: msg,
      assistant_reply: reply,
      retrieved_chunks: chunks.map(c => ({
        slug: c.source_slug,
        type: c.source_type,
        similarity: c.similarity,
      })),
      input_tokens: inTok,
      output_tokens: outTok,
      model: ANTHROPIC_MODEL,
      latency_ms: latency,
      outcome,
    });
  } catch (e) {
    console.warn('[david] log failed:', e.message);
  }

  return json({
    reply,
    retrieved_chunks_count: chunks.length,
    model: ANTHROPIC_MODEL,
    latency_ms: latency,
  });
}

// --- helpers --------------------------------------------------------------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function defaultFallback(language) {
  return language === 'zh'
    ? '我现在无法回答您的问题，请稍后再试。'
    : language === 'it'
      ? 'Non posso rispondere in questo momento — riprovi tra poco, La prego.'
      : 'I can\u2019t answer just now — please try again in a moment.';
}

async function logAndFallback({
  sessionHash, language, message, exhibitionId, artworkId,
  latency, outcome, error, fallback, retrievedChunks = [],
}) {
  try {
    await supabase.from('feiyi_david_conversation').insert({
      exhibition_id: exhibitionId,
      artwork_id: artworkId,
      session_hash: sessionHash,
      language,
      user_message: message,
      assistant_reply: fallback,
      retrieved_chunks: retrievedChunks.map(c => ({
        slug: c.source_slug, similarity: c.similarity,
      })),
      latency_ms: latency,
      model: ANTHROPIC_MODEL,
      outcome,
      error_message: error,
    });
  } catch (_) {}
  return json({ reply: fallback, model: ANTHROPIC_MODEL, latency_ms: latency, error });
}

async function embedText(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) {
    const e = await res.text().catch(() => '');
    throw new Error(`embedding ${res.status}: ${e.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.data[0].embedding;
}

async function callAnthropic({ model, system, messages, max_tokens }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, system, messages, max_tokens }),
  });
  if (!res.ok) {
    const e = await res.text().catch(() => '');
    throw new Error(`anthropic ${res.status}: ${e.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.content
    ?.filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n') || '';
  return {
    text,
    input_tokens: data.usage?.input_tokens,
    output_tokens: data.usage?.output_tokens,
  };
}
