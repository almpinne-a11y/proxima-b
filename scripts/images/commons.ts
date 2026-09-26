/**
 * Accès à l'API de Wikimedia Commons : métadonnées, licence et crédit exacts de chaque fichier.
 * Les URL viennent de l'API (imageinfo + extmetadata) ; les vignettes de repli sont dérivées de l'URL
 * canonique de l'original selon le schéma documenté de Wikimedia (…/thumb/…/<largeur>px-<nom>).
 */

export const USER_AGENT = 'ProximaBSite/0.1 (https://github.com/almpinne-a11y/proxima-b)'
const API = 'https://commons.wikimedia.org/w/api.php'

/** Licences acceptées : libres, réutilisables avec crédit. */
const ALLOWED_LICENSE = /^(cc[ -]by(-sa)?[ -][0-9.]+|cc0|public domain|pd\b|pd-)/i

export type CommonsFile = {
  title: string
  pageUrl: string
  width: number
  height: number
  mime: string
  /** Rendu redimensionné par Commons (ou l'original s'il est plus petit). */
  downloadUrl: string
  /** Fichier original. */
  originalUrl: string
  thumbUrl: string
  license: string
  licenseUrl: string
  credit: string
  artist: string
  description: string
  restrictions: string
}

type ImageInfo = {
  url: string
  descriptionurl: string
  thumburl?: string
  width: number
  height: number
  mime: string
  extmetadata?: Record<string, { value: string } | undefined>
}

type QueryPage = { title: string; missing?: boolean; imageinfo?: ImageInfo[] }

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
let lastRequest = 0

/**
 * Requête polie envers Wikimedia : au moins 1,2 s entre deux appels, et nouvel essai
 * (délai Retry-After, sinon attente exponentielle) sur 429 « trop de requêtes » ou erreur serveur.
 */
async function politeFetch(url: string, timeout: number, attempts = 7) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const wait = lastRequest + 1200 - Date.now()
    if (wait > 0) await sleep(wait)
    lastRequest = Date.now()
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(timeout) })
    if (res.status !== 429 && res.status < 500) return res
    const retryAfter = Number(res.headers.get('retry-after'))
    // Attente plafonnée à 30 s : sur les gros originaux, Wikimedia peut demander plusieurs minutes.
    await sleep(Math.min(30000, retryAfter > 0 ? retryAfter * 1000 : 3000 * 2 ** attempt))
  }
  throw new Error(`Wikimedia refuse encore après plusieurs essais : ${new URL(url).hostname}`)
}

async function api(params: Record<string, string>) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`
  const res = await politeFetch(url, 30000)
  if (!res.ok) throw new Error(`Commons a répondu ${res.status}`)
  return (await res.json()) as { query?: { pages?: QueryPage[] }; continue?: Record<string, string> }
}

const IMAGEINFO = {
  prop: 'imageinfo',
  iiprop: 'url|size|mime|extmetadata',
  iiurlwidth: '2560',
  iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Credit|ImageDescription|Restrictions',
}

function toFile(page: QueryPage): CommonsFile | null {
  const info = page.imageinfo?.[0]
  if (!info) return null
  const meta = info.extmetadata ?? {}
  const value = (key: string) => meta[key]?.value ?? ''
  const downloadUrl = info.thumburl && info.width > 2560 ? info.thumburl : info.url
  return {
    title: page.title,
    pageUrl: info.descriptionurl,
    width: info.width,
    height: info.height,
    mime: info.mime,
    downloadUrl,
    originalUrl: info.url,
    // Wikimedia n'accepte que des largeurs de vignette standard (330, 500, 960…).
    thumbUrl: info.thumburl ? info.thumburl.replace(/\/\d+px-/, '/330px-') : info.url,
    license: stripHtml(value('LicenseShortName')),
    licenseUrl: stripHtml(value('LicenseUrl')),
    credit: stripHtml(value('Credit')),
    artist: stripHtml(value('Artist')),
    description: stripHtml(value('ImageDescription')).slice(0, 400),
    restrictions: stripHtml(value('Restrictions')),
  }
}

/** Le fichier est-il utilisable (licence libre, format image, taille suffisante, sans restriction) ? */
export function isUsable(file: CommonsFile, minWidth = 1400) {
  return (
    ALLOWED_LICENSE.test(file.license) &&
    /^image\/(jpeg|png|webp)$/.test(file.mime) &&
    file.width >= minWidth &&
    !/trademark|insignia|personality/i.test(file.restrictions)
  )
}

/** Fichiers d'une catégorie Commons (membres directs). */
export async function categoryFiles(category: string, limit = 60): Promise<CommonsFile[]> {
  const data = await api({
    action: 'query',
    generator: 'categorymembers',
    gcmtitle: `Category:${category}`,
    gcmtype: 'file',
    gcmlimit: String(limit),
    ...IMAGEINFO,
  })
  return (data.query?.pages ?? []).map(toFile).filter((f): f is CommonsFile => f !== null)
}

/** Métadonnées de fichiers précis (titres « File:… »). Les titres absents sont signalés. */
export async function filesByTitle(titles: string[]): Promise<{ files: CommonsFile[]; missing: string[] }> {
  const files: CommonsFile[] = []
  const missing: string[] = []
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40)
    const data = await api({ action: 'query', titles: batch.join('|'), ...IMAGEINFO })
    for (const page of data.query?.pages ?? []) {
      const file = page.missing ? null : toFile(page)
      if (file) files.push(file)
      else missing.push(page.title)
    }
  }
  return { files, missing }
}

export async function download(url: string, attempts = 7) {
  const res = await politeFetch(url, 120000, attempts)
  if (!res.ok) throw new Error(`Téléchargement ${res.status} : ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Vignette standard (largeurs autorisées : 330, 500, 960, 1280, 1920, 3840…) servie par thumb.wikimedia.org. */
export function thumbFor(originalUrl: string, width: number) {
  const parts = new URL(originalUrl).pathname.split('/') // /wikipedia/commons/a/ab/Nom.jpg
  const name = parts[parts.length - 1]
  parts.splice(3, 0, 'thumb')
  return `https://thumb.wikimedia.org${parts.join('/')}/${width}px-${name}`
}

/**
 * Télécharge la meilleure version disponible : vignette haute définition, puis 1920 et 1280 px,
 * puis l'original en dernier recours (upload.wikimedia.org limite fortement les originaux volumineux).
 */
export async function downloadBest(file: CommonsFile) {
  // Vignettes de thumb.wikimedia.org d'abord (pas de limite stricte), l'original en dernier.
  const scaled = new URL(file.downloadUrl).hostname === 'thumb.wikimedia.org' ? [file.downloadUrl] : []
  const urls = [
    ...scaled,
    ...[1920, 1280].filter((w) => file.width > w).map((w) => thumbFor(file.originalUrl, w)),
    file.originalUrl,
  ]
  for (const url of urls) {
    try {
      return await download(url, 2)
    } catch {
      // version suivante
    }
  }
  throw new Error(`aucune version téléchargeable pour ${file.title}`)
}
