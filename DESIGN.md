# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Klares, datendichtes Datenstudio im Linear/Stripe-Stil: helle neutrale Flächen mit Indigo-Akzent, ruhige System-Typografie und konsistenter Dark-Mode, damit Tabelle, Filter und Diagramme im Mittelpunkt stehen.

## Colors

- `--color-bg`: **#FAFBFC**
- `--color-surface`: **#FFFFFF**
- `--color-fg`: **#1A1D23**
- `--color-muted`: **#6B7280**
- `--color-border`: **#E2E5EA**
- `--color-accent`: **#4F46E5**
- `--color-accent_hover`: **#4338CA**
- `--color-accent_soft`: **#EEF2FF**
- `--color-bg_dark`: **#0F1115**
- `--color-surface_dark`: **#1A1D24**
- `--color-fg_dark`: **#E6E8EC**
- `--color-muted_dark`: **#9AA1AB**
- `--color-border_dark`: **#2A2F38**
- `--color-accent_dark`: **#818CF8**
- `--color-accent_hover_dark`: **#6366F1**
- `--color-accent_soft_dark`: **#252A3D**
- `--color-success`: **#16A34A**
- `--color-warning`: **#D97706**
- `--color-error`: **#DC2626**
- `--color-chart_1`: **#4F46E5**
- `--color-chart_2`: **#0EA5E9**
- `--color-chart_3`: **#10B981**
- `--color-chart_4`: **#F59E0B**
- `--color-chart_5`: **#EF4444**
- `--color-chart_6`: **#8B5CF6**

## Typography

- `font_family`: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
- `font_mono`: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace
- `heading_weight`: 600
- `body_weight`: 400
- `size_scale`: 12px/14px/16px/20px/28px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-pill`: 999px

## Components

### Button

Min-height 44px (Touch-Ziel); Standard padding 12px 24px, kompakte Variante 8px 16px; radius md; font-weight 600; focus-visible: 2px Ring in accent_soft, offset 2px. Primary: bg=accent, fg=white; hover=accent_hover; active=accent_hover + inner shadow/leicht dunkler; disabled=opacity 0.5, kein Pointer. Secondary: bg=surface, border 1px border, fg=fg; hover=accent_soft; active=border accent. Ghost: transparent, fg=accent; hover=bg accent_soft. Danger: bg=error, fg=white; hover=error dunkler.

### Card

bg=surface, border 1px border, radius lg, padding 16px (kompakt) bis 24px (Standard), shadow 0 1px 2px rgba(16,17,21,0.04). Im Dark-Mode: bg=surface_dark, border=border_dark.

### Input

bg=surface, border 1px border, radius md, padding 8px 12px, min-height 44px, fg=fg; placeholder=muted; focus: border=accent + 2px Ring accent_soft; disabled=opacity 0.5, bg=bg. Select identisch mit eigenem Pfeil.

### Table

Container: bg=surface, border 1px border, radius lg, overflow auto; sticky Header (bg=bg, border-bottom 1px border). Header-Zellen: padding 10px 16px, font-size 13px, weight 600, muted; sortierbar mit Pfeil-Indikator, hover=accent_soft. Datenzellen: padding 10px 16px, font-size 14px, border-bottom 1px border; numerische Spalten rechtsbündig in font_mono mit tabular-nums. Zeilen-hover=bg; Zebra optional bg + 50% opacity. Header sortiert: fg=accent.

### Pagination

Footer-Toolbar mit Zeilen-pro-Seite-Select links, Seitenzahlen rechts. Seiten-Buttons: 36x36px, radius md, fg=fg; hover=accent_soft; aktive Seite bg=accent, fg=white; disabled=opacity 0.5. Text 'X–Y von Z' in muted, font-size 13px.

### Badge

Inline-Label, radius pill, padding 2px 10px, font-size 12px, weight 600. Neutral: bg=accent_soft, fg=accent. Success/Warning/Error jeweils mit 12% Farbfüllung und vollem Textfarbton (success/warning/error).

### Modal

Overlay rgba(15,17,21,0.5), zentriert; Panel=Card radius lg, padding 24px, max-width 560px, max-height 80vh, overflow auto; Header mit Titel + Schließen-Button, Body spacing 16px, Footer rechtsbündig.

### EmptyState

Zentriert, padding 48px 24px, Icon 40px in muted, Titel fg weight 600 font-size 16px, Beschreibung muted font-size 14px, max-width 420px; eine Handlungsoption als Primary-Button darunter.

### Notice

Volle Breite, radius md, padding 12px 16px, font-size 14px. Info: bg=accent_soft, fg=accent; Success: bg=success mit 12% Füllung, fg=success; Error: bg=error mit 12% Füllung, fg=error; Warning: bg=warning mit 12% Füllung, fg=warning.

### Dropzone

Bereich 2px gestrichelt border, radius lg, padding 48px 24px, zentriert, bg=surface; Text muted + Dateiauswahl als Secondary-Button. Hover: border=accent, bg=accent_soft; Drag-over: border=accent, bg=accent_soft, border solid.

### Chart

Selbst gezeichnet in SVG/Canvas, bg transparent, Achsen und Gitterlinien in border, Achsbeschriftung muted 12px. Balken: Balkenbreite abhängig von Kategorienzahl (min 8px, max 48px), fill=accent (Dark: accent_dark), hover=chart_2, Abstand zwischen Balken 25% der Balkenbreite. Linie: stroke=accent, stroke-width 2px, Punkte r=3px fill=accent, Fläche optional accent mit 10% Deckkraft. Legende: 12px, muted, Swatch 10x10px radius sm. Kategorien mit vielen Werten horizontal abkürzen/rotieren, niemals überlappen.

### Toolbar

Sticky oben (top 0, z-index 10), bg=bg mit 85% Deckkraft + backdrop-blur 8px, border-bottom 1px border, padding 12px 24px; enthält Suche, Spaltenauswahl, Diagramm-Select, Dark-Mode, Beispieldaten, Export. Bei <640px vertikal gestapelt.

## Layout Principles

- Container max-width 1440px, horizontal zentriert, Seiten-Padding 24px (16px unter 640px).
- Breakpoints: <640px mobil (Toolbar/Filter vertikal stapeln), ≥640px Tablet, ≥1024px Desktop (Filter und Diagramme nebeneinander).
- Vertikaler Rhythmus: 32px Abstand zwischen Hauptsektionen, 16px innerhalb einer Sektion, 8px zwischen eng verwandten Bedienelementen.
- Tabelle: eigener Scroll-Container mit sticky Header; bei schmalen Viewports horizontales Scrollen statt Spaltenquetschen.
- Numerische Daten immer rechtsbündig und in Monospace mit tabular-nums für scanbare Zahlenreihen.
- Diagramme: Höhe 260–360px, volle Containerbreite; unter 640px untereinander statt nebeneinander.
- Fokus-Reihenfolge entspricht visueller Reihenfolge: Toolbar → Filter → Tabelle → Pagination; alle interaktiven Elemente mit sichtbarem Fokusring.
