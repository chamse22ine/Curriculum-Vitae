"use client"

import { createContext, useContext } from "react"
import type { ScrollProgress } from "@/hooks/use-scroll-progress"

export interface HomeContextValue {
  /** Index de la section active */
  active: number
  /** Progression instantanée, pour la boucle de rendu de la scène */
  progress: () => ScrollProgress
}

export const HomeContext = createContext<HomeContextValue | null>(null)

export function useHome() {
  const ctx = useContext(HomeContext)
  if (!ctx) throw new Error("useHome doit être utilisé dans <HomeShell>")
  return ctx
}
