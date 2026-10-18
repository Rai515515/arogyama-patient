import { useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import ta from './ta';
import hi from './hi';

/**
 * Tiny gettext-style i18n.
 * UI code writes the English sentence: t('Good morning, {name}', { name }).
 * Tamil and Hindi dictionaries are keyed by that exact English string, and
 * fall back to English when a key is missing (scripts/check-i18n.mjs fails the
 * build check when any key is missing, so the fallback is a safety net only).
 */

export type Lang = 'en' | 'ta' | 'hi';

export const LANGS: { code: Lang; native: string; english: string }[] = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
];

export const LOCALE: Record<Lang, string> = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN' };

const DICTS: Record<Exclude<Lang, 'en'>, Record<string, string>> = { ta, hi };

/** Content that ships in all three languages. */
export interface LText {
  en: string;
  ta: string;
  hi: string;
}

export type Vars = Record<string, string | number>;

function fill(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function translate(lang: Lang, s: string, vars?: Vars): string {
  const base = lang === 'en' ? s : (DICTS[lang][s] ?? s);
  return fill(base, vars);
}

export function pick(text: LText, lang: Lang, vars?: Vars): string {
  return fill(text[lang] || text.en, vars);
}

interface LangState {
  lang: Lang;
  chosen: boolean;
  setLang: (lang: Lang) => void;
}

export const useLang = create<LangState>()(
  persist(
    (set) => ({
      lang: 'en',
      chosen: false,
      setLang: (lang) => {
        set({ lang, chosen: true });
        if (typeof document !== 'undefined') document.documentElement.lang = lang;
      },
    }),
    {
      name: 'arogyama-lang',
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') document.documentElement.lang = state.lang;
      },
    },
  ),
);

export type TFn = (s: string, vars?: Vars) => string;

export function useT(): TFn {
  const lang = useLang((s) => s.lang);
  return useCallback((s: string, vars?: Vars) => translate(lang, s, vars), [lang]);
}

export function usePick(): (text: LText, vars?: Vars) => string {
  const lang = useLang((s) => s.lang);
  return useCallback((text: LText, vars?: Vars) => pick(text, lang, vars), [lang]);
}

/** Locale-aware date/time formatting. */
export function useFmt() {
  const lang = useLang((s) => s.lang);
  const loc = LOCALE[lang];
  return {
    lang,
    date: (d: Date | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
      new Date(d).toLocaleDateString(loc, opts),
    time: (d: Date | string) => new Date(d).toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' }),
    weekday: (d: Date | string, style: 'short' | 'long' = 'short') =>
      new Date(d).toLocaleDateString(loc, { weekday: style }),
    num: (n: number) => n.toLocaleString(loc),
  };
}
