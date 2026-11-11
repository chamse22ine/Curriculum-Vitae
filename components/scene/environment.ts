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

/**
 * Intensité maximale d'un panneau lumineux (canal le plus fort). La sortie n'a pas de tone
 * mapping : un reflet au-dessus de 1 sature en blanc, et le halo s'allume dès 0,82. Les
 * panneaux du prototype montaient à 7 : en tournant, un objet métallique en reflétait un en
 * plein et disparaissait dans le blanc. Plafonnés ici, chaque panneau garde sa teinte.
 */
const PEAK = 1.1

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

  // Panneau lumineux : teinte du prototype, canal le plus fort ramené à PEAK
  const panel = (r: number, g: number, b: number, w: number, h: number, x: number, y: number, z: number) => {
    const geo = new PlaneGeometry(w, h)
    const k = Math.min(1, PEAK / Math.max(r, g, b))
    const mat = new MeshBasicMaterial({ color: new Color(r * k, g * k, b * k), side: DoubleSide })
    disposables.push(geo, mat)
    const m = new Mesh(geo, mat)
    m.position.set(x, y, z)
    m.lookAt(0, 0, 0)
    es.add(m)
  }
  // Valeurs du prototype, plafonnées à PEAK par panel()
  panel(7, 7, 7, 8, 5, 0, 9, 2)
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
