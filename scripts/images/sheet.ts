/**
 * Planche de la sélection finale (images de src/data/images.ts) avec identifiant, crédit et licence,
 * pour valider les choix avant de les intégrer.
 *
 *   npx tsx scripts/images/sheet.ts   →  .cache/images/selection.jpg
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { IMAGES } from '../../src/data/images'

const ROOT = path.resolve(import.meta.dirname, '../..')
const OUT = path.join(ROOT, '.cache/images/selection.jpg')
const COLS = 4
const TILE_W = 460
const TILE_H = 290
const LABEL_H = 64
const GAP = 12

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

if (!IMAGES.length) {
  console.log('Aucune image dans src/data/images.ts : lancer d’abord npm run images:build.')
  process.exit(0)
}

const rows = Math.ceil(IMAGES.length / COLS)
const width = COLS * (TILE_W + GAP) + GAP
const height = rows * (TILE_H + LABEL_H + GAP) + GAP
const layers: Array<{ input: Buffer; left: number; top: number }> = []

for (const [i, image] of IMAGES.entries()) {
  const left = GAP + (i % COLS) * (TILE_W + GAP)
  const top = GAP + Math.floor(i / COLS) * (TILE_H + LABEL_H + GAP)
  const file = path.join(ROOT, 'public', image.src)
  layers.push({
    input: await sharp(file).resize(TILE_W, TILE_H, { fit: 'cover', position: 'attention' }).toBuffer(),
    left,
    top,
  })
  const label = `<svg width="${TILE_W}" height="${LABEL_H}">
    <rect width="100%" height="100%" fill="#0d0814"/>
    <text x="10" y="22" font-family="DejaVu Sans Mono" font-size="15" fill="#ffb38a">${escape(`${i + 1}. ${image.id}${image.artistImpression ? ' · vue d’artiste' : ''}`)}</text>
    <text x="10" y="44" font-family="DejaVu Sans" font-size="13" fill="#f2ede6">${escape(clip(image.credit, 58))}</text>
    <text x="10" y="60" font-family="DejaVu Sans" font-size="12" fill="#9a948d">${escape(`${image.license} · ${image.category}`)}</text>
  </svg>`
  layers.push({ input: Buffer.from(label), left, top: top + TILE_H })
}

mkdirSync(path.dirname(OUT), { recursive: true })
await sharp({ create: { width, height, channels: 3, background: '#05030a' } })
  .composite(layers)
  .jpeg({ quality: 84 })
  .toFile(OUT)
console.log(`Planche de sélection → ${path.relative(ROOT, OUT)} (${IMAGES.length} images)`)
