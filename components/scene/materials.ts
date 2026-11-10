import { MeshStandardMaterial, type Texture } from "three"

/**
 * Matériaux partagés du portable et du téléphone.
 * Les couleurs hexadécimales sont lues « brutes » comme en r128 : la scène tourne avec
 * `legacy` (ColorManagement désactivé), voir Scene.tsx.
 */
export function createMaterials() {
  const ALU = new MeshStandardMaterial({ color: 0xb9bcc6, metalness: 1, roughness: 0.32 })
  const TITAN = new MeshStandardMaterial({ color: 0x101116, metalness: 1, roughness: 0.28 })
  const BLACK = new MeshStandardMaterial({ color: 0x020203, metalness: 0, roughness: 0.25, envMapIntensity: 0.15 })
  const KEYM = new MeshStandardMaterial({ color: 0x0b0b0e, roughness: 0.5, metalness: 0, envMapIntensity: 0.5 })
  const DARKALU = new MeshStandardMaterial({ color: 0x4a4c55, metalness: 1, roughness: 0.4 })
  const PADM = new MeshStandardMaterial({ color: 0xa4a7b2, metalness: 1, roughness: 0.2 })
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
