"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
    Calendar,
    Editor,
    Willow,
    getEditorItems,
    registerEditorItem,
    type CalendarEvent,
    type CalendarInstanceApi,
    type EventContentMode,
} from "@svar-ui/react-calendar"
import { Locale } from "@svar-ui/react-core"
import { fr } from "@svar-ui/calendar-locales"
import { fr as frCore } from "@svar-ui/core-locales"
import { cn } from "@/lib/utils"
import { CATEGORIES, ORDRE_CATEGORIES, deuxChiffres, estCategorie, fmtHeures, nouvelId, type Categorie, type Creneau } from "@/lib/heures"
import "@svar-ui/react-calendar/all.css"
import "./calendrier.css"

export type VueCalendrier = "day" | "week" | "month"

const MOTS = { ...frCore, ...fr }

// 7 h – 21 h en lignes d'une heure assez basses pour tenir une journée entière à l'écran
const GRILLE_HORAIRE = { yScale: { startHour: 7, endHour: 21, ui: { minUnitHeight: 48 } }, ui: { nowLine: true } }
const VUES = [
    { id: "day", sections: { timeGrid: GRILLE_HORAIRE } },
    { id: "week", sections: { timeGrid: GRILLE_HORAIRE } },
    "month",
]

/** Catégorie dans l'éditeur SVAR, avec les mêmes pastilles que le sélecteur de la page */
function ChoixCategorie({ value, onChange, readonly }: { value?: string; onChange: (ev: { value: Categorie }) => void; readonly?: boolean }) {
    return (
        <div role="radiogroup" aria-label="Catégorie" className="grid grid-cols-3 gap-1 rounded-md bg-surface-sunk p-1">
            {ORDRE_CATEGORIES.map((c) => {
                const actif = value === c
                return (
                    <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={actif}
                        disabled={readonly}
                        onClick={() => onChange({ value: c })}
                        className={cn(
                            "flex h-9 items-center justify-center gap-1.5 rounded-sm text-ui transition-colors duration-100 ease-out-ui",
                            actif ? "bg-surface text-ink shadow-raise" : "text-ink-muted hover:text-ink"
                        )}
                    >
                        <span className={cn("size-2.5 shrink-0 rounded-full", CATEGORIES[c].couleur)} aria-hidden />
                        {CATEGORIES[c].label}
                    </button>
                )
            })}
        </div>
    )
}

// L'éditeur n'enregistre que text, textarea, checkbox, readonly et section
registerEditorItem("categorie", ChoixCategorie)

const ITEMS_EDITEUR = [
    { comp: "categorie", key: "categorie", label: "Catégorie" },
    ...getEditorItems()
        .filter((item) => item.key !== "text")
        .map((item) => (item.key === "schedule" ? { ...item, validationMessage: "La fin doit être après le début" } : item)),
    { comp: "text", key: "text", label: "Note (facultative)" },
]

const categorieDe = (event: CalendarEvent): Categorie => (estCategorie(event.categorie) ? event.categorie : "entreprise")

export const versCreneau = (event: CalendarEvent): Creneau => ({
    id: event.id,
    categorie: categorieDe(event),
    start: event.start,
    end: event.end,
    allDay: event.allDay || undefined,
    text: typeof event.text === "string" && event.text.trim() ? event.text.trim() : undefined,
    source: typeof event.source === "string" ? event.source : undefined,
})

const classeCreneau = ({ event }: { event: CalendarEvent }) => `hr-${categorieDe(event)}`

const horaire = (d: Date) => `${d.getHours()}h${d.getMinutes() ? deuxChiffres(d.getMinutes()) : ""}`

/** Catégorie en tête, puis horaire et durée : un créneau se lit sans ouvrir l'éditeur */
function ContenuCreneau({ event, mode }: { event: CalendarEvent; mode: EventContentMode }) {
    const { label } = CATEGORIES[categorieDe(event)]
    const duree = event.allDay ? "journée" : fmtHeures((event.end.getTime() - event.start.getTime()) / 3_600_000)

    if (mode === "boxes") {
        return (
            <div className="flex h-full min-w-0 flex-col gap-0.5 leading-tight">
                <span className="truncate font-semibold">{label}</span>
                <span className="num truncate text-[11px] text-ink-soft">
                    {horaire(event.start)}–{horaire(event.end)} · {duree}
                </span>
                {event.text && <span className="truncate text-[11px] text-ink-soft">{event.text}</span>}
            </div>
        )
    }
    return (
        <span className="flex min-w-0 items-center gap-1.5 px-1.5 text-[11px] leading-tight">
            <span className="truncate font-semibold">{label}</span>
            <span className="num shrink-0 text-ink-soft">{duree}</span>
        </span>
    )
}

/**
 * Calendrier SVAR (jour, semaine, mois) : glisser dans la grille crée un créneau de la catégorie choisie,
 * cliquer ouvre l'éditeur. Monté côté client uniquement, il ne lit ses props initiales qu'une fois.
 */
export function CalendrierHeures({ creneauxInitiaux, dateInitiale, vueInitiale, categorie, onChange, onNavigate, preparer, onApi }: {
    creneauxInitiaux: Creneau[]
    dateInitiale: Date
    vueInitiale: VueCalendrier
    /** Catégorie donnée aux nouveaux créneaux */
    categorie: Categorie
    onChange: (creneaux: Creneau[]) => void
    onNavigate: (date: Date, vue: VueCalendrier) => void
    /** Créneaux à ajouter pour la plage affichée (mois encore jamais ouverts) */
    preparer: (debut: Date, fin: Date) => Creneau[]
    onApi?: (api: CalendarInstanceApi) => void
}) {
    const [api, setApi] = useState<CalendarInstanceApi | null>(null)
    // Lus au moment de l'action : changer de catégorie ne réinitialise pas le calendrier
    const rappels = useRef({ categorie, onChange, onNavigate, preparer })
    useEffect(() => {
        rappels.current = { categorie, onChange, onNavigate, preparer }
    })

    const init = useCallback(
        (instance: CalendarInstanceApi) => {
            setApi(instance)
            onApi?.(instance)

            // Le bus ne restreint pas le type selon le nom de l'action. Sans id fourni, SVAR poserait un « temp:// »
            instance.intercept("add-event", (action) => {
                const ajout = action as { event: Partial<CalendarEvent> }
                ajout.event = { ...ajout.event, id: ajout.event.id ?? nouvelId(), categorie: ajout.event.categorie ?? rappels.current.categorie }
            })

            // Un créneau de la semaine type retouché devient un créneau à soi : un import ICS ne l'effacera plus
            const detacher = (action: unknown) => {
                const maj = action as { id: string | number; event: Partial<CalendarEvent> }
                if (instance.getEvent(maj.id)?.source === "type") maj.event = { ...maj.event, source: undefined }
            }
            instance.intercept("update-event", detacher)
            instance.intercept("move-event", detacher)

            const synchroniser = () => rappels.current.onChange(instance.getEvents().map(versCreneau))
            instance.on("add-event", synchroniser)
            instance.on("update-event", synchroniser)
            // Glisser ou redimensionner passe par move-event, qui ne relaie pas update-event
            instance.on("move-event", synchroniser)
            instance.on("delete-event", synchroniser)
            // Semaine type ou jours complétés : provide-data remplace par id, rejouer ne duplique rien
            instance.on("provide-data", synchroniser)

            const naviguer = () => {
                const { currentDate, currentView, visibleDateRange } = instance.getState()
                rappels.current.onNavigate(currentDate, currentView as VueCalendrier)
                const nouveaux = rappels.current.preparer(visibleDateRange.start, visibleDateRange.end)
                if (nouveaux.length > 0) instance.exec("provide-data", { data: { events: nouveaux as CalendarEvent[] } })
            }
            instance.on("navigate-to", naviguer)
            instance.on("navigate-time", naviguer)

            // Plage de départ (une semaine peut déborder sur le mois voisin), puis premier enregistrement
            naviguer()
            synchroniser()
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- init n'est appelé qu'au montage
        []
    )

    return (
        <Locale words={MOTS}>
            {/* Police d'icônes seule : fonts={false} évite de charger Open Sans et Roboto, que la DA n'utilise pas */}
            <link rel="stylesheet" href="https://cdn.svar.dev/fonts/wxi/wx-icons.css" precedence="default" />
            <Willow fonts={false}>
                <Calendar
                    events={creneauxInitiaux}
                    date={dateInitiale}
                    view={vueInitiale}
                    views={VUES}
                    eventCss={classeCreneau}
                    eventContent={ContenuCreneau}
                    init={init}
                />
                {api && <Editor api={api} items={ITEMS_EDITEUR} placement="modal" />}
            </Willow>
        </Locale>
    )
}
