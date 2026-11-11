import { createContext, useContext } from "react"
import { Color, MathUtils, type Group, type Object3D } from "three"
import type { Screen } from "./screens"
import { PALETTES, SECTIONS } from "@/content/sections"

/*
 * Géométrie du monde (prototype : « nine stations on a ring ») :
 * neuf stations sur un anneau de rayon RO, une tous les 40°, à des hauteurs YS ;
 * la caméra circule sur un anneau intérieur de rayon RI et regarde vers l'extérieur.
 */
export const NS = SECTIONS.length
export const RO = 22
export const RI = 14
export const DTH = (2 * Math.PI) / 9
export const YS = [0, 2.4, -1.6, 2.8, -0.4, 2, -2.6, 1.8, -1] as const
/** Réduction des stations sur mobile, pour qu'elles tiennent dans le haut de l'écran */
export const FIT = [0.92, 0.8, 0.74, 0.66, 0.66, 0.86, 0.92, 0.8, 0.92] as const
/** 1 : texte à gauche, scène à droite ; -1 : l'inverse */
export const SIDES = SECTIONS.map((s) => s.side)
export const HALF_FOV_TAN = Math.tan(MathUtils.degToRad(22.5))

/**
 * Amortissement indépendant de la fréquence d'affichage. `rate` est la part du chemin parcourue
 * par image dans le prototype (qui tournait image par image) : à 60 i/s le résultat est identique,
 * à 120 i/s on rend deux fois plus d'images mais le mouvement garde la même durée.
 */
export const damp = (rate: number, dt: number) => 1 - Math.pow(1 - rate, dt * 60)

/** Valeurs d'amortissement du prototype, par image à 60 i/s */
export const RATE = {
  palette: 0.07,
  side: 0.07,
  mouse: 0.06,
  camera: 0.075,
  act: 0.032,
} as const

/**
 * État partagé de la scène, recalculé chaque image par le pilote (Scene.tsx) puis lu par la caméra,
 * les stations et les objets. Un objet mutable plutôt que de l'état React : rien ne re-rend.
 */
export function createSceneState(reduce: boolean) {
  return {
    reduce,
    /** Horloge réelle (s) et temps d'animation (figé à 4 s en mouvement réduit) */
    clock: 0,
    time: 0,
    /** Durée de l'image, plafonnée à 0,1 s pour éviter un saut au retour d'un onglet */
    dt: 0,
    /** Transition en cours : de la station k vers k + 1, avancement t ; F = k + t */
    k: 0,
    t: 0,
    F: 0,
    /** Station active (la plus proche) */
    cur: 0,
    /** Ordinateur (> 820 px) ou mobile */
    wide: true,
    /** Demi-largeur visible à 8 unités de la caméra */
    halfW: 5,
    /** Échelle commune des stations (dépend de la largeur d'écran) */
    sc: 1,
    /** Côté lissé de la scène, de -1 à 1 */
    side: 1,
    /** Souris (-0,5 à 0,5) et sa version lissée, pour la parallaxe */
    mx: 0,
    my: 0,
    smx: 0,
    smy: 0,
    /** Palette lissée : couleurs 1, 2, 3 de la section */
    cA: new Color(PALETTES[0][0]),
    cB: new Color(PALETTES[0][1]),
    cC: new Color(PALETTES[0][2]),
    /** Animation d'arrivée de chaque station (0 à 1) et instant où elle est devenue active */
    act: new Array<number>(NS).fill(0),
    startT: new Array<number>(NS).fill(0),
    /** Groupes des neuf stations, posés par <Stations> */
    stations: new Array<Group | null>(NS).fill(null),
    /** Écrans à redessiner (portables, téléphones, moniteur), enregistrés par chaque objet */
    screens: [] as Screen[],
    /** Objets qu'on peut saisir à la souris ou au doigt */
    grabs: [] as Grab[],
  }
}

/**
 * Objet saisissable (grab() du prototype) : glisser le fait tourner (rx, ry), relâché il revient
 * vers ty au bout de 1,4 s ; un clic appelle `act` (par défaut : un tour complet).
 */
export interface Grab {
  o: Object3D
  rx: number
  ry: number
  ty: number
  hold: number
  /** Instant du dernier clic (animations déclenchées) */
  kick: number
  act?: (hit: Object3D) => void
}

export function grab(o: Object3D, act?: (hit: Object3D) => void): Grab {
  return { o, rx: 0, ry: 0, ty: 0, hold: 0, kick: -9, act }
}

export type SceneState = ReturnType<typeof createSceneState>

export const SceneStateContext = createContext<SceneState | null>(null)

export function useSceneState() {
  const s = useContext(SceneStateContext)
  if (!s) throw new Error("useSceneState doit être utilisé dans la scène")
  return s
}

/*
 * Ordre des calculs dans une image (useFrame, priorités croissantes, toutes ≤ 0 pour laisser
 * R3F faire le rendu ; le bloom prendra la priorité 1) : pilote, caméra, stations, saisies,
 * objets, puis dessin des écrans.
 */
export const FRAME = { driver: -5, camera: -4, stations: -3, grabs: -2, objects: -1, screens: 0 } as const
