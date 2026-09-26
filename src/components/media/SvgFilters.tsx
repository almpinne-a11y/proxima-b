/** Filtres SVG partagés. Duotone --void → --dwarf, appliqué aux photos (retour en couleur au survol). */
export function SvgFilters() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
      <filter id="duotone-dwarf" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.0196 1" />
          <feFuncG type="table" tableValues="0.0118 0.302" />
          <feFuncB type="table" tableValues="0.0392 0.18" />
        </feComponentTransfer>
      </filter>
    </svg>
  )
}
