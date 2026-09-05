import { useState, type CSSProperties } from 'react';

const PRIVACY_NOTICE_STORAGE_KEY = 'csv-datastudio:privacy-notice-acknowledged';

function hasAcknowledgedPrivacyNotice(): boolean {
  try {
    return window.localStorage.getItem(PRIVACY_NOTICE_STORAGE_KEY) === 'true';
  } catch {
    // If storage is unavailable, treat the notice as unacknowledged so the
    // user still sees it; it simply reappears on the next load.
    return false;
  }
}

function acknowledgePrivacyNotice(): void {
  try {
    window.localStorage.setItem(PRIVACY_NOTICE_STORAGE_KEY, 'true');
  } catch {
    // Storage may be unavailable (private mode, quota). The notice is still
    // dismissed for this session; it will reappear on the next load.
  }
}

const noticeStyle: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 900,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
  padding: '12px 16px',
  backgroundColor: 'var(--color-accent_soft)',
  color: 'var(--color-accent)',
  borderTop: '1px solid var(--color-border)',
  fontSize: '14px',
  lineHeight: 1.5,
};

const textStyle: CSSProperties = {
  margin: 0,
  flex: '1 1 260px',
};

export default function PrivacyNotice() {
  const [acknowledged, setAcknowledged] = useState<boolean>(() =>
    hasAcknowledgedPrivacyNotice(),
  );

  if (acknowledged) {
    return null;
  }

  const handleConfirm = () => {
    acknowledgePrivacyNotice();
    setAcknowledged(true);
  };

  return (
    <aside className="privacy-notice" role="note" style={noticeStyle}>
      <p style={textStyle}>
        Hinweis: Ihre CSV-Daten werden ausschließlich lokal in Ihrem Browser
        verarbeitet und nicht übertragen.
      </p>
      <button type="button" className="btn btn-primary" onClick={handleConfirm}>
        Verstanden
      </button>
    </aside>
  );
}
