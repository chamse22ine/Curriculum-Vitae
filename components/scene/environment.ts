import {
  BackSide,
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  PlaneGeometry,
  Scene,
  type Texture,
  type WebGLRenderer,
} from "three"

/** Intensité du panneau lumineux au-dessus des objets (voir plus bas) */
const TOP_SOFTBOX = 1.5

/**
 * Environnement de reflets généré à la volée (pas de fichier HDR) : un studio sombre,
 * des softbox blanches et deux panneaux colorés, filtrés par PMREMGenerator.
 */
export function buildStudioEnvironment(gl: WebGLRenderer): Texture {
  const es = new Scene()
  const pm = new PMREMGenerator(gl)
  const disposables: { dispose(): void }[] = []

  const roomGeo = new BoxGeometry(20, 20, 20)
  const roomMat = new MeshBasicMaterial({ color: 0x15151d, side: BackSide })
  disposables.push(roomGeo, roomMat)
  es.add(new Mesh(roomGeo, roomMat))

  // Intensités > 1 voulues : ce sont des sources lumineuses dans une cible HDR
  const panel = (r: number, g: number, b: number, w: number, h: number, x: number, y: number, z: number) => {
    const geo = new PlaneGeometry(w, h)
    const mat = new MeshBasicMaterial({ color: new Color(r, g, b), side: DoubleSide })
    disposables.push(geo, mat)
    const m = new Mesh(geo, mat)
    m.position.set(x, y, z)
    m.lookAt(0, 0, 0)
    es.add(m)
  }
  // Softbox du haut : 1,5 au lieu de 7 dans le prototype. À 7, le portable incliné vers soi
  // reflète ce panneau en plein et l'aluminium sature en blanc (le prototype aussi) ; à 1,5 la vue
  // normale ne change pas (luminosité mesurée 37 contre 39) et le métal garde son éclat incliné.
  panel(TOP_SOFTBOX, TOP_SOFTBOX, TOP_SOFTBOX, 8, 5, 0, 9, 2)
  panel(5, 1, 2.5, 5, 8, -9, 1, 2)
  panel(0.8, 3, 5, 5, 8, 9, 1, -1)
  panel(3, 3, 3, 10, 4, 0, 2, 9)
  panel(4, 2.5, 0.5, 6, 3, 0, -2, -9)

  try {
    return pm.fromScene(es, 0.03).texture
  } finally {
    pm.dispose()
    disposables.forEach((d) => d.dispose())
  }
}
