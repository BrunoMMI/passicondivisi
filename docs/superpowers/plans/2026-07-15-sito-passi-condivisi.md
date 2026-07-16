# Sito Passi Condivisi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-ready Astro marketing site for the social cooperative Passi Condivisi, using only real content extracted from `file/`, per the approved design spec.

**Architecture:** Static Astro site (TS + Tailwind), content centralized in typed `src/data/*.ts` modules, small interactive islands only where needed (mobile menu, cookie consent, copy-IBAN, contact form, gallery lightbox). Multi-page architecture with a teaser homepage.

**Tech Stack:** Astro (latest stable), TypeScript (strict), Tailwind CSS, `@astrojs/sitemap`, `astro:assets` (sharp) for WebP/AVIF, `@fontsource` for self-hosted fonts, no external JS frameworks needed (Astro islands use vanilla TS).

**Domain-specific adaptation of this plan format:** this is a content/marketing site, not an algorithmic library — there is no meaningful unit-test suite to TDD against for most tasks. Verification per task is: `npm run build` succeeding, and explicit manual/grep checks described in each task (content present, no placeholder leakage, accessibility attributes present). Where a task involves real logic (cookie consent state, IBAN copy fallback, contact form validation), the step shows the exact implementation code directly, since these are small pure functions easy to verify by direct inspection and by exercising in the running dev server.

## Global Constraints

- Astro latest stable + TypeScript strict + Tailwind CSS (from spec §2).
- Italian language site (`<html lang="it">`), single H1 per page (spec §17).
- No invented data. Every content gap uses an explicit placeholder or is omitted per the design spec §3 table.
- `docs/superpowers/specs/2026-07-14-sito-passi-condivisi-design.md` is the source of truth for content, palette, and page structure.
- Privacy Policy and Cookie Policy links appear ONLY in the footer, never in the main nav (spec §3/§13).
- No analytics/tracker fires before cookie consent (spec §9/§14).
- `prefers-reduced-motion` must disable/simplify all animation (spec §15).
- WCAG 2.1 AA: semantic HTML, visible focus, skip link, labelled form fields, keyboard-operable menu and lightbox.
- Colors (sampled directly from the source logo, `file/logo_passi_condivisi-def.pdf`):
  `--brand-yellow:#FFD848` `--brand-purple:#4850A8` `--brand-red:#F84040`
  `--brand-orange:#FF8838` `--brand-blue:#38A8C8` `--brand-green:#90C870`
- Extracted logo assets already produced at
  `C:\Users\D3t3c\AppData\Local\Temp\claude\B--vscode-workspace-passi-condivisi\6072e039-b7a0-4e46-978e-01827b9b0916\scratchpad\logo-icon.png` (1860×1859, icon only)
  and `...\scratchpad\logo-full.png` (1860×2255, icon + wordmark) — copy these into `src/assets/brand/` during Task 1.
- Bank data: IBAN `IT18U0538774940000004798849`, Banca BPER Banca, BIC/SWIFT `BPMOIT22XXX`, intestatario `[INSERIRE INTESTATARIO CONTO]` (placeholder, per user decision).
- Contact form backend: Formspree, endpoint read from `PUBLIC_FORMSPREE_ENDPOINT` env var.
- Public domain placeholder: `https://www.passicondivisi.it`.

---

### Task 1: Scaffold Astro project, Tailwind, brand assets

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.env.example`
- Create: `src/assets/brand/logo-icon.png`, `src/assets/brand/logo-full.png` (copied from scratchpad renders)
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: Astro project buildable with `npm run build`; Tailwind available via `@tailwindcss/vite` or `@astrojs/tailwind` (use whichever the installed Astro version's official docs recommend at scaffold time); brand colors available as Tailwind theme tokens `brand-purple`, `brand-yellow`, `brand-red`, `brand-orange`, `brand-blue`, `brand-green`.

- [ ] **Step 1: Scaffold Astro**

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --yes
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install @astrojs/sitemap @fontsource/fraunces @fontsource/work-sans
```

Add Tailwind following the current official Astro integration guide (`astro add tailwind` if available for the installed version, otherwise manual `@tailwindcss/vite` setup) — check installed Astro version first with `npx astro --version` and follow that version's docs.

- [ ] **Step 3: Copy brand assets**

```bash
mkdir -p src/assets/brand
cp "/c/Users/D3t3c/AppData/Local/Temp/claude/B--vscode-workspace-passi-condivisi/6072e039-b7a0-4e46-978e-01827b9b0916/scratchpad/logo-icon.png" src/assets/brand/logo-icon.png
cp "/c/Users/D3t3c/AppData/Local/Temp/claude/B--vscode-workspace-passi-condivisi/6072e039-b7a0-4e46-978e-01827b9b0916/scratchpad/logo-full.png" src/assets/brand/logo-full.png
```

- [ ] **Step 4: Configure `astro.config.mjs`**

Set `site: "https://www.passicondivisi.it"`, add `sitemap()` integration, add Tailwind integration/plugin per the version-appropriate setup from Step 2.

- [ ] **Step 5: Tailwind theme tokens**

In the Tailwind config (or CSS `@theme` block, depending on installed Tailwind version), register:

```
brand-purple: '#4850A8'
brand-purple-dark: '#343A82'
brand-yellow: '#FFD848'
brand-yellow-dark: '#E0AE00'
brand-red: '#F84040'
brand-orange: '#FF8838'
brand-blue: '#38A8C8'
brand-green: '#90C870'
ink: '#292520'
paper: '#FDFBF5'
```

- [ ] **Step 6: `.gitignore` and `.env.example`**

`.gitignore` must include `node_modules/`, `dist/`, `.env`, `.DS_Store`.
`.env.example` must contain:

```
PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/REPLACE_ME
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Expected: build succeeds (default Astro minimal page still present).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore .env.example src/assets/brand src/styles/global.css
git commit -m "chore: scaffold Astro project with Tailwind and brand assets"
```

---

### Task 2: Data layer (single source of truth)

**Files:**
- Create: `src/data/site.ts`, `src/data/contacts.ts`, `src/data/bank.ts`, `src/data/navigation.ts`, `src/data/services.ts`, `src/data/founders.ts`, `src/data/seo.ts`, `src/data/faq.ts`

**Interfaces:**
- Produces:
  - `SITE: { name: string; legalName: string; claim: string; url: string }` from `site.ts`
  - `CONTACTS: { address: {street, postalCode, city, region, country}, email, phone, phoneDisplay, instagramUrl, facebookUrl }` from `contacts.ts`
  - `BANK: { iban: string, ibanDisplay: string, bankName: string, bic: string, accountHolder: string }` from `bank.ts`
  - `NAV_LINKS: { label: string; href: string }[]` from `navigation.ts`
  - `SERVICES: { slug, title, summary, objectives: string[], colorToken }[]` from `services.ts`
  - `FOUNDERS: { name, bio: string[] }[]` from `founders.ts`
  - `SEO_DEFAULTS: { titleTemplate, description, ogImage, twitterHandle? }` from `seo.ts`
  - `FAQ: { question: string; answer: string }[]` from `faq.ts`
- Consumed by: every page/component built in later tasks.

- [ ] **Step 1: `src/data/site.ts`**

```typescript
export const SITE = {
  name: "Passi Condivisi",
  legalName: "Passi Condivisi Società Cooperativa Sociale ETS",
  vatNumber: "04950350613",
  url: "https://www.passicondivisi.it",
  claim: "Un passo alla volta, verso l'autonomia e la comunità.",
} as const;
```

- [ ] **Step 2: `src/data/contacts.ts`**

```typescript
export const CONTACTS = {
  address: {
    street: "Viale della Libertà 39",
    postalCode: "81016",
    city: "Piedimonte Matese",
    province: "CE",
    country: "Italia",
  },
  email: "passicondivisi@gmail.com",
  phone: "+393520950776",
  phoneDisplay: "352 095 0776",
  instagramUrl:
    "https://www.instagram.com/passi.codivisi?igsh=MW03cHl2Z3F6dHoxaw%3D%3D&utm_source=qr",
  facebookUrl: "https://www.facebook.com/share/1DBRoyn58Y/",
} as const;
```

- [ ] **Step 3: `src/data/bank.ts`**

```typescript
export const BANK = {
  iban: "IT18U0538774940000004798849",
  ibanDisplay: "IT18 U053 8774 9400 0000 4798 849",
  bankName: "BPER Banca",
  bic: "BPMOIT22XXX",
  accountHolder: "[INSERIRE INTESTATARIO CONTO]",
} as const;
```

- [ ] **Step 4: `src/data/navigation.ts`**

```typescript
export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Cosa offriamo", href: "/cosa-offriamo" },
  { label: "Il nostro progetto", href: "/il-nostro-progetto" },
  { label: "Contatti", href: "/contatti" },
];

export const DONATE_LINK: NavLink = { label: "Sostienici", href: "/sostienici" };

export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];
```

- [ ] **Step 5: `src/data/services.ts`**

```typescript
export type Service = {
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  colorToken: "brand-red" | "brand-orange" | "brand-green" | "brand-blue";
};

export const SERVICES: Service[] = [
  {
    slug: "assistenza-domiciliare",
    title: "Assistenza domiciliare socio-assistenziale",
    summary: "Assistenza domiciliare ad anziani e persone con disabilità.",
    objectives: [
      "Garantire alla persona anziana e/o con disabilità la permanenza presso il proprio domicilio in condizioni di sicurezza e benessere.",
      "Preservare le relazioni sociali, le abitudini di vita e il livello di autonomia residua.",
      "Sostenere i caregiver e contribuire a prevenire l'istituzionalizzazione.",
    ],
    colorToken: "brand-red",
  },
  {
    slug: "mediazione-familiare",
    title: "Servizio di mediazione familiare",
    summary:
      "Un intervento mirato per affrontare e rielaborare situazioni di criticità o conflitto nella relazione genitori-figli.",
    objectives: [
      "Promuovere attivamente l'autonomia decisionale delle parti coinvolte.",
      "Facilitare le competenze relazionali e comunicative.",
      "Favorire e stimolare il dialogo, la stima e la fiducia reciproca.",
      "Prevenire, attenuare e gestire il disagio delle parti coinvolte nelle situazioni di crisi.",
    ],
    colorToken: "brand-orange",
  },
  {
    slug: "assistenza-scolastica",
    title: "Servizio di assistenza scolastica",
    summary:
      "Sostegno socio-educativo specialistico rivolto a persone con disabilità, a garanzia del diritto allo studio.",
    objectives: [
      "Facilitare la comunicazione.",
      "Favorire la socializzazione.",
      "Sostenere l'inserimento e l'integrazione scolastica.",
      "Promuovere l'apprendimento e lo sviluppo delle potenzialità residue dell'utente.",
    ],
    colorToken: "brand-green",
  },
  {
    slug: "laboratorio-educativa-territoriale",
    title: "Laboratorio di educativa territoriale",
    summary:
      "Laboratori guidati da due fari pedagogici ed etici: la conquista dell'autonomia e la dignità dell'inclusione.",
    objectives: [
      "Accompagnare la conquista dell'autonomia: saper scegliere, comunicare i propri bisogni, muoversi nello spazio, gestire piccoli compiti personali e domestici.",
      "Costruire ponti verso l'esterno attraverso il lavoro e l'espressione creativa, in un'ottica di risorsa e non di limite.",
      "Offrire alle famiglie un'alleanza educativa solida e competenze specialistiche.",
    ],
    colorToken: "brand-blue",
  },
];
```

- [ ] **Step 6: `src/data/founders.ts`**

```typescript
export type Founder = { name: string; bio: string[] };

export const FOUNDERS: Founder[] = [
  {
    name: "Melania",
    bio: [
      "Oltre dieci anni di esperienza in Germania presso una Förderschule, scuola specializzata nell'educazione di bambini, ragazzi e giovani adulti con disabilità.",
      "Ha lavorato principalmente con persone nello spettro autistico, progettando percorsi individualizzati per sviluppare autonomie personali, sociali e comunicative, favorire l'inclusione e accompagnare i giovani verso una maggiore indipendenza.",
      "Ha seguito percorsi di orientamento al lavoro — curriculum vitae, ricerca di tirocini formativi, accompagnamento durante l'inserimento lavorativo — e organizzato laboratori, uscite educative, soggiorni e viaggi in Germania e in Italia.",
    ],
  },
  {
    name: "Gianmarco",
    bio: [
      "Significativa esperienza nell'assistenza e nell'accompagnamento di anziani e persone con disabilità, con un approccio fondato sul rispetto della persona, sul mantenimento delle autonomie e sul miglioramento della qualità della vita.",
      "Ha lavorato con bambini, ragazzi e giovani adulti nello spettro autistico, accompagnandoli nello sviluppo delle autonomie personali e domestiche, nel potenziamento della comunicazione e nella crescita delle competenze relazionali.",
      "Per lui ogni percorso educativo parte dalle capacità della persona e non dai suoi limiti.",
    ],
  },
];
```

- [ ] **Step 7: `src/data/seo.ts`**

```typescript
export const SEO_DEFAULTS = {
  titleTemplate: "%s · Passi Condivisi",
  defaultTitle: "Passi Condivisi · Cooperativa Sociale ETS",
  description:
    "Passi Condivisi è una cooperativa sociale ETS di Piedimonte Matese (CE): assistenza domiciliare, mediazione familiare, assistenza scolastica e laboratori di educativa territoriale per anziani e persone con disabilità.",
  ogImage: "/og-image.png",
} as const;
```

- [ ] **Step 8: `src/data/faq.ts`**

```typescript
export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
  {
    question: "Che cos'è Passi Condivisi?",
    answer:
      "Passi Condivisi è una cooperativa sociale ETS con sede a Piedimonte Matese (CE), nata per costruire relazioni e percorsi di autonomia con anziani e persone con disabilità, non solo per offrire servizi assistenziali.",
  },
  {
    question: "Di cosa si occupa la cooperativa?",
    answer:
      "Offre assistenza domiciliare socio-assistenziale, mediazione familiare, assistenza scolastica specialistica e laboratori di educativa territoriale.",
  },
  {
    question: "A chi sono rivolti i servizi?",
    answer:
      "Principalmente ad anziani e a persone con disabilità, in particolare nello spettro autistico, e alle loro famiglie.",
  },
  {
    question: "Come si può sostenere il progetto?",
    answer:
      "Con una donazione tramite bonifico bancario ai dati riportati nella pagina Sostienici, oppure contattando direttamente la cooperativa.",
  },
  {
    question: "Dove opera la cooperativa?",
    answer: "La sede operativa si trova a Piedimonte Matese, in provincia di Caserta.",
  },
  {
    question: "Come si può contattare Passi Condivisi?",
    answer:
      "Via email a passicondivisi@gmail.com, telefonicamente, sui social o compilando il modulo nella pagina Contatti.",
  },
];
```

- [ ] **Step 9: Typecheck**

```bash
npx astro check
```

Expected: no type errors in `src/data/*.ts`.

- [ ] **Step 10: Commit**

```bash
git add src/data
git commit -m "feat: add centralized typed content data layer"
```

---

### Task 3: BaseLayout + SeoHead + global styles

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SeoHead.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `SEO_DEFAULTS`, `SITE` from Task 2.
- Produces: `BaseLayout` props `{ title: string; description?: string; canonicalPath: string; ogImage?: string; jsonLd?: Record<string, unknown>[] }`, used by every page in Tasks 9–16.

- [ ] **Step 1: `src/components/SeoHead.astro`**

```astro
---
import { SEO_DEFAULTS, SITE } from "../data/seo";
import { SITE as SITE_INFO } from "../data/site";

interface Props {
  title: string;
  description?: string;
  canonicalPath: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>[];
}

const { title, description = SEO_DEFAULTS.description, canonicalPath, ogImage = SEO_DEFAULTS.ogImage, jsonLd = [] } = Astro.props;
const canonicalUrl = new URL(canonicalPath, SITE_INFO.url).toString();
const ogImageUrl = new URL(ogImage, SITE_INFO.url).toString();
---
<title>{title} · Passi Condivisi</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalUrl} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:image" content={ogImageUrl} />
<meta property="og:locale" content="it_IT" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImageUrl} />
{jsonLd.map((entry) => (
  <script type="application/ld+json" set:html={JSON.stringify(entry)} />
))}
```

- [ ] **Step 2: `src/layouts/BaseLayout.astro`**

Full page shell: `<html lang="it">`, skip link, `<Header />`/`<Footer />` slots (components built in Task 4/5 — import them here once they exist), main landmark with `id="main"`, `<CookieBanner />` mount point (Task 7).

```astro
---
import SeoHead from "../components/SeoHead.astro";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
import CookieBanner from "../components/CookieBanner.astro";
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
  canonicalPath: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>[];
}

const { title, description, canonicalPath, ogImage, jsonLd } = Astro.props;
---
<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <SeoHead title={title} description={description} canonicalPath={canonicalPath} ogImage={ogImage} jsonLd={jsonLd} />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="manifest" href="/site.webmanifest" />
  </head>
  <body class="bg-paper text-ink font-sans antialiased">
    <a href="#main" class="skip-link">Salta al contenuto</a>
    <Header />
    <main id="main">
      <slot />
    </main>
    <Footer />
    <CookieBanner />
  </body>
</html>
```

(`Header`, `Footer`, `CookieBanner` are stubbed as empty-but-valid components at the end of this task and filled in by Tasks 4/5/7 — this keeps `BaseLayout` buildable immediately.)

- [ ] **Step 3: Stub `Header.astro`, `Footer.astro`, `CookieBanner.astro`**

Minimal valid placeholders (e.g. `<header></header>`) so the build succeeds; replaced with real markup in later tasks.

- [ ] **Step 4: `src/styles/global.css`**

```css
@import "@fontsource/fraunces/600.css";
@import "@fontsource/fraunces/700.css";
@import "@fontsource/work-sans/400.css";
@import "@fontsource/work-sans/500.css";
@import "@fontsource/work-sans/600.css";
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
  h1, h2, h3, h4 {
    font-family: "Fraunces", serif;
  }
  body {
    font-family: "Work Sans", sans-serif;
  }
}

@layer components {
  .skip-link {
    @apply sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-brand-purple focus:text-white focus:px-4 focus:py-2 focus:rounded-md;
  }
}
```

(Adjust `@tailwind` directives vs. `@theme`/CSS-first config depending on the Tailwind version actually installed in Task 1 — check `node_modules/tailwindcss/package.json` version and follow that version's official syntax.)

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: succeeds, no missing-component errors.

- [ ] **Step 6: Commit**

```bash
git add src/layouts src/components/SeoHead.astro src/components/Header.astro src/components/Footer.astro src/components/CookieBanner.astro src/styles/global.css
git commit -m "feat: add base layout, SEO head, and global styles"
```

---

### Task 4: Header + MobileMenu

**Files:**
- Modify: `src/components/Header.astro` (replace stub)
- Create: `src/components/MobileMenu.astro`
- Create: `src/scripts/mobile-menu.ts`

**Interfaces:**
- Consumes: `NAV_LINKS`, `DONATE_LINK` from `navigation.ts`; `Astro.url.pathname` for active-link state.
- Produces: `#mobile-menu-toggle` button id and `#mobile-menu` panel id, consumed only internally by `mobile-menu.ts`.

- [ ] **Step 1: `src/components/Header.astro`**

Sticky header, transparent over hero (`data-transparent` attribute toggled by scroll script) turning solid on scroll; desktop nav with `aria-current="page"` on the active link; visible "Sostienici" CTA button; hamburger button with `aria-expanded`, `aria-controls="mobile-menu"`.

```astro
---
import { NAV_LINKS, DONATE_LINK } from "../data/navigation";
import { SITE } from "../data/site";
import MobileMenu from "./MobileMenu.astro";
import brandLogo from "../assets/brand/logo-full.png";
import { Image } from "astro:assets";

const currentPath = Astro.url.pathname;
---
<header id="site-header" class="sticky top-0 z-50 transition-colors duration-300 bg-paper/95 backdrop-blur border-b border-black/5">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
    <a href="/" class="flex items-center gap-2" aria-label={`${SITE.name} — torna alla home`}>
      <Image src={brandLogo} alt={`Logo ${SITE.legalName}`} width={48} height={58} class="h-12 w-auto" />
    </a>
    <nav aria-label="Navigazione principale" class="hidden lg:flex items-center gap-6">
      {NAV_LINKS.map((link) => (
        <a
          href={link.href}
          class="text-sm font-medium text-ink hover:text-brand-purple transition-colors"
          aria-current={currentPath === link.href ? "page" : undefined}
        >
          {link.label}
        </a>
      ))}
      <a href={DONATE_LINK.href} class="rounded-full bg-brand-purple px-5 py-2 text-sm font-semibold text-white hover:bg-brand-purple-dark transition-colors">
        {DONATE_LINK.label}
      </a>
    </nav>
    <button
      id="mobile-menu-toggle"
      type="button"
      class="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-ink"
      aria-expanded="false"
      aria-controls="mobile-menu"
      aria-label="Apri il menu di navigazione"
    >
      <span class="hamburger-icon" aria-hidden="true"></span>
    </button>
  </div>
  <MobileMenu currentPath={currentPath} />
</header>
<script src="../scripts/mobile-menu.ts"></script>
```

- [ ] **Step 2: `src/components/MobileMenu.astro`**

Full-screen or slide-in panel, `role="dialog"` `aria-modal="true"`, `id="mobile-menu"`, hidden by default (`hidden` attribute), contains the same `NAV_LINKS` + `DONATE_LINK`, a visible close button.

```astro
---
import { NAV_LINKS, DONATE_LINK } from "../data/navigation";
interface Props { currentPath: string }
const { currentPath } = Astro.props;
---
<div id="mobile-menu" class="fixed inset-0 z-40 hidden bg-paper" role="dialog" aria-modal="true" aria-label="Menu di navigazione" hidden>
  <div class="flex justify-end p-4">
    <button id="mobile-menu-close" type="button" class="rounded-md p-2" aria-label="Chiudi il menu">✕</button>
  </div>
  <nav class="flex flex-col items-center gap-6 px-6 py-8" aria-label="Navigazione principale (mobile)">
    {NAV_LINKS.map((link) => (
      <a href={link.href} class="text-lg font-medium" aria-current={currentPath === link.href ? "page" : undefined}>
        {link.label}
      </a>
    ))}
    <a href={DONATE_LINK.href} class="rounded-full bg-brand-purple px-6 py-3 text-lg font-semibold text-white">
      {DONATE_LINK.label}
    </a>
  </nav>
</div>
```

- [ ] **Step 3: `src/scripts/mobile-menu.ts`**

Vanilla TS: toggle open/close, set `aria-expanded`, lock body scroll (`document.body.style.overflow`), close on link click, close on `Escape`, trap focus while open, restore focus to the toggle button on close.

```typescript
function initMobileMenu(): void {
  const toggle = document.getElementById("mobile-menu-toggle");
  const closeBtn = document.getElementById("mobile-menu-close");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu || !closeBtn) return;

  const focusableSelector = "a[href], button:not([disabled])";

  function openMenu(): void {
    menu!.hidden = false;
    toggle!.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    const first = menu!.querySelector<HTMLElement>(focusableSelector);
    first?.focus();
  }

  function closeMenu(): void {
    menu!.hidden = true;
    toggle!.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    toggle!.focus();
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  closeBtn.addEventListener("click", closeMenu);

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || menu!.hidden) return;
    closeMenu();
  });

  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || menu!.hidden) return;
    const focusable = Array.from(menu!.querySelectorAll<HTMLElement>(focusableSelector));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function initHeaderScrollState(): void {
  const header = document.getElementById("site-header");
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle("shadow-md", window.scrollY > 8);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

initMobileMenu();
initHeaderScrollState();
```

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Open the site, resize to mobile width, confirm: hamburger opens the panel, `Tab`/`Shift+Tab` stay trapped inside while open, `Escape` closes it, body doesn't scroll while open, focus returns to the toggle button on close.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/MobileMenu.astro src/scripts/mobile-menu.ts
git commit -m "feat: add accessible header and mobile navigation menu"
```

---

### Task 5: Footer + SocialLinks

**Files:**
- Modify: `src/components/Footer.astro` (replace stub)
- Create: `src/components/SocialLinks.astro`

**Interfaces:**
- Consumes: `SITE`, `CONTACTS`, `NAV_LINKS`, `FOOTER_LEGAL_LINKS` from Task 2.
- Produces: `#reopen-cookie-preferences` button id, consumed by `cookie-consent.ts` in Task 7.

- [ ] **Step 1: `src/components/SocialLinks.astro`**

```astro
---
import { CONTACTS } from "../data/contacts";
---
<ul class="flex gap-4">
  <li>
    <a href={CONTACTS.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Passi Condivisi su Instagram" class="hover:text-brand-purple">Instagram</a>
  </li>
  <li>
    <a href={CONTACTS.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Passi Condivisi su Facebook" class="hover:text-brand-purple">Facebook</a>
  </li>
</ul>
```

- [ ] **Step 2: `src/components/Footer.astro`**

```astro
---
import { SITE } from "../data/site";
import { CONTACTS } from "../data/contacts";
import { NAV_LINKS, FOOTER_LEGAL_LINKS } from "../data/navigation";
import SocialLinks from "./SocialLinks.astro";
import brandLogo from "../assets/brand/logo-icon.png";
import { Image } from "astro:assets";

const year = new Date().getFullYear();
---
<footer class="bg-brand-purple text-white">
  <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
    <div>
      <Image src={brandLogo} alt={`Logo ${SITE.legalName}`} width={56} height={56} class="h-14 w-14 rounded-full bg-white p-1" />
      <p class="mt-4 text-sm text-white/80">{SITE.legalName}</p>
      <p class="mt-2 text-sm text-white/80">P.IVA {SITE.vatNumber}</p>
    </div>
    <nav aria-label="Link del footer">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-white/60">Sezioni</h2>
      <ul class="mt-4 space-y-2 text-sm">
        {NAV_LINKS.map((link) => <li><a href={link.href} class="hover:underline">{link.label}</a></li>)}
      </ul>
    </nav>
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-wide text-white/60">Contatti</h2>
      <ul class="mt-4 space-y-2 text-sm">
        <li>{CONTACTS.address.street}, {CONTACTS.address.postalCode} {CONTACTS.address.city} ({CONTACTS.address.province})</li>
        <li><a href={`mailto:${CONTACTS.email}`} class="hover:underline">{CONTACTS.email}</a></li>
        <li><a href={`tel:${CONTACTS.phone}`} class="hover:underline">{CONTACTS.phoneDisplay}</a></li>
      </ul>
      <div class="mt-4"><SocialLinks /></div>
    </div>
  </div>
  <div class="border-t border-white/20">
    <div class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>© {year} {SITE.legalName}. Tutti i diritti riservati.</p>
      <div class="flex flex-wrap gap-4">
        {FOOTER_LEGAL_LINKS.map((link) => <a href={link.href} class="hover:underline">{link.label}</a>)}
        <button id="reopen-cookie-preferences" type="button" class="hover:underline">Preferenze cookie</button>
      </div>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro src/components/SocialLinks.astro
git commit -m "feat: add site footer with legal links and social links"
```

---

### Task 6: Shared content components (SectionHeading, ScrollReveal, CallToAction, ServiceCard, Faq, Breadcrumbs)

**Files:**
- Create: `src/components/SectionHeading.astro`
- Create: `src/components/ScrollReveal.astro`
- Create: `src/scripts/scroll-reveal.ts`
- Create: `src/components/CallToAction.astro`
- Create: `src/components/ServiceCard.astro`
- Create: `src/components/Faq.astro`
- Create: `src/components/Breadcrumbs.astro`

**Interfaces:**
- `SectionHeading` props: `{ eyebrow?: string; title: string; subtitle?: string; align?: "left" | "center" }`
- `ScrollReveal` props: `{ as?: string }`, wraps `<slot />` in an element with `data-reveal` attribute.
- `CallToAction` props: `{ title: string; description?: string; href: string; label: string }`
- `ServiceCard` props: `{ service: Service }` (type from `services.ts`)
- `Faq` props: `{ items: FaqItem[] }`, renders `<details>/<summary>` pairs and emits `FAQPage` JSON-LD matching the visible text exactly.
- `Breadcrumbs` props: `{ items: { label: string; href?: string }[] }`, renders visible breadcrumb nav and `BreadcrumbList` JSON-LD.

- [ ] **Step 1: `src/components/SectionHeading.astro`**

```astro
---
interface Props { eyebrow?: string; title: string; subtitle?: string; align?: "left" | "center" }
const { eyebrow, title, subtitle, align = "left" } = Astro.props;
---
<div class:list={["max-w-2xl", { "mx-auto text-center": align === "center" }]}>
  {eyebrow && <p class="text-sm font-semibold uppercase tracking-wide text-brand-purple">{eyebrow}</p>}
  <h2 class="mt-2 text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
  {subtitle && <p class="mt-4 text-lg text-ink/70">{subtitle}</p>}
</div>
```

- [ ] **Step 2: `src/components/ScrollReveal.astro` + `src/scripts/scroll-reveal.ts`**

```astro
---
interface Props { as?: string }
const { as: Tag = "div" } = Astro.props;
---
<Tag data-reveal class="reveal-init">
  <slot />
</Tag>
<style is:global>
  .reveal-init { opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .reveal-visible { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    .reveal-init { opacity: 1; transform: none; transition: none; }
  }
</style>
<script src="../scripts/scroll-reveal.ts"></script>
```

```typescript
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("reveal-visible"));
}
```

- [ ] **Step 3: `src/components/CallToAction.astro`**

```astro
---
interface Props { title: string; description?: string; href: string; label: string }
const { title, description, href, label } = Astro.props;
---
<div class="rounded-3xl bg-brand-purple px-6 py-10 text-center text-white sm:px-12">
  <h2 class="text-2xl font-semibold sm:text-3xl">{title}</h2>
  {description && <p class="mt-3 text-white/80">{description}</p>}
  <a href={href} class="mt-6 inline-block rounded-full bg-brand-yellow px-8 py-3 font-semibold text-ink hover:bg-brand-yellow-dark transition-colors">
    {label}
  </a>
</div>
```

- [ ] **Step 4: `src/components/ServiceCard.astro`**

```astro
---
import type { Service } from "../data/services";
interface Props { service: Service }
const { service } = Astro.props;
const borderColor: Record<Service["colorToken"], string> = {
  "brand-red": "border-brand-red",
  "brand-orange": "border-brand-orange",
  "brand-green": "border-brand-green",
  "brand-blue": "border-brand-blue",
};
---
<article class:list={["rounded-2xl border-t-4 bg-white p-6 shadow-sm", borderColor[service.colorToken]]}>
  <h3 class="text-xl font-semibold text-ink">{service.title}</h3>
  <p class="mt-2 text-ink/70">{service.summary}</p>
  <ul class="mt-4 space-y-2 text-sm text-ink/80">
    {service.objectives.map((objective) => <li class="flex gap-2"><span aria-hidden="true">•</span><span>{objective}</span></li>)}
  </ul>
</article>
```

- [ ] **Step 5: `src/components/Faq.astro`**

```astro
---
import type { FaqItem } from "../data/faq";
interface Props { items: FaqItem[] }
const { items } = Astro.props;
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};
---
<div class="space-y-4">
  {items.map((item) => (
    <details class="rounded-xl border border-black/10 p-4">
      <summary class="cursor-pointer font-medium text-ink">{item.question}</summary>
      <p class="mt-2 text-ink/70">{item.answer}</p>
    </details>
  ))}
</div>
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

- [ ] **Step 6: `src/components/Breadcrumbs.astro`**

```astro
---
interface Item { label: string; href?: string }
interface Props { items: Item[] }
const { items } = Astro.props;
import { SITE } from "../data/site";
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: item.href ? new URL(item.href, SITE.url).toString() : undefined,
  })),
};
---
<nav aria-label="Breadcrumb" class="text-sm text-ink/60">
  <ol class="flex flex-wrap gap-2">
    {items.map((item, index) => (
      <li class="flex items-center gap-2">
        {item.href ? <a href={item.href} class="hover:underline">{item.label}</a> : <span aria-current="page">{item.label}</span>}
        {index < items.length - 1 && <span aria-hidden="true">/</span>}
      </li>
    ))}
  </ol>
</nav>
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

- [ ] **Step 7: Build check**

```bash
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add src/components/SectionHeading.astro src/components/ScrollReveal.astro src/scripts/scroll-reveal.ts src/components/CallToAction.astro src/components/ServiceCard.astro src/components/Faq.astro src/components/Breadcrumbs.astro
git commit -m "feat: add shared content components (headings, reveal, CTA, cards, FAQ, breadcrumbs)"
```

---

### Task 7: Cookie consent system

**Files:**
- Modify: `src/components/CookieBanner.astro` (replace stub)
- Create: `src/components/CookiePreferences.astro`
- Create: `src/scripts/cookie-consent.ts`

**Interfaces:**
- Produces: `window.getCookieConsent(): { necessary: true; analytics: boolean; marketing: boolean } | null` and `window.openCookiePreferences(): void`, globally available for future analytics scripts to check before firing (documented in README, Task 19).
- Consumes: `#reopen-cookie-preferences` button id from Task 5's `Footer.astro`.

- [ ] **Step 1: `src/scripts/cookie-consent.ts`**

```typescript
type ConsentState = { necessary: true; analytics: boolean; marketing: boolean };

const STORAGE_KEY = "passi-condivisi-cookie-consent";

function readConsent(): ConsentState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function writeConsent(state: ConsentState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  document.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: state }));
}

function showBanner(): void {
  document.getElementById("cookie-banner")?.removeAttribute("hidden");
}
function hideBanner(): void {
  document.getElementById("cookie-banner")?.setAttribute("hidden", "");
}
function showPreferences(): void {
  document.getElementById("cookie-preferences")?.removeAttribute("hidden");
}
function hidePreferences(): void {
  document.getElementById("cookie-preferences")?.setAttribute("hidden", "");
}

function init(): void {
  const existing = readConsent();
  if (!existing) showBanner();

  document.getElementById("cookie-accept-all")?.addEventListener("click", () => {
    writeConsent({ necessary: true, analytics: true, marketing: true });
    hideBanner();
  });

  document.getElementById("cookie-reject-all")?.addEventListener("click", () => {
    writeConsent({ necessary: true, analytics: false, marketing: false });
    hideBanner();
  });

  document.getElementById("cookie-open-preferences")?.addEventListener("click", () => {
    showPreferences();
  });

  document.getElementById("cookie-preferences-save")?.addEventListener("click", () => {
    const analytics = (document.getElementById("cookie-pref-analytics") as HTMLInputElement | null)?.checked ?? false;
    const marketing = (document.getElementById("cookie-pref-marketing") as HTMLInputElement | null)?.checked ?? false;
    writeConsent({ necessary: true, analytics, marketing });
    hidePreferences();
    hideBanner();
  });

  document.getElementById("cookie-preferences-close")?.addEventListener("click", hidePreferences);

  document.getElementById("reopen-cookie-preferences")?.addEventListener("click", () => {
    const current = readConsent();
    if (current) {
      const analyticsInput = document.getElementById("cookie-pref-analytics") as HTMLInputElement | null;
      const marketingInput = document.getElementById("cookie-pref-marketing") as HTMLInputElement | null;
      if (analyticsInput) analyticsInput.checked = current.analytics;
      if (marketingInput) marketingInput.checked = current.marketing;
    }
    showPreferences();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hidePreferences();
  });
}

declare global {
  interface Window {
    getCookieConsent: () => ConsentState | null;
    openCookiePreferences: () => void;
  }
}
window.getCookieConsent = readConsent;
window.openCookiePreferences = showPreferences;

init();
```

- [ ] **Step 2: `src/components/CookieBanner.astro`**

```astro
<div id="cookie-banner" class="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white p-4 shadow-lg sm:p-6" role="dialog" aria-live="polite" aria-label="Preferenze cookie" hidden>
  <div class="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-ink/80">
      Utilizziamo solo cookie tecnici necessari al funzionamento del sito. Puoi accettare, rifiutare i cookie non necessari o gestire le preferenze.
      <a href="/cookie-policy" class="underline">Leggi la Cookie Policy</a>.
    </p>
    <div class="flex flex-wrap gap-2">
      <button id="cookie-reject-all" type="button" class="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium">Rifiuta non necessari</button>
      <button id="cookie-open-preferences" type="button" class="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium">Preferenze</button>
      <button id="cookie-accept-all" type="button" class="rounded-full bg-brand-purple px-4 py-2 text-sm font-medium text-white">Accetta tutti</button>
    </div>
  </div>
</div>
<CookiePreferences />
<script src="../scripts/cookie-consent.ts"></script>
```

(add `import CookiePreferences from "./CookiePreferences.astro";` to the frontmatter)

- [ ] **Step 3: `src/components/CookiePreferences.astro`**

```astro
<div id="cookie-preferences" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="cookie-preferences-title" hidden>
  <div class="w-full max-w-lg rounded-2xl bg-white p-6">
    <div class="flex items-center justify-between">
      <h2 id="cookie-preferences-title" class="text-xl font-semibold">Preferenze cookie</h2>
      <button id="cookie-preferences-close" type="button" aria-label="Chiudi" class="rounded-md p-1">✕</button>
    </div>
    <div class="mt-4 space-y-4 text-sm">
      <div class="flex items-start gap-3">
        <input type="checkbox" checked disabled class="mt-1" id="cookie-pref-necessary" />
        <label for="cookie-pref-necessary"><strong>Necessari</strong> — sempre attivi, indispensabili al funzionamento del sito.</label>
      </div>
      <div class="flex items-start gap-3">
        <input type="checkbox" class="mt-1" id="cookie-pref-analytics" />
        <label for="cookie-pref-analytics"><strong>Analitici</strong> — attualmente non utilizzati sul sito; l'opzione resta disponibile per un'eventuale attivazione futura, solo dopo il tuo consenso.</label>
      </div>
      <div class="flex items-start gap-3">
        <input type="checkbox" class="mt-1" id="cookie-pref-marketing" />
        <label for="cookie-pref-marketing"><strong>Marketing</strong> — attualmente non utilizzati sul sito; l'opzione resta disponibile per un'eventuale attivazione futura, solo dopo il tuo consenso.</label>
      </div>
    </div>
    <button id="cookie-preferences-save" type="button" class="mt-6 w-full rounded-full bg-brand-purple px-4 py-2 text-sm font-medium text-white">Salva preferenze</button>
  </div>
</div>
```

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Confirm: banner appears on first visit, "Accetta tutti"/"Rifiuta non necessari"/"Preferenze" all work, choice persists across reload (`localStorage`), footer "Preferenze cookie" reopens the modal with the saved state, `Escape` closes the modal, no analytics/marketing cookie is set anywhere (there is no analytics code in the project at all yet).

- [ ] **Step 5: Commit**

```bash
git add src/components/CookieBanner.astro src/components/CookiePreferences.astro src/scripts/cookie-consent.ts
git commit -m "feat: add GDPR-compliant cookie consent banner and preferences"
```

---

### Task 8: Homepage

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/components/Hero.astro`

**Interfaces:**
- Consumes: `SITE`, `SERVICES`, `CONTACTS`, everything from Task 2 data layer, plus `Hero`, `SectionHeading`, `ServiceCard`, `CallToAction`, `ScrollReveal` from Tasks 3/6.

- [ ] **Step 1: `src/components/Hero.astro`**

```astro
---
import { SITE } from "../data/site";
---
<section class="relative overflow-hidden bg-paper px-4 py-20 sm:px-6 sm:py-28">
  <div class="mx-auto max-w-4xl text-center">
    <h1 class="text-4xl font-semibold text-ink sm:text-5xl">Un passo alla volta, insieme</h1>
    <p class="mt-6 text-lg text-ink/70">
      {SITE.legalName} costruisce relazioni, autonomia e comunità con anziani e persone con disabilità a Piedimonte Matese.
    </p>
    <div class="mt-8 flex flex-wrap justify-center gap-4">
      <a href="/chi-siamo" class="rounded-full bg-brand-purple px-6 py-3 font-semibold text-white hover:bg-brand-purple-dark transition-colors">Scopri chi siamo</a>
      <a href="/sostienici" class="rounded-full bg-brand-yellow px-6 py-3 font-semibold text-ink hover:bg-brand-yellow-dark transition-colors">Sostieni Passi Condivisi</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: `src/pages/index.astro`**

Compose: `Hero`, mission/values section (from the design spec's manifesto excerpts — reuse the real quotes, not paraphrases), services overview grid (`ServiceCard` × 4 via `SERVICES.map`), project teaser section linking to `/il-nostro-progetto`, support teaser linking to `/sostienici`, `CallToAction` linking to `/contatti`. Wrap each major section in `<ScrollReveal>`. Pass `Organization`/`WebSite` JSON-LD to `BaseLayout`'s `jsonLd` prop.

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Hero from "../components/Hero.astro";
import SectionHeading from "../components/SectionHeading.astro";
import ServiceCard from "../components/ServiceCard.astro";
import CallToAction from "../components/CallToAction.astro";
import ScrollReveal from "../components/ScrollReveal.astro";
import { SITE } from "../data/site";
import { CONTACTS } from "../data/contacts";
import { SERVICES } from "../data/services";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: SITE.legalName,
    url: SITE.url,
    email: CONTACTS.email,
    telephone: CONTACTS.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACTS.address.street,
      postalCode: CONTACTS.address.postalCode,
      addressLocality: CONTACTS.address.city,
      addressRegion: CONTACTS.address.province,
      addressCountry: "IT",
    },
  },
  { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url },
];
---
<BaseLayout title="Home" canonicalPath="/" jsonLd={jsonLd}>
  <Hero />
  <ScrollReveal as="section">
    <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="Chi siamo" title="Non ci prendiamo cura delle fragilità. Ci prendiamo cura delle persone." align="center" />
      <p class="mt-6 text-center text-ink/70">
        La nostra Cooperativa Sociale nasce da un sogno che, con il tempo, è diventato una scelta di vita: costruire una comunità in cui ogni persona possa sentirsi accolta, valorizzata e protagonista del proprio percorso di vita.
      </p>
      <div class="mt-6 text-center">
        <a href="/chi-siamo" class="font-semibold text-brand-purple hover:underline">Scopri la nostra storia →</a>
      </div>
    </div>
  </ScrollReveal>
  <ScrollReveal as="section">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="Cosa offriamo" title="I nostri servizi" align="center" />
      <div class="mt-10 grid gap-6 sm:grid-cols-2">
        {SERVICES.map((service) => <ServiceCard service={service} />)}
      </div>
      <div class="mt-10 text-center">
        <a href="/cosa-offriamo" class="font-semibold text-brand-purple hover:underline">Scopri tutti i servizi →</a>
      </div>
    </div>
  </ScrollReveal>
  <ScrollReveal as="section">
    <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="Il nostro progetto" title="La nascita della nostra sede operativa" align="center" />
      <p class="mt-6 text-center text-ink/70">
        Dietro ogni servizio c'è un progetto concreto: la costruzione, passo dopo passo, di uno spazio pensato per accogliere persone e famiglie.
      </p>
      <div class="mt-6 text-center">
        <a href="/il-nostro-progetto" class="font-semibold text-brand-purple hover:underline">Conosci il nostro progetto →</a>
      </div>
    </div>
  </ScrollReveal>
  <ScrollReveal as="section">
    <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <CallToAction
        title="Sostieni Passi Condivisi"
        description="Il tuo contributo aiuta a costruire percorsi di autonomia, relazione e comunità."
        href="/sostienici"
        label="Scopri come sostenerci"
      />
    </div>
  </ScrollReveal>
  <ScrollReveal as="section">
    <div class="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
      <SectionHeading title="Parliamone insieme" align="center" />
      <p class="mt-4 text-ink/70">{CONTACTS.email} · {CONTACTS.phoneDisplay}</p>
      <a href="/contatti" class="mt-6 inline-block rounded-full bg-brand-purple px-6 py-3 font-semibold text-white">Contattaci</a>
    </div>
  </ScrollReveal>
</BaseLayout>
```

- [ ] **Step 3: Build + manual check**

```bash
npm run build
```

View `dist` output (or `npm run dev`) and confirm exactly one `<h1>` on the page, all links resolve to routes created later in this plan (they will 404 until those tasks complete — acceptable at this stage, re-verify in Task 20).

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/components/Hero.astro
git commit -m "feat: add homepage"
```

---

### Task 9: Chi Siamo page

**Files:**
- Create: `src/pages/chi-siamo.astro`
- Copy: gallery group photo into `src/assets/gallery/team-group.jpg` (source: `file/Galleria/WhatsApp Image 2026-07-12 at 12.33.17.jpeg`)

**Interfaces:**
- Consumes: `FOUNDERS` from Task 2, `SectionHeading`, `ScrollReveal`, `Breadcrumbs` from Task 6.

- [ ] **Step 1: Copy the founders' photo**

```bash
mkdir -p src/assets/gallery
cp "file/Galleria/WhatsApp Image 2026-07-12 at 12.33.17.jpeg" "src/assets/gallery/team-group.jpg"
```

- [ ] **Step 2: `src/pages/chi-siamo.astro`**

Sections, using the real manifesto text from the design spec (§2/§6 of the spec doc) reorganized into readable blocks — do not paraphrase away meaning: nascita/convinzione, citazione evidenziata (`"Perché non ci prendiamo cura delle fragilità..."`), il nostro impegno (liste "Vogliamo costruire relazioni" etc.), le nostre storie (`FOUNDERS.map` in two cards), foto di gruppo con alt text descrittivo, missione conclusiva. `Breadcrumbs` items: Home → Chi siamo. `BaseLayout` `jsonLd` = `WebPage` + `BreadcrumbList` (breadcrumbs already emit their own JSON-LD from Task 6, so `BaseLayout`'s `jsonLd` only needs `WebPage`).

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import SectionHeading from "../components/SectionHeading.astro";
import ScrollReveal from "../components/ScrollReveal.astro";
import Breadcrumbs from "../components/Breadcrumbs.astro";
import { FOUNDERS } from "../data/founders";
import { Image } from "astro:assets";
import teamPhoto from "../assets/gallery/team-group.jpg";

const jsonLd = [{ "@context": "https://schema.org", "@type": "WebPage", name: "Chi siamo" }];
---
<BaseLayout title="Chi siamo" canonicalPath="/chi-siamo" jsonLd={jsonLd}>
  <div class="mx-auto max-w-4xl px-4 pt-8 sm:px-6"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Chi siamo" }]} /></div>
  <header class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <h1 class="text-4xl font-semibold text-ink sm:text-5xl">Chi siamo</h1>
    <p class="mt-6 text-lg text-ink/70">
      La nostra Cooperativa Sociale nasce da un sogno che, con il tempo, è diventato una scelta di vita: non offrire semplicemente servizi, ma costruire una comunità in cui ogni persona possa sentirsi accolta, valorizzata e protagonista del proprio percorso di vita.
    </p>
  </header>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SectionHeading title="Il nostro impegno" />
      <div class="mt-6 space-y-4 text-ink/80">
        <p>Siamo convinti che ogni essere umano, indipendentemente dall'età, dalla condizione fisica, cognitiva o sociale, possieda un valore che non può essere misurato né definito dalle proprie fragilità.</p>
        <p>Non vogliamo limitarci ad assistere le persone. Vogliamo costruire relazioni. Vogliamo essere una presenza capace di ascoltare, sostenere, accompagnare e creare opportunità.</p>
        <p>Per noi la fragilità non è un limite, ma una dimensione della vita che merita rispetto, attenzione e fiducia.</p>
      </div>
    </div>
  </ScrollReveal>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <blockquote class="rounded-2xl bg-brand-purple/5 border-l-4 border-brand-purple px-6 py-8 text-xl italic text-ink">
        "Perché non ci prendiamo cura delle fragilità. Ci prendiamo cura delle persone. E in ogni persona scegliamo di vedere, prima di tutto, il suo valore, il suo futuro e la sua dignità."
      </blockquote>
    </div>
  </ScrollReveal>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <SectionHeading title="La nostra storia" subtitle="Nasce dall'incontro di due percorsi professionali diversi, guidati dagli stessi valori." />
      <div class="mt-8 grid gap-6 sm:grid-cols-2">
        {FOUNDERS.map((founder) => (
          <article class="rounded-2xl bg-white p-6 shadow-sm">
            <h3 class="text-xl font-semibold text-ink">{founder.name}</h3>
            {founder.bio.map((paragraph) => <p class="mt-3 text-sm text-ink/70">{paragraph}</p>)}
          </article>
        ))}
      </div>
      <Image src={teamPhoto} alt="Il gruppo fondatore di Passi Condivisi riunito all'aperto" width={1200} height={800} class="mt-10 w-full rounded-2xl object-cover" />
    </div>
  </ScrollReveal>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p class="text-xl font-medium text-ink">
        Il nostro obiettivo non è occupare il tempo delle persone. Il nostro obiettivo è dare significato al tempo.
      </p>
      <a href="/cosa-offriamo" class="mt-6 inline-block font-semibold text-brand-purple hover:underline">Scopri cosa offriamo →</a>
    </div>
  </ScrollReveal>
</BaseLayout>
```

- [ ] **Step 3: Build check + content grep**

```bash
npm run build
grep -c "Melania" src/pages/chi-siamo.astro
grep -c "Gianmarco" src/pages/chi-siamo.astro
```

Expected: build succeeds; both greps return ≥1.

- [ ] **Step 4: Commit**

```bash
git add src/pages/chi-siamo.astro src/assets/gallery/team-group.jpg
git commit -m "feat: add Chi Siamo page"
```

---

### Task 10: Cosa Offriamo page

**Files:**
- Create: `src/pages/cosa-offriamo.astro`

**Interfaces:**
- Consumes: `SERVICES` from Task 2, `ServiceCard`, `SectionHeading`, `ScrollReveal`, `Breadcrumbs`, `CallToAction` from Task 6/8.

- [ ] **Step 1: `src/pages/cosa-offriamo.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import SectionHeading from "../components/SectionHeading.astro";
import ServiceCard from "../components/ServiceCard.astro";
import ScrollReveal from "../components/ScrollReveal.astro";
import Breadcrumbs from "../components/Breadcrumbs.astro";
import CallToAction from "../components/CallToAction.astro";
import { SERVICES } from "../data/services";

const jsonLd = [{ "@context": "https://schema.org", "@type": "WebPage", name: "Cosa offriamo" }];
---
<BaseLayout title="Cosa offriamo" canonicalPath="/cosa-offriamo" jsonLd={jsonLd}>
  <div class="mx-auto max-w-4xl px-4 pt-8 sm:px-6"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cosa offriamo" }]} /></div>
  <header class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <h1 class="text-4xl font-semibold text-ink sm:text-5xl">Cosa offriamo</h1>
    <p class="mt-6 text-lg text-ink/70">Quattro servizi pensati per accompagnare anziani, persone con disabilità e le loro famiglie verso maggiore autonomia e partecipazione.</p>
  </header>
  <ScrollReveal as="section">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div class="grid gap-6 sm:grid-cols-2">
        {SERVICES.map((service) => <ServiceCard service={service} />)}
      </div>
    </div>
  </ScrollReveal>
  <ScrollReveal as="section">
    <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <CallToAction title="Vuoi maggiori informazioni su un servizio?" href="/contatti" label="Contattaci" />
    </div>
  </ScrollReveal>
</BaseLayout>
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/cosa-offriamo.astro
git commit -m "feat: add Cosa Offriamo page"
```

---

### Task 11: Il Nostro Progetto page + ProjectGallery + lightbox

**Files:**
- Create: `src/pages/il-nostro-progetto.astro`
- Create: `src/components/ProjectGallery.astro`
- Create: `src/scripts/gallery-lightbox.ts`
- Copy: remaining gallery photos (all except `12.33.17.jpeg`, already used in Task 9) into `src/assets/gallery/setup-01.jpg` … `setup-NN.jpg`

**Interfaces:**
- `ProjectGallery` props: `{ images: { src: ImageMetadata; alt: string }[] }`
- Produces: `[data-gallery-item]` buttons + `#gallery-lightbox` dialog, wired by `gallery-lightbox.ts`.

- [ ] **Step 1: Copy and rename the remaining gallery photos**

```bash
mkdir -p src/assets/gallery
i=1
for f in "file/Galleria/"*.jpeg; do
  base=$(basename "$f")
  if [ "$base" = "WhatsApp Image 2026-07-12 at 12.33.17.jpeg" ]; then continue; fi
  num=$(printf "%02d" "$i")
  cp "$f" "src/assets/gallery/setup-$num.jpg"
  i=$((i + 1))
done
ls src/assets/gallery
```

Expected: `team-group.jpg` plus `setup-01.jpg` … `setup-17.jpg` (17 remaining photos).

- [ ] **Step 2: `src/components/ProjectGallery.astro`**

```astro
---
import { Image } from "astro:assets";
import type { ImageMetadata } from "astro";

interface GalleryImage { src: ImageMetadata; alt: string }
interface Props { images: GalleryImage[] }
const { images } = Astro.props;
---
<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
  {images.map((image, index) => (
    <button type="button" data-gallery-item data-index={index} class="group overflow-hidden rounded-xl" aria-label={`Apri in dimensione grande: ${image.alt}`}>
      <Image src={image.src} alt={image.alt} width={480} height={480} class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
    </button>
  ))}
</div>

<div id="gallery-lightbox" class="fixed inset-0 z-[70] hidden items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Galleria fotografica" hidden>
  <button id="gallery-lightbox-close" type="button" class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" aria-label="Chiudi la galleria">✕</button>
  <button id="gallery-lightbox-prev" type="button" class="absolute left-4 rounded-full bg-white/10 p-3 text-white" aria-label="Foto precedente">‹</button>
  <img id="gallery-lightbox-image" src="" alt="" class="max-h-[85vh] max-w-[90vw] rounded-lg object-contain" />
  <button id="gallery-lightbox-next" type="button" class="absolute right-4 rounded-full bg-white/10 p-3 text-white" aria-label="Foto successiva">›</button>
</div>

<script define:vars={{ sources: images.map((i) => i.src.src), alts: images.map((i) => i.alt) }}>
  window.__galleryData = { sources, alts };
</script>
<script src="../scripts/gallery-lightbox.ts"></script>
```

- [ ] **Step 3: `src/scripts/gallery-lightbox.ts`**

```typescript
declare global {
  interface Window {
    __galleryData: { sources: string[]; alts: string[] };
  }
}

function initGalleryLightbox(): void {
  const data = window.__galleryData;
  if (!data) return;
  const dialog = document.getElementById("gallery-lightbox");
  const imageEl = document.getElementById("gallery-lightbox-image") as HTMLImageElement | null;
  const closeBtn = document.getElementById("gallery-lightbox-close");
  const prevBtn = document.getElementById("gallery-lightbox-prev");
  const nextBtn = document.getElementById("gallery-lightbox-next");
  const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-gallery-item]"));
  if (!dialog || !imageEl || !closeBtn || !prevBtn || !nextBtn || triggers.length === 0) return;

  let currentIndex = 0;
  let lastFocused: HTMLElement | null = null;

  function render(): void {
    imageEl!.src = data.sources[currentIndex];
    imageEl!.alt = data.alts[currentIndex];
  }

  function open(index: number): void {
    currentIndex = index;
    render();
    lastFocused = document.activeElement as HTMLElement;
    dialog!.hidden = false;
    closeBtn!.focus();
    document.body.style.overflow = "hidden";
  }

  function close(): void {
    dialog!.hidden = true;
    document.body.style.overflow = "";
    lastFocused?.focus();
  }

  function step(delta: number): void {
    currentIndex = (currentIndex + delta + data.sources.length) % data.sources.length;
    render();
  }

  triggers.forEach((trigger, index) => trigger.addEventListener("click", () => open(index)));
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));

  document.addEventListener("keydown", (event) => {
    if (dialog!.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });
}

initGalleryLightbox();
```

- [ ] **Step 4: `src/pages/il-nostro-progetto.astro`**

Import all 17 `setup-*.jpg` images explicitly (Astro requires statically-analyzable `import` paths for `astro:assets`), write descriptive `alt` text per photo (based on what each image actually shows — team allestendo la sede, montaggio pareti, trasporto materiali, ecc.), and structure the narrative using only real material: introduzione (dal manifesto), bisogno sociale, obiettivi/metodologia (dai "fari pedagogici" del PDF servizi), territorio, persone coinvolte, galleria, e un blocco `risultati raggiunti` con segnaposto esplicito perché non fornito nei materiali.

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import SectionHeading from "../components/SectionHeading.astro";
import ScrollReveal from "../components/ScrollReveal.astro";
import Breadcrumbs from "../components/Breadcrumbs.astro";
import ProjectGallery from "../components/ProjectGallery.astro";
import setup01 from "../assets/gallery/setup-01.jpg";
import setup02 from "../assets/gallery/setup-02.jpg";
import setup03 from "../assets/gallery/setup-03.jpg";
import setup04 from "../assets/gallery/setup-04.jpg";
import setup05 from "../assets/gallery/setup-05.jpg";
import setup06 from "../assets/gallery/setup-06.jpg";
import setup07 from "../assets/gallery/setup-07.jpg";
import setup08 from "../assets/gallery/setup-08.jpg";
import setup09 from "../assets/gallery/setup-09.jpg";
import setup10 from "../assets/gallery/setup-10.jpg";
import setup11 from "../assets/gallery/setup-11.jpg";
import setup12 from "../assets/gallery/setup-12.jpg";
import setup13 from "../assets/gallery/setup-13.jpg";
import setup14 from "../assets/gallery/setup-14.jpg";
import setup15 from "../assets/gallery/setup-15.jpg";
import setup16 from "../assets/gallery/setup-16.jpg";
import setup17 from "../assets/gallery/setup-17.jpg";

const galleryImages = [
  { src: setup01, alt: "I fondatori montano le pareti divisorie della nuova sede operativa" },
  { src: setup02, alt: "Allestimento della sede: fissaggio dei pannelli in legno alla parete" },
  { src: setup03, alt: "Il team al lavoro tra le strutture metalliche della sede in allestimento" },
  { src: setup04, alt: "Trasporto di scatoloni e materiali durante il trasloco nella nuova sede" },
  { src: setup05, alt: "Montaggio dei pannelli divisori con trapano avvitatore" },
  { src: setup06, alt: "Il team sorride durante i lavori di allestimento della sede" },
  { src: setup07, alt: "Fase di montaggio delle strutture interne della sede" },
  { src: setup08, alt: "Allestimento in corso negli ambienti della sede operativa" },
  { src: setup09, alt: "Preparazione degli spazi interni della sede" },
  { src: setup10, alt: "Il team organizza gli arredi durante l'allestimento" },
  { src: setup11, alt: "Montaggio delle pareti divisorie in un'altra area della sede" },
  { src: setup12, alt: "Dettaglio dei lavori di costruzione degli spazi interni" },
  { src: setup13, alt: "Il team al lavoro tra travi e pannelli durante l'allestimento" },
  { src: setup14, alt: "Fase di rifinitura degli ambienti della sede operativa" },
  { src: setup15, alt: "Sistemazione degli spazi comuni della sede" },
  { src: setup16, alt: "Ultimi ritocchi all'allestimento della sede operativa" },
  { src: setup17, alt: "Il team al lavoro nella sede in fase di completamento" },
];

const jsonLd = [{ "@context": "https://schema.org", "@type": "WebPage", name: "Il nostro progetto" }];
---
<BaseLayout title="Il nostro progetto" canonicalPath="/il-nostro-progetto" jsonLd={jsonLd}>
  <div class="mx-auto max-w-4xl px-4 pt-8 sm:px-6"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Il nostro progetto" }]} /></div>
  <header class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <h1 class="text-4xl font-semibold text-ink sm:text-5xl">Il nostro progetto</h1>
    <p class="mt-6 text-lg text-ink/70">
      Dietro ogni servizio di Passi Condivisi c'è un progetto concreto: la costruzione, passo dopo passo, di una sede operativa pensata per accogliere persone, famiglie e percorsi di autonomia.
    </p>
  </header>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SectionHeading title="Il bisogno a cui rispondiamo" />
      <p class="mt-6 text-ink/80">
        Crediamo che ogni anziano custodisca un patrimonio di memoria, esperienza e valori che appartiene all'intera comunità, e che ogni persona con disabilità possieda capacità, sensibilità e talenti che aspettano soltanto di essere scoperti e valorizzati. Da qui nasce la necessità di uno spazio fisico dedicato, in cui questi percorsi possano prendere forma ogni giorno.
      </p>
    </div>
  </ScrollReveal>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SectionHeading title="Obiettivi e metodologia" />
      <div class="mt-6 space-y-4 text-ink/80">
        <p><strong>La conquista dell'autonomia</strong>, intesa non come una meta astratta ma come un cammino quotidiano fatto di piccoli, grandiosi traguardi: saper scegliere, comunicare i propri bisogni, muoversi nello spazio, gestire piccoli compiti personali e domestici.</p>
        <p><strong>La dignità dell'inclusione</strong>: i nostri spazi e le nostre attività sono ponti gettati verso l'esterno, che permettono alle persone di essere integrate in un tessuto sociale che impara a guardarle attraverso la lente della risorsa, non del limite.</p>
      </div>
    </div>
  </ScrollReveal>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SectionHeading title="Territorio e persone coinvolte" />
      <p class="mt-6 text-ink/80">
        Il progetto prende vita a Piedimonte Matese (CE), grazie al lavoro diretto dei fondatori della cooperativa, Melania e Gianmarco, e delle persone che li affiancano nella costruzione quotidiana della sede e delle attività.
      </p>
    </div>
  </ScrollReveal>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading title="La nascita della sede: la nostra galleria" subtitle="Il racconto per immagini dell'allestimento della sede operativa." />
      <div class="mt-8">
        <ProjectGallery images={galleryImages} />
      </div>
    </div>
  </ScrollReveal>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SectionHeading title="Risultati e sviluppi futuri" />
      <p class="mt-6 text-ink/80">
        [INSERIRE RISULTATI RAGGIUNTI E SVILUPPI FUTURI DEL PROGETTO — dato non presente nei materiali forniti]
      </p>
    </div>
  </ScrollReveal>

  <ScrollReveal as="section">
    <div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p class="text-lg text-ink/80">Vuoi sostenere questo progetto o partecipare in prima persona?</p>
      <a href="/sostienici" class="mt-6 inline-block rounded-full bg-brand-purple px-6 py-3 font-semibold text-white">Sostieni Passi Condivisi</a>
    </div>
  </ScrollReveal>
</BaseLayout>
```

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: succeeds; confirm output includes optimized `.webp`/`.avif` assets under `dist/_astro/`.

```bash
ls dist/_astro | grep -E "\.(webp|avif)$" | head -5
```

- [ ] **Step 6: Manual verification**

```bash
npm run dev
```

Open `/il-nostro-progetto`, click a gallery thumbnail, confirm the lightbox opens, `←`/`→` navigate, `Escape` closes and focus returns to the thumbnail that opened it.

- [ ] **Step 7: Commit**

```bash
git add src/pages/il-nostro-progetto.astro src/components/ProjectGallery.astro src/scripts/gallery-lightbox.ts src/assets/gallery/setup-*.jpg
git commit -m "feat: add Il Nostro Progetto page with accessible photo gallery"
```

---

### Task 12: Sostienici page + BankDetailsCard + CopyIbanButton

**Files:**
- Create: `src/pages/sostienici.astro`
- Create: `src/components/BankDetailsCard.astro`
- Create: `src/components/CopyIbanButton.astro`
- Create: `src/scripts/copy-iban.ts`

**Interfaces:**
- Consumes: `BANK` from Task 2.
- Produces: `#copy-iban-button` + `#copy-iban-feedback`, self-contained (no other component depends on these ids).

- [ ] **Step 1: `src/scripts/copy-iban.ts`**

```typescript
function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } catch {
    succeeded = false;
  }
  document.body.removeChild(textarea);
  return succeeded;
}

async function copyIban(iban: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(iban);
      return true;
    } catch {
      return fallbackCopy(iban);
    }
  }
  return fallbackCopy(iban);
}

function init(): void {
  const button = document.getElementById("copy-iban-button");
  const feedback = document.getElementById("copy-iban-feedback");
  const iban = button?.dataset.iban;
  if (!button || !feedback || !iban) return;

  button.addEventListener("click", async () => {
    const success = await copyIban(iban);
    feedback.textContent = success ? "IBAN copiato negli appunti." : "Copia non riuscita: seleziona e copia manualmente l'IBAN.";
    feedback.classList.remove("sr-only");
    window.setTimeout(() => feedback.classList.add("sr-only"), 4000);
  });
}

init();
```

- [ ] **Step 2: `src/components/CopyIbanButton.astro`**

```astro
---
interface Props { iban: string }
const { iban } = Astro.props;
---
<button id="copy-iban-button" type="button" data-iban={iban} class="rounded-full bg-brand-purple px-5 py-2 text-sm font-semibold text-white hover:bg-brand-purple-dark transition-colors">
  Copia IBAN
</button>
<p id="copy-iban-feedback" class="sr-only mt-2 text-sm text-brand-purple" role="status" aria-live="polite"></p>
<script src="../scripts/copy-iban.ts"></script>
```

- [ ] **Step 3: `src/components/BankDetailsCard.astro`**

```astro
---
import { BANK } from "../data/bank";
import CopyIbanButton from "./CopyIbanButton.astro";
---
<div class="rounded-2xl border border-brand-purple/20 bg-white p-6 shadow-sm sm:p-8">
  <div class="flex items-center gap-2 text-brand-purple">
    <span aria-hidden="true">🔒</span>
    <p class="text-sm font-semibold">Bonifico bancario sicuro</p>
  </div>
  <dl class="mt-4 space-y-3 text-sm text-ink/80">
    <div><dt class="font-semibold text-ink">Intestatario</dt><dd>{BANK.accountHolder}</dd></div>
    <div><dt class="font-semibold text-ink">Banca</dt><dd>{BANK.bankName}</dd></div>
    <div><dt class="font-semibold text-ink">IBAN</dt><dd class="font-mono">{BANK.ibanDisplay}</dd></div>
    <div><dt class="font-semibold text-ink">BIC/SWIFT</dt><dd class="font-mono">{BANK.bic}</dd></div>
  </dl>
  <div class="mt-6"><CopyIbanButton iban={BANK.iban} /></div>
</div>
```

- [ ] **Step 4: `src/pages/sostienici.astro`**

Include the `BankDetailsCard`, explanatory copy drawn from the manifesto's "significato" paragraphs, and a clearly commented/disabled area for future payment gateways (per spec §10 — must be visibly commented in the source, not just visually hidden):

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import SectionHeading from "../components/SectionHeading.astro";
import ScrollReveal from "../components/ScrollReveal.astro";
import Breadcrumbs from "../components/Breadcrumbs.astro";
import BankDetailsCard from "../components/BankDetailsCard.astro";

const jsonLd = [
  { "@context": "https://schema.org", "@type": "WebPage", name: "Sostienici" },
  {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: "Sostieni Passi Condivisi",
    recipient: { "@type": "NGO", name: "Passi Condivisi Società Cooperativa Sociale ETS" },
  },
];
---
<BaseLayout title="Sostienici" canonicalPath="/sostienici" jsonLd={jsonLd}>
  <div class="mx-auto max-w-4xl px-4 pt-8 sm:px-6"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sostienici" }]} /></div>
  <header class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <h1 class="text-4xl font-semibold text-ink sm:text-5xl">Sostienici</h1>
    <p class="mt-6 text-lg text-ink/70">
      Per noi prendersi cura significa restituire dignità, aiutare una persona a conservare e sviluppare la propria autonomia, creare occasioni di incontro che spezzino la solitudine. Il tuo sostegno rende possibile tutto questo.
    </p>
  </header>

  <ScrollReveal as="section">
    <div class="mx-auto grid max-w-4xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:items-start">
      <div>
        <SectionHeading title="Dona con un bonifico" />
        <p class="mt-4 text-ink/70">Puoi sostenere Passi Condivisi con un bonifico bancario ai dati riportati qui a fianco.</p>
      </div>
      <BankDetailsCard />
    </div>
  </ScrollReveal>

  <!--
    Area predisposta per una futura integrazione di pagamento online (es. Stripe o PayPal).
    Attualmente disattivata: nessuno script o SDK di terze parti è caricato.
    Per attivarla in futuro: aggiungere qui il componente/embed ufficiale del provider scelto
    e rimuovere questo commento.
  -->

  <ScrollReveal as="section">
    <div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p class="text-ink/70">Hai domande su come sostenerci o vuoi proporre una collaborazione?</p>
      <a href="/contatti" class="mt-6 inline-block rounded-full bg-brand-purple px-6 py-3 font-semibold text-white">Contattaci</a>
    </div>
  </ScrollReveal>
</BaseLayout>
```

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```

Open `/sostienici`, click "Copia IBAN", confirm the status message appears and the clipboard contains the raw IBAN (`IT18U0538774940000004798849`, no spaces).

- [ ] **Step 6: Commit**

```bash
git add src/pages/sostienici.astro src/components/BankDetailsCard.astro src/components/CopyIbanButton.astro src/scripts/copy-iban.ts
git commit -m "feat: add Sostienici page with bank details card and copy-IBAN button"
```

---

### Task 13: Contatti page + ContactForm

**Files:**
- Create: `src/pages/contatti.astro`
- Create: `src/components/ContactForm.astro`
- Create: `src/scripts/contact-form.ts`

**Interfaces:**
- Consumes: `CONTACTS` from Task 2, `import.meta.env.PUBLIC_FORMSPREE_ENDPOINT`.
- Produces: none consumed elsewhere (leaf component).

- [ ] **Step 1: `src/components/ContactForm.astro`**

Fields: nome, cognome/organizzazione, email, telefono (facoltativo), argomento (select), messaggio, checkbox privacy obbligatoria, honeypot hidden field, submit button. Visible `<label>` for every field, `aria-describedby` linking errors, `role="alert"` for the error/success region.

```astro
---
const formEndpoint = import.meta.env.PUBLIC_FORMSPREE_ENDPOINT ?? "";
---
<form id="contact-form" action={formEndpoint} method="POST" novalidate class="space-y-5">
  <div class="grid gap-5 sm:grid-cols-2">
    <div>
      <label for="cf-nome" class="block text-sm font-medium text-ink">Nome *</label>
      <input id="cf-nome" name="nome" type="text" required class="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2" aria-describedby="cf-nome-error" />
      <p id="cf-nome-error" class="mt-1 text-sm text-brand-red" role="alert"></p>
    </div>
    <div>
      <label for="cf-cognome" class="block text-sm font-medium text-ink">Cognome o organizzazione *</label>
      <input id="cf-cognome" name="cognome" type="text" required class="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2" aria-describedby="cf-cognome-error" />
      <p id="cf-cognome-error" class="mt-1 text-sm text-brand-red" role="alert"></p>
    </div>
  </div>
  <div class="grid gap-5 sm:grid-cols-2">
    <div>
      <label for="cf-email" class="block text-sm font-medium text-ink">Email *</label>
      <input id="cf-email" name="email" type="email" required class="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2" aria-describedby="cf-email-error" />
      <p id="cf-email-error" class="mt-1 text-sm text-brand-red" role="alert"></p>
    </div>
    <div>
      <label for="cf-telefono" class="block text-sm font-medium text-ink">Telefono (facoltativo)</label>
      <input id="cf-telefono" name="telefono" type="tel" class="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2" />
    </div>
  </div>
  <div>
    <label for="cf-argomento" class="block text-sm font-medium text-ink">Argomento *</label>
    <select id="cf-argomento" name="argomento" required class="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2">
      <option value="">Seleziona...</option>
      <option value="servizi">Informazioni sui servizi</option>
      <option value="sostegno">Sostenere Passi Condivisi</option>
      <option value="collaborazione">Proposta di collaborazione</option>
      <option value="altro">Altro</option>
    </select>
  </div>
  <div>
    <label for="cf-messaggio" class="block text-sm font-medium text-ink">Messaggio *</label>
    <textarea id="cf-messaggio" name="messaggio" rows="5" required class="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2" aria-describedby="cf-messaggio-error"></textarea>
    <p id="cf-messaggio-error" class="mt-1 text-sm text-brand-red" role="alert"></p>
  </div>
  <div class="flex items-start gap-3">
    <input id="cf-privacy" name="privacy" type="checkbox" required class="mt-1" aria-describedby="cf-privacy-error" />
    <label for="cf-privacy" class="text-sm text-ink/80">Ho letto e accetto la <a href="/privacy-policy" class="underline">Privacy Policy</a>. *</label>
  </div>
  <p id="cf-privacy-error" class="text-sm text-brand-red" role="alert"></p>
  <div class="hidden" aria-hidden="true">
    <label for="cf-company">Non compilare questo campo</label>
    <input id="cf-company" name="_gotcha" type="text" tabindex="-1" autocomplete="off" />
  </div>
  <div id="contact-form-status" class="text-sm" role="status" aria-live="polite"></div>
  <button id="contact-form-submit" type="submit" class="rounded-full bg-brand-purple px-6 py-3 font-semibold text-white hover:bg-brand-purple-dark transition-colors disabled:opacity-60">
    Invia messaggio
  </button>
  {!formEndpoint && <p class="text-sm text-brand-red">Il form non è ancora collegato a un servizio di invio email: configura PUBLIC_FORMSPREE_ENDPOINT (vedi README).</p>}
</form>
<script src="../scripts/contact-form.ts"></script>
```

- [ ] **Step 2: `src/scripts/contact-form.ts`**

Client-side validation (required fields, email pattern, privacy checkbox), honeypot check (abort silently if filled), loading state on submit button, success/error message in `#contact-form-status`, uses `fetch` against the form's `action` with `Accept: application/json` (Formspree's AJAX contract) — never fakes a success without an actual request completing.

```typescript
function setFieldError(id: string, message: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors(): void {
  document.querySelectorAll('[role="alert"]').forEach((el) => (el.textContent = ""));
}

function validate(form: HTMLFormElement): boolean {
  clearErrors();
  let valid = true;

  const nome = form.querySelector<HTMLInputElement>("#cf-nome")!;
  if (!nome.value.trim()) {
    setFieldError("cf-nome-error", "Inserisci il tuo nome.");
    valid = false;
  }

  const cognome = form.querySelector<HTMLInputElement>("#cf-cognome")!;
  if (!cognome.value.trim()) {
    setFieldError("cf-cognome-error", "Inserisci cognome o organizzazione.");
    valid = false;
  }

  const email = form.querySelector<HTMLInputElement>("#cf-email")!;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    setFieldError("cf-email-error", "Inserisci un indirizzo email valido.");
    valid = false;
  }

  const messaggio = form.querySelector<HTMLTextAreaElement>("#cf-messaggio")!;
  if (!messaggio.value.trim()) {
    setFieldError("cf-messaggio-error", "Scrivi un messaggio.");
    valid = false;
  }

  const privacy = form.querySelector<HTMLInputElement>("#cf-privacy")!;
  if (!privacy.checked) {
    setFieldError("cf-privacy-error", "Devi accettare la Privacy Policy per inviare il messaggio.");
    valid = false;
  }

  return valid;
}

function init(): void {
  const form = document.getElementById("contact-form") as HTMLFormElement | null;
  const status = document.getElementById("contact-form-status");
  const submitButton = document.getElementById("contact-form-submit") as HTMLButtonElement | null;
  if (!form || !status || !submitButton) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector<HTMLInputElement>("#cf-company");
    if (honeypot && honeypot.value.trim() !== "") return;

    if (!validate(form)) {
      status.textContent = "Controlla i campi evidenziati e riprova.";
      return;
    }

    if (!form.action) {
      status.textContent = "Il form non è ancora collegato a un servizio di invio. Contattaci via email nel frattempo.";
      return;
    }

    submitButton.disabled = true;
    status.textContent = "Invio in corso...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        status.textContent = "Messaggio inviato. Ti risponderemo il prima possibile.";
        form.reset();
      } else {
        status.textContent = "Invio non riuscito. Riprova più tardi o scrivici via email.";
      }
    } catch {
      status.textContent = "Invio non riuscito per un problema di connessione. Riprova più tardi.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

init();
```

- [ ] **Step 3: `src/pages/contatti.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import SectionHeading from "../components/SectionHeading.astro";
import ScrollReveal from "../components/ScrollReveal.astro";
import Breadcrumbs from "../components/Breadcrumbs.astro";
import ContactForm from "../components/ContactForm.astro";
import SocialLinks from "../components/SocialLinks.astro";
import { CONTACTS } from "../data/contacts";

const jsonLd = [
  { "@context": "https://schema.org", "@type": "WebPage", name: "Contatti" },
  {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    telephone: CONTACTS.phone,
    email: CONTACTS.email,
    contactType: "customer service",
    areaServed: "IT",
  },
];

const mapQuery = encodeURIComponent(`${CONTACTS.address.street}, ${CONTACTS.address.postalCode} ${CONTACTS.address.city}`);
---
<BaseLayout title="Contatti" canonicalPath="/contatti" jsonLd={jsonLd}>
  <div class="mx-auto max-w-4xl px-4 pt-8 sm:px-6"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contatti" }]} /></div>
  <header class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <h1 class="text-4xl font-semibold text-ink sm:text-5xl">Contatti</h1>
  </header>

  <ScrollReveal as="section">
    <div class="mx-auto grid max-w-5xl gap-10 px-4 py-8 sm:px-6 md:grid-cols-2">
      <div>
        <SectionHeading title="I nostri recapiti" />
        <ul class="mt-6 space-y-3 text-ink/80">
          <li>{CONTACTS.address.street}, {CONTACTS.address.postalCode} {CONTACTS.address.city} ({CONTACTS.address.province})</li>
          <li><a href={`mailto:${CONTACTS.email}`} class="underline">{CONTACTS.email}</a></li>
          <li><a href={`tel:${CONTACTS.phone}`} class="underline">{CONTACTS.phoneDisplay}</a></li>
        </ul>
        <div class="mt-6"><SocialLinks /></div>
        <div class="mt-8 overflow-hidden rounded-2xl border border-black/10">
          <iframe
            title="Mappa della sede di Passi Condivisi"
            src={`https://www.openstreetmap.org/export/embed.html?search=${mapQuery}&layer=mapnik`}
            class="h-72 w-full"
            loading="lazy"
          ></iframe>
        </div>
      </div>
      <div>
        <SectionHeading title="Scrivici" />
        <div class="mt-6"><ContactForm /></div>
      </div>
    </div>
  </ScrollReveal>
</BaseLayout>
```

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Submit the form empty → confirm all required-field errors appear and no network request fires (check the browser network tab). Fill correctly with `PUBLIC_FORMSPREE_ENDPOINT` unset → confirm the "non è ancora collegato" message appears instead of a fake success.

- [ ] **Step 5: Commit**

```bash
git add src/pages/contatti.astro src/components/ContactForm.astro src/scripts/contact-form.ts
git commit -m "feat: add Contatti page with validated, honeypot-protected contact form"
```

---

### Task 14: Privacy Policy + Cookie Policy pages

**Files:**
- Create: `src/pages/privacy-policy.astro`
- Create: `src/pages/cookie-policy.astro`

**Interfaces:**
- Consumes: `SITE`, `CONTACTS` from Task 2.

- [ ] **Step 1: `src/pages/privacy-policy.astro`**

Sections per spec §13: titolo, data ultimo aggiornamento, indice interno, titolare (dati reali: ragione sociale, indirizzo, email), finalità, basi giuridiche, conservazione, destinatari, diritti dell'interessato, modalità di esercizio, cookie (rimando alla Cookie Policy), nota "non costituisce consulenza legale".

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { SITE } from "../data/site";
import { CONTACTS } from "../data/contacts";
const lastUpdated = "15 luglio 2026";
---
<BaseLayout title="Privacy Policy" canonicalPath="/privacy-policy">
  <article class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <h1 class="text-4xl font-semibold text-ink">Privacy Policy</h1>
    <p class="mt-2 text-sm text-ink/60">Ultimo aggiornamento: {lastUpdated}</p>
    <p class="mt-6 text-sm text-ink/60">
      Questo documento ha finalità informativa e non costituisce consulenza legale. Si raccomanda una verifica da parte di un consulente privacy/DPO competente prima della pubblicazione definitiva del sito.
    </p>

    <nav aria-label="Indice" class="mt-8 rounded-xl bg-white p-4 text-sm">
      <ul class="space-y-1">
        <li><a href="#titolare" class="underline">Titolare del trattamento</a></li>
        <li><a href="#finalita" class="underline">Finalità del trattamento</a></li>
        <li><a href="#basi" class="underline">Basi giuridiche</a></li>
        <li><a href="#conservazione" class="underline">Conservazione dei dati</a></li>
        <li><a href="#destinatari" class="underline">Destinatari dei dati</a></li>
        <li><a href="#diritti" class="underline">Diritti dell'interessato</a></li>
        <li><a href="#cookie" class="underline">Cookie</a></li>
      </ul>
    </nav>

    <section id="titolare" class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Titolare del trattamento</h2>
      <p class="mt-3 text-ink/80">
        {SITE.legalName}, P.IVA {SITE.vatNumber}, con sede in {CONTACTS.address.street}, {CONTACTS.address.postalCode} {CONTACTS.address.city} ({CONTACTS.address.province}).
        Email: <a href={`mailto:${CONTACTS.email}`} class="underline">{CONTACTS.email}</a>.
      </p>
    </section>

    <section id="finalita" class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Finalità del trattamento</h2>
      <p class="mt-3 text-ink/80">I dati raccolti tramite il modulo di contatto sono trattati esclusivamente per rispondere alle richieste inviate dall'utente e per finalità amministrative correlate.</p>
    </section>

    <section id="basi" class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Basi giuridiche</h2>
      <p class="mt-3 text-ink/80">Il trattamento si basa sul consenso espresso dall'utente all'invio del modulo di contatto (art. 6, par. 1, lett. a, GDPR) e, ove applicabile, sull'esecuzione di misure precontrattuali richieste dall'interessato.</p>
    </section>

    <section id="conservazione" class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Conservazione dei dati</h2>
      <p class="mt-3 text-ink/80">[INSERIRE PERIODO DI CONSERVAZIONE DEI DATI — informazione non fornita nei materiali disponibili]</p>
    </section>

    <section id="destinatari" class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Destinatari dei dati</h2>
      <p class="mt-3 text-ink/80">I dati inviati tramite il modulo di contatto sono trasmessi al fornitore del servizio di gestione form (Formspree) esclusivamente per il recapito del messaggio. [INSERIRE EVENTUALI ALTRI DESTINATARI/RESPONSABILI DEL TRATTAMENTO, se presenti]</p>
    </section>

    <section id="diritti" class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Diritti dell'interessato</h2>
      <p class="mt-3 text-ink/80">L'interessato ha diritto di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione al trattamento dei propri dati, oltre al diritto di proporre reclamo al Garante per la protezione dei dati personali. Per esercitare questi diritti è possibile scrivere a <a href={`mailto:${CONTACTS.email}`} class="underline">{CONTACTS.email}</a>.</p>
    </section>

    <section id="cookie" class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Cookie</h2>
      <p class="mt-3 text-ink/80">Per informazioni sui cookie utilizzati dal sito consulta la <a href="/cookie-policy" class="underline">Cookie Policy</a>.</p>
    </section>
  </article>
</BaseLayout>
```

- [ ] **Step 2: `src/pages/cookie-policy.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { SITE } from "../data/site";
import { CONTACTS } from "../data/contacts";
const lastUpdated = "15 luglio 2026";
---
<BaseLayout title="Cookie Policy" canonicalPath="/cookie-policy">
  <article class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <h1 class="text-4xl font-semibold text-ink">Cookie Policy</h1>
    <p class="mt-2 text-sm text-ink/60">Ultimo aggiornamento: {lastUpdated}</p>
    <p class="mt-6 text-sm text-ink/60">
      Questo documento ha finalità informativa e non costituisce consulenza legale. Si raccomanda una verifica da parte di un consulente privacy/DPO competente prima della pubblicazione definitiva del sito.
    </p>

    <section class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Cosa sono i cookie</h2>
      <p class="mt-3 text-ink/80">I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo dell'utente, dove vengono memorizzati per essere ritrasmessi agli stessi siti alla visita successiva.</p>
    </section>

    <section class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Cookie utilizzati da questo sito</h2>
      <p class="mt-3 text-ink/80">
        Al momento questo sito utilizza esclusivamente <strong>cookie tecnici necessari</strong> al corretto funzionamento (ad esempio per memorizzare la scelta espressa nel banner cookie). Non sono attivi cookie analitici o di marketing, e nessuno script di terze parti viene caricato prima di un eventuale consenso.
      </p>
      <p class="mt-3 text-ink/80">
        Il banner presente sul sito consente comunque di gestire in modo granulare le categorie "analitici" e "marketing", predisposte per un'eventuale attivazione futura: nessuno strumento in queste categorie è attualmente installato.
      </p>
    </section>

    <section class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Come gestire le preferenze</h2>
      <p class="mt-3 text-ink/80">Puoi modificare in qualsiasi momento le tue preferenze cookie tramite il link "Preferenze cookie" presente nel footer di ogni pagina.</p>
    </section>

    <section class="mt-10">
      <h2 class="text-2xl font-semibold text-ink">Titolare del trattamento</h2>
      <p class="mt-3 text-ink/80">{SITE.legalName} — <a href={`mailto:${CONTACTS.email}`} class="underline">{CONTACTS.email}</a></p>
    </section>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/privacy-policy.astro src/pages/cookie-policy.astro
git commit -m "feat: add Privacy Policy and Cookie Policy pages"
```

---

### Task 15: 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: `src/pages/404.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout title="Pagina non trovata" canonicalPath="/404">
  <div class="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
    <h1 class="text-4xl font-semibold text-ink">Pagina non trovata</h1>
    <p class="mt-4 text-ink/70">La pagina che cerchi non esiste o è stata spostata.</p>
    <a href="/" class="mt-8 inline-block rounded-full bg-brand-purple px-6 py-3 font-semibold text-white">Torna alla home</a>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Build check**

```bash
npm run build
ls dist/404.html
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add custom 404 page"
```

---

### Task 16: Favicons, manifest, robots.txt, OG image

**Files:**
- Create: `public/favicon.png`, `public/favicon-32.png`, `public/favicon-192.png`, `public/favicon-512.png`, `public/apple-touch-icon.png`
- Create: `public/site.webmanifest`
- Create: `public/robots.txt`
- Create: `public/og-image.png`

**Interfaces:**
- Consumes: `logo-icon.png` render already produced (Task 1 source).
- Produces: files referenced by `BaseLayout` (`/favicon.png`, `/site.webmanifest`) and `SeoHead` (`/og-image.png`) from Task 3.

- [ ] **Step 1: Generate favicon sizes from the icon render**

```bash
node -e "
const sharp = require('sharp');
const src = 'C:/Users/D3t3c/AppData/Local/Temp/claude/B--vscode-workspace-passi-condivisi/6072e039-b7a0-4e46-978e-01827b9b0916/scratchpad/logo-icon.png';
const sizes = [32, 180, 192, 512];
(async () => {
  for (const size of sizes) {
    await sharp(src).resize(size, size).png().toFile(\`public/favicon-\${size}.png\`);
  }
  await sharp(src).resize(256, 256).png().toFile('public/favicon.png');
  await sharp(src).resize(180, 180).png().toFile('public/apple-touch-icon.png');
})();
"
```

(Run from the Astro project root where `sharp` is already a transitive dependency of `astro:assets`; if not resolvable directly, run `npm install --no-save sharp` first.)

- [ ] **Step 2: `public/site.webmanifest`**

```json
{
  "name": "Passi Condivisi",
  "short_name": "Passi Condivisi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FDFBF5",
  "theme_color": "#4850A8",
  "icons": [
    { "src": "/favicon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/favicon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 3: `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://www.passicondivisi.it/sitemap-index.xml
```

- [ ] **Step 4: OG image**

Generate a simple 1200×630 OG image from the full logo lockup on the brand-purple background:

```bash
node -e "
const sharp = require('sharp');
(async () => {
  const logo = await sharp('C:/Users/D3t3c/AppData/Local/Temp/claude/B--vscode-workspace-passi-condivisi/6072e039-b7a0-4e46-978e-01827b9b0916/scratchpad/logo-full.png')
    .resize({ height: 500 }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#4850A8' } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile('public/og-image.png');
})();
"
```

- [ ] **Step 5: Build check**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add public/favicon*.png public/apple-touch-icon.png public/site.webmanifest public/robots.txt public/og-image.png
git commit -m "feat: add favicons, web manifest, robots.txt, and OG image"
```

---

### Task 17: README, .env wiring, final placeholder audit

**Files:**
- Create: `README.md`
- Modify: `.env.example` (already created in Task 1 — verify it's current)

**Interfaces:** none (documentation task).

- [ ] **Step 1: Search for every placeholder left in the codebase**

```bash
grep -rn "INSERIRE" src public docs 2>/dev/null
```

Record the exact list — it must include at least: `[INSERIRE INTESTATARIO CONTO]` (Sostienici), `[INSERIRE PERIODO DI CONSERVAZIONE DEI DATI]` and destinatari note (Privacy Policy), `[INSERIRE RISULTATI RAGGIUNTI E SVILUPPI FUTURI DEL PROGETTO]` (Il nostro progetto), plus the domain placeholder `https://www.passicondivisi.it` (not literally tagged `INSERIRE` — call it out separately in the README) and `PUBLIC_FORMSPREE_ENDPOINT` in `.env.example`.

- [ ] **Step 2: Write `README.md`**

Sections required by spec §25: descrizione progetto, tecnologie, requisiti, installazione (`npm install`), avvio sviluppo (`npm run dev`), build (`npm run build`), anteprima build (`npm run preview`), struttura cartelle, gestione contenuti (dove si trova `src/data/`), dati di contatto/bancari (percorso esatto dei file), configurazione dominio (`astro.config.mjs` + `src/data/site.ts` + `src/data/seo.ts`), configurazione form contatti (come creare un account Formspree, impostare `PUBLIC_FORMSPREE_ENDPOINT` in `.env`), configurazione cookie banner (come aggiungere in futuro analytics/marketing dopo consenso, riferendosi a `window.getCookieConsent()`), pubblicazione su Netlify/Vercel, elenco completo dei segnaposto da sostituire (dall'output dello Step 1), nota sulla verifica legale di Privacy/Cookie Policy.

- [ ] **Step 3: Commit**

```bash
git add README.md .env.example
git commit -m "docs: add project README with setup, content, and deployment guide"
```

---

### Task 18: Full verification pass

**Files:** none created; this task only runs checks and fixes anything it finds (fixes land as additional small commits, not silently).

- [ ] **Step 1: Install and build clean**

```bash
rm -rf node_modules dist
npm install
npm run build
```

Expected: exits 0, no warnings about missing images or unresolved imports.

- [ ] **Step 2: Type check**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Internal link check**

```bash
npm run preview &
sleep 2
for path in / /chi-siamo /cosa-offriamo /il-nostro-progetto /sostienici /contatti /privacy-policy /cookie-policy /pagina-inesistente; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4321$path")
  echo "$path -> $code"
done
kill %1
```

Expected: every real route returns `200`, `/pagina-inesistente` returns `404`.

- [ ] **Step 4: Nav/footer placement check**

```bash
grep -L "privacy-policy" src/components/Header.astro src/components/MobileMenu.astro
grep -l "privacy-policy" src/components/Footer.astro
```

Expected: header/mobile menu files do NOT contain `privacy-policy` or `cookie-policy`; footer does.

- [ ] **Step 5: Browser pass (use the running dev/preview server and the Chrome automation tools)**

Manually verify and note results for: desktop nav active-state highlighting, mobile menu open/close/focus-trap, cookie banner accept/reject/preferences persistence and reopen from footer, copy-IBAN button + fallback path, contact form validation errors and (with a real or dummy Formspree endpoint) submit flow, gallery lightbox keyboard navigation, `prefers-reduced-motion` (emulate via devtools) disabling scroll-reveal and menu transition, responsive layout at 360px/768px/1280px/1920px widths with no horizontal scroll, full keyboard-only pass from skip-link through footer.

- [ ] **Step 6: Sitemap/SEO check**

```bash
cat dist/sitemap-index.xml
grep -L "privacy-policy\|cookie-policy" dist/sitemap*.xml 2>/dev/null || true
```

Confirm the sitemap lists the public pages; Privacy/Cookie Policy inclusion in the sitemap is acceptable (sitemap ≠ nav menu — spec only restricts the nav menu), but double-check nothing unintended (e.g. a stray `/404` entry) is listed.

- [ ] **Step 7: Final commit (only if Step 1–6 required fixes)**

```bash
git add -A
git commit -m "fix: address issues found in final verification pass"
```

If no fixes were needed, skip this step — do not create an empty commit.

---

## Self-Review Notes (completed during plan authoring)

- **Spec coverage:** every §-numbered requirement in the design spec maps to a task above — architecture (§4→Task1/8-16), header/nav (§4→Task4), visual direction (§5→Task1/3), homepage (§6→Task8), Chi siamo (§7→Task9), Cosa offriamo (§8→Task10), Il nostro progetto (§9→Task11), Sostienici (§10→Task12), Contatti (§11→Task13), Footer (§12→Task5), Privacy/Cookie pages (§13→Task14), cookie banner (§14→Task7), animations (§15→Task6/global.css), responsive (implicit Tailwind mobile-first classes throughout), accessibility (§17→woven through Tasks 4/7/11/13), SEO (§18→Task3/16), GEO/FAQ (§19→ `Faq` component ready in Task 6, wired into homepage/Cosa Offriamo if desired — confirmed present via `SectionHeading`/FAQ data), performance (§20→astro:assets, self-hosted fonts, minimal JS), content centralization (§21→Task2), components list (§22→all named components created), images (§23→Task9/11 split team vs. project photos), security (§24→ no secrets committed, `.env` gitignored), README (§25→Task17), final checks (§26→Task18).
- **Placeholder scan:** no "TBD"/"TODO" left in task steps; all code blocks are complete and copy-pasteable.
- **Type consistency:** `Service`, `Founder`, `FaqItem`, `NavLink` types defined once in Task 2 and reused with identical names/shapes in Tasks 4–14; `BANK`/`CONTACTS`/`SITE` field names consistent everywhere referenced.
