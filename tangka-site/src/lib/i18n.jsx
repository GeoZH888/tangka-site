import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export const LANGUAGES = ['zh', 'en', 'it'];

const STORAGE_KEY = 'tangka_lang';

/**
 * Auto-detect the visitor's language:
 * 1. ?lang=xx URL param wins
 * 2. localStorage preference (set by switcher)
 * 3. navigator.language (zh-* → zh, it-* → it, default en)
 */
function detectLanguage() {
  if (typeof window === 'undefined') return 'en';

  // 1. URL param
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get('lang');
  if (urlLang && LANGUAGES.includes(urlLang)) return urlLang;

  // 2. Stored preference
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.includes(stored)) return stored;
  } catch (_) {
    // localStorage may be blocked
  }

  // 3. Browser preference
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('it')) return 'it';
  return 'en';
}

const I18nContext = createContext({ lang: 'en', setLang: () => {} });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    setLangState(detectLanguage());
  }, []);

  const setLang = useCallback((newLang) => {
    if (!LANGUAGES.includes(newLang)) return;
    setLangState(newLang);
    try { localStorage.setItem(STORAGE_KEY, newLang); } catch (_) {}
    // Reflect in <html lang> for accessibility
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLang() {
  return useContext(I18nContext);
}

/**
 * Pick the right language field from an object: t(work, 'title') → work.title_zh / title_en / title_it
 */
export function useT() {
  const { lang } = useLang();
  return useCallback(
    (obj, field) => {
      if (!obj) return '';
      return obj[`${field}_${lang}`] ?? obj[`${field}_en`] ?? '';
    },
    [lang]
  );
}

/**
 * UI strings that don't live in the database — site chrome, button labels, etc.
 */
export const UI = {
  zh: {
    // Nav
    home: '首页',
    gallery: '展品',
    knowledge: '唐卡知识',
    artist: '艺术家',
    visit: '参观',
    admin: '管理',
    // Hero
    enter_exhibition: '进入展览',
    learn_more: '了解更多',
    // Featured
    centerpiece: '展览之核心',
    painted_for_florence: '为佛罗伦萨而作',
    view_artwork: '查看作品',
    // Gallery
    all_works: '全部作品',
    // Artwork
    materials: '材料',
    dimensions: '尺寸',
    year: '创作年份',
    listen: '聆听讲解',
    listen_zh: '听中文',
    listen_en: '听英文',
    listen_it: '听意大利文',
    play: '播放',
    pause: '暂停',
    scan_qr: '扫码听讲解',
    no_audio: '此作品的录音正在准备中。',
    // David
    david_greet: '您好，我是大卫',
    david_subtitle: '佛罗伦萨艺术学徒，您的展览向导',
    david_open: '与大卫交谈',
    david_close: '关闭',
    david_send: '发送',
    david_input_placeholder: '请问您想了解什么？',
    david_thinking: '思考中…',
    david_disabled_title: '大卫现在不在',
    david_disabled_msg: '请稍后再来',
    david_disclaimer: '大卫由人工智能驱动，仅作艺术导览，不能替代宗教、医疗或专业建议。',
    // Generic
    loading: '加载中…',
    error: '加载出错',
    retry: '重试',
    back: '返回',
    close: '关闭',
    next: '下一件',
    previous: '上一件',
  },
  en: {
    home: 'Home',
    gallery: 'Gallery',
    knowledge: 'About Thangka',
    artist: 'The Artist',
    visit: 'Visit',
    admin: 'Admin',
    enter_exhibition: 'Enter the Exhibition',
    learn_more: 'Learn more',
    centerpiece: 'The Centerpiece',
    painted_for_florence: 'Painted for Florence',
    view_artwork: 'View artwork',
    all_works: 'All works',
    materials: 'Materials',
    dimensions: 'Dimensions',
    year: 'Year',
    listen: 'Audio guide',
    listen_zh: 'In Chinese',
    listen_en: 'In English',
    listen_it: 'In Italian',
    play: 'Play',
    pause: 'Pause',
    scan_qr: 'Scan to listen',
    no_audio: 'The recording for this work is being prepared.',
    david_greet: 'Hello, I\u2019m David',
    david_subtitle: 'Florentine art apprentice — your exhibition guide',
    david_open: 'Talk with David',
    david_close: 'Close',
    david_send: 'Send',
    david_input_placeholder: 'What would you like to know?',
    david_thinking: 'Thinking\u2026',
    david_disabled_title: 'David is resting',
    david_disabled_msg: 'Please come back in a moment',
    david_disclaimer: 'David is AI-assisted and offers art-historical guidance only. He cannot give religious, medical, or professional advice.',
    loading: 'Loading\u2026',
    error: 'Could not load',
    retry: 'Retry',
    back: 'Back',
    close: 'Close',
    next: 'Next',
    previous: 'Previous',
  },
  it: {
    home: 'Home',
    gallery: 'Galleria',
    knowledge: 'Sul Thangka',
    artist: 'L\u2019Artista',
    visit: 'Visita',
    admin: 'Admin',
    enter_exhibition: 'Entra nella mostra',
    learn_more: 'Scopri di pi\u00f9',
    centerpiece: 'L\u2019Opera Centrale',
    painted_for_florence: 'Dipinto per Firenze',
    view_artwork: 'Vedi l\u2019opera',
    all_works: 'Tutte le opere',
    materials: 'Materiali',
    dimensions: 'Dimensioni',
    year: 'Anno',
    listen: 'Audioguida',
    listen_zh: 'In cinese',
    listen_en: 'In inglese',
    listen_it: 'In italiano',
    play: 'Ascolta',
    pause: 'Pausa',
    scan_qr: 'Inquadra per ascoltare',
    no_audio: 'La registrazione di quest\u2019opera \u00e8 in preparazione.',
    david_greet: 'Buongiorno, sono Davide',
    david_subtitle: 'Apprendista d\u2019arte fiorentino \u2014 la sua guida',
    david_open: 'Parla con Davide',
    david_close: 'Chiudi',
    david_send: 'Invia',
    david_input_placeholder: 'Cosa vorrebbe sapere?',
    david_thinking: 'Sto pensando\u2026',
    david_disabled_title: 'Davide riposa',
    david_disabled_msg: 'Torni tra poco, La prego',
    david_disclaimer: 'Davide \u00e8 una guida assistita dall\u2019intelligenza artificiale, di natura storico-artistica. Non offre consigli religiosi, medici o professionali.',
    loading: 'Caricamento\u2026',
    error: 'Impossibile caricare',
    retry: 'Riprova',
    back: 'Indietro',
    close: 'Chiudi',
    next: 'Successiva',
    previous: 'Precedente',
  },
};

/**
 * UI string lookup hook
 */
export function useUI() {
  const { lang } = useLang();
  return UI[lang] || UI.en;
}

/**
 * Format a date for the visitor's locale
 */
export function formatDate(iso, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  const localeMap = { zh: 'zh-CN', en: 'en-GB', it: 'it-IT' };
  return d.toLocaleDateString(localeMap[lang] || 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
