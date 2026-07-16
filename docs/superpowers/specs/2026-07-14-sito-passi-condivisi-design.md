# Design: sito vetrina Passi Condivisi

Data: 2026-07-14
Stato: approvato dall'utente, pronto per la pianificazione implementativa

## 1. Contesto

Passi Condivisi è una cooperativa sociale ETS (Piedimonte Matese, CE) che offre servizi di
assistenza domiciliare, mediazione familiare, assistenza scolastica specialistica e laboratori
di educativa territoriale per anziani e persone con disabilità. Serve un sito vetrina completo,
professionale, sviluppato in Astro + TypeScript + Tailwind, che comunichi fiducia, inclusione e
impatto sociale senza risultare freddo o istituzionale.

Fonti disponibili in `file/`:
- `Dati e contatti generali.pdf` — dati societari, contatti, coordinate bancarie
- `Testi chi siamo e nostra storia.pdf` — manifesto/storia, bio dei due fondatori
- `Servizi che offriamo.pdf` — descrizione dei 4 servizi
- `logo_passi_condivisi-def.pdf` — logo (impronte colorate su sfondo giallo a raggiera)
- `Galleria/` — 18 foto reali, quasi tutte dell'allestimento della sede operativa, più una
  foto di gruppo dei fondatori

Nessun documento contiene: timeline con date, numeri d'impatto, testimonianze, membri di team
oltre ai due fondatori citati, orari di apertura, PEC, dati su 5x1000/volontariato/partnership.
Questi contenuti **non vengono inventati**: dove indispensabili si userà un segnaposto
esplicito, altrimenti la sezione viene semplicemente omessa.

## 2. Dati reali raccolti (fonte di verità)

```
Denominazione:  Passi Condivisi Società Cooperativa Sociale ETS
P.IVA:          04950350613
Indirizzo:      Viale della Libertà 39, 81016 Piedimonte Matese (CE)
Email:          passicondivisi@gmail.com
Telefono:       352 095 0776
Instagram:      https://www.instagram.com/passi.codivisi?igsh=MW03cHl2Z3F6dHoxaw%3D%3D&utm_source=qr
Facebook:       https://www.facebook.com/share/1DBRoyn58Y/

IBAN:           IT18U0538774940000004798849
Banca:          BPER Banca
BIC/SWIFT:      BPMOIT22XXX
Intestatario:   NON specificato nei materiali ("il mio conto") → segnaposto
                [INSERIRE INTESTATARIO CONTO] nella card IBAN
```

Fondatori (da usare in Chi Siamo, nessun altro membro va inventato):
- **Melania** — oltre 10 anni in Germania in una Förderschule, specializzata su spettro
  autistico, percorsi di autonomia, orientamento al lavoro, laboratori e soggiorni educativi.
- **Gianmarco** — esperienza nell'assistenza e accompagnamento di anziani e persone con
  disabilità, sviluppo di autonomie personali/domestiche e competenze relazionali per persone
  nello spettro autistico.

Servizi (4, testo ricavato dai PDF, da riscrivere solo per chiarezza senza alterare i contenuti):
1. Assistenza domiciliare socio-assistenziale (anziani e persone con disabilità)
2. Servizio di mediazione familiare (relazione genitori-figli)
3. Servizio di assistenza scolastica (sostegno socio-educativo specialistico)
4. Laboratorio di educativa territoriale (autonomia + dignità dell'inclusione)

## 3. Informazioni mancanti → segnaposto o omissione

| Dato | Trattamento |
|---|---|
| Intestatario IBAN | Segnaposto `[INSERIRE INTESTATARIO CONTO]` |
| Dominio pubblico | Segnaposto `https://www.passicondivisi.it` in config centrale SEO, da sostituire |
| Endpoint form contatti | `.env` con `PUBLIC_FORMSPREE_ENDPOINT`, placeholder documentato in README |
| PEC | Omessa (non fornita, campo "eventuale") |
| Orari di apertura | Omessi (non forniti) |
| 5x1000 / volontariato / partnership / raccolta fondi | Sezioni non create (nessun dato disponibile) |
| Timeline con date storiche | Non creata (nessuna data nei materiali) |
| Numeri d'impatto / testimonianze | Non create |

Tutti questi punti vanno ripresi nel README come elenco "segnaposto da sostituire prima della
pubblicazione".

## 4. Architettura delle informazioni

Homepage "teaser" con estratti e link "Scopri di più" verso pagine di dettaglio complete:

```
/                   Homepage
/chi-siamo
/cosa-offriamo
/il-nostro-progetto
/sostienici
/contatti
/privacy-policy     (solo da footer)
/cookie-policy      (solo da footer)
/404
```

## 5. Direzione visiva

Palette derivata dal logo (impronte colorate + sole giallo a raggiera), da affinare per
contrasto/accessibilità in fase di implementazione:

- **Primario** (viola caldo, dall'impronta viola): `#5B4E8C` — header, titoli, CTA secondarie
- **Accento caldo** (dal sole del logo): `#E8A93C` — CTA principali ("Sostienici"), evidenziazioni
- **Colori di supporto** (una impronta per servizio, uso puntuale su icone/bordi, mai come sfondo pieno):
  rosso `#D94F3D`, arancio `#EF8B3F`, verde `#8FBF5B`, azzurro `#3E9FCC`
- **Neutri**: sfondo bianco caldo `#FBF8F2`, testo `#2E2A24`
- **Tipografia**: serif calda per i titoli (echeggia il logotype del logo, es. Fraunces/Playfair
  Display), sans-serif molto leggibile per il corpo (es. Inter/Work Sans), entrambe self-hosted
  via `@fontsource` per le performance
- Le impronte del logo diventano un motivo grafico ricorrente leggero (percorso/cammino
  condiviso) in elementi decorativi minori, non come illustrazione invadente

Tutte le combinazioni testo/sfondo verificate per contrasto WCAG AA.

## 6. Mappatura contenuti → pagine

**Homepage**: hero con H1 unico (es. "Un percorso condiviso, un passo alla volta" — da
verificare in fase di scrittura), intro cooperativa, missione, valori, panoramica servizi (card
sintetiche con link), presentazione sintetica del progetto, sezione sostegno con CTA, contatti
essenziali. Nessun dato/numero non presente nei file.

**Chi siamo**: manifesto/storia completo (riorganizzato in sezioni leggibili: nascita,
convinzioni, valori, missione), citazioni evidenziate, bio di Melania e Gianmarco in card,
foto di gruppo dei fondatori (`WhatsApp Image ...12.33.17.jpeg`). Nessuna timeline (niente date
disponibili).

**Cosa offriamo**: 4 `ServiceCard` (icona colorata dedicata, titolo, obiettivi reali dal PDF,
destinatari dove deducibili dal testo), CTA finale verso Contatti.

**Il nostro progetto**: narrazione della nascita e costruzione della sede operativa —
introduzione, contesto/bisogno sociale (dal manifesto), obiettivi e metodologia (dai "fari
pedagogici" citati nel PDF servizi), territorio, persone coinvolte, galleria fotografica
dell'allestimento (le foto rimanenti della cartella `Galleria/`, non quella di gruppo già usata
in Chi Siamo), lightbox accessibile, alt text descrittivi. Segnaposto visibile dove servirebbero
risultati raggiunti/numeri non forniti.

**Sostienici**: spiegazione dell'importanza del sostegno (dal manifesto), `BankDetailsCard` con
IBAN reale, BIC/SWIFT reale, intestatario segnaposto, `CopyIbanButton` con fallback per browser
senza Clipboard API, area graficamente predisposta ma commentata/disattivata per futura
integrazione Stripe/PayPal, CTA verso Contatti.

**Contatti**: indirizzo, telefono, email, social reali, mappa (embed OpenStreetMap o Google
Maps senza tracker prima del consenso), `ContactForm` con honeypot e validazione client,
collegato a Formspree (endpoint in `.env`, documentato nel README).

**Footer**: logo, breve descrizione, link sezioni, contatti, social, P.IVA, copyright dinamico,
link Privacy Policy / Cookie Policy, link per riaprire le preferenze cookie.

**Privacy Policy / Cookie Policy**: generate con i dati reali disponibili (titolare, contatti),
segnaposto per dati mancanti (es. eventuali fornitori terzi), nota nel README sulla necessità di
revisione legale prima della pubblicazione.

## 7. Stack tecnico e struttura progetto

Astro (ultima stabile) + TypeScript + Tailwind CSS, animazioni leggere via CSS/Intersection
Observer, JS minimo (isole solo dove serve interattività: menu mobile, cookie banner, copia
IBAN, form contatti).

```
src/
├── components/   Header, MobileMenu, Footer, Hero, SectionHeading, ServiceCard,
│                 ProjectGallery, CallToAction, ContactForm, BankDetailsCard,
│                 CopyIbanButton, CookieBanner, CookiePreferences, Breadcrumbs,
│                 SeoHead, SocialLinks, Faq, ScrollReveal
├── layouts/
├── pages/        rotte elencate in sezione 4
├── data/         site.ts, navigation.ts, services.ts, contacts.ts, project.ts, seo.ts
├── styles/
└── assets/       immagini sorgente (logo estratto dal PDF, galleria ottimizzata)
```

Dati di contatto, bancari e societari centralizzati in `src/data/`, mai duplicati nelle pagine.

## 8. SEO / GEO / dati strutturati

Config centrale (`src/data/seo.ts`) con nome sito, URL pubblico (placeholder), descrizione,
contatti, social, immagine OG. JSON-LD per `Organization`/`NGO`, `WebSite`, `WebPage`,
`BreadcrumbList`, `ContactPoint`, `PostalAddress`, `DonateAction` in Sostienici. FAQ con schema
`FAQPage` solo se le domande/risposte sono effettivamente visibili in pagina — verranno scritte
sulla base delle domande esplicitamente elencate nella richiesta originale, con risposte basate
sui dati reali raccolti in questo documento.

## 9. Cookie banner

Poiché non risultano tracker/analytics attivi nei materiali forniti, il banner distinguerà
comunque le categorie richieste (necessari, analitici, marketing) ma spiegherà chiaramente che
al momento sono attivi solo cookie tecnici; predisposizione commentata per aggiungere
Analytics/Meta Pixel in futuro, solo dopo consenso.

## 10. Fuori scope

- Nessun sistema di pagamento online reale (area predisposta ma disattivata/commentata)
- Nessun backend proprio per il form contatti (struttura pronta per Formspree, documentata)
- Nessuna sezione 5x1000/volontariato/partnership (dati non forniti)
