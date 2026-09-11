/**
 * Generates the PWA raster icons from the same bridge mark the app draws
 * inline as SVG, so the installed icon and the in-app logo never drift apart.
 *
 *   node scripts/generate-icons.mjs
 *
 * Written with only Node's built-in zlib rather than an image library: the
 * project deliberately carries no dependency that is not needed at runtime.
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', 'public', 'icons');

const NAVY = [22, 37, 92, 255];
const TEAL = [55, 194, 184, 255];
const DECK = [246, 248, 252, 255];
const AMBER = [245, 166, 35, 255];

/* ---- Geometry, in the 48x48 space the SVG logo uses ------------------ */

const apexY = 14.5;
const baseY = 31;
const halfSpan = 16;
const centreX = 24;

/** The arch: a parabola through (8,31), (24,14.5) and (40,31). */
function archY(x) {
  const normalised = (x - centreX) / halfSpan;
  return baseY - (baseY - apexY) * (1 - normalised * normalised);
}

function archSlope(x) {
  return (2 * (baseY - apexY) * (x - centreX)) / (halfSpan * halfSpan);
}

function insideRoundedRect(x, y, size, radius) {
  if (x < 0 || y < 0 || x > size || y > size) return false;
  const cx = Math.min(Math.max(x, radius), size - radius);
  const cy = Math.min(Math.max(y, radius), size - radius);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function onSegment(x, y, x0, y0, x1, y1, halfWidth) {
  const vx = x1 - x0;
  const vy = y1 - y0;
  const lengthSquared = vx * vx + vy * vy;
  const t = lengthSquared === 0 ? 0 : Math.min(1, Math.max(0, ((x - x0) * vx + (y - y0) * vy) / lengthSquared));
  const dx = x - (x0 + t * vx);
  const dy = y - (y0 + t * vy);
  return dx * dx + dy * dy <= halfWidth * halfWidth;
}

/** Colour of the logo at a point in 48x48 space, or null for transparent. */
function sample(x, y, { bleed }) {
  const background = bleed ? x >= 0 && y >= 0 && x <= 48 && y <= 48 : insideRoundedRect(x, y, 48, 12);
  if (!background) return null;

  // Amber circle at the top of the arch.
  if ((x - centreX) ** 2 + (y - 14) ** 2 <= 3.4 * 3.4) return AMBER;

  // Deck.
  if (onSegment(x, y, 8, baseY, 40, baseY, 1.6)) return DECK;

  // Pylons.
  const pylons = [
    [16, 25.8],
    [24, 22.6],
    [32, 25.8],
  ];
  for (const [px, top] of pylons) {
    if (onSegment(x, y, px, baseY, px, top, 1.1)) return TEAL;
  }

  // Arch: perpendicular distance to the parabola.
  if (x >= 8 && x <= 40) {
    const slope = archSlope(x);
    const distance = Math.abs(y - archY(x)) / Math.sqrt(1 + slope * slope);
    if (distance <= 1.6) return TEAL;
  }

  return NAVY;
}

/* ---- Rasteriser ------------------------------------------------------- */

function render(size, { bleed = false, contentScale = 1 } = {}) {
  const pixels = Buffer.alloc(size * size * 4);
  const samplesPerAxis = 4;
  const offset = (48 * (1 - contentScale)) / 2;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < samplesPerAxis; sy += 1) {
        for (let sx = 0; sx < samplesPerAxis; sx += 1) {
          const fx = ((px + (sx + 0.5) / samplesPerAxis) / size) * 48;
          const fy = ((py + (sy + 0.5) / samplesPerAxis) / size) * 48;
          // Map the drawing into the safe zone for maskable icons.
          const cx = (fx - offset) / contentScale;
          const cy = (fy - offset) / contentScale;

          let colour = null;
          if (bleed) {
            // Full-bleed navy field, with the mark drawn inside the safe zone.
            colour = sample(cx, cy, { bleed: false }) ?? NAVY;
          } else {
            colour = sample(fx, fy, { bleed: false });
          }
          if (colour) {
            r += colour[0];
            g += colour[1];
            b += colour[2];
            a += colour[3];
          }
        }
      }

      const total = samplesPerAxis * samplesPerAxis;
      const index = (py * size + px) * 4;
      pixels[index] = Math.round(r / total);
      pixels[index + 1] = Math.round(g / total);
      pixels[index + 2] = Math.round(b / total);
      pixels[index + 3] = Math.round(a / total);
    }
  }
  return pixels;
}

/* ---- Minimal PNG encoder ---------------------------------------------- */

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(pixels, size) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // colour type: RGBA
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  // One filter byte (0 = none) per scanline.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---- Output ------------------------------------------------------------ */

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="SaathiSetu">
  <rect width="48" height="48" rx="12" fill="#16255c"/>
  <path d="M8 31c5.5-11 10.8-16.5 16-16.5S34.5 20 40 31" fill="none" stroke="#37c2b8" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M8 31h32" fill="none" stroke="#f6f8fc" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M16 31v-5.2M24 31v-8.4M32 31v-5.2" fill="none" stroke="#37c2b8" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <circle cx="24" cy="14" r="3.4" fill="#f5a623"/>
</svg>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'icon.svg'), SVG, 'utf8');

for (const size of [192, 512]) {
  writeFileSync(join(OUT_DIR, `icon-${size}.png`), encodePng(render(size), size));
}
writeFileSync(
  join(OUT_DIR, 'icon-maskable-512.png'),
  encodePng(render(512, { bleed: true, contentScale: 0.68 }), 512),
);

console.log(`Icons written to ${OUT_DIR}`);
