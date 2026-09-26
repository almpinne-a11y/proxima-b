import type { SiteImage } from '@/data/image-types'
import { cn } from '@/lib/utils'
import { Picture } from './Picture'

/** Photo en duotone --void/--dwarf qui repasse en couleur au survol (le parent porte la classe `group`). */
export function DuotoneImage({ image, sizes, className }: { image: SiteImage; sizes: string; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Picture image={image} sizes={sizes} className="absolute inset-0 h-full w-full" imgClassName="[filter:url(#duotone-dwarf)]" />
      <Picture
        image={image}
        sizes={sizes}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </div>
  )
}
