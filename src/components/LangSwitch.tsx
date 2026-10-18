import { LANGS, useLang } from '../i18n';

/** Three-way language switch. Shows each language in its own script. */
export default function LangSwitch({ compact = false }: { compact?: boolean }) {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  return (
    <div className={`lang-switch${compact ? ' lang-switch-compact' : ''}`} role="radiogroup" aria-label="Language / மொழி / भाषा">
      {LANGS.map((l) => (
        <button
          key={l.code}
          role="radio"
          aria-checked={lang === l.code}
          className={lang === l.code ? 'active' : undefined}
          onClick={() => setLang(l.code)}
          lang={l.code}
        >
          {compact ? (l.code === 'en' ? 'EN' : l.code === 'ta' ? 'த' : 'हि') : l.native}
        </button>
      ))}
    </div>
  );
}
