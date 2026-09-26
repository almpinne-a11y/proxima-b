/**
 * Étape 1 — découverte : parcourt des catégories Wikimedia Commons ciblées,
 * garde les fichiers sous licence libre et assez grands, et produit :
 *   .cache/images/candidates.json   (métadonnées complètes, licence et crédit)
 *   .cache/images/contact-<n>.jpg   (planches contact numérotées, pour la sélection)
 *
 *   npx tsx scripts/images/discover.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { categoryFiles, download, isUsable, type CommonsFile } from './commons'
import { CATEGORIES } from './sources'

const CACHE = path.resolve(import.meta.dirname, '../../.cache/images')
mkdirSync(CACHE, { recursive: true })

type Candidate = CommonsFile & { index: number; category: string; source: string }

const candidates: Candidate[] = []
const seen = new Set<string>()
for (const [category, sources] of Object.entries(CATEGORIES)) {
  for (const source of sources) {
    try {
      const files = await categoryFiles(source)
      const usable = files.filter((f) => isUsable(f) && !seen.has(f.title))
      for (const file of usable) {
        seen.add(file.title)
        candidates.push({ ...file, index: candidates.length + 1, category, source })
      }
      console.log(`${category.padEnd(15)} ${source.padEnd(40)} ${files.length} fichiers, ${usable.length} retenus`)
    } catch (error) {
      console.log(`${category.padEnd(15)} ${source.padEnd(40)} indisponible (${(error as Error).message})`)
    }
  }
}
writeFileSync(path.join(CACHE, 'candidates.json'), JSON.stringify(candidates, null, 2))
console.log(`\n${candidates.length} candidats → .cache/images/candidates.json`)

// Planches contact : 6 × 5 vignettes numérotées par planche.
const COLS = 6
const ROWS = 5
const CELL_W = 300
const CELL_H = 220

async function tile(candidate: Candidate, position: number) {
  const left = (position % COLS) * CELL_W
  const top = Math.floor(position / COLS) * CELL_H
  let input: Buffer
  try {
    input = await sharp(await download(candidate.thumbUrl)).resize(CELL_W - 8, CELL_H - 34, { fit: 'cover' }).jpeg().toBuffer()
  } catch {
    input = await sharp({ create: { width: CELL_W - 8, height: CELL_H - 34, channels: 3, background: '#222' } }).jpeg().toBuffer()
  }
  const label = Buffer.from(
    `<svg width="${CELL_W - 8}" height="30"><rect width="100%" height="100%" fill="#111"/><text x="6" y="20" font-family="monospace" font-size="15" fill="#ffb38a">#${candidate.index} ${candidate.category} · ${candidate.width}px</text></svg>`,
  )
  return [
    { input, left: left + 4, top: top + 4 },
    { input: label, left: left + 4, top: top + CELL_H - 30 },
  ]
}

for (let sheet = 0; sheet * COLS * ROWS < candidates.length; sheet++) {
  const page = candidates.slice(sheet * COLS * ROWS, (sheet + 1) * COLS * ROWS)
  // Vignettes téléchargées une par une (limites de débit de Wikimedia).
  const tiles = []
  for (const [i, candidate] of page.entries()) tiles.push(...(await tile(candidate, i)))
  const file = path.join(CACHE, `contact-${sheet + 1}.jpg`)
  await sharp({ create: { width: COLS * CELL_W, height: ROWS * CELL_H, channels: 3, background: '#05030a' } })
    .composite(tiles)
    .jpeg({ quality: 82 })
    .toFile(file)
  console.log(`Planche → ${path.relative(process.cwd(), file)}`)
}
