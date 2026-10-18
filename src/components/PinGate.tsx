import { useState, type ReactNode } from 'react';
import { create } from 'zustand';
import { useStore } from '../store/useStore';
import { useT } from '../i18n';
import { LockIcon } from './icons';

/** Unlock lasts for this tab session only — a shared phone handed over later is locked again. */
const useUnlock = create<{ unlocked: boolean; set: (v: boolean) => void }>()((set) => ({
  unlocked: false,
  set: (v) => set({ unlocked: v }),
}));

export function lockSensitive() {
  useUnlock.getState().set(false);
}

/** Guards mood checks, counselling and contraception screens behind her PIN. */
export default function PinGate({ children }: { children: ReactNode }) {
  const t = useT();
  const pin = useStore((s) => s.privacy.pin);
  const lockOn = useStore((s) => s.privacy.lockSensitive);
  const unlocked = useUnlock((s) => s.unlocked);
  const setUnlocked = useUnlock((s) => s.set);
  const [entry, setEntry] = useState('');
  const [wrong, setWrong] = useState(false);

  if (!pin || !lockOn || unlocked) return <>{children}</>;

  const press = (d: string) => {
    const next = (entry + d).slice(0, 4);
    setWrong(false);
    setEntry(next);
    if (next.length === 4) {
      if (next === pin) {
        setUnlocked(true);
      } else {
        setWrong(true);
        setTimeout(() => setEntry(''), 350);
      }
    }
  };

  return (
    <div className="page pin-gate">
      <div className="pin-icon" aria-hidden="true">
        <LockIcon width={26} height={26} />
      </div>
      <h1 className="pin-title">{t('This section is private')}</h1>
      <p className="soft">{t('Enter your 4-digit PIN to continue.')}</p>
      <div className={`pin-dots${wrong ? ' pin-wrong' : ''}`} aria-live="polite" aria-label={t('{n} of 4 digits entered', { n: entry.length })}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < entry.length ? 'filled' : undefined} />
        ))}
      </div>
      {wrong && <p className="pin-error">{t('That PIN did not match. Try again.')}</p>}
      <div className="pin-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
          k === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              className="pin-key"
              aria-label={k === '⌫' ? t('Delete') : k}
              onClick={() => (k === '⌫' ? setEntry(entry.slice(0, -1)) : press(k))}
            >
              {k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
