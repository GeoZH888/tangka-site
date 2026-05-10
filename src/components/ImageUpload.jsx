import { useState, useRef, useEffect } from 'react';
import { uploadToBucket } from '../lib/admin.js';

/**
 * Image dropzone with three input methods:
 *   1. Drag and drop a file from anywhere
 *   2. Click to open the system file picker
 *   3. Paste from clipboard (Ctrl+V / Cmd+V) anywhere on the page
 *      while the dropzone is "armed" (focused or hovered)
 *
 * Why all three:
 *   - Drag-drop is fastest when the file is on the desktop
 *   - Click is the universal fallback
 *   - Paste handles screenshots, "copy image" from any browser/website,
 *     and copying from a file manager — without needing to save a file first
 *
 * Props:
 *   - bucket:      Supabase storage bucket
 *   - folder:      subfolder within the bucket (optional)
 *   - filename:    name to save as (without extension); falls back to
 *                  pasted-image-{timestamp} for clipboard sources without a name
 *   - currentUrl:  current image URL to show as preview
 *   - onUploaded:  callback(publicUrl) on success
 *   - aspectRatio: CSS aspect-ratio for the preview, default '4/5'
 *   - hint:        helper text shown when no image yet
 */
export default function ImageUpload({
  bucket,
  folder = '',
  filename,
  currentUrl,
  onUploaded,
  aspectRatio = '4/5',
  hint = 'Drop image here, click to browse, or paste from clipboard',
}) {
  const dropzoneRef = useRef(null);
  const inputRef = useRef(null);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [pasteHint, setPasteHint] = useState(false);

  // === Paste handler — listens globally on this dropzone ===
  // We attach to the document so paste works even when the dropzone isn't
  // strictly focused, but only fires if the user is actively interacting
  // with this dropzone (hovered or it has focus).
  useEffect(() => {
    function onPaste(e) {
      // Only respond if this dropzone is hovered or focused.
      // Prevents every dropzone on the page from grabbing the same paste.
      const node = dropzoneRef.current;
      if (!node) return;
      const isFocused = node.contains(document.activeElement) || document.activeElement === node;
      if (!hovered && !isFocused) return;

      // Find an image in the clipboard
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleFile(file);
          return;
        }
      }
    }
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered, filename, bucket, folder]);

  // Visual cue when user hovers — "Ctrl+V to paste" hint after a moment
  useEffect(() => {
    if (!hovered) { setPasteHint(false); return; }
    const t = setTimeout(() => setPasteHint(true), 600);
    return () => clearTimeout(t);
  }, [hovered]);

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Not an image. Try a JPG, PNG, or WebP.');
      return;
    }
    // Refuse upload if no slug-derived filename was set — otherwise the file
    // would land at "untitled.png" and clutter the bucket. Also, Storage
    // rejects paths with spaces, apostrophes, and uppercase characters
    // (returns a misleading 403 RLS error), so we sanitize aggressively.
    if (!filename || filename === 'untitled' || filename.trim() === '') {
      setError('Set the slug first (e.g. "mahavairocana-2022"), then upload.');
      return;
    }
    setError('');
    setProgress(0);

    try {
      // Resolve filename with extension
      const extMatch = file.name?.match(/\.([a-z0-9]+)$/i);
      const mimeExt = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
      const ext = (extMatch ? extMatch[1] : mimeExt).toLowerCase();

      const safeFilename = filename
        ? filename.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
        : (file.name?.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase()
           || `pasted-${Date.now()}`);
      // Sanitize folder defensively — Storage rejects paths with spaces,
      // apostrophes, or uppercase chars (returns misleading 403 RLS error).
      // This converts e.g. "DAL CUORE DELL'HIMALAYA" → "dal-cuore-dell-himalaya".
      const safeFolder = folder
        ? folder.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
        : '';
      const path = safeFolder ? `${safeFolder}/${safeFilename}.${ext}` : `${safeFilename}.${ext}`;

      const url = await uploadToBucket({
        bucket, path, file,
        onProgress: setProgress,
      });
      setProgress(100);
      onUploaded?.(`${url}?t=${Date.now()}`);
      setTimeout(() => setProgress(null), 500);
    } catch (e) {
      console.error('[ImageUpload] failed', e);
      setError(e.message || 'Upload failed');
      setProgress(null);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <div
        ref={dropzoneRef}
        tabIndex={0}
        className={`dropzone ${active ? 'dropzone--active' : ''} ${currentUrl ? 'dropzone--has-image' : ''}`}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDragOver={(e) => { e.preventDefault(); setActive(true); }}
        onDragLeave={() => setActive(false)}
        onDrop={onDrop}
      >
        {currentUrl ? (
          <>
            <div
              className="dropzone__preview"
              style={{ backgroundImage: `url(${currentUrl})`, aspectRatio }}
            />
            <div className="dropzone__overlay">
              {pasteHint ? 'Drop · click · or Ctrl+V to replace' : 'Drop or click to replace'}
            </div>
          </>
        ) : (
          <>
            <div className="dropzone__icon">⬆</div>
            <div className="dropzone__hint">{hint}</div>
            {pasteHint && !currentUrl && (
              <div className="dropzone__paste-hint">
                Press <kbd>Ctrl+V</kbd> to paste
              </div>
            )}
          </>
        )}

        {progress !== null && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px' }}>
            <div className="dropzone__progress">
              <div className="dropzone__progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <div className="adm-flash adm-flash--error" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
}
