import { MeshPhysicalMaterial, MeshStandardMaterial, type Object3D, type Texture } from "three"

/**
 * Matériaux partagés des objets, valeurs du prototype.
 * Les couleurs hexadécimales sont lues « brutes » comme en r128 : la scène tourne avec
 * `legacy` (ColorManagement désactivé), voir Scene.tsx.
 */
export function createMaterials() {
  const ALU = new MeshStandardMaterial({ color: 0xd4d7e0, metalness: 1, roughness: 0.32 })
  const TITAN = new MeshStandardMaterial({ color: 0x2a2b33, metalness: 1, roughness: 0.28 })
  const BLACK = new MeshStandardMaterial({ color: 0x020203, metalness: 0, roughness: 0.25, envMapIntensity: 0.15 })
  const KEYM = new MeshStandardMaterial({ color: 0x0b0b0e, roughness: 0.5, metalness: 0, envMapIntensity: 0.5 })
  const DARKALU = new MeshStandardMaterial({ color: 0x4a4c55, metalness: 1, roughness: 0.4 })
  const PADM = new MeshStandardMaterial({ color: 0xa4a7b2, metalness: 1, roughness: 0.2 })
  /** Coques des téléphones : sombres et mates, sinon elles prennent un liseré coloré */
  const PHONEM = new MeshStandardMaterial({ color: 0x0c0c10, metalness: 0.3, roughness: 0.55, envMapIntensity: 0.18 })
  const all = { ALU, TITAN, BLACK, KEYM, DARKALU, PADM, PHONEM }
  return {
    ...all,
    /** Sans environnement de reflets (PMREM en échec) : métal atténué, comme dans le prototype */
    dullMetals() {
      ALU.metalness = 0.3
      TITAN.metalness = 0.3
    },
    dispose() {
      Object.values(all).forEach((m) => m.dispose())
    },
  }
}

export type Materials = ReturnType<typeof createMaterials>

/**
 * Part de reflet de la vitre (1 = verre ordinaire, comme dans le prototype). À 1, sur mobile, le
 * portable qui se balance renvoie par moments le soleil sur toute la dalle : l'écran passe le
 * seuil du halo et devient illisible (le prototype aussi). À 0,15 l'écran reste lisible (mesuré).
 */
const GLASS_SPECULAR = 0.15

/**
 * Dalle d'écran : noire, l'image vient de la carte émissive. Intensité 0,8 (0,52 pour les apps
 * à fond blanc, réglée à chaque dessin) : sous le seuil du halo, l'écran reste lisible.
 * MeshPhysicalMaterial pour régler la part de reflet (specularIntensity).
 */
export function glass(map: Texture) {
  return new MeshPhysicalMaterial({
    specularIntensity: GLASS_SPECULAR,
    color: 0x000000,
    emissive: 0xffffff,
    emissiveMap: map,
    emissiveIntensity: 0.8,
    roughness: 0.4,
    metalness: 0,
    envMapIntensity: 0.05,
  })
}

/**
 * Pose la carte de reflets sur chaque matériau standard d'un objet. Équivaut au
 * scene.environment du prototype : depuis r163, three n'applique material.envMapIntensity
 * qu'aux matériaux qui portent eux-mêmes leur envMap.
 */
export function applyEnv(root: Object3D, env: Texture | null) {
  if (!env) return
  root.traverse((o) => {
    const m = (o as { material?: unknown }).material
    if (m instanceof MeshStandardMaterial && !m.envMap) {
      m.envMap = env
      m.needsUpdate = true
    }
  })
}
