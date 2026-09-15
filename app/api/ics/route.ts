import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { NextRequest, NextResponse } from "next/server"

/*
 * Récupère un calendrier ICS pour le navigateur, qui ne peut pas lire un autre domaine (CORS).
 * La route ne doit pas servir de rebond vers le réseau du serveur : adresses internes refusées,
 * redirections suivies à la main et revérifiées, taille et durée bornées.
 */

const TAILLE_MAX = 5 * 1024 * 1024
const DELAI_MS = 10_000
const REDIRECTIONS_MAX = 3

class ErreurIcs extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

function estInterne(adresse: string): boolean {
    if (isIP(adresse) === 6) {
        const ip = adresse.toLowerCase()
        if (ip.startsWith("::ffff:")) return estInterne(ip.slice(7))
        return ip === "::" || ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")
    }
    const [a, b] = adresse.split(".").map(Number)
    return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168)
    )
}

async function verifier(lien: string): Promise<URL> {
    let url: URL
    try {
        url = new URL(lien.trim().replace(/^webcal:/i, "https:"))
    } catch {
        throw new ErreurIcs("Lien invalide.", 400)
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new ErreurIcs("Seuls les liens http, https et webcal sont acceptés.", 400)

    const hote = url.hostname.replace(/^\[|\]$/g, "")
    const adresses = isIP(hote) ? [{ address: hote }] : await lookup(hote, { all: true }).catch(() => [])
    if (adresses.length === 0) throw new ErreurIcs("Serveur du calendrier introuvable.", 502)
    if (adresses.some(({ address }) => estInterne(address))) throw new ErreurIcs("Ce lien pointe vers une adresse non autorisée.", 400)
    return url
}

const recuperer = (url: URL) =>
    fetch(url, {
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(DELAI_MS),
        headers: { accept: "text/calendar, text/plain;q=0.9, */*;q=0.8" },
    })

async function lireTexte(reponse: Response): Promise<string> {
    if (Number(reponse.headers.get("content-length") ?? 0) > TAILLE_MAX) throw new ErreurIcs("Calendrier trop volumineux (5 Mo maximum).", 413)
    const lecteur = reponse.body?.getReader()
    if (!lecteur) return ""

    const morceaux: Uint8Array[] = []
    let taille = 0
    for (;;) {
        const { done, value } = await lecteur.read()
        if (done) break
        taille += value.byteLength
        if (taille > TAILLE_MAX) {
            await lecteur.cancel()
            throw new ErreurIcs("Calendrier trop volumineux (5 Mo maximum).", 413)
        }
        morceaux.push(value)
    }
    return new TextDecoder().decode(Buffer.concat(morceaux))
}

const erreur = (message: string, status: number) => NextResponse.json({ message }, { status })

export async function GET(req: NextRequest) {
    const lien = req.nextUrl.searchParams.get("url")
    if (!lien) return erreur("Lien du calendrier manquant.", 400)

    try {
        let url = await verifier(lien)
        let reponse = await recuperer(url)
        for (let redirections = 0; reponse.status >= 300 && reponse.status < 400; redirections++) {
            const cible = reponse.headers.get("location")
            if (!cible || redirections === REDIRECTIONS_MAX) throw new ErreurIcs("Le lien redirige trop de fois.", 502)
            url = await verifier(new URL(cible, url).toString())
            reponse = await recuperer(url)
        }

        if (!reponse.ok) throw new ErreurIcs(`Le serveur du calendrier a répondu ${reponse.status}.`, 502)
        const texte = await lireTexte(reponse)
        if (!texte.includes("BEGIN:VCALENDAR")) throw new ErreurIcs("Ce lien ne renvoie pas un calendrier ICS.", 422)

        return new NextResponse(texte, { headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "no-store" } })
    } catch (e) {
        if (e instanceof ErreurIcs) return erreur(e.message, e.status)
        if (e instanceof Error && e.name === "TimeoutError") return erreur("Le serveur du calendrier ne répond pas.", 504)
        return erreur("Lien inaccessible.", 502)
    }
}
