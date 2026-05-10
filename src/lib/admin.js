import { supabase, EXHIBITION_SLUG } from './supabase.js';

/**
 * Admin-side helpers for CRUD on all feiyi_* tables.
 * These rely on RLS — only authenticated admin users can write.
 */

// === EXHIBITION ===
export async function adminFetchExhibition() {
  const { data, error } = await supabase
    .from('feiyi_exhibition')
    .select('*')
    .eq('slug', EXHIBITION_SLUG)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpdateExhibition(id, patch) {
  const { data, error } = await supabase
    .from('feiyi_exhibition')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// === ARTWORKS ===
export async function adminFetchArtworks() {
  const { data, error } = await supabase
    .from('feiyi_artwork')
    .select('*, feiyi_exhibition!inner(slug)')
    .eq('feiyi_exhibition.slug', EXHIBITION_SLUG)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function adminFetchArtwork(id) {
  const { data, error } = await supabase
    .from('feiyi_artwork')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertArtwork(row) {
  // If id exists → update; else → insert
  const { id, ...rest } = row;
  if (id) {
    const { data, error } = await supabase
      .from('feiyi_artwork')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('feiyi_artwork')
    .insert(rest)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function adminDeleteArtwork(id) {
  const { error } = await supabase.from('feiyi_artwork').delete().eq('id', id);
  if (error) throw error;
}

// === ARTIST ===
export async function adminFetchArtist() {
  const { data, error } = await supabase
    .from('feiyi_artist')
    .select('*')
    .eq('slug', 'sangji-cairang')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpdateArtist(id, patch) {
  const { data, error } = await supabase
    .from('feiyi_artist')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// === KNOWLEDGE ===
export async function adminFetchKnowledgeAll() {
  const { data, error } = await supabase
    .from('feiyi_knowledge')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function adminFetchKnowledge(id) {
  const { data, error } = await supabase
    .from('feiyi_knowledge')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertKnowledge(row) {
  const { id, ...rest } = row;
  if (id) {
    const { data, error } = await supabase
      .from('feiyi_knowledge')
      .update(rest).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('feiyi_knowledge').insert(rest).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeleteKnowledge(id) {
  const { error } = await supabase.from('feiyi_knowledge').delete().eq('id', id);
  if (error) throw error;
}

// === ORGANIZERS ===
export async function adminFetchOrganizers(exhibitionId) {
  const { data, error } = await supabase
    .from('feiyi_organizer')
    .select('*')
    .eq('exhibition_id', exhibitionId)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function adminUpsertOrganizer(row) {
  const { id, ...rest } = row;
  if (id) {
    const { data, error } = await supabase
      .from('feiyi_organizer').update(rest).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('feiyi_organizer').insert(rest).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeleteOrganizer(id) {
  const { error } = await supabase.from('feiyi_organizer').delete().eq('id', id);
  if (error) throw error;
}

// === DAVID PERSONA ===
export async function adminFetchPersona() {
  const { data, error } = await supabase
    .from('feiyi_david_persona')
    .select('*')
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpdatePersona(id, patch) {
  const { data, error } = await supabase
    .from('feiyi_david_persona')
    .update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// === DAVID CONVERSATIONS ===
export async function adminFetchConversations({ limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('feiyi_david_conversation')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

// === STATS ===
export async function adminFetchStats() {
  // Run several count queries in parallel
  const [aw, kn, conv, scans] = await Promise.all([
    supabase.from('feiyi_artwork').select('id', { count: 'exact', head: true }),
    supabase.from('feiyi_knowledge').select('id', { count: 'exact', head: true }),
    supabase.from('feiyi_david_conversation').select('id', { count: 'exact', head: true }),
    supabase.from('feiyi_audio_guide_view').select('id', { count: 'exact', head: true }),
  ]);
  return {
    artworks: aw.count || 0,
    knowledge: kn.count || 0,
    conversations: conv.count || 0,
    audio_scans: scans.count || 0,
  };
}

// === STORAGE UPLOAD ===
/**
 * Upload a file to a bucket folder, return public URL.
 * Calls onProgress(percent) periodically if provided.
 *
 * Uses the anon key directly — no JWT required.
 * RLS allows anon writes to feiyi-* buckets (see schema_v3_studio.sql).
 */
export async function uploadToBucket({ bucket, path, file, onProgress }) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${anonKey}`);
    xhr.setRequestHeader('apikey', anonKey);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'true');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
        resolve(publicUrl);
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

/**
 * Trigger a re-embedding (calls the Netlify function).
 * Use after edits to knowledge or artwork descriptions.
 *
 * In the studio (no-auth) version, the function uses a shared
 * studio password instead of a JWT. Set STUDIO_PASSWORD in Netlify env.
 */
export async function adminTriggerReembed() {
  const res = await fetch('/api/reembed', { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
