# lettherebe.com — New Website

Custom-coded static site for Let There Be. 12 pages, no build step, no dependencies — just HTML, CSS, and JS.

## Structure

| File | Page |
|------|------|
| `index.html` | Home |
| `engine.html` | Science Marketing Engine — overview |
| `lit-review.html` | Lit Review™ (Phase 1) |
| `claim-dev.html` | Claim Dev™ (Phase 2) |
| `science-story.html` | Science Story™ (Phase 3) |
| `moa-moment.html` | MOA Moment™ |
| `influencer-science-kit.html` | Influencer Science Kit™ |
| `ad-to-education.html` | Ad-to-Education Sequence™ |
| `studio.html` | Studio / Production |
| `work.html` | Case studies + testimonials |
| `about.html` | About + Science Advisory Board |
| `contact.html` | Contact / Get Started |

**Case study pages** (content migrated from the old /projects pages, videos embedded from your Vimeo): `case-nexium-24hr.html`, `case-designs-for-health.html`, `case-cheers-health.html`, `case-flonase.html`, `case-lotrimin.html`, `case-ivizia.html`, `case-qunol.html`, `case-emerson-logistics.html`, `case-healthcareaisle.html`, `case-vera-therapeutics.html`, `case-metrum-research-group.html`. The old blog case-study URLs are intentionally NOT linked anywhere — these pages replace them.

Note: the LTB Sizzle 2026 embed uses its private hash (`h=820c78ea7b`). If you change that video's privacy settings on Vimeo, update the hash in `index.html`. All Vimeo embeds require those videos to stay embeddable on your Vimeo account.

`css/style.css` — full brand design system (tokens from the brand book).
`js/main.js` — nav, scroll reveals, and the generative mitosis cell system (the brand blobs are rendered as native animated SVG metaballs — they actually divide).
`assets/` — official logos, sub-brand logos, and the four mitosis photographs.

## Preview locally

Double-click `index.html`, or run `python3 -m http.server` in this folder and open http://localhost:8000.

## Hosting + bringing the domain over

Recommended: host this as-is on **Netlify, Vercel, GitHub Pages, or Cloudflare Pages** (all free), then point the lettherebe.com domain at it.

1. Drag this folder into Netlify (app.netlify.com → "Add new site → Deploy manually"). Done in ~1 minute.
2. In Squarespace → Settings → Domains, either transfer the domain out or just update DNS: point the A/CNAME records at the new host (each host shows the exact records to add).
3. Keep the Squarespace site live until DNS cutover completes.

Using full Squarespace hosting for this site is possible (per-page Code Blocks + site-wide injection) but fights the platform and requires the Business plan anyway — external static hosting is simpler, faster, and free.

## Wiring the contact form

The form in `contact.html` needs a handler. Easiest: create a free form at formspree.io, then set the form's `action="https://formspree.io/f/YOUR_ID"`. On Netlify, just add `data-netlify="true"` to the `<form>` tag instead.

## Assets

**Local (self-contained):** all logos (`assets/`), the 33 client logos (`assets/clients/` — edit the `CLIENT_LOGOS` list at the top of `js/main.js` to change which appear in the marquee), and all 7 work videos (`assets/work/`, converted from your GIFs to WebM+MP4 — 82MB down to ~3.5MB total, identical look).

**Still hotlinked from Squarespace CDN:** team headshots (About page + home face strip), the 6 animation stills (Studio), and the LTBe gradient mark (Contact page). These break if the old Squarespace site is fully deleted — download them locally before cancelling (search the code for `squarespace-cdn` for the full list).

## Notes

- Pricing from the internal positioning doc ($30–50K Lit Review etc.) was deliberately **left off** the public site — publish it only if that's a strategic choice.
- All testimonials/results came from your files (LinkedIn sheet Quotes tab + website brief). Confirm client approval before launch where needed.
- Brand rules enforced site-wide: `#f0f0f0` backgrounds, Lexend 300/400 only, black text, accent colors on graphic elements only, 3px black dividers, no emojis, no gradient buttons.
- Animations respect `prefers-reduced-motion`.
