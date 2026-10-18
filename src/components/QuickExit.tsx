import { useT } from '../i18n';
import { ExitIcon } from './icons';
import { lockSensitive } from './PinGate';

/**
 * One tap leaves the app for a neutral page and re-locks private sections.
 * location.replace means the Back button does not return here.
 */
export default function QuickExit() {
  const t = useT();
  return (
    <button
      className="quick-exit"
      onClick={() => {
        lockSensitive();
        window.location.replace('https://www.google.com/search?q=weather');
      }}
    >
      <ExitIcon width={16} height={16} />
      {t('Quick exit')}
    </button>
  );
}
