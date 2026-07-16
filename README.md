# Passi Condivisi — sito web

Sito vetrina per **Passi Condivisi Società Cooperativa Sociale ETS**, cooperativa sociale con sede a Piedimonte Matese (CE) attiva nell'assistenza domiciliare, mediazione familiare, assistenza scolastica e laboratori di educativa territoriale per anziani e persone con disabilità.

## Tecnologie

- [Astro](https://docs.astro.build) (static site generation, TypeScript strict)
- Tailwind CSS (via `@tailwindcss/vite`)
- `@astrojs/sitemap` per la sitemap automatica
- `astro:assets` (sharp) per l'ottimizzazione immagini (WebP/AVIF)
- `@fontsource/fraunces` e `@fontsource/work-sans` per i font auto-ospitati
- Nessun framework JS esterno: le poche parti interattive (menu mobile, banner cookie, copia IBAN, form contatti, lightbox galleria) sono script TypeScript "vanilla" caricati come Astro island

## Requisiti

- Node.js `>= 22.12.0`
- npm

## Installazione

```bash
npm install
```

## Sviluppo

```bash
npm run dev
```

Il sito è disponibile su `http://localhost:4321`. Il progetto è impostato per lo sviluppo in background (vedi `CLAUDE.md`): `astro dev --background`, gestibile con `astro dev stop`, `astro dev status`, `astro dev logs`.

## Build di produzione

```bash
npm run build
```

Genera il sito statico in `dist/`.

## Anteprima della build

```bash
npm run preview
```

## Struttura delle cartelle

```
src/
├── components/     componenti Astro riutilizzabili (Header, Footer, form, gallery, cookie banner, ...)
├── data/           contenuti tipizzati, unica fonte di verità (vedi sotto)
├── layouts/        BaseLayout.astro (shell HTML comune a tutte le pagine)
├── pages/          una pagina per rotta (index, chi-siamo, cosa-offriamo, ...)
├── scripts/        TypeScript vanilla per le parti interattive
├── styles/         global.css (Tailwind + stili base)
└── assets/         loghi e foto ottimizzati da astro:assets
public/             file statici serviti as-is (favicon, manifest, robots.txt, og-image)
file/               materiali sorgente forniti dal cliente (PDF, foto) — non pubblicati sul sito
docs/superpowers/   spec e piano di implementazione del progetto
```

## Gestione dei contenuti

Tutti i testi e i dati sono centralizzati in `src/data/*.ts`, tipizzati con TypeScript. Per modificare un contenuto del sito, modifica il file corrispondente — non serve toccare i componenti o le pagine:

| File | Contenuto |
| --- | --- |
| `src/data/site.ts` | Nome, ragione sociale, P.IVA, claim |
| `src/data/contacts.ts` | Indirizzo, email, telefono, social |
| `src/data/bank.ts` | Dati bancari per le donazioni (IBAN, banca, BIC, intestatario) |
| `src/data/navigation.ts` | Voci del menu principale, footer e CTA "Sostienici" |
| `src/data/services.ts` | Card dei servizi offerti (Cosa offriamo) |
| `src/data/founders.ts` | Bio dei fondatori (Chi siamo) |
| `src/data/faq.ts` | Domande frequenti (con JSON-LD `FAQPage` automatico) |
| `src/data/seo.ts` | Titolo/descrizione di default, immagine OG |

## Configurazione del dominio

Quando il dominio definitivo sarà attivo, aggiorna questi due punti (attualmente puntano al placeholder `https://www.passicondivisi.it`):

1. `astro.config.mjs` → proprietà `site`
2. `src/data/site.ts` → campo `url`

`src/data/seo.ts` e `SeoHead.astro` derivano automaticamente gli URL canonici/OG da `SITE.url`, quindi non richiedono modifiche dirette.

## Configurazione del form contatti (Formspree)

Il form nella pagina Contatti invia i dati a [Formspree](https://formspree.io):

1. Crea un account su formspree.io e un nuovo form.
2. Copia `.env.example` in `.env`.
3. Imposta `PUBLIC_FORMSPREE_ENDPOINT` con l'endpoint del tuo form, es.:
   ```
   PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx
   ```
4. Riavvia il dev server. `.env` non va mai committato (è già in `.gitignore`).

Senza questa variabile impostata il form non ha un endpoint valido a cui inviare i dati.

## Cookie banner e consenso

Il banner cookie gestisce solo il consenso "necessari/analitici/marketing" salvato in `localStorage` (`src/scripts/cookie-consent.ts`). Il sito **non integra alcun analytics o script di marketing di default**. Se in futuro si vuole aggiungere Google Analytics o simili, lo script va caricato solo dopo aver verificato il consenso:

```js
const consent = window.getCookieConsent();
if (consent?.analytics) {
  // carica lo script di analytics qui
}
```

Per riaprire manualmente le preferenze da codice: `window.openCookiePreferences()`.

## Pubblicazione (Netlify / Vercel)

Il sito è puramente statico (`output: "static"`), quindi funziona out-of-the-box su qualunque hosting statico:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Variabili d'ambiente da impostare sulla piattaforma:** `PUBLIC_FORMSPREE_ENDPOINT`

Netlify e Vercel rilevano Astro automaticamente; non serve configurazione aggiuntiva oltre alla variabile d'ambiente sopra.

## Segnaposto ancora da sostituire

Il sito è stato costruito solo con dati reali forniti nei materiali del cliente (`file/`). Dove un'informazione non era disponibile è stato lasciato un segnaposto esplicito, da sostituire prima (o dopo) la messa online:

- `src/data/bank.ts` → `accountHolder: "[INSERIRE INTESTATARIO CONTO]"` (intestatario del conto per le donazioni)
- `src/pages/privacy-policy.astro` → `[INSERIRE PERIODO DI CONSERVAZIONE DEI DATI]` (periodo di conservazione dati, da definire con un legale)
- `src/pages/privacy-policy.astro` → nota su eventuali altri destinatari/responsabili del trattamento oltre a Formspree
- `src/pages/il-nostro-progetto.astro` → `[INSERIRE RISULTATI RAGGIUNTI E SVILUPPI FUTURI DEL PROGETTO]` (dato non presente nei materiali forniti)
- Dominio placeholder `https://www.passicondivisi.it` in `astro.config.mjs` e `src/data/site.ts` (vedi sezione "Configurazione del dominio")
- `PUBLIC_FORMSPREE_ENDPOINT` in `.env.example`/`.env` (vedi sezione sul form contatti)

## Nota legale

I testi di **Privacy Policy** e **Cookie Policy** (`src/pages/privacy-policy.astro`, `src/pages/cookie-policy.astro`) sono stati scritti in base ai servizi effettivamente presenti sul sito (Formspree per il form contatti, nessun analytics attivo). Prima della pubblicazione è comunque consigliata una verifica da parte di un legale/consulente privacy, in particolare per il periodo di conservazione dati e per eventuali obblighi specifici della cooperativa.
