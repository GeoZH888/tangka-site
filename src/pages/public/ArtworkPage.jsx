import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useLang, useT, useUI } from '../../lib/i18n.jsx';
import { fetchArtwork, fetchArtworks, SITE_BASE_URL } from '../../lib/supabase.js';
import { pigmentGradient } from '../../lib/design.js';
import './ArtworkPage.css';

export default function ArtworkPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = useT();
  const ui = useUI();

  const [work, setWork] = useState(null);
  const [allWorks, setAllWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null); // 'zh' | 'en' | 'it' | null
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchArtwork(slug), fetchArtworks()])
      .then(([w, all]) => {
        if (cancelled) return;
        setWork(w);
        setAllWorks(all);
      })
      .catch((e) => console.warn('[work]', e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; stopPlayback(); };
  }, [slug]);

  const { prev, next } = useMemo(() => {
    if (!allWorks.length || !work) return { prev: null, next: null };
    const idx = allWorks.findIndex((w) => w.slug === slug);
    return {
      prev: idx > 0 ? allWorks[idx - 1] : null,
      next: idx < allWorks.length - 1 ? allWorks[idx + 1] : null,
    };
  }, [allWorks, work, slug]);

  function stopPlayback() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(null);
  }

  function playInLang(targetLang) {
    if (!work) return;
    if (playing === targetLang) {
      stopPlayback();
      return;
    }
    stopPlayback();

    const audioUrl = work[`audio_${targetLang}_url`];
    if (audioUrl) {
      const a = new Audio(audioUrl);
      audioRef.current = a;
      a.onended = () => setPlaying(null);
      a.onerror = () => speakIn(targetLang);
      a.play().then(() => setPlaying(targetLang)).catch(() => speakIn(targetLang));
      return;
    }
    speakIn(targetLang);
  }

  function speakIn(targetLang) {
    if (!window.speechSynthesis || !work) return;
    const title = work[`title_${targetLang}`] || work.title_en;
    const desc = work[`description_${targetLang}`] || work.description_en;
    const intro = targetLang === 'zh'
      ? `${title}。${desc}`
      : `${title}. ${desc}`;
    const u = new SpeechSynthesisUtterance(intro);
    u.lang = targetLang === 'zh' ? 'zh-CN' : targetLang === 'it' ? 'it-IT' : 'en-GB';
    u.rate = 0.92;
    u.onend = () => setPlaying(null);
    u.onerror = () => setPlaying(null);
    window.speechSynthesis.speak(u);
    setPlaying(targetLang);
  }

  if (loading) return <div className="loading-state">{ui.loading}</div>;
  if (!work) {
    return (
      <div className="loading-state">
        <p>
          {lang === 'zh' && '未找到此作品。'}
          {lang === 'en' && 'Artwork not found.'}
          {lang === 'it' && 'Opera non trovata.'}
        </p>
      </div>
    );
  }

  const colorTheme = work.color_theme || 'lapis';
  const qrUrl = `${SITE_BASE_URL}/a/${work.slug}?lang=${lang}`;

  return (
    <article className="work manuscript-page">
      <div className="work__hero" style={{ background: pigmentGradient(colorTheme) }}>
        <div className="container work__hero-inner">
          <div className="work__hero-meta">
            <Link to="/gallery" className="work__back">← {ui.gallery}</Link>
            <div className="eyebrow work__year">{work.year_created}</div>
            <h1 className={`work__title ${lang === 'zh' ? 'cn-title' : ''}`}>
              {t(work, 'title')}
            </h1>
            <div className="work__title-trans">
              {lang !== 'zh' && work.title_zh && <div className="cn-title">{work.title_zh}</div>}
              {lang !== 'en' && work.title_en && <div>{work.title_en}</div>}
              {lang !== 'it' && work.title_it && <div className="it">{work.title_it}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="container work__body">
        {/* Image — primary */}
        <div className="work__image-wrap">
          <div
            className="work__image"
            style={{
              background: work.image_url
                ? `url(${work.image_url}) center/contain no-repeat var(--ink)`
                : pigmentGradient(colorTheme),
            }}
            aria-label={t(work, 'title')}
          />
          <div className="work__caption">
            {t(work, 'materials')} · {work.dimensions}
          </div>
        </div>

        {/* Right column — facts + audio + QR */}
        <aside className="work__side">
          <div className="work__facts">
            <div className="work__fact">
              <div className="work__fact-label">{ui.year}</div>
              <div className="work__fact-value">{work.year_created}</div>
            </div>
            <div className="work__fact">
              <div className="work__fact-label">{ui.materials}</div>
              <div className="work__fact-value">{t(work, 'materials')}</div>
            </div>
            <div className="work__fact">
              <div className="work__fact-label">{ui.dimensions}</div>
              <div className="work__fact-value">{work.dimensions}</div>
            </div>
          </div>

          {/* Audio guide buttons — all three languages */}
          <div className="work__audio">
            <div className="work__audio-label">{ui.listen}</div>
            <div className="work__audio-buttons">
              <button
                onClick={() => playInLang('zh')}
                className={`work__audio-btn ${playing === 'zh' ? 'is-playing' : ''}`}
                aria-label={ui.listen_zh}
              >
                <span className="cn-title">中</span>
                <span className="work__audio-text">{ui.listen_zh}</span>
              </button>
              <button
                onClick={() => playInLang('en')}
                className={`work__audio-btn ${playing === 'en' ? 'is-playing' : ''}`}
                aria-label={ui.listen_en}
              >
                <span>EN</span>
                <span className="work__audio-text">{ui.listen_en}</span>
              </button>
              <button
                onClick={() => playInLang('it')}
                className={`work__audio-btn ${playing === 'it' ? 'is-playing' : ''}`}
                aria-label={ui.listen_it}
              >
                <span>IT</span>
                <span className="work__audio-text">{ui.listen_it}</span>
              </button>
            </div>
          </div>

          {/* QR code — for visitors to bookmark or share */}
          <div className="work__qr">
            <div className="work__qr-label">{ui.scan_qr}</div>
            <div className="work__qr-code">
              <QRCodeSVG
                value={qrUrl}
                size={140}
                fgColor="#1a1410"
                bgColor="transparent"
                level="M"
              />
            </div>
            <div className="work__qr-url">{qrUrl}</div>
          </div>
        </aside>

        {/* Long-form description */}
        <section className="work__description reading-panel">
          <p>{t(work, 'description')}</p>
        </section>

        {/* Prev / next navigation */}
        <nav className="work__nav">
          {prev ? (
            <Link to={`/work/${prev.slug}`} className="work__nav-link work__nav-prev">
              <div className="work__nav-label">← {ui.previous}</div>
              <div className={`work__nav-title ${lang === 'zh' ? 'cn-title' : ''}`}>
                {prev[`title_${lang}`] || prev.title_en}
              </div>
            </Link>
          ) : <div />}
          {next && (
            <Link to={`/work/${next.slug}`} className="work__nav-link work__nav-next">
              <div className="work__nav-label">{ui.next} →</div>
              <div className={`work__nav-title ${lang === 'zh' ? 'cn-title' : ''}`}>
                {next[`title_${lang}`] || next.title_en}
              </div>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
