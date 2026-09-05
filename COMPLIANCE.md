VERDICT: CHANGES_REQUESTED

# Compliance-Report: CSV-Datenstudio (Merged Product)

## 1. DSGVO / Datenschutz

### 1.1 Datenschutzerklärung inhaltlich unvollständig
**Schweregrad:** hoch  
**Datei:** `src/features/legal/LegalFooter.tsx`

Die Datenschutzerklärung beschreibt zwar die lokale Verarbeitung, enthält aber keine Angaben zum Verantwortlichen, keine Kontaktdaten, keine Rechtsgrundlage, keine konkrete Speicherdauer und keine vollständigen Betroffenenrechte (Berichtigung, Löschung, Beschwerde bei einer Aufsichtsbehörde).

**Abhilfe:** In `PRIVACY_POLICY` einen Abschnitt 0 „Verantwortlicher und Kontakt“ ergänzen:
```ts
{
  heading: 'Verantwortlicher und Kontakt',
  paragraphs: [
    '[Vor- und Nachname des Anbieters]',
    '[Straße Hausnummer]',
    '[PLZ Ort]',
    'E-Mail: [E-Mail-Adresse]',
  ],
},
```
Zusätzlich Abschnitt 4 ausbauen:
- Rechtsgrundlage für die lokale Verarbeitung/Speicherung benennen (Art. 6 Abs. 1 UAbs. 1 lit. b DSGVO, da die Speicherung für die vom Nutzer gewünschte Wiederherstellung erforderlich ist; ePrivacy: technisch erforderliche Speicherung im Endgerät).
- Speicherdauer konkret benennen: „bis zum Löschen über ‚Daten löschen‘“.
- Vollständige Betroffenenrechte nennen, einschließlich Beschwerderecht bei einer Datenschutzaufsichtsbehörde.

### 1.2 Impressum nur mit Platzhaltern
**Schweregrad:** hoch  
**Datei:** `src/features/legal/LegalFooter.tsx`

Das Impressum enthält ausschließlich Platzhalter (`[Vorname Nachname]`, `[Straße Hausnummer]`, `[E-Mail-Adresse]`). Für eine öffentlich aufrufbare SPA eines geschäftsmäßigen Online-Dienstes verstoßen diese Platzhalter gegen die Impressumspflicht gemäß § 5 DDG.

**Abhilfe:** `IMPRINT.sections[0].paragraphs` und `IMPRINT.sections[1].paragraphs` mit echter ladungsfähiger Anschrift und erreichbarer E-Mail-Adresse befüllen. Keine Platzhalter ausliefern.

### 1.3 „Daten löschen“ löscht nicht den Privacy-Notice-Schlüssel
**Schweregrad:** niedrig  
**Dateien:** `src/features/privacy/ClearDataButton.tsx`, `src/state/persistence.ts`

`clearPersistedState()` entfernt nur `csv-datastudio-v1`. Der Schlüssel `csv-datastudio:privacy-notice-acknowledged` aus `PrivacyNotice.tsx` bleibt bestehen. „Daten löschen“ setzt daher nicht alle gespeicherten Zustände zurück; der Datenschutzhinweis erscheint nach dem Löschen nicht erneut.

**Abhilfe:** In `clearPersistedState()` zusätzlich den Hinweis-Schlüssel entfernen:
```ts
localStorage.removeItem('csv-datastudio:privacy-notice-acknowledged');
```
Alternativ in `ClearDataButton` beim Löschen denselben Schlüssel entfernen. Das ist mit dem Produktzweck vereinbar: Der Hinweis darf nach vollständigem Datenreset erneut erscheinen.

### 1.4 Speicherdauer in der Datenschutzerklärung nicht konkret benannt
**Schweregrad:** mittel  
**Datei:** `src/features/legal/LegalFooter.tsx`

Die Datenschutzerklärung sagt nur, dass die Daten „jederzeit vollständig entfernt“ werden können. Eine konkrete Speicherbegrenzung oder ein Löschzeitpunkt fehlt.

**Abhilfe:** In `PRIVACY_POLICY` Abschnitt 2 ergänzen: „Die Daten bleiben gespeichert, bis Sie die Schaltfläche ‚Daten löschen‘ verwenden oder den LocalStorage Ihres Browsers leeren.“

### 1.5 Positivbefunde
- CSV-Inhalte, Spaltennamen und Dateinamen werden ausschließlich als Text gerendert; kein `dangerouslySetInnerHTML` sichtbar.
- CSV-Export entschärft Formel-Injection (`escapeCellValue`).
- LocalStorage wird strukturell und typseitig validiert.
- Keine Drittanbieter-Ressourcen, kein Tracking, keine Cookies.
- Dateigrößenlimit von 100 MB verhindert grobe Speicherüberlastung.
- Privacy Notice beim ersten Start vorhanden und inhaltlich korrekt.

---

## 2. EU Cyber Resilience Act (CRA)

### 2.1 Projektlizenz unbestimmt
**Schweregrad:** mittel  
**Datei:** `package.json`

Das Projekt weist keine Lizenz aus. Für CRA-/SBOM- und Lizenzkonformität muss die Lizenz eindeutig sein.

**Abhilfe:** In `package.json` ein Lizenzfeld ergänzen, z. B.:
```json
"license": "MIT"
```
Ggf. zusätzlich eine `LICENSE`-Datei im Repository ablegen.

### 2.2 Keine sichtbare Sicherheitsdokumentation
**Schweregrad:** mittel  
**Datei:** fehlend/`README.md`

Die CRA verlangt für Produkte mit digitalen Elementen dokumentierte Sicherheitseigenschaften und ein Update-/Patch-Konzept. Im sichtbaren Projektzustand fehlt eine `SECURITY.md` oder ein entsprechender Abschnitt.

**Abhilfe:** `SECURITY.md` anlegen mit:
- Architekturbeschreibung: rein clientseitige Verarbeitung, keine Übertragung,
- Sicherheitsmaßnahmen: Rendering als Text, Formel-Injection-Schutz, LocalStorage-Validierung, 100-MB-Limit,
- Umgang mit Abhängigkeiten und Updates: z. B. Dependabot/npm-Audit, Release-Prozess.

### 2.3 SBOM nicht als eigenes Artefakt sichtbar
**Schweregrad:** niedrig  
**Datei:** `package.json`, `package-lock.json`

Abhängigkeiten sind deterministisch vorhanden, aber kein exportiertes SBOM-Artefakt sichtbar.

**Abhilfe:** Im Build- oder Release-Prozess ein SBOM generieren (SPDX oder CycloneDX) und mit ausliefern. Die verwendeten Abhängigkeiten selbst sind unkritisch (React/Vite/Vitest: MIT-kompatibel).

### 2.4 Positivbefunde
- Security by Design erkennbar: kein `dangerouslySetInnerHTML`, Formel-Injection-Maßnahme, Größenlimit, validierte Persistenz.
- Keine riskanten oder inkompatiblen Lizenzen in den genannten Abhängigkeiten.

---

## 3. EU AI Act

**Nicht anwendbar.**  
Das Produkt enthält keine KI-Funktion; es werden lediglich CSV-Daten geparst, gefiltert und Diagramme gezeichnet. Es entstehen keine Pflichten aus dem AI Act.

---

## 4. Pflichttexte & UI

### 4.1 Datenschutzerklärung und Impressum vorhanden und erreichbar
**Schweregrad:** erfüllt, mit inhaltlichen Mängeln  
**Dateien:** `src/App.tsx`, `src/features/legal/LegalFooter.tsx`

Beide Texte sind aus dem Footer jeder Ansicht aufrufbar. Die Inhalte müssen jedoch wie unter 1.1 und 1.2 beschrieben vervollständigt werden.

### 4.2 Privacy Notice beim ersten Start
**Schweregrad:** erfüllt  
**Datei:** `src/features/legal/PrivacyNotice.tsx`

Der Hinweis auf ausschließlich lokale Verarbeitung erscheint beim ersten Start. Er ist korrekt und verständlich. Der Hinweis ist keine Einwilligung, sondern eine transparente Information; das ist ausreichend, weil nur technisch erforderliche LocalStorage-Speicherung erfolgt.

---

## 5. Barrierefreiheit / EAA / WCAG

### 5.1 Modal-Dialog ohne sichtbaren Fokus-Trap
**Schweregrad:** mittel  
**Datei:** `src/features/legal/LegalFooter.tsx`

Im sichtbaren Code wird beim Öffnen des Impressum-/Datenschutz-Dialogs lediglich der erste Button fokussiert. Es gibt keinen Fokus-Trap und keinen sichtbar erzwungenen Fokus-Rückweg zum auslösenden Element.

**Abhilfe:** Im `useEffect` des Dialogs einen Fokus-Trap ergänzen: Tab innerhalb des Dialogs zyklisch zwischen allen fokussierbaren Elementen halten. Beim Schließen den Fokus auf den zuvor auslösenden Button zurücksetzen. Zusätzlich den Dialog mit `aria-labelledby` auf eine sichtbare Überschrift beziehen, sofern noch nicht vorhanden.

### 5.2 Sortier-Buttons nicht explizit gelabelt
**Schweregrad:** niedrig  
**Datei:** `src/features/table/DataTable.tsx`

Die Sortier-Buttons in der Tabellenkopfzeile tragen als zugänglichen Namen nur den Spaltennamen. Für Screenreader ist die Aktion „Sortieren nach …“ nicht explizit.

**Abhilfe:** Dem Button ein `aria-label={`Nach ${column.name} sortieren`}` geben. Das `aria-sort` am `<th>` kann bestehen bleiben.

### 5.3 Positivbefunde
- Viele Bedienelemente besitzen sinnvolle `aria-label`.
- Diagramme sind als `role="img"` mit `aria-label` ausgezeichnet.
- `aria-sort` für sortierte Spalten vorhanden.
- Eingabefelder, Suchfeld und Auswahlfelder sind beschriftet.
- Tastaturbedienung und sichtbarer Fokusstil sind grundsätzlich vorhanden.

---

**Zusammenfassung:**  
Keine fundamentalen DSGVO-Verstöße, keine unzulässige Datenübertragung, keine kritischen Sicherheitslücken. Der Code ist grundsätzlich sauber. Die Marktreife scheitert derzeit an den unvollständigen Pflichttexten (Impressum, Datenschutzerklärung) und kleineren CRA-/Barrierefreiheitslücken.