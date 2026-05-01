// Generates public/aecgmc-slide.png — a 1920x1080 brand-matched slide with the QR code.
//
// Approach: build a master SVG (full slide layout) + composite with sharp.
// The /slide route in Astro is the same design but renders in a browser with full
// Google Fonts (Fraunces / Inter Tight / JetBrains Mono). The static PNG uses
// system serif/sans-serif fallbacks but keeps full visual fidelity for layout,
// color, gradients, and the QR.
//
// Usage:
//   npm run build:slide
//
// Output:
//   public/aecgmc-slide.png   (1920x1080 PNG, ready to drop into a deck)
//   public/aecgmc-qr.svg      (standalone QR if useful)

import QRCode from 'qrcode';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const URL = 'https://aecgmc.favorintl.org';
const OUT_PNG = 'public/aecgmc-slide.png';
const OUT_QR = 'public/aecgmc-qr.svg';

const W = 1920;
const H = 1080;
const LEFT_W = 1152; // 60%
const RIGHT_W = W - LEFT_W; // 768

// Generate QR as SVG path. Use error correction H + zero margin for tight crop.
const qrSvg = await QRCode.toString(URL, {
  type: 'svg',
  errorCorrectionLevel: 'H',
  margin: 0,
  color: { dark: '#0d0f0c', light: '#faf6ec' },
});
await fs.writeFile(OUT_QR, qrSvg);

// Extract just the inner content of the QR SVG (paths/rects) to nest inside the master SVG.
const qrInner = qrSvg
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');

// Pull native viewBox from the QR SVG so we can scale it cleanly.
const qrViewMatch = qrSvg.match(/viewBox="([^"]+)"/);
const qrViewBox = qrViewMatch ? qrViewMatch[1] : '0 0 33 33';

// Read the favor-icon for the brand mark (base64 inline so SVG → PNG is self-contained).
const iconBytes = await fs.readFile('public/images/favor-icon.png');
const iconB64 = iconBytes.toString('base64');
const iconUri = `data:image/png;base64,${iconB64}`;

// Master slide SVG. Using Georgia / Helvetica system fallbacks so this renders
// without web-font dependencies. The /slide HTML route uses real brand fonts.
const SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Paper noise for left panel -->
    <filter id="noise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0.45 0"/>
    </filter>

    <!-- Left paper gradient -->
    <radialGradient id="paperGreen" cx="90%" cy="-10%" r="60%">
      <stop offset="0%" stop-color="#19a838" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="#19a838" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="paperOchre" cx="-10%" cy="90%" r="60%">
      <stop offset="0%" stop-color="#c0532b" stop-opacity="0.08"/>
      <stop offset="60%" stop-color="#c0532b" stop-opacity="0"/>
    </radialGradient>

    <!-- Right ink glows -->
    <radialGradient id="inkGlowGreen" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#19a838" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="#19a838" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="inkGlowTerracotta" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c0532b" stop-opacity="0.32"/>
      <stop offset="60%" stop-color="#c0532b" stop-opacity="0"/>
    </radialGradient>

    <!-- Highlight under "transform nations" -->
    <linearGradient id="accentBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#19a838" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#2dd84e" stop-opacity="0.25"/>
    </linearGradient>

    <!-- QR card shadow -->
    <filter id="qrShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="20"/>
      <feColorMatrix values="0 0 0 0 0.10  0 0 0 0 0.66  0 0 0 0 0.22  0 0 0 0.45 0"/>
    </filter>
  </defs>

  <!-- =========================================================
       LEFT 60% — paper panel
       ========================================================= -->
  <g>
    <rect x="0" y="0" width="${LEFT_W}" height="${H}" fill="#f4efe6"/>
    <rect x="0" y="0" width="${LEFT_W}" height="${H}" fill="url(#paperGreen)"/>
    <rect x="0" y="0" width="${LEFT_W}" height="${H}" fill="url(#paperOchre)"/>
    <rect x="0" y="0" width="${LEFT_W}" height="${H}" filter="url(#noise)" opacity="0.18" style="mix-blend-mode:multiply"/>

    <!-- Brand mark + name (top-left) -->
    <image href="${iconUri}" x="88" y="84" width="64" height="64"/>
    <text x="172" y="116"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="30" font-weight="500" letter-spacing="0.5" fill="#0d0f0c">Favor International</text>
    <text x="172" y="142"
          font-family="Consolas, 'JetBrains Mono', monospace"
          font-size="11" letter-spacing="2.4" font-weight="500" fill="#1a1d18">TRANSFORMING HEARTS TRANSFORM NATIONS</text>

    <!-- Apostolic chip (above headline) -->
    <g transform="translate(88, 360)">
      <rect x="0" y="0" rx="22" ry="22" width="640" height="44" fill="#19a838"/>
      <circle cx="20" cy="22" r="4" fill="#faf6ec"/>
      <text x="34" y="28"
            font-family="Consolas, 'JetBrains Mono', monospace"
            font-size="13" font-weight="600" letter-spacing="2.6" fill="#faf6ec">APOSTOLIC PARTNER · GLOBAL METHODIST CHURCH</text>
    </g>

    <!-- Headline -->
    <text x="88" y="510"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="92" font-weight="400" letter-spacing="-2.3" fill="#0d0f0c">Mobilize your church</text>
    <text x="88" y="610"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="92" font-weight="400" letter-spacing="-2.3" fill="#0d0f0c">to</text>
    <!-- accent highlight bar under "transform nations" -->
    <rect x="178" y="552" width="780" height="62" fill="url(#accentBar)" rx="6" opacity="0.55"/>
    <text x="178" y="610"
          font-family="Georgia, 'Times New Roman', serif"
          font-style="italic" font-size="92" font-weight="300" letter-spacing="-2.3" fill="#19a838">transform nations.</text>

    <!-- Italic lede -->
    <text x="88" y="700"
          font-family="Georgia, 'Times New Roman', serif"
          font-style="italic" font-size="30" font-weight="300" fill="#1a1d18">A movement of 1,400 indigenous missionaries</text>
    <text x="88" y="740"
          font-family="Georgia, 'Times New Roman', serif"
          font-style="italic" font-size="30" font-weight="300" fill="#1a1d18">across 14+ nations of Africa.</text>

    <!-- Signoff (bottom) -->
    <line x1="88" y1="908" x2="${LEFT_W - 88}" y2="908" stroke="#0d0f0c" stroke-opacity="0.18" stroke-width="1"/>
    <text x="88" y="952"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="24" font-weight="600" letter-spacing="-0.3" fill="#0d0f0c">Josh Milliron</text>
    <text x="88" y="980"
          font-family="Consolas, 'JetBrains Mono', monospace"
          font-size="12" letter-spacing="2.4" font-weight="500" fill="#1a1d18">NATIONAL DIRECTOR OF CHURCH ENGAGEMENT · FAVOR INTERNATIONAL</text>
    <text x="88" y="1014"
          font-family="Consolas, 'JetBrains Mono', monospace"
          font-size="15" letter-spacing="0.6" fill="#0d0f0c">josh@favorintl.org  ·  813-345-1005</text>
  </g>

  <!-- =========================================================
       RIGHT 40% — ink panel + QR
       ========================================================= -->
  <g>
    <rect x="${LEFT_W}" y="0" width="${RIGHT_W}" height="${H}" fill="#0d0f0c"/>
    <!-- green glow upper-right -->
    <circle cx="${LEFT_W + RIGHT_W * 0.85}" cy="-50" r="450" fill="url(#inkGlowGreen)"/>
    <!-- terracotta glow lower-left -->
    <circle cx="${LEFT_W + RIGHT_W * 0.1}" cy="${H + 40}" r="380" fill="url(#inkGlowTerracotta)"/>

    <!-- "SCAN TO DISCOVER FAVOR" eyebrow (centered above QR card) -->
    ${(() => {
      const eyebrowCx = LEFT_W + RIGHT_W / 2;
      return `
        <line x1="${eyebrowCx - 180}" y1="295" x2="${eyebrowCx - 144}" y2="295" stroke="#2dd84e" stroke-width="2"/>
        <text x="${eyebrowCx}" y="301" text-anchor="middle"
              font-family="Consolas, 'JetBrains Mono', monospace"
              font-size="14" letter-spacing="3.0" font-weight="600" fill="#faf6ec" fill-opacity="0.78">SCAN TO DISCOVER FAVOR</text>
        <line x1="${eyebrowCx + 144}" y1="295" x2="${eyebrowCx + 180}" y2="295" stroke="#2dd84e" stroke-width="2"/>
      `;
    })()}

    <!-- QR card: cream rounded rect with shadow + glow border -->
    ${(() => {
      const cardSize = 560;
      const cardX = LEFT_W + (RIGHT_W - cardSize) / 2;
      const cardY = 340;
      const qrSize = 480;
      const qrX = cardX + (cardSize - qrSize) / 2;
      const qrY = cardY + (cardSize - qrSize) / 2;
      return `
        <rect x="${cardX}" y="${cardY}" width="${cardSize}" height="${cardSize}" rx="28" ry="28"
              fill="#0d0f0c" filter="url(#qrShadow)" opacity="0.5"/>
        <rect x="${cardX}" y="${cardY}" width="${cardSize}" height="${cardSize}" rx="28" ry="28"
              fill="#faf6ec"/>
        <rect x="${cardX}" y="${cardY}" width="${cardSize}" height="${cardSize}" rx="28" ry="28"
              fill="none" stroke="#2dd84e" stroke-opacity="0.45" stroke-width="2"/>
        <svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" viewBox="${qrViewBox}">
          ${qrInner}
        </svg>
      `;
    })()}

    <!-- "Discover the movement." italic CTA -->
    <text x="${LEFT_W + RIGHT_W / 2}" y="966" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif"
          font-style="italic" font-size="30" font-weight="400" fill="#faf6ec">Discover the movement.</text>

    <!-- URL fallback (most prominent line so people remember the URL) -->
    <text x="${LEFT_W + RIGHT_W / 2}" y="1018" text-anchor="middle"
          font-family="Consolas, 'JetBrains Mono', monospace"
          font-size="20" letter-spacing="3.0" font-weight="600" fill="#2dd84e">AECGMC.FAVORINTL.ORG</text>
  </g>
</svg>`;

// Convert SVG → PNG (1920x1080, sRGB, lossless).
const buf = Buffer.from(SVG);
await fs.mkdir(path.dirname(OUT_PNG), { recursive: true });
await sharp(buf, { density: 96 })
  .png({ compressionLevel: 9 })
  .toFile(OUT_PNG);

const stat = await fs.stat(OUT_PNG);
console.log(`✓ Slide PNG written → ${OUT_PNG}  (${(stat.size / 1024).toFixed(1)} KB)`);
console.log(`✓ Standalone QR SVG → ${OUT_QR}`);
console.log(`  Encoded URL: ${URL}`);
console.log(`  For perfect-font rendering, serve the site and visit /slide in a browser at 1920x1080,`);
console.log(`  then use Chrome DevTools "Capture full size screenshot" for the brand-font version.`);
