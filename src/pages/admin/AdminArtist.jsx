import { useEffect, useState } from 'react';
import { adminFetchArtist, adminUpdateArtist } from '../../lib/admin.js';
import ImageUpload from '../../components/ImageUpload.jsx';
import TrilingualField from '../../components/TrilingualField.jsx';
import FlashToast from '../../components/FlashToast.jsx';

export default function AdminArtist() {
  const [row, setRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    adminFetchArtist().then(setRow);
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
      await adminUpdateArtist(id, patch);
      setFlash({ kind: 'success', text: '✓ Saved.' });
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
          <h1>Artist / 艺术家</h1>
          <div className="admin-head__sub">桑吉才让 · Sangji Cairang</div>
        </div>
      </div>
<div className="adm-form">
        <div className="adm-row">
          <div className="adm-label">Portrait / 肖像</div>
          <div style={{ maxWidth: 360 }}>
            <ImageUpload
              bucket="feiyi-portraits"
              filename="sangji-cairang"
              currentUrl={row.portrait_url}
              aspectRatio="4/5"
              onUploaded={(url) => set('portrait_url', url)}
              hint="Drop a portrait photo (4:5 ratio recommended)"
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Name / 姓名"
              kind="name"
              required
              zh={row.name_zh} en={row.name_en} it={row.name_it}
              onChange={(lang, val) => setLang('name', lang, val)}
            />
          </div>
        </div>

        <div className="adm-row">
          <div className="adm-label">&nbsp;</div>
          <div>
            <TrilingualField
              label="Biography / 简介"
              kind="bio"
              required
              multiline rows={12}
              zh={row.bio_zh} en={row.bio_en} it={row.bio_it}
              onChange={(lang, val) => setLang('bio', lang, val)}
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
