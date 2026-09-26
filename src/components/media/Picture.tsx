import { useEffect, useRef, useState } from 'react'
import type { SiteImage } from '@/data/image-types'
import { cn } from '@/lib/utils'

type PictureProps = {
  image: SiteImage
  /** Attribut sizes (largeur affichée), pour que le navigateur choisisse la bonne variante. */
  sizes: string
  className?: string
  imgClassName?: string
  /** Image au-dessus de la ligne de flottaison : chargement prioritaire. */
  priority?: boolean
}

/** Image optimisée : AVIF puis WebP, srcset 640/1280/2560, dimensions fixes, placeholder flouté. */
export function Picture({ image, sizes, className, imgClassName, priority = false }: PictureProps) {
  const img = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (img.current?.complete) setLoaded(true)
  }, [])

  return (
    <picture
      className={cn('relative block overflow-hidden bg-deep', className)}
      style={{
        backgroundImage: loaded ? undefined : `url(${image.placeholder})`,
        backgroundSize: 'cover',
        backgroundPosition: image.focus,
      }}
    >
      <source type="image/avif" srcSet={image.srcSetAvif} sizes={sizes} />
      <source type="image/webp" srcSet={image.srcSetWebp} sizes={sizes} />
      <img
        ref={img}
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn('h-full w-full object-cover transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0', imgClassName)}
        style={{ objectPosition: image.focus }}
      />
    </picture>
  )
}
