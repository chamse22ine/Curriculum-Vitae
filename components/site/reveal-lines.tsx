"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { EASE_ENTREE } from "@/lib/motion"

/** Lignes de titre révélées par masque, 6 px de flou qui se résorbent, décalage de 90 ms */
export function RevealLines({ lines }: { lines: { text: string; className?: string }[] }) {
    const reduire = useReducedMotion()

    return (
        <>
            {lines.map((line, i) => (
                <motion.span
                    key={line.text}
                    className={cn("block pb-[0.08em]", line.className)}
                    initial={{ clipPath: "inset(0 0 100% 0)", filter: "blur(6px)" }}
                    animate={{ clipPath: "inset(0 0 0% 0)", filter: "blur(0px)", transitionEnd: { clipPath: "none", filter: "none" } }}
                    transition={reduire ? { duration: 0 } : { duration: 0.6, ease: EASE_ENTREE, delay: i * 0.09 }}
                >
                    {line.text}
                </motion.span>
            ))}
        </>
    )
}
