import { useNavigate } from 'react-router-dom';
import { useToasts } from '../store/toasts';
import { XIcon } from './icons';
import { useT } from '../i18n';

/** In-app notification banners — the one channel that works on every phone. */
export default function ToastHost() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);
  const navigate = useNavigate();
  const t = useT();
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tone}`}>
          <button
            className="toast-body"
            onClick={() => {
              if (toast.link) navigate(toast.link.replace(/^#/, ''));
              dismiss(toast.id);
            }}
          >
            <span className="toast-title">{toast.title}</span>
            {toast.body && <span className="toast-text">{toast.body}</span>}
          </button>
          <button className="toast-close" aria-label={t('Dismiss')} onClick={() => dismiss(toast.id)}>
            <XIcon width={16} height={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
