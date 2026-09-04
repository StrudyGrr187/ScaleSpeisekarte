# ScaleSpeisekarte

Multi-tenant SaaS for digital restaurant menus. An owner builds a menu in the admin,
publishes it, and guests reach it by scanning a QR code or tapping an NFC plate —
no account, no app.

```
Owner → /admin → menu builder → publish → guest scans QR/NFC → /menu/{slug}
```

## Stack

| Layer      | Choice                                                    |
| ---------- | --------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Components, Server Actions) |
| Language   | TypeScript (strict)                                        |
| Styling    | Tailwind CSS v4, CSS-first `@theme` (no `tailwind.config`) |
| Database   | PostgreSQL 17 + Prisma 7 (`@prisma/adapter-pg`)            |
| Validation | Zod 4 at every server-action boundary                      |
| Auth       | HTTP-only JWT session cookie (`jose`) + bcrypt             |
| Drag & drop| `@dnd-kit` (pointer **and** keyboard sensors)              |
| Images     | `sharp` — resized and re-encoded to WebP on upload         |
| QR         | `qrcode` — PNG for screens, SVG for print                  |
| Icons      | `lucide-react` (SVG only, never emoji)                     |
| AI         | `@anthropic-ai/sdk`, Claude Opus 5, structured output via Zod — optional |

## Setup

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL and AUTH_SECRET
createdb scalespeisekarte
npx prisma migrate deploy
npm run db:seed
npm run dev                   # http://localhost:3100
```

`AUTH_SECRET` must be a real secret: `openssl rand -base64 32`.

`ANTHROPIC_API_KEY` is **optional**. Without it everything else works unchanged
and the two AI features hide themselves behind a clear notice rather than
failing when clicked.

### Demo tenant

| | |
|-|-|
| Admin | http://localhost:3100/admin |
| E-Mail | `demo@cafe-milano.de` |
| Passwort | `demo1234` |
| Gastansicht | http://localhost:3100/menu/cafe-milano |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 3100 |
| `npm run build` | `prisma generate` + production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Reset and reseed the Café Milano demo tenant |
| `npm run db:studio` | Prisma Studio |

## Architecture

### Tenant isolation

`Restaurant` is the tenant. Every admin read and write goes through
[`src/lib/tenant.ts`](src/lib/tenant.ts), which resolves the restaurant from the
**session**, never from client input. Ids arriving from the browser
(`categoryId`, `itemId`, reorder payloads) are re-checked against that tenant
before use — `assertCategoryInTenant` / `assertItemInTenant`, and the reorder
actions intersect the submitted id list with rows the tenant actually owns.

### One menu, two surfaces

The guest menu and the admin preview render the **same components**
([`src/components/menu/`](src/components/menu/)). The preview is not a
reimplementation, so it cannot drift:

- Public route → `getPublicMenuBySlug` → `MenuView`
- Builder preview → local builder state → `builderToPublic` → `MenuView embedded`

`builderToPublic` ([`src/lib/builder-types.ts`](src/lib/builder-types.ts)) applies the
same visibility rules as the public query, which is why the preview updates the
instant the owner types.

### Money

Prices are integer minor units (cents) everywhere; floats never touch a price.
`parsePrice` ([`src/lib/money.ts`](src/lib/money.ts)) accepts what owners actually
type — `8,5`, `8.50`, `8,50 €`, `1.234,50` — and `formatPrice` renders per the
tenant's currency and locale.

### Branding safety

The owner picks one accent colour. Every derived colour — the foreground on that
accent, the accent as text, tinted surfaces and borders — is computed from WCAG
luminance in [`src/lib/color.ts`](src/lib/color.ts) and injected as CSS variables
on a single wrapper.

An owner cannot produce an unreadable menu. Each derived colour is checked
against the surface it is actually painted on, not against an idealised white:

| Pair | Worst case across all 16.7M colours |
| --- | --- |
| ink on accent (active chip) | 4.50:1 |
| accent text on `--accent-soft` (badge) | 4.50:1 |
| accent text on the paper background | 4.50:1 |

`#FFE500` yields dark ink on the chip and `#7A6E00` for accent text. The accent
is deliberately confined to small elements — active chip, recommendation badge,
sale price, category hairline — so a garish brand colour cannot swamp the page.

### Two guest themes

`Restaurant.menuTheme` picks how the public menu is set:

- **`MODERN`** — the scrolling digital list: hairline dividers, images at the
  right, pill category chips, price on its own line.
- **`CLASSIC`** — the typography of a printed menu: one book serif (EB Garamond)
  throughout, italic descriptions, **no dish images**, no dividers, and a flush
  right-hand price column instead of dot leaders. Still one fast HTML page — not
  a PDF, not a page you have to pinch-zoom.

Almost all of the difference is token overrides under
`[data-guest-theme="classic"]` in [`design/theme.css`](design/theme.css); only
three things differ structurally in the components (price column, no images,
centred category heads). The tenant accent is untouched by the theme, so the
contrast guarantees above hold in both.

Dot leaders were considered and rejected: on a 375px column the run between name
and price varies from a few pixels to most of the line depending on where the
name wraps, and every implementation breaks on multi-line names or leaks filler
characters to screen readers. The flush price edge is the stronger ordering cue.

### AI features (optional)

Both call Claude Opus 5 with a Zod-typed structured output, and both **propose
rather than apply** — nothing reaches the database until the owner confirms.

| Feature | Route | Guard rails |
| --- | --- | --- |
| Import an existing menu from PDF or photo | `/admin/import` | Prices come back as the **printed string** and go through our own `parsePrice`, never as a model-emitted number. Allergens are only carried over when literally printed next to the dish — never inferred from ingredients. Imported items are created **hidden**, so an OCR slip cannot reach a guest. |
| Propose a look from one sentence | `/admin/design` | The returned colour, font key and theme are re-validated against the closed registries; an unusable colour is replaced. Nothing is saved until "Look speichern". |

Allergen *inference* is deliberately not built: a hallucinated allergen is a
liability, not a bug.

### Publishing

`published` controls whether the public URL serves the menu. Edits to a published
menu are live immediately — which is what makes the "heute aus" toggle useful
mid-service — so the UI says exactly that rather than implying a staged draft.

### QR / NFC

Both point at the same destination: `{origin}/menu/{slug}`. The code encodes only
that URL, so menu edits never invalidate printed codes. Changing the slug does,
and the settings form warns about it before saving.

## Data model

`User → Restaurant → Menu → Category → MenuItem`, plus global reference tables
`Allergen` (EU codes A–R) and `DietaryTag`, joined many-to-many. The schema already
supports several menus per restaurant; the MVP UI exposes exactly one.

`MenuItem` separates two ideas the UI keeps distinct:

- `visible` — hidden from the public menu entirely
- `available` — shown, but marked "Heute nicht verfügbar"

## Deliberately not built

Ordering/payments, AI-generated allergens (a liability risk), multi-language,
time-scheduled menus, analytics charts, staff roles, and a theme builder. The
schema and the tenant boundary leave room for all of them.
