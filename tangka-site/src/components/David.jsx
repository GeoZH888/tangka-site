import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useLang, useUI } from '../lib/i18n.jsx';
import { fetchDavidPersona } from '../lib/supabase.js';
import DavidSvg from './DavidSvg.jsx';
import './David.css';

/**
 * Generate (and persist for the session) an opaque session hash.
 * Used by analytics so we can group messages from the same visitor session
 * without storing IP / fingerprint.
 */
function getSessionHash() {
  try {
    const k = 'tangka_session_hash';
    let h = sessionStorage.getItem(k);
    if (!h) {
      h = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(k, h);
    }
    return h;
  } catch (_) {
    return Math.random().toString(36).slice(2);
  }
}

export default function David() {
  const { lang } = useLang();
  const t = useUI();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [pose, setPose] = useState('idle');
  const [messages, setMessages] = useState([]); // { role: 'user' | 'assistant', text }
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [persona, setPersona] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load David's greetings from DB
  useEffect(() => {
    fetchDavidPersona().then(setPersona).catch(() => setPersona(null));
  }, []);

  // Greet on first open (per session)
  useEffect(() => {
    if (!open || messages.length > 0) return;
    const greet =
      persona?.[`greeting_${lang}`] ||
      (lang === 'zh'
        ? '您好，我是大卫。我是佛罗伦萨的一位艺术学徒，今天为您介绍这场唐卡展览。'
        : lang === 'it'
          ? 'Buongiorno, sono Davide, un giovane apprendista d\u2019arte qui a Firenze.'
          : 'Hello — I\u2019m David, an art apprentice here in Florence.');
    setMessages([{ role: 'assistant', text: greet }]);
    setPose('greeted');
    const tm = setTimeout(() => setPose('idle'), 2000);
    return () => clearTimeout(tm);
  }, [open, persona, lang, messages.length]);

  // Auto-scroll messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  // Slug context — pass to David API so he knows which artwork the visitor is on
  const params = useParams();
  const artworkSlug = pathname.startsWith('/work/') ? params.slug : null;

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || busy) return;

    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setInput('');
    setBusy(true);
    setPose('thinking');

    try {
      const res = await fetch('/api/david', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language: lang,
          artworkSlug,
          sessionHash: getSessionHash(),
          history: messages.slice(-6), // last 3 exchanges for context
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setPose('speaking');
      setMessages((m) => [...m, { role: 'assistant', text: data.reply }]);
      setTimeout(() => setPose('idle'), 1500);
    } catch (err) {
      setPose('idle');
      const fallback =
        persona?.[`fallback_${lang}`] ||
        (lang === 'zh'
          ? '我现在无法回答您的问题，请稍后再试。'
          : lang === 'it'
            ? 'Non posso rispondere in questo momento — riprovi tra poco, La prego.'
            : 'I can\u2019t answer just now \u2014 please try again in a moment.');
      setMessages((m) => [...m, { role: 'assistant', text: fallback, isError: true }]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.focus();
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Floating character button */}
      <button
        className={`david-btn ${open ? 'david-btn--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={t.david_open}
        title={t.david_open}
      >
        <DavidSvg pose={pose} size={88} />
        <span className="david-btn__pulse" />
      </button>

      {/* Chat panel */}
      <aside className={`david-panel ${open ? 'david-panel--open' : ''}`} aria-hidden={!open}>
        <header className="david-panel__head">
          <div className="david-panel__avatar">
            <DavidSvg pose={busy ? 'thinking' : pose} size={64} />
          </div>
          <div className="david-panel__id">
            <div className="david-panel__name">
              {lang === 'zh' && '大卫'}
              {lang === 'en' && 'David'}
              {lang === 'it' && 'Davide'}
            </div>
            <div className="david-panel__sub">{t.david_subtitle}</div>
          </div>
          <button className="david-panel__close" onClick={() => setOpen(false)} aria-label={t.close}>
            ×
          </button>
        </header>

        <div className="david-panel__messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`david-msg david-msg--${m.role} ${m.isError ? 'is-error' : ''}`}>
              <div className="david-msg__bubble">{m.text}</div>
            </div>
          ))}
          {busy && (
            <div className="david-msg david-msg--assistant">
              <div className="david-msg__bubble david-msg__typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <div className="david-panel__compose">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={t.david_input_placeholder}
            rows={1}
            disabled={busy}
          />
          <button
            className="david-panel__send"
            onClick={send}
            disabled={busy || !input.trim()}
            aria-label={t.david_send}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>

        <div className="david-panel__disclaimer">{t.david_disclaimer}</div>
      </aside>
    </>
  );
}
