"use client"

import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { CalendarDays, ChevronDown, FileUp, Link2, RefreshCw, Trash2 } from "lucide-react"
import { LABEL } from "@/components/heures/bilan-heures"
import { SelecteurCategorie } from "@/components/heures/selecteur-categorie"
import { cn } from "@/lib/utils"
import { CATEGORIES, nouvelId, type Categorie, type Creneau } from "@/lib/heures"
import { appliquerImport, lireIcs, type CalendrierIcs } from "@/lib/ics"

type Source = "fichier" | "lien"
type Retour = { ton: "succes" | "erreur"; texte: string }

const CHAMP = cn(
    "mt-1.5 h-10 w-full rounded-sm border border-hairline bg-surface-sunk px-2.5 text-ui text-ink transition-colors duration-100 ease-out-ui",
    "focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25"
)
const BOUTON_ICONE =
    "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors duration-100 ease-out-ui hover:bg-surface-sunk hover:text-ink disabled:pointer-events-none disabled:opacity-50"
const FORMAT_IMPORT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

const pluriel = (n: number, un: string, plusieurs: string) => `${n} ${n > 1 ? plusieurs : un}`

/** Le navigateur ne peut pas lire un calendrier d'un autre domaine (CORS) : la route /api/ics le récupère */
async function telecharger(lien: string): Promise<string> {
    const reponse = await fetch(`/api/ics?url=${encodeURIComponent(lien)}`)
    if (reponse.ok) return reponse.text()
    const corps: unknown = await reponse.json().catch(() => null)
    const message = corps && typeof corps === "object" && "message" in corps && typeof corps.message === "string" ? corps.message : null
    throw new Error(message ?? `Lien inaccessible (${reponse.status}).`)
}

function nomParDefaut(source: Source, fichier: File | null, lien: string): string {
    if (source === "fichier") return fichier?.name.replace(/\.ics$/i, "") || "Calendrier"
    try {
        return new URL(lien.replace(/^webcal:/i, "https:")).hostname
    } catch {
        return "Calendrier"
    }
}

/** Import d'emplois du temps et d'agendas au format ICS, par fichier ou par lien actualisable */
export function CalendriersIcs({ calendriers, creneaux, pret, onAppliquer }: {
    calendriers: CalendrierIcs[]
    creneaux: Creneau[]
    /** Faux tant que le calendrier n'est pas monté */
    pret: boolean
    onAppliquer: (creneaux: Creneau[], calendriers: CalendrierIcs[]) => void
}) {
    const id = useId()
    const [source, setSource] = useState<Source>("fichier")
    const [fichier, setFichier] = useState<File | null>(null)
    const [lien, setLien] = useState("")
    const [nom, setNom] = useState("")
    const [categorie, setCategorie] = useState<Categorie>("cours")
    const [remplacer, setRemplacer] = useState(true)
    /** « nouveau » ou id du calendrier en cours d'actualisation */
    const [enCours, setEnCours] = useState<string | null>(null)
    const [retour, setRetour] = useState<Retour | null>(null)
    const champFichier = useRef<HTMLInputElement>(null)
    // Un téléchargement peut durer : l'import s'applique aux créneaux du moment où il se termine
    const etat = useRef({ creneaux, calendriers })
    useEffect(() => {
        etat.current = { creneaux, calendriers }
    })

    const appliquer = (texte: string, calendrier: CalendrierIcs, repli: string) => {
        const lecture = lireIcs(texte, calendrier)
        if (lecture.creneaux.length === 0) throw new Error("Aucun événement exploitable dans ce calendrier.")

        const maj: CalendrierIcs = { ...calendrier, nom: calendrier.nom || lecture.nom || repli, importeLe: new Date().toISOString() }
        const { liste, joursRemplaces } = appliquerImport(etat.current.creneaux, lecture.creneaux, maj)
        const connus = etat.current.calendriers
        onAppliquer(liste, connus.some((c) => c.id === maj.id) ? connus.map((c) => (c.id === maj.id ? maj : c)) : [...connus, maj])

        const details = [
            `${pluriel(lecture.creneaux.length, "créneau importé", "créneaux importés")} depuis « ${maj.nom} »`,
            joursRemplaces > 0 && `semaine type retirée sur ${pluriel(joursRemplaces, "jour", "jours")}`,
            lecture.ignores > 0 && `${pluriel(lecture.ignores, "événement ignoré", "événements ignorés")} (récurrence mensuelle ou annuelle)`,
        ]
        setRetour({ ton: "succes", texte: `${details.filter(Boolean).join(" · ")}.` })
    }

    const executer = async (cle: string, action: () => Promise<void>) => {
        setEnCours(cle)
        setRetour(null)
        try {
            await action()
        } catch (e) {
            setRetour({ ton: "erreur", texte: e instanceof Error ? e.message : "Import impossible." })
        } finally {
            setEnCours(null)
        }
    }

    const ajouter = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const lienSaisi = lien.trim()
        void executer("nouveau", async () => {
            let texte: string
            if (source === "fichier") {
                if (!fichier) throw new Error("Choisis un fichier .ics.")
                texte = await fichier.text()
            } else {
                if (!lienSaisi) throw new Error("Colle le lien du calendrier.")
                texte = await telecharger(lienSaisi)
            }
            const calendrier: CalendrierIcs = {
                id: nouvelId(),
                nom: nom.trim(),
                categorie,
                remplacerSemaineType: remplacer,
                importeLe: "",
                ...(source === "lien" ? { url: lienSaisi } : {}),
            }
            appliquer(texte, calendrier, nomParDefaut(source, fichier, lienSaisi))
            setNom("")
            setLien("")
            setFichier(null)
            if (champFichier.current) champFichier.current.value = ""
        })
    }

    const actualiser = (calendrier: CalendrierIcs) => {
        const { url } = calendrier
        if (!url) return
        void executer(calendrier.id, async () => appliquer(await telecharger(url), calendrier, calendrier.nom))
    }

    const retirer = (calendrier: CalendrierIcs) => {
        const nombre = creneaux.filter((c) => c.source === calendrier.id).length
        if (!window.confirm(`Retirer « ${calendrier.nom} » et ses ${pluriel(nombre, "créneau", "créneaux")} ?`)) return
        onAppliquer(
            creneaux.filter((c) => c.source !== calendrier.id),
            calendriers.filter((c) => c.id !== calendrier.id)
        )
        setRetour({ ton: "succes", texte: `« ${calendrier.nom} » retiré. « Remplir les jours vides » peut reposer la semaine type.` })
    }

    const occupe = !pret || enCours !== null

    return (
        <details className="group rounded-lg border border-hairline bg-surface shadow-raise">
            <summary className="flex h-12 cursor-pointer list-none items-center gap-3 rounded-lg px-4 text-ui text-ink-soft transition-colors duration-100 ease-out-ui hover:text-ink [&::-webkit-details-marker]:hidden">
                <CalendarDays className="size-4 shrink-0" aria-hidden />
                <span className="flex-1 whitespace-nowrap">Calendriers ICS</span>
                {calendriers.length > 0 ? (
                    <span className="num truncate text-caption text-ink-muted">{pluriel(calendriers.length, "importé", "importés")}</span>
                ) : (
                    <span className="num hidden truncate text-caption text-ink-muted sm:inline">emploi du temps, agenda</span>
                )}
                <ChevronDown className="size-4 shrink-0 transition-transform duration-100 ease-out-ui group-open:rotate-180" aria-hidden />
            </summary>

            <div className="space-y-4 border-t border-hairline p-4">
                {calendriers.length > 0 && (
                    <ul aria-label="Calendriers importés" className="divide-y divide-hairline overflow-hidden rounded-md border border-hairline">
                        {calendriers.map((c) => (
                            <li key={c.id} className="flex items-center gap-3 py-2 pr-1.5 pl-3">
                                <span className={cn("size-2.5 shrink-0 rounded-full", CATEGORIES[c.categorie].couleur)} aria-hidden />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-ui text-ink">{c.nom}</p>
                                    <p className="num truncate text-caption text-ink-muted">
                                        {CATEGORIES[c.categorie].label} · {pluriel(creneaux.filter((cr) => cr.source === c.id).length, "créneau", "créneaux")} ·{" "}
                                        {c.url ? "lien" : "fichier"} · {FORMAT_IMPORT.format(new Date(c.importeLe))}
                                    </p>
                                </div>
                                {c.url && (
                                    <button type="button" onClick={() => actualiser(c)} disabled={occupe} aria-label={`Actualiser ${c.nom}`} title="Actualiser" className={BOUTON_ICONE}>
                                        <RefreshCw className={cn("size-4", enCours === c.id && "animate-spin")} aria-hidden />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => retirer(c)}
                                    disabled={occupe}
                                    aria-label={`Retirer ${c.nom}`}
                                    title="Retirer"
                                    className={cn(BOUTON_ICONE, "hover:bg-danger-wash hover:text-danger")}
                                >
                                    <Trash2 className="size-4" aria-hidden />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={ajouter} noValidate className="space-y-3">
                    <fieldset>
                        <legend className={LABEL}>Ajouter depuis</legend>
                        <div className="mt-1.5 grid h-10 grid-cols-2 gap-1 rounded-md bg-surface-sunk p-1">
                            {(
                                [
                                    ["fichier", "Un fichier .ics", FileUp],
                                    ["lien", "Un lien", Link2],
                                ] as const
                            ).map(([valeur, label, Icone]) => (
                                <label key={valeur} className="relative">
                                    <input type="radio" name={`${id}-source`} value={valeur} checked={source === valeur} onChange={() => setSource(valeur)} className="peer sr-only" />
                                    <span className="flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-sm text-ui text-ink-muted transition-colors duration-100 ease-out-ui peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-raise peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent hover:text-ink">
                                        <Icone className="size-4" aria-hidden />
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {source === "fichier" ? (
                        <div>
                            <label htmlFor={`${id}-fichier`} className={LABEL}>Fichier</label>
                            <input
                                ref={champFichier}
                                id={`${id}-fichier`}
                                type="file"
                                accept=".ics,text/calendar"
                                onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
                                className={cn(CHAMP, "py-1 file:mr-3 file:h-full file:cursor-pointer file:rounded-sm file:border-0 file:bg-surface file:px-3 file:text-ui file:text-ink")}
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor={`${id}-lien`} className={LABEL}>Lien du calendrier</label>
                            <input
                                id={`${id}-lien`}
                                type="url"
                                inputMode="url"
                                autoComplete="off"
                                placeholder="https://… ou webcal://…"
                                value={lien}
                                onChange={(e) => setLien(e.target.value)}
                                aria-describedby={`${id}-lien-aide`}
                                className={cn(CHAMP, "num")}
                            />
                            <p id={`${id}-lien-aide`} className="mt-1.5 text-caption text-ink-muted">
                                Lien d&apos;export ou d&apos;abonnement (ADE, Google Agenda, Outlook) : il pourra être actualisé.
                            </p>
                        </div>
                    )}

                    <div>
                        <label htmlFor={`${id}-nom`} className={LABEL}>
                            Nom <span className="normal-case tracking-normal">(facultatif)</span>
                        </label>
                        <input id={`${id}-nom`} autoComplete="off" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Emploi du temps M1" className={CHAMP} />
                    </div>

                    <SelecteurCategorie legende="Catégorie" valeur={categorie} onChange={setCategorie} />

                    <label className="flex items-start gap-2.5 text-ui text-ink-soft">
                        <input type="checkbox" checked={remplacer} onChange={(e) => setRemplacer(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-primary" />
                        <span>Remplacer la semaine type les jours où ce calendrier a des créneaux</span>
                    </label>

                    <button
                        type="submit"
                        disabled={occupe}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-ui font-medium text-on-primary transition-colors duration-100 ease-out-ui hover:bg-primary-hover disabled:opacity-60"
                    >
                        {enCours === "nouveau" ? "Import en cours…" : "Importer"}
                    </button>

                    {retour && (
                        <p role={retour.ton === "erreur" ? "alert" : "status"} className={cn("text-ui", retour.ton === "erreur" ? "text-danger" : "text-success")}>
                            {retour.texte}
                        </p>
                    )}
                </form>
            </div>
        </details>
    )
}
