// Généré par scripts/images/build.ts à partir de scripts/images/selection.ts — ne pas modifier à la main.
import type { SiteImage } from './image-types'

export const IMAGES: SiteImage[] = []

export const imageById = (id: string) => IMAGES.find((image) => image.id === id)
