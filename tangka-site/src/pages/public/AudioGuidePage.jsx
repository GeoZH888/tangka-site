import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang, useT, useUI } from '../../lib/i18n.jsx';
import {
  fetchArtwork,
  fetchExhibition,
  logAudioGuideView,
} from '../../lib/supabase.js';
import { pigmentGradient } from '../../lib/design.js';
import LangSwitcher from '../../components/LangSwitcher.jsx';
import './AudioGuidePage.css';

/**
 * /a/:slug — the page a visitor lands on when they scan a QR code in the gallery.
 *
 * Design priorities:
 *   1. Loads instantly even on slow gallery WiFi
 *   2. Auto-detects language from browser, with easy override pill
 *   3. Audio button is THE call to action — large, obvious, immediate
 *   4. Falls back to Web Speech API if no recorded MP3 yet
 *   5. Logs the scan event for analytics
 *   6. No nav, no footer, no David — minimal and dignified
 */
export default function AudioGuidePage() {
  const { slug } = useParams();
  const { lang } = useLang();
  const t = useT();
  const ui = useUI();

  const [work, setWork] = useState(null);
  const [exhibition, setExhibition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  // Load artwork
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchArtwork(slug), fetchExhibition()])
      .then(([w, ex]) => {
        if (cancelled) return;
        if (!w) {
          setError('not_found');
          return;
        }
        setWork(w);
        setExhibition(ex);
        // Log the scan
        logAudioGuideView({
          artworkId: w.id,
          artworkSlug: w.slug,
          exhibitionId: ex?.id,
          language: lang,
          source: 'qr',
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'fetch_error');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, lang]);

  // Cleanup speech / audio on unmount
  useEffect(() => () => stopPlayback(), []);

  function stopPlayback() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }

  function play() {
    if (!work) return;
    stopPlayback();

    // If a recorded audio file exists for this language, play it.
    // Otherwise fall back to Web Speech API on the visitor's device.
    const audioUrl = work[`audio_url_${lang}`];

    if (audioUrl) {
      const a = new Audio(audioUrl);
      audioRef.current = a;
      a.onended = () => setPlaying(false);
      a.onerror = () => speakFallback();
      a.play().then(() => setPlaying(true)).catch(() => speakFallback());
      return;
    }

    speakFallback();
  }

  function speakFallback() {
    if (typeof window === 'undefined' || !window.speechSynthesis || !work) {
      return;
    }
    const title = t(work, 'title');
    const desc = t(work, 'description');
    const intro = lang === 'zh'
      ? `${title}。${work.year}年作品。${t(work, 'materials')}。尺寸 ${work.dimensions}。${desc}`
      : lang === 'it'
        ? `${title}. Anno ${work.year}. ${t(work, 'materials')}. Dimensioni ${work.dimensions}. ${desc}`
        : `${title}. From ${work.year}. ${t(work, 'materials')}. Dimensions ${work.dimensions}. ${desc}`;

    const u = new SpeechSynthesisUtterance(intro);
    u.lang = lang === 'zh' ? 'zh-CN' : lang === 'it' ? 'it-IT' : 'en-GB';
    u.rate = 0.92;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(u);
    setPlaying(true);
  }

  if (loading) {
    return (
      <div className="ag-page ag-loading">
        <div className="ag-loader">·</div>
      </div>
    );
  }

  if (error === 'not_found' || !work) {
    return (
      <div className="ag-page ag-error">
        <div className="ag-error-inner">
          <div className="ag-error-mark">·</div>
          <p>
            {lang === 'zh' && '未找到此作品。'}
            {lang === 'en' && 'Artwork not found.'}
            {lang === 'it' && 'Opera non trovata.'}
          </p>
          <Link to="/" className="btn">{ui.home}</Link>
        </div>
      </div>
    );
  }

  const colorTheme = work.color_theme || 'lapis';

  return (
    <div className="ag-page" style={{ '--ag-bg': pigmentGradient(colorTheme) }}>
      <header className="ag-top">
        <Link to="/" className="ag-brand">
          <span className="cn-title">度量之间</span>
          <span className="ag-divider">·</span>
          <span>Sacred Measures</span>
        </Link>
        <LangSwitcher />
      </header>

      <div className="ag-body">
        {/* Artwork image / placeholder */}
        <div
          className="ag-image"
          style={{
            background: work.image_url
              ? `url(${work.image_url}) center/contain no-repeat`
              : 'var(--ag-bg)',
          }}
          aria-label={t(work, 'title')}
        />

        {/* Title block */}
        <div className="ag-meta">
          <div className="ag-year">{work.year}</div>
          <h1 className={`ag-title ${lang === 'zh' ? 'cn-title' : ''}`}>
            {t(work, 'title')}
          </h1>
          <div className="ag-specs">
            <span>{t(work, 'materials')}</span>
            <span className="dot">·</span>
            <span>{work.dimensions}</span>
          </div>
        </div>

        {/* Big audio CTA */}
        <div className="ag-audio">
          <button
            className={`ag-play-btn ${playing ? 'ag-play-btn--playing' : ''}`}
            onClick={playing ? stopPlayback : play}
            aria-label={playing ? ui.pause : ui.play}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div className="ag-audio-label">
            {playing ? ui.pause : ui.listen}
          </div>
          {!work[`audio_url_${lang}`] && (
            <div className="ag-audio-note">
              {lang === 'zh' && '（设备语音朗读）'}
              {lang === 'en' && '(Device voice reading)'}
              {lang === 'it' && '(Lettura vocale del dispositivo)'}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="ag-description reading">
          <p>{t(work, 'description')}</p>
        </div>

        {/* Footer */}
        <footer className="ag-footer">
          <Link to={`/work/${work.slug}`} className="ag-link">
            {lang === 'zh' && '查看完整介绍'}
            {lang === 'en' && 'See full notes'}
            {lang === 'it' && 'Note complete'}
            {' →'}
          </Link>
          <Link to="/gallery" className="ag-link">
            {ui.all_works}
          </Link>
        </footer>
      </div>
    </div>
  );
}
