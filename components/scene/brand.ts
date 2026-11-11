import { Mesh, MeshStandardMaterial, PlaneGeometry, type Texture } from "three";
import type { HomeFonts } from "@/lib/home-fonts";
import { canvasTexture, mkCanvas } from "./geometry";

/** Canvas du logo et proportions du plan */
const CW = 520;
const CH = 144;
const RATIO = CH / CW;
const LETTERS = ["C", "h", "a", "m", "s", "."] as const;
const PINK = "#ff3d81";
/** Rétroéclairage d'une lettre allumée, une fois le flash retombé */
const GLOW = 0.6;
/**
 * Couleur de la lueur des lettres. Pas de blanc : face à la lumière le capot est déjà presque
 * blanc (~0,8), une lueur blanche par-dessus passe le seuil du halo (luminance 0,82) qui étale
 * les lettres en une pastille illisible. Un violet luit franchement avec une luminance plus basse.
 */
const LIT = "#c86bff";
/** Flou de la lueur autour des lettres (px du canvas, lettres de 84 px) */
const HALO = 12;
/** Flash d'allumage : pic (au-dessus du seuil du halo à 0,82), montée et retombée (s) */
const FLASH = 0.7;
const RISE = 0.08;
const FADE = 0.35;
/**
 * Part de reflet du logo (1 = autant que le métal autour). Face à un panneau lumineux, le
 * capot sature en blanc : si le logo reflétait autant, il s'y fondrait. Moins réfléchissant,
 * il reste plus sombre que l'aluminium et se détache, avec son rétroéclairage par-dessus.
 */
const REFLECT = 0.25;
/** Avancement de l'arrivée (act de la station, 0 → 1) auquel s'allume la lettre i */
const ON = (i: number) => 0.3 + i * 0.1;

/** Lumière d'un exemplaire du logo : sa carte émissive, redessinée lettre par lettre */
interface Glow {
  canvas: HTMLCanvasElement;
  texture: Texture;
  material: MeshStandardMaterial;
  /** Instant où chaque lettre s'est allumée (-1 : éteinte) */
  on: number[];
  levels: number[];
  /** Niveaux arrondis du dernier dessin : on ne redessine que s'ils changent */
  key: string;
}

/** Allume les lettres selon l'arrivée sur la station (act), à appeler à chaque image */
export type BrandLight = (act: number, clock: number, reduce: boolean) => void;

/**
 * Logo « Chams. » métallisé au dos des appareils (capot du portable, téléphone, moniteur,
 * baie) pour qu'ils aient l'air d'une même marque. Plan de `width` unités de large, face vers
 * +z : le tourner pour le poser sur la bonne face. À l'arrivée sur la station, les lettres
 * s'allument l'une après l'autre (`light`), puis restent rétroéclairées.
 * Dessin à refaire une fois les polices chargées (`draw`).
 */
export function brandLogo(width: number, anisotropy = 1) {
  const canvas = mkCanvas(CW, CH);
  const texture = canvasTexture(canvas, anisotropy);
  const geometry = new PlaneGeometry(width, width * RATIO);
  let fonts: HomeFonts | null = null;
  const glows: Glow[] = [];

  /** Abscisse de départ de chaque lettre, « Chams. » centré */
  const layout = (x: CanvasRenderingContext2D) => {
    x.font = `800 84px ${fonts!.display}`;
    x.textBaseline = "middle";
    x.textAlign = "left";
    const x0 = CW / 2 - x.measureText("Chams.").width / 2;
    return LETTERS.map(
      (_, i) => x0 + x.measureText(LETTERS.slice(0, i).join("")).width,
    );
  };

  const paint = (g: Glow) => {
    if (!fonts) return;
    const key = g.levels.map((l) => Math.round(l * 32)).join();
    if (key === g.key) return;
    g.key = key;
    const x = g.canvas.getContext("2d")!;
    // Fond noir opaque, pas transparent : la carte émissive ne lit que le RGB, et sur un fond
    // transparent le navigateur rend aux lettres un RGB plein (l'alpha seul porte le niveau),
    // si bien que chaque lettre allumée émettait à 1 et saturait le halo
    x.globalAlpha = 1;
    x.fillStyle = "#000000";
    x.fillRect(0, 0, CW, CH);
    const X = layout(x);
    // Lueur diffuse autour de chaque lettre (ombre floutée de sa couleur) : effet rétroéclairé
    x.shadowBlur = HALO;
    LETTERS.forEach((ch, i) => {
      x.globalAlpha = g.levels[i];
      x.fillStyle = x.shadowColor = i === LETTERS.length - 1 ? PINK : LIT;
      x.fillText(ch, X[i], 76);
    });
    x.shadowBlur = 0;
    x.globalAlpha = 1;
    g.texture.needsUpdate = true;
  };

  const makeGlow = (): Glow => {
    const c = mkCanvas(CW, CH);
    const t = canvasTexture(c, anisotropy);
    // Teinte grise et poli modéré : en blanc pur et très lisse, le logo reflétait le studio
    // au-dessus du seuil du halo. La lumière vient de la carte émissive (intensité dans le dessin)
    const material = new MeshStandardMaterial({
      map: texture,
      color: 0xa8acb6,
      emissive: 0xffffff,
      emissiveMap: t,
      emissiveIntensity: 1,
      transparent: true,
      metalness: 0.9,
      roughness: 0.35,
      envMapIntensity: REFLECT,
    });
    const g: Glow = {
      canvas: c,
      texture: t,
      material,
      on: LETTERS.map(() => -1),
      levels: LETTERS.map(() => 0),
      key: "",
    };
    glows.push(g);
    return g;
  };

  const control =
    (g: Glow): BrandLight =>
    (act, clock, reduce) => {
      g.levels = LETTERS.map((_, i) => {
        if (act < ON(i)) {
          g.on[i] = -1;
          return 0;
        }
        if (reduce) return GLOW;
        if (g.on[i] < 0) g.on[i] = clock;
        const t = clock - g.on[i];
        return t < RISE
          ? (FLASH * t) / RISE
          : GLOW + (FLASH - GLOW) * Math.exp(-(t - RISE) / FADE);
      });
      paint(g);
    };

  const first = makeGlow();
  const mesh = new Mesh(geometry, first.material);
  mesh.name = "brand";
  mesh.raycast = () => {};

  const draw = (f: HomeFonts) => {
    fonts = f;
    const x = canvas.getContext("2d")!;
    x.clearRect(0, 0, CW, CH);
    const X = layout(x);
    // Le plan est transparent hors des zones opaques de cette image : un léger flou autour
    // des lettres laisse passer la lueur de la carte émissive (sinon coupée net au bord)
    x.shadowBlur = HALO;
    x.shadowColor = "rgba(255,255,255,.5)";
    x.fillStyle = "#ffffff";
    x.fillText("Chams", X[0], 76);
    x.shadowColor = "rgba(255,61,129,.5)";
    x.fillStyle = PINK;
    x.fillText(".", X[LETTERS.length - 1], 76);
    x.shadowBlur = 0;
    texture.needsUpdate = true;
    glows.forEach((g) => {
      g.key = "";
      paint(g);
    });
  };

  /**
   * Donne à une copie du logo (objet cloné) sa propre lumière, pour qu'elle s'allume
   * indépendamment de l'original. Reprend la carte de reflets du matériau d'origine.
   */
  const adopt = (copy: Mesh): BrandLight => {
    const g = makeGlow();
    g.material.envMap = (copy.material as MeshStandardMaterial).envMap;
    copy.material = g.material;
    return control(g);
  };

  const dispose = () => {
    geometry.dispose();
    texture.dispose();
    glows.forEach((g) => {
      g.material.dispose();
      g.texture.dispose();
    });
  };

  return { mesh, draw, light: control(first), adopt, dispose };
}
