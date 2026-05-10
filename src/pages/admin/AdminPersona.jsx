import { useEffect, useState } from 'react';
import { adminFetchPersona, adminUpdatePersona } from '../../lib/admin.js';
import TrilingualField from '../../components/TrilingualField.jsx';
import FlashToast from '../../components/FlashToast.jsx';

export default function AdminPersona() {
  const [row, setRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    adminFetchPersona().then(setRow);
  }, []);

  function set(field, value) { setRow((r) => ({ ...r, [field]: value })); }
  function setLang(prefix, lang, value) {
    setRow((r) => ({ ...r, [`${prefix}_${lang}`]: value }));
  }

  async function save() {
    setSaving(true);
    setFlash(null);
    try {
      const { id, ...patch } = row;
      delete patch.created_at; delete patch.updated_at;
      await adminUpdatePersona(id, patch);
      setFlash({ kind: 'success', text: '✓ Saved. Changes take effect on next page load.' });
    } catch (e) {
      console.error('[admin save error]', e);
      setFlash({ kind: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  }

  if (!row) return <div className="loading-state">…</div>;

  return (
    <>
      <FlashToast flash={flash} onDismiss={() => setFlash(null)} />
      <div className="admin-head">
        <div>
          <h1>David — voice / 大卫的语调</h1>
          <div className="admin-head__sub">System prompt and trilingual canned responses</div>
        </div>
      </div>
<div className="adm-flash adm-flash--info" style={{ marginBottom: 'var(--sp-6)' }}>
        Editing David's voice changes how he talks to every visitor. Test thoroughly. The system prompt below is in English (Claude's instruction language); the greetings/fallbacks/refusals are what visitors actually see.
      </div>

      <div className="adm-form">
        <div className="adm-row">
          <div className="adm-label adm-label-req">System prompt</div>
          <div>
            <textarea
              className="adm-input adm-textarea adm-textarea--lg adm-textarea--code"
              style={{ minHeight: 400 }}
              value={row.system_prompt || ''}
              onChange={(e) => set('system_prompt', e.target.value)}
            />
            <div className="adm-help">
              The master instructions sent to Claude. In English. Controls David's role, tone, what he refuses to discuss.
            </div>
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Greeting / 问候语"
              kind="generic"
              multiline rows={2}
              zh={row.greeting_zh} en={row.greeting_en} it={row.greeting_it}
              onChange={(lang, val) => setLang('greeting', lang, val)}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Fallback (when API fails) / 故障消息"
              kind="generic"
              multiline rows={2}
              zh={row.fallback_zh} en={row.fallback_en} it={row.fallback_it}
              onChange={(lang, val) => setLang('fallback', lang, val)}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Refusal (out of scope) / 拒答"
              kind="generic"
              multiline rows={3}
              zh={row.refusal_zh} en={row.refusal_en} it={row.refusal_it}
              onChange={(lang, val) => setLang('refusal', lang, val)}
            />
          </div>
        </div>

        <div className="adm-actions">
          <button onClick={save} className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  );
}
