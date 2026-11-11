import { CanvasTexture, ExtrudeGeometry, Shape, ShapeGeometry } from "three"

// Helpers géométriques du prototype (rrShape, slab, rplane), portés tels quels.

/** Rectangle à coins arrondis centré sur l'origine */
export function rrShape(w: number, h: number, r: number) {
  const s = new Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** Dalle extrudée à coins arrondis et chanfreinée, centrée en épaisseur */
export function slab(w: number, h: number, t: number, r: number, b = 0.012, cs = 8) {
  const g = new ExtrudeGeometry(rrShape(w, h, r), {
    depth: t,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 3,
    curveSegments: cs,
  })
  g.translate(0, 0, -t / 2)
  return g
}

/** Plan à coins arrondis dont les UV couvrent exactement le rectangle (pour les écrans) */
export function rplane(w: number, h: number, r: number) {
  const g = new ShapeGeometry(rrShape(w, h, r), 8)
  const uv = g.attributes.uv
  const p = g.attributes.position
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h)
  return g
}

export function mkCanvas(w: number, h: number) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  return c
}

/**
 * Texture d'un canvas (texOf du prototype) : anisotropie max, et aucun espace colorimétrique,
 * comme en r128 sans encodage. Une texture marquée sRGB serait décodée en linéaire par le GPU
 * et sortirait plus sombre, puisque la sortie est linéaire (voir Scene.tsx).
 */
export function canvasTexture(c: HTMLCanvasElement, anisotropy = 1) {
  const t = new CanvasTexture(c)
  t.anisotropy = anisotropy
  return t
}
