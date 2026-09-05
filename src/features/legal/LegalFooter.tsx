import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';

interface LegalSection {
  heading?: string;
  paragraphs: string[];
}

interface LegalDocument {
  id: 'privacy' | 'imprint';
  title: string;
  sections: LegalSection[];
}

const PRIVACY_POLICY: LegalDocument = {
  id: 'privacy',
  title: 'Datenschutzerklärung',
  sections: [
    {
      paragraphs: [
        'Diese Anwendung („CSV-Datenstudio“) läuft vollständig in Ihrem Browser. Sie benötigt keinen Server und überträgt keine Daten an Dritte.',
      ],
    },
    {
      heading: '1. Verarbeitung von CSV-Daten',
      paragraphs: [
        'Alle CSV-Dateien, die Sie über die Dateiauswahl oder per Drag-and-drop laden, werden ausschließlich lokal in Ihrem Browser eingelesen und ausgewertet. Die Daten werden zu keinem Zeitpunkt an einen Server oder an Dritte übertragen.',
      ],
    },
    {
      heading: '2. Speicherung im LocalStorage',
      paragraphs: [
        'Damit Ihr zuletzt geladener Datensatz und Ihre Ansichtseinstellungen (Sortierung, Filter, Spaltenauswahl, Seitengröße, Diagrammspalte, Theme) nach einem Neuladen wiederhergestellt werden können, speichert die Anwendung diese Informationen lokal im LocalStorage Ihres Browsers.',
        'Diese Daten verbleiben ausschließlich auf Ihrem Gerät. Über die Schaltfläche „Daten löschen“ können Sie sie jederzeit vollständig entfernen.',
      ],
    },
    {
      heading: '3. Keine Cookies, kein Tracking',
      paragraphs: [
        'Die Anwendung setzt keine Cookies ein und verwendet keine Analyse-, Tracking- oder Werbedienste. Es werden keine Ressourcen von Drittanbietern (Schriften, Skripte, Tracker) geladen.',
      ],
    },
    {
      heading: '4. Ihre Rechte',
      paragraphs: [
        'Da sämtliche Daten ausschließlich auf Ihrem eigenen Gerät verarbeitet werden und die Anwendung keine personenbezogenen Daten an Dritte übermittelt, behalten Sie jederzeit die vollständige Kontrolle über Ihre Daten.',
      ],
    },
  ],
};

const IMPRINT: LegalDocument = {
  id: 'imprint',
  title: 'Impressum',
  sections: [
    {
      heading: 'Angaben gemäß § 5 DDG',
      paragraphs: [
        '[Vorname Nachname]',
        '[Straße Hausnummer]',
        '[PLZ Ort]',
        'Deutschland',
      ],
    },
    {
      heading: 'Kontakt',
      paragraphs: ['E-Mail: [E-Mail-Adresse]'],
    },
    {
      heading: 'Hinweis',
      paragraphs: [
        'Diese Anwendung wird ausschließlich im Browser ausgeführt. Es findet keine serverseitige Verarbeitung oder Speicherung von Nutzerdaten statt.',
      ],
    },
  ],
};

const navStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-1)',
  flexWrap: 'wrap',
};

const linkStyle: CSSProperties = {
  padding: '8px 16px',
  minHeight: '44px',
};

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  backgroundColor: 'rgba(15, 17, 21, 0.5)',
};

const panelStyle: CSSProperties = {
  width: '100%',
  maxWidth: '560px',
  maxHeight: '80vh',
  overflow: 'auto',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  boxShadow: '0 1px 2px rgba(16, 17, 21, 0.04)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  marginBottom: 'var(--space-3)',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--color-fg)',
};

const closeButtonStyle: CSSProperties = {
  padding: '0',
  minHeight: '36px',
  width: '36px',
  fontSize: '22px',
  lineHeight: 1,
};

const bodyStyle: CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: 'var(--color-fg)',
};

const sectionStyle: CSSProperties = {
  marginBottom: 'var(--space-3)',
};

const headingStyle: CSSProperties = {
  margin: '0 0 var(--space-1)',
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--color-fg)',
};

const paragraphStyle: CSSProperties = {
  margin: '0 0 var(--space-1)',
};

const footerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: 'var(--space-3)',
};

export default function LegalFooter() {
  const [openDocument, setOpenDocument] = useState<LegalDocument | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openDocument) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDocument(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openDocument]);

  const close = () => setOpenDocument(null);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      close();
    }
  };

  return (
    <>
      <nav className="legal-footer" style={navStyle}>
        <button
          type="button"
          className="btn btn-ghost"
          style={linkStyle}
          onClick={() => setOpenDocument(PRIVACY_POLICY)}
        >
          Datenschutzerklärung
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={linkStyle}
          onClick={() => setOpenDocument(IMPRINT)}
        >
          Impressum
        </button>
      </nav>

      {openDocument && (
        <div style={overlayStyle} onClick={handleOverlayClick}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            tabIndex={-1}
            style={panelStyle}
          >
            <div style={headerStyle}>
              <h2 id="legal-modal-title" style={titleStyle}>
                {openDocument.title}
              </h2>
              <button
                type="button"
                className="btn btn-ghost"
                style={closeButtonStyle}
                onClick={close}
                aria-label="Schließen"
              >
                ×
              </button>
            </div>
            <div style={bodyStyle}>
              {openDocument.sections.map((section) => (
                <section
                  key={section.heading ?? section.paragraphs[0]}
                  style={sectionStyle}
                >
                  {section.heading && (
                    <h3 style={headingStyle}>{section.heading}</h3>
                  )}
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} style={paragraphStyle}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>
            <div style={footerStyle}>
              <button type="button" className="btn btn-primary" onClick={close}>
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
