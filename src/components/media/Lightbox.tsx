import { ExternalLink, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { SiteImage } from '@/data/image-types'
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from '@/components/ui/morphing-dialog'
import { cn } from '@/lib/utils'

type LightboxProps = {
  image: SiteImage
  sizes: string
  className?: string
  imageClassName?: string
  /** Contenu superposé à la vignette (légende, dégradé…). */
  children?: ReactNode
}

/** Vignette qui s'ouvre en grand (MorphingDialog, Motion Primitives), avec légende, crédit et licence. */
export function Lightbox({ image, sizes, className, imageClassName, children }: LightboxProps) {
  return (
    <MorphingDialog transition={{ type: 'spring', bounce: 0.04, duration: 0.55 }}>
      <MorphingDialogTrigger className={cn('group block overflow-hidden', className)} ariaLabel={`Agrandir : ${image.alt}`}>
        <MorphingDialogImage
          src={image.src}
          srcSet={image.srcSetWebp}
          sizes={sizes}
          alt={image.alt}
          className={cn('h-full w-full object-cover', imageClassName)}
          style={{ objectPosition: image.focus }}
        />
        {children}
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-deep">
          <MorphingDialogImage
            src={image.src}
            srcSet={image.srcSetWebp}
            sizes="(min-width: 1024px) 1024px, 100vw"
            alt={image.alt}
            className="max-h-[68dvh] w-full bg-void object-contain"
          />
          <div className="flex flex-col gap-3 p-5 sm:p-6">
            <MorphingDialogTitle className="text-[15px] leading-snug text-text">{image.caption}</MorphingDialogTitle>
            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, y: 8 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: 8 },
              }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <p className="label text-[10px] text-muted">
                Crédit : {image.credit} · {image.license}
              </p>
              <a
                href={image.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="label inline-flex items-center gap-1.5 text-[10px] text-glow underline decoration-glow/40 underline-offset-4 hover:decoration-glow"
              >
                Source Wikimedia Commons
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </MorphingDialogDescription>
          </div>
          <MorphingDialogClose className="right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-void/70 text-text backdrop-blur-md transition-colors hover:text-glow">
            <X className="h-4 w-4" aria-hidden="true" />
          </MorphingDialogClose>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}
