/**
 * Étape 2 — téléchargement et optimisation des images sélectionnées (selection.ts) :
 *   - métadonnées relues sur Commons (licence libre vérifiée, crédit exact, page source) ;
 *   - AVIF + WebP en 640, 1280 et 2560 px (jamais d'agrandissement) ;
 *   - placeholder flouté en base64 ;
 *   - génération de src/data/images.ts.
 *
 *   npx tsx scripts/images/build.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { download, filesByTitle, isUsable } from './commons'
import { SELECTION } from './selection'

const ROOT = path.resolve(import.meta.dirname, '../..')
const ORIGINALS = path.join(ROOT, '.cache/images/originals')
const PUBLIC = path.join(ROOT, 'public/images')
const WIDTHS = [640, 1280, 2560]
mkdirSync(ORIGINALS, { recursive: true })

const { files, missing } = await filesByTitle(SELECTION.map((s) => s.commons))
if (missing.length) console.log(`Introuvables sur Commons (ignorés) :\n  ${missing.join('\n  ')}`)
const byTitle = new Map(files.map((f) => [f.title.replace(/_/g, ' '), f]))

const entries: string[] = []
for (const item of SELECTION) {
  const file = byTitle.get(item.commons.replace(/_/g, ' '))
  if (!file) continue
  if (!isUsable(file, 640)) {
    console.log(`✗ ${item.id} : licence ou format refusé (${file.license}, ${file.mime})`)
    continue
  }
  const original = path.join(ORIGINALS, `${item.id}${path.extname(new URL(file.downloadUrl).pathname) || '.jpg'}`)
  if (!existsSync(original)) writeFileSync(original, await download(file.downloadUrl))
  const input = readFileSync(original)
  const meta = await sharp(input).rotate().metadata()
  const width = meta.autoOrient?.width ?? meta.width ?? 0
  const height = meta.autoOrient?.height ?? meta.height ?? 0
  const widths = WIDTHS.filter((w) => w <= width)
  if (!widths.length) widths.push(width)

  const dir = path.join(PUBLIC, item.category)
  mkdirSync(dir, { recursive: true })
  for (const w of widths) {
    const base = sharp(input).rotate().resize({ width: w, withoutEnlargement: true })
    await base.clone().avif({ quality: 50, effort: 4 }).toFile(path.join(dir, `${item.id}-${w}.avif`))
    await base.clone().webp({ quality: 76 }).toFile(path.join(dir, `${item.id}-${w}.webp`))
  }
  const blur = await sharp(input).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer()
  const url = (w: number, ext: string) => `images/${item.category}/${item.id}-${w}.${ext}`
  const largest = widths[widths.length - 1]
  const medium = widths.includes(1280) ? 1280 : largest
  entries.push(
    JSON.stringify(
      {
        id: item.id,
        category: item.category,
        alt: item.alt,
        caption: item.artistImpression ? `Vue d'artiste. ${item.caption}` : item.caption,
        artistImpression: Boolean(item.artistImpression),
        focus: item.focus ?? 'center',
        width: largest,
        height: Math.round((height / width) * largest),
        src: url(medium, 'webp'),
        srcSetAvif: widths.map((w) => `${url(w, 'avif')} ${w}w`).join(', '),
        srcSetWebp: widths.map((w) => `${url(w, 'webp')} ${w}w`).join(', '),
        placeholder: `data:image/webp;base64,${blur.toString('base64')}`,
        credit: file.artist || file.credit || 'Wikimedia Commons',
        license: file.license,
        licenseUrl: file.licenseUrl,
        sourceUrl: file.pageUrl,
        title: file.title,
      },
      null,
      2,
    ),
  )
  console.log(`✓ ${item.id.padEnd(28)} ${width}×${height}  ${file.license}  ${file.artist || file.credit}`)
}

writeFileSync(
  path.join(ROOT, 'src/data/images.ts'),
  `// Généré par scripts/images/build.ts à partir de scripts/images/selection.ts — ne pas modifier à la main.
import type { SiteImage } from './image-types'

export const IMAGES: SiteImage[] = [${entries.length ? `\n${entries.join(',\n')},\n` : ''}]

export const imageById = (id: string) => IMAGES.find((image) => image.id === id)
`,
)
console.log(`\n${entries.length} images → src/data/images.ts`)
