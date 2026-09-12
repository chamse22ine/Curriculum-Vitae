"use client"

import type React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { EASE_ENTREE } from "@/lib/motion"

// Entrée de page : révélée vers le bas en 260 ms
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const reduire = useReducedMotion()

  return (
    <motion.div
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)", transitionEnd: { clipPath: "none" } }}
      transition={reduire ? { duration: 0 } : { duration: 0.26, ease: EASE_ENTREE }}
    >
      {children}
    </motion.div>
  )
}
