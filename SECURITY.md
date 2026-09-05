VERDICT: CHANGES_REQUESTED

## Sicherheitsbericht

### Zusammenfassung

Die Anwendung ist als rein clientseitige Vite/React-SPA konzipiert und erfüllt die meisten Sicherheitsanforderungen des Sprints gut: Sie rendert CSV-Inhalte ausschließlich als Text, validiert persistierte LocalStorage-Daten streng, begrenzt Dateigrößen auf 100 MB und verhindert CSV-Formel-Injection bei Datenzellen.

Allerdings fehlt die Formel-Injection-Absicherung bei der exportierten Kopfzeile, und die eingesetzten Build-/Test-Abhängigkeiten weisen veraltete Versionen mit bekannten, wenn auch überwiegend nur im Entwicklungs- oder Testkontext ausnutzbaren Schwachstellen auf. Daher sind Änderungen angezeigt, aber kein Blocker.

---

### 1. Medium – CSV-Export: Formel-Injection über Spaltennamen (Header) möglich

**Betroffene Datei / Stelle:**  
`src/features/export/exportCsv.ts`  
ca. Zeile:  
```ts
const header = visibleColumns.map((column) => csvQuote(column.name)).join(',');
```

**Problem:**  
Für Datenzellen wird `escapeCellValue(cell)` aufgerufen, bevor `csvQuote` angewendet wird. Für die Kopfzeile wird nur `csvQuote(column.name)` verwendet, aber nicht `escapeCellValue`. Ein Spaltenname aus einer CSV-Datei wie `=HYPERLINK(...)`, `+cmd` oder `@cmd` wird daher unverändert in die erste Zeile des CSV-Exports geschrieben. Beim Öffnen in einer Tabellenkalkulation kann dieser Wert als Formel ausgeführt werden. Das verletzt AC-13 sinngemäß und wirkt wie eine Formel-Injection im Export.

**Konkreter Fix:**  
`escapeCellValue` auch auf Spaltennamen anwenden:

```ts
const header = visibleColumns.map((column) =>
  csvQuote(escapeCellValue(column.name)),
).join(',');
```

**Zusätzlich Test ergänzen:**  
Ein Test für einen Header `=Name` sollte erwarten, dass `exportCsv` die Kopfzeile zu `'=Name` escaped.

---

### 2. Niedrig – Formel-Injection-Bypass bei führenden Whitespace-Zeichen

**Betroffene Datei / Stelle:**  
`src/features/export/exportCsv.ts`  
```ts
const FORMULA_PREFIX = /^[=+\-@]/;
```

**Problem:**  
Die Prüfung erkennt nur Werte, die exakt mit `=`, `+`, `-` oder `@` beginnen. Ein Zellwert wie `" =SUM(A1:A2)"` (führende Leerzeichen) wird nicht escaped. Einige Tabellenkalkulationen trimmen führende Leerzeichen beim Interpretieren von CSV-Zellen und könnten den Wert dennoch als Formel ausführen.

**Konkreter Fix:**  
Vor der Prüfung führende Whitespace-Zeichen temporär entfernen:

```ts
export function escapeCellValue(value: string): string {
  const trimmedStart = value.replace(/^[\s\u00A0]+/, '');
  if (FORMULA_PREFIX.test(trimmedStart)) {
    return `'${value}`;
  }
  return value;
}
```

Das verändert den Originalwert nicht, sondern sorgt nur dann für ein vorangestelltes Apostroph, wenn der tatsächlich relevante Anfang mit einem Formelzeichen beginnt. Entsprechende Tests für `" =1"` und `" +1"` ergänzen.

---

### 3. Niedrig – Veraltete Build-/Test-Abhängigkeiten mit bekannten Schwachstellen

**Betroffene Datei / Stelle:**  
`package.json`, `package-lock.json`

**Scanner-Befund (interpretiert):**  
`npm audit` meldet:

- `vitest` **critical** (`GHSA-5xrq-8626-4rwp`) – beliebiges Datei-Lesen und -Ausführen, wenn der Vitest-UI-Server ungeschützt läuft.
- `vite` **high** (`GHSA-fx2h-pf6j-xcff`) – `server.fs.deny` Bypass auf Windows.
- Mehrere `moderate` Findings für `vite`, `esbuild`, `vite-node` und `@vitest/mocker`.

**Interpretation / Risikobewertung:**  
Diese Pakete gehören zu den Entwicklungs- und Testwerkzeugen, nicht zum ausgelieferten statischen SPA-Build. Die kritischen/höheren Findings sind primär ausnutzbar, wenn Entwicklungs-Server/UI ohne Netzwerkabsicherung betrieben werden. Für das deployed Produkt besteht deshalb kein unmittelbar hohes Risiko. Insbesondere die `vitest`-Critical ist kein Produktions-Finding, solange keine Test-UI exponiert wird.

Dennoch sollten die veralteten Versionen aktualisiert werden, um lokale Entwicklungs-/CI-Umgebungen abzusichern. Laut Scanner wäre ein Upgrade auf `vite` 8.2.2 und `vitest` 5.0.0 erforderlich. Zusätzlich sollte der Vite-Dev-Server nicht an unsichere Netzwerke gebunden werden (z. B. `--host 127.0.0.1`) und die Vitest-UI nicht in geteilter Umgebung ohne Absicherung gestartet werden.

**Konkreter Fix:**  
- `vite` auf mindestens 8.2.2 aktualisieren oder auf eine vom Advisory nicht betroffene Major-Version.
- `vitest` auf mindestens 5.0.0 aktualisieren oder auf eine vom Advisory nicht betroffene Version.
- Nach dem Upgrade `npm audit` erneut ausführen.
- In CI- und Entwicklungsdokumentation klarstellen, dass Dev-/Test-Server nicht öffentlich exponiert werden dürfen.

---

### 4. Niedrig – Fehlende Content-Security-Policy (CSP)

**Betroffene Datei / Stelle:**  
`index.html`

**Problem:**  
Der HTML-Einstiegspunkt definiert keine Content-Security-Policy. Für eine rein lokale SPA mit ausschließlich eigenen Ressourcen wäre eine CSP eine sinnvolle Härtung gegen mögliche zukünftige XSS-Lücken. Aktuell ist zwar keine Ausnutzung sichtbar, da React alle CSV-Inhalte escaped, aber die fehlende CSP erhöht die Angriffsfläche.

**Konkreter Fix:**  
In `index.html` eine Meta-CSP ergänzen, die die legitime Funktionsweise der App erhält:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';"
/>
```

Wichtig: `style-src 'self' 'unsafe-inline'` ist erforderlich, weil die Anwendung an vielen Stellen Inline-Styles über React-`style`-Attribute verwendet. Eine striktere CSP ohne `unsafe-inline` darf erst gesetzt werden, nachdem die Inline-Styles in CSS-Klassen überführt wurden.

---

### 5. Hinweis – semgrep nicht ausgeführt

Der Scanner-Abschnitt `semgrep` ist mit `[skipped] semgrep not installed` markiert. Das Fehlen dieser SAST-Ausgabe ist keine Sicherheitslücke, stellt aber eine Prüflücke dar. Empfehlung: `semgrep` in der CI installieren und ausführen, um zusätzliche statische Analysen zu ermöglichen.

---

### Positiv geprüfte Bereiche

- **Keine hartkodierten Secrets, Passwörter oder Token** im Quellcode.
- **Kein `dangerouslySetInnerHTML`**, keine `eval`/`new Function`, keine unsichere Deserialisierung.
- **LocalStorage-Validierung** ist ausführlich umgesetzt und prüft Struktur und Typen (`src/state/persistence.ts`).
- **CSV-Inhalte, Spaltennamen und Dateinamen** werden in React ausschließlich als Text gerendert.
- **Dateigrößenlimit 100 MB** ist vor dem vollständigen Einlesen umgesetzt.
- **Datenschutzhinweis, Impressum und Löschfunktion** sind vorhanden.
- **Keine Drittanbieter-Ressourcen** — Schriften und Assets sind lokal.

---

**Empfohlene nächste Schritte:**  
1. `escapeCellValue` auf die Export-Kopfzeile anwenden.
2. Formel-Injection-Prüfung um führende Whitespaces erweitern.
3. `vite` und `vitest` aktualisieren und `npm audit` bereinigen.
4. Optional CSP in `index.html` ergänzen.