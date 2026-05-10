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
  FiveColorRibbon,
  VajraTrim,
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
    (a) => a.slug === 'davinci-menla-2026' || a.slug === 'confucius-socrates-2026'
      || a.is_featured
  );
  // Pick the hero image: first featured with image, fallback to first artwork with image
  const heroWork = featured.find((a) => a.image_url)
    || artworks.find((a) => a.image_url)
    || featured[0]
    || artworks[0];

  const highlights = artworks
    .filter((a) => !featured.find((f) => f.slug === a.slug))
    .slice(0, 6);

  // === Trilingual poster copy ===
  const poster = {
    zh: {
      institute: '佛罗伦萨美术设计学院',
      artistName: '桑吉才让',
      artistNameRoman: 'SANGJI CAIRANG',
      kicker: '唐卡艺术展',
      tagline1: '从喜马拉雅之心',
      tagline2: '到文艺复兴的故乡',
      dates: '2026年6月6日 — 6月26日',
      hoursTitle: '开放时间',
      hours: [
        '周二—周六：10.00—13.00 / 17.00—19.00',
        '周日：10.00—13.00',
        '周一及节假日闭馆',
      ],
      free: '免费入场 · INGRESSO LIBERO',
      enter: '进入展厅',
      learnMore: '了解更多',
    },
    en: {
      institute: 'Accademia delle Arti del Disegno',
      artistName: 'SANGJI CAIRANG',
      artistNameRoman: 'SANGJI CAIRANG',
      kicker: 'Thangka Art Exhibition',
      tagline1: 'From the heart of the Himalayas',
      tagline2: 'to the homeland of the Renaissance',
      dates: '6 — 26 June 2026',
      hoursTitle: 'Opening hours',
      hours: [
        'Tue — Sat: 10.00—13.00 / 17.00—19.00',
        'Sun: 10.00—13.00',
        'Mon & holidays: closed',
      ],
      free: 'INGRESSO LIBERO · FREE ENTRANCE',
      enter: 'Enter the exhibition',
      learnMore: 'Learn more',
    },
    it: {
      institute: 'Accademia delle Arti del Disegno',
      artistName: 'SANGJICAIRANG',
      artistNameRoman: 'SANGJICAIRANG',
      kicker: 'Mostra di Arte Thangka',
      tagline1: 'Dal cuore dell\u2019Himalaya',
      tagline2: 'alla patria del Rinascimento',
      dates: 'DAL 6 AL 26 GIUGNO 2026',
      hoursTitle: 'ORARI MOSTRA',
      hours: [
        'Marted\u00ec — Sabato: 10.00—13.00 / 17.00—19.00',
        'Domenica: 10.00—13.00',
        'Luned\u00ec e giorni festivi chiuso',
      ],
      free: 'INGRESSO LIBERO · FREE ENTRANCE',
      enter: 'Entra in mostra',
      learnMore: 'Scopri di pi\u00f9',
    },
  };
  const p = poster[lang] || poster.en;

  if (loading) return <div className="loading-state">{ui.loading}</div>;

  return (
    <div className="home-poster">

      {/* ============================================================
          HERO — POSTER LAYOUT
          Left panel (deep blue): institute logo · artist name · tagline · dates · hours · free
          Right panel: thangka image, full bleed
          Tibetan calligraphy column on the inner edge
          Vertical Chinese name 桑吉才让
          ============================================================ */}
      <section className="poster">
        {/* === LEFT PANEL (deep blue) === */}
        <div className="poster__left">
          {/* Logo / institute mark */}
          <div className="poster__logo-block">
            <div className="poster__logo-mark">
              <MandalaEmblem size={88} />
            </div>
            <div className="poster__institute">{p.institute}</div>
          </div>

          {/* Artist name + kicker */}
          <div className="poster__title-block">
            <h1 className="poster__artist">{p.artistName}</h1>
            <div className="poster__kicker">{p.kicker}</div>
          </div>

          {/* Tagline */}
          <div className="poster__tagline">
            <div>{p.tagline1}</div>
            <div>{p.tagline2}</div>
          </div>

          {/* Dates */}
          <div className="poster__dates">{p.dates}</div>

          {/* Hours */}
          <div className="poster__hours">
            <div className="poster__hours-title">{p.hoursTitle}</div>
            {p.hours.map((line, i) => (
              <div key={i} className="poster__hours-line">{line}</div>
            ))}
          </div>

          {/* Free entrance pill */}
          <div className="poster__free">{p.free}</div>

          {/* CTAs */}
          <div className="poster__cta">
            <Link to="/gallery" className="poster__btn poster__btn--primary">
              {p.enter} →
            </Link>
            <Link to="/knowledge" className="poster__btn poster__btn--ghost">
              {p.learnMore}
            </Link>
          </div>
        </div>

        {/* === RIGHT PANEL — image === */}
        <div className="poster__right">
          {heroWork?.image_url ? (
            <div
              className="poster__image"
              style={{ backgroundImage: `url(${heroWork.image_url})` }}
              role="img"
              aria-label={tField(heroWork, 'title')}
            />
          ) : (
            <div
              className="poster__image poster__image--fallback"
              style={{ background: pigmentGradient('lapis') }}
            >
              <MandalaEmblem size={320} />
            </div>
          )}

          {/* Vertical Chinese artist name 桑吉才让 — sits over the image */}
          <div className="poster__chinese-name" aria-hidden="true">
            <span>桑</span>
            <span>吉</span>
            <span>才</span>
            <span>让</span>
          </div>

          {/* Tibetan ornament column on the inner-right edge */}
          <div className="poster__tibetan-column" aria-hidden="true">
            <DecorativeTibetan char="ཀ" size={48} color="#f0e6d2" opacity={0.85} />
            <DecorativeTibetan char="ག" size={48} color="#f0e6d2" opacity={0.85} />
            <DecorativeTibetan char="ཡ" size={48} color="#f0e6d2" opacity={0.85} />
          </div>
        </div>
      </section>

      {/* ============================================================
          SCROLL CONTENT — back on the warm linen ground
          ============================================================ */}

      {/* === Pigment band — visual transition from blue to linen === */}
      <PigmentBand />

      {/* === Centerpiece works === */}
      {featured.length > 0 && (
        <section className="centerpiece">
          <div className="centerpiece__head">
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
            <div className="centerpiece__rule"><VajraTrim width={320} /></div>
            <p className="reading centerpiece__intro">
              {lang === 'zh' && '两幅 2026 年新作，专为本次佛罗伦萨展览而创作。它们是这场跨文明对话的视觉宣言——东方与西方的造像传统，在画布上相遇。'}
              {lang === 'en' && 'Two new 2026 works, painted specifically for this Florence exhibition. They are the visual statement of the show\u2019s argument \u2014 the iconographic traditions of East and West, meeting on a single ground.'}
              {lang === 'it' && 'Due opere nuove del 2026, dipinte appositamente per questa mostra fiorentina. Sono la dichiarazione visiva dell\u2019intera esposizione \u2014 le tradizioni iconografiche di Oriente e Occidente, riunite sulla stessa tela.'}
            </p>
          </div>

          <div className="centerpiece__pair">
            {featured.slice(0, 2).map((work) => (
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
                  <div className="eyebrow">{work.year_created}</div>
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

      {/* === Highlights grid === */}
      {highlights.length > 0 && (
        <section className="highlights">
          <div className="container">
            <div className="highlights__head">
              <div className="eyebrow">{ui.gallery}</div>
              <h2 className={lang === 'zh' ? 'cn-title' : ''}>
                {lang === 'zh' && '展品选粹'}
                {lang === 'en' && 'Selected Works'}
                {lang === 'it' && 'Opere Selezionate'}
              </h2>
              <div className="centerpiece__rule"><VineFlourish width={240} /></div>
            </div>

            <div className="highlights__grid">
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
                    <div className="hl-card__meta">{work.year_created} · {work.dimensions}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="highlights__cta">
              <Link to="/gallery" className="btn btn-ghost">{ui.all_works} →</Link>
            </div>
          </div>
        </section>
      )}

      {/* === Knowledge teaser === */}
      {knowledge.length > 0 && (
        <section className="kteaser">
          <div className="kteaser__bg-knot">
            <EndlessKnot size={300} color="#1e3a6b" />
          </div>

          <div className="container">
            <div className="kteaser__head">
              <div className="eyebrow">{ui.knowledge}</div>
              <h2 className={lang === 'zh' ? 'cn-title' : ''}>
                {lang === 'zh' && '走进唐卡的世界'}
                {lang === 'en' && 'Enter the World of Thangka'}
                {lang === 'it' && 'Nel mondo del Thangka'}
              </h2>
              <div className="centerpiece__rule"><FiveColorRibbon width={300} /></div>
            </div>

            <div className="kteaser__grid">
              {knowledge.slice(0, 3).map((article, i) => (
                <Link key={article.id || article.slug} to={`/knowledge/${article.slug}`} className="ktcard">
                  <div className="ktcard__num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="ktcard__divider"><CloudScroll width={120} /></div>
                  <h4 className={lang === 'zh' ? 'cn-title' : ''}>{tField(article, 'title')}</h4>
                  <p>{tField(article, 'excerpt')}</p>
                  <div className="ktcard__more">{ui.learn_more} →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === Visit teaser === */}
      <section className="visit-teaser">
        <div className="container">
          <div className="visit-teaser__inner">
            <div className="visit-teaser__text">
              <div className="eyebrow">{ui.visit}</div>
              <h2 className={lang === 'zh' ? 'cn-title' : ''}>
                {lang === 'zh' && '佛罗伦萨 · 二〇二六'}
                {lang === 'en' && 'Florence · June 2026'}
                {lang === 'it' && 'Firenze · Giugno 2026'}
              </h2>
              {exhibition?.venue_en && (
                <div className="visit-teaser__venue">
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
