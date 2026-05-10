/**
 * Mineral pigments shared by Tibetan thangka and Italian Renaissance painting.
 * These are the visual argument of the exhibition — used in the palette throughout.
 */
export const PIGMENTS = {
  lapis:    { hex: '#1e3a5f', name: { zh: '青金石', en: 'Lapis lazuli', it: 'Lapislazzuli' } },
  cinnabar: { hex: '#9c1e2e', name: { zh: '朱砂',   en: 'Cinnabar',     it: 'Cinabro' } },
  gold:     { hex: '#b8862c', name: { zh: '纯金',   en: 'Gold leaf',    it: 'Foglia d\u2019oro' } },
  malachite:{ hex: '#3d5a3d', name: { zh: '孔雀石', en: 'Malachite',    it: 'Malachite' } },
  ivory:    { hex: '#f5ede0', name: { zh: '羊皮纸', en: 'Parchment',    it: 'Pergamena' } },
  ink:      { hex: '#1a1410', name: { zh: '墨',     en: 'Ink',          it: 'Inchiostro' } },
  bone:     { hex: '#e8dcc0', name: { zh: '象牙',   en: 'Bone white',   it: 'Avorio' } },
};

/**
 * Map a color_theme string (from feiyi_artwork) to a CSS gradient.
 * Used as the placeholder background when an image isn't yet uploaded.
 */
export function pigmentGradient(theme) {
  const map = {
    lapis:     'linear-gradient(160deg, #2a4a72 0%, #14233d 100%)',
    cinnabar:  'linear-gradient(160deg, #b8344a 0%, #6e1421 100%)',
    gold:      'linear-gradient(160deg, #d4a84a 0%, #8a6418 100%)',
    malachite: 'linear-gradient(160deg, #5a7a5a 0%, #3d5a3d 100%)',
    ink:       'linear-gradient(160deg, #2d2520 0%, #1a1410 100%)',
    bone:      'linear-gradient(160deg, #e8dcc0 0%, #c4b094 100%)',
  };
  return map[theme] || map.lapis;
}

export function pigmentText(theme) {
  // Light text on dark bg, dark text on light bg
  return theme === 'gold' || theme === 'bone' ? '#1a1410' : '#d4a84a';
}
