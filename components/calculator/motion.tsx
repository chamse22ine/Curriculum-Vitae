"use client"

import { Children, useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react"
import { animate, motion, useReducedMotion } from "framer-motion"
import { fmt2 } from "@/lib/format"
import { DUREE, EASE_ENTREE } from "@/lib/motion"

const CARTES_ANIMEES = 6

/** Chiffre interpolé vers sa nouvelle valeur ; onSettled est appelé quand il se fige */
export function AnimatedNumber({ value, className, onSettled }: { value: number | null; className?: string; onSettled?: () => void }) {
    const ref = useRef<HTMLSpanElement>(null)
    const affiche = useRef<number | null>(value)
    const surFige = useRef(onSettled)
    const reduire = useReducedMotion()

    useEffect(() => {
        surFige.current = onSettled
    }, [onSettled])

    useLayoutEffect(() => {
        // On écrit dans le nœud texte géré par React pour ne pas le remplacer
        const texte = ref.current?.firstChild
        if (!texte) return
        const depart = affiche.current

        if (value == null || depart == null || depart === value || reduire) {
            texte.nodeValue = fmt2(value)
            affiche.current = value
            return
        }

        texte.nodeValue = fmt2(depart)
        const controles = animate(depart, value, {
            duration: DUREE.chiffre,
            ease: EASE_ENTREE,
            onUpdate: (v) => {
                texte.nodeValue = fmt2(v)
                affiche.current = v
            },
            onComplete: () => surFige.current?.(),
        })
        return () => controles.stop()
    }, [value, reduire])

    return <span ref={ref} className={className}>{fmt2(value)}</span>
}

/** Cartes d'un semestre qui s'ouvre : 8 px de translation, décalage de 20 ms, six cartes au plus */
export function EntreeCartes({ children, className }: { children: ReactNode; className?: string }) {
    const reduire = useReducedMotion()

    return (
        <div className={className}>
            {Children.map(children, (enfant, i) =>
                i < CARTES_ANIMEES && !reduire ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DUREE.entree, ease: EASE_ENTREE, delay: i * 0.02 }}
                    >
                        {enfant}
                    </motion.div>
                ) : (
                    <div>{enfant}</div>
                )
            )}
        </div>
    )
}

/** Fondu de 320 ms quand la clé change (bascule de session) ; rien au premier affichage */
export function useTransitionCle(ref: RefObject<HTMLElement | null>, cle: unknown) {
    const reduire = useReducedMotion()
    const premier = useRef(true)

    useEffect(() => {
        if (premier.current) {
            premier.current = false
            return
        }
        if (reduire || !ref.current) return
        const controles = animate(ref.current, { opacity: [0, 1], y: [8, 0] }, { duration: DUREE.session, ease: EASE_ENTREE })
        return () => controles.stop()
    }, [cle, reduire, ref])
}
