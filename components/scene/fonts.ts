import type { HomeFonts } from "@/lib/home-fonts"

let ready: Promise<void> | null = null

/**
 * Résout quand toutes les graisses utilisées par les dessins canvas sont chargées.
 * Les familles viennent de next/font (noms hachés) : rien n'est écrit en dur.
 */
export function sceneFontsReady(f: HomeFonts): Promise<void> {
  if (!ready) {
    const specs = [
      `800 20px ${f.display}`,
      `600 20px ${f.display}`,
      `400 16px ${f.mono}`,
      `500 16px ${f.mono}`,
      `400 16px ${f.sans}`,
      `500 16px ${f.sans}`,
      `600 16px ${f.sans}`,
    ]
    ready = Promise.all(specs.map((s) => document.fonts.load(s).catch(() => []))).then(() => undefined)
  }
  return ready
}
