import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang, useUI, useT } from '../../lib/i18n.jsx';
import { fetchExhibition, fetchArtworks, fetchKnowledgeList } from '../../lib/supabase.js';
import MandalaEmblem from '../../components/MandalaEmblem.jsx';
import BrocadeBorder from '../../components/BrocadeBorder.jsx';
import PigmentBand from '../../components/PigmentBand.jsx';
import {
  CloudScroll,
  EndlessKnot,
  VineFlourish,
  CalligraphicStroke,
  FiveColorRibbon,
  VajraTrim,
  MountainHorizon,
  DecorativeTibetan,
} from '../../components/TibetanOrnament.jsx';
import { pigmentGradient } from '../../lib/design.js';
import './HomePage.css';

export default function HomePage() {
  const { lang } = useLang();
  const ui = useUI();
  const tField = useT();

  const [exhibition, setExhibition] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchExhibition(), fetchArtworks(), fetchKnowledgeList()])
      .then(([ex, aw, kn]) => {
        setExhibition(ex); setArtworks(aw); setKnowledge(kn);
      })
      .catch((e) => console.warn('[home]', e))
      .finally(() => setLoading(false));
  }, []);

  const featured = artworks.filter(
    (a) => a.slug === 'davinci-menla' || a.slug === 'confucius-socrates'
  );
  const highlights = artworks
    .filter((a) => !featured.find((f) => f.slug === a.slug))
    .slice(0, 6);

  const heroLines = {
    zh: {
      eyebrow: '佛罗伦萨 · 二〇二六',
      titleA: '度量', titleB: '之间',
      sub1: '勉拉顿珠的造像度量经',
      sub2: '与达芬奇的黄金分割',
      tagline: '一场跨越万里的对话——藏传唐卡与意大利文艺复兴，相遇于神圣的几何。',
      author: '桑吉才让',
      authorRole: '热贡画派 · 国家级非遗代表性传承人',
    },
    en: {
      eyebrow: 'Florence · MMXXVI',
      titleA: 'Sacred', titleB: 'Measures',
      sub1: 'Menla D\u00f6ndrup\u2019s Iconometric Canon',
      sub2: 'meets Da Vinci\u2019s Golden Ratio',
      tagline: 'A dialogue across continents — Tibetan thangka and Italian Renaissance, meeting in sacred geometry.',
      author: 'Sangji Cairang',
      authorRole: 'National Inheritor — Regong School',
    },
    it: {
      eyebrow: 'Firenze · MMXXVI',
      titleA: 'Tra le', titleB: 'Misure Sacre',
      sub1: 'Il canone iconometrico di Menla D\u00f6ndrup',
      sub2: 'incontra la sezione aurea di Leonardo',
      tagline: 'Un dialogo che attraversa i continenti \u2014 il thangka tibetano e il Rinascimento italiano, incontrandosi nella geometria sacra.',
      author: 'Sangji Cairang',
      authorRole: 'Erede Nazionale \u2014 Scuola di Regong',
    },
  };
  const h = heroLines[lang] || heroLines.en;

  if (loading) return <div className="loading-state">{ui.loading}</div>;

  return (
    <div className="home2">

      {/* ============ HERO ============ */}
      <section className="hero2">

        {/* Mountain horizon — far background layer */}
        <div className="mountain-horizon-bg">
          <MountainHorizon width={2000} opacity={0.07} />
        </div>

        {/* Decorative Tibetan letters — corners */}
        <div className="hero2__tibetan hero2__tibetan--tl">
          <DecorativeTibetan char="ཀ" size={120} opacity={0.08} />
        </div>
        <div className="hero2__tibetan hero2__tibetan--br">
          <DecorativeTibetan char="ག" size={120} opacity={0.08} />
        </div>

        {/* Background calligraphic strokes */}
        <div className="hero2__bg-stroke hero2__bg-stroke--1">
          <CalligraphicStroke size={400} opacity={0.04} />
        </div>
        <div className="hero2__bg-stroke hero2__bg-stroke--2">
          <CalligraphicStroke size={520} opacity={0.03} />
        </div>

        {/* Vertical strips */}
        <aside className="hero2__vertical hero2__vertical--left" aria-hidden="true">
          <div className="hero2__vertical-text cn-title">桑·吉·才·让</div>
          <div className="hero2__vertical-rule" />
          <div className="hero2__vertical-meta">MMXXVI</div>
        </aside>

        <aside className="hero2__vertical hero2__vertical--right" aria-hidden="true">
          <div className="hero2__vertical-text">FIRENZE</div>
          <div className="hero2__vertical-rule" />
          <div className="hero2__vertical-meta">SETTEMBRE</div>
        </aside>

        <div className="hero2__eyebrow eyebrow">{h.eyebrow}</div>

        <div className="hero2__ornament-top"><CloudScroll width={240} /></div>

        <h1 className={`hero2__title ${lang === 'zh' ? 'cn-title' : ''}`}>
          <span className="hero2__title-line hero2__title-a">{h.titleA}</span>
          <span className="hero2__title-line hero2__title-b">{h.titleB}</span>
        </h1>

        <div className="hero2__ornament-knot">
          <EndlessKnot size={48} color="#7d1f2e" />
        </div>

        <div className="hero2__subtitle">
          <span>{h.sub1}</span>
          <span className="hero2__sub-amp">×</span>
          <span>{h.sub2}</span>
        </div>

        <div className="hero2__emblem">
          <MandalaEmblem size={520} />
        </div>

        <div className="hero2__byline">
          <div className="eyebrow">
            {lang === 'zh' && '艺术家'}
            {lang === 'en' && 'The Artist'}
            {lang === 'it' && 'L\u2019Artista'}
          </div>
          <div className={`hero2__author ${lang === 'zh' ? 'cn-title' : ''}`}>
            {h.author}
          </div>
          <div className="hero2__author-role">{h.authorRole}</div>
        </div>

        <p className="hero2__tagline reading">{h.tagline}</p>

        {/* Five-color ribbon — replaces vine flourish here */}
        <div className="hero2__ribbon">
          <FiveColorRibbon width={420} />
        </div>

        <div className="hero2__triptych">
          <span className="cn-title">度 量 之 间</span>
          <span className="dot">/</span>
          <span className="en">Sacred Measures</span>
          <span className="dot">/</span>
          <span className="it">Tra le Misure Sacre</span>
        </div>

        {/* Vajra trim under triplet */}
        <div className="hero2__vajra-trim">
          <VajraTrim width={500} />
        </div>

        <div className="hero2__cta">
          <Link to="/gallery" className="btn">{ui.enter_exhibition}</Link>
          <Link to="/knowledge" className="btn btn-ghost">{ui.learn_more}</Link>
        </div>
      </section>

      {/* ============ PIGMENT BAND ============ */}
      <PigmentBand />

      {/* ============ CENTERPIECE ============ */}
      {featured.length > 0 && (
        <section className="centerpiece2">
          <div className="centerpiece2__head">
            <div className="eyebrow">
              {lang === 'zh' && '展览之核心'}
              {lang === 'en' && 'The Centerpiece'}
              {lang === 'it' && 'L\u2019Opera Centrale'}
            </div>
            <h2 className={lang === 'zh' ? 'cn-title' : ''}>
              {lang === 'zh' && '为佛罗伦萨而作'}
              {lang === 'en' && 'Painted for Florence'}
              {lang === 'it' && 'Dipinti per Firenze'}
            </h2>
            <div className="centerpiece2__rule"><VajraTrim width={320} /></div>
            <p className="reading centerpiece2__intro">
              {lang === 'zh' && '两幅 2026 年新作，专为本次佛罗伦萨展览而创作。它们是这场跨文明对话的视觉宣言——东方与西方的造像传统，在画布上相遇。'}
              {lang === 'en' && 'Two new 2026 works, painted specifically for this Florence exhibition. They are the visual statement of the show\u2019s argument \u2014 the iconographic traditions of East and West, meeting on a single ground.'}
              {lang === 'it' && 'Due opere nuove del 2026, dipinte appositamente per questa mostra fiorentina. Sono la dichiarazione visiva dell\u2019intera esposizione \u2014 le tradizioni iconografiche di Oriente e Occidente, riunite sulla stessa tela.'}
            </p>
          </div>

          <div className="centerpiece2__pair">
            {featured.map((work) => (
              <Link key={work.id || work.slug} to={`/work/${work.slug}`} className="thangka-panel">
                <div className="thangka-panel__brocade">
                  <BrocadeBorder thickness="normal" />
                </div>
                <div className="thangka-panel__inner">
                  <div
                    className="thangka-panel__image"
                    style={{
                      background: work.image_url
                        ? `url(${work.image_url}) center/cover`
                        : pigmentGradient(work.color_theme || 'gold'),
                    }}
                  >
                    {!work.image_url && (
                      <div className="thangka-panel__placeholder">
                        <MandalaEmblem size={180} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="thangka-panel__caption">
                  <div className="eyebrow">{work.year}</div>
                  <h3 className={lang === 'zh' ? 'cn-title' : ''}>
                    {tField(work, 'title')}
                  </h3>
                  <div className="thangka-panel__meta">
                    {work.dimensions} · {tField(work, 'materials')}
                  </div>
                  <div className="thangka-panel__more">{ui.view_artwork} →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ HIGHLIGHTS ============ */}
      {highlights.length > 0 && (
        <section className="highlights2">
          <div className="container">
            <div className="highlights2__head">
              <div className="eyebrow">{ui.gallery}</div>
              <h2 className={lang === 'zh' ? 'cn-title' : ''}>
                {lang === 'zh' && '展品选粹'}
                {lang === 'en' && 'Selected Works'}
                {lang === 'it' && 'Opere Selezionate'}
              </h2>
              <div className="centerpiece2__rule"><VineFlourish width={240} /></div>
            </div>

            <div className="highlights2__grid">
              {highlights.map((work, i) => (
                <Link key={work.id || work.slug} to={`/work/${work.slug}`} className="hl-card">
                  <div className="hl-card__num">{String(i + 1).padStart(2, '0')}</div>
                  <div
                    className="hl-card__image"
                    style={{
                      background: work.image_url
                        ? `url(${work.image_url}) center/cover`
                        : pigmentGradient(work.color_theme || 'lapis'),
                    }}
                  />
                  <div className="hl-card__body">
                    <h4 className={lang === 'zh' ? 'cn-title' : ''}>{tField(work, 'title')}</h4>
                    <div className="hl-card__meta">{work.year} · {work.dimensions}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="highlights2__cta">
              <Link to="/gallery" className="btn btn-ghost">{ui.all_works} →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ KNOWLEDGE TEASER ============ */}
      {knowledge.length > 0 && (
        <section className="kteaser2">
          <div className="kteaser2__bg-knot">
            <EndlessKnot size={300} color="#1e3a5f" />
          </div>

          <div className="container">
            <div className="kteaser2__head">
              <div className="eyebrow">{ui.knowledge}</div>
              <h2 className={lang === 'zh' ? 'cn-title' : ''}>
                {lang === 'zh' && '走进唐卡的世界'}
                {lang === 'en' && 'Enter the World of Thangka'}
                {lang === 'it' && 'Nel mondo del Thangka'}
              </h2>
              <div className="centerpiece2__rule"><FiveColorRibbon width={300} /></div>
            </div>

            <div className="kteaser2__grid">
              {knowledge.slice(0, 3).map((article, i) => (
                <Link key={article.id || article.slug} to={`/knowledge/${article.slug}`} className="ktcard2">
                  <div className="ktcard2__num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="ktcard2__divider"><CloudScroll width={120} /></div>
                  <h4 className={lang === 'zh' ? 'cn-title' : ''}>{tField(article, 'title')}</h4>
                  <p>{tField(article, 'excerpt')}</p>
                  <div className="ktcard2__more">{ui.learn_more} →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ VISIT TEASER ============ */}
      <section className="visit-teaser2">
        <div className="container">
          <div className="visit-teaser2__inner">
            <div className="visit-teaser2__text">
              <div className="eyebrow">{ui.visit}</div>
              <h2 className={lang === 'zh' ? 'cn-title' : ''}>
                {lang === 'zh' && '佛罗伦萨 · 二〇二六'}
                {lang === 'en' && 'Florence · September 2026'}
                {lang === 'it' && 'Firenze · Settembre 2026'}
              </h2>
              {exhibition?.venue_en && (
                <div className="visit-teaser2__venue">
                  {exhibition[`venue_${lang}`] || exhibition.venue_en}
                </div>
              )}
            </div>
            <Link to="/visit" className="btn">{ui.visit} →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
