/**
 * Generates the placeholder product artwork in public/mangoes/.
 *
 * These are hand-drawn SVGs so the shop looks finished with zero external
 * image hosting. Replace any file with a real photo (keep the filename, or
 * point the product's imageUrl at a URL) whenever you have one.
 *
 *   node scripts/generate-images.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'mangoes')

/** [backdrop, skin light, skin dark, blush, stem] */
const palettes = {
  gold: ['#fff3d6', '#ffd166', '#ef8b16', '#e2571f', '#a7551a'],
  amber: ['#fdecd2', '#ffc14d', '#e07208', '#c33d12', '#96430e'],
  crimson: ['#ffe9db', '#ffb05c', '#e0521c', '#b8261b', '#8c3316'],
  saffron: ['#fff0cb', '#ffd24a', '#f09400', '#d9531a', '#a35b12'],
  lime: ['#eaf7e2', '#cfe87f', '#79ab2c', '#4a7d1c', '#4d6b22'],
  emerald: ['#e3f5e8', '#a3da85', '#3f9440', '#256d2e', '#2f5c2a'],
  honey: ['#fff6e0', '#ffdd82', '#f2a413', '#cf6b12', '#9c5c17'],
}

// Fruit is drawn inside a local 220 x 176 box.
const BODY =
  'M30 96C28 56 62 30 106 32C140 34 166 48 186 74C200 92 196 112 176 122C140 142 70 148 44 126C32 116 30 106 30 96Z'
const SHEEN =
  'M52 74C62 52 84 40 112 39C90 48 70 62 60 82C54 94 44 90 52 74Z'
const LEAF = 'M100 30C94 12 104 -4 128 -8C133 10 122 26 100 30Z'

function fruit(palette, { x = 0, y = 0, scale = 1, tilt = -18, id = 'a' } = {}) {
  const [, light, dark, blush, stem] = palettes[palette]
  return `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse cx="112" cy="150" rx="82" ry="13" fill="#2b231d" opacity="0.10"/>
    <g transform="rotate(${tilt} 110 88)">
      <path d="${BODY}" fill="url(#skin-${id})"/>
      <path d="${BODY}" fill="url(#blush-${id})"/>
      <path d="${SHEEN}" fill="#ffffff" opacity="0.45"/>
      <path d="M100 34C99 26 99 20 101 14" stroke="${stem}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="${LEAF}" fill="url(#leaf-${id})"/>
      <path d="M104 26C110 16 118 8 128 2" stroke="#12421f" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.45"/>
    </g>
    <defs>
      <linearGradient id="skin-${id}" x1="40" y1="34" x2="188" y2="140" gradientUnits="userSpaceOnUse">
        <stop stop-color="${light}"/>
        <stop offset="1" stop-color="${dark}"/>
      </linearGradient>
      <radialGradient id="blush-${id}" cx="0" cy="0" r="1" gradientTransform="translate(178 108) rotate(163) scale(120 96)" gradientUnits="userSpaceOnUse">
        <stop stop-color="${blush}" stop-opacity="0.8"/>
        <stop offset="1" stop-color="${blush}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="leaf-${id}" x1="100" y1="30" x2="130" y2="-8" gradientUnits="userSpaceOnUse">
        <stop stop-color="#4ab86a"/>
        <stop offset="1" stop-color="#156230"/>
      </linearGradient>
    </defs>
  </g>`
}

function card(palette, body) {
  const [backdrop] = palettes[palette]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img">
  <rect width="400" height="300" fill="url(#bg)"/>
  <circle cx="338" cy="48" r="88" fill="#ffffff" opacity="0.38"/>
  <circle cx="44" cy="272" r="72" fill="#ffffff" opacity="0.26"/>
  ${body}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
      <stop stop-color="${backdrop}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
</svg>
`
}

const single = (palette) => card(palette, fruit(palette, { x: 90, y: 72, scale: 1, id: 'm' }))

const pair = (palette) =>
  card(
    palette,
    fruit(palette, { x: 20, y: 120, scale: 0.68, tilt: -8, id: 'p1' }) +
      fruit(palette, { x: 122, y: 58, scale: 0.95, tilt: -22, id: 'p2' }),
  )

const trio = (palette) =>
  card(
    palette,
    fruit(palette, { x: 2, y: 128, scale: 0.58, tilt: -6, id: 't1' }) +
      fruit(palette, { x: 214, y: 122, scale: 0.62, tilt: -28, id: 't3' }) +
      fruit(palette, { x: 92, y: 56, scale: 0.92, tilt: -18, id: 't2' }),
  )

const files = {
  // Products
  'karutha-colomban': single('crimson'),
  willard: single('gold'),
  'tom-ejc': single('amber'),
  'malwana-special': pair('crimson'),
  vellaikolumban: single('honey'),
  'alphonso-ratnagiri': single('saffron'),
  kesar: pair('saffron'),
  'nam-dok-mai': single('honey'),
  ataulfo: single('gold'),
  'juice-grade-mixed': trio('amber'),
  'gira-amba-pulp': trio('gold'),
  'bulk-pulp-crate-10kg': trio('honey'),
  'green-ambalavi': single('lime'),
  'raw-betti-amba': trio('emerald'),
  'curry-cut-mango': pair('lime'),
  'classic-gift-box-6': trio('crimson'),
  'grand-tasting-box-12': trio('saffron'),
  'corporate-box-24': trio('amber'),
  // Categories
  'cat-premium-local': pair('crimson'),
  'cat-imported-exotic': pair('saffron'),
  'cat-juice-and-pulp': trio('amber'),
  'cat-raw-and-pickling': pair('emerald'),
  'cat-gift-boxes': trio('gold'),
  // Fallback used when a product has no image
  placeholder: single('gold'),
}

await mkdir(outDir, { recursive: true })
await Promise.all(
  Object.entries(files).map(([name, svg]) => writeFile(join(outDir, `${name}.svg`), svg, 'utf8')),
)
console.log(`Wrote ${Object.keys(files).length} SVGs to public/mangoes/`)
