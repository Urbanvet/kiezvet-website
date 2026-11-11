# KiezVet – Website

Static website for KiezVet, the vet practice in the Bergmannkiez, Berlin-Kreuzberg.
Plain HTML, CSS and JavaScript. No framework, no build step, no cookies, no tracking.

## Run it locally

You need any local web server (opening the files by double-click also works, but a server behaves like the real site).

```bash
cd kiezvet-website
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser. Stop the server with `Ctrl + C`.

Alternative with Node.js: `npx serve .`

## Put it online

Upload the whole folder as it is to any web host (e.g. Netlify, Cloudflare Pages, GitHub Pages, or your existing hosting via FTP). `index.html` is the start page.

## Project structure

```
kiezvet-website/
├── index.html          Startseite
├── leistungen.html     Leistungen (incl. "ab 2027" card)
├── ueber-mich.html     Über mich
├── termin.html         Online booking (3 steps)
├── notfall.html        Emergency page – shows practice or UrbanVet depending on the time
├── kontakt.html        Contact, hours, directions, contact form
├── impressum.html      Legal notice (template)
├── datenschutz.html    Privacy policy (template)
└── assets/
    ├── css/fonts.css   Self-hosted fonts (no Google requests – GDPR)
    ├── css/styles.css  All styles, organised in numbered sections
    ├── js/config.js    ← practice data: phone numbers, opening hours, cat hours
    ├── js/main.js      Navigation, open/closed status, hours tables, forms
    ├── js/booking.js   Booking flow
    ├── fonts/          Cormorant Garamond + Manrope (woff2)
    └── img/            Logo and photos
```

## What to change before launch

1. **`assets/js/config.js`**: real phone numbers, email, address, opening hours and Katzen-Sprechstunde times.
   The header status ("Jetzt geöffnet"), all hours tables, the emergency page logic and the booking times read from here.
2. **Placeholders in the HTML**: search all files for `[` to find every placeholder (name, address, years of experience, clinic list, etc.).
   Also update the opening hours in the `application/ld+json` block in `index.html` (used by Google).
3. **Forms**: there is no server. `sendForm()` in `assets/js/main.js` currently only logs the data to the browser console.
   Connect it to a form service (e.g. Formspree, Netlify Forms) or to your booking system's API.
   In `assets/js/booking.js`, `getSlots()` generates times from the opening hours. Replace it with the real free slots from your booking system so patients can't pick a taken time.
4. **Impressum & Datenschutz**: the pages are templates. Have them completed and checked.
5. **24h clinics** on `notfall.html`: add verified names, addresses and phone numbers.
6. **Photos**: currently borrowed from UrbanVet. Replace the files in `assets/img/` with the same file names to swap them.

## SEO

| Page | Main keyword |
|---|---|
| `index.html` | Tierarzt Kreuzberg, Tierarzt Bergmannkiez |
| `leistungen.html` | Impfung / Vorsorge / Blutuntersuchung Tierarzt Kreuzberg |
| `ueber-mich.html` | Tierärztin Kreuzberg, English-speaking vet |
| `termin.html` | Tierarzt Termin online Kreuzberg |
| `notfall.html` | Tierarzt Notdienst / Notfall Kreuzberg |
| `kontakt.html` | Tierarzt Mehringdamm / Gneisenaustraße |

- Every page has its own title (≤ 60 characters), meta description (≤ 155), canonical URL, Open Graph tags and exactly one H1.
- Structured data (JSON-LD): `VeterinaryCare` on index + kontakt, `BreadcrumbList` on subpages, `FAQPage` on leistungen.
  **When the opening hours, phone or address change, update them in `assets/js/config.js` AND in the JSON-LD blocks of `index.html` and `kontakt.html`.**
- `robots.txt` and `sitemap.xml` at the root. Update `<lastmod>` in the sitemap when you change a page.
- Impressum and Datenschutz are `noindex`.
- Images: each photo exists as WebP in 480/800/1200px plus a 1200px JPG fallback. To replace a photo, replace all four files with the same names.

### After going live
1. Add the site to **Google Search Console** and submit `https://kiezvet.de/sitemap.xml`.
2. Create a **Google Business Profile** for KiezVet (category "Tierarzt"), separate from UrbanVet, with the same name, address and phone as on the website.
3. Test the structured data with Google's Rich Results Test.
4. Ask happy clients for Google reviews; link to the profile from the website once it exists.

## Design system (short)

| Token | Value | Use |
|---|---|---|
| `--copper-700` | #9A5636 | buttons, links |
| `--copper-500` | #C27E5F | logo copper – lines and frames only |
| `--sage-100` / `--sage-700` | #E4E8DC / #56634A | calm sections / labels |
| `--cream` / `--linen` | #F6F0E9 / #FBF8F4 | page / cards |
| `--moss-700` | #3E4A37 | utility bar, dark band |
| `--alert` | #A3261C | emergency only |

Fonts: Cormorant Garamond (headings), Manrope (text). Spacing on an 8px scale.

## Breakpoints

| Width | Layout |
|---|---|
| ≥ 1600px | Content width grows to 1320px |
| 1001px and up | Full navigation, two-column hero and sections, three-column cards |
| ≤ 1000px (tablet) | Menu button + "Termin buchen" in the header, single-column sections, two-column cards, photos capped at 520px |
| ≤ 860px | Leistungen detail cards in one column |
| ≤ 700px (phone) | Everything single column, sticky bottom bar (Anrufen · Termin · Notfall), compact top bar |
| ≤ 360px | Smaller side margins, two-column time slots |

Tested at 320, 375, 414, 768, 1024, 1280, 1440 and 1920px: no horizontal scrolling, tap targets at least 40px.
