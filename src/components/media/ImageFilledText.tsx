import { motion, useScroll, useTransform } from 'motion/react'
import { useMemo, useRef, type ElementType } from 'react'
import type { SiteImage } from '@/data/image-types'
import { useReducedMotion } from '@/lib/store'
import { cn } from '@/lib/utils'

type ImageFilledTextProps = {
  image: SiteImage
  children: string
  as?: ElementType
  className?: string
}

/** Texte rempli d'image (background-clip: text), l'image glissant en parallaxe dans les lettres. */
export function ImageFilledText({ image, children, as = 'span', className }: ImageFilledTextProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const position = useTransform(scrollYProgress, [0, 1], ['50% 20%', '50% 80%'])
  const MotionTag = useMemo(() => motion.create(as as 'span'), [as])

  return (
    <MotionTag
      ref={ref}
      aria-label={children}
      className={cn('inline-block bg-clip-text text-transparent [-webkit-background-clip:text]', className)}
      style={{
        backgroundImage: `url(${image.src})`,
        backgroundSize: 'cover',
        backgroundPosition: reduced ? '50% 50%' : position,
      }}
    >
      {children}
    </MotionTag>
  )
}
