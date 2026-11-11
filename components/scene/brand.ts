import { Mesh, MeshStandardMaterial, PlaneGeometry } from "three"
import type { HomeFonts } from "@/lib/home-fonts"
import { canvasTexture, mkCanvas } from "./geometry"

/** Proportions du logo (canvas 520×144) */
const RATIO = 144 / 520

/**
 * Logo « Chams. » métallisé, gravé au dos des appareils (capot du portable, téléphone,
 * moniteur, baie) pour qu'ils aient l'air d'une même marque. Plan de `width` unités de large,
 * face vers +z : le tourner pour le poser sur la bonne face. À redessiner une fois les polices
 * chargées (`draw`).
 */
export function brandLogo(width: number, anisotropy = 1) {
  const canvas = mkCanvas(520, 144)
  const texture = canvasTexture(canvas, anisotropy)
  const geometry = new PlaneGeometry(width, width * RATIO)
  const material = new MeshStandardMaterial({ map: texture, transparent: true, metalness: 0.9, roughness: 0.2 })
  const mesh = new Mesh(geometry, material)
  mesh.name = "brand"
  mesh.raycast = () => {}

  const draw = (f: HomeFonts) => {
    const x = canvas.getContext("2d")!
    x.clearRect(0, 0, 520, 144)
    x.font = `800 84px ${f.display}`
    x.textBaseline = "middle"
    x.textAlign = "center"
    const w = x.measureText("Chams.").width
    const w2 = x.measureText(".").width
    x.fillStyle = "#ffffff"
    x.fillText("Chams", 260 - w2 / 2, 76)
    x.fillStyle = "#ff3d81"
    x.fillText(".", 260 + w / 2 - w2 / 2, 76)
    texture.needsUpdate = true
  }

  const dispose = () => {
    geometry.dispose()
    material.dispose()
    texture.dispose()
  }

  return { mesh, draw, dispose }
}
