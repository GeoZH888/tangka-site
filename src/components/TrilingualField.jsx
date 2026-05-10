import { useState } from 'react';

/**
 * Chinese-first trilingual field.
 * Type once in Chinese; click "Translate" to fill English + Italian via AI.
 * Both EN and IT remain editable for manual tweaks after translation.
 *
 * Props:
 *   - label: human-readable label, e.g. "Title"
 *   - kind: "title" | "materials" | "category" | "name" | "bio" | "description" | "generic"
 *   - zh, en, it: current values (controlled)
 *   - onChange(field, value): callback for any of the three field changes
 *   - multiline: true → use textareas, false → use inputs
 *   - rows: rows for textarea
 *   - required: shows asterisk
 */
export default function TrilingualField({
  label,
  kind = 'generic',
  zh, en, it,
  onChange,
  multiline = false,
  rows = 3,
  required = false,
}) {
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');

  async function translate() {
    if (!zh || !zh.trim()) {
      setError('Type Chinese first.');
      return;
    }
    setTranslating(true);
    setError('');
    try {
      // Get studio password if set, to authorize the function
      let pwdHeader = {};
      try {
        const stored = sessionStorage.getItem('studio_password');
        if (stored) pwdHeader = { 'x-studio-password': stored };
      } catch (_) {}

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...pwdHeader },
        body: JSON.stringify({ zh: zh.trim(), kind }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      onChange('en', data.en || '');
      onChange('it', data.it || '');
    } catch (e) {
      setError(e.message || 'Translation failed');
    } finally {
      setTranslating(false);
    }
  }

  const InputCtl = multiline ? 'textarea' : 'input';
  const inputProps = multiline ? { rows } : {};

  return (
    <div className="tlf">
      <div className="tlf__head">
        <span className={`tlf__label ${required ? 'adm-label-req' : ''}`}>{label}</span>
        <button
          type="button"
          onClick={translate}
          disabled={translating || !zh || !zh.trim()}
          className="tlf__translate"
          title="Translate Chinese → English & Italian using AI"
        >
          {translating ? '⋯ translating' : '✦ translate to EN & IT'}
        </button>
      </div>

      {error && <div className="tlf__error">{error}</div>}

      <div className="tlf__row tlf__row--zh">
        <span className="tlf__tag tlf__tag--primary">中文</span>
        <InputCtl
          {...inputProps}
          className={multiline ? 'adm-input adm-textarea' : 'adm-input'}
          value={zh || ''}
          onChange={(e) => onChange('zh', e.target.value)}
          placeholder={multiline ? '在此输入中文…' : '中文'}
        />
      </div>

      <div className="tlf__row tlf__row--secondary">
        <span className="tlf__tag">EN</span>
        <InputCtl
          {...inputProps}
          className={multiline ? 'adm-input adm-textarea' : 'adm-input'}
          value={en || ''}
          onChange={(e) => onChange('en', e.target.value)}
          placeholder={translating ? '…' : '(will fill after translate)'}
        />
      </div>

      <div className="tlf__row tlf__row--secondary">
        <span className="tlf__tag">IT</span>
        <InputCtl
          {...inputProps}
          className={multiline ? 'adm-input adm-textarea' : 'adm-input'}
          value={it || ''}
          onChange={(e) => onChange('it', e.target.value)}
          placeholder={translating ? '…' : '(will fill after translate)'}
        />
      </div>
    </div>
  );
}
