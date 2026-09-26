import { useSite } from './store'

const FACES = [
  '700 1em "Unbounded Variable"',
  '400 1em "Unbounded Variable"',
  'italic 400 1em "Instrument Serif"',
  '400 1em "Instrument Serif"',
  '500 1em "JetBrains Mono Variable"',
]

/** Charge les polices et reporte la progression au loader. */
export function loadFonts() {
  if (!('fonts' in document)) {
    useSite.getState().setLoading('fonts', 1)
    return
  }
  let done = 0
  for (const face of FACES) {
    document.fonts
      .load(face, 'Proxima b é α')
      .catch(() => undefined)
      .finally(() => {
        done += 1
        useSite.getState().setLoading('fonts', done / FACES.length)
      })
  }
}
