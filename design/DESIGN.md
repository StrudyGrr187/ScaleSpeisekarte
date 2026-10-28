# ScaleMenu – Designsystem

Verbindlich für die **Startseite** und, nach der Umstellung, für das **Admin**.
Tokens: [`design/brand.css`](./brand.css). Schrift: [`src/lib/brand-font.ts`](../src/lib/brand-font.ts).
Bausteine: [`src/components/marketing/`](../src/components/marketing/).

Gleiches System wie ScaleBooked. Beide Produkte sehen aus wie eine Familie,
jedes hat seine eigene Signalfarbe.

## Wo es gilt, und wo nicht

| Fläche | System |
|---|---|
| Startseite (`/`) | dieses System |
| Admin (`/admin`, `/platform`) | dieses System, Umstellung steht noch aus (heute Indigo) |
| **Gastkarte (`/menu/*`)** | **nicht dieses System.** Sie gehört dem Wirt: zehn Looks, seine Farbe, seine Schrift (`theme.css`, `guest-*`-Tokens) |

Die Gastkarte erscheint auf der Startseite nur als Inhalt, im Telefon auf der
Bühne. Dort trägt sie bewusst ihren eigenen warmen Look. Der Kontrast zur
grauen Umgebung zeigt „deine Karte, dein Look“.

## Die Idee: ein Produkt, kein Plakat

Die Seite sieht aus wie die Software, die sie verkauft. Bilder sind
Oberflächen des Produkts: das Telefon mit der Karte, der Editor, kleine
Status-Karten. Keine Stockfotos, keine Illustrationen, keine Verläufe.
Essensfotos sind Inhalt der Gastkarte und erscheinen nur dort.

## Drei Regeln

1. **Eine Schrift.** Schibsted Grotesk. Überschriften in 500 (mittel, nicht
   fett), eng gesetzt mit −0,04 em. Fett liest sich wie ein Plakat, mittel wie
   Software. Einzige Ausnahme ist die Wortmarke in Space Grotesk 700.
2. **Fast nur Grau.** Weiß, Zink-Grau, Schwarz als Tinte. Kein Creme, kein
   Blau, kein Lila.
3. **Genau eine Farbe, und die bedeutet einen Zustand.** Bordeaux heißt
   überall **live / online / gerade geändert**. Nie Schmuck, nie Knopf, nie
   Fehler, nie Verlauf.

## Tokens

| Rolle | Wert | Tailwind |
|---|---|---|
| Tinte | `#0b0b0c` | `text-ink`, `bg-ink` |
| Fließtext | `#52525b` (7,7:1) | `text-ink-2` |
| leise | `#71717a` (4,8:1) | `text-ink-3` |
| zweite Headline-Zeile | `#8b8b93` (3,4:1, nur große Schrift) | `text-ink-4` |
| Deko, Klammern | `#a1a1aa` (nie Text) | `text-ink-5` |
| Flächen | `#ffffff` / `#fafafa` Bühne / `#f4f4f5` Hover, Segmente | `bg-paper` / `bg-canvas` / `bg-sand` |
| Linien | `#e4e4e7`, `#efeff1`, `#d4d4d8` | `border-line`, `-line-soft`, `-line-strong` |
| **Signal** | `#9b1c31` (8,1:1, ein Wert für Punkt und Text) | `text-signal`, `bg-signal` |
| Signal als Fläche | `#f8edef` | `bg-signal-tint` |
| Signal auf Schwarz | `#e8899a` (7,9:1) | `text-signal-on-ink` |
| Auf Schwarz | `#fafafa`, `#a1a1aa`, `#8b8b93`, Linie `#27272a` | `text-on-ink`, `-on-ink-2`, `-on-ink-3`, `border-on-ink-line` |

**Radien:** Knöpfe als Pille (`rounded-full`), Felder 10 px (`rounded-field`),
Kacheln 14 px (`rounded-tile`), Karten 20 px (`rounded-card`), Bühne 28 px
(`rounded-stage`).

**Schatten:** immer zuerst eine 1-px-Kante als Schatten, dann ein weicher
Fall. `shadow-edge` für Chips und Felder, `shadow-card` für Karten,
`shadow-float` für schwebende Karten, `shadow-button` für den schwarzen Knopf.
Keine farbigen Schatten, kein Glow.

**Schriftgrößen:** `text-display` (bis 72 px), `text-h2` (bis 48 px),
`text-h3` (17 px), `text-lead` (17–19 px). Gewicht und Laufweite stecken im
Token.

**Ziffern:** keine `tabular-nums` in Schibsted. Die Tabellenziffern haben
breite Satzzeichen („19 : 40“, „7 ,90“).

## Wiederkehrende Muster

- **Chip über jeder Überschrift:** kleine Pille mit Icon im Kreis. Ersetzt die
  Versalien-Zeile, die jede Vorlage hat. → `Chip`
- **Zweifarbige Headline, nur im Hero:** erste Zeile schwarz, zweite grau.
- **Knöpfe:** schwarze Pille mit → für die Hauptaktion, weiße Pille mit Kante
  als zweiter Weg. → `buttonPrimary`, `buttonSecondary`
- **Hero:** zentriert, steht beim Laden still. Darunter die **Bühne**, ein
  hellgraues Panel mit Punktraster (`bg-dotgrid`) und dem Telefon in der Mitte.
  Ab `lg` schweben Karten drum herum und erzählen, was mit der Karte passiert
  ist. Darunter stapeln sie sich.
- **Sektionen:** Kopf mit Chip und Überschrift links, Einleitung rechts. Weiße
  und hellgraue Sektionen wechseln sich ab, getrennt durch Haarlinien.
  → `Section`, `SectionHead`
- **Bento-Karten** mit kleinen Produktgrafiken statt Icons.
- **Paar aus weißer und schwarzer Karte** für Gegenüberstellungen (Du / Wir,
  später Preise).
- **Footer** dunkel, große Wortmarke mit App-Icon.
- **Wortmarke:** App-Icon vor `Scale[Menu]`, Klammern grau. → `AppIcon`, `Wordmark`

**Icons:** Lucide mit Strichstärke 1,75. Kein anderes Set mischen.

**Bewegung:** nur ein ruhiges Einblenden beim Scrollen (`data-reveal`, reines
CSS mit `animation-timeline: view()`, aus bei `prefers-reduced-motion`). Der
Hero bewegt sich nicht.

## Nie

Zweite Schrift · Farbverläufe · Lila oder Blau · Glas-Unschärfe
(`backdrop-blur`) · Emoji · Versalien-Eyebrows · Bordeaux als Knopf oder Deko ·
Zahlen ohne Beleg · Funktionen, die es nicht gibt (keine Bestellung, keine
Kasse, solange ScaleMenu nur Karten zeigt).

## Sprache

Die Leser sind Wirte, keine Software-Leute. Sie sprechen wie Wirte: Karte,
Gericht, Preis, Tisch, Gast, „heute aus“.

- **Situationen statt Funktionen.** „Um 19:40 sind die Vongole aus“ statt
  „Verfügbarkeit in Echtzeit verwalten“.
- **Kurze Sätze, du-Form**, ein Gedanke pro Satz.
- **Kein „es“ ohne Bezug.** Sagen, was sich ändert: der Preis, das Gericht.
- **Keine Anglizismen**, wo es ein deutsches Wort gibt: Design statt Look,
  „jetzt auf der Karte“ statt „live“. „Online“ bleibt, so heißt der Status im
  Produkt.
- **Nichts versprechen, was der Code nicht kann.** Keine Bestellungen, kein
  automatisches Zurücksetzen von „Heute aus“, keine Rechtsaussagen zur
  Allergenpflicht.
- **Nicht von ScaleBooked abschreiben.** Gleiche Bauweise, eigene Sätze.

## Beispieldaten

Alle erfundenen Namen, Preise, Uhrzeiten und Zähler stehen in **einer** Datei,
[`src/components/marketing/sample-data.ts`](../src/components/marketing/sample-data.ts),
und jede Fläche, die sie zeigt, ist mit „Beispieldaten“ beschriftet. Die
Gerichte folgen der Café-Milano-Demo, damit Bild und Demo zusammenpassen.
