/**
 * Installe des composants depuis un registre shadcn, comme `npx shadcn add`,
 * quand le CLI ne peut pas joindre ui.shadcn.com (environnement réseau restreint).
 *
 *   npx tsx scripts/registry-add.ts mp text-effect magnetic …
 *   npx tsx scripts/registry-add.ts url https://…/item.json
 *
 * Motion Primitives : registre officiel motion-primitives.com/c/<nom>.json,
 * avec repli sur les mêmes fichiers du dépôt officiel (raw.githubusercontent.com).
 * Les fichiers sont écrits aux emplacements que choisirait le CLI (alias de components.json).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type RegistryFile = { path: string; content: string; type: string; target?: string }
type RegistryItem = { name: string; dependencies?: string[]; registryDependencies?: string[]; files: RegistryFile[] }

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCES = {
  mp: (name: string) => [
    `https://motion-primitives.com/c/${name}.json`,
    `https://raw.githubusercontent.com/ibelick/motion-primitives/main/public/c/${name}.json`,
  ],
}

async function fetchItem(urls: string[]): Promise<{ item: RegistryItem; url: string }> {
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (res.ok) return { item: (await res.json()) as RegistryItem, url }
    } catch {
      // hôte injoignable : on essaie la source suivante
    }
  }
  throw new Error(`Registre injoignable : ${urls.join(' | ')}`)
}

function targetFor(file: RegistryFile): string {
  if (file.target) return path.join(ROOT, 'src', file.target.replace(/^(src\/)?/, ''))
  const base = path.basename(file.path)
  if (file.type === 'registry:hook') return path.join(ROOT, 'src/hooks', base)
  if (file.type === 'registry:lib') return path.join(ROOT, 'src/lib', base)
  return path.join(ROOT, 'src/components/ui', base)
}

async function main() {
  const [source, ...names] = process.argv.slice(2)
  const overwrite = names.includes('--overwrite')
  const list = names.filter((n) => !n.startsWith('--'))
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  const installed = { ...pkg.dependencies, ...pkg.devDependencies }
  const missing = new Set<string>()

  for (const name of list) {
    const urls = source === 'url' ? [name] : SOURCES[source as keyof typeof SOURCES]?.(name)
    if (!urls) throw new Error(`Source inconnue : ${source}`)
    const { item, url } = await fetchItem(urls)
    for (const file of item.files) {
      const dest = targetFor(file)
      if (existsSync(dest) && !overwrite) {
        console.log(`  = ${path.relative(ROOT, dest)} (déjà présent)`)
        continue
      }
      mkdirSync(path.dirname(dest), { recursive: true })
      writeFileSync(dest, file.content)
      console.log(`  + ${path.relative(ROOT, dest)}`)
    }
    for (const dep of item.dependencies ?? []) if (!installed[dep]) missing.add(dep)
    if (item.registryDependencies?.length) console.log(`  ! dépendances de registre : ${item.registryDependencies.join(', ')}`)
    console.log(`✓ ${item.name}  ←  ${url}`)
  }
  if (missing.size) console.log(`\nÀ installer : npm i ${[...missing].join(' ')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
