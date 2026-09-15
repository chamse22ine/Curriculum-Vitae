"use client"

import { useSyncExternalStore, useCallback } from "react"

const storageEmitter = new EventTarget()

/** État sauvegardé dans localStorage et partagé entre les composants qui lisent la même clé */
export function usePersistedState<T>(key: string, initializer: () => T) {
    const getSnapshot = useCallback(() => localStorage.getItem(key), [key])
    const getServerSnapshot = useCallback(() => null, [])
    const subscribe = useCallback((cb: () => void) => {
        storageEmitter.addEventListener("change", cb)
        return () => storageEmitter.removeEventListener("change", cb)
    }, [])

    const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    const data: T = raw ? JSON.parse(raw) : initializer()

    const setData = useCallback((updater: T | ((prev: T) => T)) => {
        const current = localStorage.getItem(key)
        const prev: T = current ? JSON.parse(current) : initializer()
        const next = typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater
        localStorage.setItem(key, JSON.stringify(next))
        storageEmitter.dispatchEvent(new Event("change"))
    }, [key, initializer])

    return [data, setData] as const
}
