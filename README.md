# Favor International × AECC GMC — Landing Page

> Mobilize your church to transform nations.

A mobile-first single-page landing site built for the Alabama / Emerald Coast Annual Conference of the Global Methodist Church. Plus a 1920×1080 QR slide for the conference deck.

Audience: GMC clergy and lay leaders scanning a QR code at the conference. Designed to convert on a phone, in a pew.

Built with [Astro](https://astro.build), zero JS framework runtime, deployed on Cloudflare Pages.

---

## What's inside

- **Landing page** (`/`) — hero, stats wall, pitch, three faithful steps (Pray / Give / Host), field gallery, Josh's bio panel, footer.
- **QR slide route** (`/slide`) — a live HTML version of the 16:9 conference slide, rendered with full brand fonts (Fraunces / Inter Tight / JetBrains Mono).
- **Static slide PNG** (`public/aecgmc-slide.png`) — 1920×1080, generated at build time. Drop directly into a deck.
- **Standalone QR SVG** (`public/aecgmc-qr.svg`) — vector QR, encodes `https://aecgmc.favorintl.org`.

## Local development

```bash
npm install
npm run dev               # http://localhost:4321
npm run build:slide       # regenerate public/aecgmc-slide.png + public/aecgmc-qr.svg
npm run build             # full build → dist/
npm run preview           # preview the prod build
```

## Deploy (Cloudflare Pages)

1. Connect this repo to Cloudflare Pages.
2. **Build command:** `npm run build`
3. **Build output:** `dist`
4. **Node version:** 20+
5. Add custom domain: `aecgmc.favorintl.org`. Point DNS CNAME at the Pages URL.

Pushes to `main` deploy automatically.

## Regenerating the QR slide

The slide PNG at `public/aecgmc-slide.png` is committed to the repo. Regenerate it any time:

```bash
npm run build:slide
```

If you want a perfect-brand-font version (Fraunces, etc.), open the live `/slide` route at 1920×1080 in Chrome and use **DevTools → Cmd+Shift+P → "Capture full size screenshot"**.

## Editing content

- **Page sections:** `src/components/*.astro` — Hero, StatsWall, Pitch, ThreeWays, Gallery, JoshPanel, Footer.
- **Single page entry:** `src/pages/index.astro`.
- **Slide:** `src/pages/slide.astro` (live HTML), `scripts/build-slide.mjs` (static PNG generator).
- **Brand tokens:** `src/styles/global.css` (Fraunces / Inter Tight / JetBrains Mono; green / ink / cream / paper palette).
- **Photos:** `public/images/` (copied from the Favor hub site; safe to swap in better field images).

## Brand

Colors, typography, and motion mirror the Favor hub site (`hub.favorintl.org`). Display: Fraunces. Body: Inter Tight. Mono accent: JetBrains Mono.
