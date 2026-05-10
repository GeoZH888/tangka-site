import { useEffect } from 'react';

/**
 * FlashToast — fixed-position toast for save/error feedback.
 *
 * Replaces the inline .adm-flash messages that get lost when the user
 * has scrolled down to a button below the fold. This stays in the
 * bottom-right corner of the viewport so it's always visible.
 *
 * Auto-dismisses after 4 seconds for success/info; persists for errors
 * (so the user can read what went wrong) until manually dismissed or
 * superseded.
 *
 * Props:
 *   - flash: { kind: 'success' | 'error' | 'info', text: string } | null
 *   - onDismiss: () => void
 */
export default function FlashToast({ flash, onDismiss }) {
  useEffect(() => {
    if (!flash) return;
    if (flash.kind === 'error') return; // errors persist
    const t = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(t);
  }, [flash, onDismiss]);

  if (!flash) return null;

  return (
    <div className={`flash-toast flash-toast--${flash.kind}`} role="status">
      <span className="flash-toast__text">{flash.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="flash-toast__close"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
