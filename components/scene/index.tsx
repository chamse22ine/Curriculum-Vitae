"use client"

import dynamic from "next/dynamic"

/** Scène 3D chargée uniquement côté client (three et R3F hors du rendu serveur) */
export const HomeScene = dynamic(() => import("./Scene"), { ssr: false })
