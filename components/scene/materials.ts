import { MeshStandardMaterial, type Texture } from "three"

/**
 * Matériaux partagés du portable et du téléphone.
 * Les couleurs hexadécimales sont lues « brutes » comme en r128 : la scène tourne avec
 * `legacy` (ColorManagement désactivé), voir Scene.tsx.
 */
/**
 * Compensation du PMREM de r187 sur les métaux (metalness 1) : à environnement identique,
 * ils sortaient plus sombres qu'en r128. Étalonné par capture contre le prototype
 * (pavé tactile 103/103/115, bord de la base 127/127/140). Les autres matériaux gardent
 * les valeurs du prototype, qui correspondent déjà (écart moyen < 5/255 sur l'écran).
 */
const METAL_ENV = { alu: 1.55, pad: 1.8 }

export function createMaterials() {
  const ALU = new MeshStandardMaterial({ color: 0xb9bcc6, metalness: 1, roughness: 0.32, envMapIntensity: METAL_ENV.alu })
  const TITAN = new MeshStandardMaterial({ color: 0x101116, metalness: 1, roughness: 0.28, envMapIntensity: METAL_ENV.alu })
  const BLACK = new MeshStandardMaterial({ color: 0x020203, metalness: 0, roughness: 0.25, envMapIntensity: 0.15 })
  const KEYM = new MeshStandardMaterial({ color: 0x0b0b0e, roughness: 0.5, metalness: 0, envMapIntensity: 0.5 })
  const DARKALU = new MeshStandardMaterial({ color: 0x4a4c55, metalness: 1, roughness: 0.4, envMapIntensity: METAL_ENV.alu })
  const PADM = new MeshStandardMaterial({ color: 0xa4a7b2, metalness: 1, roughness: 0.2, envMapIntensity: METAL_ENV.pad })
  const all = { ALU, TITAN, BLACK, KEYM, DARKALU, PADM }
  return {
    ...all,
    dispose() {
      Object.values(all).forEach((m) => m.dispose())
    },
  }
}

export type Materials = ReturnType<typeof createMaterials>

/** Dalle d'écran : noire, l'image vient de la carte émissive, avec un léger reflet */
export function glass(map: Texture) {
  return new MeshStandardMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveMap: map,
    roughness: 0.12,
    metalness: 0,
    envMapIntensity: 0.06,
  })
}
