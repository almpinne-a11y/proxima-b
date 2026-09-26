import { IMAGES } from '@/data/images'

/** Crédits et licences de toutes les images, générés depuis src/data/images.ts. */
export function ImageCredits() {
  if (!IMAGES.length) return null
  return (
    <details className="group w-full">
      <summary className="label cursor-pointer list-none text-[10px] text-muted transition-colors hover:text-text">
        Crédits des images ({IMAGES.length}) <span className="inline-block transition-transform group-open:rotate-45">+</span>
      </summary>
      <ul className="mt-4 grid gap-x-8 gap-y-2 text-[12px] leading-snug text-muted sm:grid-cols-2">
        {IMAGES.map((image) => (
          <li key={image.id}>
            <a href={image.sourceUrl} target="_blank" rel="noreferrer" className="text-text/80 underline decoration-line underline-offset-4 hover:text-glow">
              {image.caption}
            </a>{' '}
            — {image.credit}, {image.license}
          </li>
        ))}
      </ul>
    </details>
  )
}
