# CSV-Datenstudio

Eine lokale Single-Page-Anwendung zur Auswertung von CSV-Dateien direkt im
Browser. Dateien lassen sich per Dateiauswahl oder Drag-and-drop laden, in einer
sortierbaren und seitenblätternden Tabelle anzeigen, per Volltextsuche und
UND-verknüpften Spaltenfiltern durchsuchen und durch Ein-/Ausblenden von Spalten
anpassen. Für numerische Spalten werden Kennzahlen berechnet, Balken- und
Liniendiagramme werden ohne externe Bibliothek gezeichnet und die gefilterte
Ansicht lässt sich als CSV exportieren. Alle Daten bleiben lokal im Browser und
werden ausschließlich dort verarbeitet.

## Tech-Stack

- **Sprache:** TypeScript
- **Framework:** React
- **Build:** Vite
- **State:** React-Hooks + Kontext (Zustand-ähnlich)
- **Styling:** CSS mit CSS-Variablen (Dark-Mode)
- **Tests:** Vitest

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

## Build für Produktion

```bash
npm run build
```

Der Build wird nach `dist/` geschrieben und lässt sich z. B. mit
`npm run preview` lokal ausliefern.

## Tests

```bash
npm test
```

## Bedienung

- **CSV laden:** Datei per Auswahl oder Drag-and-drop einziehen; Komma,
  Semikolon, Tabulator und Pipe werden als Trennzeichen erkannt.
- **Sortieren / Suchen / Filtern:** Klick auf eine Spaltenüberschrift sortiert
  auf-/absteigend; die Volltextsuche und die Filterzeile wirken auf Tabelle,
  Kennzahlen und Diagramme.
- **Spalten ein-/ausblenden:** über die Spaltenauswahl; ausgeblendete Spalten
  verschwinden aus Tabelle, Kennzahlen und Diagrammauswahl.
- **Kennzahlen:** für jede numerische Spalte werden Anzahl, Summe, Mittelwert,
  Minimum, Maximum und die Anzahl fehlender Werte angezeigt.
- **Diagramme:** Balken- und Liniendiagramm für eine wählbare Spalte, reagierend
  auf Filter.
- **Export:** lädt die aktuell gefilterte und sichtbare Ansicht als CSV herunter.
- **Dark-Mode:** umschaltbar über den Umschalter in der Kopfzeile.
- **Persistenz:** geladener Datensatz, Sortierung, Spaltenauswahl, Filter,
  Seitengröße, Diagrammspalte und Theme bleiben nach einem Reload erhalten.

## Features

- CSV-Laden per Auswahl und Drag-and-drop mit automatischer Trennzeichenerkennung
- Sortierbare, seitenblätternde Datentabelle mit Volltextsuche
- Spaltenauswahl zum Ein-/Ausblenden
- Filterzeile mit UND-verknüpften Spaltenbedingungen
- Kennzahlen für numerische Spalten
- Balken- und Liniendiagramme ohne externe Bibliothek
- CSV-Export der gefilterten Ansicht (mit Schutz vor Formel-Injection)
- LocalStorage-Persistenz mit Validierung
- Dark-Mode
- Mitgelieferter Beispieldatensatz
- Datenschutzerklärung, Impressum und Erste-Nutzung-Hinweis
