export type ImageCategory = 'proxima-b' | 'star' | 'alpha-centauri' | 'space' | 'missions' | 'earth' | 'telescopes'

/** Image optimisée (voir scripts/images/build.ts), avec son crédit et sa licence exacts. */
export type SiteImage = {
  id: string
  category: ImageCategory
  alt: string
  caption: string
  artistImpression: boolean
  focus: string
  width: number
  height: number
  src: string
  srcSetAvif: string
  srcSetWebp: string
  placeholder: string
  credit: string
  license: string
  licenseUrl: string
  sourceUrl: string
  title: string
}
