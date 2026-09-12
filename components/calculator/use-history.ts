"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const LIMITE = 50
const REGROUPEMENT_MS = 1000

/** Historique d'annulation : les frappes successives dans un même champ comptent pour une seule action */
export function useHistory<T>(value: T, setValue: (next: T) => void) {
    const passe = useRef<{ etat: T; cle?: string; date: number }[]>([])
    const [taille, setTaille] = useState(0)

    const commit = useCallback((next: T, cle?: string) => {
        const derniere = passe.current.at(-1)
        const maintenant = Date.now()
        if (cle && derniere?.cle === cle && maintenant - derniere.date < REGROUPEMENT_MS) {
            derniere.date = maintenant
        } else {
            passe.current.push({ etat: value, cle, date: maintenant })
            if (passe.current.length > LIMITE) passe.current.shift()
        }
        setValue(next)
        setTaille(passe.current.length)
    }, [value, setValue])

    const undo = useCallback(() => {
        const derniere = passe.current.pop()
        if (!derniere) return
        setValue(derniere.etat)
        setTaille(passe.current.length)
    }, [setValue])

    return { commit, undo, canUndo: taille > 0 }
}

/** Ctrl+Z (Cmd+Z sur Mac) annule la dernière action du calculateur */
export function useUndoShortcut(undo: () => void) {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
                e.preventDefault()
                undo()
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [undo])
}
