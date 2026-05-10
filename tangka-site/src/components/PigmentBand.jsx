import { useLang } from '../lib/i18n.jsx';
import { PIGMENTS } from '../lib/design.js';

/**
 * The pigment showcase.
 *
 * Visual argument: thangka and Renaissance painting share the same minerals.
 * Render real swatches with provenance — this *is* the curatorial thesis,
 * made into a viewable object on the page.
 */
export default function PigmentBand() {
  const { lang } = useLang();

  // Six pigments shared between traditions
  const items = [
    { key: 'lapis',     hex: PIGMENTS.lapis.hex,
      provenance: {
        zh: '阿富汗 巴达赫尚省 — 文艺复兴圣母袍与唐卡虚空同色',
        en: 'Badakhshan, Afghanistan — the same blue in Mary\u2019s robe and the thangka sky',
        it: 'Badakhshan, Afghanistan — l\u2019azzurro del manto della Vergine e del cielo del thangka',
      } },
    { key: 'cinnabar',  hex: PIGMENTS.cinnabar.hex,
      provenance: {
        zh: '硫化汞 — 朱砂之红，文艺复兴的修道袍与唐卡的忿怒尊',
        en: 'Vermilion — friars\u2019 robes in the quattrocento, wrathful deities in the thangka',
        it: 'Cinabro — vesti dei frati nel Rinascimento, divinit\u00e0 irate nei thangka',
      } },
    { key: 'malachite', hex: PIGMENTS.malachite.hex,
      provenance: {
        zh: '碱式碳酸铜 — 风景与绿度母共用的矿物',
        en: 'Basic copper carbonate — the green of landscape and of Tara',
        it: 'Carbonato basico di rame — il verde dei paesaggi e di Tara',
      } },
    { key: 'gold',      hex: PIGMENTS.gold.hex,
      provenance: {
        zh: '纯金 — 拜占庭、文艺复兴与唐卡共享的圣性载体',
        en: 'Pure gold — Byzantine, Renaissance, and thangka all share gold as the sacred ground',
        it: 'Oro puro — Bisanzio, Rinascimento e thangka condividono l\u2019oro come substrato del sacro',
      } },
    { key: 'ivory',     hex: PIGMENTS.ivory.hex,
      provenance: {
        zh: '蛋彩与底色——画的开端与白度母的身',
        en: 'Egg tempera ground and the white body of Tara',
        it: 'Fondo a tempera e il corpo bianco di Tara',
      } },
    { key: 'ink',       hex: PIGMENTS.ink.hex,
      provenance: {
        zh: '墨与碳黑——线条的起源',
        en: 'Ink and lampblack — the origin of line',
        it: 'Inchiostro e nero di carbone — l\u2019origine del segno',
      } },
  ];

  return (
    <section className="pigment-band">
      <div className="container">
        <div className="pigment-band__head">
          <div className="eyebrow">
            {lang === 'zh' && '矿物 · 物质'}
            {lang === 'en' && 'Mineral · Matter'}
            {lang === 'it' && 'Minerale · Materia'}
          </div>
          <h2 className={lang === 'zh' ? 'cn-title' : ''}>
            {lang === 'zh' && '同一座山，两种文明的天空'}
            {lang === 'en' && 'One Mountain. Two Skies.'}
            {lang === 'it' && 'Una sola montagna. Due cieli.'}
          </h2>
          <p className="pigment-band__lede reading">
            {lang === 'zh' && '在工艺的层面，唐卡与文艺复兴绘画使用同一种语言——同一种矿物。这不是巧合，而是物质本身的史诗。'}
            {lang === 'en' && 'At the level of craft, thangka and Renaissance painting speak the same language — the same minerals. Not coincidence, but the epic of matter itself.'}
            {lang === 'it' && 'A livello del mestiere, thangka e pittura rinascimentale parlano la stessa lingua — gli stessi minerali. Non una coincidenza, ma l\u2019epica della materia.'}
          </p>
        </div>

        <div className="pigment-band__grid">
          {items.map((p) => {
            const name = PIGMENTS[p.key].name[lang] || PIGMENTS[p.key].name.en;
            return (
              <article key={p.key} className="pigment">
                <div className="pigment__swatch" style={{ background: p.hex }}>
                  <div className="pigment__hex">{p.hex.toUpperCase()}</div>
                </div>
                <div className="pigment__name">{name}</div>
                <div className="pigment__prov">{p.provenance[lang]}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
