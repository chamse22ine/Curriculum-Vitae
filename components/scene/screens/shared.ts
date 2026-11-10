// Utilitaires de dessin du prototype (rr, tx, ease, rng, wrap, hhmm, jersey), portés tels quels.

export type Ctx = CanvasRenderingContext2D

/** Rectangle arrondi, rempli et/ou tracé */
export function rr(x: Ctx, X: number, Y: number, w: number, h: number, r: number, fill?: string | CanvasGradient | null, stroke?: string | null, lw?: number) {
  x.beginPath()
  x.moveTo(X + r, Y)
  x.arcTo(X + w, Y, X + w, Y + h, r)
  x.arcTo(X + w, Y + h, X, Y + h, r)
  x.arcTo(X, Y + h, X, Y, r)
  x.arcTo(X, Y, X + w, Y, r)
  x.closePath()
  if (fill) {
    x.fillStyle = fill
    x.fill()
  }
  if (stroke) {
    x.lineWidth = lw || 1
    x.strokeStyle = stroke
    x.stroke()
  }
}

/** Texte : police, couleur et alignement en une fois */
export function tx(x: Ctx, s: string, X: number, Y: number, font: string, col: string, al: CanvasTextAlign = "left") {
  x.font = font
  x.fillStyle = col
  x.textAlign = al
  x.fillText(s, X, Y)
}

/** smoothstep borné à [0, 1] */
export function ease(v: number) {
  v = v < 0 ? 0 : v > 1 ? 1 : v
  return v * v * (3 - 2 * v)
}

/** Générateur pseudo-aléatoire déterministe (Park–Miller) */
export function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

/** Coupe une phrase en lignes d'au plus w px avec la police courante */
export function wrap(x: Ctx, s: string, w: number) {
  const ls: string[] = []
  let c = ""
  s.split(" ").forEach((q) => {
    const n = c ? `${c} ${q}` : q
    if (x.measureText(n).width > w && c) {
      ls.push(c)
      c = q
    } else c = n
  })
  ls.push(c)
  return ls
}

/** Heure locale « HH:MM » */
export function hhmm() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

/** Maillot personnalisable de la boutique fictive (portable et téléphone) */
export function jersey(x: Ctx, cx: number, cy: number, s: number, col: string, display: string, name?: string, num?: string) {
  x.save()
  x.translate(cx, cy)
  x.scale(s, s)
  x.beginPath()
  x.moveTo(-0.18, -0.5)
  x.lineTo(-0.5, -0.42)
  x.lineTo(-0.74, -0.16)
  x.lineTo(-0.57, -0.02)
  x.lineTo(-0.4, -0.18)
  x.lineTo(-0.4, 0.52)
  x.lineTo(0.4, 0.52)
  x.lineTo(0.4, -0.18)
  x.lineTo(0.57, -0.02)
  x.lineTo(0.74, -0.16)
  x.lineTo(0.5, -0.42)
  x.lineTo(0.18, -0.5)
  x.quadraticCurveTo(0, -0.34, -0.18, -0.5)
  x.closePath()
  x.fillStyle = col
  x.fill()
  const g = x.createLinearGradient(-0.7, 0, 0.7, 0)
  g.addColorStop(0, "rgba(0,0,0,.2)")
  g.addColorStop(0.35, "rgba(255,255,255,.14)")
  g.addColorStop(1, "rgba(0,0,0,.24)")
  x.fillStyle = g
  x.fill()
  x.fillStyle = "rgba(255,255,255,.9)"
  x.fillRect(-0.4, 0.42, 0.8, 0.04)
  x.restore()
  if (num && name) {
    tx(x, name, cx, cy - 0.17 * s, `800 ${s * 0.085}px ${display}`, "#ffffff", "center")
    tx(x, num, cx, cy + 0.22 * s, `800 ${s * 0.3}px ${display}`, "#ffffff", "center")
  }
}

/** Couleurs de la boutique fictive (portable et téléphone) */
export const SWATCHES = ["#00c8f0", "#ff3d81", "#ffb300", "#19c37d"] as const
