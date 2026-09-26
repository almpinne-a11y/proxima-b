/**
 * Contrôle d'une page : erreurs console, layout shift (CLS), captures desktop et mobile.
 *   npx tsx scripts/check.ts [url] [dossier]
 * Chromium est celui de l'environnement (/opt/pw-browsers), WebGL via SwiftShader.
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { chromium, type Page } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:5173/'
const outDir = path.resolve(process.argv[3] ?? 'test-results')
mkdirSync(outDir, { recursive: true })

type Shot = { name: string; at: (page: Page) => Promise<number> }

const vh = (page: Page) => page.evaluate(() => window.innerHeight)
const top = (page: Page, id: string) =>
  page.evaluate((i) => document.getElementById(i)!.getBoundingClientRect().top + window.scrollY, id)

const SHOTS: Shot[] = [
  { name: '1-hero', at: async () => 0 },
  { name: '2-approche', at: async (p) => (await vh(p)) * 0.55 },
  { name: '3-distance-entre', at: async (p) => (await top(p, 'distance')) - (await vh(p)) * 0.45 },
  { name: '4-distance-compteur', at: async (p) => (await top(p, 'distance')) + (await vh(p)) * 1.5 * 0.4 },
  { name: '5-distance-morph', at: async (p) => (await top(p, 'distance')) + (await vh(p)) * 1.5 * 0.9 },
  { name: '6-a-venir', at: async (p) => (await top(p, 'a-venir')) + (await vh(p)) * 0.1 },
]

async function run(label: string, options: Parameters<typeof chromium.launch>[0], context: Parameters<import('playwright').Browser['newContext']>[0]) {
  const browser = await chromium.launch(options)
  const page = await (await browser.newContext(context)).newPage()
  const messages: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') messages.push(`[${msg.type()}] ${msg.text()}`)
  })
  page.on('pageerror', (err) => messages.push(`[pageerror] ${err.message}`))
  // Script injecté sous forme de texte : tsx ajouterait sinon des helpers absents du navigateur.
  await page.addInitScript({
    content: `
      window.__cls = 0;
      window.__shifts = [];
      function describe(node) {
        if (!(node instanceof Element)) return node ? node.nodeName : '?';
        var text = (node.textContent || '').trim().slice(0, 40);
        return node.tagName.toLowerCase() + (node.id ? '#' + node.id : '') + '.' + Array.prototype.slice.call(node.classList, 0, 3).join('.') + ' « ' + text + ' »';
      }
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry.hadRecentInput) return;
          window.__cls += entry.value;
          if (entry.value > 0.001) window.__shifts.push(entry.value.toFixed(4) + ' ← ' + (entry.sources || []).map(function (s) { return describe(s.node); }).join(' | '));
        });
      }).observe({ type: 'layout-shift', buffered: true });
    `,
  })
  const t0 = Date.now()
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForFunction(() => !document.querySelector('[role="status"]'), undefined, { timeout: 240000, polling: 1000 })
  const loaderMs = Date.now() - t0
  const webgl = await page.evaluate(() => (document.querySelector('canvas') ? 'webgl' : 'fallback-css'))
  await page.waitForTimeout(2500)
  for (const shot of SHOTS) {
    const y = await shot.at(page)
    await page.evaluate((target) => window.scrollTo(0, target), y)
    await page.waitForTimeout(2600)
    await page.screenshot({ path: path.join(outDir, `${label}-${shot.name}.png`) })
  }
  const { cls, shifts } = await page.evaluate(() => {
    const w = window as unknown as { __cls: number; __shifts: string[] }
    return { cls: w.__cls, shifts: w.__shifts }
  })
  console.log(`\n== ${label} : loader ${loaderMs} ms · rendu ${webgl} · CLS ${cls.toFixed(4)}`)
  if (shifts.length) console.log('Décalages :\n  ' + shifts.join('\n  '))
  console.log(messages.length ? messages.join('\n') : 'Console : aucune erreur ni avertissement')
  await browser.close()
}

const launch = {
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
}

await run('desktop', launch, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
if (!process.env.DESKTOP_ONLY) {
  await run('mobile', launch, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
}
